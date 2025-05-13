import React, { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FiLock, FiMail, FiEye, FiEyeOff } from "react-icons/fi";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Panel Izquierdo - Solo visible en pantallas medianas y grandes */}
      <div className="hidden md:flex w-1/2 bg-black relative flex-col justify-center items-center p-12 text-white overflow-hidden">
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
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black text-white mb-4 md:hidden">
              ⚽
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Acceso Administradores</h2>
            <p className="text-gray-500 mt-2">
              Ingresa tus credenciales para gestionar la plataforma
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email de administrador</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail  />
                  </div>
                  <input
                    type="email"
                    placeholder="admin@iqscore.com"
                    className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock  />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <FiEyeOff  /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                  <span className="text-gray-600">Mantener sesión</span>
                </label>
                <a href="#" className="font-medium text-black hover:text-gray-700">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg bg-black text-white font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 transition-colors"
              >
                Acceder al panel
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O continúa con</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                <FcGoogle />
                <span>Google SSO</span>
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                ¿Necesitas acceso de administrador?{" "}
                <a href="#" className="font-medium text-black hover:underline">
                  Contacta con IT
                </a>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © 2025 IQScore Admin. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;