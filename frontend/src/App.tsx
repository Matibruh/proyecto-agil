function App() {
  return (
    <div className="login-page">
      <header className="header-ucn">
        <img src="/images/logo1.webp" alt="Logo UCN" className="logo-ucn" />
        <img src="/images/logo2.svg" alt="Universidad Católica del Norte" className="logo-text" />
      </header>

      <div className="main-container">
        <div className="login-container">
          <div className="header">
            <h1>¡Bienvenid@!</h1>
            <p className="subtitle">Para iniciar sesión debes ingresar tus</p>
            <p className="subtitle">credenciales de <strong>Online UCN</strong></p>
          </div>

          <form>
            <div className="form-group">
              <label htmlFor="rut">RUT</label>
              <input
                type="text"
                id="rut"
                placeholder="Escribe tu RUT"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                placeholder="Escribe tu contraseña"
              />
            </div>

            <button type="submit" className="btn-primary">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
              Iniciar sesión
            </button>

            <div className="links">
              <a href="#">Recuperar mi contraseña</a>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-image: url('/images/fondo.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
          position: relative;
        }

        .login-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1;
        }

        .header-ucn {
          background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%);
          padding: 15px 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          position: relative;
          z-index: 10;
        }

        .header-ucn .logo-ucn {
          height: 70px;
          width: auto;
        }

        .header-ucn .logo-text {
          height: 50px;
          width: auto;
        }

        .main-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
          position: relative;
          z-index: 2;
        }

        .login-container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          width: 100%;
          max-width: 450px;
          padding: 50px 40px;
          animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
        }

        h1 {
          color: #1e5a7d;
          font-size: 26px;
          margin-bottom: 10px;
        }

        .subtitle {
          color: #666;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .subtitle strong {
          color: #2d8fb8;
        }

        .form-group {
          margin-bottom: 25px;
        }

        label {
          display: block;
          color: #333;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        input[type="text"],
        input[type="password"] {
          width: 100%;
          padding: 14px 18px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 15px;
          transition: all 0.3s ease;
          background: #f8f9fa;
        }

        input[type="text"]:focus,
        input[type="password"]:focus {
          outline: none;
          border-color: #2d8fb8;
          background: white;
          box-shadow: 0 0 0 3px rgba(45, 143, 184, 0.1);
        }

        input::placeholder {
          color: #aaa;
        }

        .btn-primary {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 107, 53, 0.4);
        }

        .links {
          text-align: center;
          margin-top: 20px;
        }

        .links a {
          color: #2d8fb8;
          text-decoration: none;
          font-size: 14px;
          cursor: pointer;
        }

        .links a:hover {
          text-decoration: underline;
        }

        .icon {
          width: 20px;
          height: 20px;
        }

        @media (max-width: 768px) {
          .header-ucn {
            padding: 12px 20px;
          }
          .header-ucn .logo-ucn {
            height: 50px;
          }
          .header-ucn .logo-text {
            height: 35px;
          }
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 40px 30px;
          }
          h1 {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;