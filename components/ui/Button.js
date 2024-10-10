import { Pressable, StyleSheet, Text, View } from 'react-native';
import { KolorKit } from '../../constants/styles';

function Button({ children, onPress }) {
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

export default Button;

const styles = StyleSheet.create({
    button: {
        width: '50%',
        alignSelf: 'center',
        paddingVertical: 6,
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
        fontSize: 16,
        fontWeight: 'bold'
    },
});