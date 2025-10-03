import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useEffect } from "react"
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

        {/* Ruta pública para consulta de placas */}
        <Route
          path="/checkinspectionorder"
          element={<CheckInspectionOrder />}
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
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          }
        />

        {/* Ruta de administración RBAC */}
        <Route
          path="/admin"
          element={
            <RoleBasedRoute requiredRoles={['admin', 'super_admin', 'help_desk']}>
              <AuthenticatedLayout>
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
              <AuthenticatedLayout>
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
              <AuthenticatedLayout>
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
              <AuthenticatedLayout>
                <NotificationAdmin />
              </AuthenticatedLayout>
            </RoleBasedRoute>
          }
        />

        {/* Ruta de perfil de usuario */}
        <Route
          path="/profile"
          element={
            <AuthenticatedLayout>
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
            <RoleBasedRoute requiredRoles={['comercial_mundial', 'super_admin', 'help_desk']}>
              <AuthenticatedLayout>
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
              <AuthenticatedLayout>
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
              <AuthenticatedLayout>
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
              <AuthenticatedLayout>
                <AgenteContacto />
              </AuthenticatedLayout>
            </RoleBasedRoute>
          }
        />

        {/* Ruta de Inspector Aliado */}
        <Route
          path="/inspector-aliado"
          element={
            <RoleBasedRoute requiredRoles={['inspector_aliado', 'super_admin']}>
              <AuthenticatedLayout>
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
