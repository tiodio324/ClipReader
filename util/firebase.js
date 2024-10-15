import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import 'firebase/compat/auth';
import 'firebase/compat/database';


const firebaseConfig = {
    apiKey: ********************************,
    authDomain: ********************************,
    databaseURL: ********************************,
    projectId: "clip-reader",
    storageBucket: ********************************,
    messagingSenderId: ********************************,
    appId: ********************************,
    measurementId: ********************************
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export { firebase };
