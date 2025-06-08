import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { KolorKit } from '../../constants/styles';
import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';

function Input({label, keyboardType, secure, onUpdateValue, value, isInvalid,}) {
    const theme = useTheme();
    const [passwordVisible, setPasswordVisible] = useState(false);

    const themedStyles = StyleSheet.create({
        inputContainer: {
            marginVertical: 8,
        },
        label: {
            color: theme.textWhite,
            marginBottom: 4,
        },
        labelInvalid: {
            color: KolorKit.defaultColors.error500,
        },
        input: {
            paddingVertical: 8,
            paddingHorizontal: 6,
            backgroundColor: theme.backgroundBox,
            borderRadius: 4,
            fontSize: 16,
            color: theme.textWhite
        },
        inputInvalid: {
            backgroundColor: KolorKit.defaultColors.error50,
        },
        passwordContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.backgroundBox,
            borderRadius: 4,
        },
        passwordInput: {
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 6,
            fontSize: 16,
            color: theme.textWhite,
        },
        iconButton: {
            padding: 10,
        }
    });

    return (
        <View style={themedStyles.inputContainer}>
            <Text style={[themedStyles.label, isInvalid && themedStyles.labelInvalid]}>
                {label}
            </Text>
            {secure ? (
                <View style={[themedStyles.passwordContainer, isInvalid && themedStyles.inputInvalid]}>
                    <TextInput
                        style={themedStyles.passwordInput}
                        autoCapitalize="none"
                        keyboardType={keyboardType}
                        secureTextEntry={!passwordVisible}
                        onChangeText={onUpdateValue}
                        value={value}
                    />
                    <Pressable 
                        onPress={() => setPasswordVisible(!passwordVisible)}
                        style={themedStyles.iconButton}
                    >
                        <Feather 
                            name={passwordVisible ? 'eye' : 'eye-off'}
                            size={20}
                            color={theme.textWhite}
                        />
                    </Pressable>
                </View>
            ) : (
                <TextInput
                    style={[themedStyles.input, isInvalid && themedStyles.inputInvalid]}
                    autoCapitalize="none"
                    keyboardType={keyboardType}
                    onChangeText={onUpdateValue}
                    value={value}
                />
            )}
        </View>
    );
}

export default Input;