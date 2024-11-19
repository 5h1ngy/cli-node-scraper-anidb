import { logInfo, logError, logWarn } from "@/shared/logger";
import { APP_ERRORS } from "@/handlers/appErrors";
import getAnimeReferences from "@/services/getAnimeReferences";
import AnimeReferences from "@/models/AnimeReferences";
import ProgressManager from "@/handlers/ProgressManager";

export default class AnimeReferencesCollector {
    private readonly PAGES_MAX: number;
    private progressManager: ProgressManager;
    public complete: boolean = false;

    constructor(progressManager: ProgressManager) {
        this.progressManager = progressManager;
        this.PAGES_MAX = 1000; // Numero massimo di pagine
    }

    public async run(): Promise<boolean> {
        logInfo(`[AnimeReferencesCollector][run] Starting collection process`);

        // Carica i progressi
        await this.progressManager.load();
        const { page: startPage } = this.progressManager.getStates();
        const pageToStart = startPage !== null ? startPage : 1;

        if (pageToStart === 1) {
            logInfo(`[AnimeReferencesCollector][run] No progress found. Starting from page 1.`);
        }

        for (let page = pageToStart; page <= this.PAGES_MAX; page++) {
            try {
                logInfo(`[AnimeReferencesCollector][run] Fetching anime IDs from page: ${page}`);
                const ids = await getAnimeReferences(page);
                logInfo(`[AnimeReferencesCollector][run] Successfully fetched IDs: ${ids.join(", ")}`);

                for (let animeId of ids) {
                    await AnimeReferences.findOrCreate({ where: { animeId } });
                    logInfo(`[AnimeReferencesCollector][run] Anime ID ${animeId} stored in database.`);
                }

                await this.progressManager.setStates({ page });
                logInfo(`[AnimeReferencesCollector][run] Progress saved after processing page: ${page}`);
            } catch (error: any) {
                if (typeof error === "object" && error !== null && "type" in error) {
                    if (error.type !== APP_ERRORS.NO_RESULTS) {
                        logWarn(`[AnimeReferencesCollector][run] Page ${page} error type: ${error.type}`);
                    } else {
                        await this.progressManager.setStates({ page });
                        logInfo(`[AnimeReferencesCollector][run] No results for page: ${page}. Ending collection.`);
                        this.complete = true;
                        return true;
                    }
                } else {
                    logError(`[AnimeReferencesCollector][run] Unexpected error on page ${page}: ${JSON.stringify(error)}`);
                }
                await this.progressManager.setStates({ page });
                throw error;
            }
        }

        await this.progressManager.setStates({ page: null });
        logInfo(`[AnimeReferencesCollector][run] Collection process completed.`);
        this.complete = true;
        return true;
    }
}
