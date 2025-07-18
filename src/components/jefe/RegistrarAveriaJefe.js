import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import { motion } from 'framer-motion';
import { FaWrench } from 'react-icons/fa'; // Icono para fallas
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RegistrarAveriaJefe() {
  const navigate = useNavigate();
  const [token] = useState(localStorage.getItem('token'));

  const [secciones, setSecciones] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [falla, setFalla] = useState({
    descripcion: '',
    estado: 'PENDIENTE',
    seccionId: '',
    maquinaId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const payload = token ? (() => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (err) {
      console.error('Error decoding token:', err);
      return null;
    }
  })() : null;

  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;

    const fetchSecciones = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/secciones');
        setSecciones(res.data);
      } catch (err) {
        console.error('❌ Error al cargar las secciones:', err);
        setError('No se pudo cargar las secciones.');
      } finally {
        setLoading(false);
      }
    };

    fetchSecciones();
  }, [token]);

  useEffect(() => {
    if (!falla.seccionId || !token) {
      setMaquinas([]);
      return;
    }

    const fetchMaquinas = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/maquinas/por-seccion/${falla.seccionId}`);
        setMaquinas(res.data);
      } catch (err) {
        console.error('❌ Error al cargar las máquinas:', err);
        setError('No se pudo cargar las máquinas.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaquinas();
  }, [falla.seccionId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFalla((prev) => ({ ...prev, [name]: value }));
  };

  const obtenerFechaLimaISO = () => {
    const ahora = new Date();
    const limaOffsetMs = 5 * 60 * 60 * 1000;
    const limaTime = new Date(ahora.getTime() - limaOffsetMs);
    return limaTime.toISOString().slice(0, 23);
  };

  const obtenerFechaLimaFormateada = () => {
    return new Date().toLocaleString("es-PE", {
      timeZone: "America/Lima",
      hour12: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!payload) {
      console.error('No se encontró payload en el token.');
      return;
    }

    // ✅ Validación de campos obligatorios
    if (
      !falla.descripcion.trim() ||
      !falla.seccionId ||
      !falla.maquinaId ||
      !falla.estado
    ) {
      toast.error('Por favor complete todos los campos obligatorios.');
      return;
    }

    try {
      const jefeId = payload.id;
      const datos = {
        descripcion: falla.descripcion,
        estado: falla.estado,
        seccion: { id: parseInt(falla.seccionId, 10) },
        maquina: { id: parseInt(falla.maquinaId, 10) },
        jefeProduccion: { id: jefeId },
        fechaRegistro: obtenerFechaLimaISO(),
      };

      await axiosInstance.post('/fallas', datos);

      toast.success('✅ Falla registrada con éxito');
      setFalla({
        descripcion: '',
        estado: 'PENDIENTE',
        seccionId: '',
        maquinaId: '',
      });
    } catch (err) {
      console.error('❌ Error al registrar la falla:', err);
      toast.error('Ocurrió un error al registrar la falla');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100"
      style={{
        background: 'linear-gradient(135deg,rgb(126, 155, 150) 0%,rgb(221, 221, 221) 100%)'
      }}
    >
      <motion.div
        className="card shadow-lg p-5"
        style={{
          width: '400px',
          borderRadius: '20px',
          backgroundColor: 'white'
        }}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-center mb-4 text-primary fw-bold">Registrar Avería</h3>

        {loading && <div className="alert alert-info">Cargando...</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="descripcion" className="form-label">Descripción</label>
            <div className="input-group">
              <span className="input-group-text bg-primary text-white">
                <FaWrench />
              </span>
              <textarea
                id="descripcion"
                className="form-control"
                name="descripcion"
                value={falla.descripcion}
                onChange={handleChange}
                required
                placeholder="Descripción de la avería"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="seccionId" className="form-label">Sección</label>
            <select
              id="seccionId"
              className="form-select"
              name="seccionId"
              value={falla.seccionId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una sección</option>
              {secciones.map((sec) => (
                <option key={sec.id} value={sec.id}>{sec.nombre}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="maquinaId" className="form-label">Máquina</label>
            <select
              id="maquinaId"
              className="form-select"
              name="maquinaId"
              value={falla.maquinaId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una máquina</option>
              {maquinas.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="estado" className="form-label">Estado</label>
            <select
              id="estado"
              className="form-select"
              name="estado"
              value={falla.estado}
              onChange={handleChange}
              required
            >
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="RESUELTO">Resuelto</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label">Fecha y Hora de Registro</label>
            <input
              type="text"
              className="form-control"
              value={obtenerFechaLimaFormateada()}
              disabled
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-100" style={{ borderRadius: '10px' }}>
            Registrar Avería
          </button>
        </form>

      </motion.div>

      <ToastContainer position="top-center" />
    </div>
  );
}

export default RegistrarAveriaJefe;
