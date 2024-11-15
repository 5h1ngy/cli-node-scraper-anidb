import winston from 'winston';
import 'winston-daily-rotate-file';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

import { LOG_DEFAULT_LEVEL as LOG_LEVEL } from "../../CONFIG.js"

/**
 * Crea una cartella se non esiste già.
 * Questo viene usato per la cartella dei file di log.
 */
const logDirectory = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

/**
 * Configura la rotazione dei file di log, creando un file per ogni giorno e comprimendo i log vecchi.
 */
const transport = new winston.transports.DailyRotateFile({
    filename: `${logDirectory}/%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',  // Mantiene i log per 14 giorni
});

/**
 * Definisce il formato dei log, includendo timestamp e livello di log.
 */
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});

/**
 * Crea il logger utilizzando Winston, con output su file e console.
 * Gestisce eccezioni non catturate e promesse rifiutate.
 */
const logger = winston.createLogger({
    // [LEVELS] emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7
    level: LOG_LEVEL,  // Livello di log predefinito
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),  // Aggiunge timestamp
        logFormat  // Applica il formato personalizzato
    ),
    transports: [
        // Transport per il file con rotazione giornaliera
        transport,

        // Transport per la console (stampa su schermo)
        new winston.transports.Console({
            format: winston.format.combine(
                process.env.NODE_ENV === 'development' ? winston.format.uncolorize() : winston.format.colorize(),
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),  // Aggiunge timestamp
                logFormat  // Applica il formato personalizzato
            )
        }),
    ],
    exceptionHandlers: [
        // Gestione delle eccezioni non catturate con scrittura su file
        new winston.transports.File({ filename: path.join(logDirectory, 'exceptions.log') })
    ],
    rejectionHandlers: [
        // Gestione delle promesse rifiutate non catturate con scrittura su file
        new winston.transports.File({ filename: path.join(logDirectory, 'rejections.log') })
    ]
});


/**
 * Configura il logging delle richieste HTTP in un'app Express utilizzando Morgan.
 *
 * @param {object} app - L'istanza dell'applicazione Express.
 */
export function setupHttpLogging(app) {
    app.use(morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim())
        }
    }));
}

/**
 * Registra un messaggio con un livello specificato.
 *
 * @param {string} level - Il livello di log (es: 'info', 'error', 'warn').
 * @param {string} message - Il messaggio da loggare.
 */
export function logMessage(level, message) {
    logger.log({ level, message });
}

/**
 * Registra un messaggio di tipo 'error'.
 *
 * @param {string} message - Il messaggio di errore da loggare.
 */
export function logError(message) {
    logger.error(message);
}

/**
 * Registra un messaggio di tipo 'warn' (avviso).
 *
 * @param {string} message - Il messaggio di avviso da loggare.
 */
export function logWarn(message) {
    logger.warn(message);
}

/**
 * Registra un messaggio di tipo 'info'.
 *
 * @param {string} message - Il messaggio informativo da loggare.
 */
export function logInfo(message) {
    logger.info(message);
}

/**
 * Registra i dettagli di una richiesta HTTP.
 *
 * @param {object} req - L'oggetto richiesta HTTP (es: da Express).
 */
export function logHttpRequest(req) {
    const { method, url, headers, body } = req;
    const logEntry = `HTTP Request - Method: ${method}, URL: ${url}, Headers: ${JSON.stringify(headers)}, Body: ${JSON.stringify(body)}`;
    logger.info(logEntry);
}

/**
 * Gestisce le eccezioni globali non catturate.
 */
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    logger.error(err.stack);
    process.exit(1);  // Termina il processo in caso di errore non catturato
});

/**
 * Gestisce le promesse rifiutate senza gestione.
 */
process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection: ${reason}`);
});
