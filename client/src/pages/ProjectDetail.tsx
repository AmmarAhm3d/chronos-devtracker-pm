import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Layout, Card, StatusBadge } from '../components';
import type { Project, Task, TaskUpdateData } from '../types';
import { CreateTaskSchema, UpdateProjectSchema, getZodFirstError } from '../lib/validation';
import { 
  ChevronLeft, 
  Settings2, 
  Trash2, 
  ExternalLink, 
  Github, 
  Plus, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Loader2,
  Calendar,
  LayoutGrid,
  Hash,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const PRIORITY_CONFIG = {
  HIGH: {
    label: 'High',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
    dot: 'bg-red-500'
  },
  MEDIUM: {
    label: 'Medium',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    dot: 'bg-amber-500'
  },
  LOW: {
    label: 'Low',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-100',
    dot: 'bg-slate-500'
  },
} as const;

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
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', status: 'TODO' as Project['status'], repoLink: '' });
  const [saving, setSaving] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  const handleUpdateTask = useCallback(async (taskId: string, updates: TaskUpdateData) => {
    const previousTasks = [...tasks];
    setTasks(currentTasks => 
      currentTasks.map(t => (t.id === taskId ? { ...t, ...updates } : t))
    );
    try {
      const res = await api.put(`/tasks/${taskId}`, updates);
      setTasks(currentTasks => 
        currentTasks.map(t => (t.id === taskId ? res.data : t))
      );
    } catch {
      setTasks(previousTasks);
      setError('Failed to update task');
    }
  }, [tasks]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    const previousTasks = [...tasks];
    setTasks(currentTasks => currentTasks.filter(t => t.id !== taskId));
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch {
      setTasks(previousTasks);
      setError('Failed to delete task');
    }
  }, [tasks]);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
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
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </div>
      </Layout>
    );
  }

  if (!project) return null;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                "inline-flex h-9 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950",
                isEditing ? "bg-slate-100 border-slate-200 text-slate-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              <Settings2 className="h-4 w-4" />
              Settings
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-100 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:border-red-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-950"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Error Feedback */}
        {(error || validationError) && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium shadow-sm"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {validationError || error}
          </motion.div>
        )}

        <Card className="p-0 border-slate-900/5 shadow-md">
          <div className="relative">
            <div className="h-32 bg-slate-900 overflow-hidden relative">
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            </div>
            
            <div className="px-8 pb-8 -mt-6 relative">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg border border-slate-100 text-slate-900">
                      <LayoutGrid className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{project.title}</h1>
                        <StatusBadge status={project.status} />
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-tight">
                           <Hash className="h-3 w-3" />
                           ID: {project.id.slice(0, 8)}
                         </div>
                         {project.repoLink && (
                           <a 
                             href={project.repoLink} 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                           >
                             <Github className="h-3.5 w-3.5" />
                             View Repository
                             <ExternalLink className="h-3 w-3" />
                           </a>
                         )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <div className="relative h-12 w-12">
                    <svg className="h-12 w-12 transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200" />
                      <circle 
                        cx="24" 
                        cy="24" 
                        r="20" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray={125.6} 
                        strokeDashoffset={125.6 * (1 - taskProgress / 100)} 
                        strokeLinecap="round" 
                        className="text-slate-900 transition-all duration-1000" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                      {taskProgress}%
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Progress</p>
                    <p className="text-xs font-bold text-slate-900">{completedTasks} of {tasks.length} requirements met</p>
                  </div>
                </div>
              </div>

              {project.description && !isEditing && (
                <div className="mt-6 text-sm text-slate-600 leading-relaxed max-w-3xl">
                  {project.description}
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-slate-100"
              >
                <div className="p-8 bg-slate-50/50">
                  <form onSubmit={handleUpdateProject} className="space-y-6 max-w-2xl">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-tight">Project Title</label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-950/5"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-tight">Current Status</label>
                        <select
                          value={editForm.status}
                          onChange={e => setEditForm({ ...editForm, status: e.target.value as Project['status'] })}
                          className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-950/5"
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-tight">Technical Overview</label>
                      <textarea
                        value={editForm.description}
                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-950/5 min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-tight">Repository Link</label>
                      <input
                        type="url"
                        value={editForm.repoLink}
                        onChange={e => setEditForm({ ...editForm, repoLink: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-950/5"
                        placeholder="https://github.com/org/repo"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-md bg-slate-900 px-6 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                      >
                        {saving ? 'Syncing...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Requirements & Tasks</h2>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  {completedTasks} Done
                </span>
                <span className="flex items-center gap-1.5">
                  <Circle className="h-3.5 w-3.5" />
                  {tasks.length - completedTasks} Pending
                </span>
              </div>
            </div>

            <Card className="p-0 border-slate-200">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <form onSubmit={handleAddTask} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Add a new requirement..."
                    value={newTask.title}
                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm bg-transparent border-none focus:ring-0 focus:outline-none"
                    required
                  />
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                    className="text-xs font-bold border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                  <button 
                    type="submit" 
                    disabled={addingTask}
                    className="h-8 w-8 flex items-center justify-center rounded-md bg-slate-900 text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </form>
              </div>

              <div className="divide-y divide-slate-100">
                {tasks.length === 0 ? (
                  <div className="p-12 text-center">
                    <AlertCircle className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-400">No tasks defined for this project.</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onToggle={(completed) => handleUpdateTask(task.id, { completed })}
                      onDelete={() => handleDeleteTask(task.id)}
                    />
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Details</h2>
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    Created
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    Last Updated
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Team</h2>
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    ME
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">You (Owner)</p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Primary Maintainer</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm overflow-hidden rounded-xl bg-white p-6 shadow-2xl border border-slate-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Permanent Deletion</h3>
                <p className="mt-2 text-sm text-slate-500">
                  This action will destroy all data associated with <span className="font-bold text-slate-900">"{project.title}"</span>. This is irreversible.
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <button
                  disabled={deleting}
                  onClick={handleDeleteProject}
                  className="inline-flex h-10 w-full items-center justify-center rounded-md bg-red-600 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Confirm Destruction'}
                </button>
                <button
                  disabled={deleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="inline-flex h-10 w-full items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

function TaskItem({ task, onToggle, onDelete }: { task: Task; onToggle: (c: boolean) => void; onDelete: () => void }) {
  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.MEDIUM;

  return (
    <div className={cn(
      "group flex items-center justify-between p-4 transition-all hover:bg-slate-50/50",
      task.completed && "bg-slate-50/30"
    )}>
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={() => onToggle(!task.completed)}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded border transition-all duration-200",
            task.completed 
              ? "bg-slate-900 border-slate-900 text-white" 
              : "border-slate-300 hover:border-slate-900 bg-white"
          )}
        >
          {task.completed && <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={3} />}
        </button>
        <div className="flex flex-col min-w-0">
          <span className={cn(
            "text-sm font-medium transition-all duration-300 truncate",
            task.completed ? "text-slate-400 line-through" : "text-slate-900"
          )}>
            {task.title}
          </span>
          <div className="flex items-center gap-3 mt-0.5">
            <div className={cn(
              "flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-tight",
              priority.color, priority.bg
            )}>
              <div className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} />
              {priority.label}
            </div>
            {task.completed && (
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">Verified</span>
            )}
          </div>
        </div>
      </div>
      <button 
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default ProjectDetail;
