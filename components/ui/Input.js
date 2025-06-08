import { View, TextInput, StyleSheet } from "react-native";
import useTheme from "../../hooks/useTheme";
import { KolorKit } from "../../constants/styles";

export default function Input({ invalid, textInputConfig}) {
    const theme = useTheme();

    const themedStyles = StyleSheet.create({
        inputContainer: {
            padding: 12,
            marginVertical: 8,
            backgroundColor: theme.backgroundBox,
        },
        input: {
            color: theme.textWhite,
        },
        invalidInput: {
            backgroundColor: KolorKit.defaultColors.error50,
        },
    });

    const inputStyles = [themedStyles.input];

    if (invalid) {
        inputStyles.push(themedStyles.invalidInput);
    }

    return (
        <View style={themedStyles.inputContainer}>
            <TextInput
                style={inputStyles}
                placeholderTextColor={theme.textWhite}
                {...textInputConfig}
            />
        </View>
    );
}