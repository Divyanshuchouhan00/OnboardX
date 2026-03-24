import mongoose from 'mongoose';

/**
 * Connects to MongoDB using MONGODB_URI from environment (set via server/loadEnv.js + .env).
 */
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Add it to server/.env (see server/.env.example). ' +
        'Ensure the server entrypoint imports ./loadEnv.js before connecting.'
    );
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
