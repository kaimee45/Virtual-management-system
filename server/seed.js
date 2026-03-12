import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import Expense from './models/Expense.js';
import Fund from './models/Fund.js';

import { USERS, PROJECTS, TASKS, EXPENSES, FUNDS } from '../src/data/mockData.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ngo-vms');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Expense.deleteMany({}),
      Fund.deleteMany({})
    ]);
    console.log('🧹 Cleared existing data');

    // Insert users first and build a map of old ID -> new _id
    const insertedUsers = await User.insertMany(USERS);
    const idMap = {};
    USERS.forEach((user, index) => {
      idMap[user.id] = insertedUsers[index]._id.toString();
    });

    // Remap Projects
    const remappedProjects = PROJECTS.map(p => ({
      ...p,
      assignedStaff: p.assignedStaff.map(staffId => idMap[staffId] || staffId)
    }));
    const insertedProjects = await Project.insertMany(remappedProjects);

    // Build project map as well
    PROJECTS.forEach((proj, index) => {
      idMap[proj.id] = insertedProjects[index]._id.toString();
    });

    // Remap Tasks
    const remappedTasks = TASKS.map(t => ({
      ...t,
      projectId: idMap[t.projectId] || t.projectId,
      // The UI may use names or IDs for assignedTo, map if it matches a mock ID
      assignedTo: idMap[t.assignedTo] || t.assignedTo
    }));
    await Task.insertMany(remappedTasks);

    // Remap Expenses
    const remappedExpenses = EXPENSES.map(e => ({
      ...e,
      projectId: idMap[e.projectId] || e.projectId,
      addedBy: idMap[e.addedBy] || e.addedBy
    }));
    await Expense.insertMany(remappedExpenses);

    const fund = new Fund(FUNDS);
    await fund.save();

    console.log('🌱 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
