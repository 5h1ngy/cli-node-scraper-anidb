import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
} from "sequelize-typescript";
import { TagDetails } from "./TagDetails";

@Table({
    tableName: "tag_references",
    timestamps: true,
})
export class TagReferences extends Model {
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

    @ForeignKey(() => TagDetails)
    @Column({
        type: DataType.STRING,
        allowNull: true,
        defaultValue: null,
    })
    details!: string | null;

    @BelongsTo(() => TagDetails, { as: "detail" })
    detail!: TagDetails;
}
