"use client"

import { useState } from "react"
import { Search, Filter, Eye, Printer, FileDown, ReceiptText } from "lucide-react"
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
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historial de Ventas</h1>
          <p className="text-muted-foreground">Consulta y gestiona los tickets generados.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <FileDown className="w-4 h-4" /> Exportar Excel
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Buscar por folio o usuario..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Fecha
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[120px]">Folio</TableHead>
              <TableHead>Fecha / Hora</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Método Pago</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_SALES.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-bold">{sale.id}</TableCell>
                <TableCell>{sale.date}</TableCell>
                <TableCell>{sale.items} items</TableCell>
                <TableCell className="font-bold text-primary">${sale.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {sale.method}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{sale.user}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" title="Ver detalle">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Reimprimir">
                      <Printer className="w-4 h-4" />
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
