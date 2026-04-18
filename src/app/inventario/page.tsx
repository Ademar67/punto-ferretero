"use client"

import { useState } from "react"
import { Plus, Minus, History, Package, Search, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const MOCK_MOVEMENTS = [
  { id: "M-1", product: "Martillo 16oz", type: "entrada", qty: 10, reason: "Compra a proveedor", date: "2024-03-20 09:00", user: "Admin" },
  { id: "M-2", product: "Cinta Canela", type: "salida", qty: 2, reason: "Uso interno", date: "2024-03-20 11:30", user: "Juan Pérez" },
  { id: "M-3", product: "Pintura Blanca", type: "ajuste", qty: -1, reason: "Dañado", date: "2024-03-19 15:45", user: "Admin" },
]

export default function InventarioPage() {
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">Control de entradas, salidas y ajustes manuales.</p>
        </div>
        <div className="flex gap-2">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-bold">
            <Plus className="w-5 h-5 mr-2" /> Entrada
          </Button>
          <Button size="lg" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 font-bold">
            <Minus className="w-5 h-5 mr-2" /> Salida
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Movimientos Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Entradas (Mes)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+145 unidades</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ajustes Realizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">3</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Historial Reciente
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Fecha / Hora</TableHead>
                <TableHead>Usuario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_MOVEMENTS.map((mv) => (
                <TableRow key={mv.id}>
                  <TableCell className="font-medium">{mv.product}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {mv.type === 'entrada' ? (
                        <ArrowUpCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="capitalize">{mv.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className={cn(
                    "font-bold",
                    mv.qty > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {mv.qty > 0 ? `+${mv.qty}` : mv.qty}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{mv.reason}</TableCell>
                  <TableCell className="text-sm">{mv.date}</TableCell>
                  <TableCell>{mv.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

import { cn } from "@/lib/utils"
