"use client"

import { useState, useEffect, useRef } from "react"
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
import { Banknote, CreditCard, Send, History, CheckCircle2, Calculator, Loader2 } from "lucide-react"
import { PaymentMethod, SaleItem } from "@/types"
import { useFirestore, useUser } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp, increment } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  total: number
  cartItems: SaleItem[]
  onConfirm: () => void
}

export function PaymentModal({ isOpen, onClose, total, cartItems, onConfirm }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('efectivo')
  const [amountPaid, setAmountPaid] = useState<string>(total.toString())
  const [change, setChange] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const amountInputRef = useRef<HTMLInputElement>(null)
  
  const { toast } = useToast()
  const db = useFirestore()
  const { user } = useUser()

  useEffect(() => {
    if (isOpen) {
      setAmountPaid(total.toString())
      setMethod('efectivo')
      const timer = setTimeout(() => amountInputRef.current?.focus(), 150)
      return () => clearTimeout(timer)
    }
  }, [isOpen, total])

  useEffect(() => {
    const paid = parseFloat(amountPaid) || 0
    setChange(Math.max(0, paid - total))
  }, [amountPaid, total])

  /**
   * PROCESO DE FINALIZAR COBRO
   * Guarda la venta y descuenta inventario de forma atómica.
   */
  const handleConfirm = async () => {
    if (!db || !user?.uid) {
      toast({ title: "Error de sesión", description: "Debes estar autenticado para cobrar.", variant: "destructive" })
      return
    }

    const paid = parseFloat(amountPaid) || total
    if (method === 'efectivo' && paid < total) {
      toast({ title: "Monto insuficiente", description: "El dinero recibido es menor al total.", variant: "destructive" })
      return
    }

    setIsProcessing(true)
    
    try {
      const batch = writeBatch(db)
      
      // 1. ESTRUCTURA DEL DOCUMENTO DE VENTA (Ruta segura por negocio)
      const saleRef = doc(collection(db, "negocios", user.uid, "ventas"))
      
      const saleData = {
        ownerId: user.uid,        // ID del dueño del negocio para reglas de seguridad
        userId: user.uid,         // Usuario que realizó la venta
        userEmail: user.email,    // Email para auditoría
        date: serverTimestamp(),
        items: cartItems,         // Detalle de productos
        total: total,
        paymentMethod: method,
        amountPaid: paid,
        change: change,
        createdAt: serverTimestamp()
      }
      
      batch.set(saleRef, saleData)

      // 2. DESCUENTO DE STOCK ATÓMICO (Ruta segura por negocio)
      cartItems.forEach((item) => {
        const productRef = doc(db, "negocios", user.uid, "productos", item.productId)
        batch.update(productRef, {
          stock: increment(-item.quantity)
        })
      })

      // 3. EJECUCIÓN ATÓMICA
      await batch.commit()
      
      setIsProcessing(false)
      onConfirm() 
    } catch (error: any) {
      console.error("Error al procesar la venta:", error)
      setIsProcessing(false)
      toast({ 
        title: "Error crítico", 
        description: "No se pudo completar la venta. Verifique permisos.", 
        variant: "destructive" 
      })
    }
  }

  const quickAmounts = useMemo(() => {
    const suggestions = [
      total,
      Math.ceil(total / 20) * 20,
      Math.ceil(total / 50) * 50,
      Math.ceil(total / 100) * 100,
      Math.ceil(total / 200) * 200,
      Math.ceil(total / 500) * 500,
    ]
    // Filtrar duplicados y montos menores al total
    return Array.from(new Set(suggestions))
      .filter(a => a >= total)
      .sort((a, b) => a - b)
      .slice(0, 5)
  }, [total])

  return (
    <Dialog open={isOpen} onOpenChange={isProcessing ? undefined : onClose}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl">
        <DialogHeader className="bg-black p-10 text-white relative border-b-8 border-primary">
          <div className="flex flex-col">
            <span className="text-primary font-black uppercase tracking-[0.4em] text-[11px] mb-2 italic">Terminal de Cobro</span>
            <DialogTitle className="text-4xl font-black italic uppercase tracking-tighter leading-none">Confirmar Venta</DialogTitle>
          </div>
          <div className="mt-10 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Total a Pagar</span>
              <div className="text-7xl font-black text-primary tracking-tighter italic leading-none">$ {total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <Calculator className="w-10 h-10 text-white/20" />
            </div>
          </div>
        </DialogHeader>

        <div className="p-10 space-y-10 bg-white">
          <div className="space-y-5">
            <Label className="text-xs font-black uppercase tracking-[0.2em] text-black/40 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-black text-primary flex items-center justify-center text-[10px]">1</span>
              Método de Pago
            </Label>
            <RadioGroup 
              value={method} 
              onValueChange={(val) => setMethod(val as PaymentMethod)}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              disabled={isProcessing}
            >
              {[
                { id: 'efectivo', icon: Banknote, label: 'Efectivo' },
                { id: 'tarjeta', icon: CreditCard, label: 'Tarjeta' },
                { id: 'transferencia', icon: Send, label: 'Transfer.' },
                { id: 'credito', icon: History, label: 'Crédito' }
              ].map((m) => (
                <div key={`method-${m.id}`} className="relative">
                  <RadioGroupItem value={m.id} id={`input-${m.id}`} className="peer sr-only" />
                  <Label
                    htmlFor={`input-${m.id}`}
                    className="flex flex-col items-center justify-center rounded-[2rem] border-4 border-muted bg-white p-4 h-32 hover:border-black/10 cursor-pointer peer-data-[state=checked]:border-black peer-data-[state=checked]:bg-black peer-data-[state=checked]:text-primary transition-all shadow-sm active:scale-95"
                  >
                    <m.icon className="mb-3 h-8 w-8 text-muted-foreground peer-data-[state=checked]:text-primary" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-inherit">{m.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {method === 'efectivo' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 bg-muted/20 p-8 rounded-[2.5rem] border-2 border-muted/50">
              <div className="flex flex-col gap-4">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-black/40">Sugerencias (Rápido)</Label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {quickAmounts.map((amt) => (
                    <Button 
                      key={`btn-amt-${amt}`} 
                      variant="outline" 
                      disabled={isProcessing}
                      onClick={() => setAmountPaid(amt.toString())}
                      className="whitespace-nowrap rounded-2xl border-2 border-black/10 font-black text-sm h-14 px-6 hover:bg-black hover:text-primary transition-all active:scale-90"
                    >
                      $ {amt}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="amountPaid" className="font-black text-[11px] uppercase tracking-widest text-black/60 italic">Recibido</Label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-black text-black/20">$</span>
                    <Input 
                      id="amountPaid"
                      ref={amountInputRef}
                      type="number"
                      disabled={isProcessing}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="text-5xl h-24 font-black tracking-tighter rounded-[1.5rem] border-4 border-black focus-visible:ring-primary pl-12 bg-white shadow-xl"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="font-black text-[11px] uppercase tracking-widest text-green-600 italic">Cambio</Label>
                  <div className="h-24 flex items-center bg-green-50 rounded-[1.5rem] border-4 border-green-200 px-6 shadow-inner">
                    <span className="text-5xl font-black text-green-600 tracking-tighter italic">$ {change.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-10 bg-black/5 border-t border-muted flex flex-col sm:flex-row gap-4">
          <Button variant="ghost" onClick={onClose} disabled={isProcessing} size="lg" className="flex-1 font-black uppercase tracking-[0.3em] text-xs h-20 rounded-2xl hover:bg-black hover:text-white transition-all">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isProcessing}
            size="lg" 
            className="flex-1 bg-black hover:bg-black/90 text-primary font-black text-2xl h-20 rounded-[1.5rem] shadow-2xl shadow-primary/20 flex items-center gap-3 transition-all active:scale-95 group"
          >
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6 group-hover:scale-125 transition-transform" />
                CONFIRMAR PAGO
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
