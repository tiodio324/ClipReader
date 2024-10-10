import { firebase } from "./firebase";

export async function createFirebaseUser(email, password) {
    try{
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        return user;
    } catch (error) {
        console.log('Error createdFirebaseUser: ', error);
    }
}

export async function loginFirebaseUser(email, password) {
    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        return user;
    } catch (error) {
        console.log('Error loginFirebaseUser: ', error);
    }
}

export function firebaseUserInfo() {
    try {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log('firebaseUserInfo successfully');
                return user;
            } else {
                console.log('User is signed out');
            }
        });
    } catch (e) {
        console.log('Error firebaseUserInfo: ', e);
    }
}