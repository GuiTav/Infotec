import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyCVwajkk6o0Jv4U_aAboHCldn7wfta9iF0",
  authDomain: "infotec-6f759.firebaseapp.com",
  databaseURL: "https://infotec-6f759-default-rtdb.firebaseio.com",
  projectId: "infotec-6f759",
  storageBucket: "infotec-6f759.appspot.com",
  messagingSenderId: "512509922333",
  appId: "1:512509922333:web:2214e558e60c9b5af3caf4"
};

const app = initializeApp(firebaseConfig);
export default db = getDatabase();