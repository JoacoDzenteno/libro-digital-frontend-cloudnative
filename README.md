# Libro Digital Frontend - Colegio Bernardo O'Higgins

Frontend del sistema de libro de clases digital desarrollado con React + Vite.

## Tecnologías
- React 18
- Vite 6
- React Router DOM
- Axios
- JavaScript

## Requisitos previos
- Node.js v18+
- npm v9+
- Backend corriendo (ver repositorio libro-digital-backend-zenteno)

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm run dev
```

Accede en: `http://localhost:5173`

## Estructura del proyecto

src/
├── context/          # Contexto de autenticación
│   └── AuthContext.jsx
├── pages/            # Páginas de la aplicación
│   ├── LoginPage.jsx
│   ├── LoginPage.css
│   ├── DashboardPage.jsx
│   ├── DashboardPage.css
│   ├── UsuariosPage.jsx
│   ├── UsuariosPage.css
│   ├── PerfilPage.jsx
│   └── PerfilPage.css
└── services/         # Servicios de comunicación con el backend
├── authService.js
└── usuarioService.js

## Funcionalidades

- Login con JWT
- Dashboard con permisos por rol
- Gestión de usuarios (solo ADMINISTRATIVO)
- Perfil de usuario con cambio de email y contraseña

## Roles y accesos

| Rol | Acceso |
|---|---|
| ADMINISTRATIVO | Dashboard completo (6 módulos) |
| PROFESOR | Libro Digital, Comunicaciones, Reportes |
| ESTUDIANTE | Libro Digital, Comunicaciones |
| APODERADO | Libro Digital, Comunicaciones |

## Credenciales de prueba

| Email | Contraseña | Rol |
|---|---|---|
| admin@colegio.cl | admin123 | ADMINISTRATIVO |
| jperez2@colegio.cl | 98765432-1 | PROFESOR |
| jo.zenteno@colegio.cl | 20052945-6 | ESTUDIANTE |

## Conexión con el backend

Todo el tráfico pasa por el **API Gateway**:

http://localhost:8080

El Gateway enruta automáticamente a cada microservicio:

| Ruta | Microservicio |
|---|---|
| /api/auth/** | ms-usuarios (8081) |
| /api/usuarios/** | ms-usuarios (8081) |
| /api/academico/** | ms-academico (8082) |
| /api/matricula/** | ms-matricula (8083) |
| /api/libro/** | ms-libro-digital (8084) |
| /api/comunicaciones/** | ms-comunicaciones (8085) |
| /api/reportes/** | ms-reportes (8086) |

