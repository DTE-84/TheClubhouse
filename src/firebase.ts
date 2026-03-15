import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

if (!firebaseConfig.projectId) {
    console.error("Firebase Project ID is missing from env. Falling back to hardcoded config for system stability.");
    firebaseConfig.apiKey = "AIzaSyBhdyQSv15D1DohjCDZMwY5lq-JEurwUKg";
    firebaseConfig.authDomain = "theclubhouse-cf31f.firebaseapp.com";
    firebaseConfig.projectId = "theclubhouse-cf31f";
    firebaseConfig.storageBucket = "theclubhouse-cf31f.firebasestorage.app";
    firebaseConfig.messagingSenderId = "717259924552";
    firebaseConfig.appId = "1:717259924552:web:b5936b68b1549c800d647d";
    firebaseConfig.measurementId = "G-ETL5PRSF1K";
}

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, analytics };
export default app;
