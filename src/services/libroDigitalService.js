import { api, API_BASE } from './api';

const API_URL = `${API_BASE}/libro`;

// Asistencias
export const obtenerAsistenciasPorEstudiante = async (idEstudiante) => {
    const response = await api.get(`${API_URL}/asistencias/estudiante/${idEstudiante}`);
    return response.data;
};

export const registrarAsistencia = async (asistencia) => {
    const response = await api.post(`${API_URL}/asistencias`, asistencia);
    return response.data;
};

// Calificaciones
export const obtenerCalificacionesPorEstudiante = async (idEstudiante) => {
    const response = await api.get(`${API_URL}/calificaciones/estudiante/${idEstudiante}`);
    return response.data;
};

export const registrarCalificacion = async (calificacion) => {
    const response = await api.post(`${API_URL}/calificaciones`, calificacion);
    return response.data;
};

// Hoja de Vida
export const obtenerHojaVidaPorEstudiante = async (idEstudiante) => {
    const response = await api.get(`${API_URL}/hojavida/estudiante/${idEstudiante}`);
    return response.data;
};

export const registrarAnotacion = async (anotacion) => {
    const response = await api.post(`${API_URL}/hojavida`, anotacion);
    return response.data;
};