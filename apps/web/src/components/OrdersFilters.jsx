import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const OrdersFilters = ({
    filters = {},
    onFilterChange,
    onClearFilters,
    agents = [],
    showAgentFilter = false,
    showDateFilters = true,
    showStatusFilter = true,
    showSearchFilter = true,
    gridCols = "md:grid-cols-4", // This prop is less relevant with flex layout but kept for compatibility
    title = "Filtros y Búsqueda",
    description = "Filtra las órdenes según tus criterios"
}) => {
    /**
     * Handles changes to filter values.
     * Converts 'all' to an empty string for backend compatibility.
     * @param {string} key - The filter key (e.g., 'search', 'status').
     * @param {string} value - The new value for the filter.
     */
    const handleFilterChange = (key, value) => {
        // Convert special 'all' value to an empty string for backend compatibility
        const backendValue = (value == 'all') ? '' : value;
        onFilterChange(key, backendValue);
    };

    /**
     * Clears all filters and resets them to their default values.
     */
    const handleClearFilters = () => {
        const defaultFilters = {
            search: '',
            status: '',
            date_from: '',
            date_to: '',
            sortBy: 'created_at',
            sortOrder: 'DESC'
        };

        // Add assigned_agent_id to default filters if the agent filter is shown
        if (showAgentFilter) {
            defaultFilters.assigned_agent_id = '';
        }

        onClearFilters(defaultFilters);
    };

    return (
        <div className="rounded-lg shadow-md"> {/* Added rounded corners and shadow for better visual appeal */}
            <div className="px-4"> {/* Adjusted padding-bottom */}
                <CardTitle className="text-2xl font-bold text-gray-800">{title}</CardTitle>
                <CardDescription className="text-gray-600">{description}</CardDescription>
            </div>
            <div className="p-4"> {/* Adjusted padding-top */}
                {/* Changed to flex container for inline layout, allowing items to wrap and align at the bottom */}
                <div className="flex flex-wrap items-end gap-4">
                    {showSearchFilter && (
                        <div className="flex flex-col space-y-2 flex-grow min-w-[200px]"> {/* flex-grow to distribute space, min-w for responsiveness */}
                            <Label htmlFor="search" className="text-sm font-medium text-gray-700">Buscar</Label>
                            <Input
                                id="search"
                                placeholder="Placa, cliente, documento..."
                                value={filters.search || ''}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    )}

                    {showAgentFilter && (
                        <div className="flex flex-col space-y-2 flex-grow min-w-[200px]">
                            <Label htmlFor="agent" className="text-sm font-medium text-gray-700">Agente Asignado</Label>
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

                    {/* Clear Filters Button - positioned at the end of the flex row, aligning to the bottom */}
                    <div className="flex self-end"> {/* self-end aligns button to the bottom of the flex container */}
                        <Button
                            onClick={handleClearFilters}
                            variant="secondary"
                            size="sm"
                            className="text-xs px-4 py-2 rounded-md shadow-sm hover:bg-gray-100 transition-colors duration-200"
                        >
                            Limpiar Filtros
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersFilters; 