import { useState, useEffect } from 'react';
import { useNotificationContext } from '@/contexts/notification-context';

export const useOrders = (apiEndpoint, options = {}) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pendientes: 0,
        en_gestion: 0,
        agendadas: 0,
        completadas: 0,
        sin_asignar: 0
    });

    //filtros específicos 
    const [filters, setFilters] = useState({
        plate: '',
        client: '',
        contact: '',
        order_number: '',
        status: '',
        assigned_agent_id: '',
        date_from: '',
        date_to: '',
        sortBy: 'created_at',
        sortOrder: 'DESC'
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false
    });

    const { showToast } = useNotificationContext();

    const loadOrders = async () => {
        try {
            const token = localStorage.getItem('authToken');

            // 🔄 Enviamos solo los filtros definidos
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== '')
                )
            });

            if (options.context) {
                params.append('context', options.context);
            }

            const finalUrl = `${apiEndpoint}?${params}`;
            console.log('🔍 URL construida:', finalUrl);

            const response = await fetch(finalUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setOrders(data.data?.orders || data.orders || []);

                if (data.data?.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: data.data.pagination.total,
                        pages: data.data.pagination.pages,
                        hasNext: data.data.pagination.hasNext,
                        hasPrev: data.data.pagination.hasPrev
                    }));
                }
            } else {
                throw new Error('Error al cargar órdenes');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            showToast('Error al cargar las órdenes', 'error');
        }
    };

    const loadStats = async () => {
        if (!options.statsEndpoint) return;

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(options.statsEndpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.data || data);
            } else {
                throw new Error('Error al cargar estadísticas');
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            showToast('Error al cargar las estadísticas', 'error');
        }
    };

    const loadInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([loadStats(), loadOrders()]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            showToast('Error al cargar los datos iniciales', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        const backendValue = value === 'all' ? '' : value;
        setFilters(prev => ({
            ...prev,
            [key]: backendValue
        }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleSort = (field) => {
        const newOrder = filters.sortBy === field && filters.sortOrder === 'ASC' ? 'DESC' : 'ASC';
        setFilters(prev => ({
            ...prev,
            sortBy: field,
            sortOrder: newOrder
        }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleClearFilters = () => {
        setFilters({
            plate: '',
            client: '',
            contact: '',
            order_number: '',
            status: '',
            assigned_agent_id: '',
            date_from: '',
            date_to: '',
            sortBy: 'created_at',
            sortOrder: 'DESC'
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    useEffect(() => {
        loadOrders();
    }, [filters, pagination.page]);

    useEffect(() => {
        loadInitialData();
    }, []);

    return {
        orders,
        loading,
        stats,
        filters,
        pagination,
        loadOrders,
        loadStats,
        loadInitialData,
        handleFilterChange,
        handleSort,
        handlePageChange,
        handleClearFilters
    };
};
