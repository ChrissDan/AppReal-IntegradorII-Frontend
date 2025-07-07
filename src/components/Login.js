// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await axios.post('http://localhost:8080/auth/login', {
        username,
        password
      });
  
      const token = response.data.token;
      localStorage.setItem('token', token);
      onLogin(token);
  
    } catch (err) {
      toast.error('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };    

  return (
    <div className="d-flex align-items-center justify-content-center vh-100" style={{
      background: 'linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)'
    }}>
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
        <h2 className="text-center mb-4 text-primary fw-bold">Bienvenido</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="form-label">Usuario</label>
            <div className="input-group">
              <span className="input-group-text bg-primary text-white"><FaUser /></span>
              <input
                type="text"
                id="username"
                className="form-control form-control-lg shadow-sm"
                placeholder="Ingrese su usuario"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <div className="input-group">
              <span className="input-group-text bg-primary text-white"><FaLock /></span>
              <input
                type="password"
                id="password"
                className="form-control form-control-lg shadow-sm"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="d-grid">
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              style={{ borderRadius: '10px' }}
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-muted">
          <small>© 2025 La Ibérica - Todos los derechos reservados</small>
        </div>
      </motion.div>

      <ToastContainer position="top-center" />
    </div>
  );
}

export default Login;