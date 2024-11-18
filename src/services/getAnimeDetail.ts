import _ from "lodash";
import axios from "axios";
import * as cheerio from "cheerio";

import getFakeClient from "@/handlers/getFakeClient";
import appErrors, { isError } from "@/handlers/appErrors";
import extractNumbers from "@/utils/extractNumbers";

type Anime = {
    details: {
        title?: string;
        type?: string;
        year?: string;
        season?: string;
    };
    tags: { id: string; name: string }[];
    image: { src: string; };
};

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

            if (isError(parsed)) {
                const $ = cheerio.load(<string>parsed);
                const anime: Anime = { details: {}, tags: [], image: { src: "" } };

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
                    anime.image = { src: img.src };
                }

                resolve(anime);

            } else {
                reject(parsed)
            }
        }, delay);
    });
}
