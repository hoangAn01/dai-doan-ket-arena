import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

export const FIREBASE_DB_URL =
  'https://hcm202-fdc2c-default-rtdb.asia-southeast1.firebasedatabase.app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyD7VB4OrIm779uJ7mDJbX8zSIoiCKM8Dg8',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'hcm202-fdc2c.firebaseapp.com',
  databaseURL: FIREBASE_DB_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'hcm202-fdc2c',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'hcm202-fdc2c.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '369373916770',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:369373916770:web:e98ff16ed19e496e71ab3b',
};

export const isFirebaseConfigured = true;

let dbInstance: Database | null = null;

export function getFirebaseDb(): Database | null {
  if (typeof window === 'undefined') return null;
  if (!dbInstance) {
    try {
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      // Luôn truyền trực tiếp FIREBASE_DB_URL vào getDatabase để đảm bảo 100% đúng region
      dbInstance = getDatabase(app, FIREBASE_DB_URL);
    } catch (err) {
      console.warn('Firebase init error:', err);
    }
  }
  return dbInstance;
}

// Khởi tạo instance ngay trên client
if (typeof window !== 'undefined') {
  getFirebaseDb();
}

export const db = typeof window !== 'undefined' ? getFirebaseDb() : null;
