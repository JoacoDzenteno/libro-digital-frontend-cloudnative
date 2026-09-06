import axios from 'axios';
import { getToken } from './authService';

const API_URL = 'http://localhost:8080/api';

const getHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

export const registrarUsuario = async (usuario) => {
    const response = await axios.post(`${API_URL}/auth/register`, usuario);
    return response.data;
};

export const obtenerUsuarios = async () => {
    const response = await axios.get(`${API_URL}/usuarios`, getHeaders());
    return response.data;
};

export const eliminarUsuario = async (id) => {
    const response = await axios.delete(`${API_URL}/usuarios/${id}`, getHeaders());
    return response.data;
};

export const actualizarPerfil = async (id, datos) => {
    const response = await axios.put(`${API_URL}/usuarios/${id}/perfil`, datos, getHeaders());
    return response.data;
};

export const obtenerUsuarioPorId = async (id) => {
    const response = await axios.get(`${API_URL}/usuarios/${id}`, getHeaders());
    return response.data;
};

export const buscarUsuarios = async (nombre, rut, email, limite) => {
    const params = new URLSearchParams();
    if (nombre) params.append('nombre', nombre);
    if (rut) params.append('rut', rut);
    if (email) params.append('email', email);
    if (limite) params.append('limite', limite);
    const response = await axios.get(`${API_URL}/usuarios/buscar?${params.toString()}`, getHeaders());
    return response.data;
};

export const actualizarUsuario = async (id, usuario) => {
    const response = await axios.put(`${API_URL}/usuarios/${id}`, usuario, getHeaders());
    return response.data;
};