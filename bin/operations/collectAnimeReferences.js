import _ from "lodash"

import getAnimeId from '../services/getAnimeId.js'
import * as logger from "../utils/logger.js"
import { ANIME_REFERENCES_PAGES_MAX as PAGES_MAX } from "../../CONFIG.js"

const REQUEST_DELAY = 0;

/**
 * 
 * @param {(ids: Array<number>) => Promise<void>} callback 
 * @returns {Promise<void>}
 */
export default async function collectAnimeReferences(callback) {
    for (let page = 0; page < PAGES_MAX; page++) {
        try {

            const ids = await getAnimeId(page, REQUEST_DELAY)
            logger.logInfo(`[SUCCESS][opretations/collectAnimeReferences] page: ${page}, id: ${ids.join(',')}`)

            await callback(ids)

        } catch (error) {

            if (error?.type === 'no-results') {
                logger.logWarn(`[WARNING][opretations/collectAnimeDetails] page: ${page}, no-results`)
            } else if (error?.type === 'robot') {
                logger.logWarn(`[WARNING][opretations/collectAnimeDetails] page: ${page}, robot`)
            } else {
                logger.logError(`[ERROR][opretations/collectAnimeDetails] page: ${page}, generic error, see logs`)
            }

            logger.logError(JSON.stringify(error))

            throw error
        }
    }
}