import axios from "axios";

import { logError } from "@/shared/logger";
import appErrors, { isError } from "@/handlers/appErrors";

/**
 * Scarica un'immagine da un URL e la converte in formato base64.
 * @param delay - Ritardo prima di effettuare la richiesta.
 * @param imageUrl - L'URL dell'immagine da scaricare.
 * @returns Una Promise che restituisce una stringa contenente l'immagine in formato base64.
 */
export default function getAnimeAsset(delay: number, imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
                const parsed = await appErrors(response.data);

                if (isError(parsed)) {
                    const base64Image = Buffer.from(response.data, "binary").toString("base64");
                    const contentType = response.headers["content-type"];
                    resolve(`data:${contentType};base64,${base64Image}`);
                } else {
                    reject(parsed);
                }
            } catch (error) {
                logError(`[getAnimeAsset] Failed to fetch asset from URL: ${imageUrl}, Error: ${error}`);
                reject(error);
            }
        }, delay);
    });
}
