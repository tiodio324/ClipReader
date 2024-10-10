import { useContext, useState } from 'react';
import { Alert } from 'react-native';

import AuthContent from '../components/Auth/AuthContent';
import LoadingOverlay from '../components/ui/LoadingOverlay';

import { loginFirebaseUser } from '../util/auth';
import { ValueContext } from '../store/value-context';

export default function LoginScreen() {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const authCtx = useContext(ValueContext);


    async function loginHandler({email, password}) {
        setIsAuthenticating(true);
        try{
            const createdFirebaseUser = await loginFirebaseUser(email, password);
            authCtx.authenticateFirebaseUser(createdFirebaseUser);
        }   catch (error) {
            Alert.alert('Authentication failed!', 'Could not log you in. Please check your credentionals! Or try again later');
            console.log('logIn error: ', error);
            setIsAuthenticating(false);
        }
    }

    if (isAuthenticating) {
        return <LoadingOverlay message='Logging you in...'/>
    }



    return (
        <AuthContent isLogin onAuthenticate={loginHandler} />
    );
}