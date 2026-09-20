import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerUsuarios, buscarUsuarios, actualizarUsuario } from '../services/usuarioService';
import './UsuariosPage.css';

const rolesDisponibles = ['ADMINISTRATIVO', 'PROFESOR', 'ESTUDIANTE', 'APODERADO'];

const initialFiltros = { nombre: '', rut: '', email: '' };

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [filtros, setFiltros] = useState(initialFiltros);
    const [haBuscado, setHaBuscado] = useState(false);
    const [cargando, setCargando] = useState(false);

    const [sugerencias, setSugerencias] = useState({ nombre: [], rut: [], email: [] });
    const [campoActivo, setCampoActivo] = useState(null);
    const debounceRef = useRef(null);

    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [erroresEdicion, setErroresEdicion] = useState({});
    const navigate = useNavigate();

    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [formEdicion, setFormEdicion] = useState({ rol: '', nombre: '', apellido: '', telefono: '', direccion: '' });

    const handleFiltroChange = (campo, valor) => {
        setFiltros({ ...filtros, [campo]: valor });
        setCampoActivo(campo);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (valor.trim().length < 2) {
            setSugerencias((prev) => ({ ...prev, [campo]: [] }));
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                const filtrosActuales = { ...filtros, [campo]: valor };
                const data = await buscarUsuarios(
                    filtrosActuales.nombre,
                    filtrosActuales.rut,
                    filtrosActuales.email,
                    10
                );
                setSugerencias((prev) => ({ ...prev, [campo]: data }));
            } catch (err) {
                console.error('Error obteniendo sugerencias', err);
            }
        }, 300);
    };

    const seleccionarSugerencia = (campo, usuario) => {
        const valor = campo === 'nombre'
            ? `${usuario.nombre} ${usuario.apellido}`
            : campo === 'rut'
                ? usuario.rut
                : usuario.email;

        setFiltros({ ...filtros, [campo]: valor });
        setSugerencias((prev) => ({ ...prev, [campo]: [] }));
        setCampoActivo(null);
    };

    const handleBuscar = async (e) => {
        e.preventDefault();
        const { nombre, rut, email } = filtros;
        if (!nombre.trim() && !rut.trim() && !email.trim()) return;

        setCargando(true);
        setSugerencias({ nombre: [], rut: [], email: [] });
        try {
            const data = await buscarUsuarios(nombre, rut, email);
            setUsuarios(data);
            setHaBuscado(true);
        } catch (err) {
            console.error('Error buscando usuarios', err);
        } finally {
            setCargando(false);
        }
    };

    const handleVerTodos = async () => {
        setCargando(true);
        setSugerencias({ nombre: [], rut: [], email: [] });
        try {
            const data = await obtenerUsuarios();
            setUsuarios(data);
            setHaBuscado(true);
            setFiltros(initialFiltros);
        } catch (err) {
            console.error('Error cargando usuarios', err);
        } finally {
            setCargando(false);
        }
    };

    const refrescar = async () => {
        const { nombre, rut, email } = filtros;
        if (nombre.trim() || rut.trim() || email.trim()) {
            const data = await buscarUsuarios(nombre, rut, email);
            setUsuarios(data);
        } else if (haBuscado) {
            const data = await obtenerUsuarios();
            setUsuarios(data);
        }
    };

    // ── VALIDACIONES ──────────────────────────────────────────────

    const validarTelefono = (tel) => /^[0-9]{9,}$/.test(tel);

    const validarEdicion = () => {
        const errs = {};
        if (!formEdicion.nombre.trim() || formEdicion.nombre.trim().length < 2) {
            errs.nombre = 'El nombre debe tener al menos 2 caracteres';
        }
        if (!formEdicion.apellido.trim() || formEdicion.apellido.trim().length < 2) {
            errs.apellido = 'El apellido debe tener al menos 2 caracteres';
        }
        if (formEdicion.telefono && !validarTelefono(formEdicion.telefono)) {
            errs.telefono = 'El teléfono debe tener al menos 9 dígitos numéricos';
        }
        if (formEdicion.direccion && formEdicion.direccion.trim().length < 5) {
            errs.direccion = 'La dirección debe tener al menos 5 caracteres';
        }
        return errs;
    };

    // ── HANDLERS ──────────────────────────────────────────────────

    const abrirEdicion = (usuario) => {
        setUsuarioEditando(usuario);
        setFormEdicion({
            rol: usuario.rol,
            nombre: usuario.nombre || '',
            apellido: usuario.apellido || '',
            telefono: usuario.telefono || '',
            direccion: usuario.direccion || ''
        });
        setErroresEdicion({});
    };

    const cerrarEdicion = () => {
        setUsuarioEditando(null);
        setErroresEdicion({});
    };

    const handleGuardarEdicion = async (e) => {
        e.preventDefault();
        const errs = validarEdicion();
        if (Object.keys(errs).length > 0) {
            setErroresEdicion(errs);
            return;
        }
        setErroresEdicion({});

        const confirmado = window.confirm('¿Estás seguro de que quieres guardar estos cambios?');
        if (!confirmado) return;

        try {
            await actualizarUsuario(usuarioEditando.id, {
                email: usuarioEditando.email,
                rol: formEdicion.rol,
                persona: {
                    nombre: formEdicion.nombre,
                    apellido: formEdicion.apellido,
                    rut: usuarioEditando.rut,
                    email: usuarioEditando.emailPersona,
                    telefono: formEdicion.telefono,
                    direccion: formEdicion.direccion
                }
            });
            setMensaje('Usuario actualizado correctamente');
            cerrarEdicion();
            refrescar();
        } catch (err) {
            setError('Error al actualizar el usuario');
        }
    };

    const hayFiltros = filtros.nombre.trim() || filtros.rut.trim() || filtros.email.trim();

    return (
        <div className="usuarios-container">
            <header className="usuarios-header">
                <button className="btn-volver" onClick={() => navigate('/dashboard')}>
                    ← Volver
                </button>
                <h1>Gestión de Usuarios</h1>
            </header>

            {mensaje && <div className="alert-success">{mensaje}</div>}
            {error && <div className="alert-error">{error}</div>}

            <p style={{
                background: '#eef3f8',
                border: '1px solid #cfdae6',
                borderRadius: 4,
                padding: '10px 14px',
                fontSize: 14
            }}>
                Las cuentas de acceso se crean y se dan de baja en Microsoft Entra ID.
                Aquí se consultan los usuarios del sistema y se editan sus datos de contacto.
            </p>

            <div className="buscador-card">
                <form onSubmit={handleBuscar} className="buscador-form">
                    <div className="campo-autocompletado">
                        <label>Nombre completo</label>
                        <input
                            type="text"
                            placeholder="Ej: Juan Pérez"
                            value={filtros.nombre}
                            onChange={(e) => handleFiltroChange('nombre', e.target.value)}
                            onFocus={() => setCampoActivo('nombre')}
                            autoComplete="off"
                        />
                        {campoActivo === 'nombre' && sugerencias.nombre.length > 0 && (
                            <ul className="sugerencias-dropdown">
                                {sugerencias.nombre.map(u => (
                                    <li key={u.id} onClick={() => seleccionarSugerencia('nombre', u)}>
                                        <span className="sugerencia-principal">{u.nombre} {u.apellido}</span>
                                        <span className="sugerencia-secundaria">{u.rut} · {u.rol}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="campo-autocompletado">
                        <label>RUT</label>
                        <input
                            type="text"
                            placeholder="Ej: 12345678-9"
                            value={filtros.rut}
                            onChange={(e) => handleFiltroChange('rut', e.target.value)}
                            onFocus={() => setCampoActivo('rut')}
                            autoComplete="off"
                        />
                        {campoActivo === 'rut' && sugerencias.rut.length > 0 && (
                            <ul className="sugerencias-dropdown">
                                {sugerencias.rut.map(u => (
                                    <li key={u.id} onClick={() => seleccionarSugerencia('rut', u)}>
                                        <span className="sugerencia-principal">{u.rut}</span>
                                        <span className="sugerencia-secundaria">{u.nombre} {u.apellido}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="campo-autocompletado">
                        <label>Email</label>
                        <input
                            type="text"
                            placeholder="Ej: correo@colegio.cl"
                            value={filtros.email}
                            onChange={(e) => handleFiltroChange('email', e.target.value)}
                            onFocus={() => setCampoActivo('email')}
                            autoComplete="off"
                        />
                        {campoActivo === 'email' && sugerencias.email.length > 0 && (
                            <ul className="sugerencias-dropdown">
                                {sugerencias.email.map(u => (
                                    <li key={u.id} onClick={() => seleccionarSugerencia('email', u)}>
                                        <span className="sugerencia-principal">{u.email}</span>
                                        <span className="sugerencia-secundaria">{u.nombre} {u.apellido}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="botones-buscador">
                        <button type="submit" className="btn-buscar" disabled={!hayFiltros}>
                            Buscar
                        </button>
                        <button type="button" className="btn-ver-todos" onClick={handleVerTodos}>
                            Ver todos
                        </button>
                    </div>
                </form>
            </div>

            <div className="tabla-container">
                {cargando ? (
                    <div className="estado-vacio">Cargando...</div>
                ) : !haBuscado ? (
                    <div className="estado-vacio">Usa el buscador o presiona "Ver todos" para mostrar usuarios</div>
                ) : usuarios.length === 0 ? (
                    <div className="estado-vacio">No se encontraron usuarios</div>
                ) : (
                    <table className="usuarios-tabla">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Nombre</th>
                                <th>RUT</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>{u.email}</td>
                                    <td><span className={`badge badge-${u.rol?.toLowerCase()}`}>{u.rol}</span></td>
                                    <td>{u.nombre} {u.apellido}</td>
                                    <td>{u.rut}</td>
                                    <td>
                                        <button className="btn-editar" onClick={() => abrirEdicion(u)}>
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {usuarioEditando && (
                <div className="modal-overlay" onClick={cerrarEdicion}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Editar Usuario</h2>
                        <form onSubmit={handleGuardarEdicion}>
                            <div className="form-field">
                                <label>RUT (no editable)</label>
                                <input type="text" value={usuarioEditando.rut} disabled />
                            </div>
                            <div className="form-row">
                                <div className="form-field">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        value={formEdicion.nombre}
                                        onChange={(e) => setFormEdicion({ ...formEdicion, nombre: e.target.value })}
                                        required
                                    />
                                    {erroresEdicion.nombre && <span className="error-field">{erroresEdicion.nombre}</span>}
                                </div>
                                <div className="form-field">
                                    <label>Apellido</label>
                                    <input
                                        type="text"
                                        value={formEdicion.apellido}
                                        onChange={(e) => setFormEdicion({ ...formEdicion, apellido: e.target.value })}
                                        required
                                    />
                                    {erroresEdicion.apellido && <span className="error-field">{erroresEdicion.apellido}</span>}
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-field">
                                    <label>Teléfono</label>
                                    <input
                                        type="text"
                                        value={formEdicion.telefono}
                                        onChange={(e) => setFormEdicion({ ...formEdicion, telefono: e.target.value })}
                                    />
                                    {erroresEdicion.telefono && <span className="error-field">{erroresEdicion.telefono}</span>}
                                </div>
                                <div className="form-field">
                                    <label>Dirección</label>
                                    <input
                                        type="text"
                                        value={formEdicion.direccion}
                                        onChange={(e) => setFormEdicion({ ...formEdicion, direccion: e.target.value })}
                                    />
                                    {erroresEdicion.direccion && <span className="error-field">{erroresEdicion.direccion}</span>}
                                </div>
                            </div>
                            <div className="form-field">
                                <label>Rol</label>
                                <select
                                    value={formEdicion.rol}
                                    onChange={(e) => setFormEdicion({ ...formEdicion, rol: e.target.value })}
                                >
                                    {rolesDisponibles.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-botones">
                                <button type="button" className="btn-cancelar" onClick={cerrarEdicion}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-guardar">
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}