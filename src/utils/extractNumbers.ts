/**
 * Estrae tutti i numeri da una stringa e li restituisce come una stringa concatenata.
 * @param str - La stringa da cui estrarre i numeri (opzionale).
 * @returns Una stringa contenente tutti i numeri concatenati, oppure `undefined` se l'input è `undefined`.
 */
export default function extractNumbers(str?: string): string | undefined {
    if (str) {
        // Usa una regex per trovare tutti i numeri nella stringa
        const numbers = str.match(/\d+/g);

        // Se ci sono numeri, restituiscili concatenati, altrimenti restituisci una stringa vuota
        return numbers ? numbers.join('') : '';
    } else {
        return undefined; // Restituisce undefined se l'input è undefined
    }
}
