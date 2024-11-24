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
};

/**
 * Estrae i dettagli di un anime dalla pagina HTML di AniDB.
 * @param id - L'ID dell'anime da estrarre.
 * @returns Una Promise che restituisce i dettagli dell'anime come oggetto.
 */
export default function getAnimeDetail(id: string): Promise<Anime> {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const options = { headers: getFakeClient() };
                const response = await axios.get(`https://anidb.net/anime/${id}`, options);
                const parsed = await appErrors(response.data);

                if (!isError(parsed)) {
                    const $ = cheerio.load(<string>parsed);
                    const anime: Anime = { details: {}, tags: [], image: { src: "" } };

                    // Estrazione dei dettagli principali
                    $(".data #tabbed_pane #tab_1_pane .g_definitionlist table tbody tr").each(function () {
                        const field = $(this).find("th").text().trim();

                        switch (field) {
                            case "Main Title": {
                                const title = $(this).find("td span").text().trim();
                                if (title) anime.details.title = title;
                                break;
                            }
                            case "Type": {
                                const type = $(this).find("td").text().trim();
                                if (type) anime.details.type = type;
                                break;
                            }
                            case "Year": {
                                const year = $(this).find("td span").text().trim();
                                if (year) anime.details.year = year;
                                break;
                            }
                            case "Season": {
                                const season = $(this).find("td a").text().trim();
                                if (season) anime.details.season = season;
                                break;
                            }
                            case "Tags": {
                                // Seleziona tutti i tag nell'HTML
                                $(this).find("td .g_tag").each(function () {
                                    const tagElement = $(this).find("a");
                                    const tagName = tagElement.find(".tagname").text().trim(); // Testo del tag
                                    const tagId = extractNumbers(tagElement.attr("href") || ""); // ID del tag dall'attributo href

                                    // Aggiunge l'oggetto tag solo se entrambi i valori sono presenti
                                    if (tagName && tagId) {
                                        anime.tags.push({ id: tagId, name: tagName });
                                    }
                                });
                                break;
                            }
                        }
                    });

                    // Estrazione dell'immagine
                    const imgSrc = $("picture img").attr("src") || "";
                    anime.image.src = imgSrc;

                    resolve(anime);
                } else {
                    reject(parsed);
                }
            } catch (error) {
                reject(error);
            }
        }, DELAY);
    });
}
