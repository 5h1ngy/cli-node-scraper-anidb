import _ from "lodash"
import dayjs from 'dayjs'
import sizeof from 'object-sizeof'

import * as logger from "../utils/logger.js"
import formatBytes from "../utils/formatBytes.js"
import { normalizeDate, isDateNormalized } from '../utils/normalizeDate.js'

import { connect } from '../database/index.js'
import collectAnimeDetails from '../operations/collectAnimeDetails.js'

async function run() {
    try {
        logger.logWarn(`[bulkOperations/collectAnimeDetails] running`)
        const models = await connect();
        const animeReferences = await models.animeReferences.findAll()

        for (let animeReference of animeReferences) {
            const mustUpdate = dayjs(animeReference.updatedAt).isBefore(dayjs().subtract(3, 'day')) || animeReference.details === null;

            logger.logWarn(`[WAIT][bulkOperations/collectAnimeDetails] animeReference id: ${animeReference.id}`)
            const exist = animeReference.details === null ? false : true

            if (!exist || mustUpdate) {
                const response = await collectAnimeDetails(animeReference.id)
                const responseTags = _.cloneDeep(response.tags);
                const responseImage = _.cloneDeep(response.image);
                delete response.tags
                delete response.image

                const [assetImages] = await models.assetImages.findOrCreate({
                    where: { base64: responseImage.base64 },
                })

                const [animeDetails] = await models.animeDetails.findOrCreate({
                    where: { id: response.id }, defaults: response,
                });

                await animeReference.setDetail(animeDetails)
                await animeDetails.setAsset(assetImages)

                logger.logWarn(`[bulkOperations/collectAnimeDetails] animeReference Model size ${formatBytes(sizeof(animeReference))}`)
                logger.logWarn(`[bulkOperations/collectAnimeDetails] animeDetails Model size ${formatBytes(sizeof(animeDetails))}`)
                logger.logWarn(`[bulkOperations/collectAnimeDetails] assetImages Model size ${formatBytes(sizeof(assetImages))}`)

                if (responseTags?.length || 0 !== 0) {
                    for (let tag of responseTags) {

                        const [tagsDetails] = await models.tagDetails.findOrCreate({
                            where: { id: _.toUpper(_.snakeCase(tag.name)) },
                        })

                        const [tagReference] = await models.tagReferences.findOrCreate({
                            where: { id: tag.id, details: tagsDetails.id }
                        })

                        await animeReference.addTag(tagReference);

                        const animeTags = await animeReference.getTags();

                        logger.logWarn(`[bulkOperations/collectAnimeDetails] tagsDetails Model size ${formatBytes(sizeof(tagsDetails))}`)
                        logger.logWarn(`[bulkOperations/collectAnimeDetails] tagReferences Model size ${formatBytes(sizeof(tagReference))}`)
                        logger.logWarn(`[bulkOperations/collectAnimeDetails] animeTags Model size ${formatBytes(sizeof(animeTags))}`)
                    }
                }
            }
            // else if (exist) {
            //     const animeDetails = await models.animeDetails.findOne({ where: { id: animeReference.details } });
            //     if (!isDateNormalized(animeDetails.year)) {
            //         logger.logWarn(`[bulkOperations/collectAnimeDetails] animeDetails id: ${animeDetails.id}, year ${animeDetails.year} normalized: ${animeDetails.year}`)
            //         animeDetails.update({ year: normalizeDate(animeDetails.year) })
            //     }

            //     // // Test delle funzioni
            //     // const dates = [
            //     //     '??.??.1932',
            //     //     '??.07.2007',
            //     //     '22.12.2007',
            //     //     '16.11.2003',
            //     //     '20.06.200210.04.2003',
            //     //     '07.03.1992',
            //     //     '21.02.199317.05.1994',
            //     //     '??.??.2025?',
            //     //     '03.10.202119.03.2022'
            //     // ];

            //     // dates.forEach(date => {
            //     //     console.log(`Original: ${date}, Normalized: ${normalizeDate(date)}, Is Normalized: ${isDateNormalized(date)}`);
            //     // });
            // } 
            else {
                logger.logInfo(`[SUCCESS][bulkOperations/collectAnimeDetails] animeReference id: ${animeReference.id}, already exist`)
            }

        }
    } catch (error) {
        throw error
    }
}

export default {
    run,
}