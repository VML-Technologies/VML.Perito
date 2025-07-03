import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { NotificationProvider } from "@/contexts/notification-context"
import { AuthProvider } from "@/contexts/auth-context"
import { RBACProvider } from "@/contexts/rbac-context"
import { Dashboard } from "@/pages/Dashboard"
import Admin from "@/pages/Admin"
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
