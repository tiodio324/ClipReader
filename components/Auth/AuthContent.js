import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useTheme from '../../hooks/useTheme';

import FlatButton from '../ui/FlatButton';
import AuthForm from './AuthForm';

function AuthContent({ isLogin, onAuthenticate, showAlert }) {
    const navigation = useNavigation();
    const theme = useTheme();

    const [credentialsInvalid, setCredentialsInvalid] = useState({
        email: false,
        password: false,
        name: false,
        confirmPassword: false,
    });

    function switchAuthModeHandler() {
        if (isLogin) {
            navigation.replace('Signup');
        }   else {
            navigation.replace('Login');
        }
    }

    function submitHandler(credentials) {
        let { email, name, password, confirmPassword } = credentials;

        email = email.trim();
        name = name.trim();
        password = password.trim();

        const emailIsValid = email.includes('@');
        const usernameIsValid = name.length > 1 && name.length <= 32;
        const passwordIsValid = password.length >= 8;
        const passwordsAreEqual = password === confirmPassword;

        if (
            !emailIsValid ||
            !passwordIsValid ||
            (!isLogin && (!usernameIsValid || !passwordsAreEqual))
        ) {
            if (showAlert) {
                showAlert({
                    title: 'Invalid input',
                    message: 'Please check your entered credentials. Password must be at least 8 characters'
                });
            }
            setCredentialsInvalid({
                email: !emailIsValid,
                name: !usernameIsValid,
                password: !passwordIsValid,
                confirmPassword: !passwordIsValid || !passwordsAreEqual,
            });
            return;
        }
        onAuthenticate({ email, password, name });
    }

    const themedStyles = StyleSheet.create({
        authContent: {
            marginTop: 64,
            marginHorizontal: 32,
            padding: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.lineLight,
        },
        buttons: {
            marginTop: 8,
            alignSelf: 'flex-end',
        },
    });

    return (
        <View style={themedStyles.authContent}>
            <AuthForm
                isLogin={isLogin}
                onSubmit={submitHandler}
                credentialsInvalid={credentialsInvalid}
            />
            <View style={themedStyles.buttons}>
                <FlatButton onPress={switchAuthModeHandler}>
                    {isLogin ? 'Create new' : 'Log in instead'}
                </FlatButton>
            </View>
        </View>
    );
}

export default AuthContent;