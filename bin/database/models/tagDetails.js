import _ from 'lodash';
import { DataTypes } from 'sequelize'

const name = 'TagDetails'

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
        },
        // /** @param {string} value */
        // set(value) {
        //     this.setDataValue('id', _.toUpper(_.snakeCase(value)))
        // },
    }
}

/** @type {import('sequelize').ModelOptions} */
const options = {
    tableName: 'tag_details',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
}

export default { name, attributes, options }