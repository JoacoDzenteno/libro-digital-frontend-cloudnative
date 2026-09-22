import { api, API_BASE } from './api';

const API_URL = `${API_BASE}/academico`;

// Cursos
export const obtenerCursos = async () => {
    const response = await api.get(`${API_URL}/cursos`);
    return response.data;
};

export const crearCurso = async (curso) => {
    const response = await api.post(`${API_URL}/cursos`, curso);
    return response.data;
};

export const eliminarCurso = async (id) => {
    const response = await api.delete(`${API_URL}/cursos/${id}`);
    return response.data;
};

// Asignaturas
export const obtenerAsignaturas = async () => {
    const response = await api.get(`${API_URL}/asignaturas`);
    return response.data;
};

export const crearAsignatura = async (asignatura) => {
    const response = await api.post(`${API_URL}/asignaturas`, asignatura);
    return response.data;
};

export const eliminarAsignatura = async (id) => {
    const response = await api.delete(`${API_URL}/asignaturas/${id}`);
    return response.data;
};

// Carga Horaria
export const obtenerCargas = async () => {
    const response = await api.get(`${API_URL}/cargas`);
    return response.data;
};

export const crearCarga = async (carga) => {
    const response = await api.post(`${API_URL}/cargas`, carga);
    return response.data;
};

export const eliminarCarga = async (id) => {
    const response = await api.delete(`${API_URL}/cargas/${id}`);
    return response.data;
};

export const buscarCursos = async (nivel, anio) => {
    const params = new URLSearchParams();
    if (nivel) params.append('nivel', nivel);
    if (anio) params.append('anio', anio);
    const response = await api.get(`${API_URL}/cursos/buscar?${params.toString()}`);
    return response.data;
};

export const buscarAsignaturas = async (nombre, codigo) => {
    const params = new URLSearchParams();
    if (nombre) params.append('nombre', nombre);
    if (codigo) params.append('codigo', codigo);
    const response = await api.get(`${API_URL}/asignaturas/buscar?${params.toString()}`);
    return response.data;
};

export const actualizarCarga = async (id, carga) => {
    const response = await api.put(`${API_URL}/cargas/${id}`, carga);
    return response.data;
};