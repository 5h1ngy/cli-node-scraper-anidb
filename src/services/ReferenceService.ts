import axios from "axios";
import * as cheerio from "cheerio";

import extractNumbers from "@/utils/extractNumbers";
import appErrors from "@/handlers/appErrors";
import getFakeClient from "@/handlers/getFakeClient";

const DELAY = 1; // Ritardo prima di effettuare una richiesta

/**
 * Classe per gestire l'ottenimento degli ID di riferimento degli anime.
 */
export default class ReferenceService {
    private readonly delay: number;

    constructor(delay: number = DELAY) {
        this.delay = delay;
    }

    /**
     * Crea l'URL della pagina da cui ottenere i riferimenti.
     * @param page - Numero della pagina.
     * @returns L'URL della pagina.
     */
    private generateUrl(page: number): string {
        return `https://anidb.net/anime/?h=1&noalias=1&orderby.name=0.1&page=${page}&view=list`;
    }

    /**
     * Ottiene gli ID degli anime da una tabella HTML.
     * @param page - Numero della pagina da analizzare.
     * @returns Una Promise che restituisce un array di numeri (ID degli anime).
     */
    public async get(page: number): Promise<number[]> {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                const ids: number[] = [];

                try {
                    const options = { headers: getFakeClient() };
                    const response = await axios.get(this.generateUrl(page), options);
                    const parsed = await appErrors(response.data);

                    if (typeof parsed === "string") {
                        const $ = cheerio.load(parsed);

                        $("table tr").each(function () {
                            const titleCell = $(this).find('td[data-label="Title"]');
                            const link = titleCell.find("a").attr("href");
                            if (link) {
                                const id = Number(extractNumbers(link));
                                if (!isNaN(id)) {
                                    ids.push(id);
                                }
                            }
                        });

                        resolve(ids);
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
