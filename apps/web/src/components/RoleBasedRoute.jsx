import { Navigate } from 'react-router-dom';
import { useRoles } from '@/hooks/use-roles';

export function RoleBasedRoute({ requiredRoles = [], children, fallback = null }) {
    const { hasRole, loading } = useRoles();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (requiredRoles.some(role => hasRole(role))) {
        return children;
    }

    return fallback || <Navigate to="/dashboard" replace />;
} 