
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { 
  getFirestore, 
  enableIndexedDbPersistence 
} from "firebase/firestore";

// Production Firebase configuration provided in the deployment spec
const firebaseConfig = {
  apiKey: "AIzaSyD1cDDTr77HTe9JjlZ3ipOva4zZUXu2bww",
  authDomain: "assistente-de-inves.firebaseapp.com",
  projectId: "assistente-de-inves",
  storageBucket: "assistente-de-inves.firebasestorage.app",
  messagingSenderId: "188424493146",
  appId: "1:188424493146:web:77fa85afe3c809d8312063",
  measurementId: "G-WFJZR9GCBF"
};

// Initialize Firebase with persistent cache for the "Offline Terminal" requirement
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence for institutional availability
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Firestore Persistence failed: multiple tabs open.");
    } else if (err.code === 'unimplemented') {
      console.warn("Firestore Persistence is not supported by this browser.");
    }
  });
} catch (e) {
  console.error("Firebase persistence initialization failed", e);
}

export { auth, db, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged };
export type { User };
