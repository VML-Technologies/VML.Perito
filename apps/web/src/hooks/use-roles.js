import { useRBAC } from '@/contexts/rbac-context';

export function useRoles() {
    const { roles, hasRole, loading } = useRBAC();
    return { roles, hasRole, loading };
} 