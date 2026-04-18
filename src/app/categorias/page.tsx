"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Tags } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Category } from "@/types"

const MOCK_CATEGORIES: Category[] = [
  { id: "1", ownerId: "1", name: "Herramienta Manual", active: true },
  { id: "2", ownerId: "1", name: "Adhesivos y Cintas", active: true },
  { id: "3", ownerId: "1", name: "Pinturas", active: true },
  { id: "4", ownerId: "1", name: "Plomería", active: true },
  { id: "5", ownerId: "1", name: "Eléctrico", active: true },
  { id: "6", ownerId: "1", name: "Tornillería", active: true },
]

export default function CategoriasPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filtered = MOCK_CATEGORIES.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground">Organiza tus productos por grupos.</p>
        </div>
        <Button size="lg" className="bg-primary text-white font-bold">
          <Plus className="w-5 h-5 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      <div className="relative">
        <Input 
          placeholder="Buscar categoría..." 
          className="max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((category) => (
          <Card key={category.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Tags className="w-6 h-6" />
                </div>
                <Badge variant={category.active ? "default" : "outline"} className={category.active ? "bg-green-500" : ""}>
                  {category.active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <h3 className="text-xl font-bold mb-6">{category.name}</h3>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" /> Editar
                </Button>
                <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-white">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
