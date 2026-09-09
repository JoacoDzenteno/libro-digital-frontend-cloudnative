import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import { msalConfig } from './authConfig'
import './index.css'
import App from './App.jsx'
import MsalTest from './MsalTest.jsx'   // TEMPORAL: borrar cuando el login este listo

const msalInstance = new PublicClientApplication(msalConfig)

// La ventana emergente de Microsoft vuelve al redirect URI, que es la raiz de
// esta misma aplicacion. Si dejamos que la app se monte ahi dentro, el router
// la manda a /login y la ventana se queda pegada en el formulario viejo en vez
// de cerrarse. La ventana principal lee la respuesta por su cuenta, asi que
// dentro de la emergente no hay que renderizar nada.
const enVentanaEmergente = Boolean(window.opener) && window.opener !== window

// Pagina temporal de verificacion del tenant, en http://localhost:5173/msal-test
const esPruebaMsal = window.location.pathname === '/msal-test'

if (!enVentanaEmergente) {
  // initialize() es obligatorio desde MSAL v3 y tiene que completarse ANTES de
  // renderizar. Sin esto, la primera llamada falla con
  // "uninitialized_public_client_application".
  msalInstance.initialize().then(() => {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <MsalProvider instance={msalInstance}>
          {esPruebaMsal ? <MsalTest /> : <App />}
        </MsalProvider>
      </StrictMode>,
    )
  })
}
