import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { NotificationProvider } from "@/contexts/notification-context"
import { AuthProvider } from "@/contexts/auth-context"
import { Dashboard } from "@/pages/Dashboard"
import GuestLayout from "@/Layouts/GuestLayout"

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  )
}

export default App
