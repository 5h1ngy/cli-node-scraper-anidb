import dayjs from 'dayjs';
import _ from 'lodash';

/**
 * Funzione per normalizzare le date
 * @param {string} inputDate 
 * @returns 
 */
export function normalizeDate(inputDate) {
    if (_.isNil(inputDate)) return null;  // Se la data è null o undefined, ritorna null

    // Gestione di formati di date incerti (??.??.YYYY o simili)
    const defaultDate = '01'; // Imposta il giorno o mese di default quando mancano
    let normalizedDate;

    if (_.includes(inputDate, '??')) {
        // Se la data contiene parti mancanti (??), la sostituiamo con valori di default
        const parts = inputDate.split('.');
        const day = parts[0] === '??' ? defaultDate : parts[0];
        const month = parts[1] === '??' ? defaultDate : parts[1];
        const year = parts[2];
        normalizedDate = dayjs(`${year}-${month}-${day}`).format('YYYY-MM-DD');
    } else if (inputDate.includes('?')) {
        // Gestione di formati con caratteri ambigui "?" (ad esempio '??.??.2025?')
        const year = inputDate.replace(/\?/g, '0'); // Rimpiazziamo "?" con "0" (o un valore predefinito)
        normalizedDate = dayjs(year).format('YYYY-MM-DD');
    } else {
        // Altrimenti, cerchiamo di normalizzare direttamente la data
        normalizedDate = dayjs(inputDate, ['DD.MM.YYYY', 'MM.YYYY', 'YYYY', 'DD.MM.YY'], true).format('YYYY-MM-DD');
    }

    // Ritorna null se la data non è valida
    if (!dayjs(normalizedDate).isValid()) return null;

    return normalizedDate;
}

/**
 * Funzione per verificare se una data è già normalizzata
 * @param {string} inputDate 
 * @returns 
 */
export function isDateNormalized(inputDate) {
    if (_.isNil(inputDate)) return false; // Se la data è null o undefined, ritorna false

    // Verifica se la data è già nel formato 'YYYY-MM-DD'
    const normalizedFormat = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
    return normalizedFormat.test(inputDate) && dayjs(inputDate).isValid();
}
