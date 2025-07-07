import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaUserEdit } from 'react-icons/fa';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

function ListaMaquinasJefe() {
    const [maquinas, setMaquinas] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [nuevaMaquina, setNuevaMaquina] = useState({ nombre: '', seccionId: '' });
    const [editarMaquina, setEditarMaquina] = useState(null);

    useEffect(() => {
        cargarMaquinas();
        cargarSecciones();
    }, []);

    const cargarMaquinas = () => {
        axiosInstance.get('/maquinas')
            .then(res => setMaquinas(res.data))
            .catch(err => console.error('❌ Error al cargar máquinas:', err));
    };

    const cargarSecciones = () => {
        axiosInstance.get('/secciones')
            .then(res => setSecciones(res.data))
            .catch(err => console.error('❌ Error al cargar secciones:', err));
    };

    const handleChangeNueva = e => {
        const { name, value } = e.target;
        setNuevaMaquina(prev => ({ ...prev, [name]: value }));
    };

    const handleCrear = () => {
        if (!nuevaMaquina.nombre || !nuevaMaquina.seccionId) {
            Swal.fire('Error', 'Complete todos los campos', 'error');
            return;
        }

        axiosInstance.post('/maquinas', {
            nombre: nuevaMaquina.nombre,
            seccion: { id: parseInt(nuevaMaquina.seccionId) }
        })
            .then(() => {
                Swal.fire('Creado', '✅ Máquina registrada', 'success');
                setNuevaMaquina({ nombre: '', seccionId: '' });
                cargarMaquinas();
            })
            .catch(err => {
                console.error('❌ Error al crear máquina:', err);
                Swal.fire('Error', '❌ No se pudo crear la máquina', 'error');
            });
    };

    const handleEliminar = id => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Deseas eliminar esta máquina?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(result => {
            if (result.isConfirmed) {
                axiosInstance.delete(`/maquinas/${id}`)
                    .then(() => {
                        Swal.fire('Eliminado', '✅ Máquina eliminada', 'success');
                        cargarMaquinas();
                    })
                    .catch(err => {
                        console.error('❌ Error al eliminar máquina:', err);
                        Swal.fire('Error', '❌ No se pudo eliminar', 'error');
                    });
            }
        });
    };

    const handleEditarClick = maquina => {
        setEditarMaquina({ ...maquina, seccionId: maquina.seccion?.id || '' });
    };

    const handleEditarChange = e => {
        const { name, value } = e.target;
        setEditarMaquina(prev => ({ ...prev, [name]: value }));
    };

    const handleActualizar = () => {
        if (!editarMaquina.nombre || !editarMaquina.seccionId) {
            Swal.fire('Error', 'Complete todos los campos', 'error');
            return;
        }

        axiosInstance.put(`/maquinas/${editarMaquina.id}`, {
            nombre: editarMaquina.nombre,
            seccion: { id: parseInt(editarMaquina.seccionId) }
        })
            .then(() => {
                Swal.fire('Actualizado', '✅ Máquina actualizada', 'success');
                setEditarMaquina(null);
                cargarMaquinas();
            })
            .catch(err => {
                console.error('❌ Error al actualizar máquina:', err);
                Swal.fire('Error', '❌ No se pudo actualizar', 'error');
            });
    };

    return (
        <motion.div
            className="card shadow-lg p-4 mt-4 mx-auto"
            style={{ width: '100%', maxWidth: '1000px', borderRadius: '20px', backgroundColor: 'white' }}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <h3 className="text-center mb-4 text-primary fw-bold">Gestión de Máquinas</h3>

            {/* Formulario para crear */}
            <div className="mb-4">
                <h5>Registrar nueva máquina</h5>
                <div className="row">
                    <div className="col">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nombre de la máquina"
                            name="nombre"
                            value={nuevaMaquina.nombre}
                            onChange={handleChangeNueva}
                        />
                    </div>
                    <div className="col">
                        <select
                            className="form-select"
                            name="seccionId"
                            value={nuevaMaquina.seccionId}
                            onChange={handleChangeNueva}
                        >
                            <option value="">Seleccione una sección</option>
                            {secciones.map(sec => (
                                <option key={sec.id} value={sec.id}>{sec.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col">
                        <button className="btn btn-success w-100" onClick={handleCrear}>
                            <FaPlus /> Registrar
                            </button>
                    </div>
                </div>
            </div>

            {/* Tabla de máquinas */}
            <div className="table-responsive">
                <table className="table table-bordered table-hover text-center align-middle">
                    <thead className="table-primary">
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Sección</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {maquinas.map(m => (
                            <tr key={m.id}>
                                <td>{m.id}</td>
                                <td>{m.nombre}</td>
                                <td>{m.seccion?.nombre}</td>
                                <td>
                                    <button className="btn btn-warning btn-sm me-2"
                                        onClick={() => handleEditarClick(m)}
                                    >
                                        <FaUserEdit />
                                    </button>
                                    <button className="btn btn-danger btn-sm"
                                        onClick={() => handleEliminar(m.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de edición */}
            {editarMaquina && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Editar Máquina</h5>
                                <button type="button" className="btn-close" onClick={() => setEditarMaquina(null)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="nombre"
                                        value={editarMaquina.nombre}
                                        onChange={handleEditarChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label>Sección</label>
                                    <select
                                        className="form-select"
                                        name="seccionId"
                                        value={editarMaquina.seccionId}
                                        onChange={handleEditarChange}
                                    >
                                        <option value="">Seleccione una sección</option>
                                        {secciones.map(sec => (
                                            <option key={sec.id} value={sec.id}>{sec.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setEditarMaquina(null)}>Cancelar</button>
                                <button className="btn btn-primary" onClick={handleActualizar}>Guardar Cambios</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default ListaMaquinasJefe;
