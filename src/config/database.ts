import path from 'path'
import { Sequelize } from 'sequelize-typescript';

import { Anime } from "@/models";
import { AssetImages } from "@/models";
// import { TagDetails } from "@/models";
// import { TagReferences } from "@/models";
// import { AnimeTags } from "@/models";
import { logWarn } from "@/shared/logger";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '..', '..', 'data', process.env.DB_STORAGE || ''),
    logging: process.env.DB_LOGGING === "true" ? logWarn : false || true,
    models: [Anime, AssetImages, 
        // TagDetails, TagReferences, AnimeTags
    ],
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
