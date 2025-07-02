import { Navigate } from 'react-router-dom';
import { useRoles } from '@/hooks/use-roles';

export function RoleBasedRoute({ requiredRoles = [], children, fallback = null }) {
    const { hasRole, loading } = useRoles();
    if (loading) return null;
    if (requiredRoles.some(role => hasRole(role))) {
        return children;
    }
    return fallback || <Navigate to="/" replace />;
} 