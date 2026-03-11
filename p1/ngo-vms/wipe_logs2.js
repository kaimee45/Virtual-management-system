import mongoose from 'mongoose';

async function wipeLogs() {
  try {
    await mongoose.connect('mongodb+srv://24pala_db_user:ngovmspass%40123@ngocluster.pwg9tzj.mongodb.net/ngo-vms?retryWrites=true&w=majority&appName=ngocluster');
    const Task = mongoose.models.Task || mongoose.model('Task', new mongoose.Schema({}, { strict: false }));
    const result = await Task.updateMany({}, { $set: { dailyLogs: [], remarks: '' } });
    console.log(`Successfully rewiped logs from ${result.modifiedCount} tasks.`);
  } catch (err) {
    console.error('Error wiping:', err);
  } finally {
    await mongoose.disconnect();
  }
}

wipeLogs();
