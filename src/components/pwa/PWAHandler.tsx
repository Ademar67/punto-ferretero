'use client'

import { useEffect, useState } from 'react'

export default function PWAHandler() {
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null)
  const [showInstallBtn, setShowInstallBtn] = useState(false)

  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registrado'))
        .catch((err) => console.error('Error registrando SW:', err))
    }

    // Evento antes de instalar
    const handleBeforeInstall = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallBtn(true)
    }

    // Evento cuando ya se instaló
    const handleInstalled = () => {
      console.log('App instalada')
      setShowInstallBtn(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)

    // Cleanup (muy importante)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('Usuario aceptó instalación')
      setDeferredPrompt(null)
      setShowInstallBtn(false)
    } else {
      console.log('Usuario canceló instalación')
    }
  }

  // Si no hay botón, no renderiza nada
  if (!showInstallBtn) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-5">
      <button
        onClick={handleInstall}
        className="bg-[#FFD600] text-black px-5 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 hover:bg-yellow-400 transition-colors"
      >
        <span className="text-xl font-black">+</span>
        Instalar Punto Ferretero
      </button>
    </div>
  )
}