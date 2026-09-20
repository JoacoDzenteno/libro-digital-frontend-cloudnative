import axios from 'axios'
import { InteractionRequiredAuthError } from '@azure/msal-browser'
import { msalInstance } from '../msalInstance'
import { loginRequest } from '../authConfig'

export const api = axios.create()

// Equivalente al MsalInterceptor de Angular: adjunta el access token a cada
// llamada saliente y lo renueva solo cuando esta por vencer.
// acquireTokenSilent lee la cache de MSAL, asi que no golpea a Microsoft en
// cada peticion: solo cuando al token le queda poco.
api.interceptors.request.use(async (config) => {
  const cuenta = msalInstance.getAllAccounts()[0]
  if (!cuenta) return config

  try {
    const respuesta = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: cuenta,
    })
    config.headers.Authorization = `Bearer ${respuesta.accessToken}`
  } catch (error) {
    // No se pudo renovar en silencio (sesion vencida, consentimiento revocado,
    // cambio de contrasena): hay que volver a pasar por Microsoft.
    if (error instanceof InteractionRequiredAuthError) {
      await msalInstance.acquireTokenRedirect({ ...loginRequest, account: cuenta })
      return config
    }
    throw error
  }

  return config
})

// Deja claro en consola por que fallo una llamada, en vez de un error generico.
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const codigo = error.response?.status
    if (codigo === 401) console.error('401 — el backend rechazo el token')
    if (codigo === 403) console.error('403 — el rol del usuario no alcanza para este endpoint')
    return Promise.reject(error)
  },
)