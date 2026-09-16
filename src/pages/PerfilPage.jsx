import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import './PerfilPage.css';

export default function PerfilPage() {
    const navigate = useNavigate();
    const { instance, accounts } = useMsal();
    const [userRole, setUserRole] = useState('SIN ROL');

    const activeAccount = accounts[0];
    const userName = activeAccount?.name || 'Usuario';
    const userEmail = activeAccount?.username || 'No disponible';

    useEffect(() => {
        if (activeAccount) {
            if (activeAccount.idTokenClaims?.roles) {
                setUserRole(activeAccount.idTokenClaims.roles[0]);
            } else {
                instance.acquireTokenSilent({
                    ...loginRequest,
                    account: activeAccount
                }).then(response => {
                    const payload = JSON.parse(atob(response.accessToken.split('.')[1]));
                    if (payload.roles) {
                        setUserRole(payload.roles[0]);
                    }
                }).catch(error => console.error("Error obteniendo token:", error));
            }
        }
    }, [activeAccount, instance]);

    return (
        <div className="perfil-container">
            <header className="perfil-header">
                <button className="btn-volver" onClick={() => navigate('/dashboard')}>
                    ← Volver
                </button>
                <h1>Mi Perfil</h1>
                <div></div>
            </header>

            <div className="perfil-content">
                <div className="perfil-info-card">
                    <h2>Información Personal</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Nombre</span>
                            <span className="info-value">{userName}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Email de acceso</span>
                            <span className="info-value">{userEmail}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Rol</span>
                            <span className={`badge badge-${userRole.toLowerCase()}`}>{userRole}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}