"use client"

import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Receipt, 
  AlertTriangle,
  ArrowRight,
  Plus,
  Hammer,
  Loader2,
  Lock
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useUser } from "@/firebase"

export default function DashboardPage() {
  const { user, isUserLoading } = useUser()

  const stats = [
    { label: "Ventas Hoy", value: "$12,450.00", icon: TrendingUp, color: "text-green-600", trend: "+12% vs ayer" },
    { label: "Tickets Hoy", value: "24", icon: Receipt, color: "text-primary", trend: "+5 vs ayer" },
    { label: "Ventas Mes", value: "$245,670.00", icon: ShoppingCart, color: "text-blue-600", trend: "En meta" },
    { label: "Stock Bajo", value: "8", icon: AlertTriangle, color: "text-red-600", trend: "Requiere atención" },
  ]

  const quickActions = [
    { name: "Nueva Venta", href: "/pos", icon: Plus, color: "bg-primary text-black hover:bg-primary/90" },
    { name: "Ver Productos", href: "/productos", icon: Package, color: "bg-white text-black border-2 border-black hover:bg-black hover:text-white" },
    { name: "Reportes", href: "/reportes", icon: TrendingUp, color: "bg-black text-white hover:bg-black/80" },
  ]

  const lowStockItems = [
    { id: "1", name: "Martillo de Uña 16oz", stock: 2, minStock: 5 },
    { id: "2", name: "Pintura Blanca 4L", stock: 1, minStock: 3 },
    { id: "3", name: "Tornillo 2'' (Caja 100)", stock: 4, minStock: 10 },
  ]

  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F5F5F5] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="font-black uppercase italic tracking-tighter">Cargando Panel...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F5F5F5] p-6 gap-6 text-center">
        <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center shadow-xl rotate-3 border-4 border-primary">
          <Lock className="w-10 h-10 text-primary -rotate-3" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Acceso Restringido</h1>
          <p className="text-muted-foreground font-bold uppercase text-xs">Debes iniciar sesión para acceder al panel de control.</p>
        </div>
        <Button asChild size="lg" className="bg-primary text-black font-black px-10 h-14 rounded-xl shadow-lg shadow-primary/20">
          <Link href="/login">IR AL LOGIN</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10 bg-[#f4f4f5] min-h-full text-black">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center shrink-0 shadow-2xl rotate-3 border-4 border-primary">
            <Hammer className="w-8 h-8 text-primary fill-primary -rotate-3" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-black uppercase italic leading-none">
              Punto <span className="text-primary">Ferretero</span>
            </h1>
            <p className="text-muted-foreground mt-1 font-bold uppercase text-[10px] tracking-widest">Panel de Control • Tu negocio bajo control</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-black font-black shadow-xl h-14 px-8 rounded-xl transition-all hover:-translate-y-1 hover:shadow-primary/20">
            <Link href="/pos" className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6" />
              NUEVA VENTA
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-all group cursor-default bg-white overflow-hidden relative rounded-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-muted group-hover:bg-primary transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight">{stat.value}</div>
              <p className={cn("text-[10px] font-bold mt-2 uppercase tracking-tighter", stat.trend.includes('+') ? "text-green-600" : "text-muted-foreground")}>
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2 border-none shadow-sm bg-white overflow-hidden rounded-2xl">
          <CardHeader className="border-b border-border/50 bg-white p-6">
            <CardTitle className="text-xl font-black uppercase italic flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Productos más Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-5 hover:bg-primary/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black text-primary flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
                      {i}
                    </div>
                    <div>
                      <p className="font-black text-black uppercase text-sm">Producto Destacado #{i}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Alta Rotación</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl text-black">$1,240.00</p>
                    <Badge variant="secondary" className="bg-primary text-black border-none text-[9px] font-black uppercase px-3 py-1">42 vendidos</Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-muted/10 border-t border-border">
              <Button variant="ghost" className="w-full font-black uppercase tracking-tight hover:bg-primary hover:text-black transition-all rounded-xl" asChild>
                <Link href="/reportes">Ver reporte completo <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="bg-red-50 border-b border-red-100 p-6">
            <CardTitle className="flex items-center gap-2 text-black font-black italic uppercase text-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              URGENTE: STOCK BAJO
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {lowStockItems.map((item) => (
                <div key={item.id} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="font-black text-[11px] text-black uppercase tracking-tight">{item.name}</span>
                    <span className="text-[10px] font-black text-red-600">STOCK: {item.stock}</span>
                  </div>
                  <div className="w-full bg-muted h-3 rounded-full overflow-hidden border border-border">
                    <div 
                      className={cn(
                        "h-full transition-all",
                        (item.stock / item.minStock) < 0.5 ? "bg-red-600" : "bg-orange-500"
                      )} 
                      style={{ width: `${(item.stock / item.minStock) * 100}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-10 font-black uppercase tracking-widest bg-black text-primary hover:bg-black/90 h-14 rounded-2xl shadow-xl active:scale-95 transition-all" asChild>
              <Link href="/inventario">Gestionar Inventario</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Button 
            key={action.name} 
            asChild
            variant="outline"
            className={cn(
              "h-28 flex flex-col gap-2 items-center justify-center border-none shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all rounded-2xl active:scale-95",
              action.color
            )}
          >
            <Link href={action.href}>
              <action.icon className="w-8 h-8" />
              <span className="font-black text-xs uppercase tracking-tighter">{action.name}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}
