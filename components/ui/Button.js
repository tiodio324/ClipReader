import { Pressable, StyleSheet, Text, View } from 'react-native';
import useTheme from '../../hooks/useTheme';

function Button({ children, onPress }) {
    const theme = useTheme();

    const themedStyles = StyleSheet.create({
        button: {
            width: '50%',
            alignSelf: 'center',
            paddingVertical: 6,
            paddingHorizontal: 12,
            backgroundColor: theme.backgroundBox,
            borderWidth: 1,
            borderRadius: 24,
            borderColor: theme.lineDark,
        },
        buttonText: {
            textAlign: 'center',
            color: theme.textWhite,
            fontSize: 16,
            fontWeight: 'bold'
        },
        pressed: {
            opacity: 0.7,
        },
    });

    return (
        <Pressable
            style={({ pressed }) => [themedStyles.button, pressed && themedStyles.pressed]}
            onPress={onPress}
        >
            <View>
                <Text style={themedStyles.buttonText}>{children}</Text>
            </View>
        </Pressable>
    );
}

export default Button;