import winston from "winston";
import "winston-daily-rotate-file";
import morgan, { StreamOptions } from "morgan";
import path from "path";
import fs from "fs";
import { TransformableInfo } from "logform"; // Importa TransformableInfo da logform

// Crea la cartella dei log se non esiste

const logDirectory = process.env.NODE_ENV === "development"
    ? path.resolve(__dirname, "..", "..", "logs")
    : path.resolve(process.cwd(), "logs");

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

// Configura la rotazione giornaliera dei file di log
const transport = new winston.transports.DailyRotateFile({
    filename: `${logDirectory}/%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d", // Mantiene i log per 14 giorni
});

// Aggiungi colori personalizzati ai livelli di log
winston.addColors({
    error: "bold red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    verbose: "cyan",
    debug: "blue",
    silly: "magenta",
});

// Formato personalizzato per i log
const logFormat = winston.format.printf((info: TransformableInfo) => {
    const { level, message, timestamp } = info;
    return `[${timestamp}] ${level}: ${message}`;
});

// Crea il logger principale
const logger = winston.createLogger({
    // LEVELS { error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6 },
    level: process.env.LOG_DEFAULT_LEVEL || "info", // Livello di log predefinito con fallback
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Timestamp nei log
        process.env.NODE_ENV === "development"
            ? winston.format.colorize({ all: true }) // Aggiunge i colori ai log in console
            : winston.format.uncolorize(), // Rimuove i colori per i file
        logFormat
    ),
    transports: [
        transport, // Scrive nei file con rotazione
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                logFormat
            ),
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logDirectory, "exceptions.log"),
        }),
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logDirectory, "rejections.log"),
        }),
    ],
});

// Stream per Morgan
const stream: StreamOptions = {
    write: (message: string) => logger.http(message.trim()),
};

/**
 * Configura il logging HTTP con Morgan
 */
export function setupHttpLogging(app: any): void {
    app.use(
        morgan("combined", {
            stream,
        })
    );
}

/**
 * Registra un messaggio generico con un livello specifico.
 */
export function logMessage(level: string, message: string): void {
    logger.log({ level, message });
}

/**
 * Registra un messaggio di errore.
 */
export function logError(message: string): void {
    logger.error(message);
}

/**
 * Registra un messaggio di avviso.
 */
export function logWarn(message: string): void {
    logger.warn(message);
}

/**
 * Registra un messaggio informativo.
 */
export function logInfo(message: string): void {
    logger.info(message);
}

export function logVerbose(message: string): void {
    logger.verbose(message);
}

/**
 * Registra una richiesta HTTP.
 */
export function logHttpRequest(req: any): void {
    const { method, url, headers, body } = req;
    const logEntry = `HTTP Request - Method: ${method}, URL: ${url}, Headers: ${JSON.stringify(
        headers
    )}, Body: ${JSON.stringify(body)}`;
    logger.http(logEntry);
}

// Gestione delle eccezioni non catturate
process.on("uncaughtException", (err: Error) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    logger.error(err.stack || "");
    process.exit(1);
});

// Gestione delle promesse rifiutate
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
    logger.error(`Unhandled Rejection: ${reason}`);
});
