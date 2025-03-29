// firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDPoBiZQKlNaQjcEb6_FqcE7c7nvZJA2PE",
  authDomain: "goal-minder-a42b0.firebaseapp.com",
  projectId: "goal-minder-a42b0",
  storageBucket: "goal-minder-a42b0.appspot.com",
  messagingSenderId: "481800450835",
  appId: "1:481800450835:web:e4d19cf5ef26d1d9bde0e6",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Auth Service
export const auth = getAuth(app);

// ✅ Firestore Service
export const db = getFirestore(app);

// ✅ Google Sign-In
export const signIn = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider)
    .then((result) => {
      console.log("✅ Signed in:", result.user.displayName);
      return result.user;
    })
    .catch((error) => {
      console.error("❌ Sign-in error:", error);
      throw error;
    });
};

// ✅ Sign Out
export const signOutUser = () => signOut(auth);

// ✅ Phone Auth
export const setUpRecaptcha = (phoneNumber, containerId) => {
  const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
  });

  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};

// ✅ Firestore: Load Goals
export const loadGoals = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().goals || [] : [];
};

// ✅ Firestore: Save Goals
export const saveGoals = async (uid, goals) => {
  await setDoc(doc(db, "users", uid), { goals });
};

// ✅ Messaging Service (conditional init)
let messaging;

isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);

    onMessage(messaging, (payload) => {
      console.log("🔔 Foreground notification received:", payload);
    });
  } else {
    console.warn("⚠️ Firebase messaging not supported in this environment.");
  }
});

// ✅ Request Notification Permission and get FCM Token
export const requestNotificationPermission = async () => {
  if (!messaging) {
    console.warn("⚠️ Messaging not initialized");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "PrQbl3Jy1QI848iMWAmyBjf0xVm_tRPuoTYwRXIpr10",
      });
      console.log("🔥 FCM Token:", token);
      return token;
    } else {
      console.log("🔕 Notification permission denied");
    }
  } catch (error) {
    console.error("❌ Error getting FCM token:", error);
  }
};
