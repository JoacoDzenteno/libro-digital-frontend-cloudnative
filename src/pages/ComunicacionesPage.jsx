import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    obtenerMensajesPorDestinatario,
    enviarMensaje,
    marcarComoLeido,
    eliminarMensaje
} from '../services/comunicacionesService';
import { obtenerUsuarios } from '../services/usuarioService';
import './ComunicacionesPage.css';

const TIPOS_MENSAJE = ['NOTIFICACION', 'COMUNICADO', 'ALERTA'];

export default function ComunicacionesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [mensajes, setMensajes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [tab, setTab] = useState('recibidos');
    const [erroresForm, setErroresForm] = useState({});

    const [form, setForm] = useState({
        idRemitente: user?.id || '',
        idDestinatario: '',
        asunto: '',
        contenido: '',
        tipo: 'NOTIFICACION',
        fechaEnvio: new Date().toISOString(),
        leido: false
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [m, u] = await Promise.all([
                obtenerMensajesPorDestinatario(user.id),
                obtenerUsuarios()
            ]);
            setMensajes(m);
            setUsuarios(u.filter(u => u.id !== user.id));
        } catch (err) {
            setError('Error al cargar mensajes');
        }
    };

    const mostrarMensaje = (msg, esError = false) => {
        if (esError) setError(msg);
        else setMensaje(msg);
        setTimeout(() => { setMensaje(''); setError(''); }, 3000);
    };

    // ── VALIDACIÓN ────────────────────────────────────────────────

    const validarForm = () => {
        const errs = {};
        if (!form.asunto.trim() || form.asunto.trim().length < 3) {
            errs.asunto = 'El asunto debe tener al menos 3 caracteres';
        }
        if (!form.contenido.trim() || form.contenido.trim().length < 10) {
            errs.contenido = 'El contenido debe tener al menos 10 caracteres';
        }
        return errs;
    };

    // ── HANDLERS ──────────────────────────────────────────────────

    const handleEnviar = async (e) => {
        e.preventDefault();
        const errs = validarForm();
        if (Object.keys(errs).length > 0) {
            setErroresForm(errs);
            return;
        }
        setErroresForm({});
        try {
            await enviarMensaje({
                ...form,
                idRemitente: parseInt(user.id),
                idDestinatario: parseInt(form.idDestinatario),
                fechaEnvio: new Date().toISOString()
            });
            mostrarMensaje('Mensaje enviado correctamente');
            setForm({
                idRemitente: user?.id || '',
                idDestinatario: '',
                asunto: '',
                contenido: '',
                tipo: 'NOTIFICACION',
                fechaEnvio: new Date().toISOString(),
                leido: false
            });
            setMostrarForm(false);
            cargarDatos();
        } catch (err) {
            mostrarMensaje('Error al enviar el mensaje', true);
        }
    };

    const handleMarcarLeido = async (id) => {
        try {
            await marcarComoLeido(id);
            cargarDatos();
        } catch (err) {
            mostrarMensaje('Error al marcar como leído', true);
        }
    };

    const handleEliminar = async (id) => {
        try {
            await eliminarMensaje(id);
            mostrarMensaje('Mensaje eliminado');
            cargarDatos();
        } catch (err) {
            mostrarMensaje('Error al eliminar el mensaje', true);
        }
    };

    const getNombreUsuario = (id) => {
        const u = usuarios.find(u => u.id === id);
        return u ? `${u.nombre} ${u.apellido}` : `ID: ${id}`;
    };

    const mensajesNoLeidos = mensajes.filter(m => !m.leido);
    const mensajesLeidos = mensajes.filter(m => m.leido);

    return (
        <div className="comunicaciones-container">
            <header className="comunicaciones-header">
                <button className="btn-volver" onClick={() => navigate('/dashboard')}>← Volver</button>
                <h1>Comunicaciones</h1>
                <button className="btn-nuevo" onClick={() => setMostrarForm(!mostrarForm)}>
                    {mostrarForm ? 'Cancelar' : '+ Nuevo Mensaje'}
                </button>
            </header>

            {mensaje && <div className="alert-success">{mensaje}</div>}
            {error && <div className="alert-error">{error}</div>}

            {mostrarForm && (
                <div className="form-card">
                    <h2>Nuevo Mensaje</h2>
                    <form onSubmit={handleEnviar} className="comunicaciones-form">
                        <div className="form-row">
                            <div className="form-field">
                                <label>Destinatario</label>
                                <select value={form.idDestinatario} onChange={e => setForm({ ...form, idDestinatario: e.target.value })} required>
                                    <option value="">Seleccionar destinatario</option>
                                    {usuarios.map(u => (
                                        <option key={u.id} value={u.id}>{u.nombre} {u.apellido} — {u.rol}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Tipo</label>
                                <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                                    {TIPOS_MENSAJE.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-field">
                            <label>Asunto</label>
                            <input
                                type="text"
                                value={form.asunto}
                                onChange={e => setForm({ ...form, asunto: e.target.value })}
                                required
                            />
                            {erroresForm.asunto && <span className="error-field">{erroresForm.asunto}</span>}
                        </div>
                        <div className="form-field">
                            <label>Contenido</label>
                            <textarea
                                value={form.contenido}
                                onChange={e => setForm({ ...form, contenido: e.target.value })}
                                rows="4"
                                required
                            />
                            {erroresForm.contenido && <span className="error-field">{erroresForm.contenido}</span>}
                        </div>
                        <button type="submit" className="btn-guardar">Enviar Mensaje</button>
                    </form>
                </div>
            )}

            <div className="tabs">
                <button className={tab === 'recibidos' ? 'tab active' : 'tab'} onClick={() => setTab('recibidos')}>
                    No leídos {mensajesNoLeidos.length > 0 && <span className="badge-count">{mensajesNoLeidos.length}</span>}
                </button>
                <button className={tab === 'leidos' ? 'tab active' : 'tab'} onClick={() => setTab('leidos')}>
                    Leídos
                </button>
            </div>

            <div className="mensajes-lista">
                {(tab === 'recibidos' ? mensajesNoLeidos : mensajesLeidos).length === 0 ? (
                    <div className="sin-mensajes">
                        <p>No hay mensajes {tab === 'recibidos' ? 'no leídos' : 'leídos'}</p>
                    </div>
                ) : (
                    (tab === 'recibidos' ? mensajesNoLeidos : mensajesLeidos).map(m => (
                        <div key={m.id} className={`mensaje-card ${!m.leido ? 'no-leido' : ''}`}>
                            <div className="mensaje-header">
                                <div className="mensaje-info">
                                    <span className={`badge-tipo badge-${m.tipo?.toLowerCase()}`}>{m.tipo}</span>
                                    <span className="mensaje-asunto">{m.asunto}</span>
                                </div>
                                <div className="mensaje-meta">
                                    <span className="mensaje-fecha">{new Date(m.fechaEnvio).toLocaleDateString('es-CL')}</span>
                                    <span className="mensaje-remitente">De: {getNombreUsuario(m.idRemitente)}</span>
                                </div>
                            </div>
                            <p className="mensaje-contenido">{m.contenido}</p>
                            <div className="mensaje-acciones">
                                {!m.leido && (
                                    <button className="btn-leer" onClick={() => handleMarcarLeido(m.id)}>
                                        Marcar como leído
                                    </button>
                                )}
                                <button className="btn-eliminar" onClick={() => handleEliminar(m.id)}>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}