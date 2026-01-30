// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfj0vfbOdHbWLKXwFBXZNZlUycRXH73KY",
  authDomain: "citypulse-b5580.firebaseapp.com",
  projectId: "citypulse-b5580",
  storageBucket: "citypulse-b5580.firebasestorage.app",
  messagingSenderId: "844904575146",
  appId: "1:844904575146:web:008238c434d9773060e0d3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };
