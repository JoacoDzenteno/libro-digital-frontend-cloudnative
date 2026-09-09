// Configuracion de MSAL contra el tenant de Entra ID del proyecto.
//
// Estos identificadores NO son secretos: el clientId de una aplicacion que corre
// en el navegador es publico por diseno. Aun asi se leen de variables de entorno,
// con el valor del tenant del curso como respaldo, para que el proyecto quede
// preparado para desplegarse en otro ambiente sin tocar codigo.

const TENANT_ID     = import.meta.env.VITE_TENANT_ID     || '1148f910-11c6-41a3-94d3-dedca0cefa9c';
const SPA_CLIENT_ID = import.meta.env.VITE_SPA_CLIENT_ID || '5fcf11f9-1c17-4841-b683-e16ace5772b9';
const API_CLIENT_ID = import.meta.env.VITE_API_CLIENT_ID || '3ac3ede1-1d05-42df-8248-3fbde4240a87';
const REDIRECT_URI  = import.meta.env.VITE_REDIRECT_URI  || 'http://localhost:5173';

export const msalConfig = {
  auth: {
    clientId: SPA_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

// El scope propio de nuestra API. Pedir scopes de Microsoft Graph aca haria que
// el token llegara dirigido a Graph y el backend lo rechazaria por audiencia.
export const loginRequest = {
  scopes: [`api://${API_CLIENT_ID}/access_as_user`],
};

// Lo que el token deberia traer. Se usa en la pagina de verificacion.
export const esperado = {
  audience: API_CLIENT_ID,
  issuer: `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
  scope: 'access_as_user',
};
