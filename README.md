'use client'

import { useState } from 'react'
import { db } from '@/firebase' // Asegúrate de que esta ruta apunte a tu config de Firebase
import { 
  collection, 
  doc, 
  runTransaction, 
  serverTimestamp 
} from 'firebase/firestore'

// ... (Resto de tus interfaces de Producto e Item del Carrito)

export default function POSPage() {
  const [cart, setCart] = useState<any[]>([]) // Tu estado actual del carrito
  const [loading, setLoading] = useState(false)
  const [metodoPago, setMetodoPago] = useState('efectivo')

  // Cálculos de la venta
  const total = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
  const subtotal = total / 1.16
  const iva = total - subtotal

  const handleCobrar = async () => {
    if (cart.length === 0) return alert("El carrito está vacío")
    
    setLoading(true)

    try {
      await runTransaction(db, async (transaction) => {
        // 1. Validar y preparar descuentos de stock
        const itemsParaVenta = []
        
        for (const item of cart) {
          const productoRef = doc(db, 'productos', item.id)
          const productoSnap = await transaction.get(productoRef)

          if (!productoSnap.exists()) {
            throw new Error(`El producto ${item.nombre} no existe`)
          }

          const nuevoStock = productoSnap.data().stock - item.cantidad
          
          if (nuevoStock < 0) {
            throw new Error(`Stock insuficiente para: ${item.nombre}`)
          }

          // Agregamos la actualización de stock a la transacción
          transaction.update(productoRef, { stock: nuevoStock })

          // Estructura para el array de items en la venta
          itemsParaVenta.push({
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad
          })
        }

        // 2. Crear el documento de la venta
        const ventaRef = doc(collection(db, 'ventas'))
        transaction.set(ventaRef, {
          total,
          subtotal: Number(subtotal.toFixed(2)),
          iva: Number(iva.toFixed(2)),
          metodoPago,
          fecha: serverTimestamp(),
          items: itemsParaVenta,
          tipo: 'venta_directa'
        })
      })

      // 3. Éxito: Limpiar estado
      setCart([])
      alert("¡Venta procesada con éxito!")

    } catch (error: any) {
      console.error("Error en cobro:", error)
      alert(`Error al procesar: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-black text-white min-h-screen">
      {/* ... Tu UI del Carrito ... */}

      <div className="mt-6 border-t border-zinc-800 pt-4">
        <div className="flex justify-between text-xl font-bold mb-4">
          <span>TOTAL:</span>
          <span className="text-[#FFD600]">${total.toLocaleString()}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {['efectivo', 'tarjeta', 'transferencia'].map((metodo) => (
            <button
              key={metodo}
              onClick={() => setMetodoPago(metodo)}
              className={`p-2 rounded text-xs font-bold uppercase transition-colors ${
                metodoPago === metodo 
                ? 'bg-[#FFD600] text-black' 
                : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
              }`}
            >
              {metodo}
            </button>
          ))}
        </div>

        {/* BOTÓN COBRAR SOLICITADO */}
        <button
          onClick={handleCobrar}
          disabled={loading || cart.length === 0}
          className={`w-full py-4 rounded-xl font-black text-xl uppercase tracking-tighter transition-all ${
            loading 
            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
            : 'bg-[#FFD600] text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(255,214,0,0.2)]'
          }`}
        >
          {loading ? 'Procesando...' : 'Confirmar Cobro'}
        </button>
      </div>
    </div>
  )
}

# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
