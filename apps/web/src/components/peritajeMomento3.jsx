import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, User, UserCheck, UserX, Calendar as CalendarIcon, Phone, Mail, Car, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRoles } from '@/hooks/use-roles';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';

const PeritajeMomento3 = () => {
    const { user } = useAuth();
    const { hasRole } = useRoles();
    const { showToast } = useNotificationContext();
    
    const [peritajes, setPeritajes] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigningAgent, setAssigningAgent] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState('');
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [selectedPeritaje, setSelectedPeritaje] = useState(null);
    const [scheduleForm, setScheduleForm] = useState({
        fecha_agendada: '',
        hora: '',
        direccion_peritaje: '',
        ciudad: '',
        modalidad_peritaje: 'presencial',
        observaciones: ''
    });

    // Verificar roles
    const isCoordinador = hasRole('coordinador_contacto');
    const isAgente = hasRole('agente_contacto');

    useEffect(() => {
        loadPeritajes();
        if (isCoordinador) {
            loadAgents();
        }
    }, [isCoordinador]);

    const loadPeritajes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            const response = await fetch(API_ROUTES.PERITAJES.GET_PENDING_TO_SCHEDULE, {headers});

            if (!response.ok) {
                throw new Error('Error al cargar peritajes');
            }

            const data = await response.json();
            
            // Validar que la respuesta tenga la estructura esperada
            if (!data || !data.data || !Array.isArray(data.data)) {
                console.warn('Respuesta de peritajes no tiene la estructura esperada:', data);
                setPeritajes([]);
                return;
            }
            
            // Si es agente, filtrar solo los peritajes asignados a él
            if (isAgente && !isCoordinador) {
                const filteredPeritajes = data.data.filter(peritaje => 
                    peritaje.assigned_agent_id === user.id
                );
                setPeritajes(filteredPeritajes);
            } else {
                setPeritajes(data.data);
            }
        } catch (error) {
            console.error('Error cargando peritajes:', error);
            showToast('Error al cargar peritajes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadAgents = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            const response = await fetch(API_ROUTES.PERITAJES.GET_AGENTES_CONTACTO, {headers});

            if (!response.ok) {
                throw new Error('Error al cargar agentes');
            }

            const data = await response.json();
            
            // Validar que la respuesta tenga la estructura esperada
            if (!data || !data.data || !Array.isArray(data.data)) {
                console.warn('Respuesta de agentes no tiene la estructura esperada:', data);
                setAgents([]);
                return;
            }
            
            // Los agentes ya vienen filtrados desde el backend
            setAgents(data.data);
        } catch (error) {
            console.error('Error cargando agentes:', error);
            showToast('Error al cargar agentes', 'error');
        }
    };

    const handleAssignAgent = async (peritajeId, agentId) => {
        try {
            setAssigningAgent(peritajeId);
            const token = localStorage.getItem('authToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            
            const response = await fetch(API_ROUTES.PERITAJES.ASSIGN_AGENT, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    peritaje_order_id: peritajeId,
                    agent_id: agentId === 'unassign' ? null : agentId
                })
            });

            if (!response.ok) {
                throw new Error('Error al asignar agente');
            }

            const data = await response.json();
            showToast(data.message, 'success');
            loadPeritajes(); // Recargar la lista
        } catch (error) {
            console.error('Error asignando agente:', error);
            showToast('Error al asignar agente', 'error');
        } finally {
            setAssigningAgent(null);
            setSelectedAgent('');
        }
    };

    const handleSchedulePeritaje = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            
            const response = await fetch(API_ROUTES.PERITAJES.SCHEDULE, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    peritaje_order_id: selectedPeritaje.id,
                    ...scheduleForm
                })
            });

            if (!response.ok) {
                throw new Error('Error al agendar peritaje');
            }

            const data = await response.json();
            showToast(data.message, 'success');
            setShowScheduleDialog(false);
            setSelectedPeritaje(null);
            setScheduleForm({
                fecha_agendada: '',
                hora: '',
                direccion_peritaje: '',
                ciudad: '',
                modalidad_peritaje: 'presencial',
                observaciones: ''
            });
            loadPeritajes(); // Recargar la lista
        } catch (error) {
            console.error('Error agendando peritaje:', error);
            showToast('Error al agendar peritaje', 'error');
        }
    };

    const openScheduleDialog = (peritaje) => {
        setSelectedPeritaje(peritaje);
        setShowScheduleDialog(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getAssignedAgentName = (peritaje) => {
        if (!peritaje.assigned_agent_id) return 'Sin asignar';
        const agent = agents.find(a => a.id === peritaje.assigned_agent_id);
        return agent ? agent.name : 'Agente no encontrado';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Cargando peritajes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        Peritajes - Momento 3
                    </CardTitle>
                    <CardDescription>
                        {isCoordinador 
                            ? 'Gestiona la asignación de agentes a peritajes pendientes'
                            : 'Peritajes asignados para agendar'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {peritajes.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">
                                {isCoordinador 
                                    ? 'No hay peritajes pendientes de asignación'
                                    : 'No tienes peritajes asignados para agendar'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {peritajes.map((peritaje) => (
                                <Card key={peritaje.id} className="border-l-4 border-l-blue-500">
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* Información del peritaje */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-mono font-medium">{peritaje.numero}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{formatDate(peritaje.created_at)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{peritaje.nombre_cliente}</span>
                                                </div>
                                            </div>

                                            {/* Información del vehículo */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Car className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-mono">{peritaje.placa}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {peritaje.marca} - {peritaje.modelo}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {peritaje.producto?.split("_").join(" ")}
                                                </div>
                                            </div>

                                            {/* Información de contacto y asignación */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{peritaje.celular_cliente}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{peritaje.correo_cliente}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {peritaje.assigned_agent_id ? (
                                                        <UserCheck className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <UserX className="h-4 w-4 text-red-500" />
                                                    )}
                                                    <span className="text-sm">
                                                        {getAssignedAgentName(peritaje)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="mt-4 flex gap-2">
                                            {isCoordinador && (
                                                <Select
                                                    value={assigningAgent === peritaje.id ? selectedAgent : (peritaje.assigned_agent_id?.toString() || '')}
                                                    onValueChange={(value) => {
                                                        setSelectedAgent(value);
                                                        handleAssignAgent(peritaje.id, value);
                                                    }}
                                                    disabled={assigningAgent === peritaje.id}
                                                >
                                                    <SelectTrigger className="w-[200px]">
                                                        <SelectValue placeholder="Asignar agente" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="unassign">Quitar asignación</SelectItem>
                                                        {agents.map((agent) => (
                                                            <SelectItem key={agent.id} value={agent.id.toString()}>
                                                                {agent.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}

                                            {isAgente && peritaje.assigned_agent_id === user.id && (
                                                <Button
                                                    onClick={() => openScheduleDialog(peritaje)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <CalendarIcon className="h-4 w-4" />
                                                    Agendar Peritaje
                                                </Button>
                                            )}

                                            {assigningAgent === peritaje.id && (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog para agendar peritaje */}
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Agendar Peritaje</DialogTitle>
                        <DialogDescription>
                            Configura los detalles del agendamiento para el peritaje {selectedPeritaje?.numero}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fecha_agendada">Fecha del peritaje *</Label>
                            <Input
                                id="fecha_agendada"
                                type="date"
                                value={scheduleForm.fecha_agendada}
                                onChange={(e) => setScheduleForm(prev => ({ ...prev, fecha_agendada: e.target.value }))}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hora">Hora del peritaje</Label>
                            <Input
                                id="hora"
                                type="time"
                                value={scheduleForm.hora}
                                onChange={(e) => setScheduleForm(prev => ({ ...prev, hora: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="modalidad_peritaje">Modalidad</Label>
                            <Select
                                value={scheduleForm.modalidad_peritaje}
                                onValueChange={(value) => setScheduleForm(prev => ({ ...prev, modalidad_peritaje: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="presencial">Presencial</SelectItem>
                                    <SelectItem value="virtual">Virtual</SelectItem>
                                    <SelectItem value="domicilio">A Domicilio</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ciudad">Ciudad</Label>
                            <Input
                                id="ciudad"
                                value={scheduleForm.ciudad}
                                onChange={(e) => setScheduleForm(prev => ({ ...prev, ciudad: e.target.value }))}
                                placeholder="Ciudad del peritaje"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="direccion_peritaje">Dirección del peritaje</Label>
                            <Input
                                id="direccion_peritaje"
                                value={scheduleForm.direccion_peritaje}
                                onChange={(e) => setScheduleForm(prev => ({ ...prev, direccion_peritaje: e.target.value }))}
                                placeholder="Dirección completa del peritaje"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="observaciones">Observaciones</Label>
                            <Textarea
                                id="observaciones"
                                value={scheduleForm.observaciones}
                                onChange={(e) => setScheduleForm(prev => ({ ...prev, observaciones: e.target.value }))}
                                placeholder="Observaciones adicionales para el peritaje"
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleSchedulePeritaje}
                            disabled={!scheduleForm.fecha_agendada}
                        >
                            Agendar Peritaje
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PeritajeMomento3;