"use client"

import { Sale } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Hammer } from "lucide-react"

interface TicketViewProps {
  sale: Sale
}

type ReturnedItemsByProductId = Record<string, number>

export function TicketView({ sale }: TicketViewProps) {
  const saleDate = sale.date?.seconds
    ? new Date(sale.date.seconds * 1000)
    : new Date()

  const returnedItemsByProductId =
    ((sale as any).returnedItemsByProductId || {}) as ReturnedItemsByProductId

  const getReturnedQty = (productId: string) => {
    return Number(returnedItemsByProductId[productId] || 0)
  }

  const getActiveQty = (productId: string, soldQty: number) => {
    return Math.max(0, Number(soldQty || 0) - getReturnedQty(productId))
  }

  const totalSoldQty = sale.items.reduce(
    (acc, item) => acc + Number(item.quantity || 0),
    0
  )

  const totalReturnedQty = sale.items.reduce(
    (acc, item) => acc + getReturnedQty(item.productId),
    0
  )

  const isCancelled = sale.status === "cancelada"
  const isPartial = sale.status === "parcialmente_cancelada"

  return (
    <div className="w-full bg-white text-black font-mono text-[10px] leading-tight p-4 border border-dashed border-gray-300 shadow-inner">
      <div className="flex flex-col items-center gap-1 text-center mb-6">
        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-1">
          <Hammer className="w-6 h-6 text-yellow-400" />
        </div>
        <h2 className="text-sm font-black uppercase italic tracking-tighter">
          Punto Ferretero
        </h2>
        <p className="text-[8px] font-bold uppercase">Sucursal Principal</p>
        <p className="text-[7px] text-gray-500">RFC: PFE-900101-ABC</p>
      </div>

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
          <span className="uppercase">
            {sale.userEmail?.split("@")[0] || "cajero"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-bold">ESTADO:</span>
          <span
            className={
              isCancelled
                ? "text-red-600 font-black uppercase"
                : isPartial
                  ? "text-orange-600 font-black uppercase"
                  : "font-black uppercase"
            }
          >
            {isCancelled
              ? "cancelada"
              : isPartial
                ? "parcial"
                : sale.status}
          </span>
        </div>

        {(isPartial || isCancelled) && (
          <div className="mt-2 rounded border border-dashed border-gray-300 p-2 bg-gray-50">
            <div className="flex justify-between font-black uppercase">
              <span>Vendido:</span>
              <span>{totalSoldQty} pzas</span>
            </div>
            <div className="flex justify-between font-black uppercase text-red-600">
              <span>Devuelto:</span>
              <span>{totalReturnedQty} pzas</span>
            </div>
            <div className="flex justify-between font-black uppercase text-green-700">
              <span>Activo:</span>
              <span>{Math.max(0, totalSoldQty - totalReturnedQty)} pzas</span>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex justify-between font-black uppercase border-b border-gray-200 pb-1 mb-2">
          <span className="w-1/2">Descripción</span>
          <span className="w-1/4 text-center">Cant</span>
          <span className="w-1/4 text-right">Total</span>
        </div>

        <div className="space-y-3">
          {sale.items.map((item, idx) => {
            const soldQty = Number(item.quantity || 0)
            const returnedQty = getReturnedQty(item.productId)
            const activeQty = getActiveQty(item.productId, soldQty)
            const hasReturn = returnedQty > 0

            return (
              <div
                key={`ticket-item-${idx}`}
                className={hasReturn ? "border-b border-dashed border-gray-200 pb-2" : ""}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={
                      isCancelled
                        ? "w-1/2 uppercase leading-none line-through text-gray-400"
                        : "w-1/2 uppercase leading-none"
                    }
                  >
                    {item.name}
                  </span>
                  <span className="w-1/4 text-center">{soldQty}</span>
                  <span className="w-1/4 text-right">
                    ${Number(item.subtotal || 0).toFixed(2)}
                  </span>
                </div>

                {hasReturn && (
                  <div className="mt-1 text-[8px] uppercase font-black space-y-0.5">
                    <div className="flex justify-between text-red-600">
                      <span>Devuelto:</span>
                      <span>{returnedQty} pzas</span>
                    </div>
                    <div className="flex justify-between text-green-700">
                      <span>Activo:</span>
                      <span>{activeQty} pzas</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="border-t border-dashed border-gray-300 pt-4 space-y-2">
        <div className="flex justify-between text-gray-600">
          <span className="font-bold">SUBTOTAL (SIN IVA):</span>
          <span>${(sale.total / 1.16).toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span className="font-bold">IVA (16%):</span>
          <span>${(sale.total - sale.total / 1.16).toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-lg font-black italic border-t-2 border-black pt-2">
          <span>TOTAL ORIGINAL:</span>
          <span className="tracking-tighter">${sale.total.toFixed(2)}</span>
        </div>

        {(isPartial || isCancelled) && (
          <p className="text-[8px] font-black uppercase text-center text-red-600 border border-dashed border-red-300 p-2">
            Este ticket tiene devolución registrada. Revisar piezas activas.
          </p>
        )}
      </div>

      <div className="mt-6 space-y-1 border-t border-gray-100 pt-3">
        <div className="flex justify-between text-[8px] uppercase font-bold">
          <span>Método de Pago:</span>
          <span>{sale.paymentMethod}</span>
        </div>

        <div className="flex justify-between text-[8px] uppercase font-bold">
          <span>Recibido:</span>
          <span>${Number(sale.amountPaid || 0).toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-[8px] uppercase font-bold">
          <span>Cambio:</span>
          <span>${Number(sale.change || 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-10 text-center space-y-2">
        <p className="text-[9px] font-black italic uppercase">
          {isCancelled ? "Ticket cancelado" : "¡Gracias por su compra!"}
        </p>
        <p className="text-[7px] text-gray-400">
          Punto Ferretero Software V1.0
        </p>
        <div className="mt-4 opacity-10">
          <div className="h-6 w-full bg-black"></div>
        </div>
      </div>
    </div>
  )
}