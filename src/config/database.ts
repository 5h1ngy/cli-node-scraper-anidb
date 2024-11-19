import path from 'path'
import { Sequelize } from 'sequelize-typescript';

import AnimeDetails from "@/models/AnimeDetails";
import AnimeReferences from "@/models/AnimeReferences";
import TagDetails from "@/models/TagDetails";
import TagReferences from "@/models/TagReferences";
import AssetImages from "@/models/AssetImages";
import AnimeTags from "@/models/AnimeTags";
import { logWarn, logVerbose } from "@/shared/logger";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.NODE_ENV === "development"
        ? path.resolve(__dirname, "..", "..", "data", process.env.STORAGE_FILE || 'db_dump.db')
        : path.resolve(process.cwd(), "data", process.env.STORAGE_FILE || 'db_dump.db'),
    logging: process.env.LOGGING_DB === "true" ? logVerbose : false || false,
    models: [AnimeDetails, AnimeReferences, TagDetails, TagReferences, AssetImages, AnimeTags],
});

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

export async function disconnect() {
    try {
        await sequelize.close();
        logWarn("Database close");
    } catch (error) {
        console.error("Error synchronizing database:", error);
        throw error;
    }
}
