
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
      // Mantenemos la pantalla un poco más para que la animación se aprecie
      const timer = setTimeout(() => {
        setShow(false);
      }, 800); 
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
          {/* Fondo con gradiente radial industrial sutil */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,214,0,0.08)_0%,rgba(0,0,0,1)_75%)]" />
          
          <div className="relative flex flex-col items-center gap-8">
            {/* Contenedor del Logo con Elevación Visual */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, rotate: -5 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotate: 0,
                transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
              }}
              className="relative"
            >
              <div className="w-36 h-36 rounded-[2.5rem] bg-primary flex items-center justify-center shadow-[0_0_60px_rgba(255,214,0,0.25)] border-4 border-black rotate-3">
                <Hammer className="w-16 h-16 text-black -rotate-3" />
              </div>
              
              {/* Resplandor pulsante premium */}
              <motion.div
                animate={{ 
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-primary/20 blur-[60px] -z-10 rounded-full"
              />
            </motion.div>

            {/* Identidad de Marca */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ 
                  y: 0, 
                  opacity: 1,
                  transition: { delay: 0.5, duration: 0.8, ease: "easeOut" }
                }}
                className="flex flex-col"
              >
                <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
                  PUNTO <span className="text-primary">FERRETERO</span>
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, letterSpacing: "0.2em" }}
                animate={{ 
                  opacity: 1,
                  letterSpacing: "0.4em",
                  transition: { delay: 1.2, duration: 1.5, ease: "easeOut" }
                }}
                className="flex flex-col items-center gap-5"
              >
                <div className="h-[2px] w-16 bg-primary/30 rounded-full" />
                <p className="text-[10px] font-black uppercase text-white/40 italic">
                  Control Total • Negocio Premium
                </p>
              </motion.div>
            </div>

            {/* Indicador de Carga Minimalista */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: 140,
                opacity: 1,
                transition: { delay: 0.3, duration: 2.2, ease: "easeInOut" }
              }}
              className="h-[1px] bg-primary/20 rounded-full overflow-hidden absolute -bottom-24"
            >
              <motion.div 
                animate={{ x: [-140, 140] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="h-full w-24 bg-primary shadow-[0_0_10px_rgba(255,214,0,1)]"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
