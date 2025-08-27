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
import { useAuth } from '@/contexts/auth-context';
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
  ...props
}) {
  const { hasRole } = useRoles();
  const { user } = useAuth();
  const canAccessAdmin = hasRole('admin') || hasRole('super_admin');
  const canAccessComercial = hasRole('comercial_mundial') || hasRole('super_admin');
  const canAccessAgente = hasRole('agente_contacto') || hasRole('super_admin');
  const canAccessCoordinador = hasRole('coordinador_contacto') || hasRole('super_admin');

  // User roles
  const isSuperAdmin = user.roles.some(role => role.name === 'super_admin');
  const isAdmin = user.roles.some(role => role.name === 'admin');
  const isAdminHelpDesk = user.roles.some(role => role.name === 'admin_help_desk');
  const isAdminOperations = user.roles.some(role => role.name === 'admin_operations');

  const appName = import.meta.env.VITE_APP_NAME

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/dashboard">
                <ShieldAlert className="!size-5" />
                <span className="text-base font-semibold">{appName}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

        {/* Sistema de Inspecciones */}
        {(canAccessComercial || canAccessAgente || canAccessCoordinador ) && (
          <SidebarGroup>
            <SidebarGroupLabel>Sistema de Inspecciones</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {canAccessComercial && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Dashboard Comercial">
                      <Link to="/comercial-mundial">
                        <Building />
                        <span>Dashboard Comercial</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {(canAccessCoordinador) && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Coordinador de Contact Center">
                      <Link to="/coordinador-contacto">
                        <UserCog />
                        <span>Coordinador de Contact Center</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {canAccessAgente && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Agente de Contact Center">
                      <Link to="/agente-contacto">
                        <Phone />
                        <span>Agente de Contact Center</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
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
                  isAdminHelpDesk && <>
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
                  </>
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
