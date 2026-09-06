import axios from 'axios';
import { getToken } from './authService';

const API_URL = 'http://localhost:8080/api/matricula';

const getHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

export const obtenerMatriculas = async () => {
    const response = await axios.get(`${API_URL}`, getHeaders());
    return response.data;
};

export const obtenerMatriculaPorEstudiante = async (idEstudiante) => {
    const response = await axios.get(`${API_URL}/estudiante/${idEstudiante}`, getHeaders());
    return response.data;
};

export const obtenerMatriculaPorApoderado = async (idApoderado) => {
    const response = await axios.get(`${API_URL}/apoderado/${idApoderado}`, getHeaders());
    return response.data;
};

export const crearMatricula = async (matricula) => {
    const response = await axios.post(`${API_URL}`, matricula, getHeaders());
    return response.data;
};

export const cambiarEstadoMatricula = async (id, estado) => {
    const response = await axios.patch(`${API_URL}/${id}/estado?estado=${estado}`, {}, getHeaders());
    return response.data;
};

export const eliminarMatricula = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getHeaders());
    return response.data;
};
