import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { motion } from 'framer-motion';
import { FaTrash, FaUserEdit, FaEye } from 'react-icons/fa';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logoIberica from '../../images/logo-laiberica-actual.png';

function ListaAveriasJefe() {
  const [averias, setAverias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [editarFalla, setEditarFalla] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [secciones, setSecciones] = useState([]);
  const [maquinas, setMaquinas] = useState([]);

  const [verFalla, setVerFalla] = useState(null);
  const [mostrarModalVer, setMostrarModalVer] = useState(false);

  // 🔎 Estados de filtros
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroSupervisor, setFiltroSupervisor] = useState("");
  const [filtroTecnico, setFiltroTecnico] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroMaquina, setFiltroMaquina] = useState("");

  const cargarAverias = () => {
    axiosInstance.get('/fallas')
      .then(res => setAverias(res.data))
      .catch(err => {
        console.error("❌ Error al cargar averías:", err.message);
        setError("No se pudieron cargar las averías");
      });
  };

  useEffect(() => {
    axiosInstance.get('/maquinas')
      .then(res => setMaquinas(res.data))
      .catch(err => console.error('Error al cargar máquinas:', err));
  }, []);

  useEffect(() => {
    cargarAverias();

    axiosInstance.get('/secciones')
      .then(res => setSecciones(res.data))
      .catch(err => console.error('Error al cargar secciones', err));

    axiosInstance.get('/usuarios')
      .then(res => setUsuarios(res.data))
      .catch(err => console.error('Error al cargar usuarios', err));

  }, []);

  useEffect(() => {
    if (editarFalla?.seccion?.id) {
      axiosInstance.get(`/maquinas/por-seccion/${editarFalla.seccion.id}`)
        .then(res => setMaquinas(res.data))
        .catch(err => console.error('Error al cargar máquinas', err));
    }
  }, [editarFalla?.seccion?.id]);

  const handleEliminar = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas eliminar esta avería?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance.delete(`/fallas/${id}`)
          .then(() => {
            Swal.fire('Eliminado', '✅ Avería eliminada exitosamente.', 'success');
            cargarAverias();
          })
          .catch(err => {
            console.error("❌ Error al eliminar:", err.message);
            Swal.fire('Error', '❌ Ocurrió un error al eliminar la avería.', 'error');
          });
      }
    });
  };

  const handleEditarClick = (falla) => {
    setEditarFalla({
      ...falla,
      seccionId: falla.seccion?.id?.toString() || '',
      maquinaId: falla.maquina?.id?.toString() || ''
    });
    setMostrarModal(true);
  };

  const handleEditarChange = (e) => {
    const { name, value } = e.target;
    setEditarFalla(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'seccionId') {
      axiosInstance.get(`/maquinas/por-seccion/${value}`)
        .then(res => setMaquinas(res.data))
        .catch(err => console.error('Error al actualizar máquinas', err));
    }
  };

  const handleActualizar = () => {
    if (!editarFalla) return;

    const datos = {
      id: editarFalla.id,
      descripcion: editarFalla.descripcion,
      estado: editarFalla.estado,
      seccion: { id: parseInt(editarFalla.seccionId, 10) },
      maquina: { id: parseInt(editarFalla.maquinaId, 10) },
      supervisorProduccion: editarFalla.supervisorProduccion,
      tecnicoMantenimiento: editarFalla.tecnicoMantenimiento,
      fechaRegistro: editarFalla.fechaRegistro
    };

    axiosInstance.put(`/fallas/${editarFalla.id}`, datos)
      .then(() => {
        Swal.fire('Actualizado', '✅ Avería actualizada exitosamente.', 'success');
        setMostrarModal(false);
        cargarAverias();
      })
      .catch(err => {
        console.error("❌ Error al actualizar:", err.message);
        Swal.fire('Error', '❌ Ocurrió un error al actualizar la avería.', 'error');
      });
  };

  const handleVerClick = (falla) => {
    setVerFalla(falla);
    setMostrarModalVer(true);
  };

  // 🔎 Filtrado
  const averiasFiltradas = averias.filter(av =>
    (filtroEstado === "" || av.estado === filtroEstado) &&
    (filtroSupervisor === "" || av.supervisorProduccion?.id === parseInt(filtroSupervisor)) &&
    (filtroTecnico === "" || av.tecnicoMantenimiento?.id === parseInt(filtroTecnico)) &&
    (filtroMes === "" || new Date(av.fechaRegistro).getMonth() + 1 === parseInt(filtroMes)) &&
    (filtroMaquina === "" || av.maquina?.id === parseInt(filtroMaquina))
  );

  const handleDownloadPdf = () => {
    const input = document.getElementById('pdfContent');

    html2canvas(input, { scale: 2, useCORS: true })
      .then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`averia_${verFalla.id}.pdf`);
      })
      .catch(error => {
        console.error("Error al generar PDF:", error);
      });
  };

  const handleDownloadListaPdf = () => {
    const input = document.getElementById('pdfLista');

    html2canvas(input, { scale: 2, useCORS: true })
      .then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`lista_averias.pdf`);
      })
      .catch(error => {
        console.error("Error al generar PDF:", error);
      });
  };


  async function getBase64FromUrl(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

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
      <h3 className="text-center mb-4 text-primary fw-bold">Lista de Averías</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* 🔎 FILTROS */}
      <div className="row mb-2 align-items-end">
        <div className="col-md-2">
          <label>Filtrar por Estado</label>
          <select className="form-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="RESUELTO">Resuelto</option>
          </select>
        </div>

        <div className="col-md-2">
          <label>Filtrar por Supervisor</label>
          <select className="form-select" value={filtroSupervisor} onChange={e => setFiltroSupervisor(e.target.value)}>
            <option value="">Todos</option>
            {usuarios.filter(u => u.rol === "SUPERVISOR").map(sup => (
              <option key={sup.id} value={sup.id}>{sup.nombre} {sup.apellido}</option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <label>Filtrar por Técnico</label>
          <select className="form-select" value={filtroTecnico} onChange={e => setFiltroTecnico(e.target.value)}>
            <option value="">Todos</option>
            {usuarios.filter(u => u.rol === "TECNICO").map(tec => (
              <option key={tec.id} value={tec.id}>{tec.nombre} {tec.apellido}</option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <label>Filtrar por Máquina</label>
          <select
            className="form-select"
            value={filtroMaquina}
            onChange={e => setFiltroMaquina(e.target.value)}
          >
            <option value="">Todos</option>
            {maquinas.map(maq => (
              <option key={maq.id} value={maq.id}>
                {maq.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <label>Filtrar por Mes</label>
          <select className="form-select" value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
            <option value="">Todos</option>
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            <option value="3">Marzo</option>
            <option value="4">Abril</option>
            <option value="5">Mayo</option>
            <option value="6">Junio</option>
            <option value="7">Julio</option>
            <option value="8">Agosto</option>
            <option value="9">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>

        <div className="col-md-2 text-end">
          <button className="btn btn-success mt-4" onClick={handleDownloadListaPdf}>
            Descargar PDF
          </button>
        </div>
      </div>

      <div id="pdfLista" className="table-responsive" style={{ overflowX: 'auto', maxHeight: '65vh' }}>
        <table className="table table-bordered table-hover align-middle text-center" style={{ minWidth: '1300px' }}>
          <thead className="table-primary" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              <th>ID</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Sección</th>
              <th>Máquina</th>
              <th>Fecha</th>
              <th>Supervisor</th>
              <th>Técnico</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {averiasFiltradas.map(av => (
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
                  <button className="btn btn-info btn-sm me-2" onClick={() => handleVerClick(av)}><FaEye /></button>
                  <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditarClick(av)}><FaUserEdit /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(av.id)}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDICIÓN y MODAL DE VER: se mantienen igual en tu código */}

      {/* MODAL DE EDICIÓN */}
      {mostrarModal && editarFalla && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Avería</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label>Descripción</label>
                  <input
                    type="text"
                    className="form-control"
                    name="descripcion"
                    value={editarFalla.descripcion}
                    onChange={handleEditarChange}
                  />
                </div>
                <div className="mb-3">
                  <label>Estado</label>
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
                  <label>Sección</label>
                  <select
                    className="form-select"
                    name="seccionId"
                    value={editarFalla.seccionId}
                    onChange={handleEditarChange}
                  >
                    <option value="">Seleccione una sección</option>
                    {secciones.map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label>Máquina</label>
                  <select
                    className="form-select"
                    name="maquinaId"
                    value={editarFalla.maquinaId}
                    onChange={handleEditarChange}
                  >
                    <option value="">Seleccione una máquina</option>
                    {maquinas.map(mac => (
                      <option key={mac.id} value={mac.id}>{mac.nombre}</option>
                    ))}
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

      {/* MODAL DE VER AVERÍA */}
      {mostrarModalVer && verFalla && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">

                <button type="button" className="btn-close" onClick={() => setMostrarModalVer(false)}></button>
              </div>
              <div className="modal-body" id="pdfContent"> {/* 👈 id para html2canvas */}
                <div className="text-center mb-3">
                  <img
                    src={logoIberica}
                    alt="Logo La Ibérica"
                    style={{ width: "150px" }}
                  />
                </div>
                <h3 className="text-center fw-bold mb-3" style={{ fontSize: '1.8rem' }}>
                  Detalle de la Avería
                </h3>
                <hr />

                <p><strong>ID:</strong> {verFalla.id}</p>
                <p><strong>Descripción:</strong> {verFalla.descripcion}</p>
                <p><strong>Estado:</strong> {verFalla.estado}</p>
                <p><strong>Sección:</strong> {verFalla.seccion?.nombre}</p>
                <p><strong>Máquina:</strong> {verFalla.maquina?.nombre}</p>
                <p><strong>Fecha Registro:</strong> {new Date(verFalla.fechaRegistro).toLocaleString()}</p>
                <p><strong>Fecha Actualización:</strong> {verFalla.fechaActualizacion ? new Date(verFalla.fechaActualizacion).toLocaleString() : 'Sin actualizar'}</p>
                <p><strong>Supervisor:</strong> {verFalla.supervisorProduccion?.nombre}</p>
                <p><strong>Técnico:</strong> {verFalla.tecnicoMantenimiento?.nombre || ''}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setMostrarModalVer(false)}>Cerrar</button>
                <button className="btn btn-success" onClick={handleDownloadPdf}>
                  Descargar PDF
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}

export default ListaAveriasJefe;
