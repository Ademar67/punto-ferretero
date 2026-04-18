
'use client';

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Retrasar inicialización para asegurar que el DOM esté listo
      const timer = setTimeout(() => {
        scannerRef.current = new Html5QrcodeScanner(
          'reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
            ],
          },
          /* verbose= */ false
        );

        scannerRef.current.render(
          (decodedText) => {
            onScan(decodedText);
            stopScanner();
          },
          (errorMessage) => {
            // Ignorar errores de escaneo continuo
          }
        );
      }, 300);

      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    }
  }, [isOpen]);

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch((error) => console.error('Failed to clear scanner', error));
      scannerRef.current = null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-4 border-black rounded-[2rem] overflow-hidden p-0 font-body">
        <DialogHeader className="bg-black text-white p-6">
          <div className="flex items-center gap-3">
            <Camera className="text-primary w-6 h-6" />
            <DialogTitle className="text-xl font-black italic uppercase">Escáner de Cámara</DialogTitle>
          </div>
        </DialogHeader>
        <div className="p-6">
          <div id="reader" className="w-full overflow-hidden rounded-2xl border-2 border-muted"></div>
          <p className="text-center text-[10px] font-black uppercase text-muted-foreground mt-4 tracking-widest italic">
            Coloca el código de barras frente a la cámara
          </p>
        </div>
        <div className="p-6 bg-muted/30 border-t flex justify-center">
          <Button onClick={onClose} variant="ghost" className="font-black uppercase tracking-widest text-xs h-12 rounded-xl">
            Cerrar Cámara
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
