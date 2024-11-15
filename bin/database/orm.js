import AnimeReferences from './models/animeReferences.js'
import AnimeDetails from './models/animeDetails.js'
import AnimeTags from './models/animeTags.js'
import TagReferences from './models/tagReferences.js'
import TagDetails from './models/tagDetails.js'
import AssetImages from './models/assetImages.js'
import * as logger from "../utils/logger.js"

import path from 'path'
import { Sequelize } from 'sequelize'

const DB_PATH = path.join(process.cwd(), 'data', 'db_dump.db')
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: DB_PATH,
    // logging: false
    logging: (sql) => logger.logMessage('debug', sql),
    dialectOptions: {
        foreign_keys: true  // Abilita le foreign keys in SQLite
    }
})

/**
 * /////////////////////////////////////////////////////////////////////////////////////////////////////
 * /////////// DEFINITIONS
 * /////////////////////////////////////////////////////////////////////////////////////////////////////
 */
const animeReferences = sequelize.define(AnimeReferences.name, AnimeReferences.attributes, AnimeReferences.options)
const animeDetails = sequelize.define(AnimeDetails.name, AnimeDetails.attributes, AnimeDetails.options)
const animeTags = sequelize.define(AnimeTags.name, AnimeTags.attributes, AnimeTags.options)
const tagReferences = sequelize.define(TagReferences.name, TagReferences.attributes, TagReferences.options)
const tagDetails = sequelize.define(TagDetails.name, TagDetails.attributes, TagDetails.options)
const assetImages = sequelize.define(AssetImages.name, AssetImages.attributes, AssetImages.options)

/**
 * /////////////////////////////////////////////////////////////////////////////////////////////////////
 * /////////// RELATIONSHIPS
 * /////////////////////////////////////////////////////////////////////////////////////////////////////
 */
animeDetails.hasOne(animeReferences, {
    foreignKey: 'details',     // La chiave esterna nella tabella animeReferences
    targetKey: 'id',           // La relazione basata su 'id' di animeDetails, non su _uuid
    as: 'reference',
});

animeReferences.belongsTo(animeDetails, {
    foreignKey: 'details',      // La chiave esterna nella tabella animeReferences
    targetKey: 'id',            // Target basato su 'id'
    as: 'detail',
});

assetImages.hasOne(animeDetails, {
    foreignKey: 'image',        // La chiave esterna nella tabella animeReferences
    targetKey: '_uuid',         // La relazione basata su 'id' di animeDetails, non su _uuid
    as: 'detail',
});

animeDetails.belongsTo(assetImages, {
    foreignKey: 'image',        // La chiave esterna nella tabella animeReferences
    targetKey: '_uuid',         // Target basato su 'id'
    as: 'asset',
});

tagDetails.hasOne(tagReferences, {
    foreignKey: 'details',      // La chiave esterna nella tabella animeReferences
    targetKey: 'id',            // La relazione basata su 'id' di animeDetails, non su _uuid
    as: 'reference',
});

tagReferences.belongsTo(tagDetails, {
    foreignKey: 'details',      // La chiave esterna nella tabella animeReferences
    targetKey: 'id',            // Target basato su 'id'
    as: 'detail',
});

animeReferences.belongsToMany(tagReferences, {
    through: animeTags,            // Tabella intermedia
    foreignKey: 'anime_references', // Campo che collega animeReferences
    otherKey: 'tag_references',     // Campo che collega tagReferences
    as: 'tags',                     // Nome personalizzato del metodo
});

tagReferences.belongsToMany(animeReferences, {
    through: animeTags,            // Tabella intermedia
    foreignKey: 'tag_references',  // Campo che collega tagReferences
    otherKey: 'anime_references',  // Campo che collega animeReferences
    as: 'animes',                  // Nome personalizzato del metodo
});


/**
 * /////////////////////////////////////////////////////////////////////////////////////////////////////
 * /////////// RETURN & SYNC
 * /////////////////////////////////////////////////////////////////////////////////////////////////////
 */
await sequelize.sync();

export default {
    sequelize,
    models: {
        animeReferences,
        animeDetails,
        animeTags,
        tagReferences,
        tagDetails,
        assetImages
    }
}