import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  projectId: { type: String, required: true },
  assignedTo: { type: String, required: true }, // User ID or Name
  status: { type: String, required: true, default: 'Pending', enum: ['Pending', 'In Progress', 'Completed'] },
  dueDate: { type: String },
  deadline: { type: String },
  priority: { type: String, default: 'Low', enum: ['High', 'Medium', 'Low'] },
  progress: { type: Number, default: 0 },
  weight: { type: Number },
  remarks: { type: String },
  dailyLogs: [{
    date: { type: String },
    description: { type: String }
  }]
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
export default Task;
