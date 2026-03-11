import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';
import Project from './server/models/Project.js';

dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ngo-vms');
    const users = await User.find({});
    console.log('Users:', users.map(u => ({ _id: u._id, name: u.name, id: u.id, doc_id: u.get('id') })));
    const projects = await Project.find({});
    console.log('Projects assignedStaff:', projects.map(p => ({ title: p.title, assignedStaff: p.assignedStaff })));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkData();
