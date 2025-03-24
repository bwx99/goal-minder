// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MSG_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

export const signIn = () => signInWithPopup(auth, provider);
export const signOutUser = () => signOut(auth);

export const loadGoals = async (uid) => {
  const docRef = doc(db, 'goals', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().goals : [];
};

export const saveGoals = async (uid, goals) => {
  await setDoc(doc(db, 'goals', uid), { goals });
};
