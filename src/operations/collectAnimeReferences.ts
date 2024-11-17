import { promises as fs } from "fs";
import path from "path";
import { logInfo, logError, logWarn } from "@/shared/logger";
import { APP_ERRORS } from "@/handlers/appErrors";
import getAnimeId from "@/services/getAnimeId";
import Anime from "@/models/Anime";

export default class AnimeCollector {
    private readonly PROGRESS_FILE: string;
    private readonly PAGES_MAX: number;

    constructor() {
        debugger
        this.PROGRESS_FILE = path.resolve(__dirname, "..", "..", "data", "progress.json");
        this.PAGES_MAX = 2000; // Numero massimo di pagine
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
                logError(`[ERROR] Failed to create progress directory: ${err.message}`);
                throw err;
            }
        }

        // Salva il progresso
        const data = JSON.stringify({ page });
        try {
            await fs.writeFile(this.PROGRESS_FILE, data, "utf8");
            logInfo(`[INFO] Progress saved successfully: page ${page}`);
        } catch (err: any) {
            logError(`[ERROR] Failed to save progress: ${err.message}`);
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
            logInfo(`[INFO] Loaded progress: starting from page ${page}`);
            return page;
        } catch (err: any) {
            if (err.code === "ENOENT") {
                logWarn(`[WARNING] Progress file not found. Starting from page 1.`);
                await this.saveProgress(1);
                return 1;
            } else {
                logError(`[ERROR] Failed to load progress: ${err.message}`);
                throw err;
            }
        }
    }

    /**
     * Esegue l'operazione principale per raccogliere riferimenti anime.
     */
    public async run(): Promise<boolean> {
        logInfo(`[bulkOperations/collectAnimeReferences] running`);

        const startPage = await this.loadProgress();

        if (startPage === 0) {
            logInfo(`[bulkOperations/collectAnimeReferences] No progress found. Starting from page 0.`);
        }

        for (let page = startPage; page < this.PAGES_MAX; page++) {
            try {
                const ids = await getAnimeId(page);
                for (let reference of ids) {
                    const test = await Anime.findOrCreate({ where: { reference } });
                    logInfo(`[SUCCESS][bulkOperations/collectAnimeReferences] page: ${page}, id: ${reference}`);
                }
            } catch (error: any) {
                if (typeof error === "object" && error !== null && "type" in error) {
                    if (error.type !== APP_ERRORS.NO_RESULTS) {
                        logWarn(`[WARNING][operations/collectAnimeReferences] page: ${page}, ${error.type}`);
                    } else {
                        await this.saveProgress(page);
                        return true;
                    }
                } else {
                    logError(`[ERROR][operations/collectAnimeReferences] page: ${page}, generic error, see logs`);
                    logError(JSON.stringify(error));
                }
                await this.saveProgress(page);
                throw error;
            }
        }

        await this.saveProgress(0);
        return true;
    }
}
