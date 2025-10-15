import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useEffect, useMemo } from "react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { NotificationProvider } from "@/contexts/notification-context"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { RBACProvider, useRBAC } from "@/contexts/rbac-context"
import { RoleBasedRoute } from "@/components/RoleBasedRoute"
import { Dashboard } from "@/pages/Dashboard"
import Admin from "@/pages/Admin"
import Profile from "@/pages/Profile"
import ForcedPasswordChange from "@/pages/ForcedPasswordChange"
import ForgotPassword from "@/pages/ForgotPassword"
import ResetPassword from "@/pages/ResetPassword"
import ComercialMundial from "@/pages/ComercialMundial"
import AgenteContacto from "@/pages/AgenteContacto"
import CoordinadorContacto from "@/pages/CoordinadorContacto"
import CoordinadorVML from "@/pages/CoordinadorVML"
import NotificationTemplates from "@/pages/NotificationTemplates"
import ChannelConfigurations from "@/pages/ChannelConfigurations"
import NotificationAdmin from "@/pages/NotificationAdmin"
import CheckInspectionOrder from "@/pages/CheckInspectionOrder"
import InspectionReport from "@/pages/InspectionReport"
import Inspeccion from "@/pages/Inspeccion"
import InspectorAliado from "@/pages/InspectorAliado"
import GuestLayout from "@/Layouts/GuestLayout"
import { getDefaultRouteForUser } from "@/lib/role-utils"
import { useMatomo } from "@/hooks/use-matomo"
import { analytics, getPageName } from "@/utils/analytics"
import { Shield, Users, UserCheck, Phone, Building } from 'lucide-react'

// Mapa centralizado de rutas del sistema
const routesMap = {
    '/coordinador-contacto': {
        name: 'Coordinador de Contact Center',
        description: 'Supervisa y asigna agentes a las órdenes de inspección',
        route: '/coordinador-contacto',
        icon: Users,
        gradientClass: 'bg-gradient-to-r from-purple-500 to-purple-600',
        textClass: 'text-purple-100',
        buttonClass: 'text-purple-600 hover:text-purple-700',
        type: 'navigate',
        roles: ['coordinador_contacto']
    },
    '/comercial-mundial': {
        name: 'Comercial Mundial',
        description: 'Crea y gestiona órdenes de inspección vehicular',
        route: '/comercial-mundial',
        icon: Building,
        gradientClass: 'bg-gradient-to-r from-green-500 to-green-600',
        textClass: 'text-green-100',
        buttonClass: 'text-green-600 hover:text-green-700',
        type: 'navigate',
        roles: ['comercial_mundial', 'comercial_mundial_4']
    },
    '/agente-contacto': {
        name: 'Agente de Contact Center',
        description: 'Gestiona llamadas y agendamientos de inspecciones',
        route: '/agente-contacto',
        icon: Phone,
        gradientClass: 'bg-gradient-to-r from-orange-500 to-orange-600',
        textClass: 'text-orange-100',
        buttonClass: 'text-orange-600 hover:text-orange-700',
        type: 'navigate',
        roles: ['agente_contacto']
    },
    '/coordinador-vml': {
        name: 'Coordinador de VML',
        description: 'Supervisa y asigna agentes a las órdenes de inspección',
        route: '/coordinador-vml',
        icon: Users,
        gradientClass: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
        textClass: 'text-indigo-100',
        buttonClass: 'text-indigo-600 hover:text-indigo-700',
        type: 'navigate',
        roles: ['coordinador_vml']
    },
    '/inspector-aliado': {
        name: 'Inspector Aliado',
        description: 'Supervisa y asigna agentes a las órdenes de inspección',
        route: '/inspector-aliado',
        icon: Users,
        gradientClass: 'bg-gradient-to-r from-blue-500 to-blue-600',
        textClass: 'text-blue-100',
        buttonClass: 'text-blue-600 hover:text-blue-700',
        type: 'navigate',
        roles: ['inspector_aliado', 'inspector_aliado_2']
    },
    '/inspector': {
        name: 'Inspector',
        description: 'InspectYA | Realiza inspecciones vehiculares',
        route: '/inspector',
        icon: Users,
        gradientClass: 'bg-gradient-to-r from-red-500 to-red-600',
        textClass: 'text-red-100',
        buttonClass: 'text-red-600 hover:text-red-700',
        type: 'redirect',
        redirectUrl: import.meta.env.VITE_INSPECTYA_URL,
        roles: ['inspector']
    },
    '/supervisor': {
        name: 'Supervisor',
        description: 'InspectYA | Supervisa inspecciones vehiculares',
        route: '/supervisor',
        icon: Users,
        gradientClass: 'bg-gradient-to-r from-pink-500 to-pink-600',
        textClass: 'text-pink-100',
        buttonClass: 'text-pink-600 hover:text-pink-700',
        type: 'redirect',
        redirectUrl: import.meta.env.VITE_INSPECTYA_URL,
        roles: ['supervisor']
    }
}

// Componente para trackear rutas automáticamente
function RouteTracker() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Trackear vista de página cuando cambia la ruta
    const pageName = getPageName(location.pathname);
    analytics.pageView(pageName, location.pathname);

    // Trackear login si el usuario está autenticado y es la primera vez
    if (user && location.pathname !== '/login') {
      // Solo trackear login una vez por sesión
      const hasTrackedLogin = sessionStorage.getItem('matomo_login_tracked');
      if (!hasTrackedLogin) {
        analytics.userLogin(user.id, user.role);
        sessionStorage.setItem('matomo_login_tracked', 'true');
      }
    }
  }, [location.pathname, user]);

  return null; // Este componente no renderiza nada
}

// Componente para redirección inteligente
function SmartRedirect() {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: rbacLoading } = useRBAC();

  // Esperar a que ambos contextos carguen
  if (authLoading || rbacLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Usar los roles del contexto RBAC que están procesados correctamente
  const defaultRoute = roles && roles.length > 0
    ? getDefaultRouteForUser(roles)
    : '/dashboard';

  return <Navigate to={defaultRoute} replace />;
}

function AppContent() {
  // Inicializar Matomo Analytics
  useMatomo();

  // Memoizar routesMap para evitar recreaciones innecesarias
  const memoizedRoutesMap = useMemo(() => routesMap, []);

  return (
    <Router>
      <RouteTracker />
      <Routes>
        {/* Ruta pública para login */}
        <Route
          path="/login"
          element={<GuestLayout />}
        />

        {/* Ruta pública para recuperación de contraseña */}
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Ruta pública para resetear contraseña */}
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Ruta pública para inspección de asegurabilidad */}
        <Route
          path="/inspeccion/:hash"
          element={<Inspeccion />}
        />

        {/* Ruta de fallback para usuarios que puedan estar "pegados" en la ruta de espera */}
        <Route
          path="/espera/inspeccion/:hash"
          element={<Inspeccion />}
        />


        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <AuthenticatedLayout routesMap={memoizedRoutesMap}>
              <Dashboard routesMap={memoizedRoutesMap} />
            </AuthenticatedLayout>
          }
        />

        {/* Ruta de administración RBAC */}
        <Route
          path="/admin"
          element={
            <RoleBasedRoute requiredRoles={['admin', 'super_admin', 'help_desk']}>
              <AuthenticatedLayout routesMap={memoizedRoutesMap}>
                <Admin />
              </AuthenticatedLayout>
            </RoleBasedRoute>
          }
        />

        {/* Ruta de plantillas de notificación */}
        <Route
          path="/notification-templates"
          element={
            <RoleBasedRoute requiredRoles={['super_admin', 'admin']}>
              <AuthenticatedLayout routesMap={memoizedRoutesMap}>
                <NotificationTemplates />
              </AuthenticatedLayout>
            </RoleBasedRoute>
          }
        />

        {/* Ruta de configuración de canales */}
        <Route
          path="/channel-configurations"
          element={
            <RoleBasedRoute requiredRoles={['super_admin', 'admin']}>
              <AuthenticatedLayout routesMap={memoizedRoutesMap}>
                <ChannelConfigurations />
              </AuthenticatedLayout>
            </RoleBasedRoute>
          }
        />

        {/* Ruta de administración de notificaciones */}
        <Route
          path="/notification-admin"
          element={
            <RoleBasedRoute requiredRoles={['super_admin', 'admin']}>
              <AuthenticatedLayout routesMap={memoizedRoutesMap}>
                <NotificationAdmin />
              </AuthenticatedLayout>
            </RoleBasedRoute>
          }
        />

        {/* Ruta de perfil de usuario */}
        <Route
          path="/profile"
          element={
            <AuthenticatedLayout routesMap={memoizedRoutesMap}>
              <Profile />
            </AuthenticatedLayout>
          }
        />

        {/* Ruta de cambio de contraseña forzado */}
        <Route
          path="/forced-password-change"
          element={<ForcedPasswordChange />}
        />

        {/* ===== NUEVAS RUTAS - SISTEMA DE INSPECCIONES ===== */}

        {/* Ruta de Comercial Mundial */}
        <Route
          path="/comercial-mundial"
          element={
            <RoleBasedRoute requiredRoles={['comercial_mundial', 'comercial_mundial_4', 'super_admin', 'help_desk']}>
              <AuthenticatedLayout routesMap={memoizedRoutesMap}>
                <ComercialMundial />
              </AuthenticatedLayout>
            </RoleBasedRoute>
          }
        />

        {/* Ruta de Informe de Inspección */}
        <Route
          path="/inspection-report/:session_id"
          element={
            // <RoleBasedRoute requiredRoles={['comercial_mundial', 'coordinador_contacto', 'agente_contacto', 'super_admin']}>
              // <AuthenticatedLayout>
                <InspectionReport />
              // </AuthenticatedLayout>
            // </RoleBasedRoute>
          }
        />

        {/* Ruta de Coordinador de Contact Center */}
        <Route
          path="/coordinador-contacto"
          element={
            <RoleBasedRoute requiredRoles={['coordinador_contacto', 'super_admin', 'help_desk']}>
              <AuthenticatedLayout routesMap={memoizedRoutesMap}>
                <CoordinadorContacto />
              </AuthenticatedLayout>
            </RoleBasedRoute>
          }
        />

        {/* Ruta de Coordinador VML */}
        <Route
          path="/coordinador-vml"
          element={
            <RoleBasedRoute requiredRoles={['coordinador_vml', 'super_admin', 'help_desk']}>
              <AuthenticatedLayout routesMap={memoizedRoutesMap}>
                <CoordinadorVML />
              </AuthenticatedLayout>
            </RoleBasedRoute>
          }
        />

        {/* Ruta de Agente de Contact Center */}
        <Route
          path="/agente-contacto"
          element={
            <RoleBasedRoute requiredRoles={['agente_contacto', 'super_admin']}>
              <AuthenticatedLayout routesMap={memoizedRoutesMap}>
                <AgenteContacto />
              </AuthenticatedLayout>
            </RoleBasedRoute>
          }
        />

        {/* Ruta de Inspector Aliado */}
        <Route
          path="/inspector-aliado"
          element={
            <RoleBasedRoute requiredRoles={['inspector_aliado', 'inspector_aliado_2', 'super_admin']}>
              <AuthenticatedLayout routesMap={memoizedRoutesMap}>
                <InspectorAliado />
              </AuthenticatedLayout>
            </RoleBasedRoute>
          }
        />

        {/* Redirigir la ruta raíz */}
        <Route
          path="/"
          element={<SmartRedirect />}
        />

        {/* Ruta para cualquier otra URL no encontrada */}
        <Route
          path="*"
          element={<SmartRedirect />}
        />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <RBACProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </RBACProvider>
    </AuthProvider>
  )
}

export default App
