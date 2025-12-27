import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, Layout, StatusBadge } from '../components';
import type { Project } from '../types';
import { CreateProjectSchema, getZodFirstError } from '../lib/validation';

const STATUS_COLORS: Record<string, string> = {
  TODO: '#ff6b35',
  IN_PROGRESS: '#00ffff',
  COMPLETE: '#00ff41',
  ON_HOLD: '#64748b',
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
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', status: 'TODO' as Project['status'] });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/projects')
      .then(res => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load projects');
        setLoading(false);
      });
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with Zod
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
      setError('Failed to create project');
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

  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETE').length;
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  return (
    <Layout>
      {/* Stats Overview - Terminal Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative bg-terminal-surface border-2 border-terminal-cyan/30 p-6 overflow-hidden group hover:border-terminal-cyan/60 transition-all duration-300">
          <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-50" aria-hidden="true"></div>
          <div className="absolute top-0 right-0 w-2 h-2 bg-terminal-cyan animate-pulse" aria-hidden="true"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-terminal-cyan animate-pulse [animation-delay:0.5s]" aria-hidden="true"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="font-mono text-xs text-terminal-cyan/70 tracking-wider uppercase">
                [TOTAL_PROJECTS]
              </div>
              <div className="w-8 h-8 border border-terminal-cyan/30 flex items-center justify-center text-terminal-cyan group-hover:animate-glow-pulse transition-all" aria-hidden="true">
                <span className="font-mono text-lg">█</span>
              </div>
            </div>
            <div className="font-mono text-5xl font-bold text-terminal-cyan mt-2 group-hover:text-glow transition-all">
              {totalProjects.toString().padStart(2, '0')}
            </div>
            <div className="mt-2 h-0.5 bg-terminal-cyan/20 group-hover:bg-terminal-cyan/40 transition-all" aria-hidden="true"></div>
          </div>
        </div>
        
        <div className="relative bg-terminal-surface border-2 border-terminal-lime/30 p-6 overflow-hidden group hover:border-terminal-lime/60 transition-all duration-300">
          <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-50" aria-hidden="true"></div>
          <div className="absolute top-0 right-0 w-2 h-2 bg-terminal-lime animate-pulse" aria-hidden="true"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-terminal-lime animate-pulse [animation-delay:0.5s]" aria-hidden="true"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="font-mono text-xs text-terminal-lime/70 tracking-wider uppercase">
                [COMPLETED]
              </div>
              <div className="w-8 h-8 border border-terminal-lime/30 flex items-center justify-center text-terminal-lime group-hover:animate-glow-pulse transition-all" aria-hidden="true">
                <span className="font-mono text-lg">✓</span>
              </div>
            </div>
            <div className="font-mono text-5xl font-bold text-terminal-lime mt-2 group-hover:text-glow transition-all">
              {completedProjects.toString().padStart(2, '0')}
            </div>
            <div className="mt-2 h-0.5 bg-terminal-lime/20 group-hover:bg-terminal-lime/40 transition-all" aria-hidden="true"></div>
          </div>
        </div>
        
        <div className="relative bg-terminal-surface border-2 border-terminal-orange/30 p-6 overflow-hidden group hover:border-terminal-orange/60 transition-all duration-300">
          <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-50" aria-hidden="true"></div>
          <div className="absolute top-0 right-0 w-2 h-2 bg-terminal-orange animate-pulse" aria-hidden="true"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-terminal-orange animate-pulse [animation-delay:0.5s]" aria-hidden="true"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="font-mono text-xs text-terminal-orange/70 tracking-wider uppercase">
                [COMPLETION_RATE]
              </div>
              <div className="w-8 h-8 border border-terminal-orange/30 flex items-center justify-center text-terminal-orange group-hover:animate-glow-pulse transition-all" aria-hidden="true">
                <span className="font-mono text-lg">%</span>
              </div>
            </div>
            <div className="font-mono text-5xl font-bold text-terminal-orange mt-2 group-hover:text-glow transition-all">
              {completionRate.toString().padStart(2, '0')}
              <span className="text-2xl ml-1">%</span>
            </div>
            <div className="mt-2 h-0.5 bg-terminal-orange/20 group-hover:bg-terminal-orange/40 transition-all" aria-hidden="true"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Card */}
        <Card title="Status Distribution">
          {statusSummary.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="font-mono text-5xl text-terminal-gray-700 mb-4">
                  ◯
                </div>
                <p className="font-mono text-xs text-terminal-gray-500 tracking-wide">NO_DATA_AVAILABLE</p>
                <p className="font-mono text-[10px] text-terminal-gray-600 mt-1">CREATE_PROJECTS_TO_POPULATE</p>
              </div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusSummary}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusSummary.map((entry, idx) => (
                      <Cell 
                        key={`cell-${idx}`} 
                        fill={STATUS_COLORS[entry.status] || '#8884d8'}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Projects List */}
        <div className="lg:col-span-2 space-y-4">
          <Card 
            title="Projects" 
            actions={
              <button 
                onClick={() => setShowNewProject(!showNewProject)} 
                className="border-2 border-terminal-lime/50 text-terminal-lime font-mono text-xs py-2 px-4 hover:bg-terminal-lime/10 hover:border-terminal-lime active:scale-95 transition-all duration-200 tracking-wider uppercase"
              >
                <span className="flex items-center gap-2">
                  <span>+</span>
                  NEW_PROJECT
                </span>
              </button>
            }
          >
            {/* New Project Form */}
            {showNewProject && (
              <form onSubmit={handleCreateProject} className="p-4 bg-terminal-surface border-2 border-terminal-lime/30 mb-4">
                <h3 className="font-mono text-sm font-semibold text-terminal-lime mb-4 tracking-wide uppercase">{'>'} CREATE_NEW_PROJECT</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="PROJECT_TITLE..."
                    value={newProject.title}
                    onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-terminal-gray-700 bg-terminal-bg placeholder:text-terminal-gray-600 text-terminal-cyan font-mono text-sm focus:outline-none focus:border-terminal-cyan transition-all duration-200"
                    required
                  />
                  <textarea
                    placeholder="DESCRIPTION (OPTIONAL)..."
                    value={newProject.description}
                    onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-terminal-gray-700 bg-terminal-bg placeholder:text-terminal-gray-600 text-terminal-gray-300 font-mono text-sm focus:outline-none focus:border-terminal-cyan transition-all duration-200 resize-none"
                    rows={2}
                  />
                  <select
                    value={newProject.status}
                    onChange={e => setNewProject({ ...newProject, status: e.target.value as Project['status'] })}
                    className="w-full px-4 py-3 border-2 border-terminal-gray-700 bg-terminal-bg text-terminal-cyan font-mono text-sm focus:outline-none focus:border-terminal-cyan transition-all duration-200"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETE">COMPLETE</option>
                    <option value="ON_HOLD">ON_HOLD</option>
                  </select>
                  {validationError && (
                    <div className="p-3 border-2 border-terminal-orange/50 bg-terminal-orange/10 text-terminal-orange font-mono text-xs">
                      {'>'} ERROR: {validationError}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button type="submit" disabled={creating} className="border-2 border-terminal-lime/50 text-terminal-lime font-mono text-xs py-2 px-4 hover:bg-terminal-lime/10 hover:border-terminal-lime active:scale-95 transition-all duration-200 tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed">
                      {creating ? 'CREATING...' : 'CREATE'}
                    </button>
                    <button type="button" onClick={() => { setShowNewProject(false); setValidationError(''); }} className="border-2 border-terminal-gray-700 text-terminal-gray-400 font-mono text-xs py-2 px-4 hover:bg-terminal-gray-800 hover:border-terminal-gray-600 active:scale-95 transition-all duration-200 tracking-wider uppercase">
                      CANCEL
                    </button>
                  </div>
                </div>
              </form>
            )}

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="font-mono text-terminal-cyan animate-pulse">
                  <span className="text-2xl">▓▓▓</span> LOADING<span className="terminal-cursor"></span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="p-4 border-2 border-terminal-orange/50 bg-terminal-orange/10 font-mono text-xs text-terminal-orange">
                {'>'} ERROR: {error}
              </div>
            )}
            
            {!loading && !error && projects.length === 0 && (
              <div className="text-center py-12">
                <div className="font-mono text-6xl text-terminal-gray-700 mb-4">
                  ▢
                </div>
                <p className="font-mono text-sm text-terminal-gray-500 tracking-wide">NO_PROJECTS_FOUND</p>
                <p className="font-mono text-xs text-terminal-gray-600 mt-2">EXECUTE "NEW_PROJECT" TO BEGIN</p>
              </div>
            )}
            
            {!loading && !error && projects.length > 0 && (
              <ul className="divide-y divide-terminal-gray-800">
                {projects.map(project => (
                  <li 
                    key={project.id} 
                    className="py-4 flex items-start justify-between gap-4 cursor-pointer group hover:bg-terminal-bg/50 -mx-6 px-6 transition-colors border-l-2 border-transparent hover:border-terminal-cyan" 
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-terminal-cyan/30 flex items-center justify-center flex-shrink-0 group-hover:border-terminal-cyan transition-colors font-mono text-terminal-cyan">
                          ▣
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-mono text-sm font-semibold text-terminal-gray-200 group-hover:text-terminal-cyan transition-colors truncate">
                            {project.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusBadge status={project.status} />
                            {(project._count?.tasks ?? 0) > 0 && (
                              <span className="font-mono text-[10px] text-terminal-gray-600 tracking-wider">
                                [{project._count?.tasks ?? 0}_TASK{(project._count?.tasks ?? 0) !== 1 ? 'S' : ''}]
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {project.description && (
                        <p className="text-xs text-terminal-gray-500 line-clamp-2 ml-12 font-mono">{project.description}</p>
                      )}
                    </div>
                    <div className="font-mono text-terminal-cyan/50 group-hover:text-terminal-cyan transition-colors flex-shrink-0 mt-2 text-lg">
                      →
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
