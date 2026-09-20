import { api } from './api';

const API_URL = 'http://localhost:8080/api/reportes';

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