'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

/**
 * Inicializa las instancias de Firebase utilizando la configuración centralizada.
 * Reutiliza la aplicación existente si ya ha sido inicializada (útil para Hot Reload).
 */
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;

  if (getApps().length > 0) {
    firebaseApp = getApp();
  } else {
    // CRITICAL FIX: Se utiliza el objeto de configuración importado desde config.ts
    // para asegurar que la API Key y otros parámetros sean válidos en el cliente.
    firebaseApp = initializeApp(firebaseConfig);
  }

  return getSdks(firebaseApp);
}

/**
 * Retorna los servicios de Firebase (Auth y Firestore) a partir de la app inicializada.
 */
export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}

// Re-exportación de componentes y hooks de Firebase para uso en toda la app
export * from './provider';
export * from './client-provider';
