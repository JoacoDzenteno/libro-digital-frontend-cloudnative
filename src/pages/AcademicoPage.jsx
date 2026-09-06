import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    obtenerCursos, crearCurso, eliminarCurso, buscarCursos,
    obtenerAsignaturas, crearAsignatura, eliminarAsignatura, buscarAsignaturas,
    obtenerCargas, crearCarga, eliminarCarga, actualizarCarga
} from '../services/academicoService';
import { obtenerUsuarios } from '../services/usuarioService';
import './AcademicoPage.css';

const nivelesDisponibles = [
    '1° Básico', '2° Básico', '3° Básico', '4° Básico',
    '5° Básico', '6° Básico', '7° Básico', '8° Básico',
    'I° Medio', 'II° Medio', 'III° Medio', 'IV° Medio'
];

export default function AcademicoPage() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('cursos');

    const [cursos, setCursos] = useState([]);
    const [asignaturas, setAsignaturas] = useState([]);
    const [cargas, setCargas] = useState([]);
    const [profesores, setProfesores] = useState([]);

    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [mostrarForm, setMostrarForm] = useState(false);

    const [formCurso, setFormCurso] = useState({ nivel: '', letra: '', anioEscolar: 2026, capacidadMaxima: 30 });
    const [formAsignatura, setFormAsignatura] = useState({ nombre: '', codigo: '', descripcion: '' });
    const [formCarga, setFormCarga] = useState({ curso: { id: '' }, asignatura: { id: '' }, idProfesor: '', horasSemanales: '' });

    // Errores de validación por formulario
    const [erroresCurso, setErroresCurso] = useState({});
    const [erroresAsignatura, setErroresAsignatura] = useState({});
    const [erroresCarga, setErroresCarga] = useState({});
    const [erroresBuscador, setErroresBuscador] = useState({});

    // Buscador de Cursos
    const [filtroCursoNivel, setFiltroCursoNivel] = useState('');
    const [filtroCursoAnio, setFiltroCursoAnio] = useState('');
    const [haBuscadoCursos, setHaBuscadoCursos] = useState(false);
    const [cargandoCursos, setCargandoCursos] = useState(false);

    // Buscador de Asignaturas
    const [filtroAsigNombre, setFiltroAsigNombre] = useState('');
    const [filtroAsigCodigo, setFiltroAsigCodigo] = useState('');

    const [profesorExpandido, setProfesorExpandido] = useState(null);
    const [cargaEditando, setCargaEditando] = useState(null);
    const [formEdicionCarga, setFormEdicionCarga] = useState({ cursoId: '', asignaturaId: '', horasSemanales: '' });

    useEffect(() => {
        cargarDatosBase();
    }, []);

    const cargarDatosBase = async () => {
        try {
            const [c, a, ca, u] = await Promise.all([
                obtenerCursos(),
                obtenerAsignaturas(),
                obtenerCargas(),
                obtenerUsuarios()
            ]);
            setCursos(c);
            setAsignaturas(a);
            setCargas(ca);
            setProfesores(u.filter(u => u.rol === 'PROFESOR'));
        } catch (err) {
            setError('Error al cargar datos académicos');
        }
    };

    const mostrarMensaje = (msg, esError = false) => {
        if (esError) setError(msg);
        else setMensaje(msg);
        setTimeout(() => { setMensaje(''); setError(''); }, 3000);
    };

    // ── VALIDACIONES ──────────────────────────────────────────────

    const validarCurso = () => {
        const errs = {};
        if (!/^[A-Za-z]$/.test(formCurso.letra)) {
            errs.letra = 'La letra debe ser un solo carácter A-Z';
        }
        const anio = parseInt(formCurso.anioEscolar);
        if (!anio || anio < 2000 || anio > 2100) {
            errs.anioEscolar = 'El año debe estar entre 2000 y 2100';
        }
        return errs;
    };

    const validarAsignatura = () => {
        const errs = {};
        if (!formAsignatura.nombre.trim() || formAsignatura.nombre.trim().length < 3) {
            errs.nombre = 'El nombre debe tener al menos 3 caracteres';
        }
        if (!/^[a-zA-Z0-9]+$/.test(formAsignatura.codigo)) {
            errs.codigo = 'El código solo puede contener letras y números, sin espacios';
        }
        if (formAsignatura.descripcion && formAsignatura.descripcion.trim().length < 10) {
            errs.descripcion = 'La descripción debe tener al menos 10 caracteres';
        }
        return errs;
    };

    const validarCarga = () => {
        const errs = {};
        const horas = parseInt(formCarga.horasSemanales);
        if (!horas || horas < 1) {
            errs.horasSemanales = 'Las horas semanales deben ser al menos 1';
        }
        return errs;
    };

    const validarBuscadorCursos = () => {
        const errs = {};
        if (filtroCursoAnio) {
            const anio = parseInt(filtroCursoAnio);
            if (!anio || anio < 2000 || anio > 2100) {
                errs.anio = 'El año debe estar entre 2000 y 2100';
            }
        }
        return errs;
    };

    // ── HANDLERS ──────────────────────────────────────────────────

    const handleBuscarCursos = async (e) => {
        e.preventDefault();
        const errs = validarBuscadorCursos();
        if (Object.keys(errs).length > 0) {
            setErroresBuscador(errs);
            return;
        }
        setErroresBuscador({});
        setCargandoCursos(true);
        try {
            const data = await buscarCursos(filtroCursoNivel, filtroCursoAnio);
            setCursos(data);
            setHaBuscadoCursos(true);
        } catch (err) {
            mostrarMensaje('Error al buscar cursos', true);
        } finally {
            setCargandoCursos(false);
        }
    };

    const handleVerTodosCursos = async () => {
        setCargandoCursos(true);
        setErroresBuscador({});
        try {
            const data = await obtenerCursos();
            setCursos(data);
            setHaBuscadoCursos(true);
            setFiltroCursoNivel('');
            setFiltroCursoAnio('');
        } catch (err) {
            mostrarMensaje('Error al cargar cursos', true);
        } finally {
            setCargandoCursos(false);
        }
    };

    const refrescarCursos = async () => {
        if (filtroCursoNivel || filtroCursoAnio) {
            const data = await buscarCursos(filtroCursoNivel, filtroCursoAnio);
            setCursos(data);
        } else if (haBuscadoCursos) {
            const data = await obtenerCursos();
            setCursos(data);
        }
    };

    const asignaturasFiltradas = asignaturas.filter(a => {
        const coincideNombre = !filtroAsigNombre || a.nombre.toLowerCase().includes(filtroAsigNombre.toLowerCase());
        const coincideCodigo = !filtroAsigCodigo || a.codigo.toLowerCase().includes(filtroAsigCodigo.toLowerCase());
        return coincideNombre && coincideCodigo;
    });

    const cargasPorProfesor = profesores.map(prof => {
        const cargasDelProfesor = cargas.filter(c => c.idProfesor === prof.id);
        const totalHoras = cargasDelProfesor.reduce((sum, c) => sum + (c.horasSemanales || 0), 0);
        return { profesor: prof, cargas: cargasDelProfesor, totalHoras };
    });

    const handleCrearCurso = async (e) => {
        e.preventDefault();
        const errs = validarCurso();
        if (Object.keys(errs).length > 0) {
            setErroresCurso(errs);
            return;
        }
        setErroresCurso({});
        try {
            const nombreGenerado = `${formCurso.nivel} ${formCurso.letra}`;
            await crearCurso({ ...formCurso, nombre: nombreGenerado });
            mostrarMensaje('Curso creado correctamente');
            setFormCurso({ nivel: '', letra: '', anioEscolar: 2026, capacidadMaxima: 30 });
            setMostrarForm(false);
            refrescarCursos();
        } catch (err) {
            mostrarMensaje('Error al crear el curso', true);
        }
    };

    const handleCrearAsignatura = async (e) => {
        e.preventDefault();
        const errs = validarAsignatura();
        if (Object.keys(errs).length > 0) {
            setErroresAsignatura(errs);
            return;
        }
        setErroresAsignatura({});
        try {
            await crearAsignatura(formAsignatura);
            mostrarMensaje('Asignatura creada correctamente');
            setFormAsignatura({ nombre: '', codigo: '', descripcion: '' });
            setMostrarForm(false);
            cargarDatosBase();
        } catch (err) {
            mostrarMensaje('Error al crear la asignatura', true);
        }
    };

    const handleCrearCarga = async (e) => {
        e.preventDefault();
        const errs = validarCarga();
        if (Object.keys(errs).length > 0) {
            setErroresCarga(errs);
            return;
        }
        setErroresCarga({});
        try {
            await crearCarga(formCarga);
            mostrarMensaje('Carga horaria creada correctamente');
            setFormCarga({ curso: { id: '' }, asignatura: { id: '' }, idProfesor: '', horasSemanales: '' });
            setMostrarForm(false);
            cargarDatosBase();
        } catch (err) {
            mostrarMensaje('Error al crear la carga horaria', true);
        }
    };

    const handleEliminar = async (tipo, id) => {
        try {
            if (tipo === 'curso') {
                await eliminarCurso(id);
                refrescarCursos();
            } else if (tipo === 'asignatura') {
                await eliminarAsignatura(id);
                cargarDatosBase();
            } else if (tipo === 'carga') {
                await eliminarCarga(id);
                cargarDatosBase();
            }
            mostrarMensaje(`${tipo} eliminado correctamente`);
        } catch (err) {
            mostrarMensaje(`Error al eliminar ${tipo}`, true);
        }
    };

    const abrirEdicionCarga = (carga) => {
        setCargaEditando(carga);
        setFormEdicionCarga({
            cursoId: carga.curso.id,
            asignaturaId: carga.asignatura.id,
            horasSemanales: carga.horasSemanales
        });
    };

    const cerrarEdicionCarga = () => {
        setCargaEditando(null);
    };

    const handleGuardarEdicionCarga = async (e) => {
        e.preventDefault();
        const confirmado = window.confirm('¿Estás seguro de que quieres guardar estos cambios?');
        if (!confirmado) return;
        try {
            await actualizarCarga(cargaEditando.id, {
                curso: { id: parseInt(formEdicionCarga.cursoId) },
                asignatura: { id: parseInt(formEdicionCarga.asignaturaId) },
                horasSemanales: parseInt(formEdicionCarga.horasSemanales)
            });
            mostrarMensaje('Carga horaria actualizada correctamente');
            cerrarEdicionCarga();
            cargarDatosBase();
        } catch (err) {
            mostrarMensaje('Error al actualizar la carga horaria', true);
        }
    };

    return (
        <div className="academico-container">
            <header className="academico-header">
                <button className="btn-volver" onClick={() => navigate('/dashboard')}>← Volver</button>
                <h1>Gestión Académica</h1>
                <button className="btn-nuevo" onClick={() => setMostrarForm(!mostrarForm)}>
                    {mostrarForm ? 'Cancelar' : '+ Nuevo'}
                </button>
            </header>

            {mensaje && <div className="alert-success">{mensaje}</div>}
            {error && <div className="alert-error">{error}</div>}

            <div className="tabs">
                <button className={tab === 'cursos' ? 'tab active' : 'tab'} onClick={() => { setTab('cursos'); setMostrarForm(false); }}>Cursos</button>
                <button className={tab === 'asignaturas' ? 'tab active' : 'tab'} onClick={() => { setTab('asignaturas'); setMostrarForm(false); }}>Asignaturas</button>
                <button className={tab === 'cargas' ? 'tab active' : 'tab'} onClick={() => { setTab('cargas'); setMostrarForm(false); }}>Carga Horaria</button>
            </div>

            {/* FORMULARIO CURSOS */}
            {mostrarForm && tab === 'cursos' && (
                <div className="form-card">
                    <h2>Nuevo Curso</h2>
                    <form onSubmit={handleCrearCurso} className="academico-form">
                        <div className="form-row">
                            <div className="form-field">
                                <label>Nivel</label>
                                <select value={formCurso.nivel} onChange={e => setFormCurso({ ...formCurso, nivel: e.target.value })} required>
                                    <option value="">Seleccionar nivel</option>
                                    {nivelesDisponibles.map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Letra</label>
                                <input
                                    type="text"
                                    value={formCurso.letra}
                                    onChange={e => setFormCurso({ ...formCurso, letra: e.target.value.toUpperCase() })}
                                    placeholder="A"
                                    maxLength="1"
                                    required
                                />
                                {erroresCurso.letra && <span className="error-field">{erroresCurso.letra}</span>}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-field">
                                <label>Año Escolar</label>
                                <input
                                    type="number"
                                    value={formCurso.anioEscolar}
                                    onChange={e => setFormCurso({ ...formCurso, anioEscolar: parseInt(e.target.value) })}
                                    min="2000"
                                    max="2100"
                                    required
                                />
                                {erroresCurso.anioEscolar && <span className="error-field">{erroresCurso.anioEscolar}</span>}
                            </div>
                            <div className="form-field">
                                <label>Capacidad Máxima</label>
                                <input
                                    type="number"
                                    value={formCurso.capacidadMaxima}
                                    onChange={e => setFormCurso({ ...formCurso, capacidadMaxima: parseInt(e.target.value) })}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-guardar">Crear Curso</button>
                    </form>
                </div>
            )}

            {/* FORMULARIO ASIGNATURAS */}
            {mostrarForm && tab === 'asignaturas' && (
                <div className="form-card">
                    <h2>Nueva Asignatura</h2>
                    <form onSubmit={handleCrearAsignatura} className="academico-form">
                        <div className="form-row">
                            <div className="form-field">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    value={formAsignatura.nombre}
                                    onChange={e => setFormAsignatura({ ...formAsignatura, nombre: e.target.value })}
                                    required
                                />
                                {erroresAsignatura.nombre && <span className="error-field">{erroresAsignatura.nombre}</span>}
                            </div>
                            <div className="form-field">
                                <label>Código</label>
                                <input
                                    type="text"
                                    value={formAsignatura.codigo}
                                    onChange={e => setFormAsignatura({ ...formAsignatura, codigo: e.target.value })}
                                    required
                                />
                                {erroresAsignatura.codigo && <span className="error-field">{erroresAsignatura.codigo}</span>}
                            </div>
                        </div>
                        <div className="form-field">
                            <label>Descripción</label>
                            <input
                                type="text"
                                value={formAsignatura.descripcion}
                                onChange={e => setFormAsignatura({ ...formAsignatura, descripcion: e.target.value })}
                            />
                            {erroresAsignatura.descripcion && <span className="error-field">{erroresAsignatura.descripcion}</span>}
                        </div>
                        <button type="submit" className="btn-guardar">Crear Asignatura</button>
                    </form>
                </div>
            )}

            {/* FORMULARIO CARGA HORARIA */}
            {mostrarForm && tab === 'cargas' && (
                <div className="form-card">
                    <h2>Nueva Carga Horaria</h2>
                    <form onSubmit={handleCrearCarga} className="academico-form">
                        <div className="form-row">
                            <div className="form-field">
                                <label>Curso</label>
                                <select value={formCarga.curso.id} onChange={e => setFormCarga({ ...formCarga, curso: { id: parseInt(e.target.value) } })} required>
                                    <option value="">Seleccionar curso</option>
                                    {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Asignatura</label>
                                <select value={formCarga.asignatura.id} onChange={e => setFormCarga({ ...formCarga, asignatura: { id: parseInt(e.target.value) } })} required>
                                    <option value="">Seleccionar asignatura</option>
                                    {asignaturas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-field">
                                <label>Profesor</label>
                                <select value={formCarga.idProfesor} onChange={e => setFormCarga({ ...formCarga, idProfesor: parseInt(e.target.value) })} required>
                                    <option value="">Seleccionar profesor</option>
                                    {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Horas Semanales</label>
                                <input
                                    type="number"
                                    value={formCarga.horasSemanales}
                                    onChange={e => setFormCarga({ ...formCarga, horasSemanales: parseInt(e.target.value) })}
                                    min="1"
                                    required
                                />
                                {erroresCarga.horasSemanales && <span className="error-field">{erroresCarga.horasSemanales}</span>}
                            </div>
                        </div>
                        <button type="submit" className="btn-guardar">Crear Carga Horaria</button>
                    </form>
                </div>
            )}

            {/* BUSCADOR DE CURSOS */}
            {tab === 'cursos' && (
                <div className="buscador-card">
                    <form onSubmit={handleBuscarCursos} className="buscador-form">
                        <div className="form-field">
                            <label>Nivel</label>
                            <select value={filtroCursoNivel} onChange={e => setFiltroCursoNivel(e.target.value)}>
                                <option value="">Todos los niveles</option>
                                {nivelesDisponibles.map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Año Escolar</label>
                            <input
                                type="number"
                                placeholder="Ej: 2026"
                                value={filtroCursoAnio}
                                onChange={e => setFiltroCursoAnio(e.target.value)}
                                min="2000"
                                max="2100"
                            />
                            {erroresBuscador.anio && <span className="error-field">{erroresBuscador.anio}</span>}
                        </div>
                        <div className="botones-buscador">
                            <button type="submit" className="btn-buscar">Buscar</button>
                            <button type="button" className="btn-ver-todos" onClick={handleVerTodosCursos}>Ver todos</button>
                        </div>
                    </form>
                </div>
            )}

            {/* BUSCADOR DE ASIGNATURAS */}
            {tab === 'asignaturas' && (
                <div className="buscador-card">
                    <div className="buscador-form">
                        <div className="form-field">
                            <label>Nombre</label>
                            <input type="text" placeholder="Buscar por nombre..." value={filtroAsigNombre} onChange={e => setFiltroAsigNombre(e.target.value)} />
                        </div>
                        <div className="form-field">
                            <label>Código</label>
                            <input type="text" placeholder="Buscar por código..." value={filtroAsigCodigo} onChange={e => setFiltroAsigCodigo(e.target.value)} />
                        </div>
                    </div>
                </div>
            )}

            {/* TABLA CURSOS */}
            {tab === 'cursos' && (
                <div className="tabla-container">
                    {cargandoCursos ? (
                        <div className="estado-vacio">Cargando...</div>
                    ) : !haBuscadoCursos ? (
                        <div className="estado-vacio">Usa el buscador o presiona "Ver todos" para mostrar cursos</div>
                    ) : cursos.length === 0 ? (
                        <div className="estado-vacio">No se encontraron cursos</div>
                    ) : (
                        <table className="academico-tabla">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Nivel</th>
                                    <th>Letra</th>
                                    <th>Año</th>
                                    <th>Capacidad</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cursos.map(c => {
                                    const porcentaje = c.capacidadMaxima ? (c.cantidadAlumnos / c.capacidadMaxima) : 0;
                                    const lleno = c.cantidadAlumnos >= c.capacidadMaxima;
                                    const cercaDelLimite = !lleno && porcentaje >= 0.9;
                                    return (
                                        <tr key={c.id}>
                                            <td>{c.id}</td>
                                            <td>{c.nombre}</td>
                                            <td>{c.nivel}</td>
                                            <td>{c.letra}</td>
                                            <td>{c.anioEscolar}</td>
                                            <td>
                                                <span className={`capacidad-badge ${lleno ? 'capacidad-llena' : cercaDelLimite ? 'capacidad-alerta' : 'capacidad-ok'}`}>
                                                    {c.cantidadAlumnos} / {c.capacidadMaxima}
                                                    {lleno && ' ⚠ Lleno'}
                                                    {cercaDelLimite && ' ⚠ Casi lleno'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn-eliminar" onClick={() => handleEliminar('curso', c.id)}>Eliminar</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* TABLA ASIGNATURAS */}
            {tab === 'asignaturas' && (
                <div className="tabla-container">
                    {asignaturasFiltradas.length === 0 ? (
                        <div className="estado-vacio">No se encontraron asignaturas</div>
                    ) : (
                        <table className="academico-tabla">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Código</th>
                                    <th>Descripción</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {asignaturasFiltradas.map(a => (
                                    <tr key={a.id}>
                                        <td>{a.id}</td>
                                        <td>{a.nombre}</td>
                                        <td>{a.codigo}</td>
                                        <td>{a.descripcion}</td>
                                        <td>
                                            <button className="btn-eliminar" onClick={() => handleEliminar('asignatura', a.id)}>Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* TABLA CARGAS */}
            {tab === 'cargas' && (
                <div className="profesores-lista">
                    {cargasPorProfesor.length === 0 ? (
                        <div className="estado-vacio">No hay profesores registrados</div>
                    ) : (
                        cargasPorProfesor.map(({ profesor, cargas: cargasDelProfesor, totalHoras }) => (
                            <div key={profesor.id} className="profesor-card">
                                <div
                                    className="profesor-header"
                                    onClick={() => setProfesorExpandido(profesorExpandido === profesor.id ? null : profesor.id)}
                                >
                                    <span className="profesor-nombre">{profesor.nombre} {profesor.apellido}</span>
                                    <span className="profesor-total">{totalHoras}h semanales</span>
                                    <span className="profesor-toggle">{profesorExpandido === profesor.id ? '▲' : '▼'}</span>
                                </div>
                                {profesorExpandido === profesor.id && (
                                    <div className="profesor-cargas">
                                        {cargasDelProfesor.length === 0 ? (
                                            <div className="estado-vacio-mini">Este profesor no tiene cargas asignadas</div>
                                        ) : (
                                            <table className="academico-tabla">
                                                <thead>
                                                    <tr>
                                                        <th>Asignatura</th>
                                                        <th>Curso</th>
                                                        <th>Horas</th>
                                                        <th>Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {cargasDelProfesor.map(ca => (
                                                        <tr key={ca.id}>
                                                            <td>{ca.asignatura?.nombre}</td>
                                                            <td>{ca.curso?.nombre}</td>
                                                            <td>{ca.horasSemanales}</td>
                                                            <td>
                                                                <button className="btn-editar" onClick={() => abrirEdicionCarga(ca)}>Editar</button>
                                                                <button className="btn-eliminar" onClick={() => handleEliminar('carga', ca.id)}>Eliminar</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* MODAL EDITAR CARGA */}
            {cargaEditando && (
                <div className="modal-overlay" onClick={cerrarEdicionCarga}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Editar Carga Horaria</h2>
                        <form onSubmit={handleGuardarEdicionCarga}>
                            <div className="form-field">
                                <label>Curso</label>
                                <select value={formEdicionCarga.cursoId} onChange={(e) => setFormEdicionCarga({ ...formEdicionCarga, cursoId: e.target.value })} required>
                                    {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Asignatura</label>
                                <select value={formEdicionCarga.asignaturaId} onChange={(e) => setFormEdicionCarga({ ...formEdicionCarga, asignaturaId: e.target.value })} required>
                                    {asignaturas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Horas Semanales</label>
                                <input type="number" value={formEdicionCarga.horasSemanales} onChange={(e) => setFormEdicionCarga({ ...formEdicionCarga, horasSemanales: e.target.value })} required />
                            </div>
                            <div className="modal-botones">
                                <button type="button" className="btn-cancelar" onClick={cerrarEdicionCarga}>Cancelar</button>
                                <button type="submit" className="btn-guardar">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}