'use client'

import { useEffect } from 'react'

export default function PWAInit() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const registerSW = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js')
      } catch (error) {
        console.error('Error registrando Service Worker:', error)
      }
    }

    registerSW()
  }, [])

  return null
}