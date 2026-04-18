"use client"

import { useState } from "react"
import { Plus, Search, Filter, Edit, Trash2, MoreHorizontal, Package } from "lucide-react"
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

const MOCK_PRODUCTS: Product[] = [
  { id: "1", ownerId: "1", name: "Martillo 16oz", code: "M-001", categoryId: "1", brand: "Truper", salePrice: 150.00, costPrice: 90.00, stock: 15, minStock: 5, unit: "pza", active: true, createdAt: new Date() },
  { id: "2", ownerId: "1", name: "Cinta Canela 48mm x 50m", code: "C-002", categoryId: "2", brand: "Tuk", salePrice: 35.50, costPrice: 18.00, stock: 4, minStock: 10, unit: "pza", active: true, createdAt: new Date() },
  { id: "3", ownerId: "1", name: "Pintura Vinílica Blanca 19L", code: "P-003", categoryId: "3", brand: "Comex", salePrice: 1250.00, costPrice: 850.00, stock: 8, minStock: 2, unit: "cubeta", active: true, createdAt: new Date() },
  { id: "4", ownerId: "1", name: "Tubo PVC 1/2' 6m", code: "T-004", categoryId: "4", brand: "Generic", salePrice: 85.00, costPrice: 45.00, stock: 20, minStock: 5, unit: "tramo", active: true, createdAt: new Date() },
]

export default function ProductosPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Productos</h1>
          <p className="text-muted-foreground">Administra el inventario de tu ferretería.</p>
        </div>
        <Button size="lg" className="bg-primary text-white font-bold">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Buscar por nombre, código o marca..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px]">Código</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Precio Venta</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-bold">{product.code}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-xs text-muted-foreground">Unidad: {product.unit}</span>
                  </div>
                </TableCell>
                <TableCell>{product.brand}</TableCell>
                <TableCell className="font-bold text-primary">${product.salePrice.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-bold",
                      product.stock <= product.minStock ? "text-red-500" : "text-foreground"
                    )}>
                      {product.stock}
                    </span>
                    {product.stock <= product.minStock && (
                      <Badge variant="destructive" className="text-[10px] py-0 h-4">Bajo</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={product.active ? "default" : "outline"} className={product.active ? "bg-green-500" : ""}>
                    {product.active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Edit className="w-4 h-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Package className="w-4 h-4" /> Ver Historial
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex items-center gap-2 text-destructive">
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredProducts.length === 0 && (
          <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
            <Search className="w-12 h-12 opacity-20" />
            <p>No se encontraron productos con esos criterios.</p>
          </div>
        )}
      </div>
    </div>
  )
}

import { cn } from "@/lib/utils"
