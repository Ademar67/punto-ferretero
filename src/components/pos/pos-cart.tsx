"use client"

import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SaleItem } from "@/types"
import { cn } from "@/lib/utils"

interface POSCartProps {
  items: SaleItem[]
  updateQuantity: (productId: string, delta: number) => void
  removeItem: (productId: string) => void
  total: number
}

export function POSCart({ items, updateQuantity, removeItem, total }: POSCartProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 opacity-20">
            <div className="w-24 h-24 rounded-full border-4 border-dashed border-muted flex items-center justify-center">
              <ShoppingCart className="w-12 h-12" />
            </div>
            <p className="font-black uppercase tracking-widest text-xl italic">Carrito Vacío</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 bg-muted/10 p-4 rounded-2xl border-2 border-transparent hover:border-primary/20 transition-all group">
              <div className="flex-1 min-w-0">
                <p className="font-black text-black truncate uppercase text-xs tracking-tight">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">${item.price.toFixed(2)} c/u</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-border">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg hover:bg-primary hover:text-black"
                  onClick={() => updateQuantity(item.productId, -1)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg hover:bg-primary hover:text-black"
                  onClick={() => updateQuantity(item.productId, 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="w-28 text-right">
                <p className="font-black text-black text-lg tracking-tighter">${item.subtotal.toFixed(2)}</p>
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeItem(item.productId)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Panel de Totales Estilo Recibo */}
      <div className="p-6 bg-black text-white space-y-4 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)]">
        <div className="space-y-2 px-2">
          <div className="flex justify-between items-center opacity-60">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Subtotal</span>
            <span className="text-base font-bold tracking-tighter">${(total * 0.84).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center opacity-60">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">IVA (16%)</span>
            <span className="text-base font-bold tracking-tighter">${(total * 0.16).toFixed(2)}</span>
          </div>
        </div>
        <div className="h-px bg-white/10 my-4 border-dashed border-t" />
        <div className="flex justify-between items-end px-2">
          <div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Total Neto</span>
            <p className="text-5xl font-black text-white tracking-tighter leading-none mt-1">${total.toFixed(2)}</p>
          </div>
          <div className="text-right">
             <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">MXN Pesos</span>
          </div>
        </div>
      </div>
    </div>
  )
}
