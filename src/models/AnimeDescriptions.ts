import { Table, Model, Column, DataType, HasOne } from "sequelize-typescript";
import AnimeDetails from "./AnimeDetails";
import zlib from "zlib";

/**
 * Modello per rappresentare le immagini associate agli anime.
 */
@Table({
    tableName: "anime_descriptions", // Nome della tabella
    timestamps: true, // Aggiunge automaticamente `createdAt` e `updatedAt`
})
export default class AnimeDescriptions extends Model {
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
    @HasOne(() => AnimeDetails, { sourceKey: "id", foreignKey: "descriptionReference", as: "detail" })
    detail!: AnimeDetails;

    /**
     * URL di origine dell'immagine o il suo identificativo.
     */
    @Column({
        type: DataType.BLOB, // Salviamo i dati compressi come binari
        allowNull: true,
        defaultValue: null,
        get() {
            // Decomprime i dati quando vengono letti
            const compressedRaw = this.getDataValue("raw");
            if (compressedRaw) {
                return zlib.gunzipSync(Buffer.from(compressedRaw)).toString("utf-8");
            }
            return null;
        },
        set(value: string | null) {
            // Comprime i dati prima di salvarli
            if (value) {
                this.setDataValue("raw", zlib.gzipSync(Buffer.from(value, "utf-8")));
            } else {
                this.setDataValue("raw", null);
            }
        },
    })
    raw!: string | null;
}
