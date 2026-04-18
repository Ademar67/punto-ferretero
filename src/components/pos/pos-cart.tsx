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
  return (
    <div className="flex flex-col h-full bg-white font-mono">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 gap-6">
            <div className="w-32 h-32 rounded-full border-4 border-dashed border-muted flex items-center justify-center opacity-20">
              <ShoppingCart className="w-16 h-16" />
            </div>
            <div className="text-center">
              <p className="font-black uppercase tracking-[0.2em] text-2xl italic">Sin Artículos</p>
              <p className="text-xs font-bold mt-2 uppercase">Escanea un producto para comenzar</p>
            </div>
          </div>
        ) : (
          items.map((item) => (
            <div key={`cart-item-${item.productId}`} className="flex flex-col gap-3 p-5 bg-muted/20 rounded-2xl border-2 border-transparent hover:border-black/5 transition-all group relative">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-black truncate uppercase text-sm tracking-tight leading-none mb-1">{item.name}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-muted-foreground uppercase bg-white px-2 py-0.5 rounded border border-muted shadow-sm tracking-tighter">
                      $ {item.price.toFixed(2)} UNIT.
                    </span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-dashed border-muted/50">
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-muted/50">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg hover:bg-black hover:text-white transition-colors"
                    onClick={() => updateQuantity(item.productId, -1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-black text-lg tabular-nums">{item.quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg hover:bg-black hover:text-white transition-colors"
                    onClick={() => updateQuantity(item.productId, 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-black text-muted-foreground uppercase block mb-1">Subtotal</span>
                  <p className="font-black text-black text-xl tracking-tighter leading-none">$ {item.subtotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PANEL DE TOTALES: ESTILO RECIBO INDUSTRIAL */}
      <div className="p-8 bg-black text-white space-y-6 rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.3)]">
        <div className="space-y-3 px-4">
          <div className="flex justify-between items-center text-white/40 border-b border-dashed border-white/10 pb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Subtotal Bruto</span>
            <span className="text-lg font-black tracking-tighter">$ {(total / 1.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center text-white/40">
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">IVA (16.0%)</span>
            <span className="text-lg font-black tracking-tighter">$ {(total - (total / 1.16)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        
        <div className="h-px bg-primary/20 w-full relative">
          <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-white/20 -translate-y-1/2" />
        </div>

        <div className="flex justify-between items-end px-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">Total Neto</span>
              <Info className="w-3 h-3 text-white/20" />
            </div>
            <p className="text-6xl font-black text-primary tracking-tighter leading-none italic">$ {total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block">Moneda</span>
             <span className="text-xs font-black text-white/60">MXN</span>
          </div>
        </div>
        
        <div className="px-4 text-[9px] font-black text-white/30 uppercase text-center tracking-[0.5em] pt-2 border-t border-white/5 italic">
          Punto Ferretero v1.0 • POS TERMINAL
        </div>
      </div>
    </div>
  )
}
