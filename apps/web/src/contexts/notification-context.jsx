import { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from '@/hooks/use-notifications';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const notificationData = useNotifications();

    return (
        <NotificationContext.Provider value={notificationData}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationContext() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext debe ser usado dentro de NotificationProvider');
    }
    return context;
} 