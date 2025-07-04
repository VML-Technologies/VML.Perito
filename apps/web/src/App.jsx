import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { NotificationProvider } from "@/contexts/notification-context"
import { AuthProvider } from "@/contexts/auth-context"
import { RBACProvider } from "@/contexts/rbac-context"
import { RoleBasedRoute } from "@/components/RoleBasedRoute"
import { Dashboard } from "@/pages/Dashboard"
import Admin from "@/pages/Admin"
import Profile from "@/pages/Profile"
import ComercialMundial from "@/pages/ComercialMundial"
import AgenteContacto from "@/pages/AgenteContacto"
import GuestLayout from "@/Layouts/GuestLayout"

function App() {
  return (
    <AuthProvider>
      <RBACProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              {/* Ruta pública para login */}
              <Route
                path="/login"
                element={<GuestLayout />}
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

              {/* Ruta de perfil de usuario */}
              <Route
                path="/profile"
                element={
                  <AuthenticatedLayout>
                    <Profile />
                  </AuthenticatedLayout>
                }
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

              {/* Ruta de Agente de Contact */}
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
                element={<Navigate to="/dashboard" replace />}
              />

              {/* Ruta para cualquier otra URL no encontrada */}
              <Route
                path="*"
                element={<Navigate to="/dashboard" replace />}
              />
            </Routes>
          </Router>
        </NotificationProvider>
      </RBACProvider>
    </AuthProvider>
  )
}

export default App
