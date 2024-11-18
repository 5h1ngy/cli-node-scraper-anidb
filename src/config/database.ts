import path from 'path'
import { Sequelize } from 'sequelize-typescript';

import AnimeDetails from "@/models/AnimeDetails";
import AnimeReferences from "@/models/AnimeReferences";
import TagDetails from "@/models/TagDetails";
import TagReferences from "@/models/TagReferences";
import AssetImages from "@/models/AssetImages";
import AnimeTags from "@/models/AnimeTags";
import { logWarn } from "@/shared/logger";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '..', '..', 'data', process.env.DB_STORAGE || ''),
    logging: process.env.DB_LOGGING === "true" ? logWarn : false || false,
    models: [AnimeDetails, AnimeReferences, TagDetails, TagReferences, AssetImages, AnimeTags],
});

export async function connect() {
    try {
        await sequelize.sync({ alter: true });
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
