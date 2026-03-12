import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function wipeLogs() {
  try {
    // Read EXACTLY from process.env like the server does, so we hit the exact same database.
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ngo-vms';
    await mongoose.connect(uri);
    console.log(`Connected to: ${uri}`);

    const Task = mongoose.models.Task || mongoose.model('Task', new mongoose.Schema({}, { strict: false }));

    const result = await Task.updateMany(
      {},
      { $set: { dailyLogs: [], remarks: '' } }
    );

    console.log(`Successfully rewiped logs from ${result.modifiedCount} tasks in the correct database!`);
  } catch (err) {
    console.error('Error wiping:', err);
  } finally {
    await mongoose.disconnect();
  }
}

wipeLogs();
