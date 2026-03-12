import mongoose from 'mongoose';

async function wipeLogs() {
  try {
    await mongoose.connect('mongodb+srv://24pala_db_user:ngovmspass%40123@ngocluster.pwg9tzj.mongodb.net/ngo-vms?retryWrites=true&w=majority&appName=ngocluster');
    console.log('Connected to actual MongoDB');

    const Task = mongoose.models.Task || mongoose.model('Task', new mongoose.Schema({}, { strict: false }));

    const result = await Task.updateMany(
      {},
      { $set: { dailyLogs: [], remarks: '' } }
    );

    console.log(`Successfully wiped logs and remarks from ${result.modifiedCount} tasks.`);

  } catch (err) {
    console.error('Error wiping logs:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

wipeLogs();
