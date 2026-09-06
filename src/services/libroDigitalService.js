import axios from 'axios';
import { getToken } from './authService';

const API_URL = 'http://localhost:8080/api/libro';

const getHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

// Asistencias
export const obtenerAsistenciasPorEstudiante = async (idEstudiante) => {
    const response = await axios.get(`${API_URL}/asistencias/estudiante/${idEstudiante}`, getHeaders());
    return response.data;
};

export const registrarAsistencia = async (asistencia) => {
    const response = await axios.post(`${API_URL}/asistencias`, asistencia, getHeaders());
    return response.data;
};

// Calificaciones
export const obtenerCalificacionesPorEstudiante = async (idEstudiante) => {
    const response = await axios.get(`${API_URL}/calificaciones/estudiante/${idEstudiante}`, getHeaders());
    return response.data;
};

export const registrarCalificacion = async (calificacion) => {
    const response = await axios.post(`${API_URL}/calificaciones`, calificacion, getHeaders());
    return response.data;
};

// Hoja de Vida
export const obtenerHojaVidaPorEstudiante = async (idEstudiante) => {
    const response = await axios.get(`${API_URL}/hojavida/estudiante/${idEstudiante}`, getHeaders());
    return response.data;
};

export const registrarAnotacion = async (anotacion) => {
    const response = await axios.post(`${API_URL}/hojavida`, anotacion, getHeaders());
    return response.data;
};