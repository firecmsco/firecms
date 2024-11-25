import { initializeApp } from "firebase/app";

export function initializeFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyAulQXBeSUBbqgtlf14DMXKeDTT5c5J1wg",
        authDomain: "toleroo-prod.firebaseapp.com",
        projectId: "toleroo-prod",
        storageBucket: "toleroo-prod.appspot.com",
        messagingSenderId: "831669522753",
        appId: "1:831669522753:web:52f899ffe6fd3d0d65d1c0",
        measurementId: "G-2S9TE0L9V7"
    };

    // Initialize Firebase
    return initializeApp(firebaseConfig);

}

export const firebase = initializeFirebase();
