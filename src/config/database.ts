import path from 'path';
import { Sequelize } from 'sequelize-typescript';

import AnimeDetails from "@/models/AnimeDetails";
import AnimeDescriptions from "@/models/AnimeDescriptions";
import AnimeReferences from "@/models/AnimeReferences";
import TagDetails from "@/models/TagDetails";
import TagReferences from "@/models/TagReferences";
import AssetImages from "@/models/AssetImages";
import AnimeTags from "@/models/AnimeTags";
import { logWarn, logVerbose } from "@/shared/logger";

/**
 * Configura l'istanza Sequelize per la gestione del database SQLite.
 */
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.NODE_ENV === "development"
        ? path.resolve(__dirname, "..", "..", "data", process.env.STORAGE_FILE || 'db_dump.db')
        : path.resolve(process.cwd(), "data", process.env.STORAGE_FILE || 'db_dump.db'),
    logging: process.env.LOGGING_DB === "true" ? logVerbose : false || false,
    models: [AnimeDetails, AnimeDescriptions, AnimeReferences, TagDetails, TagReferences, AssetImages, AnimeTags],
});

/**
 * Funzione per connettersi al database.
 * @throws Lancia un errore se la connessione al database fallisce.
 */
export async function connect() {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
        await sequelize.sync();
        logWarn("Database synchronized successfully!");
    } catch (error) {
        console.error("Error synchronizing database:", error);
        throw error;
    }
}

/**
 * Funzione per disconnettersi dal database.
 * @throws Lancia un errore se la disconnessione dal database fallisce.
 */
export async function disconnect() {
    try {
        await sequelize.close();
        logWarn("Database close");
    } catch (error) {
        console.error("Error synchronizing database:", error);
        throw error;
    }
}
