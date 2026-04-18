
"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Search, ShoppingCart, Package, Hammer, X, Loader2, Lock, PlusCircle, AlertCircle, Camera } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { POSCart } from "@/components/pos/pos-cart"
import { PaymentModal } from "@/components/pos/payment-modal"
import { BarcodeScanner } from "@/components/pos/barcode-scanner"
import { Product, SaleItem } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, where, limit, addDoc, serverTimestamp } from "firebase/firestore"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function POSPage() {
  const { user, isUserLoading } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<SaleItem[]>([])
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
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
      limit(200)
    )
  }, [db, user?.uid])

  const { data: products, isLoading: loadingProducts } = useCollection<Product>(productsQuery)

  useEffect(() => {
    setMounted(true)
    if (user && !isUserLoading) {
      const focusInterval = setInterval(() => {
        if (document.activeElement?.tagName !== 'INPUT' && !isPaymentOpen && !isScannerOpen) {
          searchInputRef.current?.focus()
        }
      }, 1000)
      return () => clearInterval(focusInterval)
    }
  }, [user, isUserLoading, isPaymentOpen, isScannerOpen])

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
    setSearchTerm("")
    playBeep(660, 0.05)
    setTimeout(() => searchInputRef.current?.focus(), 10)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault()
      
      const codeToSearch = searchTerm.trim().toLowerCase()
      const exactMatch = products?.find(p => p.code.toLowerCase() === codeToSearch)
      
      if (exactMatch) {
        addToCart(exactMatch)
        setSearchTerm("")
      } else if (filteredProducts.length === 1) {
        addToCart(filteredProducts[0])
        setSearchTerm("")
      } else {
        playBeep(220, 0.3)
        toast({
          title: "SIN COINCIDENCIA",
          description: `Código "${searchTerm}" no encontrado.`,
          variant: "destructive",
          className: "bg-black text-red-500 border-red-500 border-2 font-black",
        })
        setSearchTerm("")
      }
    }
  }

  const handleCameraScan = (code: string) => {
    const product = products?.find(p => p.code.toLowerCase() === code.toLowerCase().trim())
    if (product) {
      addToCart(product)
      setIsScannerOpen(false)
      toast({
        title: "ESCANEADO EXITOSO",
        description: `${product.name} agregado.`,
        className: "bg-black text-primary border-primary border-2 font-black",
      })
    } else {
      playBeep(220, 0.3)
      toast({
        title: "CÓDIGO DESCONOCIDO",
        description: `El código ${code} no existe.`,
        variant: "destructive",
      })
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

  const playBeep = (freq = 880, dur = 0.15) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + dur);
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + dur);
    } catch (e) { /* ignore */ }
  };

  const handleFinishSale = () => {
    playBeep(880, 0.2);
    setIsPaymentOpen(false)
    setCart([])
    setSearchTerm("")
    toast({
      title: "VENTA REGISTRADA",
      description: `Operación finalizada correctamente.`,
      className: "bg-black text-primary border-primary border-2 font-black",
    })
    setTimeout(() => searchInputRef.current?.focus(), 500)
  }

  const seedTestData = async () => {
    if (!db || !user?.uid) return
    setIsSeeding(true)
    const testProducts = [
      { name: "Martillo de Uña 16oz", code: "M-101", brand: "Truper", salePrice: 180, costPrice: 110, stock: 10, minStock: 2, unit: "pza", categoryId: "herramientas", active: true, ownerId: user.uid, ownerEmail: user.email, createdAt: serverTimestamp() },
      { name: "Destornillador Phillips", code: "D-202", brand: "Stanley", salePrice: 45, costPrice: 25, stock: 20, minStock: 5, unit: "pza", categoryId: "herramientas", active: true, ownerId: user.uid, ownerEmail: user.email, createdAt: serverTimestamp() },
      { name: "Pintura Blanca 4L", code: "PV-505", brand: "Comex", salePrice: 450, costPrice: 280, stock: 12, minStock: 4, unit: "pza", categoryId: "pintura", active: true, ownerId: user.uid, ownerEmail: user.email, createdAt: serverTimestamp() }
    ]
    try {
      for (const p of testProducts) {
        await addDoc(collection(db, "negocios", user.uid, "productos"), p)
      }
      toast({ title: "CATÁLOGO INICIAL CARGADO" })
    } catch (error) { toast({ title: "ERROR AL CARGAR", variant: "destructive" }) } finally { setIsSeeding(false) }
  }

  if (!mounted || isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F5F5F5] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="font-black uppercase italic tracking-tighter">Terminal Inicializando...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F5F5F5] p-6 text-center gap-6">
        <Lock className="w-20 h-20 text-black/10" />
        <h1 className="text-3xl font-black uppercase italic">Autenticación Requerida</h1>
        <Button asChild size="lg" className="bg-primary text-black font-black px-10 h-14 rounded-xl">
          <Link href="/login">IR AL LOGIN</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F5F5F5] overflow-hidden">
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="bg-black p-4 rounded-2xl shadow-xl mb-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-4 flex-1 w-full">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shrink-0 rotate-3">
              <Hammer className="w-6 h-6 text-black" />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
              <Input 
                ref={searchInputRef}
                placeholder="ESCANEAR CÓDIGO O BUSCAR..." 
                autoFocus
                className="pl-12 h-14 text-xl font-black bg-white/5 border-none text-white focus-visible:ring-1 focus-visible:ring-primary rounded-xl placeholder:text-white/10 uppercase italic"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          <Button 
            onClick={() => setIsScannerOpen(true)}
            className="bg-primary hover:bg-white text-black font-black uppercase italic tracking-tighter h-14 px-6 rounded-xl flex items-center gap-2 w-full md:w-auto"
          >
            <Camera className="w-5 h-5" />
            Cámara
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="font-black uppercase italic tracking-tight text-xs">Sincronizando Inventario...</p>
            </div>
          ) : (
            <>
              {products?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                  <Package className="w-20 h-20 text-black/5" />
                  <p className="text-xl font-black uppercase italic text-black/20">Inventario Vacío</p>
                  <Button onClick={seedTestData} disabled={isSeeding} className="bg-black text-primary font-black h-12 rounded-xl">
                    {isSeeding ? <Loader2 className="animate-spin mr-2" /> : <PlusCircle className="mr-2" />}
                    POBLAR CATÁLOGO
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                  {filteredProducts.map((product) => (
                    <button
                      key={`pos-prod-${product.id}`}
                      className="flex flex-col p-4 bg-white border-2 border-transparent hover:border-black shadow-sm transition-all rounded-xl text-left active:scale-95 group"
                      onClick={() => addToCart(product)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[8px] font-black text-white bg-black px-1.5 py-0.5 rounded tracking-widest">{product.code}</span>
                        <span className={cn(
                          "text-[9px] font-bold px-2 rounded-full",
                          product.stock <= product.minStock ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                        )}>
                          Stock: {product.stock}
                        </span>
                      </div>
                      <h3 className="font-black text-xs text-black uppercase truncate mb-1">{product.name}</h3>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase italic">{product.brand}</p>
                      <div className="mt-4 pt-3 border-t border-dashed border-muted flex items-end justify-between">
                        <span className="text-2xl font-black text-black tracking-tighter font-mono">${product.salePrice.toFixed(2)}</span>
                        <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                          <PlusCircle className="w-4 h-4 text-black" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="w-full lg:w-[450px] bg-white border-l-4 border-black flex flex-col shadow-2xl relative z-20">
        <POSCart 
          items={cart} 
          updateQuantity={updateQuantity} 
          removeItem={removeItem} 
          total={total} 
        />

        <div className="p-6 bg-white border-t border-muted">
          <Button 
            className="w-full h-20 text-2xl font-black bg-primary hover:bg-black hover:text-primary text-black shadow-xl rounded-2xl transition-all active:scale-95 disabled:opacity-30 flex flex-col items-center justify-center gap-1"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-50">Cerrar Transacción</span>
            <span className="italic uppercase font-black">Pagar ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
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

      <BarcodeScanner 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleCameraScan}
      />
    </div>
  )
}
