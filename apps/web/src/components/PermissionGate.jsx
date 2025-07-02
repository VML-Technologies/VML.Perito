import { usePermissions } from '@/hooks/use-permissions';

export function PermissionGate({ permission, children, fallback = null }) {
    const { hasPermission, loading } = usePermissions();
    if (loading) return null;
    if (hasPermission(permission)) {
        return children;
    }
    return fallback;
} 