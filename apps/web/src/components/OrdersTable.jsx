import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ChevronUp, ChevronDown, CheckCircle, XCircle, UserCheck, UserX, Eye, Phone, PhoneCall } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';


const OrdersTable = ({
    orders = [],
    pagination = {},
    onPageChange,
    onSort,
    sortBy = 'created_at',
    sortOrder = 'DESC',
    onViewDetails,
    onAssignAgent,
    onContactOrder,
    agents = [],
    assigningOrder = null,
    selectedAgent = '',
    onAgentChange,
    showAgentColumn = true,
    showActions = true,
    tableType = 'default', // 'default' | 'contact'
    emptyMessage = "No se encontraron órdenes",
    emptyDescription = "Ajusta los filtros para ver más resultados",
    loading = false
}) => {
    const { user } = useAuth();

    /**
     * Returns the display text for the order status, prioritizing inspection result if available.
     * @param {string} status - The general order status.
     * @param {string} inspectionResult - The inspection result status.
     * @returns {string} The display text for the status.
     */
    const getStatusDisplay = (status, inspectionResult) => {
        if (!inspectionResult) {
            return status || 'Sin estado';
        }
        return inspectionResult;
    };

    /**
     * Formats a date string into a localized short date and time string.
     * @param {string} dateString - The date string to format.
     * @returns {string} The formatted date string or 'N/A' if invalid.
     */
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

    /**
     * Returns the sort icon (up or down arrow) based on the current sort field and order.
     * @param {string} field - The field to check for sorting.
     * @returns {JSX.Element|null} The ChevronUp or ChevronDown icon, or null if not sorted by this field.
     */
    const getSortIcon = (field) => {
        if (sortBy !== field) return null;
        return sortOrder == 'ASC' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    /**
     * Handles the sorting of the table by a given field.
     * @param {string} field - The field to sort by.
     */
    const handleSort = (field) => {
        if (onSort) {
            onSort(field);
        }
    };

    // Determine table configuration based on tableType
    const isContactTable = tableType == 'contact';

    // Get appropriate title and description based on table type
    const getTableTitle = () => {
        return isContactTable ? 'Órdenes Pendientes de Contacto' : 'Órdenes de Inspección';
    };

    const getTableDescription = () => {
        return isContactTable
            ? `${orders.length} órdenes encontradas`
            : `${pagination.total || orders.length} órdenes encontradas`;
    };

    /**
     * Obtiene el conteo de intentos de llamada para una orden.
     * @param {Object} order - La orden de inspección
     * @returns {number} El número de intentos de llamada
     */
    const getCallLogsCount = (order) => {
        // Método 1: Si callLogsCount está disponible, usarlo
        if (order.callLogsCount !== undefined && order.callLogsCount !== null) {
            const count = parseInt(order.callLogsCount);
            if (!isNaN(count)) {
                return count;
            }
        }

        // Método 2: Si callLogs es un array, usar su longitud
        if (Array.isArray(order.callLogs)) {
            return order.callLogs.length;
        }

        // Valor por defecto
        return 0;
    };

    return (
        <Card className="rounded-lg shadow-md">
            <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-800">{getTableTitle()}</CardTitle>
                <CardDescription className="text-gray-600">
                    {getTableDescription()}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-muted-foreground">Cargando órdenes...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Table view for medium and larger screens */}
                        <div className="overflow-x-auto block">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSort('numero')}
                                                className="font-semibold"
                                            >
                                                Número {getSortIcon('numero')}
                                            </Button>
                                        </th>
                                        <th className="text-left p-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSort('nombre_cliente')}
                                                className="font-semibold"
                                            >
                                                Cliente {getSortIcon('nombre_cliente')}
                                            </Button>
                                        </th>
                                        <th className="text-left p-2">Contacto</th>
                                        <th className="text-left p-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSort('placa')}
                                                className="font-semibold"
                                            >
                                                Placa {getSortIcon('placa')}
                                            </Button>
                                        </th>
                                        <th className="text-left p-2">Intentos</th>
                                        <th className="text-left p-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSort('created_at')}
                                                className="font-semibold"
                                            >
                                                Fecha de solicitud {getSortIcon('created_at')}
                                            </Button>
                                        </th>
                                        <th className="text-left p-2">Estado</th>
                                        {showAgentColumn && (
                                            <th className="text-left p-2">Agente Asignado</th>
                                        )}
                                        {showActions && (
                                            <th className="text-left p-2">Acciones</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length == 0 ? (
                                        <tr>
                                            <td colSpan={
                                                isContactTable
                                                    ? (showActions ? 10 : 9)
                                                    : (showAgentColumn && showActions ? 11 : showAgentColumn || showActions ? 10 : 9)
                                            } className="text-center p-8">
                                                <div className="text-muted-foreground">
                                                    {isContactTable ? (
                                                        <Phone className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                    ) : (
                                                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                    )}
                                                    <p>{emptyMessage}</p>
                                                    <p className="text-sm">{emptyDescription}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order.id} className="border-b hover:bg-muted/50">
                                                <td className="p-2 font-mono font-medium">
                                                    <div className='flex flex-col gap-0'>
                                                        <span className='font-mono font-medium ms-2'>
                                                            {order.numero}
                                                        </span>
                                                        <Badge variant='outline' className='text-xs'>
                                                            {
                                                                order.numero.toString().includes('9991') ? (
                                                                    <>
                                                                        Orden Manual
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        Integracion
                                                                    </>
                                                                )
                                                            }
                                                        </Badge>
                                                    </div>

                                                </td>
                                                <td className="p-2">
                                                    <div className="space-y-1">
                                                        <div className="font-medium">{order.nombre_cliente}</div>
                                                        <div className="text-sm text-muted-foreground">{order.correo_cliente}</div>
                                                        <div className="text-sm font-mono">{order.celular_cliente}</div>
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    <div className="space-y-1">
                                                        <div className="font-medium">{order.nombre_contacto}</div>
                                                        <div className="text-sm text-muted-foreground">{order.correo_contacto}</div>
                                                        <div className="text-sm font-mono">{order.celular_contacto}</div>
                                                    </div>
                                                </td>
                                                <td className="p-2 font-mono font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{order.placa}</span>
                                                        <span className='text-xs text-muted-foreground'>{order.marca} - {order.modelo}</span>
                                                        <span className='text-xs font-mono'>{order.producto.split("_").join(" ")}</span>
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <span className={`font-medium text-sm px-2 py-1 rounded-full ${getCallLogsCount(order) == 0
                                                            ? 'bg-gray-100 text-gray-600'
                                                            : getCallLogsCount(order) <= 2
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : getCallLogsCount(order) <= 4
                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                    : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {getCallLogsCount(order)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-2 text-sm">{formatDate(order.created_at)}</td>
                                                <td className="p-2">
                                                    <Badge variant={order.badgeColor}>
                                                        {order.fixedStatus}
                                                    </Badge>
                                                </td>
                                                {showAgentColumn && (
                                                    <td className="p-2">
                                                        {order.AssignedAgent ? (
                                                            <div className="flex items-center gap-2">
                                                                <UserCheck className="h-4 w-4 text-green-600" />
                                                                <span className="text-sm">
                                                                    {order.AssignedAgent.name}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <UserX className="h-4 w-4 text-red-500" />
                                                                <span className="text-sm text-muted-foreground">Sin asignar</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                )}
                                                {showActions && (
                                                    <td className="p-2">
                                                        <div className="flex items-center gap-2">
                                                            {isContactTable ? (
                                                                // Contact table actions
                                                                onContactOrder && (
                                                                    <>
                                                                        {
                                                                            order.fixedStatus == 'Creada' ? (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    onClick={() => onContactOrder(order)}
                                                                                >
                                                                                    <PhoneCall className="h-4 w-4 mr-2" />
                                                                                    Contactar
                                                                                </Button>
                                                                            ) : <>
                                                                                <button className='text-sm text-muted-foreground border border-muted-foreground rounded-md px-2 py-1'>
                                                                                    Ya Agendado
                                                                                </button>
                                                                            </>
                                                                        }
                                                                    </>
                                                                )
                                                            ) : (
                                                                <>
                                                                    {onViewDetails && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => onViewDetails(order)}
                                                                        >
                                                                            <Eye className="h-4 w-4 mr-1" />
                                                                            Ver Resumen
                                                                        </Button>
                                                                    )}

                                                                    {
                                                                        (user.email.includes('segurosmundial.com.co') && order.fixedStatus.includes('Finalizado') && order.session_id) ? <>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => {
                                                                                    window.open(`/inspection-report/${order.session_id}`, '_blank');
                                                                                }}
                                                                            >
                                                                                <FileText className="h-4 w-4 mr-1" />
                                                                                Ver Inspección
                                                                            </Button>
                                                                        </> : <></>
                                                                    }

                                                                    {onAssignAgent && agents.length > 0 && (
                                                                        <Select
                                                                            value={assigningOrder == order.id ? selectedAgent : (order.AssignedAgent?.id?.toString() || '')}
                                                                            onValueChange={(value) => {
                                                                                onAgentChange(value); // Update local state for the select
                                                                                onAssignAgent(order.id, value); // Trigger assignment action
                                                                            }}
                                                                            disabled={assigningOrder == order.id}
                                                                        >
                                                                            <SelectTrigger className="w-[120px] text-xs h-9"> {/* Adjusted width and height */}
                                                                                <SelectValue placeholder={order.AssignedAgent ? "Reasignar" : "Asignar"} />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="reassign">{order.AssignedAgent ? "Reasignar" : "Asignar"}</SelectItem>
                                                                                <SelectItem value="unassign">Quitar asignación</SelectItem>
                                                                                {agents.filter(agent => agent.id && agent.name).map((agent) => (
                                                                                    <SelectItem key={agent.id} value={agent.id.toString()}>
                                                                                        {agent.name}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    )}

                                                                    {assigningOrder == order.id && (
                                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination remains visible for both views */}
                        {pagination.pages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Página {pagination.page} de {pagination.pages} ({pagination.total} total)
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onPageChange(pagination.page - 1)}
                                        disabled={!pagination.hasPrev}
                                    >
                                        Anterior
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onPageChange(pagination.page + 1)}
                                        disabled={!pagination.hasNext}
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
    );
};

export default OrdersTable;
