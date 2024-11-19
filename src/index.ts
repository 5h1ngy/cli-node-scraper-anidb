import "./config/env";

import { connect, disconnect } from "@/config/database";
import { logError, logWarn, logInfo } from "@/shared/logger";
import AnimeReferencesCollector from "@/operations/AnimeReferencesCollector";
import AnimeDetailsCollector from "@/operations/AnimeDetailsCollector";
import ProgressManager from "@/handlers/ProgressManager";

(async () => {
    logInfo("Scraper starting...");
    await connect();

    const progressManager = new ProgressManager();

    // Gestione dei segnali di terminazione
    process.on('SIGINT', async () => {
        logWarn('Received SIGINT. Saving progress and exiting...');
        try {
            await progressManager.save();
        } catch (err) {
            logError(`Error saving progress on SIGINT: ${err}`);
        }
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        logWarn('Received SIGTERM. Saving progress and exiting...');
        try {
            await progressManager.save();
        } catch (err) {
            logError(`Error saving progress on SIGTERM: ${err}`);
        }
        process.exit(0);
    });

    process.on('uncaughtException', async (err) => {
        logError(`Uncaught Exception: ${err}`);
        try {
            await progressManager.save();
        } catch (saveErr) {
            logError(`Error saving progress on uncaughtException: ${saveErr}`);
        }
        process.exit(1);
    });

    try {
        const animeReferencesCollector = new AnimeReferencesCollector(progressManager);
        await animeReferencesCollector.run();

        if (animeReferencesCollector.complete) {
            const animeDetailsCollector = new AnimeDetailsCollector(progressManager);
            await animeDetailsCollector.run();
        }

        await disconnect();
    } catch (error) {
        logError(`Error during collection: ${error}`);
        // Assicurati di salvare i progressi prima di uscire
        try {
            await progressManager.save();
        } catch (saveErr) {
            logError(`Error saving progress on error: ${saveErr}`);
        }
        process.exit(1);
    }
})();
