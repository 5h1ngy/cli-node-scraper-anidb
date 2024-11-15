import * as logger from "../utils/logger.js"
import collectAnimeReferences from '../operations/collectAnimeReferences.js'
import { connect } from '../database/index.js'

/**
 * 
 * @returns {Promise<boolean>}
 */
async function run() {
    try {
        logger.logWarn(`[bulkOperations/collectAnimeReferences] running`)
        const models = await connect();

        await collectAnimeReferences(async (ids) => {
            for (let id of ids) {
                await models.animeReferences.findOrCreate({where: { id }})
                logger.logInfo(`[SUCCESS][bulkOperations/collectAnimeReferences] animeReference id: ${id}`)
            }
        })

        return true

    } catch (error) {
        if (error?.type === 'no-results') {
            return true
        } else {
            throw error
        }
    }
}

export default {
    run,
}