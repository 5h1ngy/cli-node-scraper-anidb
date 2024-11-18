import { Table, Column, Model, DataType, HasOne, ForeignKey, BelongsTo, BelongsToMany } from "sequelize-typescript";
import TagReferences from "./TagReferences";
import AnimeTags from "./AnimeTags";
import AnimeDetails from "./AnimeDetails";

@Table({
    tableName: "tag_details",
    timestamps: true,
})
export default class TagDetails extends Model {

    @BelongsToMany(() => AnimeDetails, () => AnimeTags)
    animes!: AnimeDetails[]

    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    id!: string;

    @ForeignKey(() => TagReferences)
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    tagReference!: string;

    @BelongsTo(() => TagReferences, { foreignKey: "tagReference", targetKey: "id", as: "tag" })
    tag!: TagReferences

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    label!: string;
}
