import { useRBAC } from '@/contexts/rbac-context';

export function usePermissions() {
    const { permissions, hasPermission, loading } = useRBAC();
    return { permissions, hasPermission, loading };
} 