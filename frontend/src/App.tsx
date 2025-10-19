import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Perfil from './pages/Perfil';
import MiMalla from './pages/MiMalla';
import MisProyecciones from './pages/MisProyecciones';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Navigate to="perfil" replace />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="mi-malla" element={<MiMalla />} />
          <Route path="mis-proyecciones" element={<MisProyecciones />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;