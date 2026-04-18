"use client"

import { useState, useEffect } from "react"
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
import { Banknote, CreditCard, Send, History } from "lucide-react"
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
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none">
        <DialogHeader className="bg-primary p-6 text-white">
          <DialogTitle className="text-2xl font-bold">Finalizar Venta</DialogTitle>
          <div className="text-4xl font-extrabold mt-2">${total.toFixed(2)}</div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <Label className="text-lg font-bold">Método de Pago</Label>
            <RadioGroup 
              value={method} 
              onValueChange={(val) => setMethod(val as PaymentMethod)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="relative">
                <RadioGroupItem value="efectivo" id="efectivo" className="peer sr-only" />
                <Label
                  htmlFor="efectivo"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Banknote className="mb-3 h-6 w-6" />
                  Efectivo
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem value="tarjeta" id="tarjeta" className="peer sr-only" />
                <Label
                  htmlFor="tarjeta"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <CreditCard className="mb-3 h-6 w-6" />
                  Tarjeta
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem value="transferencia" id="transferencia" className="peer sr-only" />
                <Label
                  htmlFor="transferencia"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Send className="mb-3 h-6 w-6" />
                  Transferencia
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem value="credito" id="credito" className="peer sr-only" />
                <Label
                  htmlFor="credito"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <History className="mb-3 h-6 w-6" />
                  Crédito
                </Label>
              </div>
            </RadioGroup>
          </div>

          {method === 'efectivo' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {quickAmounts.map((amt) => (
                  <Button 
                    key={amt} 
                    variant="outline" 
                    onClick={() => setAmountPaid(amt.toString())}
                    className="whitespace-nowrap"
                  >
                    ${amt}
                  </Button>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="amountPaid">Monto Recibido</Label>
                  <Input 
                    id="amountPaid"
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="text-2xl h-14 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cambio</Label>
                  <div className="text-3xl font-extrabold text-green-600 h-14 flex items-center">
                    ${change.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-muted/30">
          <Button variant="outline" onClick={onClose} size="lg">Cancelar</Button>
          <Button onClick={handleConfirm} size="lg" className="bg-accent text-accent-foreground font-bold text-lg min-w-[200px]">
            Confirmar Pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
