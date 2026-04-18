
"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useFirestore, useUser } from "@/firebase"
import { doc, writeBatch, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Loader2, FileUp, Table as TableIcon, CheckCircle2, AlertTriangle, X } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ImportProductsDialogProps {
  isOpen: boolean
  onClose: () => void
}

interface RawProduct {
  code: string
  name: string
  brand: string
  salePrice: number
  costPrice: number
  stock: number
  unit: string
}

export function ImportProductsDialog({ isOpen, onClose }: ImportProductsDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewData, setPreviewData] = useState<RawProduct[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n')
      const headers = lines[0].split(',')
      
      const parsed: RawProduct[] = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',')
        return {
          code: values[0]?.trim() || "",
          name: values[1]?.trim() || "",
          brand: values[2]?.trim() || "Genérico",
          salePrice: parseFloat(values[3]) || 0,
          costPrice: parseFloat(values[4]) || 0,
          stock: parseFloat(values[5]) || 0,
          unit: values[6]?.trim() || "pza"
        }
      }).filter(p => p.code && p.name)

      setPreviewData(parsed)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!db || !user?.uid || previewData.length === 0) return
    setIsProcessing(true)

    try {
      const batchSize = 400 // Firestore batch limit is 500
      let processed = 0

      while (processed < previewData.length) {
        const batch = writeBatch(db)
        const chunk = previewData.slice(processed, processed + batchSize)

        for (const p of chunk) {
          // Lógica de Upsert: Usar el código como ID determinístico para evitar duplicados
          const sanitizedCode = p.code.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
          const productRef = doc(db, "negocios", user.uid, "productos", sanitizedCode)
          
          batch.set(productRef, {
            ...p,
            id: sanitizedCode,
            ownerId: user.uid,
            ownerEmail: user.email,
            categoryId: "general",
            active: true,
            minStock: 2,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          }, { merge: true })
        }

        await batch.commit()
        processed += chunk.length
      }

      toast({
        title: "IMPORTACIÓN EXITOSA",
        description: `Se han procesado ${previewData.length} productos correctamente.`,
        className: "bg-black text-primary border-primary border-2 font-black",
      })
      
      setPreviewData([])
      onClose()
    } catch (error) {
      console.error(error)
      toast({
        title: "ERROR DE IMPORTACIÓN",
        description: "Ocurrió un error al procesar el archivo.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={isProcessing ? undefined : onClose}>
      <DialogContent className="sm:max-w-[900px] border-none rounded-[2rem] shadow-2xl p-0 overflow-hidden font-body">
        <DialogHeader className="bg-black p-8 text-white border-b-4 border-primary">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center -rotate-3">
              <FileUp className="w-6 h-6 text-black" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                Importación <span className="text-primary">Masiva</span>
              </DialogTitle>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Carga de Datos vía CSV</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6">
          {previewData.length === 0 ? (
            <div 
              className="border-4 border-dashed border-muted rounded-3xl p-16 flex flex-col items-center justify-center gap-6 bg-[#fcfcfc] hover:bg-primary/5 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <TableIcon className="w-10 h-10" />
              </div>
              <div className="text-center">
                <p className="font-black uppercase italic text-lg">Selecciona tu archivo CSV</p>
                <p className="text-xs text-muted-foreground font-bold uppercase mt-1">Formato: código,nombre,marca,precioVenta,costo,stock,unidad</p>
              </div>
              <Input 
                type="file" 
                accept=".csv" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange} 
              />
              <Button variant="outline" className="border-2 border-black font-black uppercase">Explorar Archivos</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-black text-sm uppercase">{previewData.length} Productos detectados</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setPreviewData([])} className="text-red-600 font-bold h-8">
                  <X className="w-4 h-4 mr-1" /> Limpiar
                </Button>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto border-2 border-muted rounded-xl">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase">Código</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Nombre</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Precio</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.slice(0, 50).map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-bold text-xs">{p.code}</TableCell>
                        <TableCell className="font-medium text-xs truncate max-w-[200px]">{p.name}</TableCell>
                        <TableCell className="font-black text-xs">${p.salePrice}</TableCell>
                        <TableCell className="font-bold text-xs">{p.stock}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {previewData.length > 50 && (
                  <p className="p-4 text-center text-[10px] font-bold text-muted-foreground uppercase bg-muted/10 italic">
                    + {previewData.length - 50} productos adicionales no mostrados en la vista previa...
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
                <AlertTriangle className="w-4 h-4" />
                <p className="text-[10px] font-black uppercase">Nota: Los códigos existentes serán actualizados automáticamente.</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-10 bg-black/5 border-t border-muted flex flex-col sm:flex-row gap-4">
          <Button variant="ghost" onClick={onClose} disabled={isProcessing} className="flex-1 h-14 font-black uppercase tracking-widest text-xs rounded-xl">
            Cancelar
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={isProcessing || previewData.length === 0} 
            className="flex-[2] h-14 bg-black hover:bg-primary hover:text-black text-primary font-black uppercase italic tracking-tighter text-xl rounded-xl shadow-xl transition-all active:scale-95"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                CONFIRMAR IMPORTACIÓN
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
