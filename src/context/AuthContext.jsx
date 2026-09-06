import { createContext, useState, useContext } from 'react';
import { login as loginService, logout as logoutService, getCurrentUser } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getCurrentUser());

    const login = async (email, password) => {
        const data = await loginService(email, password);
        setUser(data);
        return data;
    };

    const logout = () => {
        logoutService();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);