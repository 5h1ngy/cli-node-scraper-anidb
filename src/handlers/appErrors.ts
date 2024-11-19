import * as cheerio from 'cheerio';
import { convert } from 'html-to-text';

/**
 * Tipo di risultato per un errore dell'applicazione.
 */
type AppErrorResult = string | Error;

/**
 * Enumerazione dei possibili errori dell'applicazione.
 */
export enum APP_ERRORS {
    BANNED = 'banned',
    ROBOT = 'robot',
    NO_RESULTS = 'no-results',
    ADULT_CONTENT = 'adult-contents'
}

/**
 * Verifica se un valore è di tipo AppErrorResult.
 * @param thing - Il valore da verificare.
 * @returns `true` se il valore è di tipo `AppErrorResult`, altrimenti `false`.
 */
export const isError = (thing: any): thing is AppErrorResult => {
    return thing instanceof Error;
};

/**
 * Analizza errori nell'applicazione basati su contenuto HTML.
 * @param data - Stringa HTML da analizzare.
 * @returns Una Promise che restituisce l'input originale se non ci sono errori, altrimenti un errore personalizzato.
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
        return data;
    }
}
