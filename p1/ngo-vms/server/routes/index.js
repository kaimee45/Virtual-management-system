import express from 'express';
import { getHealthStatus } from '../controllers/healthController.js';
import { getProjects, createProject, updateProject, deleteProject } from '../controllers/projectController.js';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expenseController.js';
import { getNotifications, createNotification, updateNotification } from '../controllers/notificationController.js';
import { getFunds, addDonation } from '../controllers/fundController.js';

const router = express.Router();

// Health Check Route
router.get('/health', getHealthStatus);

// Projects
router.route('/projects').get(getProjects).post(createProject);
router.route('/projects/:id').put(updateProject).delete(deleteProject);

// Users
router.route('/users').get(getUsers).post(createUser);
router.route('/users/:id').put(updateUser).delete(deleteUser);

// Tasks
router.route('/tasks').get(getTasks).post(createTask);
router.route('/tasks/:id').put(updateTask).delete(deleteTask);

// Expenses
router.route('/expenses').get(getExpenses).post(createExpense);
router.route('/expenses/:id').delete(deleteExpense);

// Notifications
router.route('/notifications').get(getNotifications).post(createNotification);
router.route('/notifications/:id').put(updateNotification);

// Funds
router.route('/funds').get(getFunds);
router.route('/funds/donations').post(addDonation);

export default router;
