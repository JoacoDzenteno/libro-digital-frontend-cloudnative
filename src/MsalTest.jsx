// TEMPORAL — Verificacion del tenant de Entra ID.
//
// Sirve para comprobar, antes de escribir nada del login definitivo, que el
// tenant esta bien configurado: que el token sale dirigido a nuestra API, que
// lo emite nuestro tenant en formato v2 y que trae el rol del usuario.
//
// Se abre en http://localhost:5173/msal-test
// Se borra este archivo (y su import en main.jsx) cuando el login este listo.

import { useState, useEffect } from 'react'
import { useMsal } from '@azure/msal-react'
import { InteractionStatus } from '@azure/msal-browser'
import { loginRequest, esperado } from './authConfig'

// A donde vuelve Microsoft despues del login. Tiene que estar registrada como
// redirect URI de tipo SPA en la aplicacion libro-digital-spa del portal.
const VUELTA = window.location.origin + '/msal-test'

function leerClaims(jwt) {
  const parte = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  const relleno = parte + '='.repeat((4 - (parte.length % 4)) % 4)
  const binario = atob(relleno)
  const bytes = Uint8Array.from(binario, (c) => c.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes))
}

export default function MsalTest() {
  const { instance, inProgress } = useMsal()
  const [token, setToken] = useState('')
  const [claims, setClaims] = useState(null)
  const [error, setError] = useState('')

  // MSAL solo permite una interaccion a la vez. Si quedo una marca pegada de un
  // intento interrumpido, cualquier login nuevo falla con interaction_in_progress.
  const ocupado = inProgress !== InteractionStatus.None

  const entrar = async () => {
    setError('')
    if (ocupado) {
      setError('Hay una autenticacion en curso. Espera un momento o aprieta "Limpiar sesion".')
      return
    }
    try {
      // Redireccion en vez de ventana emergente: la propia pagina se va a
      // Microsoft y vuelve aca. No depende de que una ventana pueda espiar a
      // otra, que es lo que fallaba con loginPopup.
      await instance.loginRedirect({ ...loginRequest, redirectUri: VUELTA })
    } catch (e) {
      if (e.errorCode === 'interaction_in_progress') {
        setError('Quedo una autenticacion a medias de un intento anterior. Aprieta "Limpiar sesion" y vuelve a intentar.')
      } else if (e.errorCode === 'user_cancelled') {
        setError('Cerraste la ventana de Microsoft antes de terminar.')
      } else {
        setError((e.errorCode ? e.errorCode + ': ' : '') + (e.errorMessage || e.message))
      }
    }
  }

  // Escotilla de emergencia: borra todo lo que MSAL guardo y recarga.
  const limpiar = () => {
    sessionStorage.clear()
    localStorage.clear()
    window.location.reload()
  }

  const pedirToken = async () => {
    setError('')
    try {
      const cuenta = instance.getAllAccounts()[0]
      if (!cuenta) {
        setError('No hay sesion iniciada. Aprieta "Entrar con Microsoft" primero.')
        return
      }
      const r = await instance.acquireTokenSilent({ ...loginRequest, account: cuenta })
      setToken(r.accessToken)
      setClaims(leerClaims(r.accessToken))
    } catch (e) {
      setError(e.errorMessage || e.message)
    }
  }

  const salir = () => {
    setToken(''); setClaims(null); setError('')
    instance.logoutRedirect({ postLogoutRedirectUri: VUELTA })
  }

  // Al volver de Microsoft ya hay cuenta en cache: pedimos el token solo.
  useEffect(() => {
    if (inProgress === InteractionStatus.None && instance.getAllAccounts().length > 0 && !claims) {
      pedirToken()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inProgress])

  const roles = claims?.roles || []
  const scopes = (claims?.scp || '').split(' ')

  const revisiones = claims ? [
    {
      nombre: 'Audiencia (aud)',
      ok: claims.aud === esperado.audience,
      valor: claims.aud,
      ayuda: 'Debe ser el client id de libro-digital-api. Si es otro, se pidio el scope equivocado en authConfig.js.',
    },
    {
      nombre: 'Emisor (iss)',
      ok: claims.iss === esperado.issuer,
      valor: claims.iss,
      ayuda: 'Debe terminar en /v2.0. Si no, falta poner requestedAccessTokenVersion en 2 en el manifiesto de la API.',
    },
    {
      nombre: 'Roles',
      ok: roles.length > 0,
      valor: roles.length ? roles.join(', ') : '(vacio)',
      ayuda: 'Si viene vacio, al usuario no se le asigno su app role en Enterprise applications > libro-digital-api > Users and groups.',
    },
    {
      nombre: 'Scope (scp)',
      ok: scopes.includes(esperado.scope),
      valor: claims.scp || '(vacio)',
      ayuda: 'Debe incluir access_as_user.',
    },
    {
      nombre: 'Identificador del usuario (oid)',
      ok: Boolean(claims.oid),
      valor: claims.oid || '(vacio)',
      ayuda: 'Es el valor que despues se guarda en la columna azure_oid de la tabla usuario.',
    },
  ] : []

  const todoOk = revisiones.length > 0 && revisiones.every((r) => r.ok)

  const caja = { border: '1px solid #ccc', borderRadius: 6, padding: 16, marginTop: 16, background: '#fff' }
  const boton = { padding: '10px 16px', marginRight: 8, cursor: 'pointer', fontSize: 14 }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '40px auto', padding: '0 20px', color: '#222' }}>
      <h1 style={{ marginBottom: 4 }}>Verificacion del tenant</h1>
      <p style={{ color: '#666', marginTop: 0 }}>
        Pagina temporal. Comprueba que Entra ID emite el token correcto antes de escribir el login definitivo.
      </p>

      <div style={{ marginTop: 20 }}>
        <button style={boton} onClick={entrar} disabled={ocupado}>Entrar con Microsoft</button>
        <button style={boton} onClick={pedirToken} disabled={ocupado}>Pedir token</button>
        <button style={boton} onClick={salir} disabled={ocupado}>Cerrar sesion</button>
        <button style={boton} onClick={limpiar}>Limpiar sesion</button>
        {ocupado && <span style={{ marginLeft: 8, color: '#a60' }}>autenticacion en curso...</span>}
      </div>

      {error && (
        <div style={{ ...caja, borderColor: '#c00', background: '#fff5f5' }}>
          <strong>Error</strong>
          <pre style={{ whiteSpace: 'pre-wrap', margin: '8px 0 0' }}>{error}</pre>
        </div>
      )}

      {claims && (
        <div style={{ ...caja, borderColor: todoOk ? '#2c7' : '#e90', background: todoOk ? '#f3fbf6' : '#fffaf0' }}>
          <h2 style={{ margin: '0 0 12px' }}>
            {todoOk ? 'Tenant configurado correctamente' : 'Hay algo mal configurado'}
          </h2>
          {revisiones.map((r) => (
            <div key={r.nombre} style={{ marginBottom: 10 }}>
              <div>
                <strong>{r.ok ? 'OK' : 'FALLA'}</strong> — {r.nombre}:{' '}
                <code style={{ background: '#eee', padding: '1px 4px' }}>{String(r.valor)}</code>
              </div>
              {!r.ok && <div style={{ color: '#a40', fontSize: 13, marginTop: 2 }}>{r.ayuda}</div>}
            </div>
          ))}
          <div style={{ fontSize: 13, color: '#666', marginTop: 12 }}>
            Usuario: {claims.preferred_username} — expira: {new Date(claims.exp * 1000).toLocaleString()}
          </div>
        </div>
      )}

      {token && (
        <div style={caja}>
          <strong>Access token</strong>
          <p style={{ fontSize: 13, color: '#666', margin: '4px 0 8px' }}>
            Pegalo en jwt.ms para verlo completo, o pasaselo a quien este probando el backend.
          </p>
          <textarea readOnly value={token} rows={6} style={{ width: '100%', fontFamily: 'monospace', fontSize: 11 }} />
          <button style={{ ...boton, marginTop: 8 }} onClick={() => navigator.clipboard.writeText(token)}>
            Copiar
          </button>
        </div>
      )}
    </div>
  )
}
