import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    TestTube,
    Settings,
    BarChart3,
    RefreshCw,
    CheckCircle,
    XCircle,
    AlertCircle,
    Mail,
    MessageSquare,
    Smartphone,
    Bell,
    Wifi,
    Database,
    Zap,
    Shield,
    Clock,
    Activity
} from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { API_ROUTES } from '@/config/api';

const ChannelConfigurations = () => {
    const [channels, setChannels] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
    const [testData, setTestData] = useState({});
    const [testing, setTesting] = useState(false);
    const { showToast: showNotification } = useNotifications();

    // Iconos por canal
    const channelIcons = {
        email: Mail,
        sms: MessageSquare,
        whatsapp: Smartphone,
        push: Bell,
        in_app: Wifi
    };

    // Colores por estado
    const statusColors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800'
    };

    // Estados de prueba
    const testStatusColors = {
        success: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800'
    };

    useEffect(() => {
        fetchChannels();
        fetchStats();
    }, []);

    const fetchChannels = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_ROUTES.CHANNELS.LIST, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setChannels(data.data || []);
            } else {
                throw new Error('Error al cargar canales');
            }
        } catch (error) {
            showNotification('Error al cargar canales', 'error');
            console.error('Error fetching channels:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(API_ROUTES.CHANNELS.STATS, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.data || {});
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleCreateChannel = () => {
        setSelectedChannel({
            channel_name: '',
            display_name: '',
            description: '',
            is_active: true,
            config: {},
            template_config: {},
            rate_limit: 100,
            priority: 1,
            max_retries: 3,
            retry_delay: 60,
            timeout: 30
        });
        setIsDialogOpen(true);
    };

    const handleEditChannel = (channel) => {
        setSelectedChannel({ ...channel });
        setIsDialogOpen(true);
    };

    const handleDeleteChannel = async (channelName) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar el canal "${channelName}"?`)) {
            return;
        }

        try {
            const response = await fetch(API_ROUTES.CHANNELS.DELETE(channelName), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                showNotification('Canal eliminado exitosamente', 'success');
                fetchChannels();
                fetchStats();
            } else {
                throw new Error('Error al eliminar canal');
            }
        } catch (error) {
            showNotification('Error al eliminar canal', 'error');
            console.error('Error deleting channel:', error);
        }
    };

    const handleSaveChannel = async (channelData) => {
        try {
            const isEdit = selectedChannel.id;
            const url = isEdit ? API_ROUTES.CHANNELS.UPDATE(channelData.channel_name) : API_ROUTES.CHANNELS.CREATE;
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(channelData)
            });

            if (response.ok) {
                showNotification(
                    isEdit ? 'Canal actualizado exitosamente' : 'Canal creado exitosamente',
                    'success'
                );
                setIsDialogOpen(false);
                fetchChannels();
                fetchStats();
            } else {
                throw new Error('Error al guardar canal');
            }
        } catch (error) {
            showNotification('Error al guardar canal', 'error');
            console.error('Error saving channel:', error);
        }
    };

    const handleTestChannel = async (channelName) => {
        setSelectedChannel(channels.find(c => c.channel_name == channelName));
        setTestData({
            to: '',
            subject: 'Prueba de canal',
            message: 'Este es un mensaje de prueba para verificar la configuración del canal.'
        });
        setIsTestDialogOpen(true);
    };

    const executeTest = async () => {
        if (!selectedChannel || !testData.to) {
            showNotification('Por favor completa los datos de prueba', 'warning');
            return;
        }

        try {
            setTesting(true);
            const response = await fetch(API_ROUTES.CHANNELS.TEST(selectedChannel.channel_name), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(testData)
            });

            const result = await response.json();

            if (response.ok) {
                showNotification('Prueba ejecutada exitosamente', 'success');
                fetchChannels(); // Actualizar estado de prueba
            } else {
                showNotification(result.message || 'Error en la prueba', 'error');
            }
        } catch (error) {
            showNotification('Error al ejecutar prueba', 'error');
            console.error('Error testing channel:', error);
        } finally {
            setTesting(false);
        }
    };

    const handleReloadChannels = async () => {
        try {
            const response = await fetch(API_ROUTES.CHANNELS.RELOAD, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                showNotification('Canales recargados exitosamente', 'success');
                fetchChannels();
                fetchStats();
            } else {
                throw new Error('Error al recargar canales');
            }
        } catch (error) {
            showNotification('Error al recargar canales', 'error');
            console.error('Error reloading channels:', error);
        }
    };

    const filteredChannels = channels.filter(channel => {
        const matchesSearch = channel.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            channel.channel_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus == 'all' ||
            (filterStatus == 'active' && channel.is_active) ||
            (filterStatus == 'inactive' && !channel.is_active);
        return matchesSearch && matchesFilter;
    });

    const renderChannelCard = (channel) => {
        const IconComponent = channelIcons[channel.channel_name] || Settings;
        const lastTestDate = channel.last_tested ? new Date(channel.last_tested).toLocaleDateString() : 'Nunca';

        return (
            <Card key={channel.channel_name} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <IconComponent className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{channel.display_name}</CardTitle>
                                <p className="text-sm text-gray-500">{channel.channel_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge className={statusColors[channel.is_active ? 'active' : 'inactive']}>
                                {channel.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                            <Badge className={testStatusColors[channel.test_status] || testStatusColors.pending}>
                                {channel.test_status == 'success' ? 'OK' :
                                    channel.test_status == 'failed' ? 'Error' : 'Pendiente'}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">{channel.description}</p>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="font-medium">Prioridad:</span> {channel.priority}
                            </div>
                            <div>
                                <span className="font-medium">Rate Limit:</span> {channel.rate_limit}/min
                            </div>
                            <div>
                                <span className="font-medium">Reintentos:</span> {channel.max_retries}
                            </div>
                            <div>
                                <span className="font-medium">Timeout:</span> {channel.timeout}s
                            </div>
                        </div>

                        <div className="text-xs text-gray-500">
                            Última prueba: {lastTestDate}
                        </div>

                        <div className="flex space-x-2 pt-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditChannel(channel)}
                            >
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTestChannel(channel.channel_name)}
                            >
                                <TestTube className="h-4 w-4 mr-1" />
                                Probar
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteChannel(channel.channel_name)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Eliminar
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Configuración de Canales</h1>
                    <p className="text-gray-600">Gestiona los canales de notificación del sistema</p>
                </div>
                <div className="flex space-x-2">
                    <Button onClick={handleReloadChannels} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Recargar
                    </Button>
                    <Button onClick={handleCreateChannel}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Canal
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Database className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium">Total Canales</p>
                                <p className="text-2xl font-bold">{stats.total_channels || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Zap className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium">Activos</p>
                                <p className="text-2xl font-bold">{stats.active_channels || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium">Pruebas Exitosas</p>
                                <p className="text-2xl font-bold">{stats.successful_tests || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Activity className="h-5 w-5 text-orange-600" />
                            <div>
                                <p className="text-sm font-medium">Envíos/Min</p>
                                <p className="text-2xl font-bold">{stats.total_rate_limit || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
                <div className="flex-1">
                    <Input
                        placeholder="Buscar canales..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="inactive">Inactivos</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChannels.map(renderChannelCard)}
            </div>

            {filteredChannels.length == 0 && (
                <div className="text-center py-12">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron canales</h3>
                    <p className="text-gray-500">No hay canales que coincidan con los filtros aplicados.</p>
                </div>
            )}

            {/* Channel Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedChannel?.id ? 'Editar Canal' : 'Nuevo Canal'}
                        </DialogTitle>
                    </DialogHeader>
                    <ChannelForm
                        channel={selectedChannel}
                        onSave={handleSaveChannel}
                        onCancel={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Test Dialog */}
            <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Probar Canal: {selectedChannel?.display_name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="test-to">Destinatario</Label>
                            <Input
                                id="test-to"
                                value={testData.to || ''}
                                onChange={(e) => setTestData({ ...testData, to: e.target.value })}
                                placeholder="email@ejemplo.com o +1234567890"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="test-subject">Asunto</Label>
                            <Input
                                id="test-subject"
                                value={testData.subject || ''}
                                onChange={(e) => setTestData({ ...testData, subject: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="test-message">Mensaje</Label>
                            <Textarea
                                id="test-message"
                                value={testData.message || ''}
                                onChange={(e) => setTestData({ ...testData, message: e.target.value })}
                                rows={4}
                            />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4 border-t">
                            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={executeTest} disabled={testing}>
                                {testing ? 'Probando...' : 'Ejecutar Prueba'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Componente de formulario para canales
const ChannelForm = ({ channel, onSave, onCancel }) => {
    const [formData, setFormData] = useState(channel || {});
    const [activeTab, setActiveTab] = useState('general');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateConfig = (field, value) => {
        setFormData(prev => ({
            ...prev,
            config: { ...prev.config, [field]: value }
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="config">Configuración</TabsTrigger>
                    <TabsTrigger value="advanced">Avanzado</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="channel-name">Nombre del Canal</Label>
                            <Input
                                id="channel-name"
                                value={formData.channel_name || ''}
                                onChange={(e) => updateFormData('channel_name', e.target.value)}
                                placeholder="email, sms, whatsapp"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="display-name">Nombre para Mostrar</Label>
                            <Input
                                id="display-name"
                                value={formData.display_name || ''}
                                onChange={(e) => updateFormData('display_name', e.target.value)}
                                placeholder="Email, SMS, WhatsApp"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={formData.description || ''}
                            onChange={(e) => updateFormData('description', e.target.value)}
                            placeholder="Descripción del canal"
                            rows={3}
                        />
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            type="checkbox"
                            id="is-active"
                            checked={formData.is_active || false}
                            onChange={(e) => updateFormData('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="is-active" className="text-sm font-medium">Canal activo</Label>
                    </div>
                </TabsContent>

                <TabsContent value="config" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="rate-limit">Rate Limit (por minuto)</Label>
                            <Input
                                id="rate-limit"
                                type="number"
                                value={formData.rate_limit || 100}
                                onChange={(e) => updateFormData('rate_limit', parseInt(e.target.value))}
                                min="1"
                                max="10000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority">Prioridad</Label>
                            <Input
                                id="priority"
                                type="number"
                                value={formData.priority || 1}
                                onChange={(e) => updateFormData('priority', parseInt(e.target.value))}
                                min="1"
                                max="10"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="max-retries">Máximo Reintentos</Label>
                            <Input
                                id="max-retries"
                                type="number"
                                value={formData.max_retries || 3}
                                onChange={(e) => updateFormData('max_retries', parseInt(e.target.value))}
                                min="0"
                                max="10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="retry-delay">Delay entre Reintentos (seg)</Label>
                            <Input
                                id="retry-delay"
                                type="number"
                                value={formData.retry_delay || 60}
                                onChange={(e) => updateFormData('retry_delay', parseInt(e.target.value))}
                                min="1"
                                max="3600"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="timeout">Timeout (segundos)</Label>
                        <Input
                            id="timeout"
                            type="number"
                            value={formData.timeout || 30}
                            onChange={(e) => updateFormData('timeout', parseInt(e.target.value))}
                            min="1"
                            max="300"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="config-json">Configuración JSON</Label>
                        <Textarea
                            id="config-json"
                            value={JSON.stringify(formData.config || {}, null, 2)}
                            onChange={(e) => {
                                try {
                                    const config = JSON.parse(e.target.value);
                                    updateFormData('config', config);
                                } catch (error) {
                                    // Ignorar errores de JSON inválido
                                }
                            }}
                            placeholder='{"host": "smtp.gmail.com", "port": 587, ...}'
                            rows={8}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500">
                            Configuración específica del canal en formato JSON
                        </p>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit">
                    Guardar
                </Button>
            </div>
        </form>
    );
};

export default ChannelConfigurations; 