'use client'

import React from 'react'
import Link from 'next/link'
import { 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle, 
  Plus, 
  ArrowUpRight,
  PackageSearch 
} from 'lucide-react'

// NOTA: Asumo que ya recibes o calculas estos datos de Firebase
// Estos son datos de ejemplo para que veas el diseño aplicado:
const stats = {
  ventasHoy: 12540.50,
  ticketsHoy: 24,
  productosBajoStock: 8,
  topProductos: [
    { nombre: 'Cemento Gris 50kg', ventas: 45, tag: 'Alta rotación' },
    { nombre: 'Varilla 3/8"', ventas: 32, tag: 'Alta rotación' },
    { nombre: 'Clavo estándar 2"', ventas: 28, tag: 'Alta rotación' },
  ]
}

// Lógica para el Ticket Promedio solicitada: MXN con exactamente 2 decimales
const ticketPromedio = stats.ticketsHoy > 0 ? stats.ventasHoy / stats.ticketsHoy : 0

export default function Dashboard() {
  return (
    <div className="p-6 space-y-8 bg-black min-h-screen text-white">
      
      {/* 3. BOTÓN NUEVA VENTA - MÁXIMA VISIBILIDAD */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Panel Operativo</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Punto Ferretero v2.0</p>
        </div>
        <Link href="/pos" className="group">
          <button className="bg-[#FFD600] text-black hover:bg-yellow-400 transition-all transform hover:scale-105 active:scale-95 px-8 py-4 rounded-xl font-black flex items-center gap-3 shadow-[0_0_20px_rgba(255,214,0,0.3)]">
            <Plus className="w-6 h-6 stroke-[3px]" />
            <span className="text-lg tracking-tighter">+ NUEVA VENTA</span>
          </button>
        </Link>
      </div>

      {/* TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. TICKET PROMEDIO - CORREGIDO */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-[#FFD600]" />
          </div>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Ticket Promedio</p>
          <h3 className="text-4xl font-black text-white italic">
            ${ticketPromedio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div className="mt-2 flex items-center gap-1 text-[#FFD600] text-[10px] font-bold">
            <ArrowUpRight className="w-3 h-3" />
            <span>Basado en {stats.ticketsHoy} ventas hoy</span>
          </div>
        </div>

        {/* 2. REABASTECER URGENTE (STOCK BAJO) */}
        <div className="bg-zinc-900 border-2 border-red-900/50 p-6 rounded-2xl relative group">
          <div className="flex items-center gap-2 mb-1">
            <span className="animate-pulse">🚨</span>
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">REABASTECER URGENTE</p>
          </div>
          <h3 className="text-4xl font-black text-white italic">
            {stats.productosBajoStock} <span className="text-sm font-medium not-italic text-zinc-400">productos</span>
          </h3>
          <p className="mt-2 text-zinc-400 text-[10px] font-bold uppercase italic">
            Stock crítico detectado en almacén
          </p>
          <Link href="/inventario" className="absolute bottom-4 right-4 text-zinc-600 hover:text-white transition-colors">
            <PackageSearch className="w-5 h-5" />
          </Link>
        </div>

        {/* VENTAS TOTALES (Referencia) */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Ingresos del Día</p>
          <h3 className="text-4xl font-black text-[#FFD600] italic">
            ${stats.ventasHoy.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="mt-2 text-zinc-500 text-[10px] font-medium uppercase tracking-tighter">
            Actualizado en tiempo real
          </p>
        </div>
      </div>

      {/* 4. PRODUCTOS MÁS VENDIDOS - TOP 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black uppercase italic flex items-center gap-2">
              <TrendingUp className="text-[#FFD600] w-5 h-5" />
              Más Vendidos
            </h2>
          </div>
          <div className="space-y-4">
            {stats.topProductos.map((prod, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-black border border-zinc-800 rounded-xl hover:border-[#FFD600]/30 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-zinc-800">0{idx + 1}</span>
                  <div>
                    <p className="font-bold text-white uppercase text-sm tracking-tight">{prod.nombre}</p>
                    <span className="text-[10px] bg-[#FFD600]/10 text-[#FFD600] px-2 py-0.5 rounded-full font-black uppercase">
                      {prod.tag}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-white">{prod.ventas} unids</p>
                  <p className="text-[9px] text-zinc-500 uppercase font-bold">Vendido hoy</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ESPACIO PARA GRÁFICA O ACTIVIDAD RECIENTE */}
        <div className="bg-[#FFD600]/5 border border-[#FFD600]/10 p-8 rounded-3xl flex flex-col items-center justify-center text-center">
           <ShoppingCart className="w-12 h-12 text-[#FFD600]/20 mb-4" />
           <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest italic">
             Listo para capturar ventas
           </p>
        </div>
      </div>
    </div>
  )
}
