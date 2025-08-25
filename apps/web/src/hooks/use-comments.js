import { useState, useEffect, useCallback } from 'react';
import { API_ROUTES } from '../config/api';

export const useComments = (orderId) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalComments: 0,
        pageSize: 10
    });

    const fetchComments = useCallback(async (page = 1, limit = 10) => {
        if (!orderId) return;

        try {
            setLoading(true);
            setError('');

            const response = await fetch(
                `${API_ROUTES.INSPECTION_ORDERS.COMMENTS(orderId)}?page=${page}&limit=${limit}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                }
            );

            const data = await response.json();

            if (data.success) {
                setComments(data.data.comments);
                setPagination({
                    currentPage: page,
                    totalPages: Math.ceil(data.data.total / limit),
                    totalComments: data.data.total,
                    pageSize: limit
                });
            } else {
                setError(data.message || 'Error al cargar comentarios');
            }
        } catch (error) {
            console.error('Error cargando comentarios:', error);
            setError('Error de conexión al cargar comentarios');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    const fetchStats = useCallback(async () => {
        if (!orderId) return;

        try {
            const response = await fetch(
                `${API_ROUTES.ORDER_HISTORY.STATS(orderId)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                }
            );

            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    }, [orderId]);

    const createComment = useCallback(async (commentText) => {
        if (!orderId) return null;

        try {
            const response = await fetch(API_ROUTES.INSPECTION_ORDERS.CREATE_COMMENT(orderId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ comentarios: commentText })
            });

            const data = await response.json();

            if (data.success) {
                // Agregar el nuevo comentario al inicio de la lista
                setComments(prev => [data.data, ...prev]);
                setPagination(prev => ({
                    ...prev,
                    totalComments: prev.totalComments + 1
                }));
                
                // Actualizar estadísticas
                fetchStats();
                
                return data.data;
            } else {
                throw new Error(data.message || 'Error al crear comentario');
            }
        } catch (error) {
            console.error('Error creando comentario:', error);
            throw error;
        }
    }, [orderId, fetchStats]);

    const getComment = useCallback(async (commentId) => {
        if (!orderId || !commentId) return null;

        try {
            const response = await fetch(API_ROUTES.INSPECTION_ORDERS.GET_COMMENT(orderId, commentId), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();

            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.message || 'Error al obtener comentario');
            }
        } catch (error) {
            console.error('Error obteniendo comentario:', error);
            throw error;
        }
    }, [orderId]);

    const loadInitialData = useCallback(() => {
        fetchComments(1);
        fetchStats();
    }, [fetchComments, fetchStats]);

    useEffect(() => {
        if (orderId) {
            loadInitialData();
        }
    }, [orderId, loadInitialData]);

    return {
        comments,
        loading,
        error,
        stats,
        pagination,
        fetchComments,
        createComment,
        getComment,
        loadInitialData
    };
};

export const useContactHistory = (orderId) => {
    const [contactHistory, setContactHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);

    const fetchContactHistory = useCallback(async (limit = 10) => {
        if (!orderId) return;

        try {
            setLoading(true);
            setError('');

            const response = await fetch(
                `${API_ROUTES.INSPECTION_ORDERS.CONTACT_HISTORY(orderId)}?limit=${limit}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                }
            );

            const data = await response.json();

            if (data.success) {
                setContactHistory(data.data.contactHistory);
            } else {
                setError(data.message || 'Error al cargar historial de contactos');
            }
        } catch (error) {
            console.error('Error cargando historial de contactos:', error);
            setError('Error de conexión al cargar historial');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    const fetchContactStats = useCallback(async () => {
        if (!orderId) return;

        try {
            const response = await fetch(
                `${API_ROUTES.ORDER_HISTORY.STATS(orderId)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                }
            );

            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error cargando estadísticas de contactos:', error);
        }
    }, [orderId]);

    const loadInitialData = useCallback(() => {
        fetchContactHistory();
        fetchContactStats();
    }, [fetchContactHistory, fetchContactStats]);

    useEffect(() => {
        if (orderId) {
            loadInitialData();
        }
    }, [orderId, loadInitialData]);

    const updateContactData = useCallback(async (contactData) => {
        if (!orderId) return null;

        try {
            const url = API_ROUTES.INSPECTION_ORDERS.UPDATE_CONTACT(orderId);
            console.log('🔗 URL de actualización de contacto:', url);
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(contactData)
            });

            const data = await response.json();

            if (data.success) {
                // Recargar el historial después de actualizar
                fetchContactHistory();
                fetchContactStats();
                return data.data;
            } else {
                throw new Error(data.message || 'Error al actualizar datos de contacto');
            }
        } catch (error) {
            console.error('Error actualizando datos de contacto:', error);
            throw error;
        }
    }, [orderId, fetchContactHistory, fetchContactStats]);

    return {
        contactHistory,
        loading,
        error,
        stats,
        fetchContactHistory,
        updateContactData,
        loadInitialData
    };
};

