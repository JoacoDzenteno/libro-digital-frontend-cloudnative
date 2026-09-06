import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <DashboardPage />
                        </PrivateRoute>
                    } />
                    <Route path="/usuarios" element={
                        <PrivateRoute>
                            <UsuariosPage />
                        </PrivateRoute>
                    } />
                    <Route path="/perfil" element={
                        <PrivateRoute>
                            <PerfilPage />
                        </PrivateRoute>
                    } />
                    <Route path="/academico" element={
                        <PrivateRoute>
                            <AcademicoPage />
                        </PrivateRoute>
                    } />
                    <Route path="*" element={<Navigate to="/login" />} />

                    <Route path="/matriculas" element={
                        <PrivateRoute>
                            <MatriculasPage />
                        </PrivateRoute>
                    } />
                    <Route path="/libro" element={
                        <PrivateRoute>
                            <LibroDigitalPage />
                        </PrivateRoute>
                    } />
                    <Route path="/comunicaciones" element={
                        <PrivateRoute>
                            <ComunicacionesPage />
                        </PrivateRoute>
                    } />
                   <Route path="/reportes" element={
                        <PrivateRoute>
                            <ReportesPage />
                        </PrivateRoute>
                    } />

                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;