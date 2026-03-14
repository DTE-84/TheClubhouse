import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; 
import { firebaseConfig } from "./firebaseConfig";


let app;
if (typeof window !== "undefined") {
 
  import { getApps } from "firebase/app";
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
} else {
 
  app = initializeApp(firebaseConfig);
}


export const db   = getFirestore(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
