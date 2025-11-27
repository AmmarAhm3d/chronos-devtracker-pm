import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Layout, Card, StatusBadge } from '../components';
import type { Project, Task, TaskUpdateData } from '../types';
import { CreateTaskSchema, UpdateProjectSchema, getZodFirstError } from '../lib/validation';

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200/50',
  MEDIUM: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200/50',
  LOW: 'bg-gradient-to-r from-slate-50 to-gray-50 text-slate-600 border-slate-200/50',
};

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETE', label: 'Complete' },
  { value: 'ON_HOLD', label: 'On Hold' },
] as const;

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState({ title: '', priority: 'MEDIUM' as Task['priority'] });
  const [addingTask, setAddingTask] = useState(false);
  
  // Edit project state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', status: 'TODO' as Project['status'], repoLink: '' });
  const [saving, setSaving] = useState(false);
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Validation errors
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then(res => {
        setProject(res.data);
        setTasks(res.data.tasks || []);
        setEditForm({
          title: res.data.title || '',
          description: res.data.description || '',
          status: res.data.status || 'TODO',
          repoLink: res.data.repoLink || '',
        });
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load project');
        setLoading(false);
      });
  }, [id]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    // Validate with Zod
    const validation = CreateTaskSchema.safeParse(newTask);
    if (!validation.success) {
      setValidationError(getZodFirstError(validation.error));
      return;
    }
    setValidationError('');
    
    setAddingTask(true);
    try {
      const res = await api.post(`/projects/${id}/tasks`, newTask);
      setTasks([res.data, ...tasks]);
      setNewTask({ title: '', priority: 'MEDIUM' });
    } catch {
      setError('Failed to add task');
    } finally {
      setAddingTask(false);
    }
  };

  // Optimistic update for tasks
  const handleUpdateTask = useCallback(async (taskId: string, updates: TaskUpdateData) => {
    // Store previous state for rollback
    const previousTasks = [...tasks];
    
    // Optimistically update the UI
    setTasks(currentTasks => 
      currentTasks.map(t => (t.id === taskId ? { ...t, ...updates } : t))
    );
    
    try {
      const res = await api.put(`/tasks/${taskId}`, updates);
      // Update with server response to ensure consistency
      setTasks(currentTasks => 
        currentTasks.map(t => (t.id === taskId ? res.data : t))
      );
    } catch {
      // Rollback on failure
      setTasks(previousTasks);
      setError('Failed to update task');
    }
  }, [tasks]);

  // Optimistic delete for tasks
  const handleDeleteTask = useCallback(async (taskId: string) => {
    // Store previous state for rollback
    const previousTasks = [...tasks];
    
    // Optimistically remove from UI
    setTasks(currentTasks => currentTasks.filter(t => t.id !== taskId));
    
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch {
      // Rollback on failure
      setTasks(previousTasks);
      setError('Failed to delete task');
    }
  }, [tasks]);

  // Handle project update
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with Zod
    const validation = UpdateProjectSchema.safeParse(editForm);
    if (!validation.success) {
      setValidationError(getZodFirstError(validation.error));
      return;
    }
    setValidationError('');
    
    setSaving(true);
    try {
      const res = await api.put(`/projects/${id}`, {
        title: editForm.title,
        description: editForm.description || undefined,
        status: editForm.status,
        repoLink: editForm.repoLink || undefined,
      });
      setProject(res.data);
      setIsEditing(false);
    } catch {
      setError('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  // Handle project delete
  const handleDeleteProject = async () => {
    setDeleting(true);
    try {
      await api.delete(`/projects/${id}`);
      navigate('/');
    } catch {
      setError('Failed to delete project');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-indigo-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </Layout>
    );
  }

  if (error && !project) {
    return (
      <Layout>
        <Card title="Error">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">{error}</p>
            <button onClick={() => navigate('/')} className="bg-white text-slate-700 font-medium py-2 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all duration-200 shadow-sm mt-4">
              Back to Dashboard
            </button>
          </div>
        </Card>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <Card title="Not Found">
          <div className="text-center py-8">
            <p className="text-slate-600">Project not found</p>
            <button onClick={() => navigate('/')} className="bg-white text-slate-700 font-medium py-2 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all duration-200 shadow-sm mt-4">
              Back to Dashboard
            </button>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')} 
          className="bg-white text-slate-700 font-medium py-2 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all duration-200 shadow-sm inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Project?</h3>
                <p className="text-slate-500 text-sm mb-6">
                  Are you sure you want to delete "{project?.title ?? 'this project'}"? This will also delete all {tasks.length} task{tasks.length !== 1 ? 's' : ''} and cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="bg-white text-slate-700 font-medium py-2 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all duration-200 shadow-sm text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    disabled={deleting}
                    className="bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:from-red-400 hover:to-rose-400 active:scale-[0.98] transition-all duration-200 text-sm disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete Project'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Project Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-500/30">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-3 flex-1">
              {!isEditing ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-3xl font-bold">{project.title}</h1>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-3 rounded-lg backdrop-blur-sm transition-all duration-200 text-sm flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-500/80 hover:bg-red-500 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 text-sm flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={project.status} />
                    {project.repoLink && (
                      <a 
                        href={project.repoLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        Repository
                      </a>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-white/80 max-w-2xl">{project.description}</p>
                  )}
                </>
              ) : (
                <form onSubmit={handleUpdateProject} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Title</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm placeholder:text-white/40 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200"
                      placeholder="Project title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm placeholder:text-white/40 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200 resize-none"
                      placeholder="Project description (optional)"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1.5">Status</label>
                      <select
                        value={editForm.status}
                        onChange={e => setEditForm({ ...editForm, status: e.target.value as Project['status'] })}
                        className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200"
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value} className="text-slate-800">{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1.5">Repository Link</label>
                      <input
                        type="url"
                        value={editForm.repoLink}
                        onChange={e => setEditForm({ ...editForm, repoLink: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm placeholder:text-white/40 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200"
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-white text-indigo-600 font-medium py-2 px-4 rounded-lg shadow-lg hover:bg-white/90 active:scale-[0.98] transition-all duration-200 text-sm disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({
                          title: project.title || '',
                          description: project.description || '',
                          status: project.status || 'TODO',
                          repoLink: project.repoLink || '',
                        });
                        setValidationError('');
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg backdrop-blur-sm transition-all duration-200 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            {/* Progress Ring */}
            <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="white"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${taskProgress * 2.2} 220`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">{taskProgress}%</span>
                </div>
              </div>
              <div>
                <p className="text-white/60 text-sm">Task Progress</p>
                <p className="font-semibold">{completedTasks} of {tasks.length} done</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {(error || validationError) && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {validationError || error}
          </div>
        )}

        {/* Tasks Section */}
        <Card title="Tasks">
          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="flex flex-wrap gap-3 items-end pb-6 border-b border-slate-100">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">New Task</label>
              <input
                type="text"
                placeholder="What needs to be done?"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                required
              />
            </div>
            <div className="w-36">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
              <select
                value={newTask.priority}
                onChange={e => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              >
                <option value="HIGH">🔴 High</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="LOW">⚪ Low</option>
              </select>
            </div>
            <button 
              type="submit" 
              disabled={addingTask}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
            >
              {addingTask ? 'Adding...' : 'Add Task'}
            </button>
          </form>

          {/* Task List */}
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium">No tasks yet</p>
              <p className="text-sm text-slate-400 mt-1">Add your first task above</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {tasks.map(task => (
                <li 
                  key={task.id} 
                  className={`py-4 flex items-center justify-between gap-4 group transition-all duration-200 ${task.completed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button
                      onClick={() => handleUpdateTask(task.id, { completed: !task.completed })}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                        task.completed 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-slate-300 hover:border-indigo-500'
                      }`}
                    >
                      {task.completed && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className={`font-medium text-slate-800 truncate ${task.completed ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border mt-1 ${PRIORITY_STYLES[task.priority]}`}>
                        {task.priority === 'HIGH' && '🔴'}
                        {task.priority === 'MEDIUM' && '🟡'}
                        {task.priority === 'LOW' && '⚪'}
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium rounded-lg shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/30 active:scale-[0.98] transition-all duration-200 text-xs py-1.5 px-3"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Layout>
  );
}

export default ProjectDetail;
