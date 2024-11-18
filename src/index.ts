// import "module-alias/register";

// import "./config/alias";
import "./config/env";

import { connect, disconnect } from "@/config/database";
import { logError, logWarn, logInfo, logVerbose} from "@/shared/logger";
import AnimeReferencesCollector from "@/operations/AnimeReferencesCollector";
import AnimeDetailsCollector from "@/operations/AnimeDetailsCollector";

(async () => {
    logInfo("Scraper starting...")
    await connect()
    const animeReferencesCollector = new AnimeReferencesCollector()
    await animeReferencesCollector.run();

    if(animeReferencesCollector.complete){
        const animeDetailsCollector = new AnimeDetailsCollector()
        await animeDetailsCollector.run();
    }

    await disconnect()
})()