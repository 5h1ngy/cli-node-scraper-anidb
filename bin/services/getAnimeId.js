import _ from 'lodash';
import axios from 'axios'
import * as cheerio from 'cheerio'

import extractNumbers from '../utils/extractNumbers.js'
import appError from '../handlers/appError.js'
import getFakeClient from '../client/getFakeClient.js'

/**
 * Primitive to get url with page
 * @param {number} page
 * @returns {string}
 */
const _URL = (page) => `https://anidb.net/anime/?h=1&noalias=1&orderby.name=0.1&page=${page.toString()}&view=list`

/**
 * Primitve function to get anime id from a HTML table
 * @param {number} page
 * @param {number} delay Delay in milliseconds
 * @returns {Promise<Array<number>>}
 */
export default function getAnimeId(page, delay) {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            const ids = []

            try {
                const options = { headers: getFakeClient() }
                const response = await axios.get(_URL(page), options)
                const data = await appError(response.data)
                const $ = cheerio.load(data)

                $('table tr').each(function () {
                    // Cerca la cella con data-label="Title"
                    const titleCell = $(this).find('td[data-label="Title"]')
                    // Se la cella esiste
                    if (titleCell.length > 0) {
                        // Cerca il tag <a> all'interno della cella
                        const link = titleCell.find('a').attr('href').toString()
                        // Se il link esiste, prendi l'attributo href
                        if (link.length > 0) {
                            const id = extractNumbers(link)
                            ids.push(id)
                        }
                    }
                })

                resolve(ids)
            } catch (error) {
                reject(error)
            }
        }, delay)
    })
}