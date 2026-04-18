"use client"

import { useState, useMemo } from "react"
import { 
  Ban, 
  Search, 
  FileDown, 
  Calendar as CalendarIcon, 
  Filter, 
  User, 
  ArrowLeft,
  Loader2,
  Package,
  Info
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { query, collection, where, orderBy } from "firebase/firestore"
import { Sale } from "@/types"
import { cn } from "@/lib/utils"
import { format, isToday, isThisMonth } from "date-fns"
import { es } from "date-fns/locale"

export default function AnulacionesReportPage() {
  const { user } = useUser()
  const db = useFirestore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterMethod, setFilterMethod] = useState("all")

  // Consulta específica para ventas con estado 'cancelada'
  const cancelledSalesQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null
    return query(
      collection(db, "negocios", user.uid, "ventas"),
      where("status", "==", "cancelada"),
      orderBy("date", "desc")
    )
  }, [db, user?.uid])

  const { data: sales, isLoading } = useCollection<Sale>(cancelledSalesQuery)

  // Cálculos de KPIs
  const stats = useMemo(() => {
    if (!sales) return { total: 0, amount: 0, today: 0, month: 0 }
    
    return sales.reduce((acc, sale) => {
      const saleDate = sale.cancelledAt?.seconds ? new Date(sale.cancelledAt.seconds * 1000) : new Date()
      
      acc.total += 1
      acc.amount += sale.total
      if (isToday(saleDate)) acc.today += 1
      if (isThisMonth(saleDate)) acc.month += 1
      
      return acc
    }, { total: 0, amount: 0, today: 0, month: 0 })
  }, [sales])

  // Filtrado de la tabla
  const filteredSales = useMemo(() => {
    if (!sales) return []
    return sales.filter(s => {
      const matchesSearch = s.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.cancelledByUserEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.cancelReason?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesMethod = filterMethod === "all" || s.paymentMethod === filterMethod
      
      return matchesSearch && matchesMethod
    })
  }, [sales, searchTerm, filterMethod])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F5F5F5] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-red-600" />
        <p className="font-black uppercase italic tracking-tighter">Generando Reporte de Auditoría...</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-[#fdf2f2] min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="h-12 w-12 rounded-xl hover:bg-red-100">
            <Link href="/reportes">
              <ArrowLeft className="w-6 h-6 text-red-600" />
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-black uppercase italic leading-none">
              Reporte de <span className="text-red-600">Anulaciones</span>
            </h1>
            <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest mt-1">Control de Calidad y Auditoría • Modo Histórico</p>
          </div>
        </div>
        <Button variant="outline" className="h-12 px-6 border-2 border-red-600 text-red-600 font-black uppercase tracking-tighter hover:bg-red-600 hover:text-white transition-all rounded-xl">
          <FileDown className="w-5 h-5 mr-2" /> Exportar PDF
        </Button>
      </div>

      {/* KPIs DE ANULACIONES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
          <CardHeader className="pb-2 bg-red-50">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-red-600">Total Anuladas</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black tracking-tight">{stats.total}</div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Historial acumulado</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
          <CardHeader className="pb-2 bg-red-50">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-red-600">Capital Revertido</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black tracking-tight">$ {stats.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Monto total no ingresado</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
          <CardHeader className="pb-2 bg-red-50">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-red-600">Canceladas Hoy</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black tracking-tight text-red-600">{stats.today}</div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Operaciones de este turno</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
          <CardHeader className="pb-2 bg-red-50">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-red-600">Este Mes</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black tracking-tight">{stats.month}</div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Tasa de cancelación mensual</p>
          </CardContent>
        </Card>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            placeholder="Buscar por folio, usuario o motivo..." 
            className="pl-12 h-14 border-2 focus:border-red-600 text-lg rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select value={filterMethod} onValueChange={setFilterMethod}>
            <SelectTrigger className="w-[200px] h-14 border-2 border-black font-bold uppercase text-[10px] tracking-widest rounded-xl">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-red-600" />
                <SelectValue placeholder="Método Pago" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-black">
              <SelectItem value="all" className="uppercase text-[10px] font-black tracking-widest">Todos los métodos</SelectItem>
              <SelectItem value="efectivo" className="uppercase text-[10px] font-black tracking-widest">Efectivo</SelectItem>
              <SelectItem value="tarjeta" className="uppercase text-[10px] font-black tracking-widest">Tarjeta</SelectItem>
              <SelectItem value="transferencia" className="uppercase text-[10px] font-black tracking-widest">Transferencia</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-14 px-6 border-2 border-black font-bold uppercase tracking-tighter flex items-center gap-2 rounded-xl">
            <CalendarIcon className="w-5 h-5" />
            Rango de Fechas
          </Button>
        </div>
      </div>

      {/* TABLA DE AUDITORÍA */}
      <div className="bg-white rounded-2xl shadow-xl border-none overflow-hidden">
        <Table>
          <TableHeader className="bg-red-600">
            <TableRow className="hover:bg-red-600 border-none">
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Folio</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Venta Original</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Anulación</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Monto Anulado</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Personal</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Motivo / Ítems</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.map((sale) => (
              <TableRow key={sale.id} className="hover:bg-red-50 border-border/50">
                <TableCell className="font-black text-black italic">
                  {sale.folio}
                </TableCell>
                <TableCell className="text-[11px] font-medium text-muted-foreground">
                  {sale.date?.seconds ? format(new Date(sale.date.seconds * 1000), "dd/MM/yy HH:mm", { locale: es }) : "---"}
                </TableCell>
                <TableCell className="text-[11px] font-black text-red-600">
                  {sale.cancelledAt?.seconds ? format(new Date(sale.cancelledAt.seconds * 1000), "dd/MM/yy HH:mm", { locale: es }) : "---"}
                </TableCell>
                <TableCell className="font-black text-lg text-black">
                  ${sale.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="text-left">
                          <Badge variant="outline" className="text-[9px] font-black uppercase border-black/10 py-0 flex items-center gap-1">
                            <User className="w-3 h-3" /> Vendedor
                          </Badge>
                          <p className="text-[10px] font-medium truncate max-w-[120px]">{sale.userEmail}</p>
                        </TooltipTrigger>
                        <TooltipContent>Vendido por: {sale.userEmail}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="text-left">
                          <Badge variant="destructive" className="text-[9px] font-black uppercase py-0 flex items-center gap-1 bg-red-600">
                            <Ban className="w-3 h-3" /> Anuló
                          </Badge>
                          <p className="text-[10px] font-bold text-red-600 truncate max-w-[120px]">{sale.cancelledByUserEmail}</p>
                        </TooltipTrigger>
                        <TooltipContent>Cancelado por: {sale.cancelledByUserEmail}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 max-w-[250px]">
                      <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] italic font-medium leading-tight line-clamp-2">
                        {sale.cancelReason || "Sin motivo registrado"}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {sale.items.slice(0, 2).map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="text-[8px] font-bold bg-black/5 uppercase">
                          {item.quantity}x {item.name.substring(0, 10)}...
                        </Badge>
                      ))}
                      {sale.items.length > 2 && (
                        <Badge variant="secondary" className="text-[8px] font-bold bg-black/5">
                          +{sale.items.length - 2} más
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredSales.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-4 text-muted-foreground bg-white">
            <Ban className="w-16 h-16 opacity-20" />
            <p className="font-black uppercase italic tracking-tighter text-xl">No hay anulaciones registradas</p>
            <p className="text-xs font-bold uppercase">Todas tus ventas están activas o no has realizado cancelaciones aún.</p>
          </div>
        )}
      </div>
    </div>
  )
}
