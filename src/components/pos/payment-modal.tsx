
"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Banknote, CreditCard, Send, History, CheckCircle2, Calculator, Loader2, AlertCircle } from "lucide-react"
import { PaymentMethod, SaleItem, SaleStatus, Sale } from "@/types"
import { useFirestore, useUser } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp, increment } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  total: number
  cartItems: SaleItem[]
  onConfirm: (sale: Sale) => void
}

export function PaymentModal({ isOpen, onClose, total, cartItems, onConfirm }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('efectivo')
  const [amountPaid, setAmountPaid] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const amountInputRef = useRef<HTMLInputElement>(null)
  
  const { toast } = useToast()
  const db = useFirestore()
  const { user } = useUser()

  const numericTotal = useMemo(() => Number(total) || 0, [total])

  useEffect(() => {
    if (isOpen) {
      setAmountPaid("")
      setMethod('efectivo')
      setTimeout(() => amountInputRef.current?.focus(), 200)
    }
  }, [isOpen])

  const change = useMemo(() => {
    const paid = parseFloat(amountPaid) || 0
    return Math.max(0, paid - numericTotal)
  }, [amountPaid, numericTotal])

  const isInsufficientAmount = useMemo(() => {
    if (method !== 'efectivo' || !amountPaid) return false
    return (parseFloat(amountPaid) || 0) < numericTotal
  }, [method, amountPaid, numericTotal])

  const handleConfirm = async () => {
    if (!db || !user?.uid) return
    const paid = method === 'efectivo' ? (parseFloat(amountPaid) || 0) : numericTotal
    if (method === 'efectivo' && paid < numericTotal) return

    setIsProcessing(true)
    try {
      const batch = writeBatch(db)
      const saleRef = doc(collection(db, "negocios", user.uid, "ventas"))
      const folio = `F-${Date.now().toString().slice(-6)}`
      
      const saleData = {
        id: saleRef.id,
        ownerId: user.uid,
        ownerEmail: user.email,
        userId: user.uid,
        userEmail: user.email,
        date: serverTimestamp(),
        items: cartItems,
        total: numericTotal,
        subtotal: Number((numericTotal / 1.16).toFixed(2)),
        discount: 0,
        paymentMethod: method,
        amountPaid: paid,
        change: change,
        status: 'completada' as SaleStatus,
        createdAt: serverTimestamp(),
        folio: folio
      }
      
      batch.set(saleRef, saleData)

      cartItems.forEach((item) => {
        const productRef = doc(db, "negocios", user.uid!, "productos", item.productId)
        batch.update(productRef, {
          stockActual: increment(-Number(item.quantity))
        })
      })

      await batch.commit()
      onConfirm(saleData as unknown as Sale)
    } catch (error) {
      toast({ title: "ERROR CRÍTICO", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={isProcessing ? undefined : onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl font-body">
        <DialogHeader className="bg-black p-10 text-white border-b-8 border-primary">
          <div className="flex flex-col mb-4">
            <span className="text-primary font-black uppercase tracking-[0.4em] text-[11px] italic text-center">Terminal de Pago</span>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter leading-none opacity-50 text-center">Confirmar Cobro</DialogTitle>
          </div>
          <div className="text-center">
            <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Total Neto</span>
            <div className="text-8xl font-black text-primary tracking-tighter italic leading-none">$ {numericTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
          </div>
        </DialogHeader>

        <div className="p-10 space-y-10 bg-white">
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">1. Seleccionar Método</Label>
            <RadioGroup value={method} onValueChange={(val) => setMethod(val as PaymentMethod)} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'efectivo', icon: Banknote, label: 'Efectivo' },
                { id: 'tarjeta', icon: CreditCard, label: 'Tarjeta' },
                { id: 'transferencia', icon: Send, label: 'Transfer.' },
                { id: 'credito', icon: History, label: 'Crédito' }
              ].map((m) => (
                <div key={m.id}>
                  <RadioGroupItem value={m.id} id={m.id} className="sr-only peer" />
                  <Label htmlFor={m.id} className="flex flex-col items-center justify-center rounded-2xl border-4 border-muted p-3 h-24 cursor-pointer peer-data-[state=checked]:border-black peer-data-[state=checked]:bg-black peer-data-[state=checked]:text-primary transition-all">
                    <m.icon className="mb-2 h-6 w-6" />
                    <span className="text-[10px] font-black uppercase">{m.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {method === 'efectivo' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label className="font-black text-[12px] uppercase tracking-widest text-black/60 italic">Monto Recibido</Label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-black text-black/20">$</span>
                  <Input 
                    ref={amountInputRef}
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className={cn("text-6xl h-28 font-black tracking-tighter rounded-[2rem] border-4 pl-14 shadow-xl", isInsufficientAmount ? "border-red-600" : "border-black")}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Label className="font-black text-[12px] uppercase tracking-widest text-green-600 italic">Cambio</Label>
                <div className={cn("h-28 flex flex-col items-center justify-center rounded-[2rem] border-4", change > 0 ? "bg-green-500 border-black" : "bg-muted/30 border-muted")}>
                  <div className="text-6xl font-black tracking-tighter italic leading-none">$ {change.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-10 bg-black/5 border-t border-muted flex gap-4">
          <Button variant="ghost" onClick={onClose} className="flex-1 h-14 font-black uppercase tracking-widest text-xs rounded-xl">Cancelar</Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isProcessing || isInsufficientAmount || (method === 'efectivo' && !amountPaid)}
            className="flex-[2] h-20 bg-primary hover:bg-black hover:text-primary text-black font-black text-3xl italic rounded-[2rem] shadow-2xl border-4 border-black transition-all active:scale-95"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : "REGISTRAR VENTA"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
