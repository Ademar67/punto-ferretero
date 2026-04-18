
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Product } from "@/types"
import { useFirestore, useUser } from "@/firebase"
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, limit } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, PackagePlus } from "lucide-react"

const productSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  code: z.string().min(2, "Código requerido").regex(/^[a-zA-Z0-9-]+$/, "Solo letras, números y guiones"),
  brand: z.string().default("Genérico"),
  categoryId: z.string().default("general"),
  costPrice: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0),
  stock: z.coerce.number().min(0),
  minStock: z.coerce.number().min(0),
  unit: z.string().default("pza"),
  active: z.boolean().default(true),
})

type ProductFormValues = z.infer<typeof productSchema>

interface AddProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product;
}

export function AddProductDialog({ isOpen, onClose, productToEdit }: AddProductDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      code: "",
      brand: "Genérico",
      categoryId: "general",
      costPrice: 0,
      salePrice: 0,
      stock: 0,
      minStock: 2,
      unit: "pza",
      active: true,
    },
  })

  useEffect(() => {
    if (productToEdit) {
      form.reset({
        name: productToEdit.name,
        code: productToEdit.code,
        brand: productToEdit.brand,
        categoryId: productToEdit.categoryId,
        costPrice: productToEdit.costPrice,
        salePrice: productToEdit.salePrice,
        stock: productToEdit.stock,
        minStock: productToEdit.minStock,
        unit: productToEdit.unit,
        active: productToEdit.active,
      })
    } else {
      form.reset({
        name: "",
        code: "",
        brand: "Genérico",
        categoryId: "general",
        costPrice: 0,
        salePrice: 0,
        stock: 0,
        minStock: 2,
        unit: "pza",
        active: true,
      })
    }
  }, [productToEdit, form, isOpen])

  const onSubmit = async (values: ProductFormValues) => {
    if (!db || !user?.uid) return
    setIsSubmitting(true)

    try {
      // Si no estamos editando, verificar si el código ya existe para este negocio
      if (!productToEdit) {
        const q = query(
          collection(db, "negocios", user.uid, "productos"),
          where("code", "==", values.code.trim()),
          limit(1)
        )
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          form.setError("code", { message: "Este código ya existe en tu catálogo" })
          setIsSubmitting(false)
          return
        }
      }

      const docId = productToEdit?.id || values.code.trim().toLowerCase().replace(/\s+/g, '-')
      const productRef = doc(db, "negocios", user.uid, "productos", docId)
      
      const finalData = {
        ...values,
        id: docId,
        ownerId: user.uid,
        ownerEmail: user.email,
        updatedAt: serverTimestamp(),
        createdAt: productToEdit ? productToEdit.createdAt : serverTimestamp(),
      }

      await setDoc(productRef, finalData, { merge: true })

      toast({
        title: productToEdit ? "SINCRONIZADO" : "REGISTRADO",
        description: `${values.name} guardado correctamente.`,
        className: "bg-black text-primary border-primary border-2 font-black",
      })

      if (!productToEdit) {
        form.reset()
      } else {
        onClose()
      }
    } catch (error) {
      toast({
        title: "ERROR DE ESCRITURA",
        description: "No se pudo sincronizar con Firestore.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={isSubmitting ? undefined : onClose}>
      <DialogContent className="sm:max-w-[600px] border-none rounded-[2rem] shadow-2xl p-0 overflow-hidden font-body">
        <DialogHeader className="bg-black p-8 text-white border-b-4 border-primary">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center rotate-3">
              <PackagePlus className="w-6 h-6 text-black" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                {productToEdit ? "Editar" : "Nuevo"} <span className="text-primary">Producto</span>
              </DialogTitle>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Base de Datos de Inventario</p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] tracking-widest text-black/40 italic">Código de Barras / SKU</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!!productToEdit} placeholder="EAN-13, Interno..." className="h-12 border-4 border-muted focus-visible:ring-primary rounded-xl font-bold uppercase" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] tracking-widest text-black/40 italic">Descripción Comercial</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej. Martillo 16oz" className="h-12 border-4 border-muted focus-visible:ring-primary rounded-xl font-bold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] tracking-widest text-black/40 italic">Marca / Proveedor</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-12 border-4 border-muted focus-visible:ring-primary rounded-xl font-bold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] tracking-widest text-black/40 italic">Unidad</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="pza, kg, m..." className="h-12 border-4 border-muted focus-visible:ring-primary rounded-xl font-bold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] tracking-widest text-black/40 italic">Costo</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="h-12 border-4 border-muted focus-visible:ring-primary rounded-xl font-bold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] tracking-widest text-black/40 italic">Precio Público</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="h-12 border-4 border-primary/20 focus-visible:ring-primary rounded-xl font-black text-lg bg-primary/5" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] tracking-widest text-black/40 italic">Inventario Actual</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="h-12 border-4 border-muted focus-visible:ring-primary rounded-xl font-bold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] tracking-widest text-black/40 italic">Mínimo Crítico</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="h-12 border-4 border-muted focus-visible:ring-primary rounded-xl font-bold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="pt-6 border-t border-dashed border-muted flex flex-col sm:flex-row gap-4">
              <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-14 font-black uppercase tracking-widest text-xs rounded-xl">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-[2] h-14 bg-black hover:bg-primary hover:text-black text-primary font-black uppercase italic tracking-tighter text-xl rounded-xl shadow-xl transition-all active:scale-95"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    {productToEdit ? "ACTUALIZAR" : "GUARDAR EN NUBE"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
