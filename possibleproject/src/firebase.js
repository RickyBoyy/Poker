import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeRBQ7MytSlnZEsOoX3Pj_kgF68UxyDPE",
  authDomain: "deeppoker-57c10.firebaseapp.com",
  projectId: "deeppoker-57c10",
  storageBucket: "deeppoker-57c10.firebasestorage.app",
  messagingSenderId: "920118936898",
  appId: "1:920118936898:web:da32770300870ab4d234db",
  measurementId: "G-5RTHGPB0E8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 