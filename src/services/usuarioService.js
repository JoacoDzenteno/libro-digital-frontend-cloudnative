import { api } from './api';

const API_URL = 'http://localhost:8080/api';

export const obtenerUsuarios = async () => {
    const response = await api.get(`${API_URL}/usuarios`);
    return response.data;
};

export const eliminarUsuario = async (id) => {
    const response = await api.delete(`${API_URL}/usuarios/${id}`);
    return response.data;
};

export const actualizarPerfil = async (id, datos) => {
    const response = await api.put(`${API_URL}/usuarios/${id}/perfil`, datos);
    return response.data;
};

export const obtenerUsuarioPorId = async (id) => {
    const response = await api.get(`${API_URL}/usuarios/${id}`);
    return response.data;
};

export const buscarUsuarios = async (nombre, rut, email, limite) => {
    const params = new URLSearchParams();
    if (nombre) params.append('nombre', nombre);
    if (rut) params.append('rut', rut);
    if (email) params.append('email', email);
    if (limite) params.append('limite', limite);
    const response = await api.get(`${API_URL}/usuarios/buscar?${params.toString()}`);
    return response.data;
};

export const actualizarUsuario = async (id, usuario) => {
    const response = await api.put(`${API_URL}/usuarios/${id}`, usuario);
    return response.data;
};

// Resuelve la identidad interna a partir del identificador de Microsoft que
// viaja en el token. Es lo que conecta la cuenta de Entra ID con el id que usa
// el resto del sistema.
export const obtenerMiUsuario = async () => {
    const response = await api.get(`${API_URL}/usuarios/me`);
    return response.data;
};

export const obtenerDirectorio = async () => {
    const response = await api.get(`${API_URL}/usuarios/directorio`);
    return response.data;
};