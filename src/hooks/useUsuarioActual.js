import { useEffect, useState } from 'react'
import { useMsal } from '@azure/msal-react'
import { InteractionStatus } from '@azure/msal-browser'
import { loginRequest } from '../authConfig'
import { obtenerMiUsuario } from '../services/usuarioService'

// Devuelve quien es el usuario conectado, en dos planos:
//   rol      -> viene del claim del token, lo pone Entra ID
//   interno  -> viene de /api/usuarios/me, es el registro en nuestra base
export function useUsuarioActual() {
    const { instance, accounts, inProgress } = useMsal()
    const [rol, setRol] = useState(null)
    const [interno, setInterno] = useState(null)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        if (inProgress !== InteractionStatus.None) return
        const cuenta = accounts[0]
        if (!cuenta) { setCargando(false); return }

        const resolver = async () => {
            try {
                // Los app roles se definieron en la API, asi que llegan en el
                // access token, no en el de identidad.
                const r = await instance.acquireTokenSilent({ ...loginRequest, account: cuenta })
                const claims = JSON.parse(atob(r.accessToken.split('.')[1]))
                setRol(claims.roles?.[0] ?? null)

                setInterno(await obtenerMiUsuario())
            } catch (e) {
                console.error('No se pudo resolver el usuario actual', e)
            } finally {
                setCargando(false)
            }
        }
        resolver()
    }, [inProgress, accounts.length])

    return { rol, interno, cargando }
}