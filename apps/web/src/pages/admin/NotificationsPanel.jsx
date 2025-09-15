import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Settings, FileText, MessageSquare, BarChart3, RefreshCw, TestTube } from 'lucide-react';

export function NotificationsPanel({ 
    notificationTypes, 
    notificationChannels, 
    notificationConfigs, 
    notificationStats,
    fetchNotificationData 
}) {
    return (
        <div className="space-y-6">
            {/* Estadísticas Generales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Notificaciones</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{notificationStats?.total || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Hoy: {notificationStats?.today || 0}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Configuraciones Activas</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{notificationStats?.active_configs || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Tipos y canales configurados
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tipos de Notificación</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{notificationTypes.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Plantillas disponibles
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Canales Activos</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{notificationChannels.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Email, SMS, WhatsApp, etc.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Configuraciones de Notificación */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tipos de Notificación */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Tipos de Notificación
                        </CardTitle>
                        <CardDescription>
                            Gestiona las plantillas y tipos de notificación
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {notificationTypes.map(type => (
                                <div key={type.id} className="p-3 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">{type.name}</h4>
                                            <p className="text-sm text-muted-foreground">{type.description}</p>
                                        </div>
                                        <Badge variant="outline">{type.variables?.length || 0} variables</Badge>
                                    </div>
                                </div>
                            ))}
                            {notificationTypes.length == 0 && (
                                <div className="text-center py-4 text-muted-foreground">
                                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No hay tipos de notificación configurados</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Canales de Notificación */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Canales de Notificación
                        </CardTitle>
                        <CardDescription>
                            Gestiona los canales de envío disponibles
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {notificationChannels.map(channel => (
                                <div key={channel.id} className="p-3 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">{channel.name}</h4>
                                            <p className="text-sm text-muted-foreground">{channel.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">{channel.provider}</Badge>
                                            <Badge variant="outline">
                                                {channel.config ? 'Configurado' : 'Sin configurar'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {notificationChannels.length == 0 && (
                                <div className="text-center py-4 text-muted-foreground">
                                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No hay canales de notificación configurados</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Configuraciones de Notificación */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Configuraciones de Notificación
                    </CardTitle>
                    <CardDescription>
                        Relaciones entre tipos de notificación y canales
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {notificationConfigs.map(config => (
                            <div key={config.id} className="p-3 border rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="font-medium">{config.type?.name}</h4>
                                            <p className="text-sm text-muted-foreground">{config.type?.description}</p>
                                        </div>
                                        <div className="text-muted-foreground">→</div>
                                        <div>
                                            <h4 className="font-medium">{config.channel?.name}</h4>
                                            <p className="text-sm text-muted-foreground">{config.channel?.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={config.enabled ? "default" : "secondary"}>
                                            {config.enabled ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                        <Badge variant="outline">{config.priority}</Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {notificationConfigs.length == 0 && (
                            <div className="text-center py-4 text-muted-foreground">
                                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No hay configuraciones de notificación</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Acciones de Administración */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Acciones de Administración
                    </CardTitle>
                    <CardDescription>
                        Herramientas para gestionar el sistema de notificaciones
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button 
                            variant="outline" 
                            className="flex items-center gap-2"
                            onClick={fetchNotificationData}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Recargar Datos
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Ver Estadísticas
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <TestTube className="h-4 w-4" />
                            Probar Notificación
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
