import _ from "lodash"

import getAnimeDetail from '../services/getAnimeDetail.js'
import * as logger from "../utils/logger.js"

const REQUEST_DELAY = 2000

/**
 * 
 * @param {string} id 
 * @returns {Promise<Record<string, any>>}
 */
export default async function collectAnimeDetails(id) {
    try {

        const animeDetails = await getAnimeDetail(REQUEST_DELAY, id)

        logger.logInfo(`[SUCCESS][opretations/collectAnimeDetails] id: ${id}, details: ${JSON.stringify(animeDetails, (key, value) => {
            if (key === 'image') return undefined
            return value
        })}`)

        logger.logMessage('debug', `[SUCCESS][opretations/collectAnimeDetails] id: ${id}, image_base64: ${JSON.stringify(animeDetails?.image || {})}`)

        return animeDetails;

    } catch (error) {

        if (error?.type === 'no-results') {
            logger.logWarn(`[WARNING][opretations/collectAnimeDetails] id: ${id}, no-results`)
        } else if (error?.type === 'robot') {
            logger.logWarn(`[WARNING][opretations/collectAnimeDetails] id: ${id}, robot`)
        } else {
            logger.logError(`[ERROR][opretations/collectAnimeDetails] id: ${id}, generic error, see logs`)
        }

        logger.logError(JSON.stringify(error))

        throw error
    }
}