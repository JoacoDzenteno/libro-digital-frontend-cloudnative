# Libro Digital · Frontend

Interfaz del libro de clases digital, en React + Vite. Base de trabajo para
**DSY1107 Desarrollo Cloud Native I**: sobre esta app se va a montar el inicio de
sesión con Microsoft usando MSAL.

El backend vive en su propio repositorio: **libro-digital-backend-cloudnative**.
Sin el backend corriendo, esta app no hace nada.

---

## Antes de partir

| Herramienta | Versión | Cómo comprobar |
|---|---|---|
| Node.js | 18 o superior | `node -v` |
| npm | 9 o superior | `npm -v` |
| El backend | levantado y sembrado | http://localhost:8761 con 7 servicios UP |

---

## Levantarlo

```bash
npm install
npm run dev
```

Queda en http://localhost:5173.

Para entrar necesitas usuarios en la base. Si todavía no corriste
`./scripts/seed-usuarios.sh` en el repositorio del backend, hazlo ahora: las
bases arrancan vacías y el login va a fallar sin importar qué escribas.

| Email | Contraseña | Rol | Qué ve |
|---|---|---|---|
| admin@colegio.cl | `11111111-1` | ADMINISTRATIVO | los seis módulos |
| profesor@colegio.cl | `22222222-2` | PROFESOR | libro, comunicaciones, reportes |
| estudiante@colegio.cl | `33333333-3` | ESTUDIANTE | libro, comunicaciones |
| apoderado@colegio.cl | `44444444-4` | APODERADO | libro, comunicaciones |

---

## Estructura

```
src/
├── App.jsx                 rutas + PrivateRoute
├── main.jsx
├── context/
│   └── AuthContext.jsx     sesión actual  ── lo reemplaza MSAL
├── pages/                  una página + su CSS por módulo
│   ├── LoginPage · DashboardPage · UsuariosPage · PerfilPage
│   ├── AcademicoPage · MatriculasPage · LibroDigitalPage
│   └── ComunicacionesPage · ReportesPage
└── services/               un archivo axios por microservicio
    ├── authService.js      login/logout      ── lo reemplaza MSAL
    ├── usuarioService.js · academicoService.js · matriculaService.js
    └── libroDigitalService.js · comunicacionesService.js · reportesService.js
```

Todo el tráfico pasa por el API Gateway en `http://localhost:8080`. Hoy esa URL
está escrita a mano en cada archivo de `services/`; sacarla a una variable de
entorno es parte del trabajo de este semestre.

Stack: React 19 · Vite 8 · React Router DOM 7 · Axios.

---

## Lo que va a cambiar este semestre

La app se queda en React (el docente lo autorizó, aunque el enunciado pida
Angular). Lo único que cambia es la capa de autenticación:

| Archivo | Qué le pasa |
|---|---|
| `main.jsx` | Se envuelve la app en `<MsalProvider>` |
| `context/AuthContext.jsx` | **Se borra.** Lo reemplaza el hook `useMsal()` |
| `services/authService.js` | **Se borra.** MSAL maneja token, sesión y renovación |
| `App.jsx` → `PrivateRoute` | Pasa a usar `useIsAuthenticated()` |
| Los 7 `services/*.js` | Se les quita `getHeaders()`; un interceptor pone el token |
| `LoginPage.jsx` | El formulario se cambia por un botón de Microsoft |
| `PerfilPage.jsx` | Sale el cambio de contraseña |
| `DashboardPage.jsx` | Lee el rol desde el token, no desde `localStorage` |
| Las otras 6 páginas | **No se tocan** |

### Equivalencias con lo que nombra la pauta

La pauta está escrita para Angular. Estas son las piezas equivalentes en React,
y dónde van a vivir:

| La pauta nombra (Angular) | En este proyecto (React) |
|---|---|
| `MsalModule` | `<MsalProvider>` en `src/main.jsx` |
| `MsalService` | hook `useMsal()` |
| `MsalGuard` | `PrivateRoute` con `useIsAuthenticated()` en `src/App.jsx` |
| `MsalInterceptor` | interceptor de axios en `src/services/api.js` |

---

## Cómo trabajamos

| Rama | Quién | Qué toca |
|---|---|---|
| `feature/identidad-msal` | A | MSAL, login, guard, dashboard |
| `feature/bff-security` | B | (backend) |
| `feature/cloud-infra` | C | interceptor, servicios, despliegue |

A y C tocan este repositorio. El único archivo compartido es `src/authConfig.js`:
lo escribe A, lo consume C.

**No subas** los identificadores del tenant de Entra ID. Van por el canal del
grupo, no versionados.
