import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBfe7hrAKoHzwIJHoVg7JDrceqD-awPIBs",
  authDomain: "ai-interior-designer-b4c-30541.firebaseapp.com",
  projectId: "ai-interior-designer-b4c-30541",
  storageBucket: "ai-interior-designer-b4c-30541.firebasestorage.app",
  messagingSenderId: "61735218275",
  appId: "1:61735218275:web:454a6517e6a7553f3a1c56",
  measurementId: "G-2GCFED09WT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();