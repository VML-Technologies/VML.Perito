import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Clock, User, Car, Phone, Calendar, AlertCircle, CheckCircle, Play, Pause, Building, MapPin } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { useCoordinatorWebSocket } from '@/hooks/use-inspection-queue-websocket';
import { API_ROUTES } from '@/config/api';

const CoordinadorVML = () => {
    const { showToast } = useNotifications();
    const {
        socket,
        isConnected,
        coordinatorData,
        error: wsError,
        requestData,
        updateQueueStatus: wsUpdateQueueStatus,
        requestStats
    } = useCoordinatorWebSocket();

    // Estados para inspecciones virtuales (cola de inspecciones)
    const [queueData, setQueueData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        en_cola: 0,
        en_proceso: 0,
        completadas: 0,
        total: 0
    });
    const [filters, setFilters] = useState({
        estado: 'en_cola',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        items_per_page: 10
    });

    // Estados para inspecciones en sede (agendamientos)
    const [sedeAppointments, setSedeAppointments] = useState([]);
    const [loadingSedeAppointments, setLoadingSedeAppointments] = useState(true);
    const [sedeStats, setSedeStats] = useState({
        pending: 0,
        active: 0,
        completed: 0,
        total: 0
    });

    // Estados del modal de iniciar inspección
    const [showStartInspectionModal, setShowStartInspectionModal] = useState(false);
    const [selectedInspector, setSelectedInspector] = useState(99999);
    const [selectedSede, setSelectedSede] = useState(3);
    const [inspectors, setInspectors] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [loadingModal, setLoadingModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // Estados para asignar inspector a una cita en sede
    const [showAssignInspectorModal, setShowAssignInspectorModal] = useState(false);
    const [selectedSedeAppointmentId, setSelectedSedeAppointmentId] = useState(null);
    const [selectedSedeInspector, setSelectedSedeInspector] = useState(null);
    const [loadingAssignModal, setLoadingAssignModal] = useState(false);

    const fetchQueueData = useCallback(async () => {
        try {
            setLoading(true);
            console.log('🔍 Solicitando datos de la cola con filtros:', filters);

            const token = localStorage.getItem('authToken');
            console.log('🔑 Token presente:', !!token);

            const response = await fetch(`${API_ROUTES.INSPECTION_QUEUE.GET_QUEUE}?${new URLSearchParams(filters)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('📡 Respuesta del servidor:', response.status, response.statusText);

            if (!response.ok) {
                throw new Error('Error al obtener datos de la cola');
            }

            const data = await response.json();
            console.log('📊 Datos recibidos:', data);

            setQueueData(data.data);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching queue data:', error);
            showToast('Error al cargar la cola de inspecciones', 'error');
        } finally {
            setLoading(false);
        }
    }, [filters, showToast]);

    const fetchStats = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.INSPECTION_QUEUE.GET_STATS, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    // Función para cargar agendamientos en sede
    const fetchSedeAppointments = useCallback(async () => {
        try {
            setLoadingSedeAppointments(true);
            const token = localStorage.getItem('authToken');

            // Usar la nueva ruta específica para coordinador que filtra por status 1,2,3
            const response = await fetch(API_ROUTES.APPOINTMENTS.SEDE_COORDINATOR, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('🏢 Appointments en sede recibidos:', data.data);
                setSedeAppointments(data.data);

                // Calcular estadísticas
                const stats = {
                    pending: data.data.filter(a => a.status === 'pending').length,
                    active: data.data.filter(a => a.status === 'active').length,
                    completed: data.data.filter(a => a.status === 'completed').length,
                    total: data.data.length
                };
                setSedeStats(stats);
            } else {
                throw new Error('Error al obtener agendamientos en sede');
            }
        } catch (error) {
            console.error('Error fetching sede appointments:', error);
            showToast('Error al cargar agendamientos en sede', 'error');
        } finally {
            setLoadingSedeAppointments(false);
        }
    }, [showToast]);

    // useEffect para cargar datos iniciales
    useEffect(() => {
        fetchQueueData();
        fetchStats();
        fetchSedeAppointments();
    }, [fetchQueueData, fetchStats, fetchSedeAppointments]);

    // Cargar inspectores y sedes cuando se abre el modal
    const loadModalData = useCallback(async () => {
        try {
            console.log('🔄 Cargando datos del modal...');
            const token = localStorage.getItem('authToken');
            console.log('🔑 Token disponible:', !!token);

            // Verificar el token decodificándolo para ver los roles
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    console.log('👤 Usuario actual:', payload);
                    console.log('🎭 Roles del usuario:', payload.roles);
                } catch (e) {
                    console.log('⚠️ No se pudo decodificar el token');
                }
            }

            // Cargar inspectores
            console.log('👥 Cargando inspectores desde:', API_ROUTES.USERS.INSPECTORS);
            const inspectorsResponse = await fetch(API_ROUTES.USERS.INSPECTORS, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('📊 Respuesta inspectores:', inspectorsResponse.status, inspectorsResponse.statusText);

            if (inspectorsResponse.ok) {
                const inspectorsData = await inspectorsResponse.json();
                console.log('👥 Datos de inspectores:', inspectorsData);
                setInspectors(inspectorsData.data || []);
            } else {
                const errorText = await inspectorsResponse.text();
                console.error('❌ Error cargando inspectores:', errorText);
                console.error('❌ Status:', inspectorsResponse.status);
                console.error('❌ Headers:', Object.fromEntries(inspectorsResponse.headers.entries()));
            }

            // Cargar sedes CDA
            console.log('🏢 Cargando sedes CDA desde:', API_ROUTES.SEDES.CDA);
            const sedesResponse = await fetch(API_ROUTES.SEDES.CDA, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('📊 Respuesta sedes:', sedesResponse.status, sedesResponse.statusText);

            if (sedesResponse.ok) {
                const sedesData = await sedesResponse.json();
                console.log('🏢 Datos de sedes:', sedesData);
                setSedes(sedesData.data || []);
            } else {
                const errorText = await sedesResponse.text();
                console.error('❌ Error cargando sedes:', errorText);
                console.error('❌ Status:', sedesResponse.status);
                console.error('❌ Headers:', Object.fromEntries(sedesResponse.headers.entries()));
            }
        } catch (error) {
            console.error('❌ Error cargando datos del modal:', error);
            showToast('Error al cargar datos del modal', 'error');
        }
    }, [showToast]);

    // useEffect para manejar datos del WebSocket
    useEffect(() => {
        if (isConnected && coordinatorData) {
            console.log('📊 Datos del coordinador recibidos:', coordinatorData);
            if (coordinatorData.queueData) {
                setQueueData(coordinatorData.queueData.data);
                setPagination(coordinatorData.queueData.pagination);
            }
            if (coordinatorData.stats) {
                setStats(coordinatorData.stats);
            }
            // Si hay nuevos agendamientos en sede, actualizar la tabla
            if (coordinatorData.sedeAppointments) {
                console.log('🏢 Actualizando appointments en sede desde WebSocket:', coordinatorData.sedeAppointments);
                setSedeAppointments(coordinatorData.sedeAppointments);
                // Recalcular estadísticas
                const stats = {
                    pending: coordinatorData.sedeAppointments.filter(a => a.status === 'pending').length,
                    active: coordinatorData.sedeAppointments.filter(a => a.status === 'active').length,
                    completed: coordinatorData.sedeAppointments.filter(a => a.status === 'completed').length,
                    total: coordinatorData.sedeAppointments.length
                };
                setSedeStats(stats);
            }
        }
    }, [isConnected, coordinatorData]);

    const updateQueueStatus = async (id, newStatus) => {
        try {
            // Usar WebSocket para actualizar estado
            if (isConnected) {
                wsUpdateQueueStatus(id, newStatus);
                showToast('Estado actualizado correctamente', 'success');
            } else {
                // Fallback a API si no hay WebSocket
                const response = await fetch(`${API_ROUTES.INSPECTION_QUEUE.UPDATE_STATUS(id)}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({ estado: newStatus })
                });

                if (!response.ok) {
                    throw new Error('Error al actualizar el estado');
                }

                showToast('Estado actualizado correctamente', 'success');
                fetchQueueData();
                fetchStats();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Error al actualizar el estado', 'error');
        }
    };

    // Función para actualizar estado de agendamiento en sede
    const updateSedeAppointmentStatus = async (appointmentId, newStatus) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_ROUTES.APPOINTMENTS.UPDATE(appointmentId)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el estado');
            }

            showToast('Estado actualizado correctamente', 'success');
            fetchSedeAppointments();
        } catch (error) {
            console.error('Error updating sede appointment status:', error);
            showToast('Error al actualizar el estado', 'error');
        }
    };

    // Función para asignar inspector a una cita en sede
    const assignInspectorToSedeAppointment = async (appointmentId, inspectorId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_ROUTES.APPOINTMENTS.ASSIGN_INSPECTOR(appointmentId)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ inspector_id: inspectorId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al asignar inspector');
            }

            showToast('Inspector asignado correctamente', 'success');
            fetchSedeAppointments();
        } catch (error) {
            console.error('Error asignando inspector:', error);
            showToast(error.message || 'Error al asignar inspector', 'error');
        }
    };

    // Función para abrir modal de iniciar inspección
    const handleOpenStartInspectionModal = (orderId) => {
        console.log('🚀 Abriendo modal para orden:', orderId);
        setSelectedOrderId(orderId);
        setShowStartInspectionModal(true);
        console.log('📞 Llamando loadModalData...');
        loadModalData();
    };

    // Función para iniciar inspección virtual
    const handleStartInspection = async () => {
        if (!selectedInspector || !selectedSede) {
            showToast('Debes seleccionar un inspector y una sede', 'error');
            return;
        }

        try {
            setLoadingModal(true);
            const token = localStorage.getItem('authToken');

            const response = await fetch(API_ROUTES.INSPECTION_ORDERS.START_VIRTUAL_INSPECTION(selectedOrderId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    inspector_id: selectedInspector,
                    sede_id: selectedSede
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al iniciar inspección');
            }

            const data = await response.json();
            showToast('Inspección iniciada exitosamente', 'success');

            // Cerrar modal y limpiar estados
            setShowStartInspectionModal(false);
            setSelectedInspector(null);
            setSelectedSede(null);
            setSelectedOrderId(null);

            // Actualizar datos
            fetchQueueData();
            fetchStats();

        } catch (error) {
            console.error('Error iniciando inspección:', error);
            showToast(error.message || 'Error al iniciar inspección', 'error');
        } finally {
            setLoadingModal(false);
        }
    };

    // Función para iniciar inspección en sede
    const handleStartSedeInspection = (appointment) => {
        if (appointment.session_id) {
            const base = (import.meta.env.VITE_INSPECTYA_URL || '').replace(/\/$/, '') || window.location.origin;
            const inspectionUrl = `${base}/inspector/view/${appointment.session_id}`;
            console.log('🚀 Abriendo inspección en sede:', inspectionUrl);
            window.open(inspectionUrl, '_blank');
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            en_cola: { variant: 'secondary', icon: Clock, text: 'En Cola' },
            en_proceso: { variant: 'default', icon: Play, text: 'En Proceso' },
            completada: { variant: 'success', icon: CheckCircle, text: 'Completada' },
            cancelada: { variant: 'destructive', icon: AlertCircle, text: 'Cancelada' }
        };

        const config = statusConfig[status] || statusConfig.en_cola;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex gap-1">
                <Icon className="h-3 w-3" />
                {config.text}
            </Badge>
        );
    };

    const getSedeStatusBadge = (status) => {
        const statusConfig = {
            pending: { variant: 'secondary', icon: Clock, text: 'Pendiente' },
            active: { variant: 'default', icon: Play, text: 'Activa' },
            completed: { variant: 'success', icon: CheckCircle, text: 'Completada' },
            cancelled: { variant: 'destructive', icon: AlertCircle, text: 'Cancelada' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {config.text}
            </Badge>
        );
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'Ahora mismo';
        if (diffInMinutes < 60) return `${diffInMinutes} min`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ${diffInMinutes % 60}min`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ${diffInHours % 24}h`;
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleStatusFilterChange = (newStatus) => {
        setFilters(prev => ({ ...prev, estado: newStatus, page: 1 }));
    };

    const CardComponent = ({ name, value, icon: Icon, valueColor }) => {
        return (
            <Card className="w-full">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{name}</p>
                            <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
                        </div>
                        <Icon className={`h-8 w-8 ${valueColor}`} />
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Coordinador VML</h1>
                    <p className="text-gray-600">Gestión de cola de inspecciones</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600">
                        {isConnected ? 'Conectado' : 'Desconectado'}
                    </span>
                </div>
            </div>

            {/* <div className='border border-red-500 flex justify-between gap-2'>
                <div className="w-full flex justify-between gap-2">
                    {
                        [
                            { name: 'En Cola', value: stats.en_cola, icon: Clock, valueColor: 'text-blue-600' },
                            { name: 'En Proceso', value: stats.en_proceso, icon: Play, valueColor: 'text-purple-600' },
                            { name: 'Completadas', value: stats.completadas, icon: CheckCircle, valueColor: 'text-green-600' },
                            { name: 'Total', value: stats.total, icon: Car, valueColor: 'text-gray-600' },
                        ].map((card) => (
                            <CardComponent key={card.name} name={card.name} value={card.value} icon={card.icon} valueColor={card.valueColor} />
                        ))
                    }
                </div>

                <div className="w-full flex justify-between gap-2">
                    {
                        [
                            { name: 'Pendientes', value: sedeStats.pending, icon: Clock, valueColor: 'text-yellow-600' },
                            { name: 'Activas', value: sedeStats.active, icon: Play, valueColor: 'text-purple-600' },
                            { name: 'Completadas', value: sedeStats.completed, icon: CheckCircle, valueColor: 'text-green-600' },
                            { name: 'Total', value: sedeStats.total, icon: Car, valueColor: 'text-gray-600' },
                        ].map((card) => (
                            <CardComponent key={card.name} name={card.name} value={card.value} icon={card.icon} valueColor={card.valueColor} />
                        ))
                    }
                </div>
            </div> */}

            <div className='flex justify-between gap-2'>
                {/* Queue Table - Inspecciones Virtuales */}
                <Card className='w-full'>
                    <CardHeader>
                        <CardTitle>Inspecciones Virtuales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Placa y Orden</TableHead>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Inspector</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {queueData.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <Car className="h-4 w-4 text-gray-500" />
                                                            <span className="font-medium">Placa: {item.placa}</span>
                                                        </div>
                                                        <span className="font-mono text-sm">Orden: {item.numero_orden}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <p className="font-medium">{item.nombre_cliente}</p>
                                                            {item.inspectionOrder?.celular_contacto && (
                                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                                    <Phone className="h-3 w-3" />
                                                                    {item.inspectionOrder.celular_contacto}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(item.estado)}
                                                    <div className="flex gap-2">
                                                        <span className="text-sm font-mono ps-2">
                                                            {formatTimeAgo(item.tiempo_ingreso)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {item.inspector ? (
                                                        <span className="text-sm">{item.inspector.name}</span>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">Sin asignar</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        {item.estado === 'en_cola' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleOpenStartInspectionModal(item.inspectionOrder?.id)}
                                                            >
                                                                <Play className="h-4 w-4 mr-1" />
                                                                Iniciar
                                                            </Button>
                                                        )}
                                                        {item.estado === 'en_proceso' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => updateQueueStatus(item.id, 'completada')}
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Completar
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {pagination.total_pages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-sm text-gray-700">
                                            Mostrando {((pagination.current_page - 1) * pagination.items_per_page) + 1} a{' '}
                                            {Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items)} de{' '}
                                            {pagination.total_items} resultados
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={pagination.current_page === 1}
                                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                            >
                                                Anterior
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={pagination.current_page === pagination.total_pages}
                                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                            >
                                                Siguiente
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Table - Inspecciones en Sede */}
                <Card className='w-full'>
                    <CardHeader>
                        <CardTitle>Inspecciones en Sede</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingSedeAppointments ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Placa y Sede</TableHead>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Fecha Programada</TableHead>
                                            <TableHead>Inspector Asignado</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sedeAppointments.map((appointment) => (
                                            <TableRow key={appointment.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <Car className="h-4 w-4 text-gray-500" />
                                                            <span className="font-medium">{appointment.inspectionOrder?.placa}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Building className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm">{appointment.sede?.name}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div>
                                                            <p className="font-medium">{appointment.inspectionOrder?.nombre_contacto}</p>
                                                            {appointment.inspectionOrder?.celular_contacto && (
                                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                                    <Phone className="h-3 w-3" />
                                                                    {appointment.inspectionOrder.celular_contacto}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm">
                                                                {appointment.scheduled_date ?
                                                                    new Date(appointment.scheduled_date).toLocaleDateString('es-ES') :
                                                                    '-'
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm">{appointment.scheduled_time || '-'}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {appointment.user && appointment.user.roles && 
                                                     appointment.user.roles.some(role => role.name.toLowerCase() === 'inspector') ? (
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-gray-500" />
                                                            <div>
                                                                <p className="font-medium text-sm">{appointment.user.name}</p>
                                                                <p className="text-xs text-gray-500">{appointment.user.email}</p>
                                                                <div className="flex gap-1 mt-1">
                                                                    {appointment.user.roles.map((role, index) => (
                                                                        <Badge key={index} variant="outline" className="text-xs">
                                                                            {role.name}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">Sin asignar</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getSedeStatusBadge(appointment.status)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        {appointment.status === 'pending' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedSedeAppointmentId(appointment.id);
                                                                    setShowAssignInspectorModal(true);
                                                                    loadModalData(); // Cargar inspectores
                                                                }}
                                                            >
                                                                <Play className="h-4 w-4 mr-1" />
                                                                Asignar
                                                            </Button>
                                                        )}
                                                        {appointment.status === 'active' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleStartSedeInspection(appointment)}
                                                                    disabled={!appointment.session_id}
                                                                >
                                                                    <Play className="h-4 w-4 mr-1" />
                                                                    Iniciar
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => updateSedeAppointmentStatus(appointment.id, 'completed')}
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                    Completar
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dialog de Iniciar Inspección */}
            <Dialog open={showStartInspectionModal} onOpenChange={setShowStartInspectionModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Iniciar Inspección Virtual</DialogTitle>
                        <DialogDescription>
                            Selecciona un inspector para iniciar la inspección virtual.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Selector de Inspector */}
                        <div className="space-y-2">
                            <Label htmlFor="inspector">Inspector Asignado</Label>
                            <Select value={selectedInspector} onValueChange={setSelectedInspector}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar inspector" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={99999}>Selecciona un inspector</SelectItem>
                                    {inspectors.map(inspector => (
                                        <SelectItem key={inspector.id} value={inspector.id}>
                                            {inspector.name} - {inspector.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Selector de Sede */}
                        <div className="space-y-2 hidden">
                            <Label htmlFor="sede">Sede CDA</Label>
                            <Select value={selectedSede} onValueChange={setSelectedSede}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar sede CDA" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sedes.map(sede => (
                                        <SelectItem key={sede.id} value={sede.id}>
                                            {sede.name} - {sede.city?.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowStartInspectionModal(false)}
                            disabled={loadingModal}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleStartInspection}
                            disabled={!selectedInspector || !selectedSede || loadingModal || selectedInspector == 99999}
                        >
                            {loadingModal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog para asignar inspector a una cita en sede */}
            <Dialog open={showAssignInspectorModal} onOpenChange={setShowAssignInspectorModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Asignar Inspector a la Cita</DialogTitle>
                        <DialogDescription>
                            Selecciona un inspector para asignar a la cita de inspección en sede.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Selector de Inspector */}
                        <div className="space-y-2">
                            <Label htmlFor="assignInspector">Inspector</Label>
                            <Select value={selectedSedeInspector} onValueChange={setSelectedSedeInspector}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar inspector" />
                                </SelectTrigger>
                                <SelectContent>
                                    {inspectors.map(inspector => (
                                        <SelectItem key={inspector.id} value={inspector.id}>
                                            {inspector.name} - {inspector.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowAssignInspectorModal(false);
                                setSelectedSedeInspector(null);
                                setSelectedSedeAppointmentId(null);
                            }}
                            disabled={loadingAssignModal}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!selectedSedeInspector) {
                                    showToast('Debes seleccionar un inspector', 'error');
                                    return;
                                }

                                setLoadingAssignModal(true);
                                try {
                                    await assignInspectorToSedeAppointment(selectedSedeAppointmentId, selectedSedeInspector);
                                    setShowAssignInspectorModal(false);
                                    setSelectedSedeInspector(null);
                                    setSelectedSedeAppointmentId(null);
                                } catch (error) {
                                    console.error('Error en asignación:', error);
                                } finally {
                                    setLoadingAssignModal(false);
                                }
                            }}
                            disabled={!selectedSedeInspector || loadingAssignModal}
                        >
                            {loadingAssignModal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Confirmar Asignación
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className='fixed bottom-0 right-0 border-t border-gray-200 bg-white p-2 text-base font-mono w-full text-center   '>
                <marquee behavior="scroll" direction="left" scrollamount="10" >
                <div className='flex justify-between gap-2 text-center w-1/2 '>
                        <span>
                            {new Date().toLocaleDateString()}  {new Date().toLocaleTimeString()}
                        </span>
                        <span>
                            {stats.en_cola} en cola
                        </span>
                        <span>
                            {stats.en_proceso} en proceso
                        </span>
                        <span>
                            {stats.completadas} completadas
                        </span>
                        <span>
                            {stats.total} total
                        </span>
                    </div>
                </marquee>
            </div>
        </div>
    );
};

export default CoordinadorVML;