import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey="AIzaSyBhdyQSv15D1DohjCDZMwY5lq-JEurwUKg",
  authDomain="theclubhouse-cf31f.firebaseapp.com",
  projectId="theclubhouse-cf31f",
  storageBucket="theclubhouse-cf31f.appspot.com",
  messagingSenderId="717259924552",
  appId="1:717259924552:web:9b8b3b4c9b3b4c9b3b4c9b",
  measurementId="G-ETL5PRSF1K"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, analytics };
export default app;
