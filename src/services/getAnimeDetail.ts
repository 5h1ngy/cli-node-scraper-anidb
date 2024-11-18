import _ from "lodash";
import axios from "axios";
import * as cheerio from "cheerio";

import { logInfo, logError } from "@/shared/logger";
import getFakeClient from "@/handlers/getFakeClient";
import appErrors from "@/handlers/appErrors";
import extractNumbers from "@/utils/extractNumbers";

type Anime = {
    details: {
        title?: string;
        type?: string;
        year?: string;
        season?: string;
    };
    tags: { id: string; name: string }[];
    image: { src: string; base64: string };
};

/**
 * Scarica un'immagine da un URL e la converte in formato base64.
 * @param imageUrl L'URL dell'immagine da scaricare.
 * @returns Una Promise che restituisce una stringa contenente l'immagine in formato base64.
 */
async function downloadImageAsBase64(imageUrl: string): Promise<string> {
    try {
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer", // Riceviamo i dati come buffer.
        });

        const base64Image = Buffer.from(response.data, "binary").toString("base64");
        const contentType = response.headers["content-type"];

        return `data:${contentType};base64,${base64Image}`;
    } catch (error) {
        logError(`[downloadImageAsBase64] Failed to download image from URL: ${imageUrl}`);
        logError(JSON.stringify(error));
        return "";
    }
}

/**
 * Estrae i dettagli di un anime dalla pagina HTML di AniDB.
 * @param delay Il ritardo (in millisecondi) prima di effettuare la richiesta.
 * @param id L'ID dell'anime da estrarre.
 * @returns Una Promise che restituisce i dettagli dell'anime come oggetto.
 */
export default function getAnimeDetails(delay: number, id: string): Promise<Anime> {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            const options = { headers: getFakeClient() };
            const response = await axios.get(`https://anidb.net/anime/${id}`, options);
            const parsed = await appErrors(response.data);

            if (typeof parsed === 'string') {
                const $ = cheerio.load(parsed);
                const anime: Anime = { details: {}, tags: [], image: { src: "", base64: "" } };

                $(".data #tabbed_pane #tab_1_pane .g_definitionlist table tbody tr").each(function () {
                    const field = _.kebabCase($(this).find("th").text()) || undefined;

                    switch (field) {
                        case "main-title": {
                            const title = $(this).find("td span").text() || undefined;
                            if (title) anime.details.title = title;
                            break;
                        }
                        case "type": {
                            const type = $(this).find("td").text() || undefined;
                            if (type) anime.details.type = type;
                            break;
                        }
                        case "year": {
                            const year = $(this).find("td span").text() || undefined;
                            if (year) anime.details.year = year;
                            break;
                        }
                        case "season": {
                            const season = $(this).find("td a").text() || undefined;
                            if (season) anime.details.season = season;
                            break;
                        }
                        case "tags": {
                            const tags: { id: string; name: string }[] = [];
                            $(this).find("td span").each(function () {
                                const name = $(this).find("a .tagname").text();
                                if (name) {
                                    const id = extractNumbers($(this).find("a").attr("href")) || "";
                                    tags.push({ id, name });
                                }
                            });
                            anime.tags = tags;
                            break;
                        }
                    }
                });

                const img = $("picture").find("img").attr();
                if (img?.src) {
                    const base64 = (await downloadImageAsBase64(img.src)) || "";
                    anime.image = { src: img.src, base64 };
                }

                resolve(anime);

            } else {
                reject(parsed)
            }
        }, delay);
    });
}
