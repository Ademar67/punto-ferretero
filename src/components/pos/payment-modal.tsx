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
import { PaymentMethod, SaleItem, SaleStatus } from "@/types"
import { useFirestore, useUser } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp, increment } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  total: number
  cartItems: SaleItem[]
  onConfirm: () => void
}

export function PaymentModal({ isOpen, onClose, total, cartItems, onConfirm }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('efectivo')
  const [amountPaid, setAmountPaid] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const amountInputRef = useRef<HTMLInputElement>(null)
  
  const { toast } = useToast()
  const db = useFirestore()
  const { user } = useUser()

  useEffect(() => {
    if (isOpen) {
      setAmountPaid("")
      setMethod('efectivo')
      const timer = setTimeout(() => {
        amountInputRef.current?.focus()
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const change = useMemo(() => {
    const paid = parseFloat(amountPaid) || 0
    return Math.max(0, paid - total)
  }, [amountPaid, total])

  const isInsufficientAmount = useMemo(() => {
    if (method !== 'efectivo' || !amountPaid) return false
    const paid = parseFloat(amountPaid) || 0
    return paid < total
  }, [method, amountPaid, total])

  const handleConfirm = async () => {
    if (!db || !user?.uid) {
      toast({ title: "ERROR DE SESIÓN", description: "Debes estar autenticado para cobrar.", variant: "destructive" })
      return
    }

    const paid = method === 'efectivo' ? (parseFloat(amountPaid) || 0) : total
    
    if (method === 'efectivo' && paid < total) {
      toast({ 
        title: "PAGO INSUFICIENTE", 
        description: `Faltan $${(total - paid).toFixed(2)} para completar el total.`, 
        className: "bg-black text-red-500 border-red-500 border-2 font-black"
      })
      amountInputRef.current?.focus()
      return
    }

    setIsProcessing(true)
    
    try {
      const batch = writeBatch(db)
      const saleRef = doc(collection(db, "negocios", user.uid, "ventas"))
      
      const saleData = {
        ownerId: user.uid,
        ownerEmail: user.email,
        userId: user.uid,
        userEmail: user.email,
        date: serverTimestamp(),
        items: cartItems,
        total: total,
        subtotal: total / 1.16, // Estimación simple si no se calcula por ítem
        discount: 0,
        paymentMethod: method,
        amountPaid: paid,
        change: change,
        status: 'completada' as SaleStatus,
        createdAt: serverTimestamp(),
        folio: `V-${Date.now().toString().slice(-6)}` // Folio temporal simplificado
      }
      
      batch.set(saleRef, saleData)

      cartItems.forEach((item) => {
        const productRef = doc(db, "negocios", user.uid, "productos", item.productId)
        batch.update(productRef, {
          stock: increment(-item.quantity)
        })
      })

      await batch.commit()
      
      setAmountPaid("")
      setMethod('efectivo')
      setIsProcessing(false)
      
      onConfirm()
    } catch (error: any) {
      console.error("Error al procesar la venta:", error)
      setIsProcessing(false)
      toast({ 
        title: "ERROR CRÍTICO", 
        description: "No se pudo completar la venta. Verifique conexión.", 
        variant: "destructive" 
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && method === 'efectivo') {
      const paid = parseFloat(amountPaid) || 0
      if (paid >= total && !isProcessing) {
        handleConfirm()
      }
    }
  }

  const quickAmounts = useMemo(() => {
    const suggestions = [
      total,
      Math.ceil(total / 50) * 50,
      Math.ceil(total / 100) * 100,
      Math.ceil(total / 200) * 200,
      Math.ceil(total / 500) * 500,
    ]
    return Array.from(new Set(suggestions))
      .filter(a => a >= total)
      .sort((a, b) => a - b)
      .slice(0, 4)
  }, [total])

  return (
    <Dialog open={isOpen} onOpenChange={isProcessing ? undefined : onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl font-body">
        <DialogHeader className="bg-black p-10 text-white relative border-b-8 border-primary">
          <div className="flex flex-col mb-4">
            <span className="text-primary font-black uppercase tracking-[0.4em] text-[11px] italic">Terminal de Cobro</span>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter leading-none opacity-50">Confirmar Venta</DialogTitle>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Total Neto a Cobrar</span>
              <div className="text-8xl font-black text-primary tracking-tighter italic leading-none">$ {total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-white/5 p-4 rounded-3xl border border-white/10 hidden sm:block">
              <Calculator className="w-12 h-12 text-white/20" />
            </div>
          </div>
        </DialogHeader>

        <div className="p-10 space-y-10 bg-white">
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-black text-primary flex items-center justify-center text-[9px]">1</span>
              Método de Pago
            </Label>
            <RadioGroup 
              value={method} 
              onValueChange={(val) => setMethod(val as PaymentMethod)}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
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
                    className="flex flex-col items-center justify-center rounded-2xl border-4 border-muted bg-white p-3 h-24 hover:border-black/10 cursor-pointer peer-data-[state=checked]:border-black peer-data-[state=checked]:bg-black peer-data-[state=checked]:text-primary transition-all active:scale-95"
                  >
                    <m.icon className="mb-2 h-6 w-6 text-muted-foreground peer-data-[state=checked]:text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {method === 'efectivo' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label htmlFor="amountPaid" className={cn(
                    "font-black text-[12px] uppercase tracking-widest italic flex justify-between",
                    isInsufficientAmount ? "text-red-600" : "text-black/60"
                  )}>
                    <span>Monto Recibido</span>
                    {isInsufficientAmount && <AlertCircle className="w-4 h-4" />}
                  </Label>
                  <div className="relative group">
                    <span className={cn(
                      "absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-black transition-colors",
                      isInsufficientAmount ? "text-red-600" : "text-black/20 group-focus-within:text-black"
                    )}>$</span>
                    <Input 
                      id="amountPaid"
                      ref={amountInputRef}
                      type="number"
                      placeholder="0.00"
                      disabled={isProcessing}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={cn(
                        "text-6xl h-28 font-black tracking-tighter rounded-[2rem] border-4 focus-visible:ring-offset-4 pl-14 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all",
                        isInsufficientAmount 
                          ? "border-red-600 focus-visible:ring-red-600" 
                          : "border-black focus-visible:ring-primary"
                      )}
                    />
                  </div>
                  {isInsufficientAmount ? (
                    <p className="text-red-600 font-black text-[10px] uppercase tracking-widest animate-pulse flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Falta: $ {(total - parseFloat(amountPaid)).toFixed(2)}
                    </p>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                      {quickAmounts.map((amt) => (
                        <Button 
                          key={`btn-amt-${amt}`} 
                          variant="outline" 
                          type="button"
                          disabled={isProcessing}
                          onClick={() => {
                            setAmountPaid(amt.toString());
                            amountInputRef.current?.focus();
                          }}
                          className="flex-1 rounded-xl border-2 border-black/10 font-black text-xs h-12 hover:bg-black hover:text-primary transition-all active:scale-90"
                        >
                          $ {amt}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className="font-black text-[12px] uppercase tracking-widest text-green-600 italic">Cambio a Devolver</Label>
                  <div className={cn(
                    "h-28 flex flex-col items-center justify-center rounded-[2rem] border-4 transition-all shadow-inner px-6",
                    change > 0 ? "bg-green-500 border-black text-black" : "bg-muted/30 border-muted text-muted-foreground/30"
                  )}>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-1">Entregar</span>
                    <div className="text-6xl font-black tracking-tighter italic leading-none">
                      $ {change.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <p className="text-center text-[10px] font-black text-muted-foreground uppercase italic tracking-widest">
                    {amountPaid && !isInsufficientAmount ? "Verifica el efectivo en caja" : "Ingresa el pago del cliente"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {method !== 'efectivo' && (
            <div className="h-40 flex flex-col items-center justify-center bg-muted/20 rounded-[2rem] border-4 border-dashed border-muted">
              <CheckCircle2 className="w-12 h-12 text-muted-foreground/20 mb-2" />
              <p className="font-black text-muted-foreground uppercase tracking-widest text-xs">Confirmar cobro por {method}</p>
            </div>
          )}
        </div>

        <DialogFooter className="p-10 bg-black/5 border-t border-muted flex flex-col sm:flex-row gap-4">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isProcessing} 
            size="lg" 
            className="flex-1 font-black uppercase tracking-[0.3em] text-xs h-20 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isProcessing || isInsufficientAmount || (method === 'efectivo' && !amountPaid)}
            size="lg" 
            className={cn(
              "flex-[2] text-black font-black text-3xl h-24 rounded-[2rem] flex flex-col items-center justify-center transition-all active:scale-95 group border-4 border-black",
              isInsufficientAmount 
                ? "bg-muted cursor-not-allowed opacity-50" 
                : "bg-primary hover:bg-black hover:text-primary shadow-[0_15px_40px_rgba(255,214,0,0.3)]"
            )}
          >
            {isProcessing ? (
              <Loader2 className="w-10 h-10 animate-spin" />
            ) : (
              <>
                <span className="text-[10px] uppercase tracking-[0.4em] opacity-40">Finalizar Operación</span>
                <span className="italic tracking-tighter">COBRAR Y REGISTRAR</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
