import _ from 'lodash';
import axios from 'axios';
import * as cheerio from 'cheerio';

import extractNumbers from '@/utils/extractNumbers';
import appErrors from '@/handlers/appErrors';
import getFakeClient from '@/handlers/getFakeClient';

const DELAY = 500

const _URL = (page: number): string =>
    `https://anidb.net/anime/?h=1&noalias=1&orderby.name=0.1&page=${page.toString()}&view=list`;

/**
 * Funzione per ottenere gli ID degli anime da una tabella HTML.
 * @param page - Numero della pagina da analizzare.
 * @returns Una Promise che restituisce un array di numeri (ID degli anime).
 */
export default function getAnimeReferences(page: number): Promise<number[]> {
    return new Promise((resolve, reject) => setTimeout(async () => {
        const ids: number[] = [];

        const options = { headers: getFakeClient() };
        const response = await axios.get(_URL(page), options);
        const parsed = await appErrors(response.data);

        if (typeof parsed === 'string') {
            const $ = cheerio.load(parsed);

            $('table tr').each(function () {
                // Cerca la cella con data-label="Title"
                const titleCell = $(this).find('td[data-label="Title"]');
                // Se la cella esiste
                if (titleCell.length > 0) {
                    // Cerca il tag <a> all'interno della cella
                    const link = titleCell.find('a').attr('href');
                    // Se il link esiste, prendi l'attributo href
                    if (link) {
                        const id = Number(extractNumbers(link));
                        if (!isNaN(id)) {
                            ids.push(id);
                        }
                    }
                }
            });

            resolve(ids);
        } else {
            reject(parsed);
        }
    }, DELAY));
}
