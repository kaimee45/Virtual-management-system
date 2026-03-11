import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Circle, Clock, Filter, FolderKanban } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function StaffTasks() {
  const { tasks, updateTask, projects, users } = useData();
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');

  // Cross-reference mock local user with real database user ID
  const realUser = users.find(u => u.email === user?.email);
  const staffId = realUser?._id || user?._id || user?.id;

  const staffProjectIds = projects
    .filter(p => p.assignedStaff?.includes(staffId) || p.assignedStaff?.includes(user?.name))
    .map(p => p._id || p.id);

  // Filter tasks to show tasks related to projects the staff manages
  const myTasks = tasks.filter(t => staffProjectIds.includes(t.projectId));

  const filteredTasks = myTasks.filter(task => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return task.status !== 'Completed';
    if (filter === 'Completed') return task.status === 'Completed';
    return true;
  });

  const handleToggleTask = (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    updateTask(task._id || task.id, { status: newStatus, progress: newStatus === 'Completed' ? 100 : 0 });
  };

  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Assigned Tasks</h2>

          <div className="flex gap-2">
            {['All', 'Pending', 'Completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <Card className="border-none shadow-sm bg-gray-50/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <AnimatePresence mode='popLayout'>
                {filteredTasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-500 text-center py-12"
                  >
                    <Filter className="mx-auto w-12 h-12 text-gray-300 mb-2" />
                    <p>No tasks found in this category.</p>
                  </motion.div>
                ) : (
                  Object.values(filteredTasks.reduce((acc, task) => {
                    const projTitle = projects.find(p => (p._id || p.id) === task.projectId)?.title || task.project || 'General Tasks';
                    const projId = task.projectId || 'general';
                    const isTaskCompleted = task.status === 'Completed';

                    // Group by Project
                    if (!acc[projId]) {
                      acc[projId] = {
                        projectId: projId,
                        projectName: projTitle,
                        isCompletedProject: projects.find(p => (p._id || p.id) === projId)?.status === 'Completed',
                        tasks: []
                      };
                    }
                    acc[projId].tasks.push(task);
                    return acc;
                  }, {})).map(projectGroup => (
                    <motion.div
                      layout
                      key={projectGroup.projectId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`mb-6 rounded-xl border overflow-hidden transition-all duration-200 ${projectGroup.isCompletedProject ? 'bg-green-50/50 border-green-200 shadow-sm' : 'bg-white border-blue-100 shadow-sm'}`}
                    >
                      {/* Project Header */}
                      <div className={`px-5 py-3 border-b flex items-center justify-between ${projectGroup.isCompletedProject ? 'bg-green-100/80 border-green-200' : 'bg-blue-50/80 border-blue-100'}`}>
                        <div className="flex items-center gap-2">
                          {projectGroup.isCompletedProject ? (
                            <CheckCircle size={18} className="text-green-600" />
                          ) : (
                            <FolderKanban size={18} className="text-blue-600" />
                          )}
                          <h3 className={`font-bold text-lg ${projectGroup.isCompletedProject ? 'text-green-900' : 'text-blue-900'}`}>
                            {projectGroup.projectName}
                          </h3>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${projectGroup.isCompletedProject ? 'bg-green-200 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {projectGroup.isCompletedProject ? 'Completed Project' : 'Active Project'}
                        </span>
                      </div>

                      {/* Tasks List within Project */}
                      <div className="divide-y divide-gray-100">
                        {projectGroup.tasks.map(task => (
                          <div key={task._id || task.id} className={`p-5 transition-colors ${task.status === 'Completed' ? 'bg-gray-50/50' : 'hover:bg-blue-50/30'}`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Circle size={24} className={`${task.status === 'Completed' ? 'text-green-500' : 'text-gray-300'}`} />
                                <div>
                                  <p className={`text-base font-medium ${task.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                                  <p className="inline-block px-2 py-1 mt-1.5 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-700 font-bold tracking-wide">
                                    👤 Assigned to: {task.assignedTo || 'Unassigned'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`text-2xl font-bold ${task.progress === 100 ? 'text-green-600' : 'text-blue-600'}`}>{task.progress || 0}%</span>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Progress</p>
                              </div>
                            </div>

                            {/* Volunteer Daily Logs Display */}
                            {task.dailyLogs && task.dailyLogs.length > 0 && (
                              <div className="mb-4 bg-blue-50/50 p-3 rounded-xl border border-blue-100 ml-9">
                                <p className="text-[10px] uppercase font-bold text-blue-800 mb-2 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                  Volunteer Activity Logs
                                </p>
                                <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                  {[...task.dailyLogs].reverse().map((log, idx) => (
                                    <div key={idx} className="bg-white p-2 rounded-lg border border-blue-50 shadow-sm">
                                      <span className="text-[10px] font-bold text-gray-400 block mb-0.5">{log.date}</span>
                                      <p className="text-xs text-gray-700">{log.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Legacy Remarks Display (Fallback) */}
                            {!task.dailyLogs?.length && task.remarks && (
                              <div className="mb-4 bg-blue-50/50 p-3 rounded-xl border border-blue-100 ml-9">
                                <p className="text-[10px] uppercase font-bold text-blue-600 mb-1">Legacy Volunteer Remarks</p>
                                <p className="text-sm text-gray-700 italic">"{task.remarks}"</p>
                              </div>
                            )}

                            {/* Staff Progress Control */}
                            {task.status !== 'Completed' && (
                              <div className="bg-gray-50 p-3 rounded-lg ml-9 mt-4 border border-gray-100">
                                <StaffTaskProgressEditor task={task} updateTask={updateTask} />

                                <div className="flex justify-end mt-2">
                                  <button
                                    onClick={() => handleToggleTask(task)}
                                    disabled={task.progress < 100}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${task.progress === 100
                                      ? 'bg-green-600 text-white shadow-md hover:bg-green-700'
                                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      }`}
                                  >
                                    <CheckCircle size={14} />
                                    {task.progress === 100 ? 'Verify & Complete' : 'Task Incomplete'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function StaffTaskProgressEditor({ task, updateTask }) {
  const [value, setValue] = useState(task.progress || 0);

  // Sync if it changes externally
  useEffect(() => {
    setValue(task.progress || 0);
  }, [task.progress]);

  const handleSave = () => {
    if (value !== task.progress) {
      updateTask(task._id || task.id, { progress: value });
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold text-gray-600">Update Progress:</span>
        <input
          type="number"
          min="0"
          max="100"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-16 h-6 text-xs border border-gray-300 rounded text-center"
        />
        <span className="text-xs text-gray-400">%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600 mb-2"
      />
      {value !== (task.progress || 0) && (
        <div className="mt-2 flex justify-end gap-2">
          <button
            onClick={() => setValue(task.progress || 0)}
            className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white text-[10px] font-bold uppercase rounded hover:bg-green-600 transition-colors"
          >
            Update Progress
          </button>
        </div>
      )}
    </>
  );
}
