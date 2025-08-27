import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
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
import { ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle, Check, X } from "lucide-react"
import { API_ROUTES } from "@/config/api"

export function ResetPasswordForm({
  className,
  ...props
}) {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(null)
  const [tokenLoading, setTokenLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState({ isValid: false, errors: [], strength: 0 })
  const [showPasswordValidation, setShowPasswordValidation] = useState(false)
  
  const { showToast } = useNotificationContext()
  const navigate = useNavigate()

  // Validar token al cargar el componente
  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      setTokenLoading(false)
      return
    }

    const validateToken = async () => {
      try {
        const response = await fetch(API_ROUTES.AUTH.VERIFY_RESET_TOKEN(token), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()
        setTokenValid(response.ok && data.valid)
      } catch (error) {
        console.error('Error validando token:', error)
        setTokenValid(false)
      } finally {
        setTokenLoading(false)
      }
    }

    validateToken()
  }, [token])

  // Política de contraseñas (copiada del PasswordService del backend)
  const PASSWORD_POLICY = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    preventSequentialChars: true,
    preventRepeatedChars: true
  };

  // Contraseñas comunes que deben evitarse
  const COMMON_PASSWORDS = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'hello',
    'freedom', 'whatever', 'qazwsx', 'trustno1', 'jordan', 'harley',
    'ranger', 'iwantu', 'jennifer', 'hunter', 'joshua', 'maggie',
    'shadow', 'melissa', 'andrea', 'buster', 'jessica', 'danny',
    'oliver', 'charlie', 'andrew', 'michelle', 'jackson', 'tiger',
    'nicole', 'elephant', 'great', 'spider', 'computer', 'contraseña',
    '12345', 'mi contraseña', 'acceso', 'usuario', 'secreto',
    'admin123', 'clave', 'seguridad', 'hola123', 'prueba', 'bienvenido',
    'mexico', 'colombia', 'argentina', 'futbol', 'amor', 'felicidad',
    'estrella', 'angel', 'princesa', 'campeon', 'sol', 'luna', 'maestro',
    'dios', 'familia', 'amigos'
  ];

  // Validar contraseña según la política (copiada del PasswordService)
  const validatePassword = (password) => {
    const errors = [];

    // Longitud mínima y máxima
    if (password.length < PASSWORD_POLICY.minLength) {
      errors.push(`Tener al menos ${PASSWORD_POLICY.minLength} caracteres`);
    }

    if (password.length > PASSWORD_POLICY.maxLength) {
      errors.push(`No tener más de ${PASSWORD_POLICY.maxLength} caracteres`);
    }

    // Requerir mayúsculas
    if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Contener al menos una letra mayúscula');
    }

    // Requerir minúsculas
    if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Contener al menos una letra minúscula');
    }

    // Requerir números
    if (PASSWORD_POLICY.requireNumbers && !/\d/.test(password)) {
      errors.push('Contener al menos un número');
    }

    // Requerir caracteres especiales
    if (PASSWORD_POLICY.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Contener al menos un carácter especial (!@#$%^&*()_+-=[]{}|;:,.<>?)');
    }

    // Prevenir contraseñas comunes
    if (PASSWORD_POLICY.preventCommonPasswords && COMMON_PASSWORDS.includes(password.toLowerCase())) {
      errors.push('Ser menos común');
    }

    // Prevenir caracteres secuenciales (123, abc, etc.)
    if (PASSWORD_POLICY.preventSequentialChars) {
      const sequentialPatterns = [
        '123', '234', '345', '456', '567', '678', '789', '890',
        'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij',
        'qwe', 'wer', 'ert', 'rty', 'tyu', 'yui', 'uio', 'iop',
        'asd', 'sdf', 'dfg', 'fgh', 'ghj', 'hjk', 'jkl', 'klz'
      ];

      const lowerPassword = password.toLowerCase();
      for (const pattern of sequentialPatterns) {
        if (lowerPassword.includes(pattern)) {
          errors.push('No contener caracteres secuenciales');
          break;
        }
      }
    }

    // Prevenir caracteres repetidos (aaa, 111, etc.)
    if (PASSWORD_POLICY.preventRepeatedChars) {
      for (let i = 0; i < password.length - 2; i++) {
        if (password[i] == password[i + 1] && password[i] == password[i + 2]) {
          errors.push('No contener el mismo carácter repetido más de 2 veces');
          break;
        }
      }
    }

    return {
      isValid: errors.length == 0,
      errors
    };
  };

  // Calcular fortaleza de la contraseña (0-100)
  const calculatePasswordStrength = (password) => {
    let score = 0;

    // Longitud
    if (password.length >= 8) score += 10;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Complejidad
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/\d/.test(password)) score += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;

    // Variedad de caracteres
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= 8) score += 10;
    if (uniqueChars >= 12) score += 10;

    // Bonus por longitud extra
    if (password.length > 20) score += 10;

    return Math.min(score, 100);
  };

  // Obtener descripción de la fortaleza
  const getPasswordStrengthDescription = (strength) => {
    if (strength < 30) return { level: 'Muy Débil', color: 'red' };
    if (strength < 50) return { level: 'Débil', color: 'orange' };
    if (strength < 70) return { level: 'Moderada', color: 'yellow' };
    if (strength < 90) return { level: 'Fuerte', color: 'lightgreen' };
    return { level: 'Muy Fuerte', color: 'green' };
  };

  // Validar contraseña en tiempo real
  useEffect(() => {
    if (password) {
      const validation = validatePassword(password);
      const strength = calculatePasswordStrength(password);
      setPasswordValidation({ ...validation, strength });
      setShowPasswordValidation(true);
    } else {
      setPasswordValidation({ isValid: false, errors: [], strength: 0 });
      setShowPasswordValidation(false);
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar contraseñas
    if (!passwordValidation.isValid) {
      showToast(`Errores en la contraseña: ${passwordValidation.errors.join(', ')}`, "error")
      return
    }

    if (password !== confirmPassword) {
      showToast("Las contraseñas no coinciden", "error")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(API_ROUTES.AUTH.RESET_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: password }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast(data.message, "success")
        setSuccess(true)
      } else {
        showToast(data.message || "Error al actualizar la contraseña", "error")
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

  // Mostrar loading mientras valida el token
  if (tokenLoading) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-center w-full mb-5">
                <AppName />
              </div>
              Validando enlace...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mostrar error si el token es inválido
  if (!tokenValid) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-center w-full mb-5">
                <AppName />
              </div>
              Enlace Inválido
            </CardTitle>
            <CardDescription>
              El enlace de recuperación no es válido o ha expirado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Enlace no válido
                </h3>
                <p className="text-gray-600 mb-6">
                  El enlace de recuperación ha expirado o no es válido. Solicita un nuevo enlace de recuperación.
                </p>
              </div>
              <Button 
                onClick={handleBackToLogin} 
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

  // Mostrar éxito después de cambiar la contraseña
  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-center w-full mb-5">
                <AppName />
              </div>
              ¡Contraseña Actualizada!
            </CardTitle>
            <CardDescription>
              Tu contraseña ha sido cambiada exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¡Contraseña actualizada!
                </h3>
                <p className="text-gray-600 mb-6">
                  Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
              </div>
              <Button 
                onClick={handleBackToLogin} 
                className="w-full"
              >
                Iniciar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Formulario principal para cambiar contraseña
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-center w-full mb-5">
              <AppName />
            </div>
            Nueva Contraseña
          </CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="password">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Ingresa tu nueva contraseña"
                    className={showPasswordValidation && !passwordValidation.isValid ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Medidor de fortaleza */}
                {showPasswordValidation && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Fortaleza de la contraseña:</span>
                      <span className={`font-medium ${
                        passwordValidation.strength < 30 ? 'text-red-500' :
                        passwordValidation.strength < 50 ? 'text-orange-500' :
                        passwordValidation.strength < 70 ? 'text-yellow-500' :
                        passwordValidation.strength < 90 ? 'text-green-500' :
                        'text-green-600'
                      }`}>
                        {getPasswordStrengthDescription(passwordValidation.strength).level}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordValidation.strength < 30 ? 'bg-red-500' :
                          passwordValidation.strength < 50 ? 'bg-orange-500' :
                          passwordValidation.strength < 70 ? 'bg-yellow-500' :
                          passwordValidation.strength < 90 ? 'bg-green-500' :
                          'bg-green-600'
                        }`}
                        style={{ width: `${passwordValidation.strength}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Validaciones en tiempo real */}
                {showPasswordValidation && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-700 mb-2">
                      Requisitos de la contraseña:
                    </div>
                    <div className="space-y-1">
                      {/* Longitud mínima */}
                      <div className="flex items-center text-xs">
                        {password.length >= PASSWORD_POLICY.minLength ? (
                          <Check className="h-3 w-3 text-green-500 mr-2" />
                        ) : (
                          <X className="h-3 w-3 text-red-500 mr-2" />
                        )}
                        <span className={password.length >= PASSWORD_POLICY.minLength ? "text-green-600" : "text-red-600"}>
                          Al menos {PASSWORD_POLICY.minLength} caracteres ({password.length}/{PASSWORD_POLICY.minLength})
                        </span>
                      </div>

                      {/* Mayúsculas */}
                      <div className="flex items-center text-xs">
                        {/[A-Z]/.test(password) ? (
                          <Check className="h-3 w-3 text-green-500 mr-2" />
                        ) : (
                          <X className="h-3 w-3 text-red-500 mr-2" />
                        )}
                        <span className={/[A-Z]/.test(password) ? "text-green-600" : "text-red-600"}>
                          Al menos una letra mayúscula
                        </span>
                      </div>

                      {/* Minúsculas */}
                      <div className="flex items-center text-xs">
                        {/[a-z]/.test(password) ? (
                          <Check className="h-3 w-3 text-green-500 mr-2" />
                        ) : (
                          <X className="h-3 w-3 text-red-500 mr-2" />
                        )}
                        <span className={/[a-z]/.test(password) ? "text-green-600" : "text-red-600"}>
                          Al menos una letra minúscula
                        </span>
                      </div>

                      {/* Números */}
                      <div className="flex items-center text-xs">
                        {/\d/.test(password) ? (
                          <Check className="h-3 w-3 text-green-500 mr-2" />
                        ) : (
                          <X className="h-3 w-3 text-red-500 mr-2" />
                        )}
                        <span className={/\d/.test(password) ? "text-green-600" : "text-red-600"}>
                          Al menos un número
                        </span>
                      </div>

                      {/* Caracteres especiales */}
                      <div className="flex items-center text-xs">
                        {(() => {
                          const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
                          return specialChars.test(password);
                        })() ? (
                          <Check className="h-3 w-3 text-green-500 mr-2" />
                        ) : (
                          <X className="h-3 w-3 text-red-500 mr-2" />
                        )}
                        <span className={(() => {
                          const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
                          return specialChars.test(password);
                        })() ? "text-green-600" : "text-red-600"}>
                          Al menos un carácter especial
                        </span>
                      </div>

                      {/* No contraseñas comunes */}
                      <div className="flex items-center text-xs">
                        {!COMMON_PASSWORDS.includes(password.toLowerCase()) ? (
                          <Check className="h-3 w-3 text-green-500 mr-2" />
                        ) : (
                          <X className="h-3 w-3 text-red-500 mr-2" />
                        )}
                        <span className={!COMMON_PASSWORDS.includes(password.toLowerCase()) ? "text-green-600" : "text-red-600"}>
                          No ser una contraseña común
                        </span>
                      </div>

                      {/* No caracteres secuenciales */}
                      <div className="flex items-center text-xs">
                        {(() => {
                          const sequentialPatterns = [
                            '123', '234', '345', '456', '567', '678', '789', '890',
                            'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij',
                            'qwe', 'wer', 'ert', 'rty', 'tyu', 'yui', 'uio', 'iop',
                            'asd', 'sdf', 'dfg', 'fgh', 'ghj', 'hjk', 'jkl', 'klz'
                          ];
                          const lowerPassword = password.toLowerCase();
                          return !sequentialPatterns.some(pattern => lowerPassword.includes(pattern));
                        })() ? (
                          <Check className="h-3 w-3 text-green-500 mr-2" />
                        ) : (
                          <X className="h-3 w-3 text-red-500 mr-2" />
                        )}
                        <span className={(() => {
                          const sequentialPatterns = [
                            '123', '234', '345', '456', '567', '678', '789', '890',
                            'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij',
                            'qwe', 'wer', 'ert', 'rty', 'tyu', 'yui', 'uio', 'iop',
                            'asd', 'sdf', 'dfg', 'fgh', 'ghj', 'hjk', 'jkl', 'klz'
                          ];
                          const lowerPassword = password.toLowerCase();
                          return !sequentialPatterns.some(pattern => lowerPassword.includes(pattern));
                        })() ? "text-green-600" : "text-red-600"}>
                          No contener caracteres secuenciales
                        </span>
                      </div>

                      {/* No caracteres repetidos */}
                      <div className="flex items-center text-xs">
                        {(() => {
                          for (let i = 0; i < password.length - 2; i++) {
                            if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
                              return false;
                            }
                          }
                          return true;
                        })() ? (
                          <Check className="h-3 w-3 text-green-500 mr-2" />
                        ) : (
                          <X className="h-3 w-3 text-red-500 mr-2" />
                        )}
                        <span className={(() => {
                          for (let i = 0; i < password.length - 2; i++) {
                            if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
                              return false;
                            }
                          }
                          return true;
                        })() ? "text-green-600" : "text-red-600"}>
                          No contener el mismo carácter repetido más de 2 veces
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirma tu nueva contraseña"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Actualizando..." : "Actualizar contraseña"}
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
