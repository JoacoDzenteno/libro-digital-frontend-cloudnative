import { api, API_BASE } from './api';

const API_URL = `${API_BASE}/reportes`;

export const obtenerReportes = async () => {
    const response = await api.get(`${API_URL}`);
    return response.data;
};

export const obtenerReportePorId = async (id) => {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
};

export const obtenerReportesPorTipo = async (tipo) => {
    const response = await api.get(`${API_URL}/tipo/${tipo}`);
    return response.data;
};

export const generarReporte = async (reporte) => {
    const response = await api.post(`${API_URL}`, reporte);
    return response.data;
};

export const eliminarReporte = async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
};