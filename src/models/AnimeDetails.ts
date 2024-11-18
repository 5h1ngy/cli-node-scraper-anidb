import { Table, Model, Column, DataType, HasOne, BelongsTo, Unique, ForeignKey, BelongsToMany } from "sequelize-typescript";
import AnimeReferences from "./AnimeReferences";
import AssetImages from "./AssetImages";
import TagDetails from "./TagDetails";
import AnimeTags from "./AnimeTags";

@Table({
    tableName: "anime_details",
    timestamps: true, // Crea `createdAt` e `updatedAt` automaticamente
})
export default class AnimeDetails extends Model {

    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4, // Genera UUID automaticamente
    })
    id!: string;

    @ForeignKey(() => AnimeDetails)
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true, // Deve essere unico per essere referenziato
    })
    animeReference!: string; // Identificatore unico dell'anime

    @BelongsTo(() => AnimeReferences, { foreignKey: "animeReference", targetKey: "id", as: "anime" })
    anime!: AnimeReferences

    @ForeignKey(() => AssetImages)
    @Column({
        type: DataType.STRING,
        allowNull: true,
        unique: true, // Deve essere unico per essere referenziato
    })
    assetReference!: string;

    @BelongsTo(() => AssetImages, { foreignKey: "assetReference", targetKey: "id", as: "asset" })
    asset!: AssetImages

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    title!: string | null;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    type!: string | null;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    year!: string | null;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    season!: string | null;


    @BelongsToMany(() => TagDetails, () => AnimeTags)
    tags!: TagDetails[];
}
