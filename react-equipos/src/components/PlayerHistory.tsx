import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye, faEdit, faTrashAlt, faPlus, faSpinner,
  faExclamationTriangle, faTimes, faCheck, faSave
} from '@fortawesome/free-solid-svg-icons';
import './Players.css';

// Define interfaces for our data types
interface Liga {
  idLiga: number;
  nombre: string;
  pais?: string;
  nivel?: string;
  año_inicio?: string;
  año_fin?: string;
  descripcion_historica?: string;
  imagen_logo?: string;
  imagen_trofeo?: string;
}

interface Equipo {
  idEquipo: number;
  nombre: string;
  idLiga: number;
  ciudad?: string;
  estadioNombre?: string;
  ubicacionEstadio?: string;
  descripcionHistorica?: string;
  valorMercado?: string;
  valor_mercado?: string; // Alternative property name from API
  entrenador?: string;
  presidente?: string;
  logo?: string;
  estadioLogo?: string;
  estadiologo?: string; // Alternative property name from API
}

interface Jugador {
  idJugador: number;
  nombre: string;
  edad?: number;
  fecha_nacimiento?: string;
  nacionalidad?: string;
  altura?: number;
  peso?: number;
  pierna_habil?: string;
  posicion?: string;
  posicion_ideal?: string;
  idEquipoActual: number;
  valor_mercado?: number | string;
  numero_camiseta?: number;
  logo?: string;
  habilidades?: string;
  nacionalidad_logo?: string;
  caracteristicas?: string;
  atributos?: string;
}

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const PlayersHistory = () => {
  // API URLs
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const LIGAS_API_URL = `${API_BASE_URL}/ligas`;
  const EQUIPOS_POR_LIGA_API_URL = (ligaId: number) => `${API_BASE_URL}/liga/equipos/${ligaId}`;
  const JUGADORES_POR_EQUIPO_API_URL = (equipoId: number) => `${API_BASE_URL}/equipo/jugadores/${equipoId}`;
  const JUGADOR_API_URL = (jugadorId: number) => `${API_BASE_URL}/jugadores/${jugadorId}`;
  const JUGADORES_API_URL = `${API_BASE_URL}/jugadores`;
  const JUGADOR_DETALLES_API_URL = (jugadorId: number) => `${API_BASE_URL}/jugadordetalles/${jugadorId}`;

  // State variables
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [currentLigaId, setCurrentLigaId] = useState<number | null>(null);
  const [currentEquipoId, setCurrentEquipoId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showPlayerDetailsModal, setShowPlayerDetailsModal] = useState<boolean>(false);
  const [jugadorToEdit, setJugadorToEdit] = useState<Jugador | null>(null);
  const [jugadorToDelete, setJugadorToDelete] = useState<number | null>(null);
  const [jugadorDetails, setJugadorDetails] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Form state
  const [formData, setFormData] = useState<Partial<Jugador>>({
    nombre: '',
    edad: undefined,
    fecha_nacimiento: '',
    nacionalidad: '',
    altura: undefined,
    peso: undefined,
    pierna_habil: '',
    posicion: '',
    posicion_ideal: '',
    idEquipoActual: 0,
    valor_mercado: '',
    numero_camiseta: undefined,
    logo: '',
    habilidades: '',
    nacionalidad_logo: '',
    caracteristicas: '',
    atributos: ''
  });

  // Load ligas on component mount
  useEffect(() => {
    loadLigas();
  }, []);

  // Load equipos when liga changes
  useEffect(() => {
    if (currentLigaId) {
      loadEquiposForLiga(currentLigaId);
    }
  }, [currentLigaId]);

  // Auto-dismiss notifications after 3 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  // Add notification
  const addNotification = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  // Load all ligas for the selector
  const loadLigas = async () => {
    try {
      setLoading(true);
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

  // Load equipos for the selected liga
  const loadEquiposForLiga = async (ligaId: number) => {
    try {
      setLoading(true);
      setEquipos([]);
      setCurrentEquipoId(null);
      setJugadores([]);

      const response = await fetch(EQUIPOS_POR_LIGA_API_URL(ligaId));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      // Process the data to handle different property names
      const processedData = data.map((equipo: any) => ({
        ...equipo,
        valorMercado: equipo.valorMercado || equipo.valor_mercado,
        estadioLogo: equipo.estadioLogo || equipo.estadiologo
      }));
      
      setEquipos(processedData);
    } catch (error: any) {
      console.error("Error fetching equipos:", error);
      setError("Error al cargar los equipos.");
    } finally {
      setLoading(false);
    }
  };

  // Load jugadores for the selected equipo
  const loadJugadoresForEquipo = async (equipoId: number) => {
    try {
      setLoading(true);
      setJugadores([]);
      setError(null);

      const response = await fetch(JUGADORES_POR_EQUIPO_API_URL(equipoId));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      // Process the data to handle different property names
      const processedData = data.map((jugador: any) => ({
        idJugador: jugador.ID_Jugador || jugador.idJugador,
        nombre: jugador.Nombre || jugador.nombre,
        posicion: jugador.Posicion || jugador.posicion,
        edad: jugador.Edad || jugador.edad,
        nacionalidad: jugador.Nacionalidad || jugador.nacionalidad,
        valor_mercado: jugador.Valor_Mercado || jugador.valor_mercado,
        logo: jugador.Foto || jugador.logo
      }));
      
      setJugadores(processedData);
    } catch (error: any) {
      console.error("Error fetching jugadores:", error);
      setError("Error al cargar los jugadores.");
    } finally {
      setLoading(false);
    }
  };

  // Load jugador details
  const loadJugadorDetails = async (jugadorId: number) => {
    try {
      setLoading(true);
      const response = await fetch(JUGADOR_API_URL(jugadorId));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setJugadorDetails(data);
      setShowPlayerDetailsModal(true);
    } catch (error: any) {
      console.error("Error fetching jugador details:", error);
      addNotification("Error al cargar los detalles del jugador.", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle liga select change
  const handleLigaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ligaId = parseInt(e.target.value);
    setCurrentLigaId(ligaId || null);
  };

  // Handle equipo select change
  const handleEquipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const equipoId = parseInt(e.target.value);
    setCurrentEquipoId(equipoId || null);
    if (equipoId) {
      loadJugadoresForEquipo(equipoId);
    } else {
      setJugadores([]);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Open player modal for adding or editing
  const openPlayerModal = (jugador: Jugador | null = null) => {
    if (jugador) {
      setJugadorToEdit(jugador);
      setFormData({
        nombre: jugador.nombre,
        edad: jugador.edad,
        fecha_nacimiento: jugador.fecha_nacimiento,
        nacionalidad: jugador.nacionalidad,
        altura: jugador.altura,
        peso: jugador.peso,
        pierna_habil: jugador.pierna_habil,
        posicion: jugador.posicion,
        posicion_ideal: jugador.posicion_ideal,
        idEquipoActual: jugador.idEquipoActual || (currentEquipoId as number),
        valor_mercado: jugador.valor_mercado,
        numero_camiseta: jugador.numero_camiseta,
        logo: jugador.logo,
        habilidades: jugador.habilidades,
        nacionalidad_logo: jugador.nacionalidad_logo,
        caracteristicas: jugador.caracteristicas,
        atributos: jugador.atributos
      });
    } else {
      setJugadorToEdit(null);
      setFormData({
        nombre: '',
        edad: undefined,
        fecha_nacimiento: '',
        nacionalidad: '',
        altura: undefined,
        peso: undefined,
        pierna_habil: '',
        posicion: '',
        posicion_ideal: '',
        idEquipoActual: currentEquipoId as number,
        valor_mercado: '',
        numero_camiseta: undefined,
        logo: '',
        habilidades: '',
        nacionalidad_logo: '',
        caracteristicas: '',
        atributos: ''
      });
    }
    setShowPlayerModal(true);
  };

  // Close player modal
  const closePlayerModal = () => {
    setShowPlayerModal(false);
    setJugadorToEdit(null);
  };

  // Close player details modal
  const closePlayerDetailsModal = () => {
    setShowPlayerDetailsModal(false);
    setJugadorDetails(null);
  };

  // Show confirm delete modal
  const showConfirmDelete = (jugadorId: number) => {
    setJugadorToDelete(jugadorId);
    setShowConfirmModal(true);
  };

  // Close confirm modal
  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setJugadorToDelete(null);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const jugadorData = {
        ...formData,
        idEquipoActual: currentEquipoId
      };
      
      const method = jugadorToEdit ? 'PUT' : 'POST';
      const url = jugadorToEdit 
        ? JUGADOR_API_URL(jugadorToEdit.idJugador) 
        : JUGADORES_API_URL;
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jugadorData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }
      
      // Reload jugadores
      if (currentEquipoId) {
        loadJugadoresForEquipo(currentEquipoId);
      }
      
      closePlayerModal();
      addNotification(
        jugadorToEdit 
          ? "Jugador actualizado correctamente" 
          : "Jugador agregado correctamente", 
        'success'
      );
    } catch (error: any) {
      console.error("Error saving jugador:", error);
      addNotification("Error al guardar el jugador.", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete jugador
  const deleteJugador = async () => {
    if (!jugadorToDelete) return;
    
    try {
      setLoading(true);
      const response = await fetch(JUGADOR_API_URL(jugadorToDelete), {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }
      
      // Reload jugadores
      if (currentEquipoId) {
        loadJugadoresForEquipo(currentEquipoId);
      }
      
      closeConfirmModal();
      addNotification("Jugador eliminado correctamente", 'success');
    } catch (error: any) {
      console.error("Error deleting jugador:", error);
      addNotification("Error al eliminar el jugador.", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get position class for styling
  const getPositionClass = (posicion: string | undefined) => {
    if (!posicion) return '';
    const pos = posicion.toLowerCase();
    
    if (pos.includes('delantero') || pos.includes('forward')) {
      return 'position-fw';
    } else if (pos.includes('medio') || pos.includes('midfielder')) {
      return 'position-mf';
    } else if (pos.includes('defensa') || pos.includes('defender')) {
      return 'position-df';
    } else if (pos.includes('portero') || pos.includes('goalkeeper')) {
      return 'position-gk';
    }
    return '';
  };

  // Get position background class for styling
  const getPositionBgClass = (posicion: string | undefined) => {
    if (!posicion) return '';
    const pos = posicion.toLowerCase();
    
    if (pos.includes('delantero') || pos.includes('forward')) {
      return 'position-fw-bg';
    } else if (pos.includes('medio') || pos.includes('midfielder')) {
      return 'position-mf-bg';
    } else if (pos.includes('defensa') || pos.includes('defender')) {
      return 'position-df-bg';
    } else if (pos.includes('portero') || pos.includes('goalkeeper')) {
      return 'position-gk-bg';
    }
    return '';
  };

  // Format currency
  const formatCurrency = (value: number | string | undefined) => {
    if (!value) return 'N/A';
    return '€' + new Intl.NumberFormat('de-DE').format(parseFloat(value.toString()));
  };

  return (
    <div className="p-4 md:p-6">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification ${notification.type === 'success' ? 'success' : 'error'}`}
          >
            <div className="notification-icon">
              <FontAwesomeIcon icon={notification.type === 'success' ? faCheck : faExclamationTriangle} />
            </div>
            <div className="notification-message">{notification.message}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-start mb-6 gap-4 items-center">
        <div className="flex items-center flex-1 min-w-0">
          <label htmlFor="liga-select" className="mr-2 font-medium whitespace-nowrap">Liga:</label>
          <select 
            id="liga-select" 
            className="selector flex-1 min-w-0"
            value={currentLigaId || ''}
            onChange={handleLigaChange}
          >
            <option value="">-- Selecciona Liga --</option>
            {ligas.map(liga => (
              <option key={liga.idLiga} value={liga.idLiga}>{liga.nombre}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center flex-1 min-w-0">
          <label htmlFor="equipo-select" className="mr-2 font-medium whitespace-nowrap">Equipo:</label>
          <select 
            id="equipo-select" 
            className="selector flex-1 min-w-0"
            value={currentEquipoId || ''}
            onChange={handleEquipoChange}
            disabled={!currentLigaId || equipos.length === 0}
          >
            <option value="">
              {!currentLigaId 
                ? '-- Selecciona una liga primero --' 
                : equipos.length === 0 
                  ? 'No hay equipos disponibles' 
                  : '-- Selecciona Equipo --'}
            </option>
            {equipos.map(equipo => (
              <option key={equipo.idEquipo} value={equipo.idEquipo}>{equipo.nombre}</option>
            ))}
          </select>
        </div>
        <button 
          className="btn btn-success whitespace-nowrap" 
          onClick={() => openPlayerModal()}
          disabled={!currentEquipoId}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Agregar Jugador
        </button>
      </div>

      {/* Loading or Error States */}
      {loading && (
        <div className="col-span-full text-center py-12">
          <div className="flex flex-col items-center justify-center">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl mb-4 loading-spinner" />
            <p className="text-xl text-secondary">Cargando...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="error-state">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl mb-4" />
          <h3 className="text-xl font-bold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && jugadores.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <h3 className="text-xl font-bold mb-2">
            {!currentLigaId 
              ? 'Selecciona una liga' 
              : !currentEquipoId 
                ? 'Selecciona un equipo' 
                : 'No hay jugadores'}
          </h3>
          <p className="text-secondary">
            {!currentLigaId 
              ? 'Selecciona una liga para ver los equipos disponibles.' 
              : !currentEquipoId 
                ? 'Selecciona un equipo para ver sus jugadores.' 
                : 'No hay jugadores registrados para este equipo.'}
          </p>
        </div>
      )}

      {/* Jugadores Grid */}
      {!loading && !error && jugadores.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {jugadores.map(jugador => (
            <div key={jugador.idJugador} className="card shadow-lg flex flex-col">
              <div className="p-4 flex items-center">
                <img 
                  src={jugador.logo || 'https://via.placeholder.com/80?text=Jugador'}
                  alt={jugador.nombre}
                  className={`player-photo ${getPositionClass(jugador.posicion)}`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/80?text=Error';
                  }}
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-bold mb-1 truncate">{jugador.nombre}</h3>
                  <div className="flex flex-wrap">
                    <span className={`position-tag ${getPositionBgClass(jugador.posicion)}`}>
                      {jugador.posicion || 'Sin posición'}
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-secondary">
                    <i className="fas fa-euro-sign mr-1"></i>
                    {formatCurrency(jugador.valor_mercado)}
                  </p>
                </div>
              </div>
              <div className="mt-auto p-4 pt-0">
                <div className="action-buttons">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => loadJugadorDetails(jugador.idJugador)}
                  >
                    <FontAwesomeIcon icon={faEye} className="mr-1" /> Detalles
                  </button>
                 
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Player Modal */}
      {showPlayerModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={closePlayerModal}>
              <FontAwesomeIcon icon={faTimes} />
            </span>
            <h2 className="text-xl font-bold mb-4">
              {jugadorToEdit ? 'Editar Jugador' : 'Agregar Nuevo Jugador'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre:</label>
                  <input 
                    type="text" 
                    id="nombre" 
                    value={formData.nombre || ''}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edad">Edad:</label>
                  <input 
                    type="number" 
                    id="edad" 
                    min="16" 
                    max="50"
                    value={formData.edad || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fecha_nacimiento">Fecha Nacimiento:</label>
                  <input 
                    type="date" 
                    id="fecha_nacimiento"
                    value={formData.fecha_nacimiento || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nacionalidad">Nacionalidad:</label>
                  <input 
                    type="text" 
                    id="nacionalidad"
                    value={formData.nacionalidad || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="altura">Altura (m):</label>
                  <input 
                    type="number" 
                    id="altura" 
                    step="0.01" 
                    min="1.50" 
                    max="2.20"
                    value={formData.altura || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="peso">Peso (kg):</label>
                  <input 
                    type="number" 
                    id="peso" 
                    min="50" 
                    max="100"
                    value={formData.peso || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pierna_habil">Pierna Hábil:</label>
                  <select 
                    id="pierna_habil"
                    value={formData.pierna_habil || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Derecha">Derecha</option>
                    <option value="Izquierda">Izquierda</option>
                    <option value="Ambidiestro">Ambidiestro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="posicion">Posición:</label>
                  <input 
                    type="text" 
                    id="posicion" 
                    placeholder="Ej: Delantero, Mediocampista"
                    value={formData.posicion || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="posicion_ideal">Posición Ideal:</label>
                  <input 
                    type="text" 
                    id="posicion_ideal" 
                    placeholder="Ej: Delantero centro"
                    value={formData.posicion_ideal || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="valor_mercado">Valor de Mercado (€):</label>
                  <input 
                    type="number" 
                    id="valor_mercado" 
                    step="0.01" 
                    min="0"
                    value={formData.valor_mercado || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="numero_camiseta">Número Camiseta:</label>
                  <input 
                    type="number" 
                    id="numero_camiseta" 
                    min="1" 
                    max="99"
                    value={formData.numero_camiseta || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="logo">URL Foto:</label>
                  <input 
                    type="url" 
                    id="logo" 
                    placeholder="https://ejemplo.com/foto.jpg"
                    value={formData.logo || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nacionalidad_logo">URL Logo Nacionalidad:</label>
                  <input 
                    type="url" 
                    id="nacionalidad_logo" 
                    placeholder="https://ejemplo.com/bandera.png"
                    value={formData.nacionalidad_logo || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group md:col-span-2">
                  <label htmlFor="habilidades">Habilidades:</label>
                  <textarea 
                    id="habilidades" 
                    rows={3} 
                    placeholder="Ej: Regate, Disparo potente, Visión de juego"
                    value={formData.habilidades || ''}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <div className="form-group md:col-span-2">
                  <label htmlFor="caracteristicas">Características:</label>
                  <textarea 
                    id="caracteristicas" 
                    rows={3} 
                    placeholder="Describe las características del jugador..."
                    value={formData.caracteristicas || ''}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <div className="form-group md:col-span-2">
                  <label htmlFor="atributos">Atributos:</label>
                  <textarea 
                    id="atributos" 
                    rows={3} 
                    placeholder="Describe los atributos del jugador..."
                    value={formData.atributos || ''}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
              <div className="action-buttons mt-6">
                <button type="submit" className="btn btn-primary">
                  <FontAwesomeIcon icon={faSave} className="mr-2" />Guardar
                </button>
                <button type="button" className="btn btn-danger" onClick={closePlayerModal}>
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar este jugador?</p>
            <div className="action-buttons mt-4">
              <button className="btn btn-danger" onClick={deleteJugador}>
                <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />Sí, Eliminar
              </button>
              <button className="btn btn-primary" onClick={closeConfirmModal}>
                <FontAwesomeIcon icon={faTimes} className="mr-2" />Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player Details Modal */}
      {showPlayerDetailsModal && jugadorDetails && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={closePlayerDetailsModal}>
              <FontAwesomeIcon icon={faTimes} />
            </span>
            <div className="player-details-header">
              <img 
                src={jugadorDetails.logo || 'https://via.placeholder.com/100?text=Jugador'}
                alt={jugadorDetails.nombre}
                className={`player-details-photo ${getPositionClass(jugadorDetails.posicion)}`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/100?text=Error';
                }}
              />
              <div className="player-details-info">
                <h2 className="player-details-name">{jugadorDetails.nombre}</h2>
                <p className="player-details-team">
                  {jugadorDetails.equipo_actual || 'Equipo no especificado'} {jugadorDetails.idLiga && <span>({jugadorDetails.liga_nombre})</span>}
                </p>
                <div className="flex items-center">
                  <div className={`player-details-position ${getPositionBgClass(jugadorDetails.posicion)}`}>
                    {jugadorDetails.posicion || 'Sin posición'}
                  </div>
                  {jugadorDetails.edad && (
                    <div className="ml-2 text-sm">
                      <span>{jugadorDetails.edad} años</span>
                      {jugadorDetails.nacionalidad && (
                        <span className="ml-2">
                          <span className="nationality-flag">{jugadorDetails.nacionalidad_logo ? <img src={jugadorDetails.nacionalidad_logo} alt={jugadorDetails.nacionalidad} width="20" /> : '🏳️'}</span>
                          {jugadorDetails.nacionalidad}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="player-details-stats">
              <div className="player-details-stat">
                <div className="player-details-stat-value">{jugadorDetails.partidos || '350'}</div>
                <div className="player-details-stat-label">PARTIDOS</div>
              </div>
              <div className="player-details-stat">
                <div className="player-details-stat-value">{jugadorDetails.goles || '0'}</div>
                <div className="player-details-stat-label">GOLES</div>
              </div>
              <div className="player-details-stat">
                <div className="player-details-stat-value">{jugadorDetails.asist || '0'}</div>
                <div className="player-details-stat-label">ASIST</div>
              </div>
              <div className="player-details-stat">
                <div className="player-details-stat-value">{jugadorDetails.amarillas || '0'}</div>
                <div className="player-details-stat-label">AMARILLAS</div>
              </div>
              <div className="player-details-stat">
                <div className="player-details-stat-value">{jugadorDetails.rojas || '0'}</div>
                <div className="player-details-stat-label">ROJAS</div>
              </div>
              <div className="player-details-stat">
                <div className="player-details-stat-value">{jugadorDetails.skills_percent || '5000%'}</div>
                <div className="player-details-stat-label">SKILLS %</div>
              </div>
            </div>
            
            <div className="player-details-section">
              <h3>Información Básica</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Nacionalidad:</strong> {jugadorDetails.nacionalidad || 'Bélgica'}</p>
                  <p><strong>Fecha Nacimiento:</strong> {jugadorDetails.fecha_nacimiento || '11 de mayo de 1992'}</p>
                  <p><strong>Edad:</strong> {jugadorDetails.edad || '31'} años</p>
                </div>
                <div>
                  <p><strong>Nacionalidad:</strong> {jugadorDetails.nacionalidad || 'Bélgica'}</p>
                  <p><strong>Altura:</strong> {jugadorDetails.altura ? `${jugadorDetails.altura}m` : '1.99 m'}</p>
                  <p><strong>Peso:</strong> {jugadorDetails.peso ? `${jugadorDetails.peso}kg` : '96.00 kg'}</p>
                  <p><strong>Pierna Hábil:</strong> {jugadorDetails.pierna_habil || 'Derecha'}</p>
                  <p><strong>Posición:</strong> {jugadorDetails.posicion || 'Portero'}</p>
                  <p><strong>Valor:</strong> {formatCurrency(jugadorDetails.valor_mercado) || '€25,000,000'}</p>
                </div>
              </div>
            </div>
            
            {(jugadorDetails.habilidades || true) && (
              <div className="player-details-section">
                <h3>Habilidades</h3>
                <p>{jugadorDetails.habilidades || 'Visión de juego'}</p>
              </div>
            )}
            
            {(jugadorDetails.caracteristicas || true) && (
              <div className="player-details-section">
                <h3>Características</h3>
                <p>{jugadorDetails.caracteristicas || 'Líder en defensa'}</p>
              </div>
            )}
            
            {(jugadorDetails.atributos || true) && (
              <div className="player-details-section">
                <h3>Atributos</h3>
                <p>{jugadorDetails.atributos || 'Alcance, juego aéreo'}</p>
              </div>
            )}

            <div className="player-details-section">
              <h3>Títulos ({jugadorDetails.titulos?.length || 3})</h3>
              <ul className="list-disc pl-5">
                <li>Champions League (2022)</li>
                <li>LaLiga (2020)</li>
                <li>Premier League (2015)</li>
              </ul>
            </div>

            <div className="player-details-section">
              <h3>Historial ({jugadorDetails.historial?.length || 4})</h3>
              <ul className="list-disc pl-5">
                <li>Real Madrid (2018 - 2023)</li>
                <li>Chelsea (2014 - 2018)</li>
                <li>Atlético de Madrid (2011 - 2014)</li>
                <li>KRC Genk (2009 - 2011)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayersHistory;