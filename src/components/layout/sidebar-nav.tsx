"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  ClipboardList, 
  Tags, 
  ReceiptText, 
  Banknote, 
  BarChart3, 
  Settings,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
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

const menuItems = [
  { name: "Resumen", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Nueva Venta", icon: ShoppingCart, href: "/pos", highlight: true },
  { name: "Productos", icon: Package, href: "/productos" },
  { name: "Inventario", icon: ClipboardList, href: "/inventario" },
  { name: "Categorías", icon: Tags, href: "/categorias" },
  { name: "Ventas / Tickets", icon: ReceiptText, href: "/ventas" },
  { name: "Cortes de Caja", icon: Banknote, href: "/cortes" },
  { name: "Reportes", icon: BarChart3, href: "/reportes" },
  { name: "Configuración", icon: Settings, href: "/configuracion" },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-center py-6 border-b border-sidebar-border/30">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary font-bold text-xl">
            F
          </div>
          <span className="font-headline font-bold text-xl group-data-[collapsible=icon]:hidden">
            FerreSys TPV
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 px-4 group-data-[collapsible=icon]:hidden">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    tooltip={item.name}
                    className={cn(
                      "transition-all duration-200",
                      item.highlight && "bg-accent/20 hover:bg-accent/30 text-accent font-bold",
                      pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm"
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className={cn("w-5 h-5", item.highlight && "text-accent")} />
                      <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/30 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-destructive/10 hover:text-destructive group-data-[collapsible=icon]:justify-center">
              <LogOut className="w-5 h-5" />
              <span className="group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
