import { api, API_BASE } from './api';

const API_URL = `${API_BASE}/comunicaciones`;

export const obtenerMensajesPorDestinatario = async (idDestinatario) => {
    const response = await api.get(`${API_URL}/destinatario/${idDestinatario}`);
    return response.data;
};

export const obtenerMensajesNoLeidos = async (idDestinatario) => {
    const response = await api.get(`${API_URL}/destinatario/${idDestinatario}/no-leidos`);
    return response.data;
};

export const enviarMensaje = async (mensaje) => {
    const response = await api.post(`${API_URL}`, mensaje);
    return response.data;
};

export const marcarComoLeido = async (id) => {
    const response = await api.patch(`${API_URL}/${id}/leer`, {});
    return response.data;
};

export const eliminarMensaje = async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
};