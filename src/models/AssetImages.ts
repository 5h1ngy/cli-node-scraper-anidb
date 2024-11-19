import {
    Table,
    Model,
    Column,
    DataType,
    HasOne,
} from "sequelize-typescript";

/**
 * Modello per rappresentare le immagini associate agli anime.
 */
@Table({
    tableName: "asset_images", // Nome della tabella
    timestamps: true, // Aggiunge automaticamente `createdAt` e `updatedAt`
})
export default class AssetImages extends Model {
    /**
     * Identificatore unico dell'immagine.
     */
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    id!: string;

    /**
     * Riferimento all'asset associato.
     */
    @HasOne(() => AssetImages, { sourceKey: "id", foreignKey: "assetReference", as: "detail" })
    detail!: AssetImages;

    /**
     * URL di origine dell'immagine o il suo identificativo.
     */
    @Column({
        type: DataType.TEXT, // Base64 per immagini o link
        allowNull: true,
        defaultValue: null,
    })
    origin!: string | null;

    /**
     * Miniatura dell'immagine, in formato base64 o URL.
     */
    @Column({
        type: DataType.TEXT, // Base64 per immagini o link
        allowNull: true,
        defaultValue: null,
    })
    thumbnail!: string | null;
}
