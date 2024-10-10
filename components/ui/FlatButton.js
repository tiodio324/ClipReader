import { Pressable, StyleSheet, Text, View } from 'react-native';

import { KolorKit } from '../../constants/styles';

function FlatButton({ children, onPress }) {
    return (
        <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={onPress}
        >
            <View>
                <Text style={styles.buttonText}>{children}</Text>
            </View>
        </Pressable>
    );
}

export default FlatButton;

const styles = StyleSheet.create({
    button: {
        width: '40%',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: KolorKit.blackBlueTheme.backgroundBox,
        borderWidth: 1,
        borderRadius: 24,
        borderColor: KolorKit.blackBlueTheme.lineDark,
    },
    pressed: {
        opacity: 0.7,
    },
    buttonText: {
        textAlign: 'center',
        color: KolorKit.blackBlueTheme.textWhite,
    },
});