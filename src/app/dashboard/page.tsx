import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Receipt, 
  AlertTriangle,
  ArrowRight,
  Plus
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const stats = [
    { label: "Ventas Hoy", value: "$12,450.00", icon: TrendingUp, color: "text-green-600", trend: "+12% vs ayer" },
    { label: "Tickets Hoy", value: "24", icon: Receipt, color: "text-primary", trend: "+5 vs ayer" },
    { label: "Ventas Mes", value: "$245,670.00", icon: ShoppingCart, color: "text-blue-600", trend: "En meta" },
    { label: "Stock Bajo", value: "8", icon: AlertTriangle, color: "text-red-600", trend: "Requiere atención" },
  ]

  const quickActions = [
    { name: "Nueva Venta", href: "/pos", icon: Plus, color: "bg-primary text-black" },
    { name: "Ver Productos", href: "/productos", icon: Package, color: "bg-white text-black border border-border" },
    { name: "Reportes", href: "/reportes", icon: TrendingUp, color: "bg-black text-white" },
  ]

  const lowStockItems = [
    { id: "1", name: "Martillo de Uña 16oz", stock: 2, minStock: 5 },
    { id: "2", name: "Pintura Blanca 4L", stock: 1, minStock: 3 },
    { id: "3", name: "Tornillo 2'' (Caja 100)", stock: 4, minStock: 10 },
  ]

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10 bg-[#f8f9fa] min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-black">Bienvenido a <span className="text-primary">Punto Ferretero</span></h1>
          <p className="text-muted-foreground mt-1">Tu ferretería está operando correctamente hoy.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-black font-black shadow-xl h-14 px-8 rounded-xl transition-all hover:scale-105 active:scale-95">
            <Link href="/pos" className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6" />
              NUEVA VENTA
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-xl transition-all group cursor-default bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</CardTitle>
              <div className={cn("p-2 rounded-lg bg-muted group-hover:bg-primary group-hover:text-black transition-colors")}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{stat.value}</div>
              <p className={cn("text-xs font-bold mt-2", stat.trend.includes('+') ? "text-green-600" : "text-muted-foreground")}>
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-xl font-black">Productos más Vendidos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black text-primary flex items-center justify-center font-black">
                      {i}
                    </div>
                    <div>
                      <p className="font-bold text-black">Producto de Alta Rotación #{i}</p>
                      <p className="text-xs text-muted-foreground">Categoría Herramientas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg text-black">$1,240.00</p>
                    <p className="text-xs font-bold text-primary uppercase">42 vendidos</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-muted/20">
              <Button variant="ghost" className="w-full font-bold hover:bg-primary hover:text-black transition-all" asChild>
                <Link href="/reportes">Ver reporte completo <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm border-t-4 border-t-red-600 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 font-black italic">
              <AlertTriangle className="w-6 h-6" />
              URGENTE: STOCK BAJO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-[#fff5f5]">
                  <span className="font-bold text-sm text-black">{item.name}</span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="bg-white px-2 py-1 rounded border font-medium">Actual: {item.stock}</span>
                    <span className="text-red-600 font-black">Mín: {item.minStock}</span>
                  </div>
                  <div className="w-full bg-red-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-red-600 h-full" style={{ width: `${(item.stock / item.minStock) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 font-bold border-black text-black hover:bg-black hover:text-white" asChild>
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
              "h-28 flex flex-col gap-3 items-center justify-center border-none shadow-md hover:scale-[1.02] transition-all rounded-2xl active:scale-95",
              action.color
            )}
          >
            <Link href={action.href}>
              <action.icon className="w-8 h-8" />
              <span className="font-black text-lg uppercase tracking-tight">{action.name}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}