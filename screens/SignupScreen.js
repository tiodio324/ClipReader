import { useContext, useState } from 'react';
import { Alert } from 'react-native';

import AuthContent from '../components/Auth/AuthContent';
import LoadingOverlay from '../components/ui/LoadingOverlay';

import { createFirebaseUser } from '../util/auth';
import { ValueContext } from '../store/value-context';


export default function SignupScreen() {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const authCtx = useContext(ValueContext);


    async function signupHandler({email, password}) {
        setIsAuthenticating(true);
        try{
            const createdFirebaseUser = await createFirebaseUser(email, password);
            authCtx.authenticateFirebaseUser(createdFirebaseUser);
        }   catch(error) {
            Alert.alert('Authentication failed!', 'Could not create user. Please try again later');
            console.log('signUp error: ', error);
            setIsAuthenticating(false);
        }
    }

    if (isAuthenticating) {
        return <LoadingOverlay message='Creating user...'/>
    }

    return <AuthContent onAuthenticate={signupHandler}/>;
}