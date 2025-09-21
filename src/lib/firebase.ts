
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "studio-7159561145-4d4e6",
  "appId": "1:606114237584:web:7516cb82b9a14e31605c15",
  "apiKey": "AIzaSyCRMBUQirMoUFIrFysTRgT-cBiV5h4qaEg",
  "authDomain": "studio-7159561145-4d4e6.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "606114237584"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
