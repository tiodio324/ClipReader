import { View, TextInput, StyleSheet } from "react-native";
import { KolorKit } from "../../constants/styles";

export default function Input({ invalid, textInputConfig}) {
    const inputStyles = [styles.input]

    if (invalid) {
        inputStyles.push(styles.invalidInput);
    }



    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={inputStyles}
                placeholderTextColor={KolorKit.blackBlueTheme.textWhite}
                {...textInputConfig}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        padding: 12,
        marginVertical: 8,
        backgroundColor: KolorKit.blackBlueTheme.backgroundBox,
    },
    input: {
        color: KolorKit.blackBlueTheme.textWhite,
    },
    invalidInput: {
        backgroundColor: KolorKit.defaultColors.error50,
    },
});