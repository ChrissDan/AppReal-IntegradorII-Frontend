import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { motion } from 'framer-motion';
import { FaUserEdit } from 'react-icons/fa';

function ListaAveriasTecnico() {
  const [averias, setAverias] = useState([]);
  const [error, setError] = useState(null);
  const [editarFalla, setEditarFalla] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tecnicoActual, setTecnicoActual] = useState(null);

  // ✅ Obtener técnico actual desde el token al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setTecnicoActual({
          id: payload.id,
          nombre: payload.nombre,
          apellido: payload.apellido
        });
        console.log('👤 Técnico logueado:', payload.nombre, payload.apellido);
        console.log("✅ Payload completo:", payload);
      } catch (err) {
        console.error('❌ Error decoding token:', err);
      }
    }

    cargarAverias();
  }, []);

  const cargarAverias = async () => {
    try {
      const pendientes = await axiosInstance.get('/fallas/pendientes');
      const enProceso = await axiosInstance.get('/fallas/enProceso');

      // Combinar ambas listas
      const todas = [...pendientes.data, ...enProceso.data];
      setAverias(todas);
    } catch (err) {
      console.error("❌ Error al cargar averías:", err.message);
      setError("No se pudieron cargar las averías");
    }
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

  const handleEditarClick = (falla) => {
    setEditarFalla({
      ...falla,
      fechaActualizacion: obtenerFechaLimaISO()
    });
    setMostrarModal(true);
  };

  const handleEditarChange = (e) => {
    const { name, value } = e.target;
    setEditarFalla(prev => ({ ...prev, [name]: value }));
  };

  const handleActualizar = () => {
    if (!editarFalla || !tecnicoActual) return;

    const datos = {
      ...editarFalla,
      tecnicoMantenimiento: { id: tecnicoActual.id },
      supervisorProduccion: editarFalla.supervisorProduccion,
      seccion: editarFalla.seccion,
      maquina: editarFalla.maquina,
      fechaActualizacion: editarFalla.fechaActualizacion
    };

    console.log('✅ Actualizando avería con técnico:', tecnicoActual.nombre, tecnicoActual.apellido);

    axiosInstance.put(`/fallas/${editarFalla.id}`, datos)
      .then(() => {
        alert("✅ Falla actualizada");
        setMostrarModal(false);
        cargarAverias();
      })
      .catch(err => {
        console.error("❌ Error al actualizar:", err.message);
        alert("Ocurrió un error al actualizar");
      });
  };

  return (
    <motion.div
      className="card shadow-lg p-4 mt-4 mx-auto"
      style={{
        width: '100%',
        maxWidth: '1400px',
        borderRadius: '20px',
        backgroundColor: 'white',
        overflowY: 'auto',
        maxHeight: '90vh'
      }}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-center mb-4 text-primary fw-bold">Averías Pendientes</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive" style={{ overflowX: 'auto' }}>
        <table className="table table-bordered table-hover align-middle text-center" style={{ minWidth: '1300px' }}>
          <thead className="table-primary">
            <tr>
              <th>ID</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Sección</th>
              <th>Máquina</th>
              <th>Fecha</th>
              <th>Supervisor</th>
              <th>Técnico</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {averias.map(av => (
              <tr key={av.id}>
                <td>{av.id}</td>
                <td>{av.descripcion}</td>
                <td>{av.estado}</td>
                <td>{av.seccion?.nombre}</td>
                <td>{av.maquina?.nombre}</td>
                <td>{new Date(av.fechaRegistro).toLocaleString()}</td>
                <td>{av.supervisorProduccion?.nombre}</td>
                <td>{av.tecnicoMantenimiento?.nombre || ''}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleEditarClick(av)}
                  >
                    <FaUserEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mostrarModal && editarFalla && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Actualizar Falla</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <div className="modal-body">

                <div className="mb-3">
                  <label>Descripción</label>
                  <textarea
                    className="form-control"
                    name="descripcion"
                    value={editarFalla.descripcion}
                    onChange={handleEditarChange}
                    rows="3"
                  />
                </div>

                <div className="mb-3">
                  <label>Nuevo Estado</label>
                  <select
                    className="form-select"
                    name="estado"
                    value={editarFalla.estado}
                    onChange={handleEditarChange}
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="RESUELTO">Resuelto</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label>Técnico Asignado</label>
                  <input
                    type="text"
                    className="form-control"
                    value={`${tecnicoActual?.nombre || ''} ${tecnicoActual?.apellido || ''}`}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label>Fecha y Hora de Actualización</label>
                  <input
                    type="text"
                    className="form-control"
                    value={obtenerFechaLimaFormateada()}
                    disabled
                  />
                </div>

              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleActualizar}>Guardar Cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}

export default ListaAveriasTecnico;
