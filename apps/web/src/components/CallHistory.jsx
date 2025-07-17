import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneCall, User, FileText } from 'lucide-react';

const CallHistory = ({
    callLogs = [],
    title = "Historial de Llamadas",
    description = "Registro de todas las llamadas realizadas",
    maxHeight = "max-h-40",
    showLimit = 5
}) => {
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const sortedCallLogs = callLogs
        .sort((a, b) => new Date(b.call_time) - new Date(a.call_time))
        .slice(0, showLimit);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <PhoneCall className="h-4 w-4" />
                    {title}
                </CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {callLogs && callLogs.length > 0 ? (
                    <div className={`space-y-3 ${maxHeight} overflow-y-auto`}>
                        {sortedCallLogs.map((call, index) => (
                            <div key={call.id || index} className="p-3 bg-muted/50 rounded-lg border-l-4 border-blue-500">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="font-medium text-sm">
                                            {call.status?.name || 'Estado desconocido'}
                                        </span>
                                    </div>
                                    <span className="text-muted-foreground text-xs">
                                        {formatDateTime(call.call_time)}
                                    </span>
                                </div>

                                <div className="space-y-1 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <User className="h-3 w-3" />
                                        <span>
                                            Agente: {call.Agent?.name || 'No especificado'}
                                        </span>
                                    </div>

                                    {call.comments && (
                                        <div className="flex items-start gap-2 mt-2">
                                            <FileText className="h-3 w-3 mt-0.5" />
                                            <span className="text-xs italic">
                                                "{call.comments}"
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {callLogs.length > showLimit && (
                            <div className="text-center text-xs text-muted-foreground py-2">
                                y {callLogs.length - showLimit} llamadas más...
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <PhoneCall className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No hay llamadas registradas</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default CallHistory; 