import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkBudgets() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ngo-vms';
    await mongoose.connect(uri);

    const Project = mongoose.models.Project || mongoose.model('Project', new mongoose.Schema({ budget: Number }, { strict: false }));
    const projects = await Project.find({}, 'title budget');

    console.table(projects.map(p => ({ title: p.title, budget: p.budget })));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkBudgets();
