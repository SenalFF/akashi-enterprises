import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc,
         onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBuEv0-cq4sY9b3Ua5FIXHFr3-zXJXhsFg",
  authDomain: "akashi-enterprises.firebaseapp.com",
  projectId: "akashi-enterprises",
  storageBucket: "akashi-enterprises.firebasestorage.app",
  messagingSenderId: "739680445280",
  appId: "1:739680445280:web:4a5842f7a0785f44fff405"
};

const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);

// ── Auth helpers ───────────────────────────────────────────────────────────────
export const loginUser  = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logoutUser = () => signOut(auth);
export const onAuth     = (cb) => onAuthStateChanged(auth, cb);

// ── Firestore helpers ──────────────────────────────────────────────────────────
export const addDocument    = (col, data)     => addDoc(collection(db, col), { ...data, createdAt: serverTimestamp() });
export const updateDocument = (col, id, data) => updateDoc(doc(db, col, id), data);
export const deleteDocument = (col, id)       => deleteDoc(doc(db, col, id));

// Live listener — calls cb(docs[]) whenever collection changes
export const listenCollection = (col, cb) => {
  const q = query(collection(db, col), orderBy("createdAt", "asc"));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
};
