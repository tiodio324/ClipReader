import { View, Text, TextInput, StyleSheet } from 'react-native';

import { KolorKit } from '../../constants/styles';

function Input({label, keyboardType, secure, onUpdateValue, value, isInvalid,}) {
    return (
        <View style={styles.inputContainer}>
            <Text style={[styles.label, isInvalid && styles.labelInvalid]}>
                {label}
            </Text>
            <TextInput
                style={[styles.input, isInvalid && styles.inputInvalid]}
                autoCapitalize="none"
                keyboardType={keyboardType}
                secureTextEntry={secure}
                onChangeText={onUpdateValue}
                value={value}
                color={KolorKit.blackBlueTheme.textWhite}
            />
        </View>
    );
}

export default Input;

const styles = StyleSheet.create({
    inputContainer: {
        marginVertical: 8,
    },
    label: {
        color: 'white',
        marginBottom: 4,
    },
    labelInvalid: {
        color: KolorKit.defaultColors.error500,
    },
    input: {
        paddingVertical: 8,
        paddingHorizontal: 6,
        backgroundColor: KolorKit.blackBlueTheme.backgroundBox,
        borderRadius: 4,
        fontSize: 16,
    },
    inputInvalid: {
        backgroundColor: KolorKit.defaultColors.error50,
    },
});