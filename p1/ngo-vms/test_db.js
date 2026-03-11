import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function testConnection() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ngo-vms';
    console.log(`Connecting to: ${uri}...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Successfully connected!');
    const Project = mongoose.models.Project || mongoose.model('Project', new mongoose.Schema({}, { strict: false }));
    const count = await Project.countDocuments();
    console.log(`Found ${count} projects in the database.`);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

testConnection();
