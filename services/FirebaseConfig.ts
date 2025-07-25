// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAPQ3QERybrhPS2sXlfx95tiD8r7Taf-iw",
  authDomain: "clique-c4bf4.firebaseapp.com",
  databaseURL:
    "https://clique-c4bf4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "clique-c4bf4",
  storageBucket: "clique-c4bf4.appspot.com",
  messagingSenderId: "145051601496",
  appId: "1:145051601496:web:c3e692272cd74b67fd182d",
  measurementId: "G-7B23X52T0T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
