import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { FaUserEdit, FaTrash, FaKey } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

function ListaUsuariosJefe() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [editarUsuario, setEditarUsuario] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // 🔑 Estados para cambiar contraseña
  const [usuarioPassword, setUsuarioPassword] = useState(null);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [mostrarModalPassword, setMostrarModalPassword] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = () => {
    axiosInstance.get('/usuarios')
      .then(res => setUsuarios(res.data))
      .catch(err => {
        console.error("❌ Error al cargar usuarios:", err.message);
        setError("No se pudieron cargar los usuarios");
      });
  };

  const handleEliminar = id => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas eliminar este usuario?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance.delete(`/usuarios/${id}`)
          .then(() => {
            Swal.fire('Eliminado', '✅ Usuario eliminado exitosamente.', 'success');
            setUsuarios(usuarios.filter(u => u.id !== id));
          })
          .catch(err => {
            console.error("❌ Error al eliminar:", err.message);
            Swal.fire('Error', '❌ Ocurrió un error al eliminar el usuario.', 'error');
          });
      }
    });
  };

  const handleEditarClick = (usuario) => {
    setEditarUsuario({ ...usuario });
    setMostrarModal(true);
  };

  const handleEditarChange = (e) => {
    const { name, value } = e.target;
    setEditarUsuario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleActualizar = () => {
    if (!editarUsuario) return;

    const datos = {
      id: editarUsuario.id,
      nombre: editarUsuario.nombre,
      apellido: editarUsuario.apellido,
      codigoEmpleado: editarUsuario.codigoEmpleado,
      username: editarUsuario.username,
      rol: editarUsuario.rol
    };

    axiosInstance.put(`/usuarios/${editarUsuario.id}`, datos)
      .then(() => {
        Swal.fire('Actualizado', '✅ Usuario actualizado exitosamente.', 'success');
        setMostrarModal(false);
        cargarUsuarios();
      })
      .catch(err => {
        console.error("❌ Error al actualizar:", err.message);
        Swal.fire('Error', '❌ Ocurrió un error al actualizar el usuario.', 'error');
      });
  };

  // 🔑 FUNCIONES CAMBIAR PASSWORD
  const handleCambiarPasswordClick = (usuario) => {
    setUsuarioPassword(usuario);
    setNuevaPassword("");
    setMostrarModalPassword(true);
  };

  const handleActualizarPassword = () => {
    if (!nuevaPassword) return;

    axiosInstance.put(`/usuarios/${usuarioPassword.id}/password`, { password: nuevaPassword })
      .then(() => {
        Swal.fire('Actualizado', '✅ Contraseña actualizada exitosamente.', 'success');
        setMostrarModalPassword(false);
      })
      .catch(err => {
        console.error("❌ Error al actualizar contraseña:", err.message);
        Swal.fire('Error', '❌ Ocurrió un error al actualizar la contraseña.', 'error');
      });
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
          width: '80%',
          borderRadius: '20px',
          backgroundColor: 'white'
        }}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-center mb-4 text-primary fw-bold">Lista de Usuarios</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle text-center">
            <thead className="table-primary">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Código Empleado</th>
                <th>Username</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.nombre}</td>
                  <td>{user.apellido}</td>
                  <td>{user.codigoEmpleado}</td>
                  <td>{user.username}</td>
                  <td>{user.rol}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEditarClick(user)}
                    >
                      <FaUserEdit />
                    </button>
                    <button
                      className="btn btn-secondary btn-sm me-2"
                      onClick={() => handleCambiarPasswordClick(user)}
                    >
                      <FaKey />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleEliminar(user.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL DE EDICIÓN */}
        {mostrarModal && editarUsuario && (
          <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Editar Usuario</h5>
                  <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label>Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nombre"
                      value={editarUsuario.nombre}
                      onChange={handleEditarChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Apellido</label>
                    <input
                      type="text"
                      className="form-control"
                      name="apellido"
                      value={editarUsuario.apellido}
                      onChange={handleEditarChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Código Empleado</label>
                    <input
                      type="text"
                      className="form-control"
                      name="codigoEmpleado"
                      value={editarUsuario.codigoEmpleado}
                      onChange={handleEditarChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Username</label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={editarUsuario.username}
                      onChange={handleEditarChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Rol</label>
                    <select
                      className="form-select"
                      name="rol"
                      value={editarUsuario.rol}
                      onChange={handleEditarChange}
                    >
                      <option value="JEFE">JEFE</option>
                      <option value="SUPERVISOR">SUPERVISOR</option>
                      <option value="TECNICO">TECNICO</option>
                    </select>
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

        {/* 🔑 MODAL CAMBIAR PASSWORD */}
        {mostrarModalPassword && usuarioPassword && (
          <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Cambiar Contraseña</h5>
                  <button type="button" className="btn-close" onClick={() => setMostrarModalPassword(false)}></button>
                </div>
                <div className="modal-body">
                  <p><strong>Usuario:</strong> {usuarioPassword.username}</p>
                  <div className="mb-3">
                    <label>Nueva Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      value={nuevaPassword}
                      onChange={(e) => setNuevaPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setMostrarModalPassword(false)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={handleActualizarPassword}>Actualizar</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}

export default ListaUsuariosJefe;
