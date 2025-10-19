import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Perfil from './pages/Perfil';
import MiMalla from './pages/MiMalla';
import MisProyecciones from './pages/MisProyecciones';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard como layout padre */}
        <Route path="/" element={<Dashboard />}>
          <Route path="dashboard" element={<div />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="malla" element={<MiMalla />} />
          <Route path="proyecciones" element={<MisProyecciones />} />
        </Route>
      </Routes>
    </Router>
  );
}