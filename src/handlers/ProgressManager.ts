import { promises as fs } from "fs";
import path from "path";
import { logError, logInfo } from "@/shared/logger";

/**
 * Classe per la gestione dello stato di avanzamento del processo.
 * Salva e recupera dati sul progresso corrente per supportare riprese.
 */
export default class ProgressManager {
    private readonly PROGRESS_FILE: string; // Percorso del file di stato
    private page: string | null; // Stato corrente della pagina
    private anime: string | null; // Stato corrente dell'anime

    constructor() {
        this.PROGRESS_FILE = process.env.NODE_ENV === "development"
            ? path.resolve(__dirname, "..", "..", "data", process.env.PROGRESS_FILE || "progress.json")
            : path.resolve(process.cwd(), "data", process.env.PROGRESS_FILE || "progress.json");
        this.page = null;
        this.anime = null;
    }

    /**
     * Salva lo stato corrente su file.
     * @throws Lancia un errore se il salvataggio fallisce.
     */
    async save(): Promise<void> {
        const dataDir = path.dirname(this.PROGRESS_FILE);
        try {
            await fs.mkdir(dataDir, { recursive: true });
        } catch (err: any) {
            if (err.code !== "EEXIST") {
                logError(`[ProgressManager][save] Failed to create progress directory: ${err.message}`);
                throw err;
            }
        }

        const progressData = { page: this.page, anime: this.anime };
        try {
            await fs.writeFile(this.PROGRESS_FILE, JSON.stringify(progressData), "utf8");
            logInfo(`[ProgressManager][save] Progress saved successfully: ${JSON.stringify(progressData)}`);
        } catch (err: any) {
            logError(`[ProgressManager][save] Failed to save progress: ${err.message}`);
            throw err;
        }
    }

    /**
     * Carica lo stato salvato da file.
     * @throws Lancia un errore se il caricamento fallisce.
     */
    async load(): Promise<void> {
        try {
            const data = await fs.readFile(this.PROGRESS_FILE, "utf8");
            const { page, anime } = JSON.parse(data);
            this.page = page;
            this.anime = anime;
            logInfo(`[ProgressManager][load] Loaded progress: page=${this.page}, anime=${this.anime}`);
        } catch (err: any) {
            if (err.code === "ENOENT") {
                logInfo(`[ProgressManager][load] Progress file not found. Initializing with null states.`);
                this.page = null;
                this.anime = null;
            } else {
                logError(`[ProgressManager][load] Failed to load progress: ${err.message}`);
                throw err;
            }
        }
    }

    /**
     * Cancella lo stato corrente eliminando il file di progresso.
     * @throws Lancia un errore se la cancellazione fallisce.
     */
    async clear(): Promise<void> {
        try {
            await fs.unlink(this.PROGRESS_FILE);
            logInfo(`[ProgressManager][clear] Progress file deleted successfully.`);
        } catch (err: any) {
            if (err.code === "ENOENT") {
                logInfo(`[ProgressManager][clear] Progress file does not exist. Nothing to delete.`);
            } else {
                logError(`[ProgressManager][clear] Failed to delete progress file: ${err.message}`);
                throw err;
            }
        }
        this.page = null;
        this.anime = null;
    }

    /**
     * Aggiorna gli stati interni e salva immediatamente.
     * @param state - Nuovi stati da impostare.
     * @throws Lancia un errore se il salvataggio fallisce.
     */
    async setStates(state: { page?: number | null; anime?: string | null }) {
        if (state.page !== undefined) this.page = state.page !== null ? state.page.toString() : null;
        if (state.anime !== undefined) this.anime = state.anime;

        logInfo(`[ProgressManager][setStates] States updated: page=${this.page}, anime=${this.anime}`);
        await this.save();
    }

    /**
     * Restituisce lo stato corrente.
     * @returns Oggetto contenente `page` e `anime`.
     */
    getStates(): { page: number | null; anime: string | null } {
        return {
            page: typeof this.page === "string" ? parseInt(this.page) : null,
            anime: this.anime,
        };
    }
}
