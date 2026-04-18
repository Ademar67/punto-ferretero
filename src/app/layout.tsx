
'use client';

import { useEffect, useState } from 'react';
import './globals.css';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider, useUser } from '@/firebase';
import { SplashScreen } from '@/components/layout/splash-screen';

function AppContent({ children }: { children: React.ReactNode }) {
  const { isUserLoading } = useUser();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Garantizamos que el splash se muestre al menos 2.2 segundos para el efecto premium
    const timer = setTimeout(() => {
      if (!isUserLoading) {
        setInitialLoading(false);
      }
    }, 2200);

    if (!isUserLoading) {
      // Si Firebase ya cargó, pero el timer no ha terminado, el useEffect del timer mandará
    } else {
      setInitialLoading(true);
    }

    return () => clearTimeout(timer);
  }, [isUserLoading]);

  return (
    <>
      <SplashScreen isLoading={initialLoading} />
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <SidebarNav />
          <SidebarInset>
            <main className="flex-1 w-full overflow-y-auto">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AppContent>
            {children}
          </AppContent>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
