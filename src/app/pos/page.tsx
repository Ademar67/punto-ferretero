"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Search, ShoppingCart, Package, Hammer, X, Loader2, Lock, PlusCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { POSCart } from "@/components/pos/pos-cart"
import { PaymentModal } from "@/components/pos/payment-modal"
import { Product, SaleItem } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, where, limit, addDoc, serverTimestamp } from "firebase/firestore"
import Link from "next/link"

export default function POSPage() {
  const { user, isUserLoading } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<SaleItem[]>([])
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const { toast } = useToast()
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const db = useFirestore()

  const productsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null
    return query(
      collection(db, "negocios", user.uid, "productos"), 
      where("active", "==", true), 
      limit(100)
    )
  }, [db, user?.uid])

  const { data: products, isLoading: loadingProducts } = useCollection<Product>(productsQuery)

  useEffect(() => {
    setMounted(true)
    if (user && !isUserLoading) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 150)
      return () => clearTimeout(timer)
    }
  }, [user, isUserLoading])

  const filteredProducts = useMemo(() => {
    if (!products) return []
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [products, searchTerm])

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id)
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.salePrice }
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

  const handleFinishSale = () => {
    setIsPaymentOpen(false)
    setCart([])
    setSearchTerm("")
    toast({
      title: "VENTA REALIZADA",
      description: `¡Transacción guardada con éxito!`,
      className: "bg-black text-primary border-primary border-2 font-black",
    })
    searchInputRef.current?.focus()
  }

  const seedTestData = async () => {
    if (!db || !user?.uid) return
    setIsSeeding(true)
    
    const testProducts = [
      { name: "Martillo de Uña 16oz", code: "M-101", brand: "Truper", salePrice: 180, costPrice: 110, stock: 10, minStock: 2, unit: "pza", categoryId: "herramientas", active: true, ownerId: user.uid, createdAt: serverTimestamp() },
      { name: "Destornillador Phillips", code: "D-202", brand: "Stanley", salePrice: 45, costPrice: 25, stock: 20, minStock: 5, unit: "pza", categoryId: "herramientas", active: true, ownerId: user.uid, createdAt: serverTimestamp() },
      { name: "Cinta Métrica 5m", code: "C-303", brand: "Lufkin", salePrice: 120, costPrice: 70, stock: 15, minStock: 3, unit: "pza", categoryId: "medicion", active: true, ownerId: user.uid, createdAt: serverTimestamp() },
      { name: "Alicates de Presión", code: "A-404", brand: "Vise-Grip", salePrice: 250, costPrice: 150, stock: 8, minStock: 2, unit: "pza", categoryId: "herramientas", active: true, ownerId: user.uid, createdAt: serverTimestamp() },
      { name: "Juego de Llaves Allen", code: "LL-505", brand: "Bondhus", salePrice: 320, costPrice: 200, stock: 5, minStock: 1, unit: "set", categoryId: "herramientas", active: true, ownerId: user.uid, createdAt: serverTimestamp() }
    ]

    try {
      const colRef = collection(db, "negocios", user.uid, "productos")
      for (const p of testProducts) {
        await addDoc(colRef, p)
      }
      toast({ title: "DATOS CARGADOS", description: "Se han añadido 5 productos de prueba." })
    } catch (error) {
      console.error("Error seeding data:", error)
      toast({ title: "ERROR", description: "No se pudieron cargar los datos.", variant: "destructive" })
    } finally {
      setIsSeeding(false)
    }
  }

  if (!mounted || isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F5F5F5] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="font-black uppercase italic tracking-tighter">Iniciando Terminal...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F5F5F5] p-6 gap-6 text-center">
        <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center shadow-xl rotate-3 border-4 border-primary">
          <Lock className="w-10 h-10 text-primary -rotate-3" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Acceso Restringido</h1>
          <p className="text-muted-foreground font-bold uppercase text-xs">Debes iniciar sesión para operar la terminal de venta.</p>
        </div>
        <Button asChild size="lg" className="bg-primary text-black font-black px-10 h-14 rounded-xl shadow-lg shadow-primary/20">
          <Link href="/login">IR AL LOGIN</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F5F5F5] overflow-hidden">
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="bg-black p-6 rounded-2xl shadow-2xl border-b-4 border-primary mb-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary w-6 h-6 group-focus-within:scale-110 transition-transform" />
            <Input 
              ref={searchInputRef}
              placeholder="ESCANEAR CÓDIGO O BUSCAR PRODUCTO..." 
              className="pl-16 h-20 text-2xl font-black bg-white/5 border-none text-white focus-visible:ring-2 focus-visible:ring-primary rounded-xl placeholder:text-white/20 uppercase italic"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="font-black uppercase italic tracking-tight">Consultando Catálogo...</p>
            </div>
          ) : (
            <>
              {products && products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                  <Package className="w-24 h-24 text-muted-foreground/20" />
                  <div className="space-y-2">
                    <p className="text-2xl font-black uppercase italic tracking-tighter">Inventario Vacío</p>
                    <p className="text-muted-foreground font-bold text-xs">No hay productos registrados en tu negocio.</p>
                  </div>
                  <Button 
                    onClick={seedTestData} 
                    disabled={isSeeding}
                    className="bg-black text-primary font-black px-8 h-12 rounded-xl"
                  >
                    {isSeeding ? <Loader2 className="animate-spin mr-2" /> : <PlusCircle className="mr-2" />}
                    CARGAR PRODUCTOS DE PRUEBA
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
                  {filteredProducts.map((product) => (
                    <button
                      key={`pos-prod-${product.id}`}
                      className="flex flex-col items-start p-5 gap-4 bg-white border-2 border-transparent hover:border-black hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all rounded-2xl text-left active:scale-95 group relative overflow-hidden"
                      onClick={() => addToCart(product)}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 -mr-10 -mt-10 rounded-full group-hover:scale-150 transition-transform" />
                      
                      <div className="w-full flex justify-between items-center relative z-10">
                        <span className="text-[9px] font-black text-white bg-black px-2 py-0.5 rounded uppercase tracking-[0.2em]">{product.code}</span>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-muted-foreground font-black uppercase">Stock</span>
                          <span className={`text-xs font-black ${product.stock <= product.minStock ? 'text-red-600' : 'text-black'}`}>
                            {product.stock} {product.unit}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 w-full relative z-10">
                        <h3 className="font-black text-sm text-black uppercase leading-tight line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1 italic">{product.brand}</p>
                      </div>
                      
                      <div className="w-full pt-4 border-t-2 border-dashed border-muted relative z-10">
                        <div className="flex items-end justify-between">
                          <span className="text-3xl font-black text-black tracking-tighter leading-none">${product.salePrice.toFixed(2)}</span>
                          <Hammer className="w-5 h-5 text-muted/30 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          {!loadingProducts && products && products.length > 0 && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/20 py-20">
              <Search className="w-32 h-32 mb-6" />
              <p className="text-3xl font-black uppercase italic tracking-tighter">Sin coincidencias</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-[500px] bg-white border-l-4 border-black flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.2)] relative z-20">
        <div className="p-8 border-b-2 border-black flex justify-between items-center bg-black">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg rotate-3 group-hover:-rotate-3 transition-transform">
              <ShoppingCart className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase leading-none tracking-tighter">
                Terminal <span className="text-primary">POS</span>
              </h2>
              <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.3em] mt-1">Ready to checkout</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-primary text-[10px] font-black uppercase tracking-widest">Items</span>
            <p className="text-2xl font-black text-white leading-none">{cart.reduce((a, b) => a + b.quantity, 0)}</p>
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

        <div className="p-8 bg-white border-t-4 border-black">
          <Button 
            className="w-full h-24 text-3xl font-black bg-primary hover:bg-primary/90 text-black shadow-[0_15px_40px_rgba(255,214,0,0.3)] rounded-2xl transition-all active:scale-95 disabled:opacity-30 disabled:grayscale flex flex-col gap-1 items-center justify-center"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
          >
            <span className="text-xs uppercase tracking-[0.3em] opacity-50 font-black">Confirmar y Pagar</span>
            <span className="tracking-tighter italic font-black uppercase">Pagar $ {total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </Button>
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={total}
        cartItems={cart}
        onConfirm={handleFinishSale}
      />
    </div>
  )
}
