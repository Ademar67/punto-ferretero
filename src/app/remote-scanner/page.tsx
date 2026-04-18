
"use client"

import { useState, useEffect } from "react"
import { Camera, Smartphone, Wifi, CheckCircle2, Loader2, ArrowLeft, Hammer } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarcodeScanner } from "@/components/pos/barcode-scanner"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function RemoteScannerPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [lastScan, setLastScan] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  const handleScan = async (code: string) => {
    if (!db || !user?.uid) return

    const normalizedCode = code.trim().toUpperCase()
    setIsSending(true)
    
    try {
      await addDoc(collection(db, "negocios", user.uid, "remoteScans"), {
        codigo: normalizedCode,
        timestamp: serverTimestamp(),
        ownerId: user.uid
      })
      
      setLastScan(normalizedCode)
      setIsScannerOpen(false)
      
      toast({
        title: "ENVIADO A CAJA",
        description: `Código: ${normalizedCode}`,
        className: "bg-green-600 text-white font-black",
      })
    } catch (error) {
      toast({
        title: "ERROR DE ENVÍO",
        description: "Verifica tu conexión a internet.",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F5F5F5] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="font-black uppercase italic tracking-tighter">Sincronizando Cámara...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col font-body">
      <header className="flex items-center justify-between mb-8">
        <Button asChild variant="ghost" className="text-white p-0 hover:bg-transparent">
          <Link href="/dashboard">
            <ArrowLeft className="w-6 h-6" />
          </Link>
        </Button>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center rotate-3 mb-1">
            <Hammer className="w-5 h-5 text-black" />
          </div>
          <span className="text-[8px] font-black tracking-[0.4em] uppercase text-primary">Terminal Remota</span>
        </div>
        <div className="w-6 h-6" /> {/* Spacer */}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-10">
        <div className="relative">
          <div className="w-48 h-48 rounded-[3rem] border-4 border-primary/20 flex items-center justify-center animate-pulse">
            <div className="w-36 h-36 rounded-[2.5rem] border-4 border-primary/40 flex items-center justify-center">
              <Smartphone className="w-20 h-20 text-primary" />
            </div>
          </div>
          <div className="absolute -top-4 -right-4 bg-green-500 p-3 rounded-2xl shadow-xl shadow-green-500/20">
            <Wifi className="w-6 h-6 text-black" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Escáner <span className="text-primary">Móvil</span></h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Cualquier código que escanees aquí aparecerá en tu PC al instante.</p>
        </div>

        <Button 
          onClick={() => setIsScannerOpen(true)}
          disabled={isSending}
          className="w-full h-24 bg-primary hover:bg-white text-black font-black text-xl rounded-[2rem] shadow-2xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-4"
        >
          {isSending ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />}
          ESCANEAR AHORA
        </Button>

        {lastScan && (
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 w-full flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">Última lectura</span>
              <p className="text-2xl font-black italic text-primary">{lastScan}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        )}
      </main>

      <footer className="mt-10 py-6 text-center border-t border-white/5">
        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">Punto Ferretero Remote V1.0</p>
      </footer>

      <BarcodeScanner 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
      />
    </div>
  )
}
