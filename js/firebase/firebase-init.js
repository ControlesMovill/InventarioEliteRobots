/*
 * Inicialización Firebase modular (plantilla de Etapa 2).
 * Aún no está conectada a la interfaz de producción: primero se crea el proyecto
 * y se reemplaza firebase-config.example.js con los valores reales.
 *
 * Se sirve mediante un servidor web local (por ejemplo, Firebase Hosting),
 * no abriendo index.html como file://.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  writeBatch
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

import { firebaseConfig } from "../../firebase/firebase-config.js";

const isConfigured =
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "TU_PROJECT_ID" &&
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "PEGA_AQUI_API_KEY";

if (!isConfigured) {
  throw new Error(
    "Firebase aún no está configurado. Copia firebase/firebase-config.example.js " +
    "como firebase/firebase-config.js y agrega los datos de Firebase Console."
  );
}

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

export const authApi = {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
};

export const firestoreApi = {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, serverTimestamp, runTransaction, writeBatch
};

export const storageApi = {
  ref, uploadBytes, getDownloadURL, deleteObject
};
