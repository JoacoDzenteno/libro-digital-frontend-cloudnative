import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { actualizarPerfil } from '../services/usuarioService';
import './PerfilPage.css';

export default function PerfilPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [erroresForm, setErroresForm] = useState({});

    // ── VALIDACIÓN ────────────────────────────────────────────────

    const validarForm = () => {
        const errs = {};
        if (!nuevaPassword.trim() || nuevaPassword.trim().length < 6) {
            errs.nuevaPassword = 'La contraseña debe tener al menos 6 caracteres';
        }
        if (nuevaPassword !== confirmarPassword) {
            errs.confirmarPassword = 'Las contraseñas no coinciden';
        }
        return errs;
    };

    // ── HANDLER ───────────────────────────────────────────────────

    const handleActualizar = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        const errs = validarForm();
        if (Object.keys(errs).length > 0) {
            setErroresForm(errs);
            return;
        }
        setErroresForm({});

        try {
            await actualizarPerfil(user.id, {
                nuevoEmail: null,
                nuevaPassword
            });
            setMensaje('Contraseña actualizada correctamente. Por favor inicia sesión nuevamente.');
            setNuevaPassword('');
            setConfirmarPassword('');
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError('Error al actualizar la contraseña.');
        }
    };

    return (
        <div className="perfil-container">
            <header className="perfil-header">
                <button className="btn-volver" onClick={() => navigate('/dashboard')}>
                    ← Volver
                </button>
                <h1>Mi Perfil</h1>
                <div></div>
            </header>

            <div className="perfil-content">
                <div className="perfil-info-card">
                    <h2>Información Personal</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Nombre</span>
                            <span className="info-value">{user?.nombre} {user?.apellido}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Email de acceso</span>
                            <span className="info-value">{user?.email}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Rol</span>
                            <span className={`badge badge-${user?.rol?.toLowerCase()}`}>{user?.rol}</span>
                        </div>
                    </div>
                </div>

                <div className="perfil-form-card">
                    <h2>Cambiar Contraseña</h2>
                    {mensaje && <div className="alert-success">{mensaje}</div>}
                    {error && <div className="alert-error">{error}</div>}

                    <form onSubmit={handleActualizar}>
                        <div className="form-field">
                            <label>Nueva contraseña</label>
                            <input
                                type="password"
                                value={nuevaPassword}
                                onChange={(e) => setNuevaPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            {erroresForm.nuevaPassword && <span className="error-field">{erroresForm.nuevaPassword}</span>}
                        </div>
                        <div className="form-field">
                            <label>Confirmar nueva contraseña</label>
                            <input
                                type="password"
                                value={confirmarPassword}
                                onChange={(e) => setConfirmarPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            {erroresForm.confirmarPassword && <span className="error-field">{erroresForm.confirmarPassword}</span>}
                        </div>
                        <button type="submit" className="btn-guardar">
                            Guardar Cambios
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}