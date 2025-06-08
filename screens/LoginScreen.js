import { useContext, useState } from 'react';
import { View } from 'react-native';

import AuthContent from '../components/Auth/AuthContent';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import AwesomeAlert from '../components/ui/AwesomeAlert';

import { loginFirebaseUser } from '../util/auth';
import { ValueContext } from '../store/value-context';

export default function LoginScreen() {
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

    async function loginHandler({email, password}) {
        setIsAuthenticating(true);
        try{
            const createdFirebaseUser = await loginFirebaseUser(email, password);
            authCtx.authenticateFirebaseUser(createdFirebaseUser);
        } catch (error) {
            showAlert({
                title: 'Authentication failed!',
                message: 'Could not log you in. Please check your credentials! Or try again later'
            });
            console.log('logIn error: ', error);
            setIsAuthenticating(false);
        }
    }

    if (isAuthenticating) {
        return <LoadingOverlay message='Logging you in...'/>
    }

    return (
        <View style={{ flex: 1 }}>
            <AuthContent isLogin onAuthenticate={loginHandler} showAlert={showAlert} />
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