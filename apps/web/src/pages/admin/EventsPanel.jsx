import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, RefreshCw, TestTube } from 'lucide-react';

export function EventsPanel({ 
    events, 
    eventStats, 
    fetchEventData 
}) {
    return (
        <div className="space-y-6">
            {/* Estadísticas de Eventos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{eventStats?.total_events || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Eventos registrados
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Eventos Activos</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{eventStats?.active_events || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Eventos habilitados
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Disparos</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{eventStats?.total_triggers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Veces disparados
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{eventStats?.categories_count || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Categorías únicas
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de Eventos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Eventos del Sistema
                    </CardTitle>
                    <CardDescription>
                        Eventos disponibles para configurar notificaciones automáticas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {events.map(event => (
                            <div key={event.id} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-medium text-lg">{event.name}</h4>
                                            <Badge variant="outline">{event.category}</Badge>
                                            <Badge variant={event.is_active ? "default" : "secondary"}>
                                                {event.is_active ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">{event.description}</p>

                                        {event.metadata?.variables && (
                                            <div className="mb-3">
                                                <p className="text-sm font-medium mb-1">Variables disponibles:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {event.metadata.variables.map((variable, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            {variable}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>Disparos: {event.trigger_count}</span>
                                            <span>Versión: {event.version}</span>
                                            {event.last_triggered && (
                                                <span>Último: {new Date(event.last_triggered).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm">
                                            Ver Listeners
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            Probar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {events.length == 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No hay eventos configurados</p>
                                <p className="text-sm">Los eventos se crean automáticamente al ejecutar el seed</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Acciones de Eventos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Gestión de Eventos
                    </CardTitle>
                    <CardDescription>
                        Acciones para administrar el sistema de eventos
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={fetchEventData}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Recargar Eventos
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Ver Estadísticas
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <TestTube className="h-4 w-4" />
                            Crear Evento
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
