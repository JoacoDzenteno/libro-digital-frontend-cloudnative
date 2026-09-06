import axios from 'axios';
import { getToken } from './authService';

const API_URL = 'http://localhost:8080/api/academico';

const getHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

// Cursos
export const obtenerCursos = async () => {
    const response = await axios.get(`${API_URL}/cursos`, getHeaders());
    return response.data;
};

export const crearCurso = async (curso) => {
    const response = await axios.post(`${API_URL}/cursos`, curso, getHeaders());
    return response.data;
};

export const eliminarCurso = async (id) => {
    const response = await axios.delete(`${API_URL}/cursos/${id}`, getHeaders());
    return response.data;
};

// Asignaturas
export const obtenerAsignaturas = async () => {
    const response = await axios.get(`${API_URL}/asignaturas`, getHeaders());
    return response.data;
};

export const crearAsignatura = async (asignatura) => {
    const response = await axios.post(`${API_URL}/asignaturas`, asignatura, getHeaders());
    return response.data;
};

export const eliminarAsignatura = async (id) => {
    const response = await axios.delete(`${API_URL}/asignaturas/${id}`, getHeaders());
    return response.data;
};

// Carga Horaria
export const obtenerCargas = async () => {
    const response = await axios.get(`${API_URL}/cargas`, getHeaders());
    return response.data;
};

export const crearCarga = async (carga) => {
    const response = await axios.post(`${API_URL}/cargas`, carga, getHeaders());
    return response.data;
};

export const eliminarCarga = async (id) => {
    const response = await axios.delete(`${API_URL}/cargas/${id}`, getHeaders());
    return response.data;
};

export const buscarCursos = async (nivel, anio) => {
    const params = new URLSearchParams();
    if (nivel) params.append('nivel', nivel);
    if (anio) params.append('anio', anio);
    const response = await axios.get(`${API_URL}/cursos/buscar?${params.toString()}`, getHeaders());
    return response.data;
};

export const buscarAsignaturas = async (nombre, codigo) => {
    const params = new URLSearchParams();
    if (nombre) params.append('nombre', nombre);
    if (codigo) params.append('codigo', codigo);
    const response = await axios.get(`${API_URL}/asignaturas/buscar?${params.toString()}`, getHeaders());
    return response.data;
};

export const actualizarCarga = async (id, carga) => {
    const response = await axios.put(`${API_URL}/cargas/${id}`, carga, getHeaders());
    return response.data;
};

