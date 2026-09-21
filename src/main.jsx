import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MsalProvider } from '@azure/msal-react'
import './index.css'
import App from './App.jsx'
import { msalInstance } from './msalInstance'

// La ventana emergente de Microsoft vuelve al redirect URI, que es la raiz de
// esta misma aplicacion. Si dejamos que la app se monte ahi dentro, el router
// la manda a /login y la ventana se queda pegada en el formulario viejo en vez
// de cerrarse. La ventana principal lee la respuesta por su cuenta, asi que
// dentro de la emergente no hay que renderizar nada.
const enVentanaEmergente = Boolean(window.opener) && window.opener !== window

if (!enVentanaEmergente) {
  // initialize() es obligatorio desde MSAL v3 y tiene que completarse ANTES de
  // renderizar. Sin esto, la primera llamada falla con
  // "uninitialized_public_client_application".
  msalInstance.initialize().then(() => {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      </StrictMode>,
    )
  })
}