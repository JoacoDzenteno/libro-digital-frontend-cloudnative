import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerReportes, generarReporte, eliminarReporte } from '../services/reportesService';
import './ReportesPage.css';

const TIPOS_REPORTE = ['ASISTENCIA', 'CALIFICACIONES', 'CONDUCTA', 'ACADEMICO_GENERAL'];

export default function ReportesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [reportes, setReportes] = useState([]);
    const [filtroTipo, setFiltroTipo] = useState('');
    const [mostrarForm, setMostrarForm] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [erroresForm, setErroresForm] = useState({});

    const [form, setForm] = useState({
        titulo: '',
        tipo: 'ASISTENCIA',
        idReferencia: '',
        contenido: '',
        fechaGeneracion: new Date().toISOString(),
        idGeneradoPor: user?.id || ''
    });

    useEffect(() => {
        cargarReportes();
    }, []);

    const cargarReportes = async () => {
        try {
            const data = await obtenerReportes();
            setReportes(data);
        } catch (err) {
            setError('Error al cargar reportes');
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
        if (!form.titulo.trim() || form.titulo.trim().length < 3) {
            errs.titulo = 'El título debe tener al menos 3 caracteres';
        }
        const idRef = parseInt(form.idReferencia);
        if (!idRef || idRef < 1) {
            errs.idReferencia = 'El ID de referencia debe ser un número mayor a 0';
        }
        if (!form.contenido.trim() || form.contenido.trim().length < 10) {
            errs.contenido = 'El contenido debe tener al menos 10 caracteres';
        }
        return errs;
    };

    // ── HANDLERS ──────────────────────────────────────────────────

    const handleGenerar = async (e) => {
        e.preventDefault();
        const errs = validarForm();
        if (Object.keys(errs).length > 0) {
            setErroresForm(errs);
            return;
        }
        setErroresForm({});
        try {
            await generarReporte({
                ...form,
                idReferencia: parseInt(form.idReferencia),
                idGeneradoPor: parseInt(user.id),
                fechaGeneracion: new Date().toISOString()
            });
            mostrarMensaje('Reporte generado correctamente');
            setForm({
                titulo: '',
                tipo: 'ASISTENCIA',
                idReferencia: '',
                contenido: '',
                fechaGeneracion: new Date().toISOString(),
                idGeneradoPor: user?.id || ''
            });
            setMostrarForm(false);
            cargarReportes();
        } catch (err) {
            mostrarMensaje('Error al generar el reporte', true);
        }
    };

    const handleEliminar = async (id) => {
        try {
            await eliminarReporte(id);
            mostrarMensaje('Reporte eliminado correctamente');
            cargarReportes();
        } catch (err) {
            mostrarMensaje('Error al eliminar el reporte', true);
        }
    };

    const reportesFiltrados = filtroTipo
        ? reportes.filter(r => r.tipo === filtroTipo)
        : reportes;

    const puedeEditar = user?.rol === 'ADMINISTRATIVO' || user?.rol === 'PROFESOR';

    return (
        <div className="reportes-container">
            <header className="reportes-header">
                <button className="btn-volver" onClick={() => navigate('/dashboard')}>← Volver</button>
                <h1>Reportes</h1>
                {puedeEditar && (
                    <button className="btn-nuevo" onClick={() => setMostrarForm(!mostrarForm)}>
                        {mostrarForm ? 'Cancelar' : '+ Nuevo Reporte'}
                    </button>
                )}
                {!puedeEditar && <div></div>}
            </header>

            {mensaje && <div className="alert-success">{mensaje}</div>}
            {error && <div className="alert-error">{error}</div>}

            {mostrarForm && puedeEditar && (
                <div className="form-card">
                    <h2>Generar Nuevo Reporte</h2>
                    <form onSubmit={handleGenerar} className="reportes-form">
                        <div className="form-row">
                            <div className="form-field">
                                <label>Título</label>
                                <input
                                    type="text"
                                    value={form.titulo}
                                    onChange={e => setForm({ ...form, titulo: e.target.value })}
                                    required
                                />
                                {erroresForm.titulo && <span className="error-field">{erroresForm.titulo}</span>}
                            </div>
                            <div className="form-field">
                                <label>Tipo</label>
                                <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                                    {TIPOS_REPORTE.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-field">
                            <label>ID de Referencia (estudiante o curso)</label>
                            <input
                                type="number"
                                value={form.idReferencia}
                                onChange={e => setForm({ ...form, idReferencia: e.target.value })}
                                min="1"
                                required
                            />
                            {erroresForm.idReferencia && <span className="error-field">{erroresForm.idReferencia}</span>}
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
                        <button type="submit" className="btn-guardar">Generar Reporte</button>
                    </form>
                </div>
            )}

            <div className="filtros">
                <label>Filtrar por tipo:</label>
                <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                    <option value="">Todos</option>
                    {TIPOS_REPORTE.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            <div className="tabla-container">
                <table className="reportes-tabla">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Título</th>
                            <th>Tipo</th>
                            <th>ID Referencia</th>
                            <th>Fecha</th>
                            <th>Contenido</th>
                            {puedeEditar && <th>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {reportesFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={puedeEditar ? 7 : 6} style={{textAlign:'center', padding:'20px'}}>
                                    Sin reportes
                                </td>
                            </tr>
                        ) : reportesFiltrados.map(r => (
                            <tr key={r.id}>
                                <td>{r.id}</td>
                                <td>{r.titulo}</td>
                                <td><span className={`badge-tipo badge-${r.tipo?.toLowerCase()}`}>{r.tipo}</span></td>
                                <td>{r.idReferencia}</td>
                                <td>{new Date(r.fechaGeneracion).toLocaleDateString('es-CL')}</td>
                                <td className="contenido-cell">{r.contenido}</td>
                                {puedeEditar && (
                                    <td>
                                        <button className="btn-eliminar" onClick={() => handleEliminar(r.id)}>Eliminar</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}