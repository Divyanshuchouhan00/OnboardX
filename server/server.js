/**
 * Load environment variables first so every other module sees `process.env`.
 * ESM runs imports in order; `./loadEnv.js` must stay the first import.
 */
import './loadEnv.js';

import app from './app.js';
import { connectDatabase } from './config/database.js';

const port = process.env.PORT || 5000;

async function start() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
