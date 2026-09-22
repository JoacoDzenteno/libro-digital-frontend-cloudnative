import { api, API_BASE } from './api';

const API_URL = `${API_BASE}/matricula`;

export const obtenerMatriculas = async () => {
    const response = await api.get(`${API_URL}`);
    return response.data;
};

export const obtenerMatriculaPorEstudiante = async (idEstudiante) => {
    const response = await api.get(`${API_URL}/estudiante/${idEstudiante}`);
    return response.data;
};

export const obtenerMatriculaPorApoderado = async (idApoderado) => {
    const response = await api.get(`${API_URL}/apoderado/${idApoderado}`);
    return response.data;
};

export const crearMatricula = async (matricula) => {
    const response = await api.post(`${API_URL}`, matricula);
    return response.data;
};

export const cambiarEstadoMatricula = async (id, estado) => {
    const response = await api.patch(`${API_URL}/${id}/estado?estado=${estado}`, {});
    return response.data;
};

export const eliminarMatricula = async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
};