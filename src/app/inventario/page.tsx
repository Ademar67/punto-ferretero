"use client"

import { Plus, Minus, History, Package, Loader2, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import {
  query,
  collection,
  orderBy,
  limit,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import { InventoryMovement } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function InventarioPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const movementsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null

    return query(
      collection(db, "negocios", user.uid, "movimientosInventario"),
      orderBy("date", "desc"),
      limit(100)
    )
  }, [db, user?.uid])

  const { data: movementsRaw, isLoading } =
    useCollection<InventoryMovement>(movementsQuery)

  const movements = (movementsRaw || []).filter((mv: any) => mv.activo !== false)

  const handleDeleteMovimiento = async (id: string) => {
    if (!db || !user?.uid) return

    if (!confirm("¿Ocultar este movimiento de la bitácora?")) return

    try {
      await updateDoc(
        doc(db, "negocios", user.uid, "movimientosInventario", id),
        {
          activo: false,
          deletedAt: serverTimestamp(),
          deletedByUserId: user.uid,
          deletedByUserEmail: user.email ?? "",
        }
      )

      toast({
        title: "MOVIMIENTO OCULTADO",
        description: "El movimiento ya no aparecerá en la bitácora.",
        className: "bg-black text-primary border-primary border-2 font-black",
      })
    } catch (error) {
      console.error("Error al ocultar movimiento:", error)

      toast({
        title: "ERROR",
        description: "No se pudo ocultar el movimiento.",
        variant: "destructive",
      })
    }
  }

  if (isUserLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F5F5F5] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="font-black uppercase italic tracking-tighter">
          Cargando Historial...
        </p>
      </div>
    )
  }

  const todayMovements =
    movements.filter((m) => {
      const d = m.date?.seconds ? new Date(m.date.seconds * 1000) : new Date()
      return d.toDateString() === new Date().toDateString()
    }).length || 0

  const entradasMes =
    movements
      .filter((m) => m.type === "entrada")
      .reduce((acc, m) => acc + Number(m.quantity || 0), 0) || 0

  const salidasVentas =
    movements
      .filter((m) => m.type === "salida" || m.type === "venta")
      .reduce((acc, m) => acc + Number(m.quantity || 0), 0) || 0

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-[#f8f9fa] min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-primary" />
          </div>

          <div>
            <h1 className="text-4xl font-black tracking-tighter text-black uppercase italic leading-none">
              Control de <span className="text-primary">Inventario</span>
            </h1>
            <p className="text-muted-foreground font-medium">
              Gestión de entradas, salidas y bitácora de movimientos.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            asChild
            size="lg"
            className="h-14 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-tighter rounded-xl shadow-lg"
          >
            <Link href="/inventario/entrada">
              <Plus className="w-5 h-5 mr-2" /> Entrada Rápida
            </Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-14 border-2 border-red-600 text-red-600 hover:bg-red-50 font-black uppercase tracking-tighter rounded-xl"
          >
            <Minus className="w-5 h-5 mr-2" /> Registrar Salida
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2 bg-primary/5">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Movimientos Hoy
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black tracking-tight">
              {todayMovements}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2 bg-green-50">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-green-600">
              Entradas del Mes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black tracking-tight text-green-600">
              +{entradasMes}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2 bg-red-50">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-red-600">
              Salidas / Ventas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black tracking-tight text-red-600">
              {salidasVentas}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Bitácora de Auditoría
        </h2>

        <div className="bg-white rounded-2xl shadow-xl border-none overflow-hidden">
          <Table>
            <TableHeader className="bg-black">
              <TableRow className="hover:bg-black border-none">
                <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">
                  Fecha / Hora
                </TableHead>
                <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">
                  Producto
                </TableHead>
                <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">
                  Tipo
                </TableHead>
                <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">
                  Cantidad
                </TableHead>
                <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">
                  Motivo
                </TableHead>
                <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14">
                  Usuario
                </TableHead>
                <TableHead className="text-white font-black uppercase text-[10px] tracking-widest h-14 text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {movements.map((mv: any) => (
                <TableRow
                  key={mv.id}
                  className="hover:bg-primary/5 border-border/50"
                >
                  <TableCell className="text-[11px] font-bold">
                    {mv.date?.seconds
                      ? format(new Date(mv.date.seconds * 1000), "dd MMM, HH:mm", {
                          locale: es,
                        })
                      : "..."}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-black text-black uppercase text-xs">
                        {mv.productName}
                      </span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">
                        {mv.codigo}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={cn(
                        "font-black uppercase text-[9px] px-2",
                        mv.type === "entrada"
                          ? "bg-green-500"
                          : mv.type === "salida"
                            ? "bg-red-500"
                            : mv.type === "venta"
                              ? "bg-blue-500"
                              : "bg-orange-500"
                      )}
                    >
                      {mv.type}
                    </Badge>
                  </TableCell>

                  <TableCell
                    className={cn(
                      "font-black text-lg",
                      mv.type === "entrada" ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {mv.type === "entrada"
                      ? `+${Number(mv.quantity || 0)}`
                      : `-${Number(mv.quantity || 0)}`}
                  </TableCell>

                  <TableCell className="text-[10px] font-medium text-muted-foreground italic max-w-[200px] truncate">
                    {mv.reason}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-black/10 font-black text-[9px] uppercase"
                    >
                      {mv.userEmail?.split("@")[0]}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-red-600 hover:text-white rounded-lg"
                      onClick={() => handleDeleteMovimiento(mv.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {movements.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4 text-muted-foreground">
              <History className="w-16 h-16 opacity-10" />
              <p className="font-black uppercase italic tracking-tighter">
                Sin movimientos registrados
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}