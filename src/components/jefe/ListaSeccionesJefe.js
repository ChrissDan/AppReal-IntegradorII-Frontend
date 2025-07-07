import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaUserEdit } from 'react-icons/fa';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

function ListaSeccionesJefe() {
  const [secciones, setSecciones] = useState([]);
  const [nombreSeccion, setNombreSeccion] = useState('');
  const [editarSeccion, setEditarSeccion] = useState(null);
  const [error, setError] = useState(null);

  const cargarSecciones = () => {
    axiosInstance.get('/secciones')
      .then(res => setSecciones(res.data))
      .catch(err => {
        console.error("❌ Error al cargar secciones:", err.message);
        setError("No se pudieron cargar las secciones");
      });
  };

  useEffect(() => {
    cargarSecciones();
  }, []);

  const handleCrear = () => {
    if (!nombreSeccion.trim()) {
      Swal.fire('Error', 'Ingrese un nombre de sección válido.', 'error');
      return;
    }

    axiosInstance.post('/secciones', { nombre: nombreSeccion })
      .then(() => {
        Swal.fire('Creado', '✅ Sección creada exitosamente.', 'success');
        setNombreSeccion('');
        cargarSecciones();
      })
      .catch(err => {
        console.error("❌ Error al crear sección:", err.message);
        Swal.fire('Error', '❌ Ocurrió un error al crear la sección.', 'error');
      });
  };

  const handleEditarClick = (seccion) => {
    setEditarSeccion({ ...seccion });
  };

  const handleEditarChange = (e) => {
    const { value } = e.target;
    setEditarSeccion(prev => ({
      ...prev,
      nombre: value
    }));
  };

  const handleActualizar = () => {
    if (!editarSeccion || !editarSeccion.nombre.trim()) {
      Swal.fire('Error', 'Ingrese un nombre de sección válido.', 'error');
      return;
    }

    axiosInstance.put(`/secciones/${editarSeccion.id}`, editarSeccion)
      .then(() => {
        Swal.fire('Actualizado', '✅ Sección actualizada exitosamente.', 'success');
        setEditarSeccion(null);
        cargarSecciones();
      })
      .catch(err => {
        console.error("❌ Error al actualizar:", err.message);
        Swal.fire('Error', '❌ Ocurrió un error al actualizar la sección.', 'error');
      });
  };

  const handleEliminar = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas eliminar esta sección?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance.delete(`/secciones/${id}`)
          .then(() => {
            Swal.fire('Eliminado', '✅ Sección eliminada exitosamente.', 'success');
            cargarSecciones();
          })
          .catch(err => {
            console.error("❌ Error al eliminar:", err.message);
            Swal.fire('Error', '❌ Ocurrió un error al eliminar la sección.', 'error');
          });
      }
    });
  };

  return (
    <motion.div
      className="card shadow-lg p-4 mt-4 mx-auto"
      style={{
        width: '100%',
        maxWidth: '800px',
        borderRadius: '20px',
        backgroundColor: 'white',
        overflowY: 'auto',
        maxHeight: '90vh'
      }}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-center mb-4 text-primary fw-bold">Gestión de Secciones</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-4 d-flex">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Nueva sección"
          value={nombreSeccion}
          onChange={e => setNombreSeccion(e.target.value)}
        />
        <button className="btn btn-success" onClick={handleCrear}>
          <FaPlus /> Crear
        </button>
      </div>

      <table className="table table-bordered table-hover align-middle text-center">
        <thead className="table-primary">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {secciones.map(sec => (
            <tr key={sec.id}>
              <td>{sec.id}</td>
              <td>{sec.nombre}</td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => handleEditarClick(sec)}
                >
                  <FaUserEdit />
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleEliminar(sec.id)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de editar */}
      {editarSeccion && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Sección</h5>
                <button type="button" className="btn-close" onClick={() => setEditarSeccion(null)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  value={editarSeccion.nombre}
                  onChange={handleEditarChange}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditarSeccion(null)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleActualizar}>Guardar Cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ListaSeccionesJefe;
