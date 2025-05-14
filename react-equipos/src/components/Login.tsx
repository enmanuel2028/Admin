import React, { FormEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FiLock, FiMail, FiEye, FiEyeOff, FiSun, FiMoon } from "react-icons/fi";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Verificar preferencia del sistema al cargar
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? "dark" : "light");
    
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    const darkVars = {
      "--bg-color": "#000000",
      "--header-bg": "linear-gradient(145deg, #1E1E1E, #000000)",
      "--card-bg": "linear-gradient(145deg, #1E1E1E, #2B2B2B)",
      "--text-color": "#ffffff",
      "--text-secondary": "#a0aec0",
      "--input-bg": "#1a202c",
      "--card-shadow": "0 10px 20px rgba(160, 32, 240, 0.3)",
      "--header-text": "#ffffff",
    };

    const lightVars = {
      "--bg-color": "#f7fafc",
      "--header-bg": "#3357E9",
      "--card-bg": "linear-gradient(145deg, #ffffff, #f7fafc)",
      "--text-color": "#1a202c",
      "--text-secondary": "#4a5568",
      "--input-bg": "#edf2f7",
      "--card-shadow": "0 10px 20px rgba(37, 99, 235, 0.2)",
      "--header-text": "#ffffff",
    };

    const vars = theme === "dark" ? darkVars : lightVars;

    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    document.body.style.backgroundColor = vars["--bg-color"];
    document.body.style.color = vars["--text-color"];
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleGoogleSignIn = () => {
    console.log("Disparar flujo de login con Google para administradores");
    // Aquí conectar lógica real con Firebase o backend
    navigate("/admin/dashboard");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Login de administrador con email y contraseña");
    // Aquí conectar lógica real con backend
    navigate("/admin/dashboard");
  };

  // Animación para el balón
  const ballVariants = {
    animate: {
      y: [-10, -30, -10],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  // Animación para las estadísticas
  const statsVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      } 
    }
  };

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Botón para cambiar tema */}
      <button 
        onClick={toggleTheme}
        className={`absolute top-4 right-4 p-2 rounded-full ${isDark ? 'bg-gray-800 text-yellow-300' : 'bg-white text-gray-800'} shadow-lg z-50 flex items-center justify-center transition-all duration-300`}
        aria-label="Cambiar tema"
        title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        </button>

      {/* Panel Izquierdo - Solo visible en pantallas medianas y grandes */}
      <div className={`hidden md:flex w-1/2 ${isDark ? 'bg-gray-800' : 'bg-black'} relative flex-col justify-center items-center p-12 text-white overflow-hidden`}>
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute top-0 left-0 w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-md text-center">
          <div className="flex justify-center mb-8">
            <motion.div
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-black text-3xl filter drop-shadow-lg"
              variants={ballVariants}
              animate="animate"
            >
              ⚽
            </motion.div>
          </div>
          <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg tracking-tight">IQScore</h1>
          <p className="text-xl mb-8 font-light">Panel de administración</p>
          
          <motion.div 
            variants={statsVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 gap-4 mt-12"
          >
            <motion.div variants={statsVariants} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-xl font-bold">96%</h3>
              <p className="text-sm opacity-80">Precisión predictiva</p>
            </motion.div>
            <motion.div variants={statsVariants} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-xl font-bold">128K</h3>
              <p className="text-sm opacity-80">Usuarios activos</p>
            </motion.div>
            <motion.div variants={statsVariants} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-xl font-bold">14K</h3>
              <p className="text-sm opacity-80">Partidos analizados</p>
            </motion.div>
            <motion.div variants={statsVariants} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-xl font-bold">$2.5M</h3>
              <p className="text-sm opacity-80">Volumen mensual</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Panel Derecho */}
      <div className={`w-full md:w-1/2 flex items-center justify-center p-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${isDark ? 'bg-gray-700' : 'bg-black'} text-white mb-4 md:hidden`}>
              ⚽
            </div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Acceso Administradores</h2>
            <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
              Ingresa tus credenciales para gestionar la plataforma
            </p>
          </div>

          <div className={`rounded-xl shadow-lg p-8 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email de administrador</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail color={isDark ? '#9CA3AF' : '#6B7280'} />
                  </div>
                  <input
                    type="email"
                    placeholder="admin@iqscore.com"
                    className={`w-full pl-10 pr-3 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50 border-gray-300 focus:ring-black focus:border-black'}`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock color={isDark ? '#9CA3AF' : '#6B7280'} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50 border-gray-300 focus:ring-black focus:border-black'}`}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`focus:outline-none ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className={`rounded ${isDark ? 'bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500' : 'border-gray-300 text-black focus:ring-black'}`} />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Mantener sesión</span>
                </label>
                <a href="#" className={`font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-black hover:text-gray-700'}`}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${isDark ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' : 'bg-black text-white hover:bg-gray-800 focus:ring-gray-800'}`}
              >
                Acceder al panel
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDark ? 'border-gray-700' : 'border-gray-300'}`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>O continúa con</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600 focus:ring-gray-500' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500'}`}
              >
                <FcGoogle />
                <span>Google SSO</span>
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                ¿Necesitas acceso de administrador?{" "}
                <a href="#" className={`font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-black hover:underline'}`}>
                  Contacta con IT
                </a>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              © 2025 IQScore Admin. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;