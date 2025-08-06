import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Activity,
    BarChart3,
    Bell,
    CheckCircle,
    Clock,
    Database,
    FileText,
    Mail,
    MessageSquare,
    RefreshCw,
    Settings,
    Smartphone,
    TestTube,
    Trash2,
    Wifi,
    XCircle,
    Zap,
    AlertCircle,
    Info,
    Play,
    Pause,
    RotateCcw
} from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { API_ROUTES } from '@/config/api';

const NotificationAdmin = () => {
    const [dashboard, setDashboard] = useState(null);
    const [systemStats, setSystemStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [testing, setTesting] = useState(false);
    const { showNotification } = useNotifications();

    useEffect(() => {
        fetchDashboard();
        fetchSystemStats();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await fetch(API_ROUTES.NOTIFICATION_ADMIN_INTEGRATED.DASHBOARD, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDashboard(data.data);
            } else {
                throw new Error('Error al cargar dashboard');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al cargar dashboard', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemStats = async () => {
        try {
            const response = await fetch(API_ROUTES.NOTIFICATION_ADMIN_INTEGRATED.SYSTEM_STATS, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSystemStats(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleTestSystem = async () => {
        try {
            setTesting(true);
            const response = await fetch(API_ROUTES.NOTIFICATION_ADMIN_INTEGRATED.TEST_SYSTEM, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({})
            });

            if (response.ok) {
                const data = await response.json();
                showNotification(
                    data.data.results.overall
                        ? 'Sistema funcionando correctamente'
                        : 'Sistema con problemas detectados',
                    data.data.results.overall ? 'success' : 'warning'
                );
            } else {
                throw new Error('Error al probar sistema');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al probar sistema', 'error');
        } finally {
            setTesting(false);
        }
    };

    const handleClearCache = async () => {
        try {
            const response = await fetch(API_ROUTES.NOTIFICATION_ADMIN_INTEGRATED.CLEAR_CACHE, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                showNotification('Cache limpiado exitosamente', 'success');
                fetchDashboard();
                fetchSystemStats();
            } else {
                throw new Error('Error al limpiar cache');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al limpiar cache', 'error');
        }
    };

    const handleReinitialize = async () => {
        try {
            const response = await fetch(API_ROUTES.NOTIFICATION_ADMIN_INTEGRATED.REINITIALIZE, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                showNotification('Sistema reinicializado exitosamente', 'success');
                fetchDashboard();
                fetchSystemStats();
            } else {
                throw new Error('Error al reinicializar sistema');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al reinicializar sistema', 'error');
        }
    };

    const renderOverviewCards = () => {
        if (!dashboard?.overview) return null;

        const { overview } = dashboard;
        const cards = [
            {
                title: 'Eventos Totales',
                value: overview.totalEvents,
                icon: Activity,
                color: 'text-blue-600',
                bgColor: 'bg-blue-100'
            },
            {
                title: 'Plantillas',
                value: overview.totalTemplates,
                icon: FileText,
                color: 'text-green-600',
                bgColor: 'bg-green-100'
            },
            {
                title: 'Canales Activos',
                value: overview.activeChannels,
                icon: Wifi,
                color: 'text-purple-600',
                bgColor: 'bg-purple-100'
            },
            {
                title: 'Notificaciones',
                value: overview.totalNotifications,
                icon: Bell,
                color: 'text-orange-600',
                bgColor: 'bg-orange-100'
            },
            {
                title: 'Tasa de Éxito',
                value: `${overview.successRate}%`,
                icon: CheckCircle,
                color: 'text-emerald-600',
                bgColor: 'bg-emerald-100'
            }
        ];

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {cards.map((card, index) => (
                    <Card key={index}>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                                    <card.icon className={`h-5 w-5 ${card.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                    <p className="text-2xl font-bold">{card.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    const renderSystemStatus = () => {
        if (!systemStats) return null;

        const { performance } = systemStats;
        const uptime = Math.floor(performance?.uptime || 0);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Rendimiento
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tasa de Cache:</span>
                            <span className="font-medium">{performance?.cacheHitRate || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tiempo Respuesta:</span>
                            <span className="font-medium">{performance?.averageResponseTime || 0}ms</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Uptime:</span>
                            <span className="font-medium">{hours}h {minutes}m</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Memoria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Usado:</span>
                            <span className="font-medium">
                                {Math.round((performance?.memoryUsage?.heapUsed || 0) / 1024 / 1024)}MB
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total:</span>
                            <span className="font-medium">
                                {Math.round((performance?.memoryUsage?.heapTotal || 0) / 1024 / 1024)}MB
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Cache:</span>
                            <span className="font-medium">
                                {systemStats?.orchestrator?.cacheSize?.templates || 0} templates
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Acciones
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button
                            size="sm"
                            onClick={handleTestSystem}
                            disabled={testing}
                            className="w-full"
                        >
                            {testing ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                            ) : (
                                <TestTube className="h-4 w-4 mr-2" />
                            )}
                            Probar Sistema
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleClearCache}
                            className="w-full"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Limpiar Cache
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleReinitialize}
                            className="w-full"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reinicializar
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderRecentActivity = () => {
        if (!dashboard) return null;

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Eventos Recientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dashboard.events?.recent?.length > 0 ? (
                            <div className="space-y-3">
                                {dashboard.events.recent.slice(0, 5).map((event, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <div>
                                            <p className="font-medium text-sm">{event.name}</p>
                                            <p className="text-xs text-gray-500">{event.category}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {event.trigger_count || 0}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No hay eventos recientes</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Plantillas Recientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dashboard.templates?.recent?.length > 0 ? (
                            <div className="space-y-3">
                                {dashboard.templates.recent.slice(0, 5).map((template, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <div>
                                            <p className="font-medium text-sm">{template.name}</p>
                                            <p className="text-xs text-gray-500">{template.category}</p>
                                        </div>
                                        <Badge
                                            variant={template.is_active ? "default" : "secondary"}
                                            className="text-xs"
                                        >
                                            {template.is_active ? 'Activa' : 'Inactiva'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No hay plantillas recientes</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Administración de Notificaciones</h1>
                    <p className="text-muted-foreground">
                        Panel de control completo del sistema de notificaciones
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={fetchDashboard}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Vista General</TabsTrigger>
                    <TabsTrigger value="system">Sistema</TabsTrigger>
                    <TabsTrigger value="activity">Actividad</TabsTrigger>
                    <TabsTrigger value="settings">Configuración</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {renderOverviewCards()}
                    {renderRecentActivity()}
                </TabsContent>

                <TabsContent value="system" className="space-y-6">
                    {renderSystemStatus()}

                    {systemStats && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Estadísticas Detalladas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {systemStats.orchestrator?.eventsProcessed || 0}
                                        </p>
                                        <p className="text-sm text-gray-600">Eventos Procesados</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {systemStats.orchestrator?.successfulDeliveries || 0}
                                        </p>
                                        <p className="text-sm text-gray-600">Envíos Exitosos</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-red-600">
                                            {systemStats.orchestrator?.failedDeliveries || 0}
                                        </p>
                                        <p className="text-sm text-gray-600">Envíos Fallidos</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-purple-600">
                                            {systemStats.orchestrator?.successRate || 0}%
                                        </p>
                                        <p className="text-sm text-gray-600">Tasa de Éxito</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Esta sección mostrará la actividad reciente del sistema de notificaciones.
                            Funcionalidad en desarrollo.
                        </AlertDescription>
                    </Alert>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <Alert>
                        <Settings className="h-4 w-4" />
                        <AlertDescription>
                            Esta sección permitirá configurar parámetros del sistema de notificaciones.
                            Funcionalidad en desarrollo.
                        </AlertDescription>
                    </Alert>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default NotificationAdmin; 