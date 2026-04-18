"use client"

import { useState } from "react"
import { Search, Eye, Printer, FileDown, ReceiptText, Calendar as CalendarIcon, Ban, Loader2, AlertTriangle, X } from "lucide-react"
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
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { query, collection, where, orderBy, writeBatch, doc, serverTimestamp, increment } from "firebase/firestore"
import { Sale } from "@/types"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { TicketView } from "@/components/pos/ticket-view"

export default function VentasPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [cancellingSale, setCancellingSale] = useState<Sale | null>(null)
  const [viewingTicket, setViewingTicket] = useState<Sale | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [isProcessingCancel, setIsProcessingCancel] = useState(false)

  const salesQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null
    return query(
      collection(db, "negocios", user.uid, "ventas"),
      orderBy("date", "desc")
    )
  }, [db, user?.uid])

  const { data: sales, isLoading } = useCollection<Sale>(salesQuery)

  const filteredSales = sales?.filter(s => 
    s.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleCancelSale = async () => {
    if (!db || !user?.uid || !cancellingSale) return

    setIsProcessingCancel(true)
    try {
      const batch = writeBatch(db)
      const saleRef = doc(db, "negocios", user.uid, "ventas", cancellingSale.id)

      batch.update(saleRef, {
        status: 'cancelada',
        cancelledAt: serverTimestamp(),
        cancelledByUserId: user.uid,
        cancelledByUserEmail: user.email,
        cancelReason: cancelReason || "Sin motivo especificado"
      })

      cancellingSale.items.forEach(item => {
        const productRef = doc(db, "negocios", user.uid!, "productos", item.productId)
        batch.update(productRef, {
          stockActual: increment(Number(item.quantity))
        })
        
        const movementRef = doc(collection(db, "negocios", user.uid!, "movimientosInventario"))
        batch.set(movementRef, {
          ownerId: user.uid,
          productId: item.productId,
          productName: item.name,
          codigo: item.productId,
          type: 'cancelacion',
          quantity: item.quantity,
          reason: `Cancelación de venta folio ${cancellingSale.folio}`,
          date: serverTimestamp(),
          userId: user.uid,
          userEmail: user.email
        })
      })

      await batch.commit()
      
      toast({
        title: "VENTA ANULADA",
        description: `El folio ${cancellingSale.folio} ha sido cancelado y el stock revertido.`,
        className: "bg-black text-primary border-primary border-2 font-black",
      })
    } catch (error) {
      console.error("Error al cancelar venta:", error)
      toast({
        title: "ERROR",
        description: "No se pudo anular la venta. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsProcessingCancel(false)
      setCancellingSale(null)
      setCancelReason("")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F5F5F5] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="font-black uppercase italic tracking-tighter">Consultando Historial...</p>
      </div>
    )
  }

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
          <Button variant="outline" className="h-12 px-6 border-2 border-black font-black uppercase tracking-tighter hover:bg-black hover:text-white transition-all rounded-xl">
            <FileDown className="w-5 h-5 mr-2" /> Reporte Mensual
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
          <CardHeader className="pb-2 bg-primary/5">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Ventas Brutas</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black tracking-tight">
              $ {sales?.reduce((acc, s) => acc + (s.status === 'completada' ? s.total : 0), 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
          <CardHeader className="pb-2 bg-primary/5">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tickets Activos</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black tracking-tight">{sales?.filter(s => s.status === 'completada').length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
          <CardHeader className="pb-2 bg-primary/5">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Anulaciones</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black tracking-tight text-red-600">{sales?.filter(s => s.status === 'cancelada').length || 0}</div>
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
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Items</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Total</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Pago</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.map((sale) => (
              <TableRow 
                key={sale.id} 
                className={cn(
                  "hover:bg-primary/5 border-border/50 transition-colors",
                  sale.status === 'cancelada' && "bg-red-50/30 grayscale-[0.5]"
                )}
              >
                <TableCell className={cn("font-black", sale.status === 'cancelada' ? "line-through text-red-400" : "text-black")}>
                  {sale.folio}
                </TableCell>
                <TableCell className="font-medium text-xs">
                  {sale.date?.seconds ? format(new Date(sale.date.seconds * 1000), "dd MMM, HH:mm", { locale: es }) : "..."}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-black/5 text-black font-black text-[9px] px-2">
                    {sale.items.reduce((acc, item) => acc + Number(item.quantity), 0)}
                  </Badge>
                </TableCell>
                <TableCell className={cn("font-black text-lg", sale.status === 'cancelada' ? "text-red-300" : "text-black")}>
                  ${sale.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge className={cn("uppercase text-[9px] font-black px-3", sale.status === 'cancelada' ? "bg-muted" : "bg-primary text-black")}>
                    {sale.paymentMethod}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-black hover:text-white rounded-lg" onClick={() => setViewingTicket(sale)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-black hover:text-white rounded-lg" onClick={() => setViewingTicket(sale)}>
                      <Printer className="w-4 h-4" />
                    </Button>
                    {sale.status === 'completada' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 hover:bg-red-600 hover:text-white rounded-lg"
                        onClick={() => setCancellingSale(sale)}
                      >
                        <Ban className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredSales.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-4 text-muted-foreground">
            <ReceiptText className="w-16 h-16 opacity-10" />
            <p className="font-black uppercase italic tracking-tighter">Historial Vacío</p>
          </div>
        )}
      </div>

      <AlertDialog open={!!cancellingSale} onOpenChange={(open) => !open && setCancellingSale(null)}>
        <AlertDialogContent className="rounded-3xl border-4 border-black font-body">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <AlertTriangle className="text-red-600 w-8 h-8" />
              ¿Confirmar Anulación?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">
              Esta acción marcará la venta <span className="font-black text-black">{cancellingSale?.folio}</span> como cancelada y devolverá el stock a los productos correspondientes.
            </AlertDialogDescription>
            <div className="mt-6 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Motivo de la cancelación (Opcional)</label>
              <Input 
                placeholder="Ej. Error en cobro, Devolución de cliente..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="border-2 border-muted focus:border-red-600 h-12 rounded-xl"
              />
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-4">
            <AlertDialogCancel className="h-14 rounded-2xl border-2 border-black font-black uppercase text-xs">Mantener Venta</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                handleCancelSale()
              }}
              disabled={isProcessingCancel}
              className="h-14 rounded-2xl bg-red-600 hover:bg-black text-white font-black uppercase text-xs flex items-center gap-2"
            >
              {isProcessingCancel ? <Loader2 className="animate-spin" /> : <Ban className="w-4 h-4" />}
              Anular Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!viewingTicket} onOpenChange={(open) => !open && setViewingTicket(null)}>
        <DialogContent className="max-w-sm border-none p-0 bg-transparent shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Detalle del Ticket</DialogTitle>
          </DialogHeader>
          <div className="bg-white p-6 rounded-2xl shadow-2xl relative">
            <Button variant="ghost" size="icon" className="absolute right-2 top-2 rounded-full" onClick={() => setViewingTicket(null)}>
              <X className="w-4 h-4" />
            </Button>
            {viewingTicket && <TicketView sale={viewingTicket} />}
            <div className="mt-6">
              <Button className="w-full bg-black text-primary font-black uppercase italic tracking-tighter h-14 rounded-xl" onClick={() => window.print()}>
                <Printer className="w-5 h-5 mr-2" /> IMPRIMIR TICKET
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
