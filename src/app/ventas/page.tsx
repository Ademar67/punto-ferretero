"use client"

import { useState } from "react"
import {
  Search,
  Eye,
  Printer,
  FileDown,
  ReceiptText,
  Calendar as CalendarIcon,
  Ban,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react"
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
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase"
import {
  query,
  collection,
  orderBy,
  doc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore"
import { Sale } from "@/types"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { TicketView } from "@/components/pos/ticket-view"

type ReturnedItemsByProductId = Record<string, number>

export default function VentasPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [cancellingSale, setCancellingSale] = useState<Sale | null>(null)
  const [viewingTicket, setViewingTicket] = useState<Sale | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [isProcessingCancel, setIsProcessingCancel] = useState(false)
  const [partialReturnQuantities, setPartialReturnQuantities] = useState<Record<string, number>>({})

  const salesQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null
    return query(
      collection(db, "negocios", user.uid, "ventas"),
      orderBy("date", "desc")
    )
  }, [db, user?.uid])

  const { data: sales, isLoading } = useCollection<Sale>(salesQuery)

  const filteredSales =
    sales?.filter(
      (s) =>
        s.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

  const getReturnedQty = (sale: Sale, productId: string) => {
    const returnedItemsByProductId =
      ((sale as any).returnedItemsByProductId || {}) as ReturnedItemsByProductId

    return Number(returnedItemsByProductId[productId] || 0)
  }

  const getPendingQty = (sale: Sale, productId: string, soldQty: number) => {
    return Math.max(0, Number(soldQty || 0) - getReturnedQty(sale, productId))
  }

  const openCancelModal = (sale: Sale) => {
    const initialQuantities: Record<string, number> = {}

    sale.items.forEach((item) => {
      const pendingQty = getPendingQty(sale, item.productId, Number(item.quantity))
      initialQuantities[item.productId] = pendingQty
    })

    setPartialReturnQuantities(initialQuantities)
    setCancelReason("")
    setCancellingSale(sale)
  }

  const closeCancelModal = () => {
    if (isProcessingCancel) return
    setCancellingSale(null)
    setCancelReason("")
    setPartialReturnQuantities({})
  }

  const handleCancelSale = async () => {
    if (!db || !user?.uid || !cancellingSale?.id) return

    const selectedItems = cancellingSale.items
      .map((item) => {
        const qtyToReturn = Number(partialReturnQuantities[item.productId] || 0)
        const pendingQty = getPendingQty(
          cancellingSale,
          item.productId,
          Number(item.quantity)
        )

        return {
          ...item,
          qtyToReturn,
          pendingQty,
        }
      })
      .filter((item) => item.qtyToReturn > 0)

    if (selectedItems.length === 0) {
      toast({
        title: "SIN PRODUCTOS",
        description: "Selecciona al menos una cantidad para devolver.",
        variant: "destructive",
      })
      return
    }

    const invalidItem = selectedItems.find(
      (item) => item.qtyToReturn > item.pendingQty
    )

    if (invalidItem) {
      toast({
        title: "CANTIDAD INVÁLIDA",
        description: `No puedes devolver más de lo vendido en ${invalidItem.name}.`,
        variant: "destructive",
      })
      return
    }

    setIsProcessingCancel(true)

    try {
      await runTransaction(db, async (transaction) => {
        const saleRef = doc(db, "negocios", user.uid, "ventas", cancellingSale.id!)
        const saleSnap = await transaction.get(saleRef)

        if (!saleSnap.exists()) {
          throw new Error("La venta ya no existe.")
        }

        const freshSale = saleSnap.data() as Sale & {
          returnedItemsByProductId?: Record<string, number>
          refundedAmount?: number
          originalTotal?: number
        }

        if (freshSale.status === "cancelada") {
          throw new Error("Esta venta ya fue cancelada por completo.")
        }

        const currentReturnedItemsByProductId =
          freshSale.returnedItemsByProductId || {}

        const updatedReturnedItemsByProductId = {
          ...currentReturnedItemsByProductId,
        }

        const currentRefundedAmount = Number(freshSale.refundedAmount || 0)

        const originalTotal =
          typeof freshSale.originalTotal === "number"
            ? Number(freshSale.originalTotal)
            : Number(freshSale.total || 0) + currentRefundedAmount

        let refundAmountThisTransaction = 0

        for (const selectedItem of selectedItems) {
          const freshItem = freshSale.items.find(
            (item) => item.productId === selectedItem.productId
          )

          if (!freshItem) {
            throw new Error(`El producto ${selectedItem.name} no existe en esta venta.`)
          }

          const soldQty = Number(freshItem.quantity || 0)
          const alreadyReturnedQty = Number(
            currentReturnedItemsByProductId[selectedItem.productId] || 0
          )

          const availableToReturn = soldQty - alreadyReturnedQty

          if (availableToReturn <= 0) {
            throw new Error(`${freshItem.name} ya fue devuelto por completo.`)
          }

          if (selectedItem.qtyToReturn > availableToReturn) {
            throw new Error(
              `No puedes devolver ${selectedItem.qtyToReturn} de ${freshItem.name}. Disponible: ${availableToReturn}.`
            )
          }

          const productRef = doc(
            db,
            "negocios",
            user.uid,
            "productos",
            selectedItem.productId
          )

          const productSnap = await transaction.get(productRef)

          if (!productSnap.exists()) {
            throw new Error(`No existe el producto ${freshItem.name} en inventario.`)
          }

          const productData = productSnap.data()
          const stockActual = Number(productData.stockActual || 0)
          const newStockActual = stockActual + selectedItem.qtyToReturn

          transaction.update(productRef, {
            stockActual: newStockActual,
            updatedAt: serverTimestamp(),
          })

          const precioUnitario =
            soldQty > 0 ? Number(freshItem.subtotal || 0) / soldQty : 0

          const refundLineAmount = precioUnitario * selectedItem.qtyToReturn
          refundAmountThisTransaction += refundLineAmount

          const movementRef = doc(
            collection(db, "negocios", user.uid, "movimientosInventario")
          )

          transaction.set(movementRef, {
            ownerId: user.uid,
            productId: selectedItem.productId,
            productName: freshItem.name,
            codigo: selectedItem.productId,
            type: "devolucion",
            quantity: selectedItem.qtyToReturn,
            refundAmount: refundLineAmount,
            reason:
              cancelReason ||
              `Devolución/cancelación parcial de venta folio ${freshSale.folio}`,
            saleId: cancellingSale.id,
            saleFolio: freshSale.folio,
            date: serverTimestamp(),
            userId: user.uid,
            userEmail: user.email || "",
          })

          updatedReturnedItemsByProductId[selectedItem.productId] =
            alreadyReturnedQty + selectedItem.qtyToReturn
        }

        let totalReturnedAfterThisCancel = 0

        freshSale.items.forEach((item) => {
          totalReturnedAfterThisCancel += Number(
            updatedReturnedItemsByProductId[item.productId] || 0
          )
        })

        const totalSoldQty = freshSale.items.reduce(
          (acc, item) => acc + Number(item.quantity || 0),
          0
        )

        const newRefundedAmount = currentRefundedAmount + refundAmountThisTransaction

        const newStatus =
          totalReturnedAfterThisCancel >= totalSoldQty
            ? "cancelada"
            : "parcialmente_cancelada"

        const newTotal =
          newStatus === "cancelada"
            ? 0
            : Math.max(0, originalTotal - newRefundedAmount)

        transaction.update(saleRef, {
          status: newStatus,
          total: newTotal,
          originalTotal,
          refundedAmount: newRefundedAmount,
          lastRefundAmount: refundAmountThisTransaction,
          returnedItemsByProductId: updatedReturnedItemsByProductId,
          lastCancelledAt: serverTimestamp(),
          cancelledAt: newStatus === "cancelada" ? serverTimestamp() : null,
          cancelledByUserId: user.uid,
          cancelledByUserEmail: user.email || "",
          cancelReason: cancelReason || "Sin motivo especificado",
        })
      })

      toast({
        title: "DEVOLUCIÓN REGISTRADA",
        description: `Se devolvió producto y dinero del folio ${cancellingSale.folio}.`,
        className: "bg-black text-primary border-primary border-2 font-black",
      })

      closeCancelModal()
    } catch (error: any) {
      console.error("Error al cancelar venta:", error)

      toast({
        title: "ERROR",
        description:
          error?.message || "No se pudo procesar la devolución. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsProcessingCancel(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F5F5F5] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="font-black uppercase italic tracking-tighter">
          Consultando Historial...
        </p>
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
            <p className="text-muted-foreground font-medium">
              Consulta y gestiona todos los tickets generados.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="h-12 px-6 border-2 border-black font-black uppercase tracking-tighter hover:bg-black hover:text-white transition-all rounded-xl"
        >
          <FileDown className="w-5 h-5 mr-2" /> Reporte Mensual
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
          <CardHeader className="pb-2 bg-primary/5">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Total Ventas Netas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black tracking-tight">
              ${" "}
              {sales
                ?.reduce(
                  (acc, s) =>
                    acc +
                    (s.status === "completada" ||
                    s.status === "parcialmente_cancelada"
                      ? Number(s.total || 0)
                      : 0),
                  0
                )
                .toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
          <CardHeader className="pb-2 bg-primary/5">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Tickets Activos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black tracking-tight">
              {sales?.filter(
                (s) =>
                  s.status === "completada" ||
                  s.status === "parcialmente_cancelada"
              ).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
          <CardHeader className="pb-2 bg-primary/5">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Anulaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black tracking-tight text-red-600">
              {sales?.filter((s) => s.status === "cancelada").length || 0}
            </div>
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

        <Button
          variant="outline"
          className="h-14 px-6 border-2 border-black font-bold uppercase tracking-tighter flex items-center gap-2 rounded-xl"
        >
          <CalendarIcon className="w-5 h-5" />
          Filtrar por Fecha
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-none overflow-hidden">
        <Table>
          <TableHeader className="bg-black">
            <TableRow className="hover:bg-black border-none">
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">
                Folio
              </TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">
                Fecha / Hora
              </TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">
                Items
              </TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">
                Total
              </TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">
                Pago
              </TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14 text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredSales.map((sale) => (
              <TableRow
                key={sale.id}
                className={cn(
                  "hover:bg-primary/5 border-border/50 transition-colors",
                  sale.status === "cancelada" && "bg-red-50/30 grayscale-[0.5]",
                  sale.status === "parcialmente_cancelada" && "bg-orange-50/50"
                )}
              >
                <TableCell
                  className={cn(
                    "font-black",
                    sale.status === "cancelada"
                      ? "line-through text-red-400"
                      : "text-black"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span>{sale.folio}</span>
                    {sale.status === "parcialmente_cancelada" && (
                      <Badge className="w-fit bg-orange-500 text-white text-[8px] font-black">
                        PARCIAL
                      </Badge>
                    )}
                    {sale.status === "cancelada" && (
                      <Badge className="w-fit bg-red-600 text-white text-[8px] font-black">
                        CANCELADA
                      </Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell className="font-medium text-xs">
                  {sale.date?.seconds
                    ? format(new Date(sale.date.seconds * 1000), "dd MMM, HH:mm", {
                        locale: es,
                      })
                    : "..."}
                </TableCell>

                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-black/5 text-black font-black text-[9px] px-2"
                  >
                    {sale.items.reduce(
                      (acc, item) => acc + Number(item.quantity),
                      0
                    )}
                  </Badge>
                </TableCell>

                <TableCell
                  className={cn(
                    "font-black text-lg",
                    sale.status === "cancelada" ? "text-red-300" : "text-black"
                  )}
                >
                  ${Number(sale.total || 0).toFixed(2)}
                </TableCell>

                <TableCell>
                  <Badge
                    className={cn(
                      "uppercase text-[9px] font-black px-3",
                      sale.status === "cancelada"
                        ? "bg-muted"
                        : "bg-primary text-black"
                    )}
                  >
                    {sale.paymentMethod}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hover:bg-black hover:text-white rounded-lg"
                      onClick={() => setViewingTicket(sale)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hover:bg-black hover:text-white rounded-lg"
                      onClick={() => setViewingTicket(sale)}
                    >
                      <Printer className="w-4 h-4" />
                    </Button>

                    {(sale.status === "completada" ||
                      sale.status === "parcialmente_cancelada") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hover:bg-red-600 hover:text-white rounded-lg"
                        onClick={() => openCancelModal(sale)}
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
            <p className="font-black uppercase italic tracking-tighter">
              Historial Vacío
            </p>
          </div>
        )}
      </div>

      <AlertDialog open={!!cancellingSale} onOpenChange={(open) => !open && closeCancelModal()}>
        <AlertDialogContent className="rounded-3xl border-4 border-black font-body max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <AlertTriangle className="text-red-600 w-8 h-8" />
              Devolución / Cancelación parcial
            </AlertDialogTitle>

            <AlertDialogDescription className="text-base font-medium">
              Selecciona cuántas piezas vas a devolver del folio{" "}
              <span className="font-black text-black">{cancellingSale?.folio}</span>.
              Si devuelves todo, la venta quedará como cancelada y el total será $0.
            </AlertDialogDescription>

            <div className="mt-6 space-y-4">
              {cancellingSale?.items.map((item) => {
                const soldQty = Number(item.quantity || 0)
                const returnedQty = getReturnedQty(cancellingSale, item.productId)
                const pendingQty = getPendingQty(
                  cancellingSale,
                  item.productId,
                  soldQty
                )

                return (
                  <div
                    key={item.productId}
                    className="rounded-2xl border-2 border-black/10 p-4 bg-muted/30"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-sm uppercase">{item.name}</p>
                        <p className="text-xs font-bold text-muted-foreground">
                          Vendido: {soldQty} · Ya devuelto: {returnedQty} · Disponible:{" "}
                          {pendingQty}
                        </p>
                      </div>

                      <Input
                        type="number"
                        min={0}
                        max={pendingQty}
                        value={partialReturnQuantities[item.productId] ?? 0}
                        disabled={pendingQty <= 0 || isProcessingCancel}
                        onChange={(e) => {
                          const rawValue = Number(e.target.value || 0)
                          const safeValue = Math.max(0, Math.min(rawValue, pendingQty))

                          setPartialReturnQuantities((prev) => ({
                            ...prev,
                            [item.productId]: safeValue,
                          }))
                        }}
                        className="w-full md:w-32 h-12 border-2 border-black rounded-xl font-black text-center"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Motivo de la devolución / cancelación
              </label>
              <Input
                placeholder="Ej. Error en cobro, devolución de cliente..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="border-2 border-muted focus:border-red-600 h-12 rounded-xl"
              />
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-8 gap-4">
            <AlertDialogCancel
              disabled={isProcessingCancel}
              className="h-14 rounded-2xl border-2 border-black font-black uppercase text-xs"
            >
              Mantener Venta
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleCancelSale()
              }}
              disabled={isProcessingCancel}
              className="h-14 rounded-2xl bg-red-600 hover:bg-black text-white font-black uppercase text-xs flex items-center gap-2"
            >
              {isProcessingCancel ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Ban className="w-4 h-4" />
              )}
              Procesar devolución
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!viewingTicket} onOpenChange={(open) => !open && setViewingTicket(null)}>
        <DialogContent className="max-w-sm border-none p-0 bg-transparent shadow-none">
          <DialogHeader>
            <DialogTitle className="sr-only">
              Detalles del ticket de venta
            </DialogTitle>
          </DialogHeader>

          <div className="bg-white p-6 rounded-2xl shadow-2xl relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 rounded-full"
              onClick={() => setViewingTicket(null)}
            >
              <X className="w-4 h-4" />
            </Button>

            {viewingTicket && <TicketView sale={viewingTicket} />}

            <div className="mt-6">
              <Button
                className="w-full bg-black text-primary font-black uppercase italic tracking-tighter h-14 rounded-xl"
                onClick={() => window.print()}
              >
                <Printer className="w-5 h-5 mr-2" /> IMPRIMIR TICKET
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}