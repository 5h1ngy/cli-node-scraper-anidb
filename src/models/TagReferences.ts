import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne } from "sequelize-typescript";
import TagDetails from "./TagDetails";

@Table({
    tableName: "tag_references",
    timestamps: true,
})
export default class TagReferences extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    tagId!: string;

    @HasOne(() => TagDetails, { sourceKey: 'id', foreignKey: "tagReference", as: "detail" })
    detail!: TagDetails;
}
