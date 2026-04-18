
"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Package, PlusCircle, ArrowLeft, Loader2, Save, AlertCircle, Camera, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, where, writeBatch, doc, serverTimestamp, increment, limit } from "firebase/firestore"
import { Product } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { AddProductDialog } from "@/components/productos/add-product-dialog"
import { BarcodeScanner } from "@/components/pos/barcode-scanner"

export default function EntradaInventarioPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState<string>("1")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const quantityInputRef = useRef<HTMLInputElement>(null)

  // Consulta de todos los productos para búsqueda rápida local (o filtrada)
  const productsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null
    return query(collection(db, "negocios", user.uid, "productos"), where("activo", "==", true))
  }, [db, user?.uid])

  const { data: products, isLoading: loadingProducts } = useCollection<Product>(productsQuery)

  useEffect(() => {
    const focusTimer = setInterval(() => {
      if (document.activeElement?.tagName !== 'INPUT' && !isAddProductOpen && !isScannerOpen) {
        searchInputRef.current?.focus()
      }
    }, 1000)
    return () => clearInterval(focusTimer)
  }, [isAddProductOpen, isScannerOpen])

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault()
      const normalized = searchTerm.trim().toUpperCase()
      const found = products?.find(p => p.codigo.toUpperCase() === normalized)
      
      if (found) {
        setSelectedProduct(found)
        setSearchTerm("")
        setTimeout(() => quantityInputRef.current?.focus(), 100)
      } else {
        toast({
          title: "PRODUCTO NO ENCONTRADO",
          description: `El código ${normalized} no existe. ¿Deseas crearlo?`,
          variant: "destructive",
        })
        setIsAddProductOpen(true)
      }
    }
  }

  const handleCameraScan = (code: string) => {
    const normalized = code.trim().toUpperCase()
    const found = products?.find(p => p.codigo.toUpperCase() === normalized)
    if (found) {
      setSelectedProduct(found)
      setIsScannerOpen(false)
      setTimeout(() => quantityInputRef.current?.focus(), 500)
    } else {
      setIsScannerOpen(false)
      toast({ title: "CÓDIGO NO REGISTRADO" })
      setIsAddProductOpen(true)
    }
  }

  const handleConfirmEntry = async () => {
    if (!db || !user?.uid || !selectedProduct) return
    
    const qty = parseInt(quantity)
    if (isNaN(qty) || qty <= 0) {
      toast({ title: "CANTIDAD INVÁLIDA", variant: "destructive" })
      return
    }

    setIsProcessing(true)
    try {
      const batch = writeBatch(db)
      const productRef = doc(db, "negocios", user.uid, "productos", selectedProduct.id)
      const movementRef = doc(collection(db, "negocios", user.uid, "movimientosInventario"))

      // 1. Aumentar stock
      batch.update(productRef, {
        stockActual: increment(qty)
      })

      // 2. Registrar movimiento
      batch.set(movementRef, {
        ownerId: user.uid,
        productId: selectedProduct.id,
        productName: selectedProduct.nombre,
        codigo: selectedProduct.codigo,
        type: 'entrada',
        quantity: qty,
        reason: "Entrada por escáner de almacén",
        date: serverTimestamp(),
        userId: user.uid,
        userEmail: user.email
      })

      await batch.commit()

      toast({
        title: "STOCK ACTUALIZADO",
        description: `Se agregaron ${qty} unidades a ${selectedProduct.nombre}`,
        className: "bg-black text-primary border-primary border-2 font-black",
      })

      setSelectedProduct(null)
      setQuantity("1")
      setSearchTerm("")
      searchInputRef.current?.focus()
    } catch (error) {
      toast({ title: "ERROR AL PROCESAR", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F5F5F5]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-[#f8f9fa] min-h-screen">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="h-12 w-12 rounded-xl hover:bg-primary/10 transition-colors">
            <Link href="/inventario">
              <ArrowLeft className="w-6 h-6" />
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-black uppercase italic leading-none">
              Entrada de <span className="text-primary">Mercancía</span>
            </h1>
            <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest mt-1">Suministro Rápido por Escaneo</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* BUSCADOR MAESTRO */}
        <Card className="border-none shadow-2xl bg-black overflow-hidden rounded-[2rem]">
          <CardContent className="p-10 space-y-6">
            <div className="flex flex-col gap-4">
              <Label className="text-primary font-black uppercase tracking-[0.3em] text-[11px] italic">Escanear para Identificar</Label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 w-6 h-6" />
                  <Input 
                    ref={searchInputRef}
                    placeholder="ESCANEAR CÓDIGO DE BARRAS..." 
                    className="h-20 bg-white/5 border-none text-white text-3xl font-black italic tracking-tighter pl-16 rounded-2xl focus-visible:ring-primary focus-visible:ring-offset-0 placeholder:text-white/10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearch}
                    disabled={isProcessing}
                  />
                </div>
                <Button 
                  onClick={() => setIsScannerOpen(true)}
                  className="h-20 w-20 bg-primary hover:bg-white text-black rounded-2xl shrink-0 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  <Camera className="w-8 h-8" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PANEL DE ACCIÓN - SÓLO SI HAY PRODUCTO */}
        {selectedProduct ? (
          <Card className="border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-primary p-6 flex items-center justify-between border-b-4 border-black">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center rotate-3">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-xl uppercase italic leading-none">{selectedProduct.nombre}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/50">{selectedProduct.codigo}</p>
                </div>
              </div>
              <Badge className="bg-black text-primary font-black px-4 py-1 rounded-full text-lg">
                STOCK: {selectedProduct.stockActual}
              </Badge>
            </div>
            <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label className="font-black uppercase text-[10px] tracking-widest text-black/40 italic">Cantidad a Ingresar</Label>
                <div className="relative">
                  <Input 
                    ref={quantityInputRef}
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirmEntry()}
                    className="h-28 text-7xl font-black tracking-tighter border-4 border-muted focus-visible:ring-primary rounded-[2rem] text-center"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 font-black italic text-xl uppercase">
                    {selectedProduct.unidad}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-end gap-4">
                <Button 
                  onClick={handleConfirmEntry}
                  disabled={isProcessing}
                  className="h-28 bg-black hover:bg-primary hover:text-black text-primary font-black text-3xl italic tracking-tighter rounded-[2rem] shadow-xl transition-all active:scale-95 flex flex-col items-center justify-center gap-1"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : (
                    <>
                      <span className="text-[10px] uppercase tracking-[0.4em] opacity-40">Confirmar Recepción</span>
                      <div className="flex items-center gap-3">
                        <Save className="w-8 h-8" />
                        CARGAR AL INVENTARIO
                      </div>
                    </>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedProduct(null)}
                  disabled={isProcessing}
                  className="h-14 font-black uppercase text-xs tracking-widest"
                >
                  Cancelar / Escanear otro
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-6 opacity-20">
            <Package className="w-32 h-32" />
            <p className="font-black text-2xl uppercase italic tracking-tighter">Esperando Escaneo de Mercancía...</p>
          </div>
        )}
      </div>

      <AddProductDialog 
        isOpen={isAddProductOpen} 
        onClose={() => setIsAddProductOpen(false)} 
        initialCode={searchTerm || undefined}
      />

      <BarcodeScanner 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleCameraScan}
      />
    </div>
  )
}
