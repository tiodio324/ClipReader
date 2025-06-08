import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/functions';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyDGGZI3m5WOa1PTcQq_FhUK0v0VW1aaLbo',
    authDomain: 'clip-reader.firebaseapp.com',
    databaseURL: 'https://clip-reader-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'clip-reader',
    storageBucket: 'clip-reader.appspot.com',
    messagingSenderId: '1516126846',
    appId: '1:1516126846:web:cad9527b2d0676a13c8e2f',
    measurementId: 'G-2ZF003M08C',
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = getFirestore();

export { firebase, db };
