import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
    Users,
    Clock,
    Phone,
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    TrendingDown,
    UserCheck
} from 'lucide-react';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';

const AgentAssignmentStats = () => {
    const [agentStats, setAgentStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedAgents, setExpandedAgents] = useState(new Set());
    const [showAll, setShowAll] = useState(false);
    const { showToast } = useNotificationContext();

    useEffect(() => {
        loadAgentStats();
    }, []);

    const loadAgentStats = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.COORDINADOR_CONTACTO.AGENT_STATS, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAgentStats(data.data);
            } else {
                throw new Error('Error al cargar estadísticas de agentes');
            }
        } catch (error) {
            console.error('Error loading agent stats:', error);
            showToast('Error al cargar las estadísticas de agentes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleAgentExpansion = (agentId) => {
        const newExpanded = new Set(expandedAgents);
        if (newExpanded.has(agentId)) {
            newExpanded.delete(agentId);
        } else {
            newExpanded.add(agentId);
        }
        setExpandedAgents(newExpanded);
    };

    const getAgentInitials = (name) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getStatusColor = (status, value) => {
        if (value === 0) return 'text-muted-foreground';

        const colors = {
            total: 'text-blue-600',
            pendientes: 'text-yellow-600',
            en_gestion: 'text-orange-600',
            agendadas: 'text-green-600',
            completadas: 'text-emerald-600'
        };
        return colors[status] || 'text-muted-foreground';
    };

    const getStatusIcon = (status) => {
        const icons = {
            total: Users,
            pendientes: Clock,
            en_gestion: Phone,
            agendadas: Calendar,
            completadas: CheckCircle
        };
        return icons[status] || Users;
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 80) return 'bg-emerald-500';
        if (percentage >= 60) return 'bg-green-500';
        if (percentage >= 40) return 'bg-yellow-500';
        if (percentage >= 20) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getTopAgents = () => {
        return agentStats.slice(0, 5);
    };

    const getDisplayedAgents = () => {
        return showAll ? agentStats : getTopAgents();
    };

    const getTotalOrders = () => {
        return agentStats.reduce((total, agent) => total + agent.stats.total, 0);
    };

    const getAverageOrders = () => {
        if (agentStats.length === 0) return 0;
        return Math.round(getTotalOrders() / agentStats.length);
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Estadísticas por Asesor
                    </CardTitle>
                    <CardDescription>
                        Distribución de órdenes asignadas por agente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (agentStats.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Estadísticas por Asesor
                    </CardTitle>
                    <CardDescription>
                        Distribución de órdenes asignadas por agente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No hay agentes disponibles</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const totalOrders = getTotalOrders();
    const averageOrders = getAverageOrders();

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5" />
                            Estadísticas por Asesor
                        </CardTitle>
                        <CardDescription>
                            Distribución de órdenes asignadas por agente
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                            <div className="font-semibold text-blue-600">{totalOrders}</div>
                            <div className="text-muted-foreground">Total</div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-green-600">{averageOrders}</div>
                            <div className="text-muted-foreground">Promedio</div>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Resumen de rendimiento */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {agentStats.filter(a => a.stats.total > averageOrders).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Sobre promedio</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {agentStats.filter(a => a.stats.completadas > 0).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Con completadas</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                            {agentStats.filter(a => a.stats.en_gestion > 0).length}
                        </div>
                        <div className="text-sm text-muted-foreground">En gestión</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                            {agentStats.filter(a => a.stats.pendientes > 0).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Con pendientes</div>
                    </div>
                </div>

                {/* Lista de agentes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {getDisplayedAgents().map((agentData, index) => {
                        const { agent, stats } = agentData;
                        const isExpanded = expandedAgents.has(agent.id);
                        const percentage = totalOrders > 0 ? (stats.total / totalOrders) * 100 : 0;
                        const isAboveAverage = stats.total > averageOrders;

                        return (
                            <Card key={agent.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                    {getAgentInitials(agent.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-base">{agent.name}</CardTitle>
                                                <CardDescription className="text-xs">{agent.email}</CardDescription>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="flex items-center gap-1">
                                                <div className="text-xl font-bold text-blue-600">{stats.total}</div>
                                                {isAboveAverage ? (
                                                    <TrendingUp className="h-3 w-3 text-green-600" />
                                                ) : (
                                                    <TrendingDown className="h-3 w-3 text-red-600" />
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground">órdenes</div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-0">
                                    {/* Barra de progreso */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">Proporción</span>
                                            <span className="font-medium">{percentage.toFixed(1)}%</span>
                                        </div>
                                        <Progress
                                            value={percentage}
                                            className="h-1.5"
                                        />
                                    </div>

                                    {/* Botón expandir */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleAgentExpansion(agent.id)}
                                        className="w-full text-xs"
                                    >
                                        {isExpanded ? (
                                            <>
                                                <ChevronUp className="h-3 w-3 mr-1" />
                                                Ocultar detalles
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="h-3 w-3 mr-1" />
                                                Ver detalles
                                            </>
                                        )}
                                    </Button>

                                    {/* Detalles expandidos */}
                                    {isExpanded && (
                                        <div className="mt-3 pt-3 border-t">
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.entries(stats).map(([status, value]) => {
                                                    const IconComponent = getStatusIcon(status);
                                                    const colorClass = getStatusColor(status, value);

                                                    return (
                                                        <div key={status} className="text-center p-2 bg-muted/30 rounded-md">
                                                            <IconComponent className={`h-4 w-4 mx-auto mb-1 ${colorClass}`} />
                                                            <div className={`text-sm font-bold ${colorClass}`}>{value}</div>
                                                            <div className="text-xs text-muted-foreground capitalize">
                                                                {status.replace('_', ' ')}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Botón para mostrar más/menos */}
                {agentStats.length > 5 && (
                    <div className="flex justify-center pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowAll(!showAll)}
                            className="w-full"
                        >
                            {showAll ? 'Mostrar menos' : `Mostrar todos (${agentStats.length})`}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AgentAssignmentStats; 