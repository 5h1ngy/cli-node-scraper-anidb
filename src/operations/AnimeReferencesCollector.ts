import { promises as fs } from "fs";
import path from "path";
import { logInfo, logError, logWarn } from "@/shared/logger";
import { APP_ERRORS } from "@/handlers/appErrors";
import getAnimeReferences from "@/services/getAnimeReferences";
import AnimeReferences from "@/models/AnimeReferences";
import AnimeDetails from "@/models/AnimeDetails";

export default class AnimeReferencesCollector {
    private readonly PROGRESS_FILE: string;
    private readonly PAGES_MAX: number;
    public complete: boolean = false;

    constructor() {
        this.PROGRESS_FILE = path.resolve(__dirname, "..", "..", "data", "progress.json");
        this.PAGES_MAX = 5; // Numero massimo di pagine
    }

    /**
     * Salva il progresso nel file JSON.
     * @param page Pagina corrente da salvare
     */
    private async saveProgress(page: number): Promise<void> {
        const dataDir = path.dirname(this.PROGRESS_FILE);
        try {
            // Crea la directory se non esiste
            await fs.mkdir(dataDir, { recursive: true });
        } catch (err: any) {
            if (err.code !== "EEXIST") {
                logError(`[AnimeReferencesCollector][saveProgress] Failed to create progress directory: ${err.message}`);
                throw err;
            }
        }

        // Salva il progresso
        const data = JSON.stringify({ page });
        try {
            await fs.writeFile(this.PROGRESS_FILE, data, "utf8");
            logInfo(`[AnimeReferencesCollector][saveProgress] Progress saved successfully for page: ${page}`);
        } catch (err: any) {
            logError(`[AnimeReferencesCollector][saveProgress] Failed to save progress for page ${page}: ${err.message}`);
            throw err;
        }
    }

    /**
     * Carica il progresso dal file JSON.
     * @returns La pagina da cui riprendere
     */
    private async loadProgress(): Promise<number> {
        try {
            const data = await fs.readFile(this.PROGRESS_FILE, "utf8");
            const { page } = JSON.parse(data);
            logInfo(`[AnimeReferencesCollector][loadProgress] Loaded progress. Resuming from page: ${page}`);
            return page;
        } catch (err: any) {
            if (err.code === "ENOENT") {
                logWarn(`[AnimeReferencesCollector][loadProgress] Progress file not found. Starting from page 1.`);
                await this.saveProgress(1);
                return 1;
            } else {
                logError(`[AnimeReferencesCollector][loadProgress] Failed to load progress: ${err.message}`);
                throw err;
            }
        }
    }

    /**
     * Esegue l'operazione principale per raccogliere riferimenti anime.
     */
    public async run(): Promise<boolean> {
        logInfo(`[AnimeReferencesCollector][run] Starting collection process`);

        const startPage = await this.loadProgress();

        if (startPage === 1) {
            logInfo(`[AnimeReferencesCollector][run] No progress found. Starting from page 1.`);
        }

        for (let page = startPage; page < this.PAGES_MAX; page++) {
            try {
                logInfo(`[AnimeReferencesCollector][run] Fetching anime IDs from page: ${page}`);
                const ids = await getAnimeReferences(page);
                logInfo(`[AnimeReferencesCollector][run] Successfully fetched IDs: ${ids.join(", ")}`);

                for (let animeId of ids) {
                    await AnimeReferences.findOrCreate({ where: { animeId } });
                    logInfo(`[AnimeReferencesCollector][run] Anime ID ${animeId} stored in database.`);
                }

                await this.saveProgress(page);
                logInfo(`[AnimeReferencesCollector][run] Progress saved after processing page: ${page}`);
            } catch (error: any) {
                if (typeof error === "object" && error !== null && "type" in error) {
                    if (error.type !== APP_ERRORS.NO_RESULTS) {
                        logWarn(`[AnimeReferencesCollector][run] Page ${page} error type: ${error.type}`);
                    } else {
                        await this.saveProgress(page);
                        logInfo(`[AnimeReferencesCollector][run] No results for page: ${page}. Ending collection.`);
                        this.complete = true;
                        return true;
                    }
                } else {
                    logError(`[AnimeReferencesCollector][run] Unexpected error on page ${page}: ${JSON.stringify(error)}`);
                }
                await this.saveProgress(page);
                throw error;
            }
        }

        await this.saveProgress(0);
        logInfo(`[AnimeReferencesCollector][run] Collection process completed.`);
        this.complete = true;
        return true;
    }
}
