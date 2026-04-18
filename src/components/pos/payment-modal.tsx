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
import { Banknote, CreditCard, Send, History, Check } from "lucide-react"
import { PaymentMethod } from "@/types"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  total: number
  onConfirm: (method: PaymentMethod, amount: number) => void
}

export function PaymentModal({ isOpen, onClose, total, onConfirm }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('efectivo')
  const [amountPaid, setAmountPaid] = useState<string>(total.toString())
  const [change, setChange] = useState<number>(0)
  const amountInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setAmountPaid(total.toString())
      setMethod('efectivo')
      // Pequeño delay para asegurar que el input exista
      setTimeout(() => amountInputRef.current?.focus(), 100)
    }
  }, [isOpen, total])

  useEffect(() => {
    const paid = parseFloat(amountPaid) || 0
    setChange(Math.max(0, paid - total))
  }, [amountPaid, total])

  const handleConfirm = () => {
    onConfirm(method, parseFloat(amountPaid) || total)
  }

  const quickAmounts = [
    total,
    Math.ceil(total / 50) * 50,
    Math.ceil(total / 100) * 100,
    Math.ceil(total / 200) * 200,
    Math.ceil(total / 500) * 500,
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none rounded-3xl">
        <DialogHeader className="bg-black p-8 text-white relative">
          <div className="flex flex-col">
            <span className="text-primary font-black uppercase tracking-widest text-[10px] mb-1 italic">Resumen de Pago</span>
            <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">Confirmar Venta</DialogTitle>
          </div>
          <div className="mt-6 flex flex-col">
            <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Total a Cobrar</span>
            <div className="text-6xl font-black text-primary tracking-tighter">${total.toFixed(2)}</div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-8 bg-white">
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-black/50">Selecciona el Método de Pago</Label>
            <RadioGroup 
              value={method} 
              onValueChange={(val) => setMethod(val as PaymentMethod)}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {[
                { id: 'efectivo', icon: Banknote, label: 'Efectivo' },
                { id: 'tarjeta', icon: CreditCard, label: 'Tarjeta' },
                { id: 'transferencia', icon: Send, label: 'Transf.' },
                { id: 'credito', icon: History, label: 'Crédito' }
              ].map((m) => (
                <div key={m.id} className="relative">
                  <RadioGroupItem value={m.id} id={m.id} className="peer sr-only" />
                  <Label
                    htmlFor={m.id}
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-muted bg-white p-4 h-24 hover:bg-primary/5 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all group"
                  >
                    <m.icon className="mb-2 h-6 w-6 text-muted-foreground group-hover:text-primary peer-data-[state=checked]:text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-black">{m.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {method === 'efectivo' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {quickAmounts.map((amt) => (
                  <Button 
                    key={amt} 
                    variant="outline" 
                    onClick={() => setAmountPaid(amt.toString())}
                    className="whitespace-nowrap rounded-full border-2 border-black font-black text-xs h-10 px-4 hover:bg-black hover:text-white"
                  >
                    ${amt}
                  </Button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/20 p-6 rounded-3xl border border-muted">
                <div className="space-y-3">
                  <Label htmlFor="amountPaid" className="font-black text-[10px] uppercase tracking-widest">Monto Recibido ($)</Label>
                  <div className="relative">
                    <Input 
                      id="amountPaid"
                      ref={amountInputRef}
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="text-4xl h-16 font-black tracking-tighter rounded-xl border-2 border-black focus-visible:ring-primary pl-4"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-green-600">Cambio a entregar</Label>
                  <div className="text-5xl font-black text-green-600 h-16 flex items-center tracking-tighter">
                    ${change.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-8 bg-muted/10 border-t border-border flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" onClick={onClose} size="lg" className="flex-1 font-black uppercase tracking-widest text-xs h-16 rounded-2xl">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} size="lg" className="flex-1 bg-primary hover:bg-primary/90 text-black font-black text-xl h-16 rounded-2xl shadow-xl shadow-primary/20">
            CONFIRMAR VENTA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
