import axios from 'axios';
import { getToken } from './authService';

const API_URL = 'http://localhost:8080/api/reportes';

const getHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

export const obtenerReportes = async () => {
    const response = await axios.get(`${API_URL}`, getHeaders());
    return response.data;
};

export const obtenerReportePorId = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getHeaders());
    return response.data;
};

export const obtenerReportesPorTipo = async (tipo) => {
    const response = await axios.get(`${API_URL}/tipo/${tipo}`, getHeaders());
    return response.data;
};

export const generarReporte = async (reporte) => {
    const response = await axios.post(`${API_URL}`, reporte, getHeaders());
    return response.data;
};

export const eliminarReporte = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getHeaders());
    return response.data;
};