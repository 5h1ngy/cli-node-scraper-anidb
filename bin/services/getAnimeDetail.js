import _ from "lodash"
import axios from 'axios'
import * as cheerio from 'cheerio'

import * as logger from "../utils/logger.js"
import getFakeClient from '../client/getFakeClient.js'
import appError from '../handlers/appError.js'
import extractNumbers from '../utils/extractNumbers.js'

/**
 * Scarica un'immagine da un URL e la converte in formato base64.
 * @param {string} imageUrl - L'URL dell'immagine da scaricare.
 * @returns {Promise<string>} - Una Promise che restituisce una stringa contenente l'immagine in formato base64.
 */
async function downloadImageAsBase64(imageUrl) {
    try {
        // Esegui la richiesta GET per ottenere l'immagine
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer' // Riceviamo i dati come buffer
        });

        // Converti l'immagine in formato base64
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');

        // Ottieni il tipo MIME dall'header Content-Type
        const contentType = response.headers['content-type'];

        // Restituisci l'immagine in formato base64 con il prefisso data URL
        return `data:${contentType};base64,${base64Image}`;
    } catch (error) {

        logger.logError(imageUrl)
        logger.logError(error)
        return ''
    }
}

/**
 * 
 * @param {number} delay 
 * @param {string} id 
 * @returns {Promise<Record<string, any>>}
 */
export default function (delay, id) {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {

            try {
                const options = { headers: getFakeClient() }

                const response = await axios.get(`https://anidb.net/anime/${id}`, options)
                const data = await appError(response.data)
                const $ = cheerio.load(data)

                const anime = {}


                $('.data #tabbed_pane #tab_1_pane .g_definitionlist table tbody tr').each(function () {
                    const field = _.kebabCase($(this).find('th').text()) || undefined

                    switch (field) {
                        case 'main-title': {
                            const id = $(this).find('td span').text() || undefined
                            if (id) {
                                Object.assign(anime, { id })
                            }
                            break
                        }
                        case 'type': {
                            const type = $(this).find('td').text() || undefined
                            if (type) {
                                Object.assign(anime, { type })
                            }
                            break
                        }
                        case 'year': {
                            const year = $(this).find('td span').text() || undefined
                            if (year) {
                                Object.assign(anime, { year })
                            }
                            break
                        }
                        case 'season': {
                            const season = $(this).find('td a').text() || undefined
                            if (season) {
                                Object.assign(anime, { season })
                            }
                            break
                        }
                        case 'tags': {
                            const tags = []
                            $(this).find('td span').each(function () {
                                const name = $(this).find('a .tagname').text()
                                if (name) {
                                    const id = extractNumbers($(this).find('a').attr('href').toString())
                                    tags.push({ id, name })
                                }
                            })
                            Object.assign(anime, { tags })
                            break
                        }
                    }
                })

                const img = $('picture').find('img').attr()
                if (_.has(img, 'src')) {
                    const base64 = await downloadImageAsBase64(img.src) || ''
                    Object.assign(anime, { image: { src: img.src, base64 }, })
                } else {
                    Object.assign(anime, { image: { src: '', base64: '' }, })
                }

                resolve(anime)

            } catch (error) {
                reject(error)
            }
        }, delay)
    })
}