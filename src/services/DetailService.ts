import axios from "axios";
import * as cheerio from "cheerio";

import getFakeClient from "@/handlers/getFakeClient";
import appErrors, { isError } from "@/handlers/appErrors";
import extractNumbers from "@/utils/extractNumbers";
import _ from "lodash";

const DELAY = 1; // Ritardo prima di effettuare una richiesta

/**
 * Tipo che rappresenta i dettagli di un anime.
 */
type Anime = {
    details: {
        title: string | null;
        type: string | null;
        episodes: number | null;
        season: string | null;
        year: {
            start: number | null;
            end: number | null;
        };
    };
    tags: Array<{
        id: string;
        name: string;
    }>;
    image: {
        src: string | null;
    };
    description: string | null;
};

export default class DetailService {
    private readonly delay: number;

    constructor(delay: number = DELAY) {
        this.delay = delay;
    }

    /**
     * Helper per estrarre e normalizzare il testo.
     */
    private getText(element: cheerio.Cheerio<any>, selector: string): string | null {
        return element.find(selector).text().trim() || null;
    }

    /**
     * Estrae la descrizione dall'HTML.
     */
    private extractDescription($: cheerio.CheerioAPI): string | null {
        return $(".g_bubble.g_section.desc[itemprop='description']").html()?.trim() || null;
    }

    /**
     * Analizza e restituisce il tipo di contenuto e il numero di episodi.
     */
    private extractType(input: string): { type: string | null; episodes: number | null } {
        const typeRegex = /^(.*?)(?=,|$)/;
        const episodesRegex = /(\d+|\bunknown\b) episodes?/i;

        const type = input.match(typeRegex)?.[0]?.trim() || null;
        const episodesMatch = input.match(episodesRegex);

        const episodes = episodesMatch
            ? episodesMatch[1].toLowerCase() === "unknown"
                ? null
                : parseInt(episodesMatch[1], 10)
            : 1;

        return { type, episodes };
    }

    /**
     * Estrae solo l'anno (ultimi numeri) da una stringa.
     * Se l'anno contiene punti interrogativi, restituisce `null`.
     */
    private extractYear(element: cheerio.Cheerio<any>): { start: number | null; end: number | null } {
        const valueCell = element.find("td.value");

        // Helper per prendere gli ultimi numeri e verificare se contengono un punto interrogativo
        const extractValidYear = (dateString: string | null): number | null => {
            if (!dateString) return null; // Se la stringa è nulla, restituisci null
            const yearMatch = dateString.match(/(\d{4}|\?{4})$/); // Cerca solo gli ultimi 4 numeri o "????"
            if (!yearMatch) return null; // Nessun match, restituisci null
            return yearMatch[0].includes("?") ? null : parseInt(yearMatch[0]); // Se contiene "?", restituisci null
        };

        // Estrai il valore grezzo da startDate e endDate
        const startDateRaw = this.getText(valueCell, "span[itemprop='startDate'], span[itemprop='datePublished']");
        const endDateRaw = this.getText(valueCell, "span[itemprop='endDate']");

        // Applica l'helper per validare l'anno
        const startYear = extractValidYear(startDateRaw);
        const endYear = extractValidYear(endDateRaw);

        return { start: startYear, end: endYear };
    }

    /**
     * Estrae la stagione da una stringa.
     * @param input - La stringa contenente stagione e anno.
     * @returns La stagione estratta o `null` se non valida.
     */
    private extractSeason(input: string): string | null {
        // Espressione regolare per identificare le stagioni valide
        const seasonRegex = /^(Winter|Spring|Summer|Autumn)/i;

        // Esegui il match sulla stringa
        const match = input.match(seasonRegex);

        // Restituisci la stagione se trovata, altrimenti `null`
        return match ? _.toUpper(match[0]) : null;
    }

    /**
     * Estrae i dettagli principali di un anime.
     */
    private extractDetails($: cheerio.CheerioAPI): Anime["details"] {
        const details: Anime["details"] = {
            title: null,
            type: null,
            episodes: null,
            season: null,
            year: {
                start: null,
                end: null,
            },
        };

        const fieldMap: Record<string, (element: cheerio.Cheerio<any>) => void> = {
            "Main Title": (element) => {
                details.title = this.getText(element, "td span") || null;
            },
            Type: (element) => {
                const typeText = this.getText(element, "td");
                if (typeText) {
                    const { type, episodes } = this.extractType(typeText);
                    details.type = type;
                    details.episodes = episodes;
                }
            },
            Year: (element) => {
                details.year = this.extractYear(element);
            },
            Season: (element) => {
                const season = this.getText(element, "td a") || null;
                if (season) {
                    details.season = this.extractSeason(season);
                }
            },
        };

        $(".data #tabbed_pane #tab_1_pane .g_definitionlist table tbody tr").each((_, element) => {
            const field = this.getText($(element), "th");
            if (field && fieldMap[field]) fieldMap[field]($(element));
        });

        return details;
    }

    /**
     * Estrae i tag di un anime.
     */
    private extractTags($: cheerio.CheerioAPI): { id: string; name: string }[] {
        const tags: { id: string; name: string }[] = [];

        $(".data #tabbed_pane #tab_1_pane .g_definitionlist table tbody tr").each((_, element) => {
            const field = this.getText($(element), "th");
            if (field === "Tags") {
                $(element).find("td .g_tag").each((_, tagElement) => {
                    const tagName = this.getText($(tagElement), ".tagname");
                    const tagId = extractNumbers($(tagElement).find("a").attr("href") || "");
                    if (tagName && tagId) tags.push({ id: tagId, name: tagName });
                });
            }
        });

        return tags;
    }

    /**
     * Estrae l'immagine di un anime.
     */
    private extractImage($: cheerio.CheerioAPI): { src: string } {
        return { src: $("picture img").attr("src") || "" };
    }

    /**
     * Estrae i dettagli di un anime dalla pagina HTML di AniDB.
     */
    public async get(id: string): Promise<Anime> {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    const options = { headers: getFakeClient() };
                    const response = await axios.get(`https://anidb.net/anime/${id}`, options);
                    const parsed = await appErrors(response.data);

                    if (!isError(parsed)) {
                        const $ = cheerio.load(<string>parsed);
                        const anime: Anime = {
                            details: this.extractDetails($),
                            tags: this.extractTags($),
                            image: this.extractImage($),
                            description: this.extractDescription($),
                        };
                        resolve(anime);
                    } else {
                        reject(parsed);
                    }
                } catch (error) {
                    reject(error);
                }
            }, this.delay);
        });
    }
}
