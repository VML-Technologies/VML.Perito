import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StatsCards from '@/components/StatsCards';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Search, Filter } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { useState } from 'react';

const OrdersFilters = ({
    filters = {},
    onFilterChange,
    onClearFilters,
    agents = [],
    showAgentFilter = false,
    showDateFilters = true,
    showStatusFilter = true,
    showSearchFilter = true,
    gridCols = "md:grid-cols-4",
    title = "Filtros y Búsqueda",
    description = "Filtra las órdenes según tus criterios",
    role = null,
    stats = null,
    showCreateModal = false
}) => {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const handleFilterChange = (key, value) => {
        const backendValue = (value === 'all') ? '' : value;
        onFilterChange(key, backendValue);
    };

    const handleClearFilters = () => {
        const defaultFilters = {
            plate: '',
            client: '',
            contact: '',
            order_number: '',
            status: '',
            date_from: '',
            date_to: '',
            sortBy: 'created_at',
            sortOrder: 'DESC'
        };
        if (showAgentFilter) defaultFilters.assigned_agent_id = '';
        onClearFilters(defaultFilters);
    };

    const { hasPermission } = usePermissions();

    return (
        <div className="flex w-full items-center gap-4 overflow-hidden">
            <div className="w-full overflow-hidden">
                <div className="rounded-lg border border-gray-200 shadow-md">
                    {role !== "comercial" && (
                        <div className="px-4">
                            <CardTitle className="text-2xl font-bold text-gray-800">{title}</CardTitle>
                            <CardDescription className="text-gray-600">{description}</CardDescription>
                        </div>
                    )}

                    <div className="px-4 py-3">
                        {/* Desktop Layout */}
                        <div className="hidden md:flex flex-wrap items-end gap-4">
                            {/* Filtro Placa */}
                            <div className="flex flex-col space-y-2 flex-grow min-w-[150px]">
                                <Label htmlFor="plate">Placa</Label>
                                <Input
                                    id="plate"
                                    placeholder="Ej: ABC123"
                                    value={filters.plate || ''}
                                    onChange={(e) => handleFilterChange('plate', e.target.value)}
                                />
                            </div>

                            {/* Filtro Cliente */}
                            <div className="flex flex-col space-y-2 flex-grow min-w-[200px]">
                                <Label htmlFor="client">Cliente</Label>
                                <Input
                                    id="client"
                                    placeholder="Ej: Juan Pérez, juan@mail.com, 3004567890"
                                    value={filters.client || ''}
                                    onChange={(e) => handleFilterChange('client', e.target.value)}
                                />
                            </div>

                            {/* Filtro Contacto */}
                            <div className="flex flex-col space-y-2 flex-grow min-w-[180px]">
                                <Label htmlFor="contact">Contacto</Label>
                                <Input
                                    id="contact"
                                    placeholder="Ej: ana ramos, ana@mail.com, 3012345678"
                                    value={filters.contact || ''}
                                    onChange={(e) => handleFilterChange('contact', e.target.value)}
                                />
                            </div>

                            {/* Filtro Número de Orden */}
                            <div className="flex flex-col space-y-2 flex-grow min-w-[150px]">
                                <Label htmlFor="order_number">N° Orden</Label>
                                <Input
                                    id="order_number"
                                    placeholder="Ej: 00123"
                                    value={filters.order_number || ''}
                                    onChange={(e) => handleFilterChange('order_number', e.target.value)}
                                />
                            </div>

                            {/* Filtro Agente Asignado (opcional) */}
                            {showAgentFilter && (
                                <div className="flex flex-col space-y-2 flex-grow min-w-[200px]">
                                    <Label htmlFor="agent">Agente Asignado</Label>
                                    <Select
                                        value={filters.assigned_agent_id || ''}
                                        onValueChange={(value) => handleFilterChange('assigned_agent_id', value)}
                                    >
                                        <SelectTrigger className="w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                                            <SelectValue placeholder="Todos los agentes" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-md shadow-lg">
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="unassigned">Sin asignar</SelectItem>
                                            <SelectItem value="assigned">Asignados</SelectItem>
                                            {agents.filter(agent => agent.id && agent.name).map((agent) => (
                                                <SelectItem key={agent.id} value={agent.id.toString()}>
                                                    {agent.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Botón Limpiar */}
                            <div className="flex self-end">
                                <Button
                                    onClick={handleClearFilters}
                                    variant="secondary"
                                    size="sm"
                                    className="text-xs px-4 py-2 text-[#235692] rounded-full shadow-sm cursor-pointer bg-[#FFFFFF] border border-[#3075C7] hover:bg-[#EAF4FF] hover:text-[#235692] transition-colors duration-200"
                                >
                                    Limpiar Filtros
                                </Button>
                            </div>
                        </div>

                        {/* Mobile Layout - Compact */}
                        <div className="md:hidden space-y-3">
                            {/* Búsqueda general con botón de filtros */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Busca por placa, cliente..."
                                    value={filters.client || ''}
                                    onChange={(e) => handleFilterChange('client', e.target.value)}
                                    className="pl-10 pr-12 h-12 w-full"
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                                >
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Filtros avanzados - Colapsables */}
                            {showAdvancedFilters && (
                                <div className="space-y-3 pt-2">
                                    {/* Filtro Placa */}
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile-plate" className="text-sm font-medium">Placa</Label>
                                        <Input
                                            id="mobile-plate"
                                            placeholder="Ej: ABC123"
                                            value={filters.plate || ''}
                                            onChange={(e) => handleFilterChange('plate', e.target.value)}
                                            className="h-10"
                                        />
                                    </div>

                                    {/* Filtro Cliente */}
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile-client" className="text-sm font-medium">Cliente</Label>
                                        <Input
                                            id="mobile-client"
                                            placeholder="Ej: Juan Pérez"
                                            value={filters.client || ''}
                                            onChange={(e) => handleFilterChange('client', e.target.value)}
                                            className="h-10"
                                        />
                                    </div>

                                    {/* Filtro Contacto */}
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile-contact" className="text-sm font-medium">Contacto</Label>
                                        <Input
                                            id="mobile-contact"
                                            placeholder="Ej: Ana Ramos"
                                            value={filters.contact || ''}
                                            onChange={(e) => handleFilterChange('contact', e.target.value)}
                                            className="h-10"
                                        />
                                    </div>

                                    {/* Filtro Número de Orden */}
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile-order" className="text-sm font-medium">N° Orden</Label>
                                        <Input
                                            id="mobile-order"
                                            placeholder="Ej: 00123"
                                            value={filters.order_number || ''}
                                            onChange={(e) => handleFilterChange('order_number', e.target.value)}
                                            className="h-10"
                                        />
                                    </div>

                                    {/* Filtro Agente Asignado */}
                                    {showAgentFilter && (
                                        <div className="space-y-2">
                                            <Label htmlFor="mobile-agent" className="text-sm font-medium">Agente Asignado</Label>
                                            <Select
                                                value={filters.assigned_agent_id || ''}
                                                onValueChange={(value) => handleFilterChange('assigned_agent_id', value)}
                                            >
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Todos" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Todos</SelectItem>
                                                    <SelectItem value="unassigned">Sin asignar</SelectItem>
                                                    <SelectItem value="assigned">Asignados</SelectItem>
                                                    {agents.filter(agent => agent.id && agent.name).map((agent) => (
                                                        <SelectItem key={agent.id} value={agent.id.toString()}>
                                                            {agent.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Botón Limpiar - Mobile - Solo cuando filtros están abiertos */}
                                    <div className="flex justify-center">
                                        <Button
                                            onClick={handleClearFilters}
                                            variant="outline"
                                            size="sm"
                                            className="text-[#235692] border-[#3075C7] hover:bg-[#EAF4FF] w-full"
                                        >
                                            Limpiar Filtros
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Botón Nueva Orden */}
            {hasPermission('inspections.create') && (
                <div className="flex justify-center flex-shrink-0">
                    <Button
                        onClick={() => showCreateModal(true)}
                        className="hidden md:flex items-center gap-2 px-2 border cursor-pointer bg-[#3075C7] hover:bg-[#003370] py-8 rounded-full"
                    >
                        <div className="flex items-center gap-2 px-4">
                            <PlusCircle className="h-4 w-4" />
                            <span className="text-lg font-medium">Nueva orden</span>
                        </div>
                    </Button>
                    
                    {/* Mobile version - Compact */}
                    <Button
                        onClick={() => showCreateModal(true)}
                        className="md:hidden h-12 w-12 bg-[#3075C7] hover:bg-[#003370] rounded-full flex items-center justify-center"
                    >
                        <PlusCircle className="h-5 w-5" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default OrdersFilters;
