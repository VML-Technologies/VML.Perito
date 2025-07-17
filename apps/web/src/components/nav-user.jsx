import {
  MoreVertical,
  LogOut,
  Lock,
  User,
  HeadsetIcon,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useNotificationContext } from "@/contexts/notification-context"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export function NavUser() {
  const { user, logout } = useAuth()
  const { showToast } = useNotificationContext()
  const navigate = useNavigate()

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      await logout()
      showToast('Sesión cerrada exitosamente', 'success')
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      showToast('Error al cerrar sesión', 'error')
    }
  }

  // Función para obtener las iniciales del usuario
  const getUserInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Si no hay usuario autenticado, no mostrar nada
  if (!user) return null

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Avatar - Always visible */}
      <div className="flex-shrink-0">
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="rounded-lg">
            {
              user.roles.find(role => role.name === 'agente_contacto') ?
                <HeadsetIcon className="size-4" /> : <>
                  {getUserInitials(user.name)}
                </>
            }
          </AvatarFallback>
        </Avatar>
      </div>

      {/* User info and status - Hidden on mobile */}
      <div className="hidden sm:block min-w-0 flex-1">
        <div className="w-32 lg:w-48">
          <div className="truncate font-medium text-sm">{user.name || 'Usuario'}</div>
          <Select className="w-full">
            <SelectTrigger className="w-full h-7 text-xs">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="w-full">
              <SelectItem value="almuerzo">Almuerzo</SelectItem>
              <SelectItem value="en_linea">En línea</SelectItem>
              <SelectItem value="en_descanso">En descanso</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Menu trigger - Always visible */}
      <div className="flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-medium">{user.name || 'Usuario'}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email || 'Sin email'}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Lock className="mr-2 h-4 w-4" />
                Cambiar contraseña
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
