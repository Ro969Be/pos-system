import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from '../db.js';
import User from '../src/models/User.js';

(async () => {
  await connectDB(process.env.MONGO_URI);
  console.log('syncing indexes for User...');
  const dropped = await User.syncIndexes();
  console.log('done. dropped:', dropped);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
