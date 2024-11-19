import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    BelongsToMany,
} from "sequelize-typescript";
import TagReferences from "./TagReferences";
import AnimeTags from "./AnimeTags";
import AnimeDetails from "./AnimeDetails";

/**
 * Modello per rappresentare i dettagli dei tag associati agli anime.
 */
@Table({
    tableName: "tag_details", // Nome della tabella
    timestamps: true, // Aggiunge automaticamente `createdAt` e `updatedAt`
})
export default class TagDetails extends Model {
    /**
     * Identificatore unico del dettaglio del tag.
     */
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    id!: string;

    /**
     * Riferimento al tag esterno.
     */
    @ForeignKey(() => TagReferences)
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    tagReference!: string;

    /**
     * Collegamento al riferimento del tag.
     */
    @BelongsTo(() => TagReferences, { foreignKey: "tagReference", targetKey: "id", as: "tag" })
    tag!: TagReferences;

    /**
     * Etichetta del tag (es. genere, attributo).
     */
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    label!: string;

    /**
     * Collegamento agli anime associati a questo tag.
     */
    @BelongsToMany(() => AnimeDetails, () => AnimeTags)
    animes!: AnimeDetails[];
}
