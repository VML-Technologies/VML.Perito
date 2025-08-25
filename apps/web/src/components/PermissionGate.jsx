import { useRBAC } from '@/contexts/rbac-context';

export default function PermissionGate({ permission, children, fallback = null }) {
    const { hasPermission } = useRBAC();
    
    if (!hasPermission(permission)) {
        return fallback;
    }
    
    return children;
} 