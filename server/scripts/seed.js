/**
 * Creates sample HR and Admin users. Run after MongoDB is up and .env is configured.
 * Usage: node scripts/seed.js (from server/)
 */
import '../loadEnv.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

const password = process.env.SEED_PASSWORD || 'ChangeMe123!';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hashed = await bcrypt.hash(password, 10);

  const users = [
    { name: 'Admin User', email: 'admin@example.com', role: 'admin' },
    { name: 'HR User', email: 'hr@example.com', role: 'hr' },
    { name: 'Line Manager', email: 'manager@example.com', role: 'manager' },
  ];

  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`Skip (exists): ${u.email}`);
      continue;
    }
    await User.create({ ...u, password: hashed });
    console.log(`Created: ${u.email} (${u.role})`);
  }

  console.log(`Default password for new users: ${password}`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
