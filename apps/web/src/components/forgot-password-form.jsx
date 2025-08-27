import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppName } from "@/components/ui/app-name"
import { useNotificationContext } from "@/contexts/notification-context"
import { ArrowLeft, Mail } from "lucide-react"
import { API_ROUTES } from "@/config/api"

export function ForgotPasswordForm({
  className,
  ...props
}) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { showToast } = useNotificationContext()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(API_ROUTES.AUTH.REQUEST_PASSWORD_RESET, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast(data.message, "success")
        setSubmitted(true)
      } else {
        showToast(data.message || "Error al procesar la solicitud", "error")
      }
    } catch (error) {
      console.error('Error:', error)
      showToast("Error de conexión. Intenta nuevamente.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  if (submitted) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-center w-full mb-5">
                <AppName />
              </div>
              Solicitud Enviada
            </CardTitle>
            <CardDescription>
              Revisa tu correo electrónico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¡Email enviado!
                </h3>
                <p className="text-gray-600 mb-6">
                  Si el correo electrónico existe en nuestro sistema, recibirás un enlace para recuperar tu contraseña.
                </p>
                <div className="text-sm text-gray-500 space-y-2">
                  <p>• Revisa tu carpeta de spam si no encuentras el email</p>
                  <p>• El enlace expira en 24 horas</p>
                  <p>• Si no solicitaste este cambio, puedes ignorar el email</p>
                </div>
              </div>
              <Button 
                onClick={handleBackToLogin} 
                variant="outline" 
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio de sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-center w-full mb-5">
              <AppName />
            </div>
            Recuperar Contraseña
          </CardTitle>
          <CardDescription>
            Ingresa tu correo electrónico para recibir un enlace de recuperación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleBackToLogin}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio de sesión
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
