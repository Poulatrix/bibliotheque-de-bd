import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDItjDw2zBQYcLc-vrjpP2bNRWYCCGfwDk",
  authDomain: "bibliotheque-3593a.firebaseapp.com",
  projectId: "bibliotheque-3593a",
  storageBucket: "bibliotheque-3593a.firebasestorage.app",
  messagingSenderId: "89008943456",
  appId: "1:89008943456:web:22cafbbfb0c05ff533ae05"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);