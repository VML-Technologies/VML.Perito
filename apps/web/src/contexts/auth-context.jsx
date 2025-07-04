import { createContext, useContext, useState, useEffect } from 'react';
import { API_ROUTES } from '@/config/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verificar si hay una sesión válida al cargar la aplicación
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('authToken');

            if (token) {
                const response = await fetch(API_ROUTES.AUTH.VERIFY, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                    setIsAuthenticated(true);
                } else {
                    logout();
                }
            }
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await fetch(API_ROUTES.AUTH.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authToken', data.token);
                setUser(data.user);
                setIsAuthenticated(true);
                return { success: true };
            } else {
                const error = await response.json();
                return { success: false, error: error.message };
            }
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                await fetch(API_ROUTES.AUTH.LOGOUT, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            localStorage.removeItem('authToken');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 