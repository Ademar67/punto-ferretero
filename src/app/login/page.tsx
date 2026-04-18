"use client"

import { useState, useEffect } from "react"
import { Hammer, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth, useUser } from "@/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const auth = useAuth()
  const { user, isUserLoading } = useUser()
  const router = useRouter()

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user && !isUserLoading) {
      router.push("/dashboard")
    }
  }, [user, isUserLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsSubmitting(true)
    setError(null)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)
      let message = "Error al iniciar sesión. Verifica tus credenciales."
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        message = "Correo o contraseña incorrectos."
      } else if (err.code === "auth/invalid-email") {
        message = "El formato del correo no es válido."
      }
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isUserLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f4f5]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f4f5] p-4 font-body">
      <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden bg-white rounded-3xl">
        <div className="bg-black py-10 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg rotate-3 border-4 border-black">
            <Hammer className="w-8 h-8 text-black -rotate-3" />
          </div>
          <div className="text-center">
            <h1 className="font-black text-3xl text-white tracking-tighter italic uppercase leading-none">
              PUNTO <span className="text-primary">FERRETERO</span>
            </h1>
            <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Acceso a Terminal</p>
          </div>
        </div>
        <CardContent className="p-10 space-y-8">
          {error && (
            <Alert variant="destructive" className="rounded-xl border-2 bg-red-50 text-red-900 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-bold text-xs uppercase tracking-tight">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-black text-[10px] uppercase tracking-widest text-black/40 italic">ID de Operador (Email)</Label>
              <Input 
                id="email" 
                type="email" 
                required
                placeholder="admin@puntoferretero.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 border-4 border-muted focus-visible:ring-primary focus-visible:border-black rounded-2xl text-lg font-bold" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-black text-[10px] uppercase tracking-widest text-black/40 italic">Clave de Acceso</Label>
                <Link href="#" className="text-[9px] font-black text-muted-foreground hover:text-primary uppercase tracking-widest">¿Olvidaste tu clave?</Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 border-4 border-muted focus-visible:ring-primary focus-visible:border-black rounded-2xl text-lg font-bold" 
              />
            </div>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full h-16 bg-primary hover:bg-black hover:text-primary text-black font-black text-xl rounded-2xl shadow-xl shadow-primary/10 transition-all active:scale-95"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "ACCEDER AL PANEL"}
            </Button>
          </form>

          <div className="pt-4 border-t border-dashed border-muted text-center space-y-4">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              ¿No tienes cuenta? <Link href="/register" className="text-black font-black hover:text-primary underline underline-offset-4">Regístrate gratis</Link>
            </p>
             <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.4em]">
              © 2026 PUNTO FERRETERO • SISTEMA DE CONTROL
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
