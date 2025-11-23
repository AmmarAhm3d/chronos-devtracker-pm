import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';

function App() {
  const { token } = useAuthStore();

  return (
    <Router basename="/chronos-devtracker-pm">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route
          path="/projects/:id"
          element={token ? <ProjectDetail /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
