'use client';

import { useEffect, useState } from 'react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      setVisible(false);
    }

    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-6 right-6 z-50 bg-[#FFD600] text-black font-bold px-5 py-3 rounded-xl shadow-lg hover:scale-105 transition-all uppercase text-xs tracking-widest"
    >
      Instalar app
    </button>
  );
}