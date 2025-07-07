import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { motion } from 'framer-motion';
import { FaEye } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logoIberica from '../../images/logo-laiberica-actual.png';

function ListaAveriasTecnicoAll() {
  const [averias, setAverias] = useState([]);
  const [verFalla, setVerFalla] = useState(null);
  const [mostrarModalVer, setMostrarModalVer] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Obtener el técnico logueado desde token
  const token = localStorage.getItem('token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const tecnicoId = payload?.id;

  useEffect(() => {
    if (!tecnicoId) return;

    axiosInstance.get('/fallas')
      .then(res => {
        const asignadas = res.data.filter(f => f.tecnicoMantenimiento?.id === tecnicoId);
        setAverias(asignadas);
      })
      .catch(err => {
        console.error("❌ Error al cargar averías:", err.message);
        setError("No se pudieron cargar las averías");
      });
  }, [tecnicoId]);

  const handleVerClick = (falla) => {
    setVerFalla(falla);
    setMostrarModalVer(true);
  };

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

  return (
    <motion.div
      className="card shadow-lg p-4 mt-4 mx-auto"
      style={{
        width: '100%',
        maxWidth: '1000px',
        borderRadius: '20px',
        backgroundColor: 'white',
        overflowY: 'auto',
        maxHeight: '90vh'
      }}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-center mb-4 text-primary fw-bold">Mis Averías Asignadas</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive" style={{ overflowX: 'auto', maxHeight: '65vh' }}>
        <table className="table table-bordered table-hover align-middle text-center">
          <thead className="table-primary" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              <th>ID</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Sección</th>
              <th>Máquina</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
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
                <td>
                  <button className="btn btn-info btn-sm me-2" onClick={() => handleVerClick(av)}>
                    <FaEye /> Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE VER AVERÍA */}
      {mostrarModalVer && verFalla && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-center w-100 fw-bold">Detalle de la Avería</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModalVer(false)}></button>
              </div>
              <div className="modal-body" id="pdfContent">
                <div className="text-center mb-3">
                  <img src={logoIberica} alt="Logo La Ibérica" style={{ width: "150px" }} />
                </div>
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
                <button className="btn btn-success" onClick={handleDownloadPdf}>Descargar PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}

export default ListaAveriasTecnicoAll;
