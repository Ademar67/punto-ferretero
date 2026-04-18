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
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 opacity-40">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <p className="font-black uppercase tracking-tighter text-xl">Carrito Vacío</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-border group hover:border-primary transition-all">
              <div className="flex-1 min-w-0">
                <p className="font-black text-black truncate uppercase text-sm">{item.name}</p>
                <p className="text-xs font-bold text-muted-foreground">${item.price.toFixed(2)} c/u</p>
              </div>
              
              <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-md hover:bg-white"
                  onClick={() => updateQuantity(item.productId, -1)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-md hover:bg-white"
                  onClick={() => updateQuantity(item.productId, 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="w-24 text-right">
                <p className="font-black text-black">${item.subtotal.toFixed(2)}</p>
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg"
                onClick={() => removeItem(item.productId)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="p-8 bg-black text-white space-y-4 rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.1)]">
        <div className="space-y-2">
          <div className="flex justify-between items-center opacity-70">
            <span className="text-sm font-bold uppercase tracking-wider">Subtotal</span>
            <span className="text-lg font-medium">${(total * 0.84).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center opacity-70">
            <span className="text-sm font-bold uppercase tracking-wider">IVA (16%)</span>
            <span className="text-lg font-medium">${(total * 0.16).toFixed(2)}</span>
          </div>
        </div>
        <div className="h-px bg-white/10 my-4" />
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Total a Pagar</span>
            <p className="text-5xl font-black text-white tracking-tighter">${total.toFixed(2)}</p>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic">Punto Ferretero TPV</span>
          </div>
        </div>
      </div>
    </div>
  )
}
