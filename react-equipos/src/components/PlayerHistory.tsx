import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye, faEdit, faTrashAlt, faPlus, faSpinner,
  faExclamationTriangle, faTimes, faCheck, faSave,
  faTrophy, faShieldAlt, faEuroSign
} from '@fortawesome/free-solid-svg-icons';
import './PlayerHistory.css';

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

// New interfaces for player titles and history
interface JugadorTitulo {
  nombre_titulo: string;
  año: number;
}

interface JugadorHistorial {
  nombre_equipo: string;
  año_inicio: number;
  año_fin?: number | null;
  foto_equipo?: string;
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
  const JUGADOR_TITULOS_API_URL = (jugadorId: number) => `${API_BASE_URL}/jugadordetalles/${jugadorId}/titulos`;
  const JUGADOR_HISTORIAL_API_URL = (jugadorId: number) => `${API_BASE_URL}/jugadordetalles/${jugadorId}/historial`;
  const ADD_JUGADOR_TITULO_API_URL = (jugadorId: number) => `${API_BASE_URL}/jugadordetalles/${jugadorId}/titulo`;
  const ADD_JUGADOR_HISTORIAL_API_URL = (jugadorId: number) => `${API_BASE_URL}/jugadordetalles/${jugadorId}/historial`;
  const DELETE_JUGADOR_TITULO_API_URL = (jugadorId: number) => `${API_BASE_URL}/jugadordetalles/${jugadorId}/titulo`;
  const DELETE_JUGADOR_HISTORIAL_API_URL = (jugadorId: number) => `${API_BASE_URL}/jugadordetalles/${jugadorId}/historial`;

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
  const [jugadorTitulos, setJugadorTitulos] = useState<JugadorTitulo[]>([]);
  const [jugadorHistorial, setJugadorHistorial] = useState<JugadorHistorial[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAddTitleForm, setShowAddTitleForm] = useState<boolean>(false);
  const [showAddHistoryForm, setShowAddHistoryForm] = useState<boolean>(false);

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

  // Title form state
  const [titleFormData, setTitleFormData] = useState<JugadorTitulo>({
    nombre_titulo: '',
    año: new Date().getFullYear()
  });

  // History form state
  const [historyFormData, setHistoryFormData] = useState<JugadorHistorial>({
    nombre_equipo: '',
    año_inicio: new Date().getFullYear(),
    año_fin: null,
    foto_equipo: ''
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
      setJugadorTitulos([]);
      setJugadorHistorial([]);
      
      const response = await fetch(JUGADOR_DETALLES_API_URL(jugadorId));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setJugadorDetails(data);
      
      // Load titles and history
      await loadJugadorTitulos(jugadorId);
      await loadJugadorHistorial(jugadorId);
      
      setShowPlayerDetailsModal(true);
    } catch (error: any) {
      console.error("Error fetching jugador details:", error);
      addNotification("Error al cargar los detalles del jugador.", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load jugador titles
  const loadJugadorTitulos = async (jugadorId: number) => {
    try {
      const response = await fetch(JUGADOR_TITULOS_API_URL(jugadorId));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setJugadorTitulos(data);
    } catch (error: any) {
      console.error("Error fetching jugador titles:", error);
      addNotification("Error al cargar los títulos del jugador.", 'error');
    }
  };

  // Load jugador history
  const loadJugadorHistorial = async (jugadorId: number) => {
    try {
      const response = await fetch(JUGADOR_HISTORIAL_API_URL(jugadorId));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setJugadorHistorial(data);
    } catch (error: any) {
      console.error("Error fetching jugador history:", error);
      addNotification("Error al cargar el historial del jugador.", 'error');
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

  // Handle title form input changes
  const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setTitleFormData(prev => ({ 
      ...prev, 
      [id === 'ntn' ? 'nombre_titulo' : id === 'nty' ? 'año' : id]: id === 'nty' ? parseInt(value) : value 
    }));
  };

  // Handle history form input changes
  const handleHistoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setHistoryFormData(prev => ({ 
      ...prev, 
      [id === 'nht' ? 'nombre_equipo' : 
       id === 'nhs' ? 'año_inicio' : 
       id === 'nhe' ? 'año_fin' : 
       id === 'nhp' ? 'foto_equipo' : id]: 
       (id === 'nhs' || id === 'nhe') ? (value ? parseInt(value) : null) : value 
    }));
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

  // Toggle add title form
  const toggleAddTitleForm = () => {
    setShowAddTitleForm(!showAddTitleForm);
    setTitleFormData({
      nombre_titulo: '',
      año: new Date().getFullYear()
    });
  };

  // Toggle add history form
  const toggleAddHistoryForm = () => {
    setShowAddHistoryForm(!showAddHistoryForm);
    setHistoryFormData({
      nombre_equipo: '',
      año_inicio: new Date().getFullYear(),
      año_fin: null,
      foto_equipo: ''
    });
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
    setJugadorTitulos([]);
    setJugadorHistorial([]);
    setShowAddTitleForm(false);
    setShowAddHistoryForm(false);
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

  // Handle title form submit
  const handleTitleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jugadorDetails?.idJugador) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(ADD_JUGADOR_TITULO_API_URL(jugadorDetails.idJugador), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(titleFormData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || `Error ${response.status}`);
      }
      
      // Reload titles
      await loadJugadorTitulos(jugadorDetails.idJugador);
      
      toggleAddTitleForm();
      addNotification("Título agregado correctamente", 'success');
    } catch (error: any) {
      console.error("Error adding title:", error);
      addNotification(`Error al agregar título: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle history form submit
  const handleHistorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jugadorDetails?.idJugador) return;
    
    if (historyFormData.año_fin && historyFormData.año_fin < historyFormData.año_inicio) {
      addNotification("Año fin no puede ser menor que Año inicio", 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(ADD_JUGADOR_HISTORIAL_API_URL(jugadorDetails.idJugador), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(historyFormData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || `Error ${response.status}`);
      }
      
      // Reload history
      await loadJugadorHistorial(jugadorDetails.idJugador);
      
      toggleAddHistoryForm();
      addNotification("Historial agregado correctamente", 'success');
    } catch (error: any) {
      console.error("Error adding history:", error);
      addNotification(`Error al agregar historial: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete title
  const deleteTitle = async (nombreTitulo: string) => {
    if (!jugadorDetails?.idJugador) return;
    if (!confirm(`¿Eliminar título "${nombreTitulo}"?`)) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(DELETE_JUGADOR_TITULO_API_URL(jugadorDetails.idJugador), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreTitulo })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status}` }));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      // Reload titles
      await loadJugadorTitulos(jugadorDetails.idJugador);
      
      addNotification("Título eliminado correctamente", 'success');
    } catch (error: any) {
      console.error("Error deleting title:", error);
      addNotification(`Error al eliminar título: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete history
  const deleteHistory = async (nombreEquipo: string) => {
    if (!jugadorDetails?.idJugador) return;
    if (!confirm(`¿Eliminar historial del equipo "${nombreEquipo}"?`)) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(DELETE_JUGADOR_HISTORIAL_API_URL(jugadorDetails.idJugador), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreEquipo })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status}` }));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      // Reload history
      await loadJugadorHistorial(jugadorDetails.idJugador);
      
      addNotification("Historial eliminado correctamente", 'success');
    } catch (error: any) {
      console.error("Error deleting history:", error);
      addNotification(`Error al eliminar historial: ${error.message}`, 'error');
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

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
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
                  {jugadorDetails.equipo_actual || 'Equipo no especificado'} {jugadorDetails.liga && <span>({jugadorDetails.liga})</span>}
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
                <div className="player-details-stat-value">{jugadorDetails.partidos_jugados || '0'}</div>
                <div className="player-details-stat-label">PARTIDOS</div>
              </div>
              <div className="player-details-stat">
                <div className="player-details-stat-value">{jugadorDetails.goles || '0'}</div>
                <div className="player-details-stat-label">GOLES</div>
              </div>
              <div className="player-details-stat">
                <div className="player-details-stat-value">{jugadorDetails.asistencias || '0'}</div>
                <div className="player-details-stat-label">ASIST</div>
              </div>
              <div className="player-details-stat">
                <div className="player-details-stat-value">{jugadorDetails.tarjetas_amarillas || '0'}</div>
                <div className="player-details-stat-label">AMARILLAS</div>
              </div>
              <div className="player-details-stat">
                <div className="player-details-stat-value">{jugadorDetails.tarjetas_rojas || '0'}</div>
                <div className="player-details-stat-label">ROJAS</div>
              </div>
              <div className="player-details-stat">
                <div className="player-details-stat-value">{jugadorDetails.pases_completados || '0'}%</div>
                <div className="player-details-stat-label">PASES %</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="player-details-section">
                  <h3>Información Básica</h3>
                  <p><strong>Nacimiento:</strong> {formatDate(jugadorDetails.fecha_nacimiento)}</p>
                  <p><strong>Edad:</strong> {jugadorDetails.edad ? `${jugadorDetails.edad} años` : 'N/A'}</p>
                  <p><strong>Nacionalidad:</strong> {jugadorDetails.nacionalidad || 'N/A'} 
                    {jugadorDetails.nacionalidad_logo && (
                      <span className="nationality-flag ml-1">
                        <img src={jugadorDetails.nacionalidad_logo} alt={jugadorDetails.nacionalidad} width="20" />
                      </span>
                    )}
                  </p>
                  <p><strong>Altura:</strong> {jugadorDetails.altura ? `${jugadorDetails.altura} m` : 'N/A'}</p>
                  <p><strong>Peso:</strong> {jugadorDetails.peso ? `${jugadorDetails.peso} kg` : 'N/A'}</p>
                  <p><strong>Pierna:</strong> {jugadorDetails.pierna_habil || 'N/A'}</p>
                  <p><strong>Pos. Ideal:</strong> {jugadorDetails.posicion_ideal || 'N/A'}</p>
                  <p><strong>Dorsal:</strong> {jugadorDetails.numero_camiseta ?? 'N/A'}</p>
                  <p><strong>Valor:</strong> {formatCurrency(jugadorDetails.valor_mercado)}</p>
                </div>
              </div>
              <div>
                {jugadorDetails.habilidades && (
                  <div className="player-details-section">
                    <h3>Habilidades</h3>
                    <p>{jugadorDetails.habilidades}</p>
                  </div>
                )}
                
                {jugadorDetails.caracteristicas && (
                  <div className="player-details-section">
                    <h3>Características</h3>
                    <p>{jugadorDetails.caracteristicas}</p>
                  </div>
                )}
                
                {jugadorDetails.atributos && (
                  <div className="player-details-section">
                    <h3>Atributos</h3>
                    <p>{jugadorDetails.atributos}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Títulos Section */}
            <div className="player-details-section">
              <h3>
                Títulos ({jugadorTitulos.length}) 
                <button className="btn btn-success btn-sm ml-2" onClick={toggleAddTitleForm}>
                  <FontAwesomeIcon icon={faPlus} /> Añadir
                </button>
              </h3>
              
              {jugadorTitulos.length > 0 ? (
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {jugadorTitulos.map((titulo, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>
                        <FontAwesomeIcon icon={faTrophy} className="mr-2 text-yellow-400" /> 
                        {titulo.nombre_titulo} ({titulo.año})
                      </span>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => deleteTitle(titulo.nombre_titulo)}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No hay títulos registrados.</p>
              )}
              
              {showAddTitleForm && (
                <div className="mt-4">
                  <form id="add-title-form" className="p-3 border rounded bg-[var(--input-bg)]" onSubmit={handleTitleSubmit}>
                    <h4 className="font-semibold mb-2">Añadir Título</h4>
                    <div className="form-group">
                      <label htmlFor="ntn">Nombre:</label>
                      <input 
                        type="text" 
                        id="ntn" 
                        value={titleFormData.nombre_titulo}
                        onChange={handleTitleInputChange}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="nty">Año:</label>
                      <input 
                        type="number" 
                        id="nty" 
                        value={titleFormData.año}
                        onChange={handleTitleInputChange}
                        required 
                        min="1900" 
                        max={new Date().getFullYear()} 
                      />
                    </div>
                    <div className="action-buttons">
                      <button type="submit" className="btn btn-primary">
                        <FontAwesomeIcon icon={faSave} /> Guardar
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={toggleAddTitleForm}>
                        <FontAwesomeIcon icon={faTimes} /> Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Historial Section */}
            <div className="player-details-section">
              <h3>
                Historial ({jugadorHistorial.length}) 
                <button className="btn btn-success btn-sm ml-2" onClick={toggleAddHistoryForm}>
                  <FontAwesomeIcon icon={faPlus} /> Añadir
                </button>
              </h3>
              
              {jugadorHistorial.length > 0 ? (
                <ul className="list-none mt-2 space-y-2">
                  {jugadorHistorial.map((historial, index) => (
                    <li key={index} className="flex justify-between items-center p-2 bg-[var(--input-bg)] rounded">
                      <div>
                        {historial.foto_equipo ? (
                          <img 
                            src={historial.foto_equipo} 
                            alt={historial.nombre_equipo} 
                            className="w-8 h-8 object-contain inline-block mr-2 rounded" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <FontAwesomeIcon icon={faShieldAlt} className="mr-2 text-gray-500" />
                        )}
                        <span className="font-semibold">{historial.nombre_equipo}</span> 
                        <span className="text-sm text-gray-400 ml-2">
                          ({historial.año_inicio} - {historial.año_fin || 'Pres.'})
                        </span>
                      </div>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => deleteHistory(historial.nombre_equipo)}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No hay historial registrado.</p>
              )}
              
              {showAddHistoryForm && (
                <div className="mt-4">
                  <form id="add-history-form" className="p-3 border rounded bg-[var(--input-bg)]" onSubmit={handleHistorySubmit}>
                    <h4 className="font-semibold mb-2">Añadir Equipo</h4>
                    <div className="form-group">
                      <label htmlFor="nht">Equipo:</label>
                      <input 
                        type="text" 
                        id="nht" 
                        value={historyFormData.nombre_equipo}
                        onChange={handleHistoryInputChange}
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="nhs">Año Inicio:</label>
                        <input 
                          type="number" 
                          id="nhs" 
                          value={historyFormData.año_inicio}
                          onChange={handleHistoryInputChange}
                          required 
                          min="1900" 
                          max={new Date().getFullYear()} 
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="nhe">Año Fin:</label>
                        <input 
                          type="number" 
                          id="nhe" 
                          value={historyFormData.año_fin || ''}
                          onChange={handleHistoryInputChange}
                          min="1900" 
                          max={new Date().getFullYear()} 
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="nhp">URL Foto:</label>
                      <input 
                        type="url" 
                        id="nhp" 
                        value={historyFormData.foto_equipo || ''}
                        onChange={handleHistoryInputChange}
                      />
                    </div>
                    <div className="action-buttons">
                      <button type="submit" className="btn btn-primary">
                        <FontAwesomeIcon icon={faSave} /> Guardar
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={toggleAddHistoryForm}>
                        <FontAwesomeIcon icon={faTimes} /> Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <div className="action-buttons mt-6">
              <button className="btn btn-primary" onClick={closePlayerDetailsModal}>
                <FontAwesomeIcon icon={faTimes} className="mr-2" /> Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayersHistory;