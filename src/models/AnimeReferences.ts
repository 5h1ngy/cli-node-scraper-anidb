import { Table, Column, Model, DataType, Unique, PrimaryKey, ForeignKey, BelongsTo, HasOne } from "sequelize-typescript";
import AnimeDetails from "./AnimeDetails";

@Table({
    tableName: "anime_references",
    timestamps: true, // Crea `createdAt` e `updatedAt` automaticamente
})
export default class AnimeReferences extends Model {

    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4, // Genera UUID automaticamente
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    animeId!: string; // Contiene l'id dell'anime e funge da chiave esterna

    @HasOne(() => AnimeDetails, { sourceKey:'id', foreignKey: "animeReference", as: "detail" })
    detail!: AnimeDetails;
}
