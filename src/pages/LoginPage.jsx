import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import './LoginPage.css';

export default function LoginPage() {
    const { instance } = useMsal();

    const handleLogin = () => {
        instance.loginRedirect(loginRequest);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Colegio Bernardo O'Higgins</h2>
                <h3 className="login-subtitle">Libro de Clases Digital</h3>
                
                {/* Eliminamos el form con los inputs y dejamos solo el botón */}
                <button 
                    className="login-button" 
                    onClick={handleLogin}
                >
                    Iniciar sesión con Microsoft
                </button>
            </div>
        </div>
    );
}