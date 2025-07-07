import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function DashboardJefe() {
  const [fallas, setFallas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [secciones, setSecciones] = useState([]);

  // 📅 Estado para el filtro de mes
  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const hoy = new Date();
    return hoy.getMonth(); // 0 = Enero
  });

  // 📌 Referencia para el PDF
  const dashboardRef = useRef(null);

  useEffect(() => {
    axiosInstance.get('/fallas').then(res => setFallas(res.data));
    axiosInstance.get('/usuarios').then(res => setUsuarios(res.data));
    axiosInstance.get('/maquinas').then(res => setMaquinas(res.data));
    axiosInstance.get('/secciones').then(res => setSecciones(res.data));
  }, []);

  // 📅 Filtrar averías por mes seleccionado
  const fallasFiltradas = fallas.filter(f => {
    const fecha = new Date(f.fechaRegistro);
    return fecha.getMonth() === mesSeleccionado;
  });

  // 📊 Procesar datos
  const totalAverias = fallasFiltradas.length;
  const pendientes = fallasFiltradas.filter(f => f.estado === "PENDIENTE").length;
  const enProceso = fallasFiltradas.filter(f => f.estado === "EN_PROCESO").length;
  const resueltos = fallasFiltradas.filter(f => f.estado === "RESUELTO").length;

  const countRoles = usuarios.reduce((acc, user) => {
    acc[user.rol] = (acc[user.rol] || 0) + 1;
    return acc;
  }, {});

  const averiasPorSeccion = secciones.map(sec => ({
    nombre: sec.nombre,
    cantidad: fallasFiltradas.filter(f => f.seccion?.id === sec.id).length
  }));

  // 📊 Averías atendidas por técnico
  const tecnicos = usuarios.filter(u => u.rol === "TECNICO");

  const averiasPorTecnico = tecnicos.map(tec => ({
    nombre: tec.nombre + " " + tec.apellido,
    cantidad: fallasFiltradas.filter(f => f.tecnicoMantenimiento?.id === tec.id).length
  }));

  // 📊 Averías por máquina
  const averiasPorMaquina = maquinas.map(mac => ({
    nombre: mac.nombre,
    cantidad: fallasFiltradas.filter(f => f.maquina?.id === mac.id).length
  }));

  // 📥 Descargar PDF
  const handleDownloadPDF = () => {
    const input = dashboardRef.current;
    html2canvas(input, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const nombreMes = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ][mesSeleccionado];
      pdf.save(`Dashboard_${nombreMes}.pdf`);
    });
  };

  return (
    <motion.div
      className="container mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div ref={dashboardRef}>
        <h2 className="text-center mb-4 fw-bold">Dashboard</h2>

        {/* Selector de Mes */}
        <div className="row mb-3">
          <div className="col-md-4">
            <label>Seleccionar Mes</label>
            <select
              className="form-select"
              value={mesSeleccionado}
              onChange={e => setMesSeleccionado(parseInt(e.target.value))}
            >
              {[
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
              ].map((mes, i) => (
                <option key={i} value={i}>{mes}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Indicadores rápidos */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card text-center p-3 shadow">
              <h5>Total Averías</h5>
              <h2>{totalAverias}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center p-3 shadow">
              <h5>Pendientes</h5>
              <h2>{pendientes}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center p-3 shadow">
              <h5>En Proceso</h5>
              <h2>{enProceso}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center p-3 shadow">
              <h5>Resueltos</h5>
              <h2>{resueltos}</h2>
            </div>
          </div>
        </div>

        {/* Gráficas */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card p-3 shadow">
              <h5 className="text-center">Usuarios por Rol</h5>
              <Pie
                data={{
                  labels: Object.keys(countRoles),
                  datasets: [{
                    data: Object.values(countRoles),
                    backgroundColor: ['#007bff', '#ffc107', '#28a745']
                  }]
                }}
              />
            </div>
          </div>

          <div className="col-md-8">
            <div className="card p-3 shadow">
              <h5 className="text-center">Averías por Sección</h5>
              <Bar
                data={{
                  labels: averiasPorSeccion.map(a => a.nombre),
                  datasets: [{
                    label: 'Cantidad de Averías',
                    data: averiasPorSeccion.map(a => a.cantidad),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)'
                  }]
                }}
                options={{ indexAxis: 'y' }}
              />
            </div>
          </div>
        </div>

        {/* Gráfico: Averías por Técnico */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card p-3 shadow">
              <h5 className="text-center">Averías Atendidas por Técnico</h5>
              <Bar
                data={{
                  labels: averiasPorTecnico.map(t => t.nombre),
                  datasets: [{
                    label: 'Cantidad de Averías Atendidas',
                    data: averiasPorTecnico.map(t => t.cantidad),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)'
                  }]
                }}
              />
            </div>
          </div>
        </div>

        {/* Gráfico: Averías por Máquina */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card p-3 shadow">
              <h5 className="text-center">Averías por Máquina</h5>
              <Bar
                data={{
                  labels: averiasPorMaquina.map(m => m.nombre),
                  datasets: [{
                    label: 'Cantidad de Averías',
                    data: averiasPorMaquina.map(m => m.cantidad),
                    backgroundColor: 'rgba(153, 102, 255, 0.6)'
                  }]
                }}
                options={{
                  plugins: {
                    legend: { display: true },
                    tooltip: { enabled: true }
                  },
                  responsive: true,
                  indexAxis: 'y'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botón de descarga */}
      <div className="text-center mb-4">
        <button className="btn btn-success" onClick={handleDownloadPDF}>
          Descargar Dashboard PDF
        </button>
      </div>

    </motion.div>
  );
}

export default DashboardJefe;
