import { config } from "dotenv";
import path from "path";

/**
 * Configura l'ambiente caricando il file `.env` corretto in base a `NODE_ENV`.
 */
const envFile = `.env.${process.env.NODE_ENV || "production"}`;
config({ path: path.resolve(process.cwd(), envFile) });

console.log(`Environment loaded: ${envFile}`);
