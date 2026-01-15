import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import logo from "@/assets/logo.svg"
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
import { useAuth } from "@/contexts/auth-context"
import { useNotificationContext } from "@/contexts/notification-context"
import { LoginBackground } from "./loginBackground"

export function LoginForm({
  className,
  ...props
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { showToast } = useNotificationContext()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login({ email, password })

    if (result.success) {
      showToast("Inicio de sesión exitoso", "success")
      // Usar la ruta por defecto según el rol del usuario
      navigate(result.defaultRoute || "/dashboard")
    } else {
      showToast(result.error || "Error al iniciar sesión", "error")
    }

    setLoading(false)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="flex flex-col items-center -mt-4 px-6">
          <img
            src={logo}
            alt="Logo"
            className="w-[140px] h-[140px] mb-2"
          /> 
          <CardTitle className="text-lg font-bold mb-1 text-center">
            Ingreso de Usuario
          </CardTitle>
          <CardDescription className="text-sm text-center px-2">
            Ingresa tu correo electrónico para iniciar sesión
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email" className="font-bold">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password" className="font-bold">Contraseña</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline cursor-pointer text-[#002EFF] hover:text-blue-700"
              >
                ¿Olvidaste tu contraseña?
              </button>
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full bg-[#235692] hover:bg-[#003370] text-white cursor-pointer rounded-xl"
                  disabled={loading}
                >
                  {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
