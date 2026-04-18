"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
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
  Hammer,
  Loader2
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
import { useAuth, useUser } from "@/firebase"
import { signOut } from "firebase/auth"

const menuItems = [
  { name: "Resumen", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Nueva Venta", icon: ShoppingCart, href: "/pos" },
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
  const router = useRouter()
  const auth = useAuth()
  const { user } = useUser()
  const [mounted, setMounted] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Sidebar collapsible="icon" className="bg-black text-white border-none shadow-2xl">
      <SidebarHeader className="flex items-center justify-center py-10 border-b border-white/5">
        <div className="flex items-center gap-4 px-2">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(255,214,0,0.2)] group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 transition-all border-4 border-black">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8">
              <Hammer className="w-6 h-6 text-primary fill-primary group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
            </div>
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline font-black text-2xl tracking-tighter leading-none italic uppercase text-white">
              PUNTO
            </span>
            <span className="font-headline font-black text-2xl tracking-tighter leading-none italic uppercase text-primary">
              FERRETERO
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-8 scrollbar-none">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/30 px-6 mb-4 group-data-[collapsible=icon]:hidden text-[10px] uppercase tracking-[0.3em] font-black italic">
            Módulos del Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 gap-1.5">
              {menuItems.map((item) => {
                const isActive = mounted ? pathname === item.href : false
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.name}
                      className={cn(
                        "h-12 px-4 transition-all duration-200 rounded-xl group/btn border-none",
                        isActive 
                          ? "bg-primary text-black font-black shadow-lg shadow-primary/20" 
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className={cn(
                          "w-5 h-5 transition-colors", 
                          isActive ? "text-black" : "text-primary"
                        )} />
                        <span className="group-data-[collapsible=icon]:hidden uppercase text-[11px] tracking-tight font-black">
                          {item.name}
                        </span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black animate-pulse group-data-[collapsible=icon]:hidden" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/5 bg-black/40">
        <div className="px-4 py-2 group-data-[collapsible=icon]:hidden mb-2">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest truncate">{user?.email}</p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="h-12 px-4 text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-xl border-none"
            >
              {isLoggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
              <span className="group-data-[collapsible=icon]:hidden font-black uppercase text-[10px] tracking-widest">
                Cerrar Sesión
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
