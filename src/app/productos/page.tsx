"use client"

import { useState, useMemo } from "react"
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
  FileUp,
  Loader2,
  Package,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Product } from "@/types"
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, doc, deleteDoc } from "firebase/firestore"
import { AddProductDialog } from "@/components/productos/add-product-dialog"
import { ImportProductsDialog } from "@/components/productos/import-products-dialog"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const normalizeText = (text: string | number | undefined | null) => {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

export default function ProductosPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)

  const productsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null

    return query(
      collection(db, "negocios", user.uid, "productos"),
      orderBy("nombre", "asc")
    )
  }, [db, user?.uid])

  const { data: products, isLoading } = useCollection<Product>(productsQuery)

  const filteredProducts = useMemo(() => {
    if (!products) return []

    const term = normalizeText(searchTerm)

    if (!term) return products

    const words = term.split(" ").filter(Boolean)

    return products.filter((p) => {
      const searchableText = normalizeText(
        [
          p.nombre,
          p.codigo,
          p.marca,
          p.unidad,
          p.categoriaId,
          p.precioVenta,
          p.stockActual,
        ].join(" ")
      )

      return words.every((word) => searchableText.includes(word))
    })
  }, [products, searchTerm])

  const handleDelete = async (productId: string) => {
    if (!db || !user?.uid) return
    if (!confirm("¿Estás seguro de eliminar este producto?")) return

    try {
      await deleteDoc(doc(db, "negocios", user.uid, "productos", productId))

      toast({
        title: "PRODUCTO ELIMINADO",
        description: "El producto ha sido removido del catálogo.",
      })
    } catch (error) {
      console.error("Error al eliminar producto:", error)

      toast({
        title: "ERROR",
        description: "No se pudo eliminar el producto.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsAddOpen(true)
  }

  const handleOpenNewProduct = () => {
    setEditingProduct(undefined)
    setIsAddOpen(true)
  }

  const handleCloseAddDialog = () => {
    setIsAddOpen(false)
    setEditingProduct(undefined)
  }

  if (isUserLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f4f4f5] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="font-black uppercase italic tracking-tighter">
          Sincronizando Catálogo...
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-[#f8f9fa] min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-primary" />
          </div>

          <div>
            <h1 className="text-4xl font-black tracking-tighter text-black uppercase italic leading-none">
              Catálogo de <span className="text-primary">Productos</span>
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              Gestión de inventario y precios maestros.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsImportOpen(true)}
            className="h-14 border-2 border-black font-black uppercase tracking-tighter rounded-xl hover:bg-black hover:text-white transition-all"
          >
            <FileUp className="w-5 h-5 mr-2" />
            Importar CSV
          </Button>

          <Button
            size="lg"
            onClick={handleOpenNewProduct}
            className="h-14 bg-primary text-black font-black uppercase tracking-tighter rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all px-8"
          >
            <Plus className="w-6 h-6 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />

          <Input
            placeholder="Buscar por producto, código, marca, unidad, precio o stock..."
            className="pl-12 h-14 border-2 border-muted focus:border-primary text-lg rounded-xl shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button
          variant="outline"
          className="h-14 px-6 border-2 border-black font-bold uppercase tracking-tighter rounded-xl flex items-center gap-2"
        >
          <Filter className="w-5 h-5" />
          Filtros
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-none overflow-hidden">
        <Table>
          <TableHeader className="bg-black">
            <TableRow className="hover:bg-black border-none">
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14 w-[120px]">
                Código
              </TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">
                Producto
              </TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">
                Marca
              </TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">
                Precio Venta
              </TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">
                Stock
              </TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">
                Estado
              </TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14 text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow
                key={product.id}
                className="hover:bg-primary/5 border-border/50"
              >
                <TableCell className="font-black text-black italic">
                  <Badge
                    variant="outline"
                    className="border-black/10 font-black px-2 py-0.5 rounded text-[10px]"
                  >
                    {product.codigo}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-black text-black uppercase text-sm">
                      {product.nombre}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                      Unidad: {product.unidad}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="font-bold text-muted-foreground uppercase text-xs">
                  {product.marca}
                </TableCell>

                <TableCell className="font-black text-lg text-black">
                  ${Number(product.precioVenta || 0).toFixed(2)}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-black text-lg",
                        Number(product.stockActual || 0) <=
                          Number(product.stockMinimo || 0)
                          ? "text-red-600"
                          : "text-black"
                      )}
                    >
                      {product.stockActual}
                    </span>

                    {Number(product.stockActual || 0) <=
                      Number(product.stockMinimo || 0) && (
                      <AlertCircle className="w-4 h-4 text-red-600 animate-pulse" />
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    className={cn(
                      "font-black text-[9px] uppercase px-3",
                      product.activo
                        ? "bg-green-500"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {product.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 hover:bg-primary hover:text-black rounded-lg"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-xl border-2 border-black"
                    >
                      <DropdownMenuLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                        Opciones
                      </DropdownMenuLabel>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => handleEdit(product)}
                        className="flex items-center gap-2 font-bold cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                        Editar Producto
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => handleDelete(product.id)}
                        className="flex items-center gap-2 text-red-600 font-bold cursor-pointer hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredProducts.length === 0 && !isLoading && (
          <div className="p-20 text-center flex flex-col items-center gap-4 text-muted-foreground bg-white">
            <Package className="w-20 h-20 opacity-10" />
            <p className="font-black uppercase italic tracking-tighter text-xl">
              Sin resultados en el catálogo
            </p>
            <p className="text-xs font-bold uppercase">
              Añade productos manualmente o mediante importación masiva.
            </p>
          </div>
        )}
      </div>

      <AddProductDialog
        isOpen={isAddOpen}
        onClose={handleCloseAddDialog}
        productToEdit={editingProduct}
      />

      <ImportProductsDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </div>
  )
}