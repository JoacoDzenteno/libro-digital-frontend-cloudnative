import { PublicClientApplication } from '@azure/msal-browser'
import { msalConfig } from './authConfig'

// Una sola instancia de MSAL para toda la aplicacion. Vive en su propio archivo
// para que main.jsx y el interceptor de axios usen la misma sin importarse
// entre ellos, que crearia un ciclo de dependencias.
export const msalInstance = new PublicClientApplication(msalConfig)