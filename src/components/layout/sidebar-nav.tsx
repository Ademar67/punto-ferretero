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
  LogOut,
  Hammer
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
    <Sidebar collapsible="icon" className="bg-black text-white border-r-0">
      <SidebarHeader className="flex items-center justify-center py-8 border-b border-white/10">
        <div className="flex items-center gap-3 px-2">
          {/* Logo inspirado en la imagen: Círculo negro con martillo amarillo */}
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(255,214,0,0.2)] group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 transition-all">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8">
              <Hammer className="w-6 h-6 text-primary fill-primary group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
            </div>
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline font-black text-xl tracking-tighter leading-none italic uppercase">
              PUNTO
            </span>
            <span className="font-headline font-black text-xl tracking-tighter leading-none italic uppercase text-primary">
              FERRETERO
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40 px-6 mb-2 group-data-[collapsible=icon]:hidden text-xs uppercase tracking-widest font-bold">
            Menú Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 gap-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    tooltip={item.name}
                    className={cn(
                      "h-11 px-4 transition-all duration-200 rounded-lg hover:bg-white/5",
                      item.highlight && "bg-primary text-black hover:bg-primary/90 font-bold mb-2 shadow-lg shadow-primary/10",
                      pathname === item.href && !item.highlight && "bg-white/10 text-primary font-bold"
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className={cn("w-5 h-5", item.highlight ? "text-black" : "text-inherit")} />
                      <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/10 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-11 px-4 text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-colors group-data-[collapsible=icon]:justify-center rounded-lg">
              <LogOut className="w-5 h-5" />
              <span className="group-data-[collapsible=icon]:hidden font-medium">Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
