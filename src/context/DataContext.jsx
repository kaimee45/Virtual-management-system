import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { USERS as initialUsers } from '../data/mockData';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [funds, setFunds] = useState({ totalRaised: 0, target: 200000, recentDonations: [] });
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all initial data from MongoDB API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          projectsRes,
          fundsRes,
          tasksRes,
          expensesRes,
          usersRes,
          notifsRes
        ] = await Promise.all([
          axios.get('/api/projects'),
          axios.get('/api/funds'),
          axios.get('/api/tasks'),
          axios.get('/api/expenses'),
          axios.get('/api/users'),
          axios.get('/api/notifications')
        ]);

        setProjects(projectsRes.data);
        setFunds(fundsRes.data || { totalRaised: 0, target: 200000, recentDonations: [] });
        setTasks(tasksRes.data);
        setExpenses(expensesRes.data);
        setUsers(usersRes.data);
        setNotifications(notifsRes.data);
      } catch (error) {
        console.error('Error fetching data from API:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate project progress
  const calculateProjectProgress = async (projectId, currentTasks) => {
    const projectTasks = currentTasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return;

    const hasWeights = projectTasks.some(t => t.weight !== undefined && t.weight !== null);
    let avgProgress = 0;

    if (hasWeights) {
      let totalWeight = 0;
      let weightedSum = 0;
      let unweightedCount = 0;

      projectTasks.forEach(t => {
        const weight = t.weight ? parseFloat(t.weight) : 0;
        if (weight > 0) {
          totalWeight += weight;
          weightedSum += (t.progress || 0) * (weight / 100);
        } else {
          unweightedCount++;
        }
      });

      const remainingWeight = Math.max(0, 100 - totalWeight);
      const weightPerUnweighted = unweightedCount > 0 ? remainingWeight / unweightedCount : 0;

      if (unweightedCount > 0 && weightPerUnweighted > 0) {
        projectTasks.forEach(t => {
          const weight = t.weight ? parseFloat(t.weight) : 0;
          if (weight <= 0) {
            weightedSum += (t.progress || 0) * (weightPerUnweighted / 100);
          }
        });
      }

      avgProgress = Math.round(weightedSum);
      avgProgress = Math.min(100, Math.max(0, avgProgress));

    } else {
      const totalProgress = projectTasks.reduce((sum, t) => sum + (t.progress || 0), 0);
      avgProgress = Math.round(totalProgress / projectTasks.length);
    }

    const project = projects.find(p => p._id === projectId || p.id === projectId);
    if (!project) return;

    let newStatus = project.status;
    if (avgProgress === 100) {
      newStatus = 'Completed';
    } else if (project.status === 'Completed' && avgProgress < 100) {
      newStatus = 'In Progress';
    }

    // Persist to backend and update state
    try {
      const dbId = project._id || project.id;
      const res = await axios.put(`/api/projects/${dbId}`, { progress: avgProgress, status: newStatus });
      setProjects(prev => prev.map(p => (p._id === dbId || p.id === dbId) ? res.data : p));
    } catch (error) {
      console.error('Failed to update project progress:', error);
    }
  };

  const addProject = async (project) => {
    try {
      const res = await axios.post('/api/projects', project);
      setProjects(prev => [...prev, res.data]);
    } catch (error) {
      console.error('Failed to add project:', error);
    }
  };

  const updateProject = async (id, updates) => {
    try {
      const dbId = projects.find(p => p.id === id || p._id === id)?._id || id;
      const res = await axios.put(`/api/projects/${dbId}`, updates);
      setProjects(prev => prev.map(p => (p._id === dbId || p.id === dbId) ? res.data : p));
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const deleteProject = async (id) => {
    try {
      const dbId = projects.find(p => p.id === id || p._id === id)?._id || id;
      await axios.delete(`/api/projects/${dbId}`);
      setProjects(prev => prev.filter(p => p._id !== dbId && p.id !== dbId));
      setTasks(prev => prev.filter(t => t.projectId !== id && t.projectId !== dbId));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const addTask = async (task) => {
    const assignees = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
    const individualWeight = task.weight ? (parseFloat(task.weight) / assignees.length).toFixed(2) : undefined;

    try {
      const promises = assignees.map(assignee =>
        axios.post('/api/tasks', { ...task, assignedTo: assignee, weight: individualWeight, status: 'Pending', progress: 0, dailyLogs: [] })
      );
      const responses = await Promise.all(promises);
      const newTasks = responses.map(r => r.data);

      setTasks(prev => {
        const updatedTasks = [...prev, ...newTasks];
        setTimeout(() => calculateProjectProgress(task.projectId, updatedTasks), 0);
        return updatedTasks;
      });

      // Notifications
      assignees.forEach(assignee => {
        const userObj = users.find(u => u.name === assignee);
        const userId = userObj ? (userObj._id || userObj.id) : assignee;
        addNotification({ userId, message: `New task assigned: ${task.title}`, type: 'info', date: new Date().toISOString().split('T')[0] });
      });

    } catch (error) {
      console.error('Failed to add tasks:', error);
    }
  };

  const updateTask = async (id, updates) => {
    const task = tasks.find(t => t.id === id || t._id === id);
    if (!task) return;
    const dbId = task._id || id;

    let autoUpdates = {};
    const project = projects.find(p => p.id === task.projectId || p._id === task.projectId);
    const assignedStaffIds = project ? project.assignedStaff : [];
    const staffToNotify = users.filter(u => assignedStaffIds.includes(u._id || u.id) || assignedStaffIds.includes(u.name));

    if (updates.progress === 100 && task.status !== 'Completed') {
      autoUpdates.status = 'Completed';
      staffToNotify.forEach(u => {
        addNotification({ userId: u._id || u.id, message: `Task "${task.title}" has been automatically marked as Completed (100%)`, type: 'success', date: new Date().toISOString().split('T')[0] });
      });
    } else if (updates.progress !== undefined && updates.progress < 100 && task.status === 'Completed') {
      autoUpdates.status = 'Pending';
    }

    if (updates.status === 'Completed' || autoUpdates.status === 'Completed') {
      staffToNotify.forEach(u => {
        addNotification({ userId: u._id || u.id, message: `Task "${task.title}" has been marked as Completed by ${task.assignedTo}`, type: 'success', date: new Date().toISOString().split('T')[0] });
      });
    }

    if (updates.newLog) {
      autoUpdates.dailyLogs = [...(task.dailyLogs || []), updates.newLog];
      delete updates.newLog; // Remove before sending to API 

      staffToNotify.forEach(u => {
        addNotification({ userId: u._id || u.id, message: `Volunteer ${task.assignedTo} logged new activity for task "${task.title}"`, type: 'info', date: new Date().toISOString().split('T')[0] });
      });
    } else if (updates.remarks && updates.remarks !== task.remarks) {
      // Fallback for legacy updates that might only send remarks
      staffToNotify.forEach(u => {
        addNotification({ userId: u._id || u.id, message: `Volunteer ${task.assignedTo} submitted work details for task "${task.title}"`, type: 'info', date: new Date().toISOString().split('T')[0] });
      });
    }

    const finalUpdates = { ...updates, ...autoUpdates };

    try {
      const res = await axios.put(`/api/tasks/${dbId}`, finalUpdates);
      setTasks(prev => {
        const updatedTasks = prev.map(t => (t._id === dbId || t.id === dbId) ? res.data : t);
        if (task.projectId) {
          setTimeout(() => calculateProjectProgress(task.projectId, updatedTasks), 0);
        }
        return updatedTasks;
      });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      const task = tasks.find(t => t.id === id || t._id === id);
      const dbId = task?._id || id;
      await axios.delete(`/api/tasks/${dbId}`);

      setTasks(prev => {
        const updatedTasks = prev.filter(t => t._id !== dbId && t.id !== dbId);
        if (task && task.projectId) {
          setTimeout(() => calculateProjectProgress(task.projectId, updatedTasks), 0);
        }
        return updatedTasks;
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const addUser = async (user) => {
    try {
      const res = await axios.post('/api/users', user);
      setUsers(prev => [...prev, res.data]);
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  const updateUser = async (id, updates) => {
    try {
      const dbId = users.find(u => u.id === id || u._id === id)?._id || id;
      const res = await axios.put(`/api/users/${dbId}`, updates);
      setUsers(prev => prev.map(u => (u._id === dbId || u.id === dbId) ? res.data : u));
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const deleteUser = async (id) => {
    try {
      const dbId = users.find(u => u.id === id || u._id === id)?._id || id;
      await axios.delete(`/api/users/${dbId}`);
      setUsers(prev => prev.filter(u => u._id !== dbId && u.id !== dbId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const addNotification = async (notification) => {
    try {
      const res = await axios.post('/api/notifications', { ...notification, read: false });
      setNotifications(prev => [res.data, ...prev]);
    } catch (error) {
      console.error('Failed to add notification:', error);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      const dbId = notifications.find(n => n.id === id || n._id === id)?._id || id;
      const res = await axios.put(`/api/notifications/${dbId}`, { read: true });
      setNotifications(prev => prev.map(n => (n._id === dbId || n.id === dbId) ? res.data : n));
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  };

  const addDonation = async (donation) => {
    try {
      const res = await axios.post('/api/funds/donations', donation);
      setFunds(res.data);
    } catch (error) {
      console.error('Failed to add donation:', error);
    }
  };

  const addExpense = async (expense) => {
    try {
      const res = await axios.post('/api/expenses', expense);
      setExpenses(prev => [...prev, res.data]);
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  const deleteExpense = async (id) => {
    try {
      const dbId = expenses.find(e => e.id === id || e._id === id)?._id || id;
      await axios.delete(`/api/expenses/${dbId}`);
      setExpenses(prev => prev.filter(e => e._id !== dbId && e.id !== dbId));
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  return (
    <DataContext.Provider value={{
      projects, funds, tasks, users, notifications, expenses, loading,
      addProject, updateProject, deleteProject,
      addTask, updateTask, deleteTask,
      addUser, updateUser, deleteUser,
      addNotification, markNotificationRead,
      addDonation, addExpense, deleteExpense
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
