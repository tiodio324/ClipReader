import { Text, SafeAreaView, StyleSheet } from "react-native";
import { KolorKit } from "../../constants/styles";

export default function AboutAppScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.text}>Clip Reader is a unique format for efficient reading of e-books (without image support, which can be critical). Now, app supports only .fb2 and .txt files.</Text>
            <Text style={[styles.text, styles.quote]}>Get Tired Less and Learn More!</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: KolorKit.blackBlueTheme.backgroundApp,
    },
    text: {
        fontSize: 20,
        color: KolorKit.blackBlueTheme.textWhite,
        marginLeft: 4,
    },
    quote: {
        fontSize: 17,
        fontStyle: 'italic',
        margin: 16,
    }
});