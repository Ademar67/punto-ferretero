
"use client"

import { useState, useMemo } from "react"
import { Search, Plus, FileText, Eye, Trash2, ShoppingCart, Loader2, ArrowRight, Printer, WhatsApp, Calendar, AlertTriangle } from "lucide-react"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { query, collection, orderBy, doc, deleteDoc, writeBatch, serverTimestamp, increment } from "firebase/firestore"
import { Quotation, Sale } from "@/types"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { format, isAfter } from "date-fns"
import { es } from "date-fns/locale"
import { QuotationView } from "@/components/cotizaciones/quotation-view"

export default function CotizacionesPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const quotesQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null
    return query(
      collection(db, "negocios", user.uid, "cotizaciones"),
      orderBy("date", "desc")
    )
  }, [db, user?.uid])

  const { data: quotations, isLoading } = useCollection<Quotation>(quotesQuery)

  const filteredQuotes = useMemo(() => {
    if (!quotations) return []
    return quotations.filter(q => 
      q.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    ).map(q => {
      // Lógica dinámica para marcar como vencida si aplica
      if (q.status === 'pendiente' && q.validUntil?.seconds) {
        const expiryDate = new Date(q.validUntil.seconds * 1000)
        if (isAfter(new Date(), expiryDate)) {
          return { ...q, status: 'vencida' as const }
        }
      }
      return q
    })
  }, [quotations, searchTerm])

  const handleDelete = async (id: string) => {
    if (!db || !user?.uid || !confirm("¿Eliminar esta cotización?")) return
    try {
      await deleteDoc(doc(db, "negocios", user.uid, "cotizaciones", id))
      toast({ title: "COTIZACIÓN ELIMINADA" })
    } catch (e) {
      toast({ title: "ERROR AL ELIMINAR", variant: "destructive" })
    }
  }

  const handleConvertToSale = async (quotation: Quotation) => {
    if (!db || !user?.uid || isProcessing) return
    
    if (quotation.status === 'vencida') {
      toast({ 
        title: "COTIZACIÓN VENCIDA", 
        description: "No se puede convertir una cotización que ya expiró.",
        variant: "destructive" 
      })
      return
    }

    if (!confirm(`¿Convertir cotización ${quotation.folio} a venta real? Se descontará inventario.`)) return

    setIsProcessing(true)
    try {
      const batch = writeBatch(db)
      const saleRef = doc(collection(db, "negocios", user.uid, "ventas"))
      const quoteRef = doc(db, "negocios", user.uid, "cotizaciones", quotation.id)
      const saleFolio = `V-${Date.now().toString().slice(-6)}`

      const saleData = {
        id: saleRef.id,
        ownerId: user.uid,
        ownerEmail: user.email,
        userId: user.uid,
        userEmail: user.email,
        date: serverTimestamp(),
        items: quotation.items,
        total: quotation.total,
        subtotal: quotation.subtotal,
        discount: quotation.discount,
        paymentMethod: 'efectivo',
        amountPaid: quotation.total,
        change: 0,
        status: 'completada',
        createdAt: serverTimestamp(),
        folio: saleFolio,
        fromQuotationId: quotation.id
      }

      batch.set(saleRef, saleData)
      batch.update(quoteRef, { 
        status: 'convertida',
        convertedToSaleId: saleRef.id
      })

      quotation.items.forEach((item) => {
        const productRef = doc(db, "negocios", user.uid!, "productos", item.productId)
        batch.update(productRef, {
          stockActual: increment(-Number(item.quantity))
        })
      })

      await batch.commit()
      toast({ 
        title: "¡CONVERTIDA A VENTA!", 
        description: `Venta generada con folio ${saleFolio}`,
        className: "bg-green-600 text-white font-black"
      })
    } catch (error) {
      toast({ title: "ERROR EN CONVERSIÓN", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const shareWhatsApp = (quote: Quotation) => {
    const text = `Hola! Te envío la cotización ${quote.folio} de Punto Ferretero por un total de $${quote.total.toFixed(2)}. Tiene vigencia de 7 días. Quedamos a tus órdenes.`
    const url = `https://wa.me/${quote.customerPhone || ""}?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F5F5F5] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
        <p className="font-black uppercase italic tracking-tighter">Cargando Cotizaciones...</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-[#f8f9fa] min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-black uppercase italic leading-none">
              Módulo de <span className="text-teal-600">Cotizaciones</span>
            </h1>
            <p className="text-muted-foreground font-medium">Presupuestos con vigencia automática de 7 días.</p>
          </div>
        </div>
        <Button asChild size="lg" className="h-14 bg-teal-600 hover:bg-teal-700 text-white font-black uppercase tracking-tighter rounded-xl shadow-lg">
          <Link href="/cotizaciones/nueva">
            <Plus className="w-5 h-5 mr-2" /> Nueva Cotización
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            placeholder="Buscar por folio o cliente..." 
            className="pl-12 h-14 border-2 focus:border-teal-600 text-lg rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-none overflow-hidden">
        <Table>
          <TableHeader className="bg-black">
            <TableRow className="hover:bg-black border-none">
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Folio</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Fecha</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Cliente</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Vencimiento</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Total</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">Estado</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.map((quote) => (
              <TableRow key={quote.id} className="hover:bg-teal-50/50 border-border/50 transition-colors">
                <TableCell className="font-black text-black italic">{quote.folio}</TableCell>
                <TableCell className="text-xs">
                  {quote.date?.seconds ? format(new Date(quote.date.seconds * 1000), "dd MMM, yy", { locale: es }) : "---"}
                </TableCell>
                <TableCell className="font-bold uppercase text-xs">
                  {quote.customerName || "Venta de Mostrador"}
                </TableCell>
                <TableCell className="text-xs font-medium">
                   {quote.validUntil?.seconds ? (
                     <span className={cn(quote.status === 'vencida' ? "text-red-500 font-black" : "text-muted-foreground")}>
                       {format(new Date(quote.validUntil.seconds * 1000), "dd MMM, yy", { locale: es })}
                     </span>
                   ) : "7 días"}
                </TableCell>
                <TableCell className="font-black text-lg text-black">${quote.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={cn(
                    "uppercase text-[9px] font-black px-3",
                    quote.status === 'pendiente' ? "bg-orange-500" : 
                    quote.status === 'convertida' ? "bg-green-600" : "bg-red-600"
                  )}>
                    {quote.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-teal-600 hover:text-white rounded-lg" onClick={() => setViewingQuotation(quote)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {quote.status === 'pendiente' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 hover:bg-green-600 hover:text-white rounded-lg"
                        onClick={() => handleConvertToSale(quote)}
                        disabled={isProcessing}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-red-600 hover:text-white rounded-lg" onClick={() => handleDelete(quote.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredQuotes.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-4 text-muted-foreground">
            <FileText className="w-16 h-16 opacity-10" />
            <p className="font-black uppercase italic tracking-tighter">Sin cotizaciones registradas</p>
          </div>
        )}
      </div>

      <Dialog open={!!viewingQuotation} onOpenChange={(open) => !open && setViewingQuotation(null)}>
        <DialogContent className="max-w-2xl border-none p-0 bg-transparent shadow-none">
          <DialogHeader>
            <DialogTitle className="sr-only">Detalles de la cotización</DialogTitle>
          </DialogHeader>
          <div className="bg-white p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {viewingQuotation && <QuotationView quotation={viewingQuotation} />}
            </div>
            <div className="flex gap-4 pt-4 border-t">
              <Button variant="outline" className="flex-1 h-14 border-2 border-black font-black uppercase rounded-xl" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" /> Imprimir
              </Button>
              {viewingQuotation?.customerPhone && (
                <Button className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-white font-black uppercase rounded-xl" onClick={() => shareWhatsApp(viewingQuotation)}>
                  <WhatsApp className="w-4 h-4 mr-2" /> WhatsApp
                </Button>
              )}
              <Button className="bg-black text-white font-black uppercase h-14 px-8 rounded-xl" onClick={() => setViewingQuotation(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
