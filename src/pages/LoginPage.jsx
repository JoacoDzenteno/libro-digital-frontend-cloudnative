import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [erroresForm, setErroresForm] = useState({});
    const { login } = useAuth();
    const navigate = useNavigate();

    // ── VALIDACIÓN ────────────────────────────────────────────────

    const validarForm = () => {
        const errs = {};
        if (!email.endsWith('@colegio.cl')) {
            errs.email = 'El correo debe ser @colegio.cl';
        }
        if (!password.trim() || password.trim().length < 6) {
            errs.password = 'La contraseña debe tener al menos 6 caracteres';
        }
        return errs;
    };

    // ── HANDLER ───────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const errs = validarForm();
        if (Object.keys(errs).length > 0) {
            setErroresForm(errs);
            return;
        }
        setErroresForm({});
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Credenciales incorrectas. Intente nuevamente.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Colegio Bernardo O'Higgins</h2>
                <h3 className="login-subtitle">Libro de Clases Digital</h3>
                <form onSubmit={handleSubmit}>
                    <div className="login-field">
                        <label className="login-label">Email</label>
                        <input
                            className="login-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="correo@colegio.cl"
                            required
                        />
                        {erroresForm.email && <span className="error-field">{erroresForm.email}</span>}
                    </div>
                    <div className="login-field">
                        <label className="login-label">Contraseña</label>
                        <input
                            className="login-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        {erroresForm.password && <span className="error-field">{erroresForm.password}</span>}
                    </div>
                    {error && <p className="login-error">{error}</p>}
                    <button className="login-button" type="submit">
                        Iniciar Sesión
                    </button>
                </form>
            </div>
        </div>
    );
}