import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { NotificationToast } from "@/components/notification-toast"
import { useNotificationContext } from "@/contexts/notification-context"
import { ProtectedRoute } from "@/components/protected-route"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useWebSocket } from "@/hooks/use-websocket"
import { useAuth } from '@/contexts/auth-context';
import { useRoles } from '@/hooks/use-roles';
import { useEffect, useState } from "react";
import Joyride from 'react-joyride';
import { Button } from "@/components/ui/button"
import { useTutorial } from '@/contexts/tutorial-context';

const tutorialSteps = [
    {
        target: '.tutorial-startButton',
        content: 'Este es el botón para iniciar el tutorial, puedes iniciarlo en cualquier momento',
    },
    {
        target: '.tutorial-websocketStatus',
        content: 'Este es el estado de la conexión con el servidor, si está conectado, puedes realizar las acciones necesarias',
    },
    {
        target: '.tutorial-profile',
        content: 'Este es el perfil del usuario, aquí puedes ver el nombre del usuario y el estado de su conexión',
    },
    {
        target: '.tutorial-userState',
        content: 'Este es el estado del usuario, aquí puedes ver el estado de su conexión',
    },
    {
        target: '.tutorial-userRole',
        content: 'Este es el rol de usuario que tienes en la aplicación',
    },
    {
        target: '.tutorial-search',
        content: 'Este es el buscador de órdenes',
    },
    {
        target: '.tutorial-ordersList',
        content: 'Esta es la lista de órdenes pendientes de contacto',
    },
    {
        target: '.tutorial-orderDetails',
        content: 'Aquí puedes ver los detalles de la orden seleccionada',
    },
    {
        target: '.tutorial-contactButton',
        content: 'Este es el botón de contacto. Al hacer clic en él se abrirá el panel de gestión de la orden',
    },
    {
        target: '.tutorial-callForm',
        content: 'Este es el formulario de llamada, aquí puedes registrar la llamada y el agendamiento si es necesario',
    },
    {
        target: '.tutorial-callHistory',
        content: 'Aquí puedes ver el historial de llamadas realizadas a este cliente',
    },
    {
        target: '.tutorial-agendaForm',
        content: 'Este es el formulario para agendar una inspección. Solo aparece si el estado de llamada lo requiere',
        disableBeacon: true,
    },
    {
        target: '.tutorial-submitButton',
        content: 'Haz clic aquí para registrar la llamada (y agendar si corresponde)',
    },
];

function AuthenticatedLayout({ children }) {
    const { user, logout } = useAuth();
    const { hasRole, loading } = useRoles();
    const canAccessAdmin = hasRole('admin') || hasRole('super_admin');
    const { toast, hideToast } = useNotificationContext();
    const { tutorialAction, setTutorialAction } = useTutorial();


    const [runTutorial, setRunTutorial] = useState(() => {
        return !localStorage.getItem('agenteContactoTutorialVisto');
    });
    const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
    const [tutorialPaused, setTutorialPaused] = useState(false);
    const handleTutotialCallback = (data) => {
        const { status, type, index, lifecycle } = data;
        if (type === 'step:after' && index === 5) {
            setTutorialPaused(true); // Pausa el tutorial
            setTutorialStepIndex(index + 1); // Guarda el siguiente paso
            setTutorialAction({ type: 'abrirPanel', payload: { orderIndex: 0 } });
            return; // Detén el flujo aquí
        }
        // Si el paso de agendamiento no está visible, saltar ese paso
        if (type === 'step:before' && tutorialSteps[index].target === '.tutorial-agendaForm' && !showAppointmentForm) {
            // Saltar al siguiente paso
            return false;
        }
        if ((['finished', 'skipped']).includes(status)) {
            setRunTutorial(false);
            localStorage.setItem('agenteContactoTutorialVisto', 'true');
        }
    };
    useEffect(() => {
        if (tutorialPaused) {
            // Espera un pequeño delay para asegurar que el DOM esté listo
            setTimeout(() => {
                setTutorialPaused(false);
            }, 300);
        }
    }, [tutorialPaused]);
    // Inicializar WebSocket para toda la aplicación autenticada
    useWebSocket();
    return (
        <ProtectedRoute>
            <SidebarProvider>

                <Joyride
                    steps={tutorialSteps}
                    run={!tutorialPaused && runTutorial}
                    stepIndex={tutorialPaused ? tutorialStepIndex : undefined}
                    callback={handleTutotialCallback}
                    continuous
                    showProgress
                    showSkipButton
                    styles={{
                        options: {
                            zIndex: 10000, // Asegura que el tour esté por encima de otros elementos
                        },
                    }}
                    locale={{
                        back: 'Atrás',
                        close: 'Cerrar',
                        last: 'Finalizar',
                        next: 'Siguiente',
                        skip: 'Saltar'
                    }}
                />
                <div className="flex justify-end">
                    <Button className="tutorial-startButton" variant="outline" onClick={() => {
                        setRunTutorial(true);
                        localStorage.removeItem('agenteContactoTutorialVisto');
                    }}>
                        Iniciar tutorial
                    </Button>
                </div>
                {
                    canAccessAdmin && (
                        <AppSidebar />
                    )
                }
                <SidebarInset>
                    <SiteHeader />
                    <div className="m-4">
                        {children}
                    </div>
                </SidebarInset>

                {/* Sistema de Toasts */}
                {toast && (
                    <NotificationToast
                        message={toast.message}
                        type={toast.type}
                        onClose={hideToast}
                    />
                )}
            </SidebarProvider>
        </ProtectedRoute>
    )
}

export default AuthenticatedLayout;
