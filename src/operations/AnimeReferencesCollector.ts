import { logInfo, logError, logWarn } from "@/shared/logger";
import { APP_ERRORS } from "@/handlers/appErrors";
import ProgressManager from "@/handlers/ProgressManager";

import AnimeReferences from "@/models/AnimeReferences";

import ReferenceService from "@/services/ReferenceService";

/**
 * Classe per la raccolta di riferimenti agli anime.
 */
export default class AnimeReferencesCollector {
    private readonly PAGES_MAX: number; // Numero massimo di pagine da analizzare
    private progressManager: ProgressManager; // Gestisce il progresso dell'operazione
    private referenceService: ReferenceService; // Gestisce il progresso dell'operazione
    public complete: boolean = false; // Indica se il processo è completato

    constructor(progressManager: ProgressManager) {
        this.progressManager = progressManager;
        this.referenceService = new ReferenceService(0);
        this.PAGES_MAX = 1000; // Configurazione predefinita per il numero massimo di pagine
    }

    /**
     * Esegue il processo di raccolta dei riferimenti agli anime.
     * @returns `true` se la raccolta è completata con successo.
     * @throws Lancia un errore in caso di fallimento.
     */
    public async run(): Promise<boolean> {
        logInfo(`[AnimeReferencesCollector][run] Starting collection process`);

        // Carica il progresso precedente
        await this.progressManager.load();
        const { page: startPage } = this.progressManager.getStates();
        const pageToStart = startPage !== null ? startPage : 1; // Riprendi dalla pagina salvata o inizia dalla prima

        if (pageToStart === 1) {
            logInfo(`[AnimeReferencesCollector][run] No progress found. Starting from page 1.`);
        }

        for (let page = pageToStart; page <= this.PAGES_MAX; page++) {
            try {
                logInfo(`[AnimeReferencesCollector][run] Fetching anime IDs from page: ${page}`);
                const ids = await this.referenceService.get(page);
                logInfo(`[AnimeReferencesCollector][run] Successfully fetched IDs: ${ids.join(", ")}`);

                // Salva ogni ID nel database
                for (let animeId of ids) {
                    await AnimeReferences.findOrCreate({ where: { animeId } });
                    logInfo(`[AnimeReferencesCollector][run] Anime ID ${animeId} stored in database.`);
                }

                // Salva lo stato del progresso dopo ogni pagina
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
                        return true; // Conclude il processo se non ci sono più risultati
                    }
                } else {
                    logError(`[AnimeReferencesCollector][run] Unexpected error on page ${page}: ${JSON.stringify(error)}`);
                }
                throw error; // Interrompe l'esecuzione in caso di errore imprevisto
            }
        }

        await this.progressManager.setStates({ page: null }); // Resetta il progresso alla fine
        logInfo(`[AnimeReferencesCollector][run] Collection process completed.`);
        this.complete = true;
        return true;
    }
}
