import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Search, Car, User, Phone, Mail, Calendar, Clock, Play, RefreshCw, AlertTriangle, CheckCircle, Copy, Download, FileSpreadsheet } from 'lucide-react';
import { useNotificationContext } from '@/contexts/notification-context';
import { API_ROUTES } from '@/config/api';
import { useAuth } from '@/contexts/auth-context';

const InspectorAliado = () => {
    const { user } = useAuth();
    const { showToast } = useNotificationContext();
    
    // Estados para el formulario de búsqueda
    const [plate, setPlate] = useState('');
    const [searching, setSearching] = useState(false);
    const [inspectionOrder, setInspectionOrder] = useState(null);
    const [orderNotFound, setOrderNotFound] = useState(false);
    
    // Estados para el agendamiento
    const [waitTime, setWaitTime] = useState('');
    const [creatingAppointment, setCreatingAppointment] = useState(false);
    
    // Estados para la tabla de agendamientos
    const [appointments, setAppointments] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Estados para el reporte histórico
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportStartDate, setReportStartDate] = useState('');
    const [reportEndDate, setReportEndDate] = useState('');
    const [downloadingReport, setDownloadingReport] = useState(false);
    

    
    // Generar opciones de tiempo de espera
    const generateWaitTimeOptions = () => {
        const options = [];
        const inicio = 20;
        const fin = 140;
        const intervalo = 5;
        
        for (let i = inicio; i <= fin; i += intervalo) {
            options.push({
                value: i.toString(),
                label: `+${i} minutos`
            });
        }
        
        return options;
    };
    
    const waitTimeOptions = generateWaitTimeOptions();
    
    // Función para generar session_id
    const generateSessionId = () => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 10);
        return `session_${timestamp}_${random}`;
    };
    

    
    // Cargar agendamientos existentes
    useEffect(() => {
        if (user?.sede_id) {
            fetchAppointments();
        }
    }, [user?.sede_id]);
    
    const fetchAppointments = async () => {
        try {
            setLoadingAppointments(true);
            const response = await fetch(`${API_ROUTES.APPOINTMENTS.SEDE_INSPECTOR_ALIADO}?sede_id=${user.sede_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('🏢 Appointments para Inspector Aliado recibidos:', data.data);
                setAppointments(data.data || []);
            } else {
                throw new Error('Error al obtener agendamientos');
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            showToast('Error al cargar los agendamientos', 'error');
        } finally {
            setLoadingAppointments(false);
        }
    };
    
    const handleSearchOrder = async () => {
        if (!plate.trim()) {
            showToast('Por favor ingresa una placa', 'error');
            return;
        }
        
        try {
            setSearching(true);
            setOrderNotFound(false);
            setInspectionOrder(null);
            
            const response = await fetch(`${API_ROUTES.INSPECTION_ORDERS.SEARCH_BY_PLATE}?plate=${encodeURIComponent(plate.trim())}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.data) {
                    setInspectionOrder(data.data);
                } else {
                    setOrderNotFound(true);
                }
            } else {
                setOrderNotFound(true);
            }
        } catch (error) {
            console.error('Error searching order:', error);
            showToast('Error al buscar la orden', 'error');
        } finally {
            setSearching(false);
        }
    };
    
    const handleCreateAppointment = async () => {
        if (!inspectionOrder || !waitTime) {
            showToast('Por favor completa todos los campos', 'error');
            return;
        }
        
        try {
            setCreatingAppointment(true);
            
            // Calcular tiempo de agendamiento
            const now = new Date();
            const appointmentTime = new Date(now.getTime() + (parseInt(waitTime) * 60 * 1000));
            
            const appointmentData = {
                sede_id: user.sede_id,
                inspection_order_id: inspectionOrder.id,
                user_id: user.id,
                scheduled_date: appointmentTime.toISOString().split('T')[0],
                scheduled_time: appointmentTime.toTimeString().split(' ')[0],
                session_id: generateSessionId(),
                status: 'pending'
            };
            
            const response = await fetch(API_ROUTES.INSPECTOR_ALIADO.APPOINTMENTS.CREATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(appointmentData)
            });
            
            if (response.ok) {
                const data = await response.json();
                showToast('Agendamiento creado exitosamente', 'success');
                
                // Limpiar formulario
                setPlate('');
                setInspectionOrder(null);
                setOrderNotFound(false);
                setWaitTime('');
                
                // Recargar agendamientos
                fetchAppointments();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear el agendamiento');
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
            showToast(error.message || 'Error al crear el agendamiento', 'error');
        } finally {
            setCreatingAppointment(false);
        }
    };

    const handleCopyLink = async (appointment) => {
        if (appointment.session_id) {
            const base = (import.meta.env.VITE_INSPECTYA_URL || '').replace(/\/$/, '') || window.location.origin;
            const inspectionUrl = `${base}/inspection/${appointment.session_id}`;
            
            try {
                // Verificar si navigator.clipboard está disponible
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(inspectionUrl);
                    showToast('Enlace copiado al portapapeles', 'success');
                } else {
                    // Fallback para navegadores que no soportan clipboard API
                    const textArea = document.createElement('textarea');
                    textArea.value = inspectionUrl;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    
                    try {
                        document.execCommand('copy');
                        showToast('Enlace copiado al portapapeles', 'success');
                    } catch (fallbackError) {
                        console.error('Error with fallback copy:', fallbackError);
                        showToast('Error al copiar el enlace', 'error');
                    } finally {
                        document.body.removeChild(textArea);
                    }
                }
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                showToast('Error al copiar el enlace', 'error');
            }
        }
    };
    
    const handleRefreshAppointments = async () => {
        setRefreshing(true);
        await fetchAppointments();
        setRefreshing(false);
    };
    
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800">Activa</Badge>;
            case 'completed':
                return <Badge variant="default" className="bg-blue-100 text-blue-800">Completada</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelada</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
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
            
            const response = await fetch(`${API_ROUTES.INSPECTOR_ALIADO.REPORTS.HISTORICAL}?sede_id=${user.sede_id}&start_date=${reportStartDate}&end_date=${reportEndDate}`, {
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
                let filename = `reporte-historico-cda-${reportStartDate}-${reportEndDate}.xlsx`;
                
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
    
    return (
        <div className="">
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Inspector Aliado</h1>
                        <p className="text-gray-600">Gestión de inspecciones y agendamientos</p>
                    </div>
                    <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <FileSpreadsheet className="h-4 w-4" />
                                Descargar Reporte
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Download className="h-5 w-5" />
                                    Descargar Reporte Histórico
                                </DialogTitle>
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
                </div>
            </div>
            
            <div className="flex gap-2">
                {/* Parte Izquierda - Formulario de Búsqueda */}
                <div className="w-3/12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Search className="h-5 w-5 mr-2" />
                                Buscar Orden de Inspección
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="plate">Placa del Vehículo</Label>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        id="plate"
                                        value={plate}
                                        onChange={(e) => setPlate(e.target.value.toUpperCase())}
                                        placeholder="Ej: ABC123"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearchOrder()}
                                    />
                                    <Button 
                                        onClick={handleSearchOrder}
                                        disabled={searching || !plate.trim()}
                                    >
                                        {searching ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Search className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Resultado de búsqueda */}
                            {orderNotFound && (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        No se encontró una orden de inspección para la placa "{plate}"
                                    </AlertDescription>
                                </Alert>
                            )}
                            
                            {inspectionOrder && (
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                                        <CheckCircle className="h-5 w-5 mr-2" />
                                        Orden Encontrada
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-600">Placa:</span>
                                            <p className="text-gray-800 font-semibold">{inspectionOrder.placa}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Cliente:</span>
                                            <p className="text-gray-800">{inspectionOrder.nombre_contacto}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Teléfono:</span>
                                            <p className="text-gray-800">{inspectionOrder.celular_contacto}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Correo:</span>
                                            <p className="text-gray-800">{inspectionOrder.email_contacto || 'No especificado'}</p>
                                        </div>
                                    </div>
                                    
                                    <Separator className="my-4" />
                                    
                                    <div>
                                        <Label htmlFor="waitTime">Tiempo de Espera</Label>
                                        <Select value={waitTime} onValueChange={setWaitTime}>
                                            <SelectTrigger className="mt-2">
                                                <SelectValue placeholder="Selecciona el tiempo de espera" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {waitTimeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <Button 
                                        onClick={handleCreateAppointment}
                                        disabled={creatingAppointment || !waitTime}
                                        className="w-full mt-4"
                                    >
                                        {creatingAppointment ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Creando Agendamiento...
                                            </>
                                        ) : (
                                            'Crear Agendamiento'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                
                {/* Parte Derecha - Tabla de Agendamientos */}
                <div className="w-9/12">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    Agendamientos del CDA
                                </CardTitle>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={handleRefreshAppointments}
                                    disabled={refreshing}
                                >
                                    {refreshing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loadingAppointments ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                    <span className="ml-2">Cargando agendamientos...</span>
                                </div>
                            ) : appointments.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No hay agendamientos registrados
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Placa</TableHead>
                                                <TableHead>Cliente</TableHead>
                                                <TableHead>Inspección</TableHead>
                                                <TableHead>Inspector Asignado</TableHead>
                                                <TableHead>Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {appointments.map((appointment) => (
                                                <>
                                                 <TableRow key={appointment.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Car className="h-4 w-4 text-gray-500" />
                                                            <span className="font-medium">{appointment.inspectionOrder?.placa}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-gray-500" />
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
                                                                    
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-500">Sin asignar</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            {appointment.session_id && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleCopyLink(appointment)}
                                                                    title="Copiar enlace de inspección"
                                                                >
                                                                    <Copy className="h-4 w-4" /> Copiar enlace
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    </TableRow>
                                                </>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default InspectorAliado;
