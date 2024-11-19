import dayjs from "dayjs";
import _ from "lodash";

/**
 * Funzione per normalizzare le date.
 * Gestisce formati incerti come `??.??.YYYY` e li converte in un formato standard `YYYY-MM-DD`.
 * @param inputDate - La data da normalizzare, in formato stringa.
 * @returns La data normalizzata in formato `YYYY-MM-DD` oppure `null` se la normalizzazione fallisce.
 */
export function normalizeDate(inputDate: string | null | undefined): string | null {
    if (_.isNil(inputDate)) return null; // Se la data è null o undefined, ritorna null.

    const defaultDate = "01"; // Giorno/mese di default quando mancano.
    let normalizedDate: string;

    if (_.includes(inputDate, "??")) {
        // Gestione di date incomplete con "??".
        const parts = inputDate.split(".");
        const day = parts[0] === "??" ? defaultDate : parts[0];
        const month = parts[1] === "??" ? defaultDate : parts[1];
        const year = parts[2];
        normalizedDate = dayjs(`${year}-${month}-${day}`).format("YYYY-MM-DD");
    } else if (inputDate.includes("?")) {
        // Gestione di formati con caratteri ambigui "?" (esempio: "??.??.2025?").
        const year = inputDate.replace(/\?/g, "0"); // Sostituiamo "?" con "0".
        normalizedDate = dayjs(year).format("YYYY-MM-DD");
    } else {
        // Gestione di date con formati standard.
        normalizedDate = dayjs(
            inputDate,
            ["DD.MM.YYYY", "MM.YYYY", "YYYY", "DD.MM.YY"],
            true
        ).format("YYYY-MM-DD");
    }

    // Se la data risultante non è valida, ritorna null.
    if (!dayjs(normalizedDate).isValid()) return null;

    return normalizedDate;
}

/**
 * Verifica se una data è già normalizzata.
 * Controlla se il formato della data è `YYYY-MM-DD` e se è valida.
 * @param inputDate - La data da verificare, in formato stringa.
 * @returns `true` se la data è già normalizzata, altrimenti `false`.
 */
export function isDateNormalized(inputDate: string | null | undefined): boolean {
    if (_.isNil(inputDate)) return false; // Se la data è null o undefined, ritorna false.

    const normalizedFormat = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/; // Formato `YYYY-MM-DD`.
    return normalizedFormat.test(inputDate) && dayjs(inputDate).isValid();
}
