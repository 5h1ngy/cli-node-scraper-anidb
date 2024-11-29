import { Table, Column, Model, DataType, PrimaryKey, HasOne } from "sequelize-typescript";
import AnimeDetails from "./AnimeDetails";

/**
 * Modello per rappresentare i riferimenti agli anime.
 */
@Table({
    tableName: "anime_references", // Nome della tabella
    timestamps: true, // Aggiunge automaticamente `createdAt` e `updatedAt`
})
export default class AnimeReferences extends Model {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4, // Genera automaticamente un UUID
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false, // Campo obbligatorio
    })
    animeId!: string; // Identificatore unico dell'anime

    @HasOne(() => AnimeDetails, { sourceKey: "id", foreignKey: "animeReference", as: "detail" })
    detail!: AnimeDetails;
}
