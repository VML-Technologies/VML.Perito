import * as React from "react"
import { Link } from "react-router-dom"
import {
  Camera,
  BarChart3,
  LayoutDashboard,
  Database,
  FileText,
  Folder,
  HelpCircle,
  Zap,
  List,
  Search,
  Settings,
  Users,
  Shield,
  ShieldAlert,
  Building,
  Phone,
  ClipboardList,
  UserCog,
  Bell,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useRoles } from "@/hooks/use-roles"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
  ],
}

export function AppSidebar({
  routesMap,
  ...props
}) {
  const { hasRole, roles } = useRoles();
  const canAccessAdmin = hasRole('admin') || hasRole('super_admin') || hasRole('help_desk');
  const appName = import.meta.env.VITE_APP_NAME

  // Filtrar rutas disponibles según los roles del usuario
  const availableRoutes = routesMap ? Object.values(routesMap).filter(route =>
    route.roles.some(role => roles.includes(role))
  ) : [];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/dashboard">
                <ShieldAlert className="!size-5" />
                <span className="text-sm font-semibold leading-tight">{appName}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

        {/* Sistema de Inspecciones */}
        {availableRoutes.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Sistema de Inspecciones</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {availableRoutes.map((route, index) => {
                  const Icon = route.icon;

                  // Función para manejar el clic en el sidebar
                  const handleSidebarClick = (e) => {
                    if (route.type === 'redirect') {
                      e.preventDefault();
                      if (route.redirectUrl) {
                        console.log('Redirigiendo desde sidebar a URL externa:', route.redirectUrl);
                        window.location.href = route.redirectUrl;
                      }
                    }
                    // Si es type: 'navigate', no hacemos nada, el Link se encarga
                  };

                  return (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton asChild tooltip={route.name}>
                        <Link
                          to={route.route}
                          onClick={handleSidebarClick}
                        >
                          <Icon />
                          <span>{route.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Administración */}
        {canAccessAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Administración RBAC">
                    <Link to="/admin">
                      <Shield />
                      <span>Gestion de acceso</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {
                  (hasRole('admin') || hasRole('super_admin')) && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Plantillas de Notificación">
                          <Link to="/notification-templates">
                            <Bell />
                            <span>Plantillas de Notificación</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Configuración de Canales">
                          <Link to="/channel-configurations">
                            <Settings />
                            <span>Configuración de Canales</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Administración de Notificaciones">
                          <Link to="/notification-admin">
                            <BarChart3 />
                            <span>Administración de Notificaciones</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Configuración de Listas">
                          <Link to="/list-config">
                            <List />
                            <span>Configuración de Listas</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )
                }
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
