import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
} from "sequelize-typescript";
// import AnimeReferences from "./AnimeReferences";
import TagReferences from "./TagReferences";

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

    // @ForeignKey(() => AnimeReferences)
    // @Column({
    //     type: DataType.STRING,
    //     allowNull: false,
    // })
    // anime_references!: string;

    @ForeignKey(() => TagReferences)
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    tag_references!: string;
}
