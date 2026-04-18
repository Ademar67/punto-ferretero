"use client"

import { Trash2, Minus, Plus, ShoppingCart, Info } from "lucide-react"
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
  // Cálculo de impuestos basado en el total (IVA 16% incluido)
  const subtotalBeforeTax = total / 1.16
  const iva = total - subtotalBeforeTax

  return (
    <div className="flex flex-col h-full bg-white font-body">
      {/* CABECERA DEL CARRITO */}
      <div className="px-6 py-4 bg-muted/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-primary" />
          <span className="font-black text-xs uppercase tracking-widest">Artículos en Carrito</span>
        </div>
        <Badge variant="secondary" className="bg-black text-white font-black text-[10px]">
          {items.reduce((acc, item) => acc + item.quantity, 0)} UNIDADES
        </Badge>
      </div>

      {/* LISTA DE PRODUCTOS - FORMATO MOSTRADOR */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 p-10 text-center">
            <ShoppingCart className="w-16 h-16 mb-4 opacity-10" />
            <p className="font-black uppercase italic tracking-tighter text-xl">Carrito Vacío</p>
            <p className="text-[10px] font-bold mt-1 uppercase">Esperando entrada de productos...</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div key={`cart-item-${item.productId}`} className="p-4 hover:bg-primary/5 transition-colors group">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-black uppercase text-sm leading-tight mb-1 truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                      P. Unit: ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-md hover:bg-black hover:text-white"
                      onClick={() => updateQuantity(item.productId, -1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-10 text-center font-black text-sm tabular-nums">{item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-md hover:bg-black hover:text-white"
                      onClick={() => updateQuantity(item.productId, 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-black text-muted-foreground uppercase block leading-none mb-1">Subtotal</span>
                    <p className="font-black text-black text-lg tracking-tighter leading-none font-mono">
                      ${item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PANEL DE TOTALES SIEMPRE VISIBLES - ESTILO INDUSTRIAL */}
      <div className="p-6 bg-black text-white space-y-4 rounded-t-[2.5rem] shadow-2xl">
        <div className="space-y-2 px-2">
          <div className="flex justify-between items-center text-white/40 border-b border-white/5 pb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Subtotal</span>
            <span className="text-base font-bold font-mono">${subtotalBeforeTax.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center text-white/40">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">IVA (16%)</span>
            <span className="text-base font-bold font-mono">${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-end bg-primary/10 p-4 rounded-2xl border border-primary/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Total a Pagar</span>
            </div>
            <p className="text-5xl font-black text-primary tracking-tighter leading-none italic font-mono">
              ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-black text-white/20 uppercase block mb-1">MXN</span>
             <Badge className="bg-primary text-black font-black text-[9px]">CAJA 01</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Badge } from "@/components/ui/badge"
