import { db } from './firebase.js';
import { collection, addDoc } from "firebase/firestore"; 

try {
  const docRef = await addDoc(collection(db, "reports"), {
    username: "Ada",
    userID: "Lovelace",
    report: 1815
  });
  console.log("Document written with ID: ", docRef.id);
} catch (e) {
  console.error("Error adding document: ", e);
}