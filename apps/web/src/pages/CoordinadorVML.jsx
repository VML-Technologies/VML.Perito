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
import { Input } from '@/components/ui/input';
import { Loader2, Clock, User, Car, Phone, Calendar, AlertCircle, CheckCircle, Play, Pause, Building, MapPin, FileSpreadsheet, Download } from 'lucide-react';
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
        requestStats,
        requestInspectors,
        requestSedesCDA
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

    // Estados para el reporte histórico
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportStartDate, setReportStartDate] = useState('');
    const [reportEndDate, setReportEndDate] = useState('');
    const [downloadingReport, setDownloadingReport] = useState(false);

    // Función para solicitar datos de la cola via WebSocket
    const requestQueueData = useCallback(() => {
        if (isConnected && socket) {
            console.log('🔍 Solicitando datos de la cola via WebSocket con filtros:', filters);
            requestData(filters);
        } else {
            console.warn('⚠️ WebSocket no conectado, no se pueden solicitar datos');
            showToast('Sin conexión WebSocket. Intentando reconectar...', 'warning');
        }
    }, [filters, isConnected, socket, requestData, showToast]);

    // Función para solicitar estadísticas via WebSocket
    const requestStatsData = useCallback(() => {
        if (isConnected && socket) {
            console.log('📊 Solicitando estadísticas via WebSocket');
            requestStats();
        } else {
            console.warn('⚠️ WebSocket no conectado, no se pueden solicitar estadísticas');
        }
    }, [isConnected, socket, requestStats]);

    // Función para solicitar agendamientos en sede via WebSocket
    const requestSedeAppointments = useCallback(() => {
        if (isConnected && socket) {
            console.log('🏢 Solicitando agendamientos en sede via WebSocket');
            // Los agendamientos en sede se incluyen en los datos del coordinador
            requestData({ includeSedeAppointments: true });
        } else {
            console.warn('⚠️ WebSocket no conectado, no se pueden solicitar agendamientos en sede');
            showToast('Sin conexión WebSocket. Intentando reconectar...', 'warning');
        }
    }, [isConnected, socket, requestData, showToast]);

    // useEffect para cargar datos iniciales via WebSocket
    useEffect(() => {
        if (isConnected) {
            console.log('🚀 WebSocket conectado, solicitando datos iniciales');
            // Reiniciar estados de loading
            setLoading(true);
            setLoadingSedeAppointments(true);

            // Solicitar datos
            requestQueueData();
            requestStatsData();
            requestSedeAppointments();
        } else {
            // Si no hay conexión, mantener loading
            setLoading(true);
            setLoadingSedeAppointments(true);
        }
    }, [isConnected, requestQueueData, requestStatsData, requestSedeAppointments]);

    // Cargar inspectores y sedes cuando se abre el modal via WebSocket
    const loadModalData = useCallback(() => {
        if (isConnected && socket) {
            console.log('🔄 Cargando datos del modal via WebSocket...');
            requestInspectors();
            requestSedesCDA();
        } else {
            console.warn('⚠️ WebSocket no conectado, no se pueden cargar datos del modal');
            showToast('Sin conexión WebSocket. No se pueden cargar datos del modal', 'error');
        }
    }, [isConnected, socket, requestInspectors, requestSedesCDA, showToast]);

    // useEffect para manejar datos del WebSocket
    useEffect(() => {
        if (isConnected && coordinatorData) {
            console.log('📊 Datos del coordinador recibidos:', coordinatorData);

            // Actualizar datos de la cola
            if (coordinatorData.queueData) {
                console.log('📊 Actualizando datos de cola:', coordinatorData.queueData);
                setQueueData(coordinatorData.queueData.data);
                setPagination(coordinatorData.queueData.pagination);
                setLoading(false); // ✅ Quitar loading cuando llegan datos de cola
                console.log('✅ Loading de cola desactivado');
            }

            // Actualizar estadísticas
            if (coordinatorData.stats) {
                setStats(coordinatorData.stats);
            }

            // Actualizar agendamientos en sede
            if (coordinatorData.sedeAppointments) {
                console.log('🏢 Actualizando appointments en sede desde WebSocket:', coordinatorData.sedeAppointments);
                setSedeAppointments(coordinatorData.sedeAppointments);
                setLoadingSedeAppointments(false); // ✅ Quitar loading cuando llegan datos de sede
                console.log('✅ Loading de sede desactivado');

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

    // useEffect para manejar eventos de inspectores y sedes
    useEffect(() => {
        if (socket) {
            const handleInspectorsList = (data) => {
                console.log('👥 Lista de inspectores recibida:', data);
                setInspectors(data.data || []);
            };

            const handleSedesCDAList = (data) => {
                console.log('🏢 Lista de sedes CDA recibida:', data);
                setSedes(data.data || []);
            };

            socket.on('inspectorsList', handleInspectorsList);
            socket.on('sedesCDAList', handleSedesCDAList);

            return () => {
                socket.off('inspectorsList', handleInspectorsList);
                socket.off('sedesCDAList', handleSedesCDAList);
            };
        }
    }, [socket]);

    // useEffect para debuggear estados de loading
    useEffect(() => {
        console.log('🔄 Estado de loading actualizado:', { loading, loadingSedeAppointments });
    }, [loading, loadingSedeAppointments]);

    const updateQueueStatus = (id, newStatus) => {
        if (isConnected && socket) {
            console.log(`🔄 Actualizando estado via WebSocket: ${id} -> ${newStatus}`);
            wsUpdateQueueStatus(id, newStatus);
            showToast('Estado actualizado correctamente', 'success');
        } else {
            console.warn('⚠️ WebSocket no conectado, no se puede actualizar estado');
            showToast('Sin conexión WebSocket. No se puede actualizar el estado', 'error');
        }
    };

    // Función para actualizar estado de agendamiento en sede via WebSocket
    const updateSedeAppointmentStatus = (appointmentId, newStatus) => {
        if (isConnected && socket) {
            console.log(`🏢 Actualizando estado de agendamiento via WebSocket: ${appointmentId} -> ${newStatus}`);
            // Emitir evento para actualizar estado de agendamiento
            socket.emit('updateSedeAppointmentStatus', {
                appointmentId,
                status: newStatus
            });
            showToast('Estado actualizado correctamente', 'success');
        } else {
            console.warn('⚠️ WebSocket no conectado, no se puede actualizar estado de agendamiento');
            showToast('Sin conexión WebSocket. No se puede actualizar el estado', 'error');
        }
    };

    // Función para asignar inspector a una cita en sede via WebSocket
    const assignInspectorToSedeAppointment = (appointmentId, inspectorId) => {
        if (isConnected && socket) {
            console.log(`👨‍🔧 Asignando inspector via WebSocket: ${appointmentId} -> ${inspectorId}`);
            // Emitir evento para asignar inspector
            socket.emit('assignInspectorToSedeAppointment', {
                appointmentId,
                inspectorId
            });
            showToast('Inspector asignado correctamente', 'success');
        } else {
            console.warn('⚠️ WebSocket no conectado, no se puede asignar inspector');
            showToast('Sin conexión WebSocket. No se puede asignar inspector', 'error');
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

    // Función para iniciar inspección virtual via WebSocket
    const handleStartInspection = () => {
        if (!selectedInspector || !selectedSede) {
            showToast('Debes seleccionar un inspector y una sede', 'error');
            return;
        }

        if (isConnected && socket) {
            setLoadingModal(true);
            console.log(`🚀 Iniciando inspección virtual via WebSocket: ${selectedOrderId} -> ${selectedInspector}`);

            // Emitir evento para iniciar inspección
            socket.emit('startVirtualInspection', {
                orderId: selectedOrderId,
                inspectorId: selectedInspector,
                sedeId: selectedSede
            });

            showToast('Iniciando inspección...', 'info');

            // Cerrar modal y limpiar estados
            setShowStartInspectionModal(false);
            setSelectedInspector(null);
            setSelectedSede(null);
            setSelectedOrderId(null);
            setLoadingModal(false);
        } else {
            console.warn('⚠️ WebSocket no conectado, no se puede iniciar inspección');
            showToast('Sin conexión WebSocket. No se puede iniciar inspección', 'error');
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

        if (diffInMinutes < 1) return { text: 'Ahora mismo', isOverdue: false };
        if (diffInMinutes < 60) return { text: `${diffInMinutes} min`, isOverdue: diffInMinutes > 10 };

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return { text: `${diffInHours}h ${diffInMinutes % 60}min`, isOverdue: diffInMinutes > 10 };

        const diffInDays = Math.floor(diffInHours / 24);
        return { text: `${diffInDays}d ${diffInHours % 24}h`, isOverdue: diffInMinutes > 10 };
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
        // Solicitar datos actualizados con la nueva página
        if (isConnected) {
            requestData({ ...filters, page: newPage });
        }
    };

    const handleStatusFilterChange = (newStatus) => {
        setFilters(prev => ({ ...prev, estado: newStatus, page: 1 }));
        // Solicitar datos actualizados con el nuevo filtro
        if (isConnected) {
            requestData({ ...filters, estado: newStatus, page: 1 });
        }
    };

    const handleDownloadReport = async () => {
        if (!reportStartDate || !reportEndDate) {
            showToast('Por favor selecciona las fechas de inicio y fin', 'error');
            return;
        }
        
        if (new Date(reportStartDate) > new Date(reportEndDate)) {
            showToast('La fecha de inicio no puede ser mayor a la fecha de fin', 'error');
            return;
        }
        
        try {
            setDownloadingReport(true);
            
            const response = await fetch(`${API_ROUTES.COORDINADOR_CONTACTO.REPORTS.COORDINATOR}?start_date=${reportStartDate}&end_date=${reportEndDate}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            if (response.ok) {
                // Obtener el blob del archivo
                const blob = await response.blob();
                
                // Crear URL temporal para descarga
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                // Obtener nombre del archivo del header Content-Disposition
                const contentDisposition = response.headers.get('Content-Disposition');
                let filename = `reporte-coordinador-vml-${reportStartDate}-${reportEndDate}.xlsx`;
                
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                    if (filenameMatch) {
                        filename = filenameMatch[1];
                    }
                }
                
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                showToast('Reporte descargado exitosamente', 'success');
                setShowReportModal(false);
                setReportStartDate('');
                setReportEndDate('');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al generar el reporte');
            }
        } catch (error) {
            console.error('Error downloading report:', error);
            showToast(error.message || 'Error al descargar el reporte', 'error');
        } finally {
            setDownloadingReport(false);
        }
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
                <div className="flex items-center gap-4">
                    {/* <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => setShowReportModal(true)}
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        Descargar Reporte
                    </Button> */}
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-gray-600">
                            {isConnected ? 'Conectado' : 'Desconectado'}
                        </span>
                    </div>
                </div>
            </div>

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
                                <span className="ml-2 text-sm text-gray-500">Cargando inspecciones virtuales...</span>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Placa y Orden</TableHead>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Tiempo</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {queueData.map((item) => {
                                            const timeInfo = formatTimeAgo(item.tiempo_ingreso);
                                            const isOverdue = timeInfo.isOverdue;

                                            return (
                                                <TableRow key={item.id} className={`${isOverdue ? 'bg-red-200 shadow-red-500 hover:bg-red-300 hover:shadow-red-500' : ''}`}>
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
                                                        <div className="flex gap-1">
                                                            <div className="flex items-center justify-center">
                                                                {
                                                                    isOverdue ? <>
                                                                        <span className="border border-red-600 bg-red-600 rounded-full w-4 h-4 animate-pulse"></span>
                                                                    </> : <>
                                                                        <span className="border border-green-600 bg-green-600 rounded-full w-4 h-4"></span>
                                                                    </>
                                                                }
                                                            </div>
                                                            <span className={`text-sm font-mono px-2 py-1 rounded ${isOverdue
                                                                ? 'bg-red-200 text-black hover:bg-red-300 hover:text-black'
                                                                : 'text-gray-500'
                                                                }`}>
                                                                {timeInfo.text}
                                                            </span>
                                                        </div>
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
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
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
                                <span className="ml-2 text-sm text-gray-500">Cargando inspecciones en sede...</span>
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
                                        {sedeAppointments.map((appointment) => {
                                            // Verificar si la cita está vencida
                                            const scheduledDateTime = new Date(`${new Date(appointment.scheduled_date).toISOString().split('T')[0]} ${appointment.scheduled_time}`);
                                            const currentDateTime = new Date();
                                            const isOverdue = scheduledDateTime < currentDateTime;

                                            return (
                                                <TableRow key={appointment.id} className={`${isOverdue ? 'bg-red-200 shadow-red-500 hover:bg-red-300 hover:shadow-red-500' : ''}`}>
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
                                                                <div className="flex items-center justify-center">
                                                                    {
                                                                        isOverdue ? <>
                                                                            <span className="border border-red-600 bg-red-600 rounded-full w-4 h-4 animate-pulse"></span>
                                                                        </> : <>
                                                                            <span className="border border-green-600 bg-green-600 rounded-full w-4 h-4"></span>
                                                                        </>
                                                                    }
                                                                </div>
                                                                <span className={`text-sm font-mono px-2 py-1 rounded ${isOverdue
                                                                    ? 'bg-red-200 text-black hover:bg-red-300 hover:text-black'
                                                                    : 'text-gray-500'
                                                                    }`}>
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="h-4 w-4 text-gray-500" />
                                                                        <span className="text-sm">
                                                                            {appointment.scheduled_date ?
                                                                                new Date(appointment.scheduled_date).toISOString().split('T')[0] :
                                                                                '-'
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-4 w-4 text-gray-500" />
                                                                        <span className="text-sm">{appointment.scheduled_time || '-'}</span>
                                                                    </div>
                                                                </span>
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
                                                        <div className="flex flex-col gap-1">
                                                            {getSedeStatusBadge(appointment.status)}
                                                            {appointment.statusInspectionOrder && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    Orden: {appointment.statusInspectionOrder}
                                                                </Badge>
                                                            )}
                                                        </div>
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
                                            );
                                        })}
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
                            onClick={() => {
                                if (!selectedSedeInspector) {
                                    showToast('Debes seleccionar un inspector', 'error');
                                    return;
                                }

                                setLoadingAssignModal(true);
                                assignInspectorToSedeAppointment(selectedSedeAppointmentId, selectedSedeInspector);
                                setShowAssignInspectorModal(false);
                                setSelectedSedeInspector(null);
                                setSelectedSedeAppointmentId(null);
                                setLoadingAssignModal(false);
                            }}
                            disabled={!selectedSedeInspector || loadingAssignModal}
                        >
                            {loadingAssignModal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Confirmar Asignación
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de Descarga de Reporte */}
            <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5" />
                            Descargar Reporte Completo
                        </DialogTitle>
                        <DialogDescription>
                            Genera un reporte completo con todas las inspecciones virtuales y agendamientos en sede del período seleccionado.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="startDate">Fecha de Inicio</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={reportStartDate}
                                onChange={(e) => setReportStartDate(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="endDate">Fecha de Fin</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={reportEndDate}
                                onChange={(e) => setReportEndDate(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowReportModal(false)}
                                disabled={downloadingReport}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleDownloadReport}
                                disabled={downloadingReport || !reportStartDate || !reportEndDate}
                                className="flex items-center gap-2"
                            >
                                {downloadingReport ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Generando...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        Descargar XLSX
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* <div className='fixed bottom-0 right-0 border-t border-gray-200 bg-white p-2 text-base font-mono w-full text-center   '>
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
            </div> */}
        </div>
    );
};

export default CoordinadorVML;