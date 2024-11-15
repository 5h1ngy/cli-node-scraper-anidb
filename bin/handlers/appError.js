import * as cheerio from 'cheerio'
import { convert } from 'html-to-text'

/**
 * App error parsing
 * @param {string} data
 * @return {Promise<object>}
 */
export default async function appError(data) {
    const $ = cheerio.load(data)
    const isError = $('.g_msg.g_bubble.error')
    const isNote = $('.g_msg.g_bubble.note')

    const errorContent = convert(isError.find('.container').html(), { wordwrap: 130 }) || ''
    const noteContent = convert(isNote.find('.container').html(), { wordwrap: 130 }) || ''

    if (errorContent.includes("banned")) {
        const error = new Error(errorContent)
        Object.assign(error, { type: 'banned' })
        throw error

    } else if (noteContent.includes("We don't like robots")) {
        const warning = new Error(noteContent)
        Object.assign(warning, { type: 'robot' })
        throw warning

    } else if (noteContent.includes("No results")) {
        const warning = new Error(noteContent)
        Object.assign(warning, { type: 'no-results' })
        throw warning

    } else if (noteContent.includes("Adult contents")) {
        const warning = new Error(noteContent)
        Object.assign(warning, { type: 'adult-contents' })
        throw warning

    } else {
        return data
    }
}