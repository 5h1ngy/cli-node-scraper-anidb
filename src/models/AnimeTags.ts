import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
} from "sequelize-typescript";
import AnimeDetails from "./AnimeDetails";
import TagDetails from "./TagDetails";

/**
 * Modello per rappresentare l'associazione tra anime e tag.
 */
@Table({
    tableName: "anime_tags",
    timestamps: true, // Aggiunge automaticamente `createdAt` e `updatedAt`
})
export default class AnimeTags extends Model {
    /**
     * Identificatore unico dell'associazione.
     */
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    _uuid!: string;

    /**
     * Riferimento al dettaglio dell'anime.
     */
    @ForeignKey(() => AnimeDetails)
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    animeDetail!: string;

    /**
     * Riferimento al dettaglio del tag.
     */
    @ForeignKey(() => TagDetails)
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    tagDetail!: string;
}
