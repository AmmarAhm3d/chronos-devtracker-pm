import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, Layout, StatusBadge } from '../components';

const STATUS_COLORS: Record<string, string> = {
  TODO: '#fbbf24',
  IN_PROGRESS: '#3b82f6',
  COMPLETE: '#22c55e',
  ON_HOLD: '#a3a3a3',
};

function Dashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const statusSummary = Object.entries(
    projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({ status, count }));

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Project Status Summary" >
          {statusSummary.length === 0 ? (
            <p className="text-sm text-slate-500">No projects yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusSummary}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry) => (entry as any).status.replace('_', ' ')}
                  >
                    {statusSummary.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={STATUS_COLORS[entry.status] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <div className="lg:col-span-2 space-y-4">
          <Card title="Projects" actions={<button onClick={()=>navigate('/signup')} className="text-xs font-medium rounded px-2 py-1 border border-slate-300 hover:bg-slate-100">New (Sign Up)</button>}>
            {loading && <div className="text-sm text-slate-500">Loading...</div>}
            {error && <div className="text-sm text-red-500">{error}</div>}
            {!loading && !error && (
              <ul className="divide-y divide-slate-100">
                {projects.map(project => (
                  <li key={project.id} className="py-3 flex items-start justify-between gap-4 cursor-pointer group" onClick={() => navigate(`/projects/${project.id}`)}>
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition">{project.title}</div>
                      <StatusBadge status={project.status} />
                      {project.description && <p className="text-xs text-slate-500 max-w-md line-clamp-2">{project.description}</p>}
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
