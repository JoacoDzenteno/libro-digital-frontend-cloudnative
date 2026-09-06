import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    obtenerAsistenciasPorEstudiante, registrarAsistencia,
    obtenerCalificacionesPorEstudiante, registrarCalificacion,
    obtenerHojaVidaPorEstudiante, registrarAnotacion
} from '../services/libroDigitalService';
import { obtenerUsuarios } from '../services/usuarioService';
import { obtenerCursos, obtenerAsignaturas } from '../services/academicoService';
import { obtenerMatriculaPorApoderado } from '../services/matriculaService';
import './LibroDigitalPage.css';

const ESTADOS_ASISTENCIA = ['PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADO'];
const TIPOS_ANOTACION = ['POSITIVA', 'NEGATIVA', 'NEUTRA'];

export default function LibroDigitalPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tab, setTab] = useState('asistencias');
    const [idEstudianteSeleccionado, setIdEstudianteSeleccionado] = useState('');
    const [estudiantes, setEstudiantes] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [asignaturas, setAsignaturas] = useState([]);

    const [asistencias, setAsistencias] = useState([]);
    const [calificaciones, setCalificaciones] = useState([]);
    const [hojaVida, setHojaVida] = useState([]);

    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [mostrarForm, setMostrarForm] = useState(false);

    // Errores de validación
    const [erroresAsistencia, setErroresAsistencia] = useState({});
    const [erroresCalificacion, setErroresCalificacion] = useState({});
    const [erroresAnotacion, setErroresAnotacion] = useState({});

    const hoy = new Date().toISOString().split('T')[0];

    const [formAsistencia, setFormAsistencia] = useState({
        idEstudiante: '', idCurso: '', fecha: hoy, estado: 'PRESENTE', observacion: ''
    });
    const [formCalificacion, setFormCalificacion] = useState({
        idEstudiante: '', idAsignatura: '', idCurso: '', nota: '', periodo: '', fecha: hoy, descripcion: ''
    });
    const [formAnotacion, setFormAnotacion] = useState({
        idEstudiante: '', idProfesor: user?.id || '', tipo: 'POSITIVA', descripcion: '', fecha: hoy
    });

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    useEffect(() => {
        if (idEstudianteSeleccionado) {
            cargarDatosEstudiante(idEstudianteSeleccionado);
        }
    }, [idEstudianteSeleccionado]);

    const cargarDatosIniciales = async () => {
        try {
            const [u, c, a] = await Promise.all([
                obtenerUsuarios(),
                obtenerCursos(),
                obtenerAsignaturas()
            ]);

            if (user?.rol === 'APODERADO') {
                const matriculas = await obtenerMatriculaPorApoderado(user.id);
                const idsHijos = matriculas.map(m => m.idEstudiante);
                setEstudiantes(u.filter(e => idsHijos.includes(e.id)));
            } else {
                setEstudiantes(u.filter(e => e.rol === 'ESTUDIANTE'));
            }

            if (user?.rol === 'ESTUDIANTE') {
                setIdEstudianteSeleccionado(user.id);
                setEstudiantes(u.filter(e => e.id === user.id));
            }

            setCursos(c);
            setAsignaturas(a);
        } catch (err) {
            setError('Error al cargar datos');
        }
    };

    const cargarDatosEstudiante = async (idEstudiante) => {
        try {
            const [a, c, h] = await Promise.all([
                obtenerAsistenciasPorEstudiante(idEstudiante),
                obtenerCalificacionesPorEstudiante(idEstudiante),
                obtenerHojaVidaPorEstudiante(idEstudiante)
            ]);
            setAsistencias(a);
            setCalificaciones(c);
            setHojaVida(h);
        } catch (err) {
            setError('Error al cargar datos del estudiante');
        }
    };

    const mostrarMensaje = (msg, esError = false) => {
        if (esError) setError(msg);
        else setMensaje(msg);
        setTimeout(() => { setMensaje(''); setError(''); }, 3000);
    };

    // ── VALIDACIONES ──────────────────────────────────────────────

    const validarAsistencia = () => {
        const errs = {};
        if (formAsistencia.fecha > hoy) {
            errs.fecha = 'La fecha no puede ser futura';
        }
        if (formAsistencia.observacion && formAsistencia.observacion.trim().length < 3) {
            errs.observacion = 'La observación debe tener al menos 3 caracteres';
        }
        return errs;
    };

    const validarCalificacion = () => {
        const errs = {};
        const nota = parseFloat(formCalificacion.nota);
        if (isNaN(nota) || nota < 1 || nota > 7) {
            errs.nota = 'La nota debe estar entre 1.0 y 7.0';
        }
        if (!formCalificacion.periodo.trim() || formCalificacion.periodo.trim().length < 3) {
            errs.periodo = 'El período debe tener al menos 3 caracteres';
        }
        if (formCalificacion.fecha > hoy) {
            errs.fecha = 'La fecha no puede ser futura';
        }
        if (formCalificacion.descripcion && formCalificacion.descripcion.trim().length < 3) {
            errs.descripcion = 'La descripción debe tener al menos 3 caracteres';
        }
        return errs;
    };

    const validarAnotacion = () => {
        const errs = {};
        if (!formAnotacion.descripcion.trim() || formAnotacion.descripcion.trim().length < 10) {
            errs.descripcion = 'La descripción debe tener al menos 10 caracteres';
        }
        if (formAnotacion.fecha > hoy) {
            errs.fecha = 'La fecha no puede ser futura';
        }
        return errs;
    };

    // ── HANDLERS ──────────────────────────────────────────────────

    const handleRegistrarAsistencia = async (e) => {
        e.preventDefault();
        const errs = validarAsistencia();
        if (Object.keys(errs).length > 0) {
            setErroresAsistencia(errs);
            return;
        }
        setErroresAsistencia({});
        try {
            await registrarAsistencia({
                ...formAsistencia,
                idEstudiante: parseInt(formAsistencia.idEstudiante),
                idCurso: parseInt(formAsistencia.idCurso)
            });
            mostrarMensaje('Asistencia registrada correctamente');
            setMostrarForm(false);
            cargarDatosEstudiante(idEstudianteSeleccionado);
        } catch (err) {
            mostrarMensaje('Error al registrar asistencia', true);
        }
    };

    const handleRegistrarCalificacion = async (e) => {
        e.preventDefault();
        const errs = validarCalificacion();
        if (Object.keys(errs).length > 0) {
            setErroresCalificacion(errs);
            return;
        }
        setErroresCalificacion({});
        try {
            await registrarCalificacion({
                ...formCalificacion,
                idEstudiante: parseInt(formCalificacion.idEstudiante),
                idAsignatura: parseInt(formCalificacion.idAsignatura),
                idCurso: parseInt(formCalificacion.idCurso),
                nota: parseFloat(formCalificacion.nota)
            });
            mostrarMensaje('Calificación registrada correctamente');
            setMostrarForm(false);
            cargarDatosEstudiante(idEstudianteSeleccionado);
        } catch (err) {
            mostrarMensaje('Error al registrar calificación', true);
        }
    };

    const handleRegistrarAnotacion = async (e) => {
        e.preventDefault();
        const errs = validarAnotacion();
        if (Object.keys(errs).length > 0) {
            setErroresAnotacion(errs);
            return;
        }
        setErroresAnotacion({});
        try {
            await registrarAnotacion({
                ...formAnotacion,
                idEstudiante: parseInt(formAnotacion.idEstudiante),
                idProfesor: parseInt(formAnotacion.idProfesor || user?.id)
            });
            mostrarMensaje('Anotación registrada correctamente');
            setMostrarForm(false);
            cargarDatosEstudiante(idEstudianteSeleccionado);
        } catch (err) {
            mostrarMensaje('Error al registrar anotación', true);
        }
    };

    const getNombreCurso = (id) => cursos.find(c => c.id === id)?.nombre || `ID: ${id}`;
    const getNombreAsignatura = (id) => asignaturas.find(a => a.id === id)?.nombre || `ID: ${id}`;

    const puedeEditar = user?.rol === 'ADMINISTRATIVO' || user?.rol === 'PROFESOR';

    return (
        <div className="libro-container">
            <header className="libro-header">
                <button className="btn-volver" onClick={() => navigate('/dashboard')}>← Volver</button>
                <h1>Libro Digital</h1>
                {puedeEditar && (
                    <button className="btn-nuevo" onClick={() => setMostrarForm(!mostrarForm)}>
                        {mostrarForm ? 'Cancelar' : '+ Nuevo Registro'}
                    </button>
                )}
                {!puedeEditar && <div></div>}
            </header>

            {mensaje && <div className="alert-success">{mensaje}</div>}
            {error && <div className="alert-error">{error}</div>}

            {user?.rol !== 'ESTUDIANTE' && (
                <div className="selector-estudiante">
                    <label>Seleccionar Estudiante:</label>
                    <select value={idEstudianteSeleccionado} onChange={e => setIdEstudianteSeleccionado(e.target.value)}>
                        <option value="">-- Seleccionar --</option>
                        {estudiantes.map(e => (
                            <option key={e.id} value={e.id}>{e.nombre} {e.apellido} — {e.rut}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="tabs">
                <button className={tab === 'asistencias' ? 'tab active' : 'tab'} onClick={() => { setTab('asistencias'); setMostrarForm(false); }}>Asistencias</button>
                <button className={tab === 'calificaciones' ? 'tab active' : 'tab'} onClick={() => { setTab('calificaciones'); setMostrarForm(false); }}>Calificaciones</button>
                <button className={tab === 'hojavida' ? 'tab active' : 'tab'} onClick={() => { setTab('hojavida'); setMostrarForm(false); }}>Hoja de Vida</button>
            </div>

            {/* FORMULARIO ASISTENCIA */}
            {mostrarForm && puedeEditar && tab === 'asistencias' && (
                <div className="form-card">
                    <h2>Registrar Asistencia</h2>
                    <form onSubmit={handleRegistrarAsistencia} className="libro-form">
                        <div className="form-row">
                            <div className="form-field">
                                <label>Estudiante</label>
                                <select value={formAsistencia.idEstudiante} onChange={e => setFormAsistencia({ ...formAsistencia, idEstudiante: e.target.value })} required>
                                    <option value="">Seleccionar</option>
                                    {estudiantes.map(e => <option key={e.id} value={e.id}>{e.nombre} {e.apellido}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Curso</label>
                                <select value={formAsistencia.idCurso} onChange={e => setFormAsistencia({ ...formAsistencia, idCurso: e.target.value })} required>
                                    <option value="">Seleccionar</option>
                                    {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-field">
                                <label>Fecha</label>
                                <input type="date" value={formAsistencia.fecha} max={hoy} onChange={e => setFormAsistencia({ ...formAsistencia, fecha: e.target.value })} required />
                                {erroresAsistencia.fecha && <span className="error-field">{erroresAsistencia.fecha}</span>}
                            </div>
                            <div className="form-field">
                                <label>Estado</label>
                                <select value={formAsistencia.estado} onChange={e => setFormAsistencia({ ...formAsistencia, estado: e.target.value })}>
                                    {ESTADOS_ASISTENCIA.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-field">
                            <label>Observación</label>
                            <input type="text" value={formAsistencia.observacion} onChange={e => setFormAsistencia({ ...formAsistencia, observacion: e.target.value })} />
                            {erroresAsistencia.observacion && <span className="error-field">{erroresAsistencia.observacion}</span>}
                        </div>
                        <button type="submit" className="btn-guardar">Registrar</button>
                    </form>
                </div>
            )}

            {/* FORMULARIO CALIFICACIÓN */}
            {mostrarForm && puedeEditar && tab === 'calificaciones' && (
                <div className="form-card">
                    <h2>Registrar Calificación</h2>
                    <form onSubmit={handleRegistrarCalificacion} className="libro-form">
                        <div className="form-row">
                            <div className="form-field">
                                <label>Estudiante</label>
                                <select value={formCalificacion.idEstudiante} onChange={e => setFormCalificacion({ ...formCalificacion, idEstudiante: e.target.value })} required>
                                    <option value="">Seleccionar</option>
                                    {estudiantes.map(e => <option key={e.id} value={e.id}>{e.nombre} {e.apellido}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Asignatura</label>
                                <select value={formCalificacion.idAsignatura} onChange={e => setFormCalificacion({ ...formCalificacion, idAsignatura: e.target.value })} required>
                                    <option value="">Seleccionar</option>
                                    {asignaturas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-field">
                                <label>Curso</label>
                                <select value={formCalificacion.idCurso} onChange={e => setFormCalificacion({ ...formCalificacion, idCurso: e.target.value })} required>
                                    <option value="">Seleccionar</option>
                                    {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Nota</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    max="7"
                                    value={formCalificacion.nota}
                                    onChange={e => setFormCalificacion({ ...formCalificacion, nota: e.target.value })}
                                    required
                                />
                                {erroresCalificacion.nota && <span className="error-field">{erroresCalificacion.nota}</span>}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-field">
                                <label>Período</label>
                                <input
                                    type="text"
                                    value={formCalificacion.periodo}
                                    onChange={e => setFormCalificacion({ ...formCalificacion, periodo: e.target.value })}
                                    placeholder="Ej: Semestre 1"
                                    required
                                />
                                {erroresCalificacion.periodo && <span className="error-field">{erroresCalificacion.periodo}</span>}
                            </div>
                            <div className="form-field">
                                <label>Fecha</label>
                                <input
                                    type="date"
                                    value={formCalificacion.fecha}
                                    max={hoy}
                                    onChange={e => setFormCalificacion({ ...formCalificacion, fecha: e.target.value })}
                                    required
                                />
                                {erroresCalificacion.fecha && <span className="error-field">{erroresCalificacion.fecha}</span>}
                            </div>
                        </div>
                        <div className="form-field">
                            <label>Descripción</label>
                            <input
                                type="text"
                                value={formCalificacion.descripcion}
                                onChange={e => setFormCalificacion({ ...formCalificacion, descripcion: e.target.value })}
                            />
                            {erroresCalificacion.descripcion && <span className="error-field">{erroresCalificacion.descripcion}</span>}
                        </div>
                        <button type="submit" className="btn-guardar">Registrar</button>
                    </form>
                </div>
            )}

            {/* FORMULARIO ANOTACIÓN */}
            {mostrarForm && puedeEditar && tab === 'hojavida' && (
                <div className="form-card">
                    <h2>Registrar Anotación</h2>
                    <form onSubmit={handleRegistrarAnotacion} className="libro-form">
                        <div className="form-row">
                            <div className="form-field">
                                <label>Estudiante</label>
                                <select value={formAnotacion.idEstudiante} onChange={e => setFormAnotacion({ ...formAnotacion, idEstudiante: e.target.value })} required>
                                    <option value="">Seleccionar</option>
                                    {estudiantes.map(e => <option key={e.id} value={e.id}>{e.nombre} {e.apellido}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Tipo</label>
                                <select value={formAnotacion.tipo} onChange={e => setFormAnotacion({ ...formAnotacion, tipo: e.target.value })}>
                                    {TIPOS_ANOTACION.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-field">
                                <label>Fecha</label>
                                <input
                                    type="date"
                                    value={formAnotacion.fecha}
                                    max={hoy}
                                    onChange={e => setFormAnotacion({ ...formAnotacion, fecha: e.target.value })}
                                    required
                                />
                                {erroresAnotacion.fecha && <span className="error-field">{erroresAnotacion.fecha}</span>}
                            </div>
                        </div>
                        <div className="form-field">
                            <label>Descripción</label>
                            <input
                                type="text"
                                value={formAnotacion.descripcion}
                                onChange={e => setFormAnotacion({ ...formAnotacion, descripcion: e.target.value })}
                                required
                            />
                            {erroresAnotacion.descripcion && <span className="error-field">{erroresAnotacion.descripcion}</span>}
                        </div>
                        <button type="submit" className="btn-guardar">Registrar</button>
                    </form>
                </div>
            )}

            {!idEstudianteSeleccionado && user?.rol !== 'ESTUDIANTE' && (
                <div className="sin-estudiante">
                    <p>Selecciona un estudiante para ver su información</p>
                </div>
            )}

            {(idEstudianteSeleccionado || user?.rol === 'ESTUDIANTE') && tab === 'asistencias' && (
                <div className="tabla-container">
                    <table className="libro-tabla">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Curso</th>
                                <th>Estado</th>
                                <th>Observación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {asistencias.length === 0 ? (
                                <tr><td colSpan="4" style={{textAlign:'center', padding:'20px'}}>Sin registros</td></tr>
                            ) : asistencias.map(a => (
                                <tr key={a.id}>
                                    <td>{a.fecha}</td>
                                    <td>{getNombreCurso(a.idCurso)}</td>
                                    <td><span className={`badge-asistencia badge-${a.estado?.toLowerCase()}`}>{a.estado}</span></td>
                                    <td>{a.observacion || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {(idEstudianteSeleccionado || user?.rol === 'ESTUDIANTE') && tab === 'calificaciones' && (
                <div className="tabla-container">
                    <table className="libro-tabla">
                        <thead>
                            <tr>
                                <th>Asignatura</th>
                                <th>Nota</th>
                                <th>Período</th>
                                <th>Fecha</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {calificaciones.length === 0 ? (
                                <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>Sin registros</td></tr>
                            ) : calificaciones.map(c => (
                                <tr key={c.id}>
                                    <td>{getNombreAsignatura(c.idAsignatura)}</td>
                                    <td><span className={`badge-nota ${c.nota >= 4 ? 'nota-aprobado' : 'nota-reprobado'}`}>{c.nota}</span></td>
                                    <td>{c.periodo}</td>
                                    <td>{c.fecha}</td>
                                    <td>{c.descripcion || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {(idEstudianteSeleccionado || user?.rol === 'ESTUDIANTE') && tab === 'hojavida' && (
                <div className="tabla-container">
                    <table className="libro-tabla">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hojaVida.length === 0 ? (
                                <tr><td colSpan="3" style={{textAlign:'center', padding:'20px'}}>Sin registros</td></tr>
                            ) : hojaVida.map(h => (
                                <tr key={h.id}>
                                    <td>{h.fecha}</td>
                                    <td><span className={`badge-anotacion badge-${h.tipo?.toLowerCase()}`}>{h.tipo}</span></td>
                                    <td>{h.descripcion}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}