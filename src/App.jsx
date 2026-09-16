import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser"; // <-- Importamos los estados de MSAL

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsuariosPage from './pages/UsuariosPage';
import PerfilPage from './pages/PerfilPage';
import AcademicoPage from './pages/AcademicoPage';
import MatriculasPage from './pages/MatriculasPage';
import LibroDigitalPage from './pages/LibroDigitalPage';
import ComunicacionesPage from './pages/ComunicacionesPage';
import ReportesPage from './pages/ReportesPage';

const PrivateRoute = ({ children }) => {
    return (
        <>
            <AuthenticatedTemplate>
                {children}
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <Navigate to="/login" replace />
            </UnauthenticatedTemplate>
        </>
    );
};

function App() {
    const { inProgress } = useMsal();

    // LA MAGIA ESTÁ AQUÍ:
    // Si MSAL está procesando el token (los números raros en la URL), pausamos React.
    // Mostramos un mensaje de carga para que MSAL tenga tiempo de hacer su trabajo.
    if (inProgress !== InteractionStatus.None) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
                <h2>Validando sesión con Microsoft...</h2>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={
                    <>
                        <UnauthenticatedTemplate>
                            <LoginPage />
                        </UnauthenticatedTemplate>
                        <AuthenticatedTemplate>
                            <Navigate to="/dashboard" replace />
                        </AuthenticatedTemplate>
                    </>
                } />
                
                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/usuarios" element={<PrivateRoute><UsuariosPage /></PrivateRoute>} />
                <Route path="/perfil" element={<PrivateRoute><PerfilPage /></PrivateRoute>} />
                <Route path="/academico" element={<PrivateRoute><AcademicoPage /></PrivateRoute>} />
                <Route path="/matriculas" element={<PrivateRoute><MatriculasPage /></PrivateRoute>} />
                <Route path="/libro" element={<PrivateRoute><LibroDigitalPage /></PrivateRoute>} />
                <Route path="/comunicaciones" element={<PrivateRoute><ComunicacionesPage /></PrivateRoute>} />
                <Route path="/reportes" element={<PrivateRoute><ReportesPage /></PrivateRoute>} />
                
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;