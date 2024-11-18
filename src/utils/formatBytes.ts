/**
 * Converte un valore in byte in una stringa leggibile con unità appropriate (Bytes, KB, MB, etc.).
 * @param bytes Il numero di byte da formattare.
 * @returns Una stringa formattata che rappresenta il valore in una unità leggibile (es. "1.23 MB").
 */
export default function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes"; // Gestisce il caso in cui il valore sia 0.

    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]; // Unità di misura.
    const i = Math.floor(Math.log(bytes) / Math.log(1024)); // Determina l'unità più appropriata.
    const formattedSize = (bytes / Math.pow(1024, i)).toFixed(2); // Calcola il valore con 2 decimali.

    return `${formattedSize} ${sizes[i]}`; // Restituisce la stringa formattata.
}
