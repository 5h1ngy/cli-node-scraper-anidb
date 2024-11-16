import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    HasOne,
} from "sequelize-typescript";
import { AssetImages } from "./AssetImages";

@Table({
    tableName: "anime",
    timestamps: true,
})
export class Anime extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    _uuid!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    reference!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        unique: true,
    })
    name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        defaultValue: null,
    })
    type!: string | null;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        defaultValue: null,
    })
    year!: string | null;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        defaultValue: null,
    })
    season!: string | null;

    @ForeignKey(() => AssetImages)
    @Column({
        type: DataType.UUID,
        allowNull: true,
        defaultValue: null,
    })
    image!: string | null;

    @BelongsTo(() => AssetImages, { as: "assetImage" })
    assetImage!: AssetImages;
}
