import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import 'animate.css';

import Login from './components/Login';

import SidebarJefe from './components/jefe/SidebarJefe';
import DashboardJefe from './components/jefe/DashboardJefe';
import RegistrarUsuarioJefe from './components/jefe/RegistrarUsuarioJefe'; // 👈 importar el nuevo componente
import RegistrarAveriaJefe from './components/jefe/RegistrarAveriaJefe';
import ListaUsuariosJefe from './components/jefe/ListaUsuariosJefe'; // 👈 importar
import ListaAveriasJefe from './components/jefe/ListaAveriasJefe';
import ListaSeccionesJefe from './components/jefe/ListaSeccionesJefe';
import ListaMaquinasJefe from './components/jefe/ListaMaquinasJefe'; // 👈 importar la nueva lista de máquinas

import PrivateRouteSupervisor from './components/supervisor/PrivateRouteSupervisor';
import SidebarSupervisor from './components/supervisor/SidebarSupervisor';
import RegistrarFallaSupervisor from './components/supervisor/RegistrarFallaSupervisor';
import ListaAveriasSupervisor from './components/supervisor/ListaAveriasSupervisor';

import SidebarTecnico from './components/tecnico/SidebarTecnico';
import ListaAveriasTecnico from './components/tecnico/ListaAveriasTecnico';
import ListaAveriasTecnicoAll from './components/tecnico/ListaAveriasTecnicoAll';


function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [rol, setRol] = useState(null);

  useEffect(() => {
    //localStorage.removeItem('token');
  }, []);

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setRol(decoded.rol);
    } else {
      setRol(null);
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setRol(null);
    navigate('/');
  };

  let redireccion;

  if (!token) {
    redireccion = <Login onLogin={setToken} />;
  } else {
    switch (rol) {
      case 'JEFE':
        redireccion = <Navigate to="/jefe/dashboard" />;
        break;
      case 'SUPERVISOR':
        redireccion = <Navigate to="/supervisor/registrar" />;
        break;
      case 'TECNICO':
        redireccion = <Navigate to="/tecnico/averias" />;
        break;
      default:
        redireccion = <h2>Rol no reconocido</h2>;
        break;
    }
  }

  return (
    <Routes>
      <Route path="/" element={redireccion} />

      {token && rol === 'JEFE' && (
        <Route path="/jefe" element={<SidebarJefe onLogout={handleLogout} />}>
          <Route path="dashboard" element={<DashboardJefe />} />
          <Route path="registrar/averia" element={<RegistrarAveriaJefe />} />
          <Route path="registrar/usuario" element={<RegistrarUsuarioJefe />} /> {/* 👈 NUEVO */}
          <Route path="averias" element={<ListaAveriasJefe />} />
          <Route path="usuarios" element={<ListaUsuariosJefe />} /> {/* 👈 nueva ruta */}
          <Route path="secciones" element={<ListaSeccionesJefe />} />
          <Route path="maquinas" element={<ListaMaquinasJefe />} />
        </Route>
      )}

      {token && rol === 'TECNICO' && (
        <Route path="/tecnico" element={<SidebarTecnico onLogout={handleLogout} />}>
          <Route path="averias" element={<ListaAveriasTecnico />} />
          <Route path="allAverias" element={<ListaAveriasTecnicoAll />} />
        </Route>
      )}

      {token && rol === 'SUPERVISOR' && (
        <Route element={<PrivateRouteSupervisor />}>
          <Route path="/supervisor" element={<SidebarSupervisor onLogout={handleLogout} />}>
            <Route path="registrar" element={<RegistrarFallaSupervisor />} />
            <Route path="averias" element={<ListaAveriasSupervisor />} />
          </Route>
        </Route>
      )}
    </Routes>
  );
}

export default App;