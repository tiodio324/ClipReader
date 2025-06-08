import { Pressable, StyleSheet, Text, View } from 'react-native';
import useTheme from '../../hooks/useTheme';

function FlatButton({ children, onPress }) {
    const theme = useTheme();

    const themedStyles = StyleSheet.create({
        button: {
            width: '40%',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: theme.backgroundBox,
            borderWidth: 1,
            borderRadius: 24,
            borderColor: theme.lineDark,
        },
        buttonText: {
            textAlign: 'center',
            color: theme.textWhite,
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

export default FlatButton;