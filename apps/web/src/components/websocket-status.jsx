import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/hooks/use-websocket';

export const WebSocketStatus = () => {
    const { isConnected, connectionStatus, reconnectAttempts } = useWebSocket();

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected':
                return 'bg-green-500';
            case 'connecting':
            case 'reconnecting':
                return 'bg-yellow-500';
            case 'error':
            case 'failed':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusText = () => {
        switch (connectionStatus) {
            case 'connected':
                return 'Sistema funcional';
            case 'connecting':
                return 'Conectando al sistema...';
            case 'reconnecting':
                return `Reconectando... (${reconnectAttempts})`;
            case 'error':
                return 'Error de sistema';
            case 'failed':
                return 'Falló la conexión';
            default:
                return 'Desconectado';
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                    {getStatusText()}
                </div>
            </Badge>
        </div>
    );
}; 