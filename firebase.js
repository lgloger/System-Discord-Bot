import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC88fneTVPSIOIPuRS0I_7aslzOLqLLXhI",
  authDomain: "knex-b5a6d.firebaseapp.com",
  projectId: "knex-b5a6d",
  storageBucket: "knex-b5a6d.appspot.com",
  messagingSenderId: "943822948858",
  appId: "1:943822948858:web:9b22beb5c2a4b799fe3c43",
  measurementId: "G-TEXT1NZER3",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);