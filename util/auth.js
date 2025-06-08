import { firebase } from "./firebase";
import { updateValue, deleteAllAccountData } from "./http";

export async function createFirebaseUser(email, password, name, showAlert = null) {
    try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        await updateValue(user.uid, {
            name: name,
            email: email,
            date: ''
        });

        return user;
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            if (showAlert) {
                showAlert({
                    title: 'Email already in use!',
                    message: 'Please try again with a different email address or login with existing account'
                });
            }
        } else {
            console.error('Error createdFirebaseUser: ', error);
        }
    }
}

export async function loginFirebaseUser(email, password) {
    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        return user;
    } catch (error) {
        console.error('Error loginFirebaseUser: ', error);
    }
}

export function firebaseUserInfo() {
    try {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                return user;
            } else {
                console.log('User is signed out');
            }
        });
    } catch (e) {
        console.error('Error firebaseUserInfo: ', e);
    }
}

export async function deleteFirebaseUser(uid) {
    try {
        await deleteAllAccountData(uid);

        return;

        const deleteUserFunction = firebase.functions().httpsCallable('deleteUserAccount');
        await deleteUserFunction({ uid: uid });
    } catch (error) {
        console.error('Error deleteFirebaseUser: ', error);
    }
}