import { config } from "dotenv";
import path from "path";
import { cleanEnv, str } from 'envalid';

// Configura il file .env corretto in base a NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
config({ path: path.resolve(process.cwd(), envFile) });

console.log(`Environment loaded: ${envFile}`);

// const envVars = cleanEnv(process.env, {
//     DB_HOST: str(),
//     DB_USER: str(),
//     DB_PASS: str(),
//     API_KEY: str(),
//     // # Configurazione ambiente
//     // NODE_ENV=development

//     // # Logger
//     // LOG_DEFAULT_LEVEL=info

//     // # Configurazione del database
//     // DB_STORAGE=db_dump.db
//     // DB_LOGGING=false

//     // # Configurazione server
//     // SERVER_PORT=3000
//     // Altre variabili...
//   });
// Non serve esportare nulla, `process.env` è globale
