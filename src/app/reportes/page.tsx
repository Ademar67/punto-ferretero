"use client"

import { 
  BarChart3, 
  TrendingUp, 
  Ban, 
  ShoppingCart, 
  ArrowRight,
  Receipt,
  Download,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ReportesPage() {
  const reportTypes = [
    {
      title: "Auditoría de Anulaciones",
      description: "Historial completo de ventas canceladas y reversión de inventario.",
      icon: Ban,
      href: "/reportes/anulaciones",
      color: "text-red-600",
      bg: "bg-red-50",
      badge: "Crítico"
    },
    {
      title: "Ventas por Periodo",
      description: "Resumen detallado de ingresos diarios, semanales y mensuales.",
      icon: TrendingUp,
      href: "/reportes/ventas",
      color: "text-green-600",
      bg: "bg-green-50",
      badge: "Finanzas"
    },
    {
      title: "Rotación de Inventario",
      description: "Análisis de los productos que más se venden y necesidad de resurtido.",
      icon: ShoppingCart,
      href: "/reportes/inventario",
      color: "text-blue-600",
      bg: "bg-blue-50",
      badge: "Logística"
    }
  ]

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-[#f8f9fa] min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center shrink-0 shadow-2xl rotate-3 border-4 border-primary">
            <BarChart3 className="w-8 h-8 text-primary -rotate-3" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-black uppercase italic leading-none">
              Módulo de <span className="text-primary">Inteligencia</span>
            </h1>
            <p className="text-muted-foreground mt-1 font-bold uppercase text-[10px] tracking-widest">Análisis estratégico • Reportes y Auditoría</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 border-2 border-black font-black uppercase tracking-tighter rounded-xl">
            <Download className="w-4 h-4 mr-2" /> Reporte Global
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reportTypes.map((report) => (
          <Card key={report.title} className="group border-none shadow-sm hover:shadow-2xl transition-all rounded-3xl overflow-hidden bg-white border-b-8 border-transparent hover:border-black cursor-pointer">
            <CardHeader className={cn("p-8", report.bg)}>
              <div className="flex justify-between items-start mb-4">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform bg-white", report.color)}>
                  <report.icon className="w-7 h-7" />
                </div>
                <Badge variant="secondary" className="bg-black text-white font-black uppercase text-[9px] px-3">
                  {report.badge}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-black">
                {report.title}
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium text-sm leading-snug pt-2">
                {report.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 mt-6">
              <Button asChild className="w-full bg-black hover:bg-primary hover:text-black text-white font-black uppercase tracking-widest h-14 rounded-2xl group/btn transition-all">
                <Link href={report.href} className="flex items-center justify-center gap-2">
                  EXPLORAR DATOS
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SECCIÓN DE RESUMEN RÁPIDO */}
      <div className="pt-8">
        <h2 className="text-xl font-black uppercase italic tracking-tighter mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          Resúmenes del Periodo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black rounded-3xl p-8 text-white flex justify-between items-center shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] italic">Últimos 7 días</span>
              <h3 className="text-4xl font-black italic tracking-tighter mt-2">Ticket Promedio</h3>
              <p className="text-white/50 text-sm font-medium mt-1">Comparado con la semana anterior</p>
            </div>
            <div className="relative z-10 text-right">
              <div className="text-6xl font-black tracking-tighter italic text-primary leading-none">$ 452</div>
              <Badge className="bg-green-500 text-black font-black uppercase text-[9px] mt-2">+12.4%</Badge>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border-4 border-black flex justify-between items-center shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <span className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] italic">Estado Operativo</span>
              <h3 className="text-4xl font-black italic tracking-tighter mt-2">Ventas Netas</h3>
              <p className="text-muted-foreground text-sm font-medium mt-1">Proyección de cierre de mes</p>
            </div>
            <div className="relative z-10 text-right">
              <div className="text-6xl font-black tracking-tighter italic text-black leading-none">$ 124K</div>
              <Badge className="bg-black text-primary font-black uppercase text-[9px] mt-2">EN META</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { cn } from "@/lib/utils"
