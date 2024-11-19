import {
    Table,
    Column,
    Model,
    DataType,
    HasOne,
} from "sequelize-typescript";
import TagDetails from "./TagDetails";

/**
 * Modello per rappresentare i riferimenti ai tag.
 */
@Table({
    tableName: "tag_references", // Nome della tabella
    timestamps: true, // Aggiunge automaticamente `createdAt` e `updatedAt`
})
export default class TagReferences extends Model {
    /**
     * Identificatore unico del riferimento del tag.
     */
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    id!: string;

    /**
     * Identificativo unico del tag esterno.
     */
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    tagId!: string;

    /**
     * Dettaglio del tag associato.
     */
    @HasOne(() => TagDetails, { sourceKey: "id", foreignKey: "tagReference", as: "detail" })
    detail!: TagDetails;
}
