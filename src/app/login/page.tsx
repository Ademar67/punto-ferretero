import { Hammer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f4f5] p-4">
      <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden bg-white rounded-3xl">
        <div className="bg-black py-10 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg rotate-3">
            <Hammer className="w-8 h-8 text-black -rotate-3" />
          </div>
          <div className="text-center">
            <h1 className="font-black text-3xl text-white tracking-tighter italic uppercase leading-none">
              PUNTO <span className="text-primary">FERRETERO</span>
            </h1>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-1">Acceso al Sistema</p>
          </div>
        </div>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-black text-[10px] uppercase tracking-widest text-black">Correo Electrónico</Label>
              <Input id="email" type="email" placeholder="admin@puntoferretero.com" className="h-12 border-2 focus:border-primary rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-black text-[10px] uppercase tracking-widest text-black">Contraseña</Label>
                <Link href="#" className="text-[10px] font-bold text-muted-foreground hover:text-primary uppercase tracking-tighter">¿Olvidaste tu contraseña?</Link>
              </div>
              <Input id="password" type="password" className="h-12 border-2 focus:border-primary rounded-xl" />
            </div>
          </div>
          <Button asChild className="w-full h-14 bg-primary hover:bg-primary/90 text-black font-black text-lg rounded-xl shadow-lg shadow-primary/20">
            <Link href="/dashboard">INGRESAR AL PANEL</Link>
          </Button>
          <p className="text-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
            © 2024 PUNTO FERRETERO. TODOS LOS DERECHOS RESERVADOS.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
