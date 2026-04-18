"use client"

import { Trash2, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 opacity-50">
            <ShoppingCart className="w-16 h-16" />
            <p className="font-medium">El carrito está vacío</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 bg-card p-3 rounded-lg shadow-sm border border-border">
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{item.name}</p>
                <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} c/u</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => updateQuantity(item.productId, -1)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => updateQuantity(item.productId, 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="w-24 text-right">
                <p className="font-bold text-primary">${item.subtotal.toFixed(2)}</p>
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive hover:bg-destructive/10"
                onClick={() => removeItem(item.productId)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-primary text-white space-y-4 rounded-t-3xl shadow-2xl mt-auto">
        <div className="flex justify-between items-center">
          <span className="text-lg opacity-80">Subtotal</span>
          <span className="text-xl font-medium">${(total * 0.84).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg opacity-80">IVA (16%)</span>
          <span className="text-xl font-medium">${(total * 0.16).toFixed(2)}</span>
        </div>
        <div className="h-px bg-white/20 my-2" />
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">TOTAL</span>
          <span className="text-4xl font-extrabold">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

import { ShoppingCart } from "lucide-react"
