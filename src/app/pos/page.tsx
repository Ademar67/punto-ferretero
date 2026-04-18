"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingCart, Plus, Minus, Trash2, Package, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { POSCart } from "@/components/pos/pos-cart"
import { PaymentModal } from "@/components/pos/payment-modal"
import { Product, SaleItem, PaymentMethod } from "@/types"
import { useToast } from "@/hooks/use-toast"

// Mock products
const MOCK_PRODUCTS: Product[] = [
  { id: "1", ownerId: "1", name: "Martillo 16oz", code: "M-001", categoryId: "1", brand: "Truper", salePrice: 150.00, costPrice: 90.00, stock: 15, minStock: 5, unit: "pza", active: true, createdAt: new Date() },
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
    toast({ title: "Agregado", description: `${product.name} al carrito` })
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
    // Logic for saving sale would go here
    setIsPaymentOpen(false)
    setCart([])
    toast({
      title: "Venta Exitosa",
      description: `Venta por $${total.toFixed(2)} confirmada.`,
      variant: "default",
    })
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-theme(spacing.4))] overflow-hidden">
      {/* Search and Products Section */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder="Buscar producto por nombre o código..." 
              className="pl-10 h-14 text-lg border-2 focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <Button variant="outline" className="h-14 px-6 border-2">
            Escanear Código
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Button
                key={product.id}
                variant="outline"
                className="h-auto flex flex-col items-start p-4 gap-2 border-2 hover:border-primary hover:bg-primary/5 transition-all text-left"
                onClick={() => addToCart(product)}
              >
                <div className="w-full flex justify-between items-start">
                  <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase">{product.code}</span>
                  <span className="text-xs text-primary font-medium">{product.stock} disp.</span>
                </div>
                <span className="font-bold text-base line-clamp-2">{product.name}</span>
                <span className="text-2xl font-black mt-2 text-primary">${product.salePrice.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">{product.brand}</span>
              </Button>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
              <Package className="w-16 h-16 opacity-20" />
              <p className="text-xl font-medium">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-[450px] bg-white border-l border-border flex flex-col shadow-xl">
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Carrito
          </h2>
          <span className="bg-primary text-white px-3 py-1 rounded-full font-bold">
            {cart.length} items
          </span>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <POSCart 
            items={cart} 
            updateQuantity={updateQuantity} 
            removeItem={removeItem} 
            total={total} 
          />
        </div>

        <div className="p-6 border-t border-border">
          <Button 
            className="w-full h-16 text-xl font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg disabled:opacity-50"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
          >
            Pagar Ahora (${total.toFixed(2)})
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
