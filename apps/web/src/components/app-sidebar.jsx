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
    {
      title: "Lifecycle",
      url: "#",
      icon: List,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: Database,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const { hasRole } = useRoles();
  const canAccessAdmin = hasRole('admin') || hasRole('super_admin');
  const canAccessComercial = hasRole('comercial_mundial') || hasRole('super_admin');
  const canAccessAgente = hasRole('agente_contacto') || hasRole('super_admin');

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/dashboard">
                <ShieldAlert className="!size-5" />
                <span className="text-base font-semibold">VML Perito</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

        {/* Sistema de Inspecciones */}
        {(canAccessComercial || canAccessAgente) && (
          <SidebarGroup>
            <SidebarGroupLabel>Sistema de Inspecciones</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {canAccessComercial && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Comercial Mundial">
                      <Link to="/comercial-mundial">
                        <Building />
                        <span>Comercial Mundial</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {canAccessAgente && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Agente de Contacto">
                      <Link to="/agente-contacto">
                        <Phone />
                        <span>Agente de Contacto</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <NavDocuments items={data.documents} />

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
                      <span>RBAC</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
