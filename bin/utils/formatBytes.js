export default function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024)) // Determina l'unità più appropriata
    const formattedSize = (bytes / Math.pow(1024, i)).toFixed(2) // Calcola il valore con 2 decimali

    return `${formattedSize} ${sizes[i]}` // Restituisce la stringa formattata con l'unità corretta
}