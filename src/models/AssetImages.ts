import { Table, Model, Column, DataType, BelongsTo, ForeignKey } from "sequelize-typescript";
import { HasOne } from "sequelize-typescript";

import AnimeDetails from "./AnimeDetails";

@Table({
    tableName: "asset_images",
    timestamps: true, // Crea `createdAt` e `updatedAt` automaticamente
})
export default class AssetImages extends Model {

    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4, // Genera UUID automaticamente
    })
    id!: string;

    @HasOne(() => AssetImages, { sourceKey: 'id', foreignKey: "assetReference", as: "detail" })
    detail!: AssetImages;

    @Column({
        type: DataType.TEXT, // Base64 per immagini o link
        allowNull: true,
        defaultValue: null,
    })
    origin!: string | null;

    @Column({
        type: DataType.TEXT, // Base64 per immagini o link
        allowNull: true,
        defaultValue: null,
    })
    thumbnail!: string | null;
}
