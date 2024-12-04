import { Table, Model, Column, DataType, ForeignKey, BelongsTo, BelongsToMany } from "sequelize-typescript";
import AnimeReferences from "./AnimeReferences";
import AssetImages from "./AssetImages";
import TagDetails from "./TagDetails";
import AnimeTags from "./AnimeTags";
import AnimeDescriptions from "./AnimeDescriptions";

/**
 * Modello per rappresentare i dettagli di un anime.
 */
@Table({
    tableName: "anime_details",
    timestamps: true, // Aggiunge automaticamente `createdAt` e `updatedAt`
})
export default class AnimeDetails extends Model {
    /**
     * Identificatore unico dell'anime.
     */
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    id!: string;

    /**
     * Riferimento esterno all'anime.
     */
    @ForeignKey(() => AnimeReferences)
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    animeReference!: string;

    /**
     * Collegamento al riferimento dell'anime.
     */
    @BelongsTo(() => AnimeReferences, { foreignKey: "animeReference", targetKey: "id", as: "anime" })
    anime!: AnimeReferences;

    /**
     * Riferimento all'immagine associata all'anime.
     */
    @ForeignKey(() => AssetImages)
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    assetReference!: string;

    /**
     * Collegamento all'immagine associata.
     */
    @BelongsTo(() => AssetImages, { foreignKey: "assetReference", targetKey: "id", as: "asset" })
    asset!: AssetImages;

    /**
     * Riferimento all'immagine associata all'anime.
     */
    @ForeignKey(() => AnimeDescriptions)
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    descriptionReference!: string;

    /**
     * Collegamento all'immagine associata.
     */
    @BelongsTo(() => AnimeDescriptions, { foreignKey: "descriptionReference", targetKey: "id", as: "description" })
    description!: AnimeDescriptions;

    /**
     * Titolo dell'anime.
     */
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    title!: string | null;

    /**
     * Tipo di anime (es. TV, Movie, OVA).
     */
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    type!: string | null;

    /**
     * Tipo di anime (es. TV, Movie, OVA).
     */
    @Column({
        type: DataType.NUMBER,
        allowNull: true,
    })
    episodes!: number | null;

    /**
     * Stagione di rilascio dell'anime.
     */
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    season!: string | null;

    /**
     * Anno di rilascio dell'anime.
     */
    @Column({
        type: DataType.NUMBER,
        allowNull: true,
    })
    year_start!: number | null;

    /**
     * Anno di rilascio dell'anime.
     */
    @Column({
        type: DataType.NUMBER,
        allowNull: true,
    })
    year_end!: number | null;

    /**
     * Collegamento ai tag associati all'anime.
     */
    @BelongsToMany(() => TagDetails, () => AnimeTags)
    tags!: TagDetails[];
}
