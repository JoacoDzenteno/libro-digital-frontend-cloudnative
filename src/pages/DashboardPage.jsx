import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import './DashboardPage.css';

const todosLosMenus = [
    { titulo: 'Usuarios', descripcion: 'Gestión de usuarios del sistema', path: '/usuarios', color: '#1a237e', roles: ['ADMINISTRATIVO'] },
    { titulo: 'Académico', descripcion: 'Cursos, asignaturas y carga horaria', path: '/academico', color: '#1565c0', roles: ['ADMINISTRATIVO'] },
    { titulo: 'Matrículas', descripcion: 'Registro de matrículas de estudiantes', path: '/matriculas', color: '#0277bd', roles: ['ADMINISTRATIVO'] },
    { titulo: 'Libro Digital', descripcion: 'Asistencia, calificaciones y anotaciones', path: '/libro', color: '#00695c', roles: ['ADMINISTRATIVO', 'PROFESOR', 'ESTUDIANTE', 'APODERADO'] },
    { titulo: 'Comunicaciones', descripcion: 'Mensajería entre actores', path: '/comunicaciones', color: '#2e7d32', roles: ['ADMINISTRATIVO', 'PROFESOR', 'ESTUDIANTE', 'APODERADO'] },
    { titulo: 'Reportes', descripcion: 'Generación de reportes académicos', path: '/reportes', color: '#e65100', roles: ['ADMINISTRATIVO', 'PROFESOR'] },
];

export default function DashboardPage() {
    const navigate = useNavigate();
    const { instance, accounts } = useMsal(); 
    const [userRole, setUserRole] = useState('');
    
    const activeAccount = accounts[0]; 
    const userName = activeAccount?.name || 'Usuario';

    useEffect(() => {
        if (activeAccount) {
            // Intentamos sacar el rol del ID Token primero
            if (activeAccount.idTokenClaims?.roles) {
                setUserRole(activeAccount.idTokenClaims.roles[0]);
            } else {
                // Si Microsoft lo mandó al Access Token (lo más probable en tu caso), lo extraemos de ahí
                instance.acquireTokenSilent({
                    ...loginRequest,
                    account: activeAccount
                }).then(response => {
                    // Decodificamos el token para leer los permisos
                    const payload = JSON.parse(atob(response.accessToken.split('.')[1]));
                    if (payload.roles) {
                        setUserRole(payload.roles[0]);
                    }
                }).catch(error => console.error("Error obteniendo token:", error));
            }
        }
    }, [activeAccount, instance]);

    const handleLogout = () => {
        instance.logoutRedirect({
            postLogoutRedirectUri: "/login",
        });
    };

    const menusFiltrados = todosLosMenus.filter(item =>
        item.roles.includes(userRole)
    );

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1 className="dashboard-header-title">Colegio Bernardo O'Higgins</h1>
                    <p className="dashboard-header-subtitle">Libro de Clases Digital</p>
                </div>
                <div className="dashboard-user-info">
                    <span
                        className="dashboard-username"
                        onClick={() => navigate('/perfil')}
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {userName} — {userRole}
                    </span>
                    <button className="dashboard-logout-btn" onClick={handleLogout}>
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <main className="dashboard-main">
                <h2 className="dashboard-menu-title">Panel de Control</h2>
                <div className="dashboard-grid">
                    {menusFiltrados.map((item) => (
                        <div
                            key={item.path}
                            className="dashboard-card"
                            style={{ backgroundColor: item.color }}
                            onClick={() => navigate(item.path)}
                        >
                            <h3 className="dashboard-card-title">{item.titulo}</h3>
                            <p className="dashboard-card-desc">{item.descripcion}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}