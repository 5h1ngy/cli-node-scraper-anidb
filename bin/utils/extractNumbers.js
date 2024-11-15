/**
 * 
 * @param {string} str 
 * @returns 
 */
export default function extractNumbers(str = undefined) {
    if (str) {
        // Usa una regex per trovare tutti i numeri nella stringa
        const numbers = str.match(/\d+/g)

        // Se ci sono numeri, restituiscili convertiti in numeri, altrimenti restituisci un array vuoto
        return numbers ? numbers.join('') : ''
    } else {
        return undefined
    }
}