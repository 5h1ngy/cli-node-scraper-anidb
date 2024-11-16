import path from "path";
import moduleAlias from "module-alias";

// Determina il percorso di base in base all'ambiente
const baseDir = process.env.NODE_ENV === "production" ? "dist" : "src";
const rootPath = path.resolve(__dirname, `../../${baseDir}`);

moduleAlias.addAliases({
    "@": rootPath,
});
