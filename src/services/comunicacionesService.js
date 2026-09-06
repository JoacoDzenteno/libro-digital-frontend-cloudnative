import axios from 'axios';
import { getToken } from './authService';

const API_URL = 'http://localhost:8080/api/comunicaciones';

const getHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

export const obtenerMensajesPorDestinatario = async (idDestinatario) => {
    const response = await axios.get(`${API_URL}/destinatario/${idDestinatario}`, getHeaders());
    return response.data;
};

export const obtenerMensajesNoLeidos = async (idDestinatario) => {
    const response = await axios.get(`${API_URL}/destinatario/${idDestinatario}/no-leidos`, getHeaders());
    return response.data;
};

export const enviarMensaje = async (mensaje) => {
    const response = await axios.post(`${API_URL}`, mensaje, getHeaders());
    return response.data;
};

export const marcarComoLeido = async (id) => {
    const response = await axios.patch(`${API_URL}/${id}/leer`, {}, getHeaders());
    return response.data;
};

export const eliminarMensaje = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getHeaders());
    return response.data;
};