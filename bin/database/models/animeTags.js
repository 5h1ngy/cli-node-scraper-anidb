import _ from "lodash"
import { DataTypes } from 'sequelize'

const name = 'AnimeTags'

/** @type {import('sequelize').ModelAttributes} */
const attributes = {
    _uuid: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    anime_references: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'anime_references',
            key: 'id',
        },
    },
    tag_references: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'tag_references',
            key: 'id',
        },
    },
}

/**
 * @type {import('sequelize').ModelOptions}
 */
const options = {
    tableName: 'anime_tags',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
    // indexes: [
    //     {
    //         // Definizione chiave composita
    //         unique: true,
    //         fields: ['anime_references', 'tag_references']
    //     }
    // ]
}

export default { name, attributes, options }