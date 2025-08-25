import { createContext, useContext, useEffect, useState } from 'react';
import { API_ROUTES } from '@/config/api';
import { useAuth } from './auth-context';

const RBACContext = createContext(null);

export function RBACProvider({ children }) {
    const { user, isAuthenticated } = useAuth();
    const [permissions, setPermissions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPermissions() {
            setLoading(true);
            if (!isAuthenticated || !user) {
                setPermissions([]);
                setRoles([]);
                setLoading(false);
                return;
            }
            console.log(user)
            try {
                const token = localStorage.getItem('authToken');
                const res = await fetch(API_ROUTES.USERS.PROFILE, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setPermissions(data.permissions || []);
                    // Extraer solo los nombres de los roles
                    const roleNames = (data.roles || []).map(role =>
                        typeof role == 'string' ? role : role.name
                    );
                    setRoles(roleNames);
                } else {
                    setPermissions([]);
                    setRoles([]);
                }
            } catch (e) {
                setPermissions([]);
                setRoles([]);
            } finally {
                setLoading(false);
            }
        }
        fetchPermissions();
    }, [isAuthenticated, user]);

    // Métodos de utilidad
    const hasPermission = (perm) => permissions.includes(perm);
    const hasRole = (role) => roles.includes(role);

    return (
        <RBACContext.Provider value={{ permissions, roles, hasPermission, hasRole, loading }}>
            {children}
        </RBACContext.Provider>
    );
}

export function useRBAC() {
    const context = useContext(RBACContext);
    if (!context) throw new Error('useRBAC debe usarse dentro de RBACProvider');
    return context;
} 