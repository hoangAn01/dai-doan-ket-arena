import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';

let rawDbUrl =
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
  'https://hcm202-fdc2c-default-rtdb.asia-southeast1.firebasedatabase.app';

// Đảm bảo luôn sử dụng region asia-southeast1 đúng của project hcm202-fdc2c
if (rawDbUrl.includes('firebaseio.com')) {
  rawDbUrl = 'https://hcm202-fdc2c-default-rtdb.asia-southeast1.firebasedatabase.app';
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyD7VB4OrIm779uJ7mDJbX8zSIoiCKM8Dg8',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'hcm202-fdc2c.firebaseapp.com',
  databaseURL: rawDbUrl,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'hcm202-fdc2c',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'hcm202-fdc2c.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '369373916770',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:369373916770:web:e98ff16ed19e496e71ab3b',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.databaseURL
);

let dbInstance: Database | null = null;

export function getFirebaseDb(): Database | null {
  if (typeof window === 'undefined' || !isFirebaseConfigured) return null;
  if (!dbInstance) {
    try {
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      dbInstance = getDatabase(app);

      // Đăng nhập vô danh nếu được hỗ trợ
      try {
        const auth = getAuth(app);
        if (!auth.currentUser) {
          signInAnonymously(auth).catch(() => {});
        }
      } catch {}
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
