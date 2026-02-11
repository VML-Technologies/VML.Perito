import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import logo from "@/assets/logo.svg"
import movilidadMobile from "@/assets/loginAssets/movilidadMobile.png"
import cloudImage from "@/assets/loginAssets/Cloud.png"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
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

export function LoginForm({
  className,
  ...props
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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
      {/* Desktop Card Version */}
      <div className="hidden md:block">
        <Card>
          <CardHeader className="flex flex-col items-center -mt-4 px-6">
            <img
              src={logo}
              alt="Logo"
              className="w-[140px] h-[140px] mb-2"
            />
            <CardTitle className="text-2xl font-bold mb-1 text-center text-gray-900">
              ¡Hola! Inicia sesión
            </CardTitle>
            <CardDescription className="text-sm text-center px-2 text-gray-600">
              Ingresa tu correo electrónico para iniciar sesión.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email-desktop" className="font-bold text-base">Correo electrónico</Label>
                  <Input
                    id="email-desktop"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 text-base"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password-desktop" className="font-bold text-base">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password-desktop"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 text-base pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8A8787] hover:text-[#6B6B6B]"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="ml-auto inline-block text-sm underline underline-offset-4 hover:underline cursor-pointer text-[#235692] font-medium hover:text-blue-700"
                >
                  ¿Olvidaste tu contraseña?
                </button>
                <Button
                  type="submit"
                  className="w-full bg-[#235692] hover:bg-[#003370] text-white cursor-pointer rounded-xl h-10 text-base"
                  disabled={loading}
                >
                  {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Version without Card */}
      <div className="block md:hidden">
        <div className="space-y-6">
          {/* Cloud Image above title */}
          <div className="relative mb-8 z-10 mt-2">
            <img
              src={cloudImage}
              alt="Cloud"
              className="w-20 h-auto ml-16"
            />
          </div>

          {/* Title and Subtitle */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-[700] text-[#235692]">¡Hola! Inicia sesión</h1>
            <p className="text-sm text-gray-600">Ingresa tu correo electrónico para iniciar sesión.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-1">
                <Label htmlFor="email-mobile" className="font-normal text-sm text-gray-600">Dirección de correo electrónico</Label>
                <Input
                  id="email-mobile"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base placeholder:text-sm"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="password-mobile" className="font-normal text-sm text-gray-600">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password-mobile"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8A8787] hover:text-[#6B6B6B]"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="ml-auto inline-block text-base underline underline-offset-4 hover:underline cursor-pointer text-[#235692] font-medium hover:text-blue-700"
              >
                ¿Olvidaste tu contraseña?
              </button>
              <Button
                type="submit"
                className="w-full bg-[#235692] hover:bg-[#003370] text-white cursor-pointer rounded-full h-12 text-base"
                disabled={loading}
              >
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </div>
          </form>
        </div>

        {/* Mobile Image */}
        <div className="mt-7">
          <img
            src={movilidadMobile}
            alt="Movilidad Mundial Mobile"
            className="w-full h-auto scale-130 opacity-85 mt-0"
          />
        </div>
      </div>
    </div>
  );
}