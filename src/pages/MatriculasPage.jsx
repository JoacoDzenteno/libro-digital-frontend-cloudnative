import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerMatriculas, crearMatricula, cambiarEstadoMatricula, eliminarMatricula } from '../services/matriculaService';
import { obtenerUsuarios } from '../services/usuarioService';
import { obtenerCursos } from '../services/academicoService';
import './MatriculasPage.css';

const ESTADOS = ['ACTIVA', 'RETIRADA', 'TRASLADADA'];

const initialForm = {
    idEstudiante: '',
    idApoderado: '',
    idCurso: ''
};

export default function MatriculasPage() {
    const navigate = useNavigate();
    const [matriculas, setMatriculas] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [apoderados, setApoderados] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [mostrarForm, setMostrarForm] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [m, u, c] = await Promise.all([
                obtenerMatriculas(),
                obtenerUsuarios(),
                obtenerCursos()
            ]);
            setMatriculas(m);
            setEstudiantes(u.filter(u => u.rol === 'ESTUDIANTE'));
            setApoderados(u.filter(u => u.rol === 'APODERADO'));
            setCursos(c);
        } catch (err) {
            setError('Error al cargar datos de matrículas');
        }
    };

    const mostrarMensaje = (msg, esError = false) => {
        if (esError) setError(msg);
        else setMensaje(msg);
        setTimeout(() => { setMensaje(''); setError(''); }, 3000);
    };

    const handleCrear = async (e) => {
        e.preventDefault();
        const cursoSeleccionado = cursos.find(c => c.id === parseInt(form.idCurso));
        try {
            await crearMatricula({
                idEstudiante: parseInt(form.idEstudiante),
                idApoderado: parseInt(form.idApoderado),
                idCurso: parseInt(form.idCurso),
                anioEscolar: cursoSeleccionado.anioEscolar
            });
            mostrarMensaje('Matrícula creada correctamente');
            setForm(initialForm);
            setMostrarForm(false);
            cargarDatos();
        } catch (err) {
            if (err.response?.status === 409) {
                mostrarMensaje('El estudiante ya tiene una matrícula activa o el estudiante/apoderado no existe', true);
            } else {
                mostrarMensaje('Error al crear la matrícula', true);
            }
        }
    };

    const handleCambiarEstado = async (id, estado) => {
        try {
            await cambiarEstadoMatricula(id, estado);
            mostrarMensaje('Estado actualizado correctamente');
            cargarDatos();
        } catch (err) {
            mostrarMensaje('Error al cambiar el estado', true);
        }
    };

    const handleEliminar = async (id) => {
        try {
            await eliminarMatricula(id);
            mostrarMensaje('Matrícula eliminada correctamente');
            cargarDatos();
        } catch (err) {
            mostrarMensaje('Error al eliminar la matrícula', true);
        }
    };

    const getNombreEstudiante = (id) => {
        const e = estudiantes.find(e => e.id === id);
        return e ? `${e.nombre} ${e.apellido}` : `ID: ${id}`;
    };

    const getNombreApoderado = (id) => {
        const a = apoderados.find(a => a.id === id);
        return a ? `${a.nombre} ${a.apellido}` : `ID: ${id}`;
    };

    const getNombreCurso = (id) => {
        const c = cursos.find(c => c.id === id);
        return c ? `${c.nombre} — ${c.anioEscolar}` : `ID: ${id}`;
    };

    return (
        <div className="matriculas-container">
            <header className="matriculas-header">
                <button className="btn-volver" onClick={() => navigate('/dashboard')}>← Volver</button>
                <h1>Gestión de Matrículas</h1>
                <button className="btn-nuevo" onClick={() => setMostrarForm(!mostrarForm)}>
                    {mostrarForm ? 'Cancelar' : '+ Nueva Matrícula'}
                </button>
            </header>

            {mensaje && <div className="alert-success">{mensaje}</div>}
            {error && <div className="alert-error">{error}</div>}

            {mostrarForm && (
                <div className="form-card">
                    <h2>Nueva Matrícula</h2>
                    <form onSubmit={handleCrear} className="matricula-form">
                        <div className="form-row">
                            <div className="form-field">
                                <label>Estudiante</label>
                                <select value={form.idEstudiante} onChange={e => setForm({ ...form, idEstudiante: e.target.value })} required>
                                    <option value="">Seleccionar estudiante</option>
                                    {estudiantes.map(e => (
                                        <option key={e.id} value={e.id}>{e.nombre} {e.apellido} — {e.rut}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Apoderado</label>
                                <select value={form.idApoderado} onChange={e => setForm({ ...form, idApoderado: e.target.value })} required>
                                    <option value="">Seleccionar apoderado</option>
                                    {apoderados.map(a => (
                                        <option key={a.id} value={a.id}>{a.nombre} {a.apellido} — {a.rut}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-field">
                                <label>Curso</label>
                                <select value={form.idCurso} onChange={e => setForm({ ...form, idCurso: e.target.value })} required>
                                    <option value="">Seleccionar curso</option>
                                    {cursos.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre} — {c.anioEscolar}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn-guardar">Crear Matrícula</button>
                    </form>
                </div>
            )}

            <div className="tabla-container">
                <table className="matriculas-tabla">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Estudiante</th>
                            <th>Apoderado</th>
                            <th>Curso</th>
                            <th>Año</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matriculas.map(m => (
                            <tr key={m.id}>
                                <td>{m.id}</td>
                                <td>{getNombreEstudiante(m.idEstudiante)}</td>
                                <td>{getNombreApoderado(m.idApoderado)}</td>
                                <td>{getNombreCurso(m.idCurso)}</td>
                                <td>{m.anioEscolar}</td>
                                <td>{m.fechaMatricula}</td>
                                <td>
                                    <span className={`badge-estado badge-${m.estado?.toLowerCase()}`}>
                                        {m.estado}
                                    </span>
                                </td>
                                <td className="acciones-cell">
                                    <select
                                        className="select-estado"
                                        value={m.estado}
                                        onChange={e => handleCambiarEstado(m.id, e.target.value)}
                                    >
                                        {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                                    </select>
                                    <button className="btn-eliminar" onClick={() => handleEliminar(m.id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}