import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { FaBars, FaTimes } from 'react-icons/fa'; // Iconos para toggle

function SidebarJefe({ onLogout }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handleLogout = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas cerrar sesión?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        onLogout();
      }
    });
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Botón toggle visible siempre */}
      <div className="position-absolute p-3" style={{ zIndex: 1000 }}>
        <button className="btn btn-dark" onClick={toggleSidebar}>
          {sidebarVisible ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Sidebar visible solo si sidebarVisible es true */}
      {sidebarVisible && (
        <motion.div
          className="bg-primary text-white p-4 shadow-lg"
          style={{
            width: "250px",
            borderRadius: "15px",
            background: 'linear-gradient(135deg,rgb(0, 0, 0) 0%,rgb(34, 26, 26) 100%)'
          }}
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="text-center mb-4 fw-bold">Jefe</h4>
          <ul className="nav flex-column">
            <li className="nav-item mb-3">
              <Link to="/jefe/dashboard" className="nav-link text-white fs-5">Dashboard</Link>
            </li>
            <li className="nav-item mb-3">
              <Link to="/jefe/registrar/usuario" className="nav-link text-white fs-5">Registrar Usuario</Link>
            </li>
            <li className="nav-item mb-3">
              <Link to="/jefe/registrar/averia" className="nav-link text-white fs-5">Registrar Avería</Link>
            </li>
            <li className="nav-item mb-3">
              <Link to="/jefe/usuarios" className="nav-link text-white fs-5">Ver Usuarios</Link>
            </li>
            <li className="nav-item mb-3">
              <Link to="/jefe/averias" className="nav-link text-white fs-5">Ver Averías</Link>
            </li>
            <li className="nav-item mb-3">
              <Link to="/jefe/secciones" className="nav-link text-white fs-5">Gestionar Secciones</Link>
            </li>
            <li className="nav-item mb-3">
              <Link to="/jefe/maquinas" className="nav-link text-white fs-5">Gestionar Máquinas</Link>
            </li>
            <li className="nav-item mt-4">
              <button
                onClick={handleLogout}
                className="btn btn-danger w-100 fs-5 py-2"
                style={{ borderRadius: '10px' }}
              >
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </motion.div>
      )}

      {/* Contenido principal */}
      <div className="flex-grow-1 p-4 bg-light rounded-3">
        <Outlet />
      </div>
    </div>
  );
}

export default SidebarJefe;
