import _ from "lodash"
import { DataTypes } from 'sequelize'

const name = 'AssetImages'

/** @type {import('sequelize').ModelAttributes} */
const attributes = {
    _uuid: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    base64: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        unique: false,
    }
}

/**
 * @type {import('sequelize').ModelOptions}
 */
const options = {
    tableName: 'asset_images',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
}

export default { name, attributes, options }