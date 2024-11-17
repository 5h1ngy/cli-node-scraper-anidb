import { Table, Column, Model, DataType, HasOne } from "sequelize-typescript";
import Anime from "./Anime";

@Table({
    tableName: "asset_images",
    timestamps: true,
})
export default class AssetImages extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    _uuid!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        defaultValue: null,
    })
    base64!: string | null;

    @HasOne(() => Anime, { foreignKey: "image", as: "detail" })
    detail!: Anime;
}
