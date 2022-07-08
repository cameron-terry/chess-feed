import firebase from "firebase/app";
import "firebase/firestore";
require("firebase/functions");

const firebaseConfig = {
  apiKey: "AIzaSyDVReCEJViPZk4XyB_anrevqvHvhGATAOU",
  authDomain: "chess-analysis-3f2da.firebaseapp.com",
  projectId: "chess-analysis-3f2da",
  storageBucket: "chess-analysis-3f2da.appspot.com",
  messagingSenderId: "674723726643",
  appId: "1:674723726643:web:9d273b5fdb7e1da9e52a46",
  measurementId: "G-3DTCPMH3PJ",
};

export const fb = firebase.initializeApp(firebaseConfig);

// is our connection to the database
export const firestore = firebase.firestore();
