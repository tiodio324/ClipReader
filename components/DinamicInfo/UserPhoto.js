import { Image, StyleSheet } from "react-native";

export default function UserPhoto({style, source}) {
    return (
        <Image source={source} style={[styles.img, style]}/>
    );
}

const styles = StyleSheet.create({
    img: {
        borderRadius: 300,
    }
});