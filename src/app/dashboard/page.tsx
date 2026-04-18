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
  // Mock data for initial view
  const stats = [
    { label: "Ventas Hoy", value: "$12,450.00", icon: TrendingUp, color: "text-green-500", trend: "+12% vs ayer" },
    { label: "Tickets Hoy", value: "24", icon: Receipt, color: "text-blue-500", trend: "+5 vs ayer" },
    { label: "Ventas Mes", value: "$245,670.00", icon: ShoppingCart, color: "text-orange-500", trend: "En meta" },
    { label: "Stock Bajo", value: "8", icon: AlertTriangle, color: "text-red-500", trend: "Requiere atención" },
  ]

  const quickActions = [
    { name: "Nueva Venta", href: "/pos", icon: Plus, color: "bg-accent text-accent-foreground" },
    { name: "Ver Productos", href: "/productos", icon: Package, color: "bg-primary text-primary-foreground" },
    { name: "Reportes", href: "/reportes", icon: TrendingUp, color: "bg-slate-800 text-white" },
  ]

  const lowStockItems = [
    { id: "1", name: "Martillo de Uña 16oz", stock: 2, minStock: 5 },
    { id: "2", name: "Pintura Blanca 4L", stock: 1, minStock: 3 },
    { id: "3", name: "Tornillo 2'' (Caja 100)", stock: 4, minStock: 10 },
  ]

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido de nuevo</h1>
          <p className="text-muted-foreground">Aquí tienes un resumen de tu ferretería para hoy.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg">
            <Link href="/pos" className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Nueva Venta (POS)
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Productos más Vendidos (Semana)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {i}
                    </div>
                    <span className="font-medium">Producto Ejemplo #{i}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="text-sm text-muted-foreground">42 ventas</span>
                    <span className="font-bold">$1,240.00</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-primary" asChild>
              <Link href="/reportes">Ver reporte completo <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex flex-col gap-1 border-b border-border pb-3 last:border-0">
                  <span className="font-medium text-sm">{item.name}</span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Actual: {item.stock}</span>
                    <span className="text-red-500 font-bold">Mínimo: {item.minStock}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/inventario">Gestionar Inventario</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4">
        {quickActions.map((action) => (
          <Button 
            key={action.name} 
            asChild
            variant="outline"
            className={cn(
              "flex-1 h-24 flex flex-col gap-2 items-center justify-center border-none shadow-sm hover:scale-105 transition-transform",
              action.color
            )}
          >
            <Link href={action.href}>
              <action.icon className="w-6 h-6" />
              <span className="font-bold">{action.name}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}
