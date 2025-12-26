import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, Layout, StatusBadge } from '../components';
import type { Project } from '../types';
import { CreateProjectSchema, getZodFirstError } from '../lib/validation';
import { Plus, BarChart3, FolderGit2, CheckCircle, Briefcase, Clock, Search, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const STATUS_COLORS: Record<string, string> = {
  TODO: '#94a3b8',
  IN_PROGRESS: '#3b82f6',
  COMPLETE: '#10b981',
  ON_HOLD: '#f59e0b',
};

const STATUS_LABELS: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETE: 'Complete',
  ON_HOLD: 'On Hold',
};

function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', status: 'TODO' as Project['status'] });
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/projects')
      .then(res => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = CreateProjectSchema.safeParse(newProject);
    if (!validation.success) {
      setValidationError(getZodFirstError(validation.error));
      return;
    }
    setValidationError('');
    setCreating(true);
    try {
      const res = await api.post('/projects', newProject);
      setProjects([res.data, ...projects]);
      setNewProject({ title: '', description: '', status: 'TODO' });
      setShowNewProject(false);
    } catch {
      // Error handled via UI feedback
    } finally {
      setCreating(false);
    }
  };

  const statusSummary = Object.entries(
    projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({ status, count, name: STATUS_LABELS[status] || status }));

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETE').length;
  const inProgressProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">Overview of your development pipeline and active projects.</p>
          </div>
          <button 
            onClick={() => setShowNewProject(true)} 
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Projects" 
            value={totalProjects} 
            icon={Briefcase} 
            description="Active in workspace"
          />
          <StatCard 
            title="In Progress" 
            value={inProgressProjects} 
            icon={Clock} 
            description="Currently being built"
            variant="blue"
          />
          <StatCard 
            title="Completed" 
            value={completedProjects} 
            icon={CheckCircle} 
            description="Successfully shipped"
            variant="emerald"
          />
          <StatCard 
            title="Active Tasks" 
            value={projects.reduce((acc, p) => acc + (p._count?.tasks || 0), 0)} 
            icon={BarChart3} 
            description="Pending requirements"
            variant="amber"
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Projects</h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-40 sm:w-64 rounded-md border border-slate-200 bg-white pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950/5 transition-all"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {showNewProject && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6"
                >
                  <Card title="Initialize New Project" className="border-slate-900/10 shadow-lg">
                    <form onSubmit={handleCreateProject} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">Project Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Apollo Engine"
                            value={newProject.title}
                            onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950/5"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">Initial Status</label>
                          <select
                            value={newProject.status}
                            onChange={e => setNewProject({ ...newProject, status: e.target.value as Project['status'] })}
                            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950/5"
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETE">Complete</option>
                            <option value="ON_HOLD">On Hold</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Description</label>
                        <textarea
                          placeholder="Brief technical overview..."
                          value={newProject.description}
                          onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950/5 min-h-[80px]"
                        />
                      </div>
                      {validationError && (
                        <p className="text-xs font-medium text-red-500">{validationError}</p>
                      )}
                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          type="button" 
                          onClick={() => setShowNewProject(false)}
                          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          disabled={creating}
                          className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                        >
                          {creating ? 'Initializing...' : 'Create Project'}
                        </button>
                      </div>
                    </form>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                <FolderGit2 className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">No projects found</p>
                <button 
                  onClick={() => setShowNewProject(true)}
                  className="mt-4 text-xs font-bold text-slate-900 hover:underline"
                >
                  Create your first project →
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredProjects.map((project) => (
                  <ProjectItem key={project.id} project={project} onClick={() => navigate(`/projects/${project.id}`)} />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Status Metrics</h2>
              <Card noPadding className="p-4">
                <div className="h-[240px] w-full">
                  {statusSummary.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <BarChart3 className="h-8 w-8 text-slate-200 mb-2" />
                      <p className="text-xs text-slate-400">No data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusSummary}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={5}
                          stroke="none"
                        >
                          {statusSummary.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">{payload[0].name}</p>
                                  <p className="text-sm font-bold text-slate-900">{payload[0].value} Projects</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="mt-2 space-y-1.5">
                  {statusSummary.map((item) => (
                    <div key={item.status} className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.status] }} />
                        <span className="text-xs font-medium text-slate-600">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon: Icon, description, variant = 'default' }: { title: string; value: number; icon: React.ElementType; description: string; variant?: string }) {
  const variants = {
    default: 'bg-white text-slate-900 border-slate-200',
    blue: 'bg-white text-slate-900 border-slate-200 border-l-blue-500 border-l-4',
    emerald: 'bg-white text-slate-900 border-slate-200 border-l-emerald-500 border-l-4',
    amber: 'bg-white text-slate-900 border-slate-200 border-l-amber-500 border-l-4',
  };

  return (
    <Card className={cn("p-5", variants[variant as keyof typeof variants])}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
        <Icon className="h-4 w-4 text-slate-300" />
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        <span className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tight">{description}</span>
      </div>
    </Card>
  );
}

function ProjectItem({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.005, x: 2 }}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors group-hover:bg-slate-900 group-hover:text-white">
            <FolderGit2 className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 group-hover:text-slate-950">{project.title}</h3>
              <StatusBadge status={project.status} />
            </div>
            {project.description && (
              <p className="text-xs text-slate-500 line-clamp-1 max-w-md">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tasks</span>
            <span className="text-sm font-bold text-slate-700">{project._count?.tasks || 0}</span>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-900" />
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
