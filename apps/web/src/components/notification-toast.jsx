import { useEffect, useState } from 'react';
import { IconCheck, IconX, IconInfo, IconAlertTriangle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const TOAST_TYPES = {
    success: {
        icon: IconCheck,
        className: 'bg-green-50 border-green-200 text-green-800',
        iconClassName: 'text-green-600'
    },
    error: {
        icon: IconX,
        className: 'bg-red-50 border-red-200 text-red-800',
        iconClassName: 'text-red-600'
    },
    info: {
        icon: IconInfo,
        className: 'bg-blue-50 border-blue-200 text-blue-800',
        iconClassName: 'text-blue-600'
    },
    warning: {
        icon: IconAlertTriangle,
        className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        iconClassName: 'text-yellow-600'
    }
};

export function NotificationToast({
    message,
    type = 'info',
    duration = 3000,
    onClose
}) {
    const [isVisible, setIsVisible] = useState(true);
    const toastConfig = TOAST_TYPES[type];
    const IconComponent = toastConfig.icon;

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Esperar a que termine la animación
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className={`
      fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg
      transform transition-all duration-300 ease-in-out
      ${toastConfig.className}
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
            <div className="flex items-center gap-3">
                <IconComponent
                    size={20}
                    className={toastConfig.iconClassName}
                />
                <span className="text-sm font-medium">{message}</span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-2 hover:bg-black/10"
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                    }}
                >
                    <IconX size={14} />
                </Button>
            </div>
        </div>
    );
} 