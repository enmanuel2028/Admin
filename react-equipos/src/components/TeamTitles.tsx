// TeamTitles.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrophy, faTrashAlt, faPlus, faSpinner,
  faInfoCircle, faExclamationTriangle, faExclamationCircle, faTimes, faCheck
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import './TeamTitles.css';

interface Titulo {
  idTituloEquipo: number;
  nombre_titulo: string;
  año: number;
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

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const TeamTitles = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const LIGAS_API_URL = `${API_BASE_URL}/ligas`;
  const EQUIPOS_API_URL = `${API_BASE_URL}/equipo`;
  const TITULOS_API_URL_BASE = `${API_BASE_URL}/equipo/titulo`;

  const [ligas, setLigas] = useState<Liga[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [currentLigaId, setCurrentLigaId] = useState<number | null>(null);
  const [currentLiga, setCurrentLiga] = useState<Liga | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [currentTeamForTitles, setCurrentTeamForTitles] = useState<Equipo | null>(null);
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [tituloNombre, setTituloNombre] = useState('');
  const [tituloAño, setTituloAño] = useState('');
  const [loadingTitulos, setLoadingTitulos] = useState(false);
  const [addTituloError, setAddTituloError] = useState<string | null>(null);
  const [showTitulosModal, setShowTitulosModal] = useState(false);
  
  // New states for animations and confirmations
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{show: boolean, tituloId: number | null}>({show: false, tituloId: null});
  const [animatingTituloId, setAnimatingTituloId] = useState<number | null>(null);

  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    loadLigas();
    if (id) loadEquipoDetails(parseInt(id));
  }, []);

  useEffect(() => {
    if (currentLigaId) {
      loadEquipos(currentLigaId);
      loadLigaInfo(currentLigaId);
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

  const addNotification = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const loadLigas = async () => {
    try {
      const res = await fetch(LIGAS_API_URL);
      const data = await res.json();
      setLigas(data);
    } catch {
      setError("No se pudieron cargar las ligas.");
    }
  };

  const loadLigaInfo = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/liga/${id}`);
      const data = await res.json();
      setCurrentLiga(data[0]);
    } catch {
      setError("No se pudo cargar la información de la liga.");
    }
  };

  const loadEquipoDetails = async (equipoId: number) => {
    try {
      const res = await fetch(`${EQUIPOS_API_URL}/${equipoId}`);
      const data = await res.json();
      if (data.length > 0) {
        // Process the data to handle different property names
        const equipo = {
          ...data[0],
          valorMercado: data[0].valorMercado || data[0].valor_mercado,
          estadioLogo: data[0].estadioLogo || data[0].estadiologo
        };
        setCurrentTeamForTitles(equipo);
        setCurrentLigaId(equipo.idLiga);
        loadTitulosForTeam(equipo.idEquipo);
      }
    } catch {
      setError("Error al cargar el equipo.");
    }
  };

  const loadEquipos = async (ligaId: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/liga/equipos/${ligaId}`);
      const data = await res.json();
      
      // Process the data to handle different property names
      const processedData = data.map((equipo: any) => ({
        ...equipo,
        valorMercado: equipo.valorMercado || equipo.valor_mercado,
        estadioLogo: equipo.estadioLogo || equipo.estadiologo
      }));
      
      setEquipos(processedData);
    } catch {
      setError("Error al cargar los equipos.");
    } finally {
      setLoading(false);
    }
  };

  const loadTitulosForTeam = async (equipoId: number) => {
    setLoadingTitulos(true);
    try {
      const res = await fetch(`${TITULOS_API_URL_BASE}/${equipoId}`);
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      const responseData = await res.json();
      console.log('Títulos cargados (respuesta completa):', responseData);
      
      // The endpoint returns an array where the first element is the titles array
      const titulos = Array.isArray(responseData) && responseData.length > 0 && Array.isArray(responseData[0]) 
        ? responseData[0] 
        : [];
      
      console.log('Títulos procesados:', titulos);
      setTitulos(titulos);
    } catch (error: any) {
      console.error('Error cargando títulos:', error);
      setError(`Error al cargar los títulos: ${error.message}`);
      setTitulos([]);
    } finally {
      setLoadingTitulos(false);
    }
  };

  const handleAddTitulo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeamForTitles) return;

    try {
      await fetch(TITULOS_API_URL_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idEquipo: currentTeamForTitles.idEquipo,
          nombre_titulo: tituloNombre,
          año: parseInt(tituloAño)
        })
      });
      setTituloNombre('');
      setTituloAño('');
      addNotification(`¡Título "${tituloNombre}" agregado con éxito!`, 'success');
      loadTitulosForTeam(currentTeamForTitles.idEquipo);
    } catch (err: any) {
      setAddTituloError(err.message);
      addNotification(`Error al agregar título: ${err.message}`, 'error');
    }
  };

  const confirmDeleteTitulo = (idTituloEquipo: number) => {
    setDeleteConfirmation({show: true, tituloId: idTituloEquipo});
    setAnimatingTituloId(idTituloEquipo);
  };

  const cancelDeleteTitulo = () => {
    setDeleteConfirmation({show: false, tituloId: null});
    setAnimatingTituloId(null);
  };

  const handleDeleteTitulo = async () => {
    if (!deleteConfirmation.tituloId) return;
    
    try {
      await fetch(`${TITULOS_API_URL_BASE}/${deleteConfirmation.tituloId}`, { method: 'DELETE' });
      if (currentTeamForTitles) {
        addNotification('Título eliminado con éxito', 'success');
        loadTitulosForTeam(currentTeamForTitles.idEquipo);
      }
    } catch (err: any) {
      addNotification(`Error al eliminar título: ${err.message}`, 'error');
    } finally {
      setDeleteConfirmation({show: false, tituloId: null});
      setAnimatingTituloId(null);
    }
  };

  const openTitulosModal = (equipo: Equipo) => {
    setCurrentTeamForTitles(equipo);
    loadTitulosForTeam(equipo.idEquipo);
    setShowTitulosModal(true);
  };

  const closeTitulosModal = () => {
    setShowTitulosModal(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-8 card">
            <label className="block mb-2 font-medium">Ver equipos de la liga:</label>
            <select
              className="w-full md:w-auto p-3 border rounded liga-selector"
              value={currentLigaId || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrentLigaId(parseInt(e.target.value))}
            >
              <option value="">-- Selecciona una Liga --</option>
              {ligas.map(liga => (
                <option key={liga.idLiga} value={liga.idLiga}>{liga.nombre}</option>
              ))}
            </select>
          </div>

          {currentLiga && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-[var(--card-bg)] text-[var(--text-color)] p-6 rounded-lg shadow-lg mb-8 flex flex-col items-center text-center"
            >
              <div className="flex items-center mb-6 w-full">
                <img 
                  src={currentLiga.imagen_logo || 'https://via.placeholder.com/80?text=N/A'} 
                  alt={`${currentLiga.nombre} Logo`} 
                  className="w-20 h-20 object-contain mr-6 liga-logo"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/80?text=Error';
                  }}
                />
                <div className="text-left flex-grow">
                  <h2 className="text-2xl font-bold mb-2">{currentLiga.nombre}</h2>
                  <p className="text-lg text-[var(--text-secondary)]">
                    {currentLiga.pais || 'N/A'} - {currentLiga.nivel || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-4">
                <div className="bg-opacity-5 bg-white p-3 rounded">
                  <strong className="block mb-1 text-[var(--text-secondary)]">Temporada</strong>
                  {currentLiga.año_inicio || '?'} - {currentLiga.año_fin || '?'}
                </div>
                <div className="bg-opacity-5 bg-white p-3 rounded">
                  <strong className="block mb-1 text-[var(--text-secondary)]">País</strong>
                  {currentLiga.pais || 'N/A'}
                </div>
                <div className="bg-opacity-5 bg-white p-3 rounded">
                  <strong className="block mb-1 text-[var(--text-secondary)]">Nivel</strong>
                  {currentLiga.nivel || 'N/A'}
                </div>
              </div>
              
              {currentLiga.descripcion_historica && (
                <p className="mt-4 text-left w-full">
                  {currentLiga.descripcion_historica}
                </p>
              )}
              
              {currentLiga.imagen_trofeo && (
                <motion.img 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  src={currentLiga.imagen_trofeo} 
                  alt={`Trofeo de ${currentLiga.nombre}`} 
                  className="w-full max-w-[300px] h-auto object-contain mt-4 rounded liga-trofeo"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/300x150?text=Error';
                  }}
                />
              )}
            </motion.div>
          )}

          {loading && (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faSpinner} spin className="text-5xl mb-4 text-blue-600" />
              <p className="text-xl">Cargando equipos...</p>
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-100 text-red-800 p-4 rounded-lg mb-8 error-state"
            >
              <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
              {error}
            </motion.div>
          )}

          {!loading && !error && equipos.length === 0 && (
            <div className="text-center py-12 card">
              <FontAwesomeIcon icon={faInfoCircle} className="text-5xl mb-4 text-blue-500" />
              <p className="text-xl">Selecciona una liga para ver los equipos.</p>
            </div>
          )}

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            <AnimatePresence>
              {equipos.map(equipo => (
                <motion.div 
                  key={equipo.idEquipo} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="card team-card"
                >
                  <div className="p-4 flex items-center team-card-header">
                    {equipo.logo ? (
                      <img 
                        src={equipo.logo} 
                        alt={`Logo de ${equipo.nombre}`} 
                        className="w-16 h-16 mr-4 object-contain team-logo rounded"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/60?text=N/A';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 mr-4 flex items-center justify-center rounded-full">
                        <span className="text-xs">Sin logo</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold team-name truncate" title={equipo.nombre}>{equipo.nombre}</h3>
                      {equipo.ciudad && <p className="text-sm team-meta">Ciudad: {equipo.ciudad}</p>}
                      {equipo.estadioNombre && <p className="text-sm team-meta">Estadio: {equipo.estadioNombre}</p>}
                      {equipo.valorMercado && (
                        <p className="text-sm team-meta">
                          Valor: €{new Intl.NumberFormat('de-DE').format(parseFloat(equipo.valorMercado))}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="px-4 pt-2 team-card-body">
                    {equipo.estadioLogo && (
                      <img 
                        src={equipo.estadioLogo} 
                        alt={`Estadio de ${equipo.nombre}`} 
                        className="w-full h-32 object-cover rounded stadium-logo"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/400x150?text=Estadio+N/A';
                        }}
                      />
                    )}
                  </div>
                  
                  <div className="p-4 team-card-footer">
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full btn btn-primary" 
                      onClick={() => openTitulosModal(equipo)}
                    >
                      <FontAwesomeIcon icon={faTrophy} className="mr-2" /> Administrar Títulos
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Modal para gestionar títulos */}
          <AnimatePresence>
            {showTitulosModal && currentTeamForTitles && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="modal"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="modal-content"
                >
                  <div className="flex justify-between items-center border-b p-4">
                    <div className="flex items-center">
                      {currentTeamForTitles.logo && (
                        <img 
                          src={currentTeamForTitles.logo} 
                          alt={currentTeamForTitles.nombre} 
                          className="w-12 h-12 mr-3 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/48?text=N/A';
                          }}
                        />
                      )}
                      <h3 className="text-xl font-bold">Gestionar Títulos</h3>
                    </div>
                    <motion.button 
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.2 }}
                      onClick={closeTitulosModal}
                      className="modal-close"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </motion.button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-3">Equipo: {currentTeamForTitles.nombre}</h4>
                      <div className="p-3 rounded-lg form-group">
                        <p className="text-sm"><span className="font-medium">Ciudad:</span> {currentTeamForTitles.ciudad}</p>
                        <p className="text-sm"><span className="font-medium">Estadio:</span> {currentTeamForTitles.estadioNombre}</p>
                        <p className="text-sm"><span className="font-medium">Valor de Mercado:</span> {currentTeamForTitles.valorMercado && `€${new Intl.NumberFormat('de-DE').format(parseFloat(currentTeamForTitles.valorMercado))}`}</p>
                      </div>
                      {currentTeamForTitles.estadioLogo && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium mb-2">Estadio:</h5>
                          <img 
                            src={currentTeamForTitles.estadioLogo} 
                            alt={`Estadio de ${currentTeamForTitles.nombre}`} 
                            className="w-full h-40 object-cover rounded stadium-logo"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/400x150?text=Estadio+N/A';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-3">Títulos del Equipo</h4>
                      
                      {loadingTitulos ? (
                        <div className="text-center py-8">
                          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl mb-4 text-blue-600 loading-spinner" />
                          <p className="text-lg">Cargando títulos...</p>
                        </div>
                      ) : titulos.length === 0 ? (
                        <div className="text-center py-6 rounded-lg empty-state">
                          <FontAwesomeIcon icon={faInfoCircle} className="text-3xl mb-3 text-blue-500" />
                          <p className="text-base">Este equipo no tiene títulos registrados.</p>
                        </div>
                      ) : (
                        <div className="rounded-lg p-4 mb-4 titulo-list">
                          <ul className="divide-y">
                            <AnimatePresence>
                              {titulos.map(titulo => (
                                <motion.li 
                                  key={titulo.idTituloEquipo} 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ 
                                    opacity: 1, 
                                    height: 'auto',
                                    backgroundColor: animatingTituloId === titulo.idTituloEquipo ? 'rgba(254, 202, 202, 0.2)' : 'transparent'
                                  }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className={`py-3 flex justify-between items-center titulo-item ${animatingTituloId === titulo.idTituloEquipo ? 'delete-titulo-animation' : ''}`}
                                >
                                  <div className="flex items-center titulo-details">
                                    <FontAwesomeIcon icon={faTrophy} className="text-yellow-500 mr-3 text-xl" />
                                    <div>
                                      <span className="font-semibold text-lg titulo-name">{titulo.nombre_titulo || 'Título sin nombre'}</span>
                                      <span className="ml-2 text-base titulo-year">({titulo.año || 'Año desconocido'})</span>
                                    </div>
                                  </div>
                                  <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="btn-danger titulo-delete-btn" 
                                    onClick={() => confirmDeleteTitulo(titulo.idTituloEquipo)}
                                    title="Eliminar título"
                                  >
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                  </motion.button>
                                </motion.li>
                              ))}
                            </AnimatePresence>
                          </ul>
                        </div>
                      )}
                      
                      <form id="add-titulo-form" onSubmit={handleAddTitulo}>
                        <h4 className="text-lg font-semibold mb-3">Agregar Nuevo Título</h4>
                        <div className="form-group">
                          <input 
                            type="text" 
                            placeholder="Nombre del título" 
                            value={tituloNombre}
                            onChange={(e) => setTituloNombre(e.target.value)}
                            required
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <input 
                            type="number" 
                            placeholder="Año" 
                            value={tituloAño}
                            onChange={(e) => setTituloAño(e.target.value)}
                            required
                            min="1800"
                            max={new Date().getFullYear()}
                            className="form-control"
                          />
                        </div>
                        {addTituloError && (
                          <div className="mb-4 p-3 rounded error-state">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                            {addTituloError}
                          </div>
                        )}
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className="w-full btn btn-primary"
                        >
                          <FontAwesomeIcon icon={faPlus} className="mr-2" /> Agregar Título
                        </motion.button>
                      </form>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Confirmación de eliminación */}
          <AnimatePresence>
            {deleteConfirmation.show && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="delete-confirm-overlay"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="delete-confirm-dialog"
                >
                  <h3 className="text-xl font-bold mb-2">Confirmar Eliminación</h3>
                  <p>¿Estás seguro de que deseas eliminar este título? Esta acción no se puede deshacer.</p>
                  <div className="delete-confirm-buttons">
                    <button 
                      className="btn btn-success"
                      onClick={cancelDeleteTitulo}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={handleDeleteTitulo}
                    >
                      Eliminar
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Notificaciones */}
          <AnimatePresence>
            {notifications.map(notification => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className={`notification ${notification.type === 'success' ? 'notification-success' : 'notification-error'}`}
              >
                <FontAwesomeIcon icon={notification.type === 'success' ? faCheck : faExclamationCircle} className="mr-2" />
                {notification.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default TeamTitles;