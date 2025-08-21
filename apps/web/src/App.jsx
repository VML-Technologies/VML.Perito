import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { NotificationProvider } from "@/contexts/notification-context"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { RBACProvider, useRBAC } from "@/contexts/rbac-context"
import { RoleBasedRoute } from "@/components/RoleBasedRoute"
import { Dashboard } from "@/pages/Dashboard"
import Admin from "@/pages/Admin"
import Profile from "@/pages/Profile"
import ForcedPasswordChange from "@/pages/ForcedPasswordChange"
import ComercialMundial from "@/pages/ComercialMundial"
import AgenteContacto from "@/pages/AgenteContacto"
import CoordinadorContacto from "@/pages/CoordinadorContacto"
import NotificationTemplates from "@/pages/NotificationTemplates"
import ChannelConfigurations from "@/pages/ChannelConfigurations"
import NotificationAdmin from "@/pages/NotificationAdmin"
import CheckInspectionOrder from "@/pages/CheckInspectionOrder"
import GuestLayout from "@/Layouts/GuestLayout"
import { getDefaultRouteForUser } from "@/lib/role-utils"

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
  return (
    <Router>
      <Routes>
        {/* Ruta pública para login */}
        <Route
          path="/login"
          element={<GuestLayout />}
        />

        {/* Ruta pública para consulta de placas */}
        <Route
          path="/checkinspectionorder"
          element={<CheckInspectionOrder />}
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
          element={<Admin />}
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
            <RoleBasedRoute requiredRoles={['comercial_mundial', 'super_admin']}>
              <AuthenticatedLayout>
                <ComercialMundial />
              </AuthenticatedLayout>
            </RoleBasedRoute>
          }
        />

        {/* Ruta de Coordinador de Contact Center */}
        <Route
          path="/coordinador-contacto"
          element={
            <RoleBasedRoute requiredRoles={['coordinador_contacto', 'super_admin']}>
              <AuthenticatedLayout>
                <CoordinadorContacto />
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
