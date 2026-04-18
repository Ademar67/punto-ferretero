"use client"

import { useState, useEffect, useRef } from "react"
import { Search, ShoppingCart, Plus, Minus, Trash2, Package, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { POSCart } from "@/components/pos/pos-cart"
import { PaymentModal } from "@/components/pos/payment-modal"
import { Product, SaleItem, PaymentMethod } from "@/types"
import { useToast } from "@/hooks/use-toast"

// Mock products (Simulando base de datos)
const MOCK_PRODUCTS: Product[] = [
  { id: "1", ownerId: "1", name: "Martillo 16oz Pro", code: "M-001", categoryId: "1", brand: "Truper", salePrice: 150.00, costPrice: 90.00, stock: 15, minStock: 5, unit: "pza", active: true, createdAt: new Date() },
  { id: "2", ownerId: "1", name: "Cinta Canela 48mm x 50m", code: "C-002", categoryId: "2", brand: "Tuk", salePrice: 35.50, costPrice: 18.00, stock: 42, minStock: 10, unit: "pza", active: true, createdAt: new Date() },
  { id: "3", ownerId: "1", name: "Pintura Vinílica Blanca 19L", code: "P-003", categoryId: "3", brand: "Comex", salePrice: 1250.00, costPrice: 850.00, stock: 8, minStock: 2, unit: "cubeta", active: true, createdAt: new Date() },
  { id: "4", ownerId: "1", name: "Tubo PVC 1/2' 6m", code: "T-004", categoryId: "4", brand: "Generic", salePrice: 85.00, costPrice: 45.00, stock: 20, minStock: 5, unit: "tramo", active: true, createdAt: new Date() },
  { id: "5", ownerId: "1", name: "Llave Inglesa 8'", code: "L-005", categoryId: "1", brand: "Stanley", salePrice: 210.00, costPrice: 130.00, stock: 12, minStock: 3, unit: "pza", active: true, createdAt: new Date() },
]

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<SaleItem[]>([])
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const { toast } = useToast()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filtrado de productos en tiempo real
  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id)
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        )
      }
      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        price: product.salePrice, 
        quantity: 1, 
        subtotal: product.salePrice,
        discount: 0 
      }]
    })
    // Reset buscador tras agregar
    setSearchTerm("")
    searchInputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm && filteredProducts.length > 0) {
      addToCart(filteredProducts[0])
    }
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty, subtotal: newQty * item.price }
      }
      return item
    }))
  }

  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId))
  }

  const total = cart.reduce((acc, item) => acc + item.subtotal, 0)

  const handleFinishSale = (method: PaymentMethod, amountPaid: number) => {
    setIsPaymentOpen(false)
    setCart([])
    setSearchTerm("")
    toast({
      title: "VENTA REALIZADA CON ÉXITO",
      description: `Folio generado. Total: $${total.toFixed(2)} (${method.toUpperCase()})`,
      className: "bg-green-600 text-white font-black",
    })
    searchInputRef.current?.focus()
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-theme(spacing.4))] overflow-hidden bg-[#F5F5F5]">
      {/* Sección de Selección de Productos */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-border mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
            <Input 
              ref={searchInputRef}
              placeholder="Escribe nombre o código y presiona ENTER..." 
              className="pl-14 h-16 text-xl border-none bg-muted/30 focus-visible:ring-primary rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                className="flex flex-col items-start p-4 gap-3 bg-white border-2 border-transparent hover:border-primary hover:shadow-xl transition-all rounded-2xl text-left active:scale-95 group"
                onClick={() => addToCart(product)}
              >
                <div className="w-full flex justify-between items-center">
                  <span className="text-[10px] font-black text-white bg-black px-2 py-0.5 rounded-md uppercase tracking-widest">{product.code}</span>
                  <span className="text-xs text-primary font-black uppercase">{product.stock} DISP.</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-sm text-black uppercase leading-tight line-clamp-2">{product.name}</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">{product.brand}</p>
                </div>
                <div className="w-full pt-2 border-t border-muted">
                  <span className="text-2xl font-black text-black tracking-tighter">${product.salePrice.toFixed(2)}</span>
                </div>
              </button>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 py-20">
              <Package className="w-24 h-24 mb-4" />
              <p className="text-2xl font-black uppercase italic">Sin resultados</p>
            </div>
          )}
        </div>
      </div>

      {/* Sección de Carrito / Terminal */}
      <div className="w-full lg:w-[480px] bg-white border-l border-border flex flex-col shadow-2xl relative">
        <div className="p-6 border-b border-border flex justify-between items-center bg-black">
          <h2 className="text-xl font-black text-white italic uppercase flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Terminal de Venta
          </h2>
          <div className="bg-primary text-black px-4 py-1 rounded-full font-black text-xs uppercase">
            {cart.reduce((a, b) => a + b.quantity, 0)} Items
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <POSCart 
            items={cart} 
            updateQuantity={updateQuantity} 
            removeItem={removeItem} 
            total={total} 
          />
        </div>

        <div className="p-6 bg-white border-t border-border">
          <Button 
            className="w-full h-20 text-2xl font-black bg-primary hover:bg-primary/90 text-black shadow-xl shadow-primary/20 rounded-2xl transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
          >
            PAGAR AHORA (${total.toFixed(2)})
          </Button>
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={total}
        onConfirm={handleFinishSale}
      />
    </div>
  )
}
