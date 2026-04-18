"use client"

import { useState } from "react"
import { Search, Filter, Eye, Printer, FileDown, ReceiptText, Calendar as CalendarIcon } from "lucide-react"
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

// Mock data
const MOCK_SALES = [
  { id: "V-0001", date: "2024-03-20 10:30", total: 450.50, method: "efectivo", items: 3, user: "Juan Pérez" },
  { id: "V-0002", date: "2024-03-20 11:15", total: 125.00, method: "tarjeta", items: 1, user: "Juan Pérez" },
  { id: "V-0003", date: "2024-03-20 12:45", total: 2400.00, method: "transferencia", items: 5, user: "Admin" },
  { id: "V-0004", date: "2024-03-19 16:20", total: 85.00, method: "efectivo", items: 2, user: "Cajera 2" },
]

export default function VentasPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-[#f8f9fa] min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shadow-lg">
            <ReceiptText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-black uppercase italic leading-none">
              Historial de <span className="text-primary">Ventas</span>
            </h1>
            <p className="text-muted-foreground font-medium">Consulta y gestiona todos los tickets generados.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-12 px-6 border-2 border-black font-black uppercase tracking-tighter hover:bg-black hover:text-white transition-all">
            <FileDown className="w-5 h-5 mr-2" /> Exportar reporte
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2 bg-primary/5">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ventas de Hoy</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black tracking-tight">$12,450.00</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2 bg-primary/5">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tickets Emitidos</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black tracking-tight">24</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2 bg-primary/5">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ticket Promedio</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black tracking-tight">$518.75</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            placeholder="Buscar por folio o usuario..." 
            className="pl-12 h-14 border-2 focus:border-primary text-lg rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-14 px-6 border-2 border-black font-bold uppercase tracking-tighter flex items-center gap-2 rounded-xl">
          <CalendarIcon className="w-5 h-5" />
          Filtrar por Fecha
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-none overflow-hidden">
        <Table>
          <TableHeader className="bg-black">
            <TableRow className="hover:bg-black border-none">
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Folio</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Fecha / Hora</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Productos</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Total</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Método Pago</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Usuario</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_SALES.map((sale) => (
              <TableRow key={sale.id} className="hover:bg-primary/5 border-border/50">
                <TableCell className="font-black text-black">{sale.id}</TableCell>
                <TableCell className="font-medium">{sale.date}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-black/5 text-black font-bold border-none uppercase text-[9px]">
                    {sale.items} items
                  </Badge>
                </TableCell>
                <TableCell className="font-black text-xl text-black">${sale.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize border-2 border-primary text-black font-black text-[9px] px-3">
                    {sale.method}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-bold text-muted-foreground uppercase">{sale.user}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="hover:bg-primary hover:text-black rounded-lg">
                      <Eye className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:bg-primary hover:text-black rounded-lg">
                      <Printer className="w-5 h-5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
