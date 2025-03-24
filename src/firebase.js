import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDPoBiZQKlNaQjcEb6_FqcE7c7nvZJA2PE",
  authDomain: "goal-minder-a42b0.firebaseapp.com",
  projectId: "goal-minder-a42b0",
  storageBucket: "goal-minder-a42b0.appspot.com",
  messagingSenderId: "481800450835",
  appId: "1:481800450835:web:e4d19cf5ef26d1d9bde0e6",
};

// ✅ Init services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ Google Sign In
export const signIn = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider)
    .then((result) => {
      console.log("✅ Google sign-in:", result.user.displayName);
    })
    .catch((error) => {
      console.error("❌ Google sign-in error:", error);
    });
};

// ✅ Sign Out
export const signOutUser = () => signOut(auth);

// ✅ Phone Auth Setup
export const setUpRecaptcha = (phoneNumber, containerId) => {
  const recaptcha = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: (response) => {
      console.log("✅ reCAPTCHA verified");
    },
    "expired-callback": () => {
      console.warn("⚠️ reCAPTCHA expired");
    },
  });

  return signInWithPhoneNumber(auth, phoneNumber, recaptcha);
};

// ✅ Load Goals from Firestore
export const loadGoals = async (uid) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().goals || [] : [];
  } catch (error) {
    console.error("❌ Error loading goals:", error);
    return [];
  }
};

// ✅ Save Goals to Firestore
export const saveGoals = async (uid, goals) => {
  try {
    await setDoc(doc(db, "users", uid), { goals });
  } catch (error) {
    console.error("❌ Error saving goals:", error);
  }
};
