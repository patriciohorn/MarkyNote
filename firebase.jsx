// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';

import { getFirestore, collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCZ9Ksh7KsEOI7DbE1F6aIJS4uuK3_HisM',
  authDomain: 'react-notes-8a0e6.firebaseapp.com',
  projectId: 'react-notes-8a0e6',
  storageBucket: 'react-notes-8a0e6.appspot.com',
  messagingSenderId: '157178706615',
  appId: '1:157178706615:web:2efd54d3802fa6eb646b32'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // return instance of db
export const notesCollection = collection(db, 'notes'); // I'm not using any other collection than notes collection. Export it so can use it on App component (onSnapshot)
