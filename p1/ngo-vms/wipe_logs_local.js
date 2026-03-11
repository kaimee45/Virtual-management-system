import mongoose from 'mongoose';

async function wipeLogs() {
  try {
    const uri = 'mongodb://localhost:27017/ngo-vms';
    await mongoose.connect(uri);
    console.log('Connected to fallback localhost MongoDB');

    const Task = mongoose.models.Task || mongoose.model('Task', new mongoose.Schema({}, { strict: false }));

    const result = await Task.updateMany(
      {},
      { $set: { dailyLogs: [], remarks: '' } }
    );

    console.log(`Successfully rewiped logs from ${result.modifiedCount} tasks in localhost DB.`);
  } catch (err) {
    console.error('Error wiping:', err);
  } finally {
    await mongoose.disconnect();
  }
}

wipeLogs();
