import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrophy, faTrashAlt, faPlus, faInfoCircle, faSpinner, faSyncAlt, faExclamationTriangle, faExclamationCircle, faMoon, faSun, faCog, faBars } from '@fortawesome/free-solid-svg-icons';
import './Teams.css';

// Define interfaces for our data types
interface Liga {
  idLiga: number;
  nombre: string;
  pais: string;
  nivel: string;
  año_inicio: string;
  año_fin: string;
  descripcion_historica?: string;
  imagen_logo?: string;
  imagen_trofeo?: string;
}

interface Equipo {
  idEquipo: number;
  nombre: string;
  idLiga: number;
  ciudad: string;
  estadioNombre: string;
  ubicacionEstadio: string;
  descripcionHistorica?: string;
  valorMercado: number | string;
  entrenador: string;
  presidente: string;
  logo: string;
  estadioLogo: string;
}

const Teams: React.FC = () => {
  // API URLs
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const LIGAS_API_URL = `${API_BASE_URL}/ligas`;
  const EQUIPOS_API_URL = `${API_BASE_URL}/equipo`;

  // State variables
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [currentLigaId, setCurrentLigaId] = useState<number | null>(null);
  const [currentLiga, setCurrentLiga] = useState<Liga | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showTeamModal, setShowTeamModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [equipoToEdit, setEquipoToEdit] = useState<Equipo | null>(null);
  const [equipoToDelete, setEquipoToDelete] = useState<number | null>(null);
  const [theme, setTheme] = useState<string>('dark');

  // Form state
  const [formData, setFormData] = useState<Partial<Equipo>>({
    nombre: '',
    idLiga: 0,
    ciudad: '',
    estadioNombre: '',
    ubicacionEstadio: '',
    descripcionHistorica: '',
    valorMercado: '',
    entrenador: '',
    presidente: '',
    logo: '',
    estadioLogo: ''
  });

  // Load ligas on component mount
  useEffect(() => {
    loadLigas();
    setupTheme();
  }, []);

  // Load equipos when liga changes
  useEffect(() => {
    if (currentLigaId) {
      loadEquipos(currentLigaId);
      loadLigaInfo(currentLigaId);
    }
  }, [currentLigaId]);

  // Setup theme
  const setupTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Load all ligas for the selector
  const loadLigas = async () => {
    try {
      const response = await fetch(LIGAS_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setLigas(data);
    } catch (error) {
      console.error("Error fetching ligas:", error);
      setError("No se pudieron cargar las ligas. Verifica la conexión o la URL de la API.");
    }
  };

  // Load liga info
  const loadLigaInfo = async (ligaId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/liga/${ligaId}`);
      if (!response.ok) {
        throw new Error(`Error al cargar información de la liga: ${response.status}`);
      }
      const data = await response.json();
      setCurrentLiga(data[0]);
    } catch (error) {
      console.error("Error fetching liga info:", error);
      setError("No se pudo cargar la información de la liga.");
    }
  };

  // Load equipos for the selected liga
  const loadEquipos = async (ligaId: number) => {
    setLoading(true);
    setError(null);
    setEquipos([]);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${API_BASE_URL}/liga/equipos/${ligaId}`, { 
        signal: controller.signal 
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetail = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorDetail = errorData.message || errorData.error || errorDetail;
        } catch (e) { /* No se pudo parsear JSON */ }
        throw new Error(errorDetail);
      }

      const equiposFromServer = await response.json();
      const equiposParaMostrar = equiposFromServer.map((equipo: any) => ({
        idEquipo: equipo.idEquipo,
        nombre: equipo.nombre,
        idLiga: equipo.idLiga,
        ciudad: equipo.ciudad,
        estadioNombre: equipo.estadioNombre,
        ubicacionEstadio: equipo.ubicacionEstadio,
        descripcionHistorica: equipo.descripcionHistorica,
        valorMercado: equipo.valorMercado || equipo.valor_mercado,
        entrenador: equipo.entrenador,
        presidente: equipo.presidente,
        logo: equipo.logo,
        estadioLogo: equipo.estadioLogo || equipo.estadiologo
      }));

      setEquipos(equiposParaMostrar);
    } catch (error: any) {
      console.error("Error fetching equipos:", error);
      let errorMessage = "Error al cargar los equipos.";
      let errorDetails = error.message || "Error desconocido.";

      if (error.name === 'AbortError') {
        errorMessage = "La solicitud tardó demasiado.";
        errorDetails = "Verifica tu conexión a internet o si el servidor está respondiendo.";
      } else if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        errorMessage = "No se pudo conectar al servidor.";
        errorDetails = `Verifica tu conexión y que la URL base (${API_BASE_URL}) sea correcta y accesible.`;
      } else if (error.message.includes("404")) {
        errorMessage = "Recurso no encontrado (Error 404).";
        errorDetails = `La URL ${API_BASE_URL}/liga/equipos/${currentLigaId} podría ser incorrecta o no existir.`;
      } else if (error.message.includes("500")) {
        errorMessage = "Error interno del servidor (Error 500).";
        errorDetails = "El servidor encontró un problema procesando la solicitud.";
      }

      setError(`${errorMessage} ${errorDetails}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Open team modal for adding or editing
  const openTeamModal = (equipo: Equipo | null = null) => {
    if (equipo) {
      setEquipoToEdit(equipo);
      setFormData({
        nombre: equipo.nombre || '',
        idLiga: equipo.idLiga,
        ciudad: equipo.ciudad || '',
        estadioNombre: equipo.estadioNombre || '',
        ubicacionEstadio: equipo.ubicacionEstadio || '',
        descripcionHistorica: equipo.descripcionHistorica || '',
        valorMercado: equipo.valorMercado || '',
        entrenador: equipo.entrenador || '',
        presidente: equipo.presidente || '',
        logo: equipo.logo || '',
        estadioLogo: equipo.estadioLogo || ''
      });
    } else {
      setEquipoToEdit(null);
      setFormData({
        nombre: '',
        idLiga: currentLigaId || 0,
        ciudad: '',
        estadioNombre: '',
        ubicacionEstadio: '',
        descripcionHistorica: '',
        valorMercado: '',
        entrenador: '',
        presidente: '',
        logo: '',
        estadioLogo: ''
      });
    }
    setShowTeamModal(true);
  };

  // Show confirmation modal for deleting
  const openConfirmModal = (equipo: Equipo) => {
    setEquipoToDelete(equipo.idEquipo);
    setShowConfirmModal(true);
  };

  // Handle form submission (create/update equipo)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const equipoData = {
      nombre: formData.nombre,
      idLiga: formData.idLiga,
      ciudad: formData.ciudad,
      estadioNombre: formData.estadioNombre,
      ubicacionEstadio: formData.ubicacionEstadio,
      descripcionHistorica: formData.descripcionHistorica,
      valorMercado: formData.valorMercado,
      entrenador: formData.entrenador,
      presidente: formData.presidente,
      logo: formData.logo,
      estadioLogo: formData.estadioLogo
    };

    const equipoId = equipoToEdit?.idEquipo;
    const method = equipoId ? 'PUT' : 'POST';
    const url = equipoId ? `${EQUIPOS_API_URL}/${equipoId}` : EQUIPOS_API_URL;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(equipoData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      // Close modal and reload equipos
      setShowTeamModal(false);
      if (currentLigaId) {
        loadEquipos(currentLigaId);
      }
    } catch (error: any) {
      console.error("Error al guardar equipo:", error);
      alert("Error al guardar el equipo: " + error.message);
    }
  };

  // Delete equipo
  const deleteEquipo = async () => {
    if (!equipoToDelete) return;
    
    try {
      const response = await fetch(`${EQUIPOS_API_URL}/${equipoToDelete}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Close modal and reload equipos
      setShowConfirmModal(false);
      if (currentLigaId) {
        loadEquipos(currentLigaId);
      }
    } catch (error: any) {
      console.error("Error al eliminar equipo:", error);
      alert("Error al eliminar el equipo: " + error.message);
    }
  };

  // Navigate to team titles page
  const goToTeamTitles = (equipoId: number) => {
    window.location.href = `/titulos/${equipoId}`;
  };

  // Format currency value
  const formatCurrency = (value: number | string) => {
    if (!value) return 'No disponible';
    return '€' + new Intl.NumberFormat('de-DE').format(parseFloat(value.toString()));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="p-6 flex-grow">
        {/* Liga selector */}
        <div className="flex justify-start mb-6">
          <div className="flex items-center">
            <label htmlFor="liga-select" className="mr-2 font-medium">Ver equipos de la liga:</label>
            <select 
              id="liga-select" 
              className="bg-[var(--input-bg)] text-[var(--text-color)] border border-opacity-20 p-2 rounded-md mr-4"
              value={currentLigaId || ''}
              onChange={(e) => setCurrentLigaId(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">-- Selecciona una Liga --</option>
              {ligas.map(liga => (
                <option key={liga.idLiga} value={liga.idLiga}>{liga.nombre}</option>
              ))}
            </select>
            <button 
              className="bg-[#4CAF50] hover:bg-[#3e8e41] text-white font-semibold py-2 px-4 rounded flex items-center"
              onClick={() => openTeamModal()}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Agregar Equipo
            </button>
          </div>
        </div>

        {/* Liga info card */}
        {currentLiga && (
          <div className="bg-[var(--card-bg)] text-[var(--text-color)] p-6 rounded-lg shadow-lg mb-8 flex flex-col items-center text-center">
            <div className="flex items-center mb-6 w-full">
              <img 
                src={currentLiga.imagen_logo || 'https://via.placeholder.com/80?text=N/A'} 
                alt={`${currentLiga.nombre} Logo`} 
                className="w-20 h-20 object-contain mr-6"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Error' }}
              />
              <div className="text-left flex-grow">
                <h2 className="text-2xl font-bold">{currentLiga.nombre}</h2>
                <p className="text-lg text-[var(--text-secondary)]">{currentLiga.pais} - {currentLiga.nivel}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-4">
              <div className="bg-opacity-5 bg-white p-3 rounded">
                <strong className="block mb-1 text-[var(--text-secondary)]">Temporada</strong>
                {currentLiga.año_inicio} - {currentLiga.año_fin}
              </div>
              <div className="bg-opacity-5 bg-white p-3 rounded">
                <strong className="block mb-1 text-[var(--text-secondary)]">País</strong>
                {currentLiga.pais}
              </div>
              <div className="bg-opacity-5 bg-white p-3 rounded">
                <strong className="block mb-1 text-[var(--text-secondary)]">Nivel</strong>
                {currentLiga.nivel}
              </div>
            </div>
            
            <p className="mt-4 text-left w-full">{currentLiga.descripcion_historica || 'No hay descripción disponible.'}</p>
            
            {currentLiga.imagen_trofeo && (
              <img 
                src={currentLiga.imagen_trofeo} 
                alt={`Trofeo de ${currentLiga.nombre}`} 
                className="w-full max-w-[300px] h-auto object-contain mt-4 rounded"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x150?text=Error' }}
              />
            )}
          </div>
        )}

        {/* Loading, error or empty states */}
        {loading && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center justify-center">
              <FontAwesomeIcon icon={faSpinner} className="text-4xl mb-4 text-[var(--text-secondary)] animate-spin" />
              <p className="text-xl text-[var(--text-secondary)]">Cargando equipos...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-[var(--error-bg)] text-[var(--error-text)] p-8 rounded-lg text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl mb-4" />
            <p className="text-xl font-medium mb-2">{error.split(' ')[0]}</p>
            <p className="text-sm mb-4">{error.split(' ').slice(1).join(' ')}</p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium shadow-sm"
              onClick={() => currentLigaId && loadEquipos(currentLigaId)}
            >
              <FontAwesomeIcon icon={faSyncAlt} className="mr-2" />
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && currentLigaId && equipos.length === 0 && (
          <div className="empty-state">
            <FontAwesomeIcon icon={faExclamationCircle} className="text-4xl mb-4" />
            <p className="text-xl font-medium">No se encontraron equipos en la liga seleccionada.</p>
          </div>
        )}

        {!loading && !error && !currentLigaId && (
          <div className="empty-state">
            <FontAwesomeIcon icon={faInfoCircle} className="text-4xl mb-4" />
            <p className="text-xl font-medium">Selecciona una liga para ver los equipos.</p>
          </div>
        )}

        {/* Equipos grid */}
        {!loading && !error && equipos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipos.map(equipo => (
              <div key={equipo.idEquipo} className="bg-[var(--card-bg)] rounded-lg shadow-lg p-6 flex flex-col transition-transform hover:translate-y-[-10px] hover:shadow-[var(--card-shadow)]">
                <div className="flex items-center mb-4">
                  <img 
                    src={equipo.logo || 'https://via.placeholder.com/60?text=N/A'} 
                    alt={`${equipo.nombre} Logo`} 
                    className="w-[60px] h-[60px] object-contain mr-4 rounded flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60?text=Error' }}
                  />
                  <div className="flex-grow">
                    <h2 className="text-xl font-bold mb-1 truncate" title={equipo.nombre}>{equipo.nombre}</h2>
                    <p className="text-sm text-[var(--text-secondary)]">Ciudad: {equipo.ciudad || 'No disponible'}</p>
                    <p className="text-sm text-[var(--text-secondary)]">Valor: {formatCurrency(equipo.valorMercado)}</p>
                  </div>
                </div>

                <div>
                  <img 
                    src={equipo.estadioLogo || 'https://via.placeholder.com/400x150?text=Estadio+No+Disponible'} 
                    alt={`Estadio de ${equipo.nombre}`} 
                    className="w-full h-[150px] object-cover rounded mt-4"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x150?text=Error' }}
                  />
                </div>

                <div className="flex gap-2 mt-4">
                  <button 
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-1 rounded text-sm font-semibold flex items-center justify-center"
                    onClick={() => openTeamModal(equipo)}
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-1" /> Editar
                  </button>
                  <button 
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-1 rounded text-sm font-semibold flex items-center justify-center"
                    onClick={() => goToTeamTitles(equipo.idEquipo)}
                  >
                    <FontAwesomeIcon icon={faTrophy} className="mr-1" /> Títulos
                  </button>
                  <button 
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-1 rounded text-sm font-semibold flex items-center justify-center"
                    onClick={() => openConfirmModal(equipo)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} className="mr-1" /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>


      {/* Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-[var(--card-bg)] p-8 rounded-lg w-[90%] max-w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{equipoToEdit ? 'Editar Equipo' : 'Agregar Nuevo Equipo'}</h2>
              <button 
                className="absolute top-0 right-0 p-4 text-2xl font-bold"
                onClick={() => setShowTeamModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="nombre" className="block mb-2 font-semibold">Nombre del Equipo:</label>
                <input 
                  type="text" 
                  id="nombre" 
                  className="w-full p-2 rounded border border-[var(--text-secondary)] bg-[var(--input-bg)] text-[var(--text-color)]"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="idLiga" className="block mb-2 font-semibold">Liga:</label>
                <select 
                  id="idLiga" 
                  className="w-full p-2 rounded border border-[var(--text-secondary)] bg-[var(--input-bg)] text-[var(--text-color)]"
                  value={formData.idLiga || ''}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona una liga</option>
                  {ligas.map(liga => (
                    <option key={liga.idLiga} value={liga.idLiga}>{liga.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="ciudad" className="block mb-2 font-semibold">Ciudad:</label>
                <input 
                  type="text" 
                  id="ciudad" 
                  className="w-full p-2 rounded border border-[var(--text-secondary)] bg-[var(--input-bg)] text-[var(--text-color)]"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="estadioNombre" className="block mb-2 font-semibold">Nombre del Estadio:</label>
                <input 
                  type="text" 
                  id="estadioNombre" 
                  className="w-full p-2 rounded border border-[var(--text-secondary)] bg-[var(--input-bg)] text-[var(--text-color)]"
                  value={formData.estadioNombre}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="ubicacionEstadio" className="block mb-2 font-semibold">Ubicación del Estadio:</label>
                <input 
                  type="text" 
                  id="ubicacionEstadio" 
                  className="w-full p-2 rounded border border-[var(--text-secondary)] bg-[var(--input-bg)] text-[var(--text-color)]"
                  value={formData.ubicacionEstadio}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="descripcionHistorica" className="block mb-2 font-semibold">Descripción Histórica:</label>
                <textarea 
                  id="descripcionHistorica" 
                  rows={3}
                  className="w-full p-2 rounded border border-[var(--text-secondary)] bg-[var(--input-bg)] text-[var(--text-color)]"
                  value={formData.descripcionHistorica}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="valorMercado" className="block mb-2 font-semibold">Valor de Mercado (€):</label>
                <input 
                  type="number" 
                  id="valorMercado" 
                  step="0.01"
                  className="w-full p-2 rounded border border-[var(--text-secondary)] bg-[var(--input-bg)] text-[var(--text-color)]"
                  value={formData.valorMercado}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="entrenador" className="block mb-2 font-semibold">Entrenador:</label>
                <input 
                  type="text" 
                  id="entrenador" 
                  className="w-full p-2 rounded border border-[var(--text-secondary)] bg-[var(--input-bg)] text-[var(--text-color)]"
                  value={formData.entrenador}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="presidente" className="block mb-2 font-semibold">Presidente:</label>
                <input 
                  type="text" 
                  id="presidente" 
                  className="w-full p-2 rounded border border-[var(--text-secondary)] bg-[var(--input-bg)] text-[var(--text-color)]"
                  value={formData.presidente}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="logo" className="block mb-2 font-semibold">URL del Logo:</label>
                <input 
                  type="url" 
                  id="logo" 
                  className="w-full p-2 rounded border border-[var(--text-secondary)] bg-[var(--input-bg)] text-[var(--text-color)]"
                  value={formData.logo}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="estadioLogo" className="block mb-2 font-semibold">URL del Logo del Estadio:</label>
                <input 
                  type="url" 
                  id="estadioLogo" 
                  className="w-full p-2 rounded border border-[var(--text-secondary)] bg-[var(--input-bg)] text-[var(--text-color)]"
                  value={formData.estadioLogo}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button 
                  type="submit" 
                  className="btn btn-primary flex-1"
                >
                  Guardar
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger flex-1"
                  onClick={() => setShowTeamModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmModal && (
        <div className="modal" style={{display: 'flex'}}>
          <div className="modal-content">
            <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
            <p className="mb-6">¿Estás seguro de que deseas eliminar este equipo?</p>
            <div className="flex gap-2">
              <button 
                className="btn btn-danger flex-1"
                onClick={deleteEquipo}
              >
                Sí, Eliminar
              </button>
              <button 
                className="btn btn-primary flex-1"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;