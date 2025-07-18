import React, { useState } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { FaUser, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RegistrarUsuarioJefe() {
  const [usuario, setUsuario] = useState({
    nombre: '',
    apellido: '',
    codigoEmpleado: '',
    username: '',
    password: '',
    rol: ''
  });

  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const validarCampo = async (nombreCampo, valor) => {
    let errorMsg = '';

    if (!valor) return 'Este campo es obligatorio.';

    switch (nombreCampo) {
      case 'codigoEmpleado':
        if (!/^IB[JET]\d{5}$/.test(valor)) {
          errorMsg = "Debe empezar por 'IBJ', 'IBT' o 'IBE' seguido de 5 números.";
        } else if (await validarCodigoEmpleado(valor)) {
          errorMsg = 'Este código ya está registrado.';
        }
        break;

      case 'username':
        if (await validarUsername(valor)) {
          errorMsg = 'Este nombre de usuario ya está registrado.';
        }
        break;

      case 'password':
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}/.test(valor)) {
          errorMsg = 'Debe tener mayúscula, minúscula, número y al menos 6 caracteres.';
        }
        break;

      default:
        break;
    }

    return errorMsg;
  };

  const validarCodigoEmpleado = async (codigo) => {
    try {
      const res = await axiosInstance.get(`/usuarios/validar-codigo/${codigo}`);
      return res.data.existe;
    } catch {
      return true;
    }
  };

  const validarUsername = async (username) => {
    try {
      const res = await axiosInstance.get(`/usuarios/validar-username/${username}`);
      return res.data.existe;
    } catch {
      return true;
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    let nuevoUsuario = { ...usuario, [name]: value };

    // Detectar el rol según el código del empleado
    if (name === 'codigoEmpleado') {
      if (value.startsWith('IBJ')) {
        nuevoUsuario.rol = 'JEFE';
      } else if (value.startsWith('IBT')) {
        nuevoUsuario.rol = 'TECNICO';
      } else if (value.startsWith('IBE')) {
        nuevoUsuario.rol = 'SUPERVISOR';
      } else {
        nuevoUsuario.rol = '';
      }
    }

    setUsuario(nuevoUsuario);

    const error = await validarCampo(name, value);
    setErrores((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevosErrores = {};
    for (const campo in usuario) {
      const error = await validarCampo(campo, usuario[campo]);
      if (error) nuevosErrores[campo] = error;
    }

    if (!usuario.rol) {
      nuevosErrores.rol = 'Rol no válido según el código del empleado.';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    try {
      setCargando(true);
      await axiosInstance.post('/usuarios', usuario);
      setMensaje('✅ Usuario registrado exitosamente');
      setError(null);
      setUsuario({
        nombre: '',
        apellido: '',
        codigoEmpleado: '',
        username: '',
        password: '',
        rol: ''
      });
      setErrores({});
    } catch {
      setMensaje(null);
      setError('Error al registrar usuario');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100"
      style={{ background: 'linear-gradient(135deg,rgb(126, 155, 150) 0%,rgb(221, 221, 221) 100%)' }}>
      <motion.div className="card shadow-lg p-5" style={{ width: '400px', borderRadius: '20px', backgroundColor: 'white' }}
        initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2 className="text-center mb-4 text-primary fw-bold">Registrar Usuario</h2>

        {mensaje && <div className="alert alert-success">{mensaje}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          {['nombre', 'apellido', 'codigoEmpleado', 'username', 'password'].map((field) => (
            <div className="mb-4" key={field}>
              <label htmlFor={field} className="form-label">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <div className="input-group">
                <span className="input-group-text bg-primary text-white">
                  {field === 'password' ? <FaLock /> : <FaUser />}
                </span>
                <input
                  type={field === 'password' ? 'password' : 'text'}
                  id={field}
                  name={field}
                  className={`form-control form-control-lg shadow-sm ${errores[field] ? 'is-invalid' : ''}`}
                  placeholder={`Ingrese su ${field}`}
                  value={usuario[field]}
                  onChange={handleChange}
                />
                {errores[field] && <div className="invalid-feedback">{errores[field]}</div>}
              </div>
            </div>
          ))}

          {usuario.rol && (
            <div className="mb-3 text-center">
              <strong>Rol detectado:</strong> {usuario.rol}
            </div>
          )}

          {errores.rol && <div className="text-danger mb-3 text-center">{errores.rol}</div>}

          <div className="d-grid">
            <button className="btn btn-primary btn-lg" type="submit" style={{ borderRadius: '10px' }} disabled={cargando}>
              {cargando ? 'Cargando...' : 'Registrar Usuario'}
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

export default RegistrarUsuarioJefe;
