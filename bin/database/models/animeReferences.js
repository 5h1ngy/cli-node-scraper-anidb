import { DataTypes } from 'sequelize'

const name = 'AnimeReferences'

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
        validate: {
            isUppercase: true,
        }
    },
    details: {
        type: DataTypes.STRING,
        references: {
            model: 'anime_details',   // Il modello a cui fa riferimento
            key: 'id',                // Relazione basata su 'id', non su '_uuid'
        },
        allowNull: true,
        defaultValue: null,
    },
}

/**
 * @type {import('sequelize').ModelOptions}
 */
const options = {
    tableName: 'anime_references',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
}

export default { name, attributes, options }