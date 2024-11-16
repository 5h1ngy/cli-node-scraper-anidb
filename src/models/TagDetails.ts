import { Table, Column, Model, DataType, HasOne } from "sequelize-typescript";
import { TagReferences } from "./TagReferences";

@Table({
    tableName: "tag_details",
    timestamps: true,
})
export class TagDetails extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    _uuid!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    id!: string;

    @HasOne(() => TagReferences, { foreignKey: "details", as: "reference" })
    reference!: TagReferences;
}
