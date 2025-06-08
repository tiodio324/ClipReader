import { Text, SafeAreaView, StyleSheet, View } from "react-native";
import useTheme from "../../hooks/useTheme";

export default function AboutAppScreen() {
    const theme = useTheme();

    const themedStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundApp,
        },
        textContainer: {
            display: 'flex',
            flexDirection: 'column',
            marginTop: 12,
            marginHorizontal: 14,
        },
        text: {
            fontSize: 18,
            color: theme.textWhite,
        },
        quoteContainer: {
            margin: 16,
            alignItems: 'center',
        },
        quote: {
            fontSize: 20,
            fontStyle: 'italic',
            fontFamily: 'antoutline',
            textAlign: 'center',
            fontWeight: 'bold',
            letterSpacing: 0.5,
            lineHeight: 28,
            color: theme.textWhite,
        },
        quoteBlur1: {
            position: 'absolute',
            fontSize: 20,
            fontStyle: 'italic',
            fontFamily: 'antoutline',
            textAlign: 'center',
            letterSpacing: 0.5,
            lineHeight: 28,
            color: theme.yellow300,
            opacity: 0.3,
            textShadowColor: theme.yellow300,
            textShadowOffset: {width: 0, height: 0},
            textShadowRadius: 8,
        },
        quoteBlur2: {
            position: 'absolute',
            fontSize: 20,
            fontStyle: 'italic',
            fontFamily: 'antoutline',
            textAlign: 'center',
            letterSpacing: 0.5,
            lineHeight: 28,
            color: theme.yellow800,
            opacity: 0.2,
            textShadowColor: theme.yellow800,
            textShadowOffset: {width: 0, height: 0},
            textShadowRadius: 15,
        },
    });

    return (
        <SafeAreaView style={themedStyles.container}>
            <View style={themedStyles.textContainer}>
                <Text style={[themedStyles.text, {fontSize: 19}]}><Text style={{fontWeight: 'bold', color: theme.yellow300}}>Clip Reader</Text> is a unique format for efficient reading of e-books word by word (RSVP).</Text>
                <Text style={themedStyles.text}>This method, called Rapid Serial Visual Presentation (RSVP), allows you to read faster and with less eye strain.</Text>
                <Text style={themedStyles.text}>Unlike similar solutions, ClipReader has a scientific basis, which allows you to reveal the RSVP reading method 100%.</Text>
                <Text style={themedStyles.text}>ClipReader supports only .fb2 and .txt files (no image support, which can be critical).</Text>
            </View>
            <View style={themedStyles.quoteContainer}>
                <Text style={themedStyles.quoteBlur2}>Get Tired Less and Learn More!</Text>
                <Text style={themedStyles.quoteBlur1}>Get Tired Less and Learn More!</Text>
                <Text style={themedStyles.quote}>Get Tired Less and Learn More!</Text>
            </View>
        </SafeAreaView>
    );
}