
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Hammer } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  isLoading: boolean;
}

export function SplashScreen({ isLoading }: SplashScreenProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 800); // Pequeño delay extra para suavizar la salida
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden"
        >
          {/* Fondo sutil con gradiente industrial */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,214,0,0.05)_0%,rgba(0,0,0,1)_70%)]" />
          
          <div className="relative flex flex-col items-center gap-8">
            {/* Logo Animado */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotate: 0,
                transition: { duration: 1, ease: "easeOut" }
              }}
              className="relative"
            >
              <div className="w-32 h-32 rounded-[2.5rem] bg-primary flex items-center justify-center shadow-[0_0_50px_rgba(255,214,0,0.3)] border-4 border-black rotate-3">
                <Hammer className="w-16 h-16 text-black -rotate-3" />
              </div>
              
              {/* Brillo sutil pulsante */}
              <motion.div
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-primary/20 blur-3xl -z-10 rounded-full"
              />
            </motion.div>

            {/* Texto de Marca */}
            <div className="text-center space-y-3">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ 
                  y: 0, 
                  opacity: 1,
                  transition: { delay: 0.4, duration: 0.8 }
                }}
                className="flex flex-col"
              >
                <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
                  PUNTO <span className="text-primary">FERRETERO</span>
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { delay: 1, duration: 1 }
                }}
                className="flex flex-col items-center gap-4"
              >
                <div className="h-[2px] w-12 bg-primary/40 rounded-full" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 italic">
                  Sistema de Control Empresarial
                </p>
              </motion.div>
            </div>

            {/* Indicador de Carga Premium */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: 120,
                transition: { delay: 0.2, duration: 2, ease: "easeInOut" }
              }}
              className="h-1 bg-primary/20 rounded-full overflow-hidden absolute -bottom-24"
            >
              <motion.div 
                animate={{ x: [-120, 120] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="h-full w-20 bg-primary shadow-[0_0_15px_rgba(255,214,0,0.8)]"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
