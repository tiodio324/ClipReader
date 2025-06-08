import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import useTheme from '../../hooks/useTheme';

function LoadingOverlay({ message }) {
    const theme = useTheme();

    const themedStyles = StyleSheet.create({
        rootContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 32,
            backgroundColor: theme.backgroundApp
        },
        messageContainer: {
            alignItems: 'center',
            marginBottom: 16,
        },
        message: {
            fontSize: 16,
            color: theme.textWhite,
            textAlign: 'center'
        }
    });

    const renderMessage = () => {
        if (!message) return null;

        const parts = message.split('<br />');
        return parts.map((part, index) => (
            <Text key={index} style={themedStyles.message}>
                {part}
            </Text>
        ));
    };

    return (
        <View style={themedStyles.rootContainer}>
            <View style={themedStyles.messageContainer}>
                {renderMessage()}
            </View>
            <ActivityIndicator size="large" />
        </View>
    );
}

export default LoadingOverlay;