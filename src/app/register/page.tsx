"use client"

import { useState, useEffect } from "react"
import { Hammer, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth, useUser, useFirestore } from "@/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const auth = useAuth()
  const db = useFirestore()
  const { user, isUserLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push("/dashboard")
    }
  }, [user, isUserLoading, router])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !fullName || !businessName) {
      setError("Todos los campos son obligatorios.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid

      // 2. Crear perfil de usuario en Firestore (siguiendo backend.json)
      const userDocRef = doc(db, "usuarios", uid)
      const userData = {
        id: uid,
        nombre: fullName,
        email: email,
        rol: "admin",
        ownerId: uid,
        ownerEmail: email,
        createdAt: serverTimestamp()
      }

      setDoc(userDocRef, userData)
        .catch(async (err) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'create',
            requestResourceData: userData
          }))
        })

      // 3. Crear configuración inicial del negocio (siguiendo backend.json)
      const configDocRef = doc(db, "configuracionNegocio", uid)
      const configData = {
        id: uid,
        nombreNegocio: businessName,
        telefono: "",
        direccion: "",
        folioActualVenta: 0,
        impuestosActivos: true,
        porcentajeImpuesto: 16,
        moneda: "MXN",
        formatoFecha: "DD/MM/YYYY",
        ownerId: uid,
        ownerEmail: email,
        createdAt: serverTimestamp()
      }

      setDoc(configDocRef, configData)
        .catch(async (err) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: configDocRef.path,
            operation: 'create',
            requestResourceData: configData
          }))
        })

      // Redirigir al dashboard
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Registration error:", err)
      let message = "Error al crear la cuenta. Inténtalo de nuevo."
      if (err.code === "auth/email-already-in-use") {
        message = "Este correo electrónico ya está registrado."
      } else if (err.code === "auth/weak-password") {
        message = "La contraseña debe tener al menos 6 caracteres."
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
      <Card className="w-full max-w-lg border-none shadow-2xl overflow-hidden bg-white rounded-3xl">
        <div className="bg-black py-10 flex flex-col items-center justify-center gap-4 relative">
          <Link href="/login" className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-primary transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg rotate-3 border-4 border-black">
            <Hammer className="w-8 h-8 text-black -rotate-3" />
          </div>
          <div className="text-center">
            <h1 className="font-black text-3xl text-white tracking-tighter italic uppercase leading-none">
              NUEVO <span className="text-primary">REGISTRO</span>
            </h1>
            <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Crea tu cuenta de Administrador</p>
          </div>
        </div>
        <CardContent className="p-10 space-y-6">
          {error && (
            <Alert variant="destructive" className="rounded-xl border-2 bg-red-50 text-red-900 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-bold text-xs uppercase tracking-tight">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="font-black text-[10px] uppercase tracking-widest text-black/40 italic">Nombre Completo</Label>
                <Input 
                  id="fullName" 
                  placeholder="Ej. Juan Pérez" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 border-4 border-muted focus-visible:ring-primary focus-visible:border-black rounded-xl font-bold" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName" className="font-black text-[10px] uppercase tracking-widest text-black/40 italic">Nombre del Negocio</Label>
                <Input 
                  id="businessName" 
                  placeholder="Ej. Ferretería El Rayo" 
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-12 border-4 border-muted focus-visible:ring-primary focus-visible:border-black rounded-xl font-bold" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-black text-[10px] uppercase tracking-widest text-black/40 italic">Correo Electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                required
                placeholder="admin@tunegocio.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-4 border-muted focus-visible:ring-primary focus-visible:border-black rounded-xl font-bold" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-black text-[10px] uppercase tracking-widest text-black/40 italic">Contraseña (Mín. 6 caracteres)</Label>
              <Input 
                id="password" 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-4 border-muted focus-visible:ring-primary focus-visible:border-black rounded-xl font-bold" 
              />
            </div>

            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-primary hover:bg-black hover:text-primary text-black font-black text-lg rounded-xl shadow-xl shadow-primary/10 transition-all active:scale-95 mt-4"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "CREAR MI CUENTA"}
            </Button>
          </form>

          <div className="pt-4 border-t border-dashed border-muted text-center">
             <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              ¿Ya tienes una cuenta? <Link href="/login" className="text-black font-black hover:text-primary underline underline-offset-4">Inicia Sesión</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
