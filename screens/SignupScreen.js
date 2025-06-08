import { useContext, useState } from 'react';
import { View } from 'react-native';

import AuthContent from '../components/Auth/AuthContent';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import AwesomeAlert from '../components/ui/AwesomeAlert';

import { createFirebaseUser } from '../util/auth';
import { ValueContext } from '../store/value-context';

export default function SignupScreen() {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const authCtx = useContext(ValueContext);

    const [alertConfig, setAlertConfig] = useState({
        show: false,
        title: '',
        message: '',
        showCancelButton: false,
        showConfirmButton: true,
        onCancelPressed: null,
        onConfirmPressed: null,
        shouldCloseOnOverClick: true,
        closeOnHardwareBackPress: true
    });

    const showAlert = (config) => {
        setAlertConfig(prev => ({
            ...prev,
            show: true,
            onConfirmPressed: () => hideAlert(),
            ...config,
        }));
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, show: false }));
    };

    async function signupHandler({email, password, name}) {
        setIsAuthenticating(true);
        try{
            const createdFirebaseUser = await createFirebaseUser(email, password, name, showAlert);
            authCtx.authenticateFirebaseUser(createdFirebaseUser);
        } catch (error) {
            if (error.message !== 'Cannot read property \'uid\' of undefined') {
                showAlert({
                    title: 'Authentication failed!',
                    message: 'Could not create user. Please try again later'
                });
                console.error('signUp error: ', error);
            }
            setIsAuthenticating(false);
        }
    }

    if (isAuthenticating) {
        return <LoadingOverlay message='Creating user...'/>
    }

    return (
        <View style={{ flex: 1 }}>
            <AuthContent onAuthenticate={signupHandler} showAlert={showAlert}/>
            <AwesomeAlert
                show={alertConfig.show}
                title={alertConfig.title}
                message={alertConfig.message}
                showCancelButton={alertConfig.showCancelButton}
                showConfirmButton={alertConfig.showConfirmButton}
                onCancelPressed={alertConfig.onCancelPressed}
                onConfirmPressed={alertConfig.onConfirmPressed}
                shouldCloseOnOverClick={alertConfig.shouldCloseOnOverClick}
                closeOnHardwareBackPress={alertConfig.closeOnHardwareBackPress}
            />
        </View>
    );
}