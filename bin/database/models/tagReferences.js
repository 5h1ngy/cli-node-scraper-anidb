import { DataTypes } from 'sequelize'

const name = 'TagReferences'

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
    details: {
        type: DataTypes.STRING,
        references: {
            model: 'tag_details',
            key: 'id',
        },
        allowNull: true,
        defaultValue: null,
    },
}

/** @type {import('sequelize').ModelOptions} */
const options = {
    tableName: 'tag_references',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
}

export default { name, attributes, options }