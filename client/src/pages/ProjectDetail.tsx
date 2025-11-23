import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Layout, Card, StatusBadge } from '../components';

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState({ title: '', priority: 'MEDIUM' });

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then(res => {
        setProject(res.data);
        setTasks(res.data.tasks);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load project');
        setLoading(false);
      });
  }, [id]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${id}/tasks`, newTask);
      setTasks([res.data, ...tasks]);
      setNewTask({ title: '', priority: 'MEDIUM' });
    } catch {
      setError('Failed to add task');
    }
  };

  const handleUpdateTask = async (taskId: string, updates: any) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, updates);
      setTasks(tasks.map(t => (t.id === taskId ? res.data : t)));
    } catch {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch {
      setError('Failed to delete task');
    }
  };

  if (loading) return <Layout><Card title="Loading"><p className="text-xs text-slate-500">Fetching project...</p></Card></Layout>;
  if (error) return <Layout><Card title="Error"><p className="text-sm text-red-500">{error}</p></Card></Layout>;
  if (!project) return <Layout><Card title="Not Found"><p className="text-xs">No project data</p></Card></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-xs rounded px-2 py-1 border border-slate-300 hover:bg-slate-100">Back</button>
        </div>
        <Card title={project.title} actions={project.repoLink && <a href={project.repoLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">Repo</a>}>
          <StatusBadge status={project.status} />
          {project.description && <p className="text-sm text-slate-600 mb-2 max-w-2xl">{project.description}</p>}
        </Card>
        <Card title="Tasks">
          <span className="text-xs text-slate-500">{tasks.length} total</span>
          <form onSubmit={handleAddTask} className="flex flex-wrap gap-2 mb-6 items-center">
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              className="border border-slate-300 focus:border-blue-500 focus:ring-blue-500 px-3 py-2 rounded text-sm w-64"
              required
            />
            <select
              value={newTask.priority}
              onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
              className="border border-slate-300 focus:border-blue-500 focus:ring-blue-500 px-3 py-2 rounded text-sm"
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Add Task</button>
          </form>
          <ul className="divide-y divide-slate-100">
            {tasks.map(task => (
              <li key={task.id} className="py-3 flex items-start justify-between gap-6">
                <div className="space-y-1">
                  <div className="font-medium text-slate-800">{task.title}</div>
                  <div className="text-xs text-slate-500">Priority: {task.priority}</div>
                  <div className="text-xs text-slate-400">Completed: {task.completed ? 'Yes' : 'No'}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleUpdateTask(task.id, { completed: !task.completed })}
                    className={`px-3 py-1 rounded text-xs font-medium ${task.completed ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-700'} hover:opacity-90`}
                  >{task.completed ? 'Mark Incomplete' : 'Mark Complete'}</button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-600"
                  >Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Layout>
  );
}

export default ProjectDetail;
