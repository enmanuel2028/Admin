import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSyncAlt, faExclamationTriangle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import './Standings.css';

// Types
interface Posicion {
  idPosicion: number;
  idLiga: number;
  idEquipo: number;
  nombreEquipo: string;
  posicion: number;
  puntos: number;
  ultimo_partido_1: string | null;
  ultimo_partido_2: string | null;
  ultimo_partido_3: string | null;
  ultimo_partido_4: string | null;
  ultimo_partido_5: string | null;
}

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

interface Equipo {
  idEquipo: number;
  nombre: string;
  idLiga: number;
}

const Standings = () => {
  // API URLs
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const LIGAS_API_URL = `${API_BASE_URL}/ligas`;
  const EQUIPOS_BY_LIGA_API_URL = `${API_BASE_URL}/liga/equipos`;
  const POSICIONES_LIGA_API_URL = `${API_BASE_URL}/posiciones_liga`;
  const POSICIONES_BY_LIGA_API_URL = `${POSICIONES_LIGA_API_URL}/liga`;
  const LIGA_DETAILS_API_URL = `${API_BASE_URL}/liga`;

  // State variables
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [posiciones, setPosiciones] = useState<Posicion[]>([]);
  const [selectedLiga, setSelectedLiga] = useState<number | null>(null);
  const [selectedLigaName, setSelectedLigaName] = useState<string>("");
  const [ligaDetails, setLigaDetails] = useState<Liga | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [posicionToEdit, setPosicionToEdit] = useState<Posicion | null>(null);
  const [posicionToDelete, setPosicionToDelete] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    idPosicion: "",
    idLiga: "",
    idEquipo: "",
    posicion: "",
    puntos: "",
    ultimo_partido_1: "",
    ultimo_partido_2: "",
    ultimo_partido_3: "",
    ultimo_partido_4: "",
    ultimo_partido_5: "",
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Load data on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const ligaId = queryParams.get('ligaId');
    const ligaNombre = queryParams.get('ligaNombre');

    if (ligaId) {
      setSelectedLiga(parseInt(ligaId));
      if (ligaNombre) {
        setSelectedLigaName(ligaNombre);
      }
    }

    loadLigas();
  }, [location]);

  // Load posiciones and liga details when selectedLiga changes
  useEffect(() => {
    if (selectedLiga) {
      loadPosiciones(selectedLiga);
      loadLigaDetails(selectedLiga);
      loadEquiposForLiga(selectedLiga);
    }
  }, [selectedLiga]);

  // Load all ligas
  const loadLigas = async () => {
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
    }
  };

  // Load liga details
  const loadLigaDetails = async (ligaId: number) => {
    try {
      const url = `${LIGA_DETAILS_API_URL}/${ligaId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const ligaDetailsArray = await response.json();
      if (ligaDetailsArray && ligaDetailsArray.length > 0) {
        setLigaDetails(ligaDetailsArray[0]);
      } else {
        throw new Error("No se encontraron detalles para la liga seleccionada.");
      }
    } catch (error: any) {
      console.error("Error fetching liga details:", error);
      setError(`Error al cargar detalles de la liga: ${error.message}`);
    }
  };

  // Load posiciones
  const loadPosiciones = async (ligaId: number) => {
    setLoading(true);
    setError(null);
    try {
      const url = `${POSICIONES_BY_LIGA_API_URL}/${ligaId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPosiciones(data.sort((a: Posicion, b: Posicion) => a.posicion - b.posicion));
    } catch (error: any) {
      console.error("Error fetching posiciones:", error);
      setError(`Error al cargar posiciones: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load equipos for a liga
  const loadEquiposForLiga = async (ligaId: number) => {
    try {
      const url = `${EQUIPOS_BY_LIGA_API_URL}/${ligaId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEquipos(data);
    } catch (error: any) {
      console.error(`Error fetching equipos for liga ${ligaId}:`, error);
    }
  };

  // Handle liga select change
  const handleLigaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ligaId = parseInt(e.target.value);
    if (ligaId) {
      const selectedLigaObj = ligas.find(liga => liga.idLiga === ligaId);
      if (selectedLigaObj) {
        setSelectedLigaName(selectedLigaObj.nombre);
        navigate(`/posiciones?ligaId=${ligaId}&ligaNombre=${encodeURIComponent(selectedLigaObj.nombre)}`);
      }
      setSelectedLiga(ligaId);
    } else {
      setSelectedLiga(null);
      setSelectedLigaName("");
      setPosiciones([]);
      setLigaDetails(null);
      navigate('/posiciones');
    }
  };

  // Open modal for adding or editing
  const openModal = (posicion: Posicion | null = null) => {
    if (posicion) {
      setPosicionToEdit(posicion);
      setFormData({
        idPosicion: posicion.idPosicion.toString(),
        idLiga: posicion.idLiga.toString(),
        idEquipo: posicion.idEquipo.toString(),
        posicion: posicion.posicion.toString(),
        puntos: posicion.puntos.toString(),
        ultimo_partido_1: posicion.ultimo_partido_1 || "",
        ultimo_partido_2: posicion.ultimo_partido_2 || "",
        ultimo_partido_3: posicion.ultimo_partido_3 || "",
        ultimo_partido_4: posicion.ultimo_partido_4 || "",
        ultimo_partido_5: posicion.ultimo_partido_5 || "",
      });
    } else {
      setPosicionToEdit(null);
      setFormData({
        idPosicion: "",
        idLiga: selectedLiga ? selectedLiga.toString() : "",
        idEquipo: "",
        posicion: "",
        puntos: "",
        ultimo_partido_1: "",
        ultimo_partido_2: "",
        ultimo_partido_3: "",
        ultimo_partido_4: "",
        ultimo_partido_5: "",
      });
    }
    setShowModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.idEquipo) {
      alert("Por favor, selecciona un equipo.");
      return;
    }

    // Check if team already has a position entry (for new entries only)
    if (!formData.idPosicion && posiciones.some(p => p.idEquipo === parseInt(formData.idEquipo))) {
      alert("Este equipo ya tiene una entrada de posición en esta liga. Edita la existente.");
      return;
    }

    const posicionData = {
      idLiga: parseInt(formData.idLiga),
      idEquipo: parseInt(formData.idEquipo),
      posicion: parseInt(formData.posicion),
      puntos: parseInt(formData.puntos),
      ultimo_partido_1: formData.ultimo_partido_1.toUpperCase() || null,
      ultimo_partido_2: formData.ultimo_partido_2.toUpperCase() || null,
      ultimo_partido_3: formData.ultimo_partido_3.toUpperCase() || null,
      ultimo_partido_4: formData.ultimo_partido_4.toUpperCase() || null,
      ultimo_partido_5: formData.ultimo_partido_5.toUpperCase() || null,
    };

    const method = formData.idPosicion ? 'PUT' : 'POST';
    const url = formData.idPosicion ? `${POSICIONES_LIGA_API_URL}/${formData.idPosicion}` : POSICIONES_LIGA_API_URL;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posicionData)
      });

      if (!response.ok) {
        let errorData;
        try { errorData = await response.json(); } 
        catch { errorData = { message: response.statusText }; }
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      setShowModal(false);
      if (selectedLiga) {
        loadPosiciones(selectedLiga);
      }
      showToast(`Posición ${formData.idPosicion ? 'actualizada' : 'agregada'} correctamente.`);
    } catch (error: any) {
      console.error("Error saving posicion:", error);
      alert(`Error al guardar la posición: ${error.message}`);
    }
  };

  // Show confirm delete modal
  const showDeleteConfirm = (posicion: Posicion) => {
    setPosicionToDelete(posicion.idPosicion);
    setShowConfirmModal(true);
  };

  // Delete posicion
  const deletePosicion = async () => {
    if (!posicionToDelete) return;

    try {
      const url = `${POSICIONES_LIGA_API_URL}/${posicionToDelete}`;
      const response = await fetch(url, { method: 'DELETE' });
      
      if (!response.ok) {
        let errorData;
        try { errorData = await response.json(); } 
        catch { errorData = { message: response.statusText }; }
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      setShowConfirmModal(false);
      setPosicionToDelete(null);
      if (selectedLiga) {
        loadPosiciones(selectedLiga);
      }
      showToast("Posición eliminada correctamente.");
    } catch (error: any) {
      console.error("Error deleting posicion:", error);
      alert(`Error al eliminar la posición: ${error.message}`);
    }
  };

  // Render last matches
  const renderLastMatches = (posicion: Posicion) => {
    const matches = [
      posicion.ultimo_partido_1,
      posicion.ultimo_partido_2,
      posicion.ultimo_partido_3,
      posicion.ultimo_partido_4,
      posicion.ultimo_partido_5
    ];

    return (
      <div className="flex space-x-1">
        {matches.map((result, index) => {
          let cssClass = 'last-match-null';
          let text = '-';
          
          if (result) {
            text = result.toUpperCase();
            if (text === 'G') cssClass = 'last-match-g';
            else if (text === 'E') cssClass = 'last-match-e';
            else if (text === 'P') cssClass = 'last-match-p';
          }
          
          return (
            <span key={index} className={`last-match-icon ${cssClass}`}>{text}</span>
          );
        })}
      </div>
    );
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
        <div className="flex justify-start items-center mb-6">
          <label htmlFor="liga-select" className="mr-2 font-medium">Ver posiciones de la liga:</label>
          <select 
            id="liga-select" 
            className="liga-selector mt-6"
            value={selectedLiga || ''}
            onChange={handleLigaChange}
          >
            <option value="">-- Selecciona una Liga --</option>
            {ligas.map(liga => (
              <option key={liga.idLiga} value={liga.idLiga}>{liga.nombre}</option>
            ))}
          </select>
          <button 
            id="add-posicion-btn" 
            className="btn btn-success ml-4"
            disabled={!selectedLiga}
            onClick={() => openModal()}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />Agregar Posición
          </button>
        </div>

        {/* Liga Info Card */}
        {ligaDetails && (
          <div id="liga-info-card" className="visible mb-6">
            <img 
              src={ligaDetails.imagen_logo || 'https://via.placeholder.com/100?text=Logo'}
              alt={`Logo ${ligaDetails.nombre}`}
              className="liga-logo rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'https://via.placeholder.com/100?text=Error';
              }}
            />
            <div className="liga-info-content">
              <h2 className="text-2xl font-bold mb-2">{ligaDetails.nombre || 'Nombre no disponible'}</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                <i className="fas fa-map-marker-alt mr-1"></i> País: {ligaDetails.pais || 'N/A'}
              </p>
              <p style={{ color: "var(--text-secondary)" }}>
                <i className="fas fa-trophy mr-1"></i> Nivel: {ligaDetails.nivel || 'N/A'}
              </p>
              <p style={{ color: "var(--text-secondary)" }}>
                <i className="fas fa-calendar-alt mr-1"></i> Temporada: {ligaDetails.año_inicio || '?'} - {ligaDetails.año_fin || '?'}
              </p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table id="posiciones-table" className="min-w-full">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Equipo</th>
                <th>Puntos</th>
                <th>Últimos 5 Partidos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <FontAwesomeIcon icon={faSpinner} className="text-4xl mb-4 loading-spinner" />
                    <p className="text-xl">Cargando posiciones...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5}>
                    <div className="error-state py-8">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl mb-4" />
                      <p className="text-xl font-medium mb-2">{error}</p>
                      <button 
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium shadow-sm"
                        onClick={() => selectedLiga && loadPosiciones(selectedLiga)}
                      >
                        <FontAwesomeIcon icon={faSyncAlt} className="mr-2" />Reintentar
                      </button>
                    </div>
                  </td>
                </tr>
              ) : !selectedLiga ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 empty-state">
                    <p className="text-xl">Selecciona una liga para ver las posiciones.</p>
                  </td>
                </tr>
              ) : posiciones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 empty-state">
                    <p className="text-xl">No hay posiciones registradas para esta liga.</p>
                  </td>
                </tr>
              ) : (
                posiciones.map(pos => (
                  <tr key={pos.idPosicion}>
                    <td className="font-semibold text-center">{pos.posicion || '-'}</td>
                    <td>{pos.nombreEquipo || 'Equipo Desconocido'}</td>
                    <td className="text-center">{pos.puntos !== null ? pos.puntos : '-'}</td>
                    <td>{renderLastMatches(pos)}</td>
                    <td>
                      <div className="flex justify-center gap-2">
                        <button 
                          className="btn btn-primary btn-sm"
                          title="Editar"
                          onClick={() => openModal(pos)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          title="Eliminar"
                          onClick={() => showDeleteConfirm(pos)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="modal-content w-11/12 max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{posicionToEdit ? 'Editar Posición' : 'Agregar Nueva Posición'}</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-xl font-bold hover:text-red-500" 
                style={{ color: "var(--text-secondary)" }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" id="idPosicion" value={formData.idPosicion} />
              <input type="hidden" id="idLiga" value={formData.idLiga} />

              <div className="form-group">
                <label htmlFor="idEquipo" className="block text-sm font-medium mb-1">Equipo:</label>
                <select 
                  id="idEquipo" 
                  className="modal-input"
                  value={formData.idEquipo}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Selecciona un Equipo --</option>
                  {equipos.map(equipo => (
                    <option key={equipo.idEquipo} value={equipo.idEquipo}>{equipo.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="posicion" className="block text-sm font-medium mb-1">Posición:</label>
                  <input 
                    type="number" 
                    id="posicion" 
                    className="modal-input"
                    min="1"
                    value={formData.posicion}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="puntos" className="block text-sm font-medium mb-1">Puntos:</label>
                  <input 
                    type="number" 
                    id="puntos" 
                    className="modal-input"
                    value={formData.puntos}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium mb-1">Últimos 5 Partidos (G=Ganado, E=Empatado, P=Perdido):</label>
                <div className="grid grid-cols-5 gap-2">
                  <input 
                    type="text" 
                    maxLength={1} 
                    pattern="[GEPgep]?" 
                    className="text-center uppercase modal-input" 
                    id="ultimo_partido_1" 
                    placeholder="1"
                    value={formData.ultimo_partido_1}
                    onChange={handleInputChange}
                  />
                  <input 
                    type="text" 
                    maxLength={1} 
                    pattern="[GEPgep]?" 
                    className="text-center uppercase modal-input" 
                    id="ultimo_partido_2" 
                    placeholder="2"
                    value={formData.ultimo_partido_2}
                    onChange={handleInputChange}
                  />
                  <input 
                    type="text" 
                    maxLength={1} 
                    pattern="[GEPgep]?" 
                    className="text-center uppercase modal-input" 
                    id="ultimo_partido_3" 
                    placeholder="3"
                    value={formData.ultimo_partido_3}
                    onChange={handleInputChange}
                  />
                  <input 
                    type="text" 
                    maxLength={1} 
                    pattern="[GEPgep]?" 
                    className="text-center uppercase modal-input" 
                    id="ultimo_partido_4" 
                    placeholder="4"
                    value={formData.ultimo_partido_4}
                    onChange={handleInputChange}
                  />
                  <input 
                    type="text" 
                    maxLength={1} 
                    pattern="[GEPgep]?" 
                    className="text-center uppercase modal-input" 
                    id="ultimo_partido_5" 
                    placeholder="5"
                    value={formData.ultimo_partido_5}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="action-buttons">
                <button type="submit" className="btn btn-primary">Guardar</button>
                <button type="button" className="btn btn-danger" onClick={() => setShowModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="modal-content w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
            <p className="mb-6">¿Estás seguro de que deseas eliminar esta entrada de posición?</p>
            <div className="action-buttons">
              <button className="btn btn-danger" onClick={deletePosicion}>Sí, Eliminar</button>
              <button className="btn btn-primary" onClick={() => setShowConfirmModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Standings;