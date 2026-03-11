import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // The user this notification belongs to
  message: { type: String, required: true },
  type: { type: String, required: true, enum: ['info', 'success', 'warning', 'error'] },
  date: { type: String },
  read: { type: Boolean, default: false }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
