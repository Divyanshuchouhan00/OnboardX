import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Load `.env` from the `server/` directory (not `process.cwd()`), so the API
 * works when started from the repo root or from `server/`.
 * Optional fallback: project root `.env` if `server/.env` is missing.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEnvPath = path.join(__dirname, '.env');
const rootEnvPath = path.join(__dirname, '..', '.env');

let result = dotenv.config({ path: serverEnvPath });

if (result.error && fs.existsSync(rootEnvPath)) {
  result = dotenv.config({ path: rootEnvPath });
}

if (result.error && !fs.existsSync(serverEnvPath) && !fs.existsSync(rootEnvPath)) {
  console.warn(
    `[env] No .env file found at ${serverEnvPath} (or ${rootEnvPath}). ` +
      'Copy server/.env.example to server/.env and set MONGODB_URI.'
  );
}

console.log('Mongo URI:', process.env.MONGODB_URI);
