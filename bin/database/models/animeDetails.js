import _ from "lodash"
import { DataTypes } from 'sequelize'

const name = 'AnimeDetails'

/** @type {import('sequelize').ModelAttributes} */
const attributes = {
    _uuid: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        unique: false,
        // TODO, tmp
        // validate: {
        //     isUppercase: true,
        // },
        // /** @param {string} value */
        // set(value) {
        //     this.setDataValue('type', _.toUpper(_.snakeCase(value)))
        // },
    },
    year: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        unique: false,
    },
    season: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        unique: false,
    },
    image: {
        type: DataTypes.UUID,
        references: {
            model: 'asset_images',
            key: '_uuid',
        },
        allowNull: true,
        defaultValue: null,
    },
}

/**
 * @type {import('sequelize').ModelOptions}
 */
const options = {
    tableName: 'anime_details',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
}

export default { name, attributes, options }