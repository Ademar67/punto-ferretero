
"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Search, FileText, Package, Hammer, X, Loader2, Camera, Plus, Save, ArrowLeft, User, Smartphone, Wifi } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { POSCart } from "@/components/pos/pos-cart"
import { BarcodeScanner } from "@/components/pos/barcode-scanner"
import { AddProductDialog } from "@/components/productos/add-product-dialog"
import { Product, SaleItem, Quotation } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, where, limit, addDoc, serverTimestamp, doc, onSnapshot, deleteDoc } from "firebase/firestore"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NuevaCotizacionPage() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [cart, setCart] = useState<SaleItem[]>([])
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
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
          const scan = change.doc.data()
          const product = products.find(p => p.codigo.toUpperCase() === scan.codigo.toUpperCase())
          if (product) {
            addToCart(product)
            toast({ title: "ESCÁNER REMOTO", description: `${product.nombre} agregado.` })
          }
          deleteDoc(doc(db, "negocios", user.uid!, "remoteScans", change.doc.id))
        }
      })
    })
    return () => unsubscribe()
  }, [db, user?.uid, products])

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

  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0)
  }, [cart])

  const handleSaveQuotation = async () => {
    if (!db || !user?.uid || cart.length === 0 || isSaving) return

    setIsSaving(true)
    try {
      const folio = `C-${Date.now().toString().slice(-6)}`
      const quotationData = {
        ownerId: user.uid,
        folio: folio,
        date: serverTimestamp(),
        items: cart,
        subtotal: Number((total / 1.16).toFixed(2)),
        discount: 0,
        total: total,
        userId: user.uid,
        userEmail: user.email,
        status: 'pendiente',
        customerName: customerName || "Mostrador",
        customerPhone: customerPhone,
        createdAt: serverTimestamp()
      }

      await addDoc(collection(db, "negocios", user.uid, "cotizaciones"), quotationData)

      toast({ 
        title: "COTIZACIÓN GUARDADA", 
        description: `Folio: ${folio}`,
        className: "bg-teal-600 text-white font-black"
      })
      router.push("/cotizaciones")
    } catch (error) {
      toast({ title: "ERROR AL GUARDAR", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  if (isUserLoading) return null

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F5F5F5] overflow-hidden font-body">
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex items-center gap-4 mb-6">
          <Button asChild variant="ghost" className="h-12 w-12 rounded-xl">
            <Link href="/cotizaciones"><ArrowLeft /></Link>
          </Button>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Nueva <span className="text-teal-600">Cotización</span></h1>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nombre del Cliente</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Ej. Juan Pérez" 
                className="pl-10 h-12 rounded-xl"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Teléfono (WhatsApp)</Label>
            <Input 
              placeholder="5512345678" 
              className="h-12 rounded-xl"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-black p-4 rounded-2xl shadow-xl mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
            <Input 
              ref={searchInputRef}
              placeholder="ESCANEAR O BUSCAR PRODUCTOS..." 
              className="pl-12 h-14 text-xl font-black bg-white/5 border-none text-white focus-visible:ring-1 focus-visible:ring-teal-600 rounded-xl placeholder:text-white/10 uppercase italic"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsScannerOpen(true)} className="bg-teal-600 text-white font-black h-14 rounded-xl px-6">
            <Camera className="w-5 h-5 mr-2" /> Cámara
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
            {filteredProducts.map((p) => (
              <button key={p.id} onClick={() => addToCart(p)} className="p-4 bg-white border-2 border-transparent hover:border-teal-600 shadow-sm rounded-xl text-left transition-all active:scale-95 group">
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline" className="text-[8px] font-black">{p.codigo}</Badge>
                  <span className="text-[9px] font-bold px-2 rounded-full bg-teal-50 text-teal-600">
                    S: {p.stockActual}
                  </span>
                </div>
                <h3 className="font-black text-xs uppercase truncate mb-1">{p.nombre}</h3>
                <div className="mt-4 pt-3 border-t border-dashed border-muted flex items-end justify-between">
                  <span className="text-2xl font-black italic tracking-tighter">${p.precioVenta.toFixed(2)}</span>
                  <Plus className="w-6 h-6 text-teal-600 group-hover:scale-110 transition-transform" />
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
            className="w-full h-20 text-2xl font-black bg-teal-600 hover:bg-black hover:text-teal-600 text-white shadow-xl rounded-2xl transition-all active:scale-95 disabled:opacity-30 flex flex-col items-center justify-center gap-1"
            disabled={cart.length === 0 || isSaving}
            onClick={handleSaveQuotation}
          >
            {isSaving ? <Loader2 className="animate-spin" /> : (
              <>
                <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-50">Guardar Presupuesto</span>
                <span className="italic uppercase font-black">COTIZAR ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <BarcodeScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScan={(code) => {
        const p = products?.find(p => p.codigo.toUpperCase() === code.toUpperCase())
        if (p) addToCart(p)
        setIsScannerOpen(false)
      }} />
    </div>
  )
}
