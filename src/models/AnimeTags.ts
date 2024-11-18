import { Table, Column, Model, DataType, ForeignKey, BelongsToMany } from "sequelize-typescript";
import AnimeReferences from "./AnimeReferences";
import TagReferences from "./TagReferences";
import AnimeDetails from "./AnimeDetails";
import TagDetails from "./TagDetails";

@Table({
    tableName: "anime_tags",
    timestamps: true,
})
export default class AnimeTags extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    _uuid!: string;

    @ForeignKey(() => AnimeDetails)
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    animeDetail!: string;

    @ForeignKey(() => TagDetails)
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    tagDetail!: string;
}
