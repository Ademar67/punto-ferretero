import React from 'react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-[#FFD600] rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,214,0,0.3)]">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20"/><path d="m5 10 7-7 7 7"/><path d="M9 20v-6h6v6"/></svg>
      </div>
      <h1 className="text-[#FFD600] text-3xl font-black mb-2 uppercase tracking-tight">Sin conexión</h1>
      <p className="text-zinc-400 max-w-sm mb-8">
        Punto Ferretero requiere una conexión activa para sincronizar inventario y ventas. 
        Por favor, revisa tu internet.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="bg-[#FFD600] text-black font-bold px-8 py-3 rounded-lg hover:scale-105 transition-transform uppercase text-sm tracking-widest"
      >
        Reintentar ahora
      </button>
    </div>
  );
}