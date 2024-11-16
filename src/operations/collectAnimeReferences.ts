import _ from "lodash";
import { promises as fs } from "fs";
import path from "path";

import { logInfo, logError, logWarn } from "@/shared/logger";
import { APP_ERRORS } from "@/handlers/appErrors";
import getAnimeId from "@/services/getAnimeId";
import { Anime } from "@/models";

const PROGRESS_FILE = path.resolve(__dirname, "..", "..", "data", "progress.json");
const PAGES_MAX = 2000; // Numero massimo di pagine

async function saveProgress(page: number): Promise<void> {
    const dataDir = path.dirname(PROGRESS_FILE);
    try {
        // Crea la directory se non esiste
        await fs.mkdir(dataDir, { recursive: true });
    } catch (err) {
        if (typeof err === "object" && "code" in err! && err.code !== "EEXIST") {
            logError(`[ERROR] Failed to create progress directory: ${err.message}`);
            throw err; // Rilancia l'errore se non è "directory già esistente"
        }
    }

    // Salva il progresso nel file progress.json
    const data = JSON.stringify({ page });
    try {
        await fs.writeFile(PROGRESS_FILE, data, "utf8");
        logInfo(`[INFO] Progress saved successfully: page ${page}`);
    } catch (err) {
        logError(`[ERROR] Failed to save progress: ${err.message}`);
        throw err; // Rilancia l'errore per ulteriori debug
    }
}

async function loadProgress(): Promise<number> {
    try {
        const data = await fs.readFile(PROGRESS_FILE, "utf8");
        const { page } = JSON.parse(data);
        logInfo(`[INFO] Loaded progress: starting from page ${page}`);
        return page;
    } catch (err) {
        if (err.code === "ENOENT") {
            // File non trovato, inizializza il progresso
            logWarn(`[WARNING] Progress file not found. Starting from page 0.`);
            await saveProgress(0); // Inizializza con pagina 0
            return 0;
        } else {
            // Altri errori durante la lettura del file
            logError(`[ERROR] Failed to load progress: ${err.message}`);
            throw err; // Rilancia l'errore
        }
    }
}

async function run(): Promise<boolean> {
    logInfo(`[bulkOperations/collectAnimeReferences] running`);

    const startPage = await loadProgress();

    if (startPage === 0) {
        logInfo(`[bulkOperations/collectAnimeReferences] No progress found. Starting from page 0.`);
    }

    for (let page = startPage; page < PAGES_MAX; page++) {
        try {
            const ids = await getAnimeId(page);
            for (let reference of ids) {
                await Anime.findOrCreate({ where: { reference } });
                logInfo(`[SUCCESS][bulkOperations/collectAnimeReferences] page: ${page}, id: ${reference}`);
            }
        } catch (error) {
            if (typeof error === "object" && error !== null && "type" in error) {
                if (error.type !== APP_ERRORS.NO_RESULTS) {
                    logWarn(`[WARNING][operations/collectAnimeReferences] page: ${page}, ${error.type}`);
                } else {
                    await saveProgress(page);
                    return true;
                }
            } else {
                logError(`[ERROR][operations/collectAnimeReferences] page: ${page}, generic error, see logs`);
                logError(JSON.stringify(error));
            }
            await saveProgress(page);
            throw error;
        }
    }

    await saveProgress(0);
    return true;
}

export default {
    run,
};
