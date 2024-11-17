// import "module-alias/register";

// import "./config/alias";
import "./config/env";

import { connect, disconnect } from "@/config/database";
import { logError, logWarn, logInfo, logVerbose} from "@/shared/logger";
import collectAnimeReferences from "@/operations/collectAnimeReferences";

(async () => {
    logInfo("Scraper starting...")
    await connect() //asfasf
    debugger
    const collect = new collectAnimeReferences()
    await collect.run();

    await disconnect()
})()