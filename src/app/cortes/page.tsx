"use client"

import { useState } from "react"
import { Banknote, Lock, Unlock, History, Receipt, Calculator, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CortesPage() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(true)

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cortes de Caja</h1>
          <p className="text-muted-foreground">Administra la apertura y cierre del turno.</p>
        </div>
        <div className="flex gap-2">
          {isRegisterOpen ? (
            <Button size="lg" variant="destructive" className="font-bold">
              <Lock className="w-5 h-5 mr-2" /> Realizar Corte (Cerrar)
            </Button>
          ) : (
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-bold">
              <Unlock className="w-5 h-5 mr-2" /> Abrir Caja
            </Button>
          )}
        </div>
      </div>

      {isRegisterOpen ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader className="bg-primary/5">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Turno Actual en Proceso</CardTitle>
                  <CardDescription>Iniciado el 20 de marzo, 2024 a las 08:30 AM</CardDescription>
                </div>
                <Badge className="bg-green-500">Caja Abierta</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Fondo Inicial</span>
                  <p className="text-xl font-bold">$1,500.00</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Ventas Efectivo</span>
                  <p className="text-xl font-bold text-green-600">$4,520.00</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Ventas Tarjeta</span>
                  <p className="text-xl font-bold text-blue-600">$3,240.00</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Ventas Transf.</span>
                  <p className="text-xl font-bold text-orange-600">$2,100.00</p>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-lg font-medium">Balance Esperado en Caja (Efectivo)</span>
                  <p className="text-4xl font-black text-primary">$6,020.00</p>
                  <p className="text-xs text-muted-foreground">Incluye fondo inicial + ventas en efectivo.</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-lg font-medium">Total Ventas Turno</span>
                  <p className="text-4xl font-black">$9,860.00</p>
                  <p className="text-xs text-muted-foreground">Suma de todos los métodos de pago.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-accent/5">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Calculator className="w-4 h-4" /> Resumen de Tickets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span>Tickets Generados</span>
                  <span className="font-bold">18</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Ticket Promedio</span>
                  <span className="font-bold">$547.77</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Ventas Crédito</span>
                  <span className="font-bold text-red-500">$0.00</span>
                </div>
              </CardContent>
            </Card>

            <Alert className="border-accent bg-accent/10">
              <AlertCircle className="h-4 w-4 text-accent" />
              <AlertTitle className="font-bold">Recordatorio</AlertTitle>
              <AlertDescription className="text-xs">
                Recuerda contar el efectivo físicamente antes de cerrar el turno para asegurar que coincida con el balance del sistema.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Lock className="w-10 h-10" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">La caja está cerrada</h3>
            <p className="text-muted-foreground">Inicia una nueva sesión para comenzar a vender.</p>
          </div>
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-bold">
            Abrir Caja con Fondo Inicial
          </Button>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Historial de Cortes
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Fecha Cierre</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Ventas Totales</TableHead>
                <TableHead>Efectivo Real</TableHead>
                <TableHead>Diferencia</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>19 Mar 2024, 20:15</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell className="font-bold">$12,450.00</TableCell>
                <TableCell>$12,450.00</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">Sin diferencias</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Ver Detalles</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
