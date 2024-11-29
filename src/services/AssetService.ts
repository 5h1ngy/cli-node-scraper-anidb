import axios from "axios";

import { logError } from "@/shared/logger";
import appErrors, { isError } from "@/handlers/appErrors";

const DELAY = 1; // Ritardo prima di effettuare una richiesta

/**
 * Classe per gestire il download di immagini di anime in formato base64.
 */
export default class AssetService {
    private readonly delay: number;

    constructor(delay: number = DELAY) {
        this.delay = delay;
    }

    /**
     * Scarica un'immagine da un URL e la converte in formato base64.
     * @param imageUrl - L'URL dell'immagine da scaricare.
     * @returns Una Promise che restituisce una stringa contenente l'immagine in formato base64.
     */
    public async get(imageUrl: string): Promise<string> {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
                    const parsed = await appErrors(response.data);

                    if (!isError(parsed)) {
                        const base64Image = Buffer.from(parsed, "binary").toString("base64");
                        const contentType = response.headers["content-type"];
                        resolve(`data:${contentType};base64,${base64Image}`);
                    } else {
                        reject(parsed);
                    }
                } catch (error) {
                    logError(`[AnimeAssetService] Failed to fetch asset from URL: ${imageUrl}, Error: ${error}`);
                    reject(error);
                }
            }, this.delay);
        });
    }
}
