import { Pressable, StyleSheet, View, Text } from "react-native";

export default function Button({onPress, children}) {
    return (
        <Pressable android_ripple={{color: '#ccc'}} style={({pressed}) => [styles.button, pressed && styles.pressed]} onPress={onPress}>
            <View>
                <Text style={styles.text}>{children}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        margin: 8,
        elevation: 2,
        shadowColor: 'black',
        shadowOpacity: 0.15,
        shadowOffset: {width: 1, height: 1},
        shadowRadius: 2
    },
    pressed: {
        opacity: 0.7,
    },
    text: {
        textAlign: 'center',
        fontSize: 16,
    }
});