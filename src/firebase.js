// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Importar o Firestore

// ⚠️ Substitua por suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDQv3woI19GvQ_EjfxtqKtxl-D2EUvh6BI",
  authDomain: "taskzen-bbf10.firebaseapp.com",
  projectId: "taskzen-bbf10",
  storageBucket: "taskzen-bbf10.firebasestorage.app",
  messagingSenderId: "1054435009805",
  appId: "1:1054435009805:web:e629e84184664c2a487c44"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app); // Inicializa o Firestore

export const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};

export const logout = () => {
  return auth.signOut();
};

export { auth, db }; 
