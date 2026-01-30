import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBfj0vfbOdHbWLKXwFBXZNZlUycRXH73KY",
    authDomain: "citypulse-b5580.firebaseapp.com",
    projectId: "citypulse-b5580",
    storageBucket: "citypulse-b5580.firebasestorage.app",
    messagingSenderId: "844904575146",
    appId: "1:844904575146:web:008238c434d9773060e0d3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
