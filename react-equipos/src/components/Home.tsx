import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faUsers, faTable } from '@fortawesome/free-solid-svg-icons';
import Header from './Header';
import './Home.css';

// Types
interface Liga {
  idLiga: number;
  nombre: string;
  pais: string;
  nivel: string;
  año_inicio: number;
  año_fin: number;
  descripcion_historica: string;
  imagen_logo: string;
  imagen_trofeo: string;
}

const Home = () => {
  // API URLs
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const LIGAS_API_URL = `${API_BASE_URL}/ligas`;

  // State variables
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("Agregar Nueva Liga");
  const [ligaToEdit, setLigaToEdit] = useState<Liga | null>(null);
  const [theme, setTheme] = useState<string>('dark');
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<Partial<Liga>>({
    nombre: '',
    pais: '',
    nivel: '',
    año_inicio: 0,
    año_fin: 0,
    descripcion_historica: '',
    imagen_logo: '',
    imagen_trofeo: ''
  });

  // Load ligas on component mount
  useEffect(() => {
    setupTheme();
    loadLigas();
  }, []);

  // Setup theme
  const setupTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  };

  // Load all ligas
  const loadLigas = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(LIGAS_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setLigas(data);
    } catch (error: any) {
      console.error("Error fetching ligas:", error);
      setError("No se pudieron cargar las ligas. Verifica la conexión o la URL de la API.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === "año_inicio" || id === "año_fin" ? parseInt(value) || 0 : value
    }));
  };

  // Open modal for adding or editing
  const openModal = (liga: Liga | null = null) => {
    if (liga) {
      setModalTitle(`Editar Liga: ${liga.nombre}`);
      setLigaToEdit(liga);
      setFormData({
        nombre: liga.nombre,
        pais: liga.pais,
        nivel: liga.nivel,
        año_inicio: liga.año_inicio,
        año_fin: liga.año_fin,
        descripcion_historica: liga.descripcion_historica,
        imagen_logo: liga.imagen_logo,
        imagen_trofeo: liga.imagen_trofeo
      });
    } else {
      setModalTitle("Agregar Nueva Liga");
      setLigaToEdit(null);
      setFormData({
        nombre: '',
        pais: '',
        nivel: '',
        año_inicio: 0,
        año_fin: 0,
        descripcion_historica: '',
        imagen_logo: '',
        imagen_trofeo: ''
      });
    }
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Delete liga
  const deleteLiga = async (id: number) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la liga con ID ${id}? Esta acción no se puede deshacer.`)) return;

    try {
      const response = await fetch(`${LIGAS_API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) { /* Ignorar si no hay cuerpo JSON */ }
        throw new Error(errorMsg);
      }

      showToast("Liga eliminada correctamente.");
      loadLigas(); // Recargar ligas
    } catch (error: any) {
      console.error("Error deleting liga:", error);
      alert("Error al eliminar la liga: " + error.message);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { nombre, pais, nivel, año_inicio, año_fin, imagen_logo, imagen_trofeo, descripcion_historica } = formData;
    
    if (!nombre || !pais || !nivel || !imagen_logo || !imagen_trofeo || !descripcion_historica) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }
    
    if (año_inicio && año_fin && año_inicio > año_fin) {
      alert("El año de inicio no puede ser mayor que el año de fin.");
      return;
    }

    const method = ligaToEdit ? "PUT" : "POST";
    const url = ligaToEdit ? `${LIGAS_API_URL}/${ligaToEdit.idLiga}` : LIGAS_API_URL;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) { /* Ignorar */ }
        throw new Error(errorMsg);
      }

      closeModal();
      showToast(`Liga ${ligaToEdit ? 'actualizada' : 'agregada'} correctamente.`);
      loadLigas(); // Recargar ligas
    } catch (error: any) {
      console.error("Error saving liga:", error);
      alert(`Error al guardar la liga: ${error.message}`);
    }
  };

  // Navigate to teams page
  const viewTeams = (ligaId: number, ligaNombre: string) => {
    navigate(`/equipos?ligaId=${ligaId}&ligaNombre=${encodeURIComponent(ligaNombre)}`);
  };

  // Navigate to standings page
  const editStandings = (ligaId: number, ligaNombre: string) => {
    navigate(`/posiciones?ligaId=${ligaId}&ligaNombre=${encodeURIComponent(ligaNombre)}`);
  };

  // Show toast message
  const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'fixed bottom-5 right-5 p-3 rounded shadow-lg text-white z-50';
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'light') {
      toast.style.backgroundColor = '#2563EB';
    } else {
      toast.style.backgroundColor = '#4C4CFF';
    }

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      <main className="p-6 flex-grow">
        <div className="intro-card mb-6 text-center shadow-lg mb-4">
          <h1 className="text-3xl font-bold mb-2">Administrador de Ligas</h1>
          <p className="text-lg">Gestiona las ligas de fútbol. Asegura la integridad de los datos y mantén altos estándares de seguridad.</p>
        </div>

        <div className="flex justify-end mb-6">
          <button 
            className="button-gradient text-white font-semibold shadow-md hover:shadow-lg transition-shadow"
            onClick={() => openModal()}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />Agregar Liga
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="col-span-full text-center text-xl" style={{ color: "var(--text-secondary)" }}>Cargando ligas...</p>
          ) : error ? (
            <p className="col-span-full text-center text-red-500 font-semibold p-4 bg-red-100 dark:bg-red-900 rounded border border-red-500">
              {error}
            </p>
          ) : ligas.length === 0 ? (
            <p className="col-span-full text-center text-xl" style={{ color: "var(--text-secondary)" }}>No hay ligas para mostrar.</p>
          ) : (
            ligas.map(liga => (
              <div key={liga.idLiga} className="card shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <img 
                      src={liga.imagen_logo || 'placeholder-logo.png'} 
                      alt={`${liga.nombre} Logo`} 
                      className="w-16 h-16 object-contain mr-4 rounded flex-shrink-0" 
                    />
                    <div className="flex space-x-2 flex-shrink-0">
                      <button 
                        className="action-button edit-button" 
                        title="Editar Liga"
                        onClick={() => openModal(liga)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        className="action-button delete-button" 
                        title="Eliminar Liga"
                        onClick={() => deleteLiga(liga.idLiga)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-1 truncate" title={liga.nombre}>{liga.nombre}</h2>
                  <p className="text-sm mb-2 font-medium" style={{ color: "var(--text-secondary)" }}>{liga.pais} - Nivel {liga.nivel}</p>
                  <p style={{ color: "var(--text-secondary)" }} className="text-sm mb-3 clamp-lines-3">{liga.descripcion_historica || 'Sin descripción.'}</p>
                  <div className="flex justify-between items-center text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
                    <span>Temporada: {liga.año_inicio} - {liga.año_fin}</span>
                  </div>
                  <div className="mb-4 flex justify-center">
                    <img 
                      src={liga.imagen_trofeo || 'placeholder-trophy.png'} 
                      alt={`${liga.nombre} Trofeo`} 
                      className="max-h-40 w-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="mt-auto space-y-2">
                  <button 
                    className="button-secondary w-full"
                    onClick={() => viewTeams(liga.idLiga, liga.nombre)}
                  >
                    <FontAwesomeIcon icon={faUsers} className="mr-2" />Ver Equipos
                  </button>
                  <button 
                    className="button-secondary w-full"
                    onClick={() => editStandings(liga.idLiga, liga.nombre)}
                  >
                    <FontAwesomeIcon icon={faTable} className="mr-2" />Editar Posiciones
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="modal-content w-11/12 max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{modalTitle}</h2>
              <button 
                onClick={closeModal} 
                className="text-xl font-bold hover:text-red-500" 
                style={{ color: "var(--text-secondary)" }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium mb-1">Nombre</label>
                  <input 
                    type="text" 
                    id="nombre" 
                    className="modal-input" 
                    value={formData.nombre || ''}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="pais" className="block text-sm font-medium mb-1">País</label>
                  <input 
                    type="text" 
                    id="pais" 
                    className="modal-input" 
                    value={formData.pais || ''}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="nivel" className="block text-sm font-medium mb-1">Nivel</label>
                  <input 
                    type="text" 
                    id="nivel" 
                    className="modal-input" 
                    value={formData.nivel || ''}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="año_inicio" className="block text-sm font-medium mb-1">Año de Inicio</label>
                  <input 
                    type="number" 
                    id="año_inicio" 
                    className="modal-input" 
                    placeholder="Ej: 1929" 
                    value={formData.año_inicio || ''}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="año_fin" className="block text-sm font-medium mb-1">Año de Fin</label>
                  <input 
                    type="number" 
                    id="año_fin" 
                    className="modal-input" 
                    placeholder="Ej: 2024" 
                    value={formData.año_fin || ''}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="imagen_logo" className="block text-sm font-medium mb-1">URL del Logo</label>
                  <input 
                    type="url" 
                    id="imagen_logo" 
                    className="modal-input" 
                    placeholder="https://ejemplo.com/logo.png" 
                    value={formData.imagen_logo || ''}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="imagen_trofeo" className="block text-sm font-medium mb-1">URL del Trofeo</label>
                  <input 
                    type="url" 
                    id="imagen_trofeo" 
                    className="modal-input" 
                    placeholder="https://ejemplo.com/trofeo.png" 
                    value={formData.imagen_trofeo || ''}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="descripcion_historica" className="block text-sm font-medium mb-1">Descripción Histórica</label>
                  <textarea 
                    id="descripcion_historica" 
                    rows={4} 
                    className="modal-input" 
                    value={formData.descripcion_historica || ''}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium shadow-sm" 
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="button-gradient text-white font-semibold shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;