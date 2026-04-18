
"use client"

import { Quotation } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Hammer, FileText, User, Phone } from "lucide-react"

interface QuotationViewProps {
  quotation: Quotation
}

export function QuotationView({ quotation }: QuotationViewProps) {
  const quoteDate = quotation.date?.seconds ? new Date(quotation.date.seconds * 1000) : new Date()

  return (
    <div className="w-full bg-white text-black font-body p-8 border-2 border-muted rounded-2xl shadow-sm">
      {/* HEADER PREMIUM */}
      <div className="flex justify-between items-start mb-10 pb-6 border-b-2 border-black">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center rotate-3">
            <Hammer className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Punto <span className="text-teal-600">Ferretero</span></h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Cotizaciones y Presupuestos</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase text-muted-foreground block">Número de Folio</span>
          <p className="text-2xl font-black italic text-teal-600">{quotation.folio}</p>
        </div>
      </div>

      {/* INFO CLIENTE Y VENTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-xl space-y-2">
            <span className="text-[9px] font-black uppercase text-muted-foreground flex items-center gap-2">
              <User className="w-3 h-3" /> Datos del Cliente
            </span>
            <p className="text-lg font-black uppercase italic">{quotation.customerName || "Venta de Mostrador"}</p>
            {quotation.customerPhone && (
              <p className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3 h-3" /> {quotation.customerPhone}
              </p>
            )}
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="flex justify-end items-center gap-2 text-xs font-bold">
            <span className="text-muted-foreground uppercase">Fecha Emisión:</span>
            <span>{format(quoteDate, "PPPP", { locale: es })}</span>
          </div>
          <div className="flex justify-end items-center gap-2 text-xs font-bold">
            <span className="text-muted-foreground uppercase">Elaborado por:</span>
            <span className="uppercase">{quotation.userEmail.split('@')[0]}</span>
          </div>
          <div className="flex justify-end items-center gap-2 text-xs font-bold">
            <span className="text-muted-foreground uppercase">Vigencia:</span>
            <span>15 días naturales</span>
          </div>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="mb-10">
        <div className="grid grid-cols-12 bg-black text-white p-3 rounded-t-xl font-black uppercase text-[10px] tracking-widest">
          <div className="col-span-6">Descripción del Producto</div>
          <div className="col-span-2 text-center">Cant.</div>
          <div className="col-span-2 text-right">Unitario</div>
          <div className="col-span-2 text-right">Subtotal</div>
        </div>
        <div className="border-x-2 border-b-2 border-muted rounded-b-xl overflow-hidden">
          {quotation.items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 p-4 border-b border-muted hover:bg-muted/10 transition-colors">
              <div className="col-span-6">
                <p className="font-black text-xs uppercase italic">{item.name}</p>
                <p className="text-[8px] font-bold text-muted-foreground uppercase">ID: {item.productId.substring(0,8)}</p>
              </div>
              <div className="col-span-2 text-center font-black text-sm">{item.quantity}</div>
              <div className="col-span-2 text-right font-medium text-xs">${item.price.toFixed(2)}</div>
              <div className="col-span-2 text-right font-black text-sm">${item.subtotal.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TOTALES ESTILO TICKET PREMIUM */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="max-w-md space-y-2">
          <span className="text-[10px] font-black uppercase text-muted-foreground italic">Notas y Condiciones:</span>
          <p className="text-[9px] text-muted-foreground leading-relaxed font-medium">
            * Precios sujetos a cambio sin previo aviso. * Esta cotización no garantiza la reserva de inventario hasta la confirmación del pago. * Los productos eléctricos no cuentan con devolución una vez instalados.
          </p>
        </div>
        <div className="w-full md:w-64 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground px-2">
            <span>SUBTOTAL</span>
            <span>${(quotation.total / 1.16).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground px-2">
            <span>IVA (16%)</span>
            <span>${(quotation.total - (quotation.total / 1.16)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center bg-teal-600 text-white p-4 rounded-2xl shadow-lg">
            <span className="font-black text-[10px] uppercase tracking-widest italic">Total Neto</span>
            <span className="text-3xl font-black italic tracking-tighter">${quotation.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-16 text-center border-t-2 border-dashed border-muted pt-8">
        <p className="text-[11px] font-black italic uppercase text-teal-600 mb-2">¡Esperamos poder servirle pronto!</p>
        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Punto Ferretero • Sistema de Gestión de Inventarios V1.0</p>
      </div>
    </div>
  )
}
