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

    const getStatusDisplay = (status, inspectionResult) => {
        if (!inspectionResult) return status || 'Sin estado';
        return inspectionResult;
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

    const getSortIcon = (field) => {
        if (sortBy !== field) return null;
        return sortOrder == 'ASC' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const handleSort = (field) => {
        if (onSort) onSort(field);
    };

    const isContactTable = tableType == 'contact';

    const getTableTitle = () => isContactTable ? 'Órdenes Pendientes de Contacto' : 'Órdenes de Inspección';
    const getTableDescription = () => isContactTable ? `${orders.length} órdenes encontradas` : `${pagination.total || orders.length} órdenes encontradas`;

    const getCallLogsCount = (order) => {
        if (order.callLogsCount !== undefined && order.callLogsCount !== null) {
            const count = parseInt(order.callLogsCount);
            if (!isNaN(count)) return count;
        }
        if (Array.isArray(order.callLogs)) return order.callLogs.length;
        return 0;
    };

    return (
        <Card className="rounded-lg shadow-md">
            <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-ubuntu font-bold text-gray-800">{getTableTitle()}</CardTitle>
                <CardDescription className="text-gray-600 font-ubuntu">{getTableDescription()}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 font-ubuntu text-muted-foreground">Cargando órdenes...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto block">
                            <table className="w-full border-collapse">
                                <thead className='bg-blue-100'>
                                    <tr className="border-b">
                                        <th className="text-left p-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleSort('numero')} className="font-semibold font-ubuntu">
                                                Número {getSortIcon('numero')}
                                            </Button>
                                        </th>
                                        <th className="text-left p-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleSort('created_at')} className="font-semibold font-ubuntu">
                                                Fecha de creación {getSortIcon('created_at')}
                                            </Button>
                                        </th>
                                        <th className="text-left p-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleSort('nombre_cliente')} className="font-semibold font-ubuntu">
                                                Cliente {getSortIcon('nombre_cliente')}
                                            </Button>
                                        </th>
                                        <th className="font-ubuntu text-left p-2">Contacto</th>
                                        <th className="text-left p-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleSort('placa')} className="font-semibold font-ubuntu">
                                                Placa {getSortIcon('placa')}
                                            </Button>
                                        </th>
                                        <th className="text-left p-2 font-ubuntu">Intentos</th>
                                        <th className="text-left p-2 font-ubuntu">Estado</th>
                                        {showAgentColumn && <th className="text-left p-2 font-ubuntu">Agente Asignado</th>}
                                        {showActions && <th className="text-left p-2 font-ubuntu">Acciones</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length == 0 ? (
                                        <tr>
                                            <td colSpan={isContactTable ? (showActions ? 10 : 9) : (showAgentColumn && showActions ? 11 : showAgentColumn || showActions ? 10 : 9)} className="text-center p-8">
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
                                                        <span className='font-mono font-bold ms-2'>{order.numero}</span>
                                                        <Badge variant='outline' className='text-xs'>
                                                            {order.numero.toString().includes('9991') ? 'Orden Manual' : 'Integracion'}
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td className="p-2 font-bold text-sm">
                                                    <div>{formatDate(order.created_at)}</div>
                                                    <div className='text-xs text-[#3075C7] font-semibold'>Modalidad sugerida: {order.metodo_inspeccion_recomendado}</div>
                                                </td>
                                                <td className="p-2">
                                                    <div className="space-y-1">
                                                        <div className="font-bold">{order.nombre_cliente}</div>
                                                        <div className="text-sm text-[#3075C7]">{order.correo_cliente}</div>
                                                        <div className="text-sm text-[#3075C7] font-bold">{order.celular_cliente}</div>
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    <div className="space-y-1">
                                                        <div className="font-bold">{order.nombre_contacto}</div>
                                                        <div className="text-sm text-[#3075C7]">{order.correo_contacto}</div>
                                                        <div className="text-sm text-[#3075C7] font-bold">{order.celular_contacto}</div>
                                                    </div>
                                                </td>
                                                <td className="p-2 font-mono font-medium">
                                                    <div className="flex flex-col">
                                                        <span className='font-bold'>{order.placa}</span>
                                                        <span className='text-xs text-[#3075C7]'>{order.marca} - {order.modelo}</span>
                                                        <span className='text-xs font-mono'>{order.producto.split("_").join(" ")}</span>
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <span className={`font-medium text-sm px-2 py-1 rounded-full ${getCallLogsCount(order) == 0 ? 'bg-gray-100 text-gray-600' : getCallLogsCount(order) <= 2 ? 'bg-blue-100 text-blue-700' : getCallLogsCount(order) <= 4 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                            {getCallLogsCount(order)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    <Badge variant={order.badgeColor}>
                                                        {order.fixedStatus ? (['Agendado', 'inspeccion en curso'].includes(order.fixedStatus.toLowerCase()) ? 'Activo' : order.fixedStatus) : 'Sin estado'}
                                                    </Badge>
                                                </td>
                                                {showAgentColumn && (
                                                    <td className="p-2">
                                                        {order.AssignedAgent ? (
                                                            <div className="flex items-center gap-2">
                                                                <UserCheck className="h-4 w-4 text-green-600" />
                                                                <span className="text-sm">{order.AssignedAgent.name}</span>
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
                                                        <div className="flex items-center flex-col gap-2">
                                                            {isContactTable ? (
                                                                onContactOrder && (
                                                                    order.fixedStatus == 'Creada' ? (
                                                                        <Button size="sm" variant="outline" onClick={() => onContactOrder(order)}>
                                                                            <PhoneCall className="h-4 w-4 mr-2" /> Contactar
                                                                        </Button>
                                                                    ) : (
                                                                        <button className='text-sm text-muted-foreground border border-muted-foreground rounded-md px-2 py-1'>Ya Agendado</button>
                                                                    )
                                                                )
                                                            ) : (
                                                                <div className="flex gap-2">
                                                                    {onViewDetails && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => onViewDetails(order)}
                                                                            className="flex items-center gap-1 cursor-pointer text-[#3075C7] border-b-2 border-transparent hover:border-[#3075C7] hover:text-[#1056A1] rounded-none transition-colors duration-200"
                                                                        >
                                                                            Ver Resumen
                                                                            <Eye className="h-4 w-4 text-[#3075C7] group-hover:text-[#1056A1]" />
                                                                        </Button>
                                                                    )}

                                                                    {(order.InspectionOrderStatus.id && order.session_id && order.fixedStatus != 'No finalizada por novedad del cliente') && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => window.open(`/inspection-report/${order.id}`, '_blank')}
                                                                            className="flex items-center cursor-pointer gap-1 text-[#3075C7] border-b-2 border-transparent hover:border-[#3075C7] hover:text-[#1056A1] rounded-none transition-colors duration-200"
                                                                        >
                                                                            Ver Inspección
                                                                            <FileText className="h-4 w-4 mr-1" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {onAssignAgent && agents.length > 0 && (
                                                                <Select
                                                                    value={assigningOrder == order.id ? selectedAgent : (order.AssignedAgent?.id?.toString() || '')}
                                                                    onValueChange={(value) => {
                                                                        onAgentChange(value);
                                                                        onAssignAgent(order.id, value);
                                                                    }}
                                                                    disabled={assigningOrder == order.id}
                                                                >
                                                                    <SelectTrigger className="w-[120px] text-xs h-9">
                                                                        <SelectValue placeholder={order.AssignedAgent ? "Reasignar" : "Asignar"} />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="reassign">{order.AssignedAgent ? "Reasignar" : "Asignar"}</SelectItem>
                                                                        <SelectItem value="unassign">Quitar asignación</SelectItem>
                                                                        {agents.filter(agent => agent.id && agent.name).map(agent => (
                                                                            <SelectItem key={agent.id} value={agent.id.toString()}>{agent.name}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}

                                                            {assigningOrder == order.id && (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
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

                        {pagination.pages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Página {pagination.page} de {pagination.pages} ({pagination.total} total)
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => onPageChange(pagination.page - 1)} disabled={!pagination.hasPrev} className="rounded-xl cursor-pointer text-[#235692] border-[#3075C7] hover:bg-[#EAF4FF] hover:text-[#235692] disabled:text-[#235692] disabled:bg-[#FFFFFF] disabled:cursor-not-allowed">Anterior</Button>
                                    <Button variant="outline" size="sm" onClick={() => onPageChange(pagination.page + 1)} disabled={!pagination.hasNext} className="rounded-xl cursor-pointer text-[#235692] border-[#3075C7] hover:bg-[#EAF4FF] hover:text-[#235692] disabled:text-[#235692] disabled:bg-[#FFFFFF] disabled:cursor-not-allowed">Siguiente</Button>
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
