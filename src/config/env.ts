import { config } from "dotenv";
import path from "path";

// Configura il file .env corretto in base a NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
config({ path: path.resolve(process.cwd(), envFile) });

console.log(`Environment loaded: ${envFile}`);

// Non serve esportare nulla, `process.env` è globale
