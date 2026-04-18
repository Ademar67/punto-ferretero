
"use client"

import { Sale } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Hammer } from "lucide-react"

interface TicketViewProps {
  sale: Sale
}

export function TicketView({ sale }: TicketViewProps) {
  const saleDate = sale.date?.seconds ? new Date(sale.date.seconds * 1000) : new Date()

  return (
    <div className="w-full bg-white text-black font-mono text-[10px] leading-tight p-4 border border-dashed border-gray-300 shadow-inner">
      {/* HEADER */}
      <div className="flex flex-col items-center gap-1 text-center mb-6">
        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-1">
          <Hammer className="w-6 h-6 text-yellow-400" />
        </div>
        <h2 className="text-sm font-black uppercase italic tracking-tighter">Punto Ferretero</h2>
        <p className="text-[8px] font-bold uppercase">Sucursal Principal</p>
        <p className="text-[7px] text-gray-500">RFC: PFE-900101-ABC</p>
      </div>

      {/* INFO VENTA */}
      <div className="border-y border-dashed border-gray-300 py-3 mb-4 space-y-1">
        <div className="flex justify-between">
          <span className="font-bold">FOLIO:</span>
          <span className="font-black italic">{sale.folio}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">FECHA:</span>
          <span>{format(saleDate, "dd/MM/yyyy HH:mm", { locale: es })}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">CAJERO:</span>
          <span className="uppercase">{sale.userEmail.split('@')[0]}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">ESTADO:</span>
          <span className={sale.status === 'cancelada' ? "text-red-600 font-black uppercase" : "font-black uppercase"}>
            {sale.status}
          </span>
        </div>
      </div>

      {/* ITEMS */}
      <div className="mb-6">
        <div className="flex justify-between font-black uppercase border-b border-gray-200 pb-1 mb-2">
          <span className="w-1/2">Descripción</span>
          <span className="w-1/4 text-center">Cant</span>
          <span className="w-1/4 text-right">Total</span>
        </div>
        <div className="space-y-2">
          {sale.items.map((item, idx) => (
            <div key={`ticket-item-${idx}`} className="flex justify-between items-start">
              <span className="w-1/2 uppercase leading-none">{item.name}</span>
              <span className="w-1/4 text-center">{item.quantity}</span>
              <span className="w-1/4 text-right">${item.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TOTALES */}
      <div className="border-t border-dashed border-gray-300 pt-4 space-y-2">
        <div className="flex justify-between text-gray-600">
          <span className="font-bold">SUBTOTAL (SIN IVA):</span>
          <span>${(sale.total / 1.16).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="font-bold">IVA (16%):</span>
          <span>${(sale.total - (sale.total / 1.16)).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-black italic border-t-2 border-black pt-2">
          <span>TOTAL:</span>
          <span className="tracking-tighter">${sale.total.toFixed(2)}</span>
        </div>
      </div>

      {/* PAGO */}
      <div className="mt-6 space-y-1 border-t border-gray-100 pt-3">
        <div className="flex justify-between text-[8px] uppercase font-bold">
          <span>Metodo de Pago:</span>
          <span>{sale.paymentMethod}</span>
        </div>
        <div className="flex justify-between text-[8px] uppercase font-bold">
          <span>Recibido:</span>
          <span>${sale.amountPaid.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[8px] uppercase font-bold">
          <span>Cambio:</span>
          <span>${sale.change.toFixed(2)}</span>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-10 text-center space-y-2">
        <p className="text-[9px] font-black italic uppercase">¡Gracias por su compra!</p>
        <p className="text-[7px] text-gray-400">Punto Ferretero Software V1.0</p>
        <div className="mt-4 opacity-10">
          {/* Simulación de código de barras */}
          <div className="h-6 w-full bg-black"></div>
        </div>
      </div>
    </div>
  )
}
