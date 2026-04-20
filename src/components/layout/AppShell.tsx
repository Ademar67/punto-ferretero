'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { useUser } from '@/firebase';
import PWAInit from '@/components/pwa/PWAInit';

// Importación dinámica con SSR desactivado para evitar errores de hidratación
const SplashScreen = dynamic(
  () => import('@/components/layout/splash-screen').then((mod) => mod.SplashScreen),
  { ssr: false }
);

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isUserLoading } = useUser();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isUserLoading) {
        setInitialLoading(false);
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [isUserLoading]);

  return (
    <>
      <SplashScreen isLoading={initialLoading} />

      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <SidebarNav />
          <SidebarInset>
            <main className="flex-1 w-full overflow-y-auto">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>

      <PWAInit />
    </>
  );
}