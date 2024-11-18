import * as cheerio from 'cheerio';
import { convert } from 'html-to-text';

type AppErrorResult = string | Error;

export enum APP_ERRORS { BANNED = 'banned', ROBOT = 'robot', NO_RESULTS = 'no-results', ADULT_CONTENT = 'adult-contents' }

export const isError = <AppErrorResult>(thing: any): thing is AppErrorResult => true;

/**
 * Analizza errori dell'app.
 * @param data - HTML in formato stringa da analizzare.
 * @returns Una Promise che restituisce l'input originale se non ci sono errori, altrimenti lancia un errore personalizzato.
 */
export default async function appErrors(data: string): Promise<AppErrorResult> {
    const $ = cheerio.load(data);

    const isError = $('.g_msg.g_bubble.error');
    const isNote = $('.g_msg.g_bubble.note');

    const errorContent = convert(isError.find('.container').html() || '', { wordwrap: 130 });
    const noteContent = convert(isNote.find('.container').html() || '', { wordwrap: 130 });

    if (errorContent.includes('banned')) {
        const error = new Error(errorContent);
        Object.assign(error, { type: APP_ERRORS.BANNED });
        return error;

    } else if (noteContent.includes("We don't like robots")) {
        const warning = new Error(noteContent);
        Object.assign(warning, { type: APP_ERRORS.ROBOT });
        return warning;

    } else if (noteContent.includes('No results')) {
        const warning = new Error(noteContent);
        Object.assign(warning, { type: APP_ERRORS.NO_RESULTS });
        return warning;

    } else if (noteContent.includes('Adult contents')) {
        const warning = new Error(noteContent);
        Object.assign(warning, { type: APP_ERRORS.ADULT_CONTENT });
        return warning;

    } else {
        return data; // Nessun errore rilevato, ritorna l'input originale.

    }
}
