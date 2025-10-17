import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';

function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí puedes agregar lógica de limpieza (localStorage, etc.)
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header"></div>

        <nav className="sidebar-nav">
          <Link 
            to="/dashboard" 
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <span>Inicio</span>
          </Link>
          
          <Link 
            to="/dashboard/perfil" 
            className={`nav-item ${isActive('/dashboard/perfil') ? 'active' : ''}`}
          >
            <span>Perfil</span>
          </Link>

          <div className="nav-section">
            <h4>MENÚ ESTUDIANTE</h4>
            <Link 
              to="/dashboard/mi-malla" 
              className={`nav-item ${isActive('/dashboard/mi-malla') ? 'active' : ''}`}
            >
              <span>Mi malla</span>
            </Link>
            <Link 
              to="/dashboard/mis-proyecciones" 
              className={`nav-item ${isActive('/dashboard/mis-proyecciones') ? 'active' : ''}`}
            >
              <span>Mis proyecciones</span>
            </Link>
          </div>

          <button className="btn-logout" onClick={handleLogout}>
            <span>Cerrar sesión</span>
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-header"></header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .sidebar {
          width: 280px;
          background: linear-gradient(180deg, #1e3a5f 0%, #2d5a8a 100%);
          color: white;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
        }

        .sidebar-header {
          padding: 20px;
          min-height: 60px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-nav {
          flex: 1;
          padding: 20px 0;
          display: flex;
          flex-direction: column;
        }

        .nav-section {
          margin-top: 20px;
        }

        .nav-section h4 {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
          padding: 10px 20px 5px;
          letter-spacing: 0.5px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          padding-left: 25px;
        }

        .nav-item.active {
          background: rgba(255, 255, 255, 0.15);
          border-left: 4px solid #ff8c42;
          font-weight: 600;
        }

        .btn-logout {
          margin: 20px;
          padding: 12px;
          background: #ff6b35;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .btn-logout:hover {
          background: #ff5722;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #f5f5f5;
        }

        .top-header {
          background: linear-gradient(135deg, #2d8fb8 0%, #1e7a9e 100%);
          padding: 15px 30px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          min-height: 80px;
        }

        .content-area {
          flex: 1;
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 70px;
          }

          .nav-section h4,
          .nav-item span,
          .btn-logout span {
            display: none;
          }

          .nav-item {
            justify-content: center;
          }

          .btn-logout {
            margin: 10px;
            padding: 10px;
          }

          .content-area {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}

export default DashboardPage;