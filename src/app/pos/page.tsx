
"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Search, ShoppingCart, Package, Hammer, X, Loader2, Lock, PlusCircle, AlertCircle, Camera, Smartphone, Wifi, Plus, Printer, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { POSCart } from "@/components/pos/pos-cart"
import { PaymentModal } from "@/components/pos/payment-modal"
import { BarcodeScanner } from "@/components/pos/barcode-scanner"
import { AddProductDialog } from "@/components/productos/add-product-dialog"
import { TicketView } from "@/components/pos/ticket-view"
import { Product, SaleItem, RemoteScan, Sale } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, where, limit, addDoc, serverTimestamp, onSnapshot, doc, deleteDoc } from "firebase/firestore"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ToastAction } from "@/components/ui/toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function POSPage() {
  const { user, isUserLoading } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<SaleItem[]>([])
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [lastSale, setLastSale] = useState<Sale | null>(null)
  const [prefilledCode, setPrefilledCode] = useState("")
  const [mounted, setMounted] = useState(false)
  
  const { toast } = useToast()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const db = useFirestore()

  const productsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null
    return query(
      collection(db, "negocios", user.uid, "productos"), 
      where("activo", "==", true), 
      limit(200)
    )
  }, [db, user?.uid])

  const { data: products, isLoading: loadingProducts } = useCollection<Product>(productsQuery)

  useEffect(() => {
    if (!db || !user?.uid || !products) return
    const remoteScanCol = collection(db, "negocios", user.uid, "remoteScans")
    const unsubscribe = onSnapshot(remoteScanCol, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const scan = change.doc.data() as RemoteScan
          const normalizedCode = scan.codigo.toUpperCase()
          const product = products.find(p => p.codigo.toUpperCase() === normalizedCode)
          if (product) {
            addToCart(product)
            toast({ title: "ESCÁNER REMOTO", description: `${product.nombre} agregado.` })
          } else {
            handleUnknownCode(normalizedCode)
          }
          deleteDoc(doc(db, "negocios", user.uid!, "remoteScans", change.doc.id))
        }
      })
    })
    return () => unsubscribe()
  }, [db, user?.uid, products])

  useEffect(() => {
    setMounted(true)
    if (user && !isUserLoading) {
      const focusInterval = setInterval(() => {
        if (document.activeElement?.tagName !== 'INPUT' && !isPaymentOpen && !isScannerOpen && !isAddProductOpen && !lastSale) {
          searchInputRef.current?.focus()
        }
      }, 1000)
      return () => clearInterval(focusInterval)
    }
  }, [user, isUserLoading, isPaymentOpen, isScannerOpen, isAddProductOpen, lastSale])

  const filteredProducts = useMemo(() => {
    if (!products) return []
    return products.filter(p => 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [products, searchTerm])

  const addToCart = (product: Product) => {
    const price = Number(product.precioVenta) || 0
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id)
      if (existing) {
        return prev.map(item => {
          if (item.productId === product.id) {
            const newQty = item.quantity + 1
            return { ...item, quantity: newQty, subtotal: Number((newQty * item.price).toFixed(2)) }
          }
          return item
        })
      }
      return [...prev, { productId: product.id, name: product.nombre, price: price, quantity: 1, subtotal: price, discount: 0 }]
    })
    setSearchTerm("")
    playBeep(660, 0.05)
  }

  const handleUnknownCode = (code: string) => {
    playBeep(220, 0.3)
    setPrefilledCode(code)
    toast({
      title: "PRODUCTO NO ENCONTRADO",
      description: `Código: "${code}"`,
      variant: "destructive",
      action: <ToastAction altText="Crear" onClick={() => setIsAddProductOpen(true)}>CREAR</ToastAction>,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault()
      const normalizedCode = searchTerm.trim().toUpperCase()
      const exactMatch = products?.find(p => p.codigo.toUpperCase() === normalizedCode)
      if (exactMatch) {
        addToCart(exactMatch)
      } else {
        handleUnknownCode(normalizedCode)
      }
      setSearchTerm("")
    }
  }

  const handleCameraScan = (code: string) => {
    const normalizedCode = code.trim().toUpperCase()
    const product = products?.find(p => p.codigo.toUpperCase() === normalizedCode)
    if (product) {
      addToCart(product)
      setIsScannerOpen(false)
    } else {
      setIsScannerOpen(false)
      handleUnknownCode(normalizedCode)
    }
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty, subtotal: Number((newQty * item.price).toFixed(2)) }
      }
      return item
    }))
  }

  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId))
  }

  const total = useMemo(() => cart.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0), [cart])

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
    } catch (e) { }
  };

  const handleFinishSale = (saleData: Sale) => {
    playBeep(880, 0.2);
    setIsPaymentOpen(false)
    setCart([])
    setLastSale(saleData)
    toast({ title: "VENTA REGISTRADA", className: "bg-black text-primary font-black" })
  }

  if (!mounted || isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F5F5F5] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="font-black uppercase italic tracking-tighter">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F5F5F5] overflow-hidden font-body">
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="bg-black p-4 rounded-2xl shadow-xl mb-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-4 flex-1 w-full">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center rotate-3">
              <Hammer className="w-6 h-6 text-black" />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
              <Input 
                ref={searchInputRef}
                placeholder="ESCANEAR O BUSCAR..." 
                className="pl-12 h-14 text-xl font-black bg-white/5 border-none text-white focus-visible:ring-1 focus-visible:ring-primary rounded-xl placeholder:text-white/10 uppercase italic"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsScannerOpen(true)} className="bg-primary text-black font-black h-14 rounded-xl px-6">
              <Camera className="w-5 h-5 mr-2" /> Cámara
            </Button>
            <Badge className="bg-green-500 text-black font-black flex items-center gap-2 px-4 rounded-xl h-14">
              <Wifi className="w-4 h-4" /> Remoto ON
            </Badge>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
            {filteredProducts.map((p) => (
              <button key={p.id} onClick={() => addToCart(p)} className="p-4 bg-white border-2 border-transparent hover:border-black shadow-sm rounded-xl text-left transition-all active:scale-95 group">
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline" className="text-[8px] font-black">{p.codigo}</Badge>
                  <span className={cn("text-[9px] font-bold px-2 rounded-full", p.stockActual <= p.stockMinimo ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600")}>
                    {p.stockActual} {p.unidad}
                  </span>
                </div>
                <h3 className="font-black text-xs uppercase truncate mb-1">{p.nombre}</h3>
                <p className="text-[9px] text-muted-foreground font-bold uppercase italic">{p.marca}</p>
                <div className="mt-4 pt-3 border-t border-dashed border-muted flex items-end justify-between">
                  <span className="text-2xl font-black italic tracking-tighter">${p.precioVenta.toFixed(2)}</span>
                  <PlusCircle className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[450px] bg-white border-l-4 border-black flex flex-col shadow-2xl relative z-20">
        <POSCart items={cart} updateQuantity={updateQuantity} removeItem={removeItem} total={total} />
        <div className="p-6 bg-white border-t border-muted">
          <Button 
            className="w-full h-20 text-2xl font-black bg-primary hover:bg-black hover:text-primary text-black shadow-xl rounded-2xl transition-all active:scale-95 disabled:opacity-30 flex flex-col items-center justify-center gap-1"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-50">Cerrar Transacción</span>
            <span className="italic uppercase font-black">Cobrar ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
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

      <BarcodeScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScan={handleCameraScan} />
      <AddProductDialog isOpen={isAddProductOpen} onClose={() => setIsAddProductOpen(false)} initialCode={prefilledCode} />

      <Dialog open={!!lastSale} onOpenChange={(open) => !open && setLastSale(null)}>
        <DialogContent className="max-w-md border-none p-0 bg-transparent shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Venta Exitosa</DialogTitle>
          </DialogHeader>
          <div className="bg-white p-10 rounded-3xl shadow-2xl text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white">
                <CheckCircle2 className="w-12 h-12" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">¡Venta Exitosa!</h2>
              <p className="text-muted-foreground font-medium">El ticket ha sido generado correctamente.</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-2xl border-2 border-dashed border-muted">
              {lastSale && <TicketView sale={lastSale} />}
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 h-14 font-black uppercase tracking-widest text-xs border-2 border-black rounded-xl" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" /> Imprimir
              </Button>
              <Button className="flex-1 h-14 bg-black text-primary font-black uppercase tracking-widest text-xs rounded-xl" onClick={() => setLastSale(null)}>
                Nueva Venta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
