import axios from "axios";
import * as cheerio from "cheerio";

import getFakeClient from "@/handlers/getFakeClient";
import appErrors, { isError } from "@/handlers/appErrors";
import extractNumbers from "@/utils/extractNumbers";

const DELAY = 1; // Ritardo prima di effettuare una richiesta

/**
 * Tipo che rappresenta i dettagli di un anime.
 */
type Anime = {
    details: {
        title?: string;
        type?: string;
        year?: string;
        season?: string;
    };
    tags: { id: string; name: string }[];
    image: { src: string };
    description: string | null; // Campo per la descrizione
};

/**
 * Classe per gestire l'estrazione dei dettagli di un anime.
 */
export default class DetailService {
    private readonly delay: number;

    constructor(delay: number = DELAY) {
        this.delay = delay;
    }

    /**
     * Estrae la descrizione dall'HTML, se presente.
     * @param $ - L'oggetto cheerio che rappresenta la pagina HTML.
     * @returns La descrizione come stringa o una stringa vuota se non trovata.
     */
    private extractDescription($: cheerio.CheerioAPI): string | null {
        const descriptionElement = $(".g_bubble.g_section.desc[itemprop='description']");
        if (descriptionElement.length > 0) {
            return descriptionElement.html()?.trim() || "";
        }
        return null;
    }

    /**
     * Estrae i dettagli principali di un anime.
     * @param $ - L'oggetto cheerio che rappresenta la pagina HTML.
     * @returns Un oggetto Anime con i dettagli principali.
     */
    private extractDetails($: cheerio.CheerioAPI): Anime['details'] {
        const details: Anime['details'] = {};

        $(".data #tabbed_pane #tab_1_pane .g_definitionlist table tbody tr").each(function () {
            const field = $(this).find("th").text().trim();

            switch (field) {
                case "Main Title": {
                    const title = $(this).find("td span").text().trim();
                    if (title) details.title = title;
                    break;
                }
                case "Type": {
                    const type = $(this).find("td").text().trim();
                    if (type) details.type = type;
                    break;
                }
                case "Year": {
                    const year = $(this).find("td span").text().trim();
                    if (year) details.year = year;
                    break;
                }
                case "Season": {
                    const season = $(this).find("td a").text().trim();
                    if (season) details.season = season;
                    break;
                }
            }
        });

        return details;
    }

    /**
     * Estrae i tag di un anime dalla pagina HTML.
     * @param $ - L'oggetto cheerio che rappresenta la pagina HTML.
     * @returns Un array di tag con ID e nome.
     */
    private extractTags($: cheerio.CheerioAPI): { id: string; name: string }[] {
        const tags: { id: string; name: string }[] = [];

        $(".data #tabbed_pane #tab_1_pane .g_definitionlist table tbody tr").each(function () {
            const field = $(this).find("th").text().trim();

            if (field === "Tags") {
                $(this).find("td .g_tag").each(function () {
                    const tagElement = $(this).find("a");
                    const tagName = tagElement.find(".tagname").text().trim();
                    const tagId = extractNumbers(tagElement.attr("href") || "");

                    if (tagName && tagId) {
                        tags.push({ id: tagId, name: tagName });
                    }
                });
            }
        });

        return tags;
    }

    /**
     * Estrae l'immagine di un anime dalla pagina HTML.
     * @param $ - L'oggetto cheerio che rappresenta la pagina HTML.
     * @returns L'oggetto immagine con l'URL.
     */
    private extractImage($: cheerio.CheerioAPI): { src: string } {
        const imgSrc = $("picture img").attr("src") || "";
        return { src: imgSrc };
    }

    /**
     * Estrae i dettagli di un anime dalla pagina HTML di AniDB.
     * @param id - L'ID dell'anime da estrarre.
     * @returns Una Promise che restituisce i dettagli dell'anime come oggetto.
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
