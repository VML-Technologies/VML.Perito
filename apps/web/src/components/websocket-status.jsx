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
                return 'Conectado';
            case 'connecting':
                return 'Conectando...';
            case 'reconnecting':
                return `Reconectando... (${reconnectAttempts})`;
            case 'error':
                return 'Error';
            case 'failed':
                return 'Falló';
            default:
                return 'Desconectado';
        }
    };

    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <Badge variant="outline" className="text-xs">
                WebSocket: {getStatusText()}
            </Badge>
        </div>
    );
}; 