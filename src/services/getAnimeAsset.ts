import _ from "lodash";
import axios from "axios";
import * as cheerio from "cheerio";

import { logInfo, logError } from "@/shared/logger";
import getFakeClient from "@/handlers/getFakeClient";
import appErrors, { isError } from "@/handlers/appErrors";
import extractNumbers from "@/utils/extractNumbers";

/**
 * Scarica un'immagine da un URL e la converte in formato base64.
 * @param imageUrl L'URL dell'immagine da scaricare.
 * @returns Una Promise che restituisce una stringa contenente l'immagine in formato base64.
 */
export default function getAnimeAsset(delay: number, imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
            const parsed = await appErrors(response.data);

            if (isError(parsed)) {
                const base64Image = Buffer.from(response.data, "binary").toString("base64");
                const contentType = response.headers["content-type"];

                resolve(`data:${contentType};base64,${base64Image}`);
            } else {
                reject(parsed)
            }
        }, delay);
    });
}