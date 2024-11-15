#!/usr/bin/env node
import { disconnect } from './database/index.js'
import collectAnimeReferences from './bulk/collectAnimeReferences.js'
import collectAnimeDetails from './bulk/collectAnimeDetails.js'

const references = await collectAnimeReferences.run();
if (references) {
    await collectAnimeDetails.run()
    await disconnect()
}

// await collectAnimeDetails.run()
// await disconnect()