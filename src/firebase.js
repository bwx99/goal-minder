// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc, // ✅ move getDoc up here
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPoBiZQKlNaQjcEb6_FqcE7c7nvZJA2PE",
  authDomain: "goal-minder-a42b0.firebaseapp.com",
  projectId: "goal-minder-a42b0",
  storageBucket: "goal-minder-a42b0.appspot.com", // ✅ fixed typo in domain
  messagingSenderId: "481800450835",
  appId: "1:481800450835:web:e4d19cf5ef26d1d9bde0e6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const signIn = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider)
    .then((result) => {
      console.log("✅ Logged in as:", result.user.displayName);
    })
    .catch((error) => {
      console.error("❌ Login error:", error);
    });
};

export const signOutUser = () => signOut(auth);

// Load goals from Firestore
export const loadGoals = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().goals || [] : [];
  } catch (error) {
    console.error("Error loading goals:", error);
    return [];
  }
};

// Save goals to Firestore
export const saveGoals = async (uid, goals) => {
  try {
    await setDoc(doc(db, 'users', uid), { goals });
  } catch (error) {
    console.error("Error saving goals:", error);
  }
};
