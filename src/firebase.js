// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDPoBiZQK1NaQjcEb6_FqcE7c7nvZJA2PE",
  authDomain: "goal-minder-a42b0.firebaseapp.com",
  projectId: "goal-minder-a42b0",
  storageBucket: "goal-minder-a42b0.appspot.com",
  messagingSenderId: "481080450835",
  appId: "1:481080450835:web:e4d19cf5ef26d1d9bde0e6"
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
