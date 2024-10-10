import {View, Pressable, Text, StyleSheet} from 'react-native';

export default function LogOutButton({onPress}) {
    return (
        <Pressable onPress={onPress}>
            <View>
                <Text style={styles.text}>Log Out</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    text: {
        color: 'white',
        size: 18,
    }
});