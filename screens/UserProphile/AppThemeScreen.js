import { useContext, useState } from "react";
import { Text, SafeAreaView, StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import { KolorKit } from "../../constants/styles";
import { ValueContext } from "../../store/value-context";
import Feather from '@expo/vector-icons/Feather';
import useTheme from "../../hooks/useTheme";

export default function AppThemeScreen() {
    const { appTheme, setAppTheme } = useContext(ValueContext);
    const theme = useTheme();
    const [showPreview, setShowPreview] = useState(false);

    function changeAppThemeHandler(themeName) {
        setAppTheme(themeName);
    }

    const themedStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundApp
        },
        themeOption: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderRadius: 8,
            marginBottom: 12,
            elevation: 2,
            backgroundColor: theme.backgroundBox
        },
        themeTitle: {
            fontSize: 18,
            fontWeight: '500',
            flex: 1,
            color: theme.textWhite
        },
        previewCard: {
            padding: 16,
            borderRadius: 8,
            elevation: 2,
            backgroundColor: theme.backgroundBox
        },
        previewTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 8,
            color: theme.textWhite
        },
        previewText: {
            fontSize: 16,
            lineHeight: 24,
            color: theme.textWhite
        },
        toggleButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            borderRadius: 8,
            marginVertical: 15,
            backgroundColor: theme.yellow500
        },
        toggleButtonText: {
            color: theme.textWhite,
            fontWeight: 'bold',
            marginLeft: 8,
            fontSize: 16
        },
        colorPreviewRow: {
            flexDirection: 'row',
            marginVertical: 8,
            flexWrap: 'wrap',
            justifyContent: 'space-between'
        },
        colorPreviewItem: {
            width: '48%',
            marginBottom: 12,
            borderRadius: 8,
            padding: 8,
            borderWidth: 1,
            borderColor: theme.borderLight
        },
        colorLabel: {
            fontSize: 12,
            marginBottom: 4,
            color: theme.textWhite
        },
        colorBox: {
            height: 30,
            borderRadius: 4,
            marginTop: 4
        },
        previewElement: {
            marginVertical: 8,
            borderRadius: 8,
            padding: 10,
            backgroundColor: theme.backgroundContent
        },
        previewButton: {
            marginTop: 10,
            padding: 10,
            borderRadius: 6,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.yellow400
        },
        previewButtonText: {
            color: theme.textWhite,
            fontWeight: 'bold'
        }
    });

    return (
        <SafeAreaView style={themedStyles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.themeOptionsContainer}>
                    <TouchableOpacity 
                        style={[
                            themedStyles.themeOption,
                            appTheme === 'blackBlueTheme' && styles.selectedOption
                        ]} 
                        onPress={() => changeAppThemeHandler('blackBlueTheme')}
                    >
                        <View style={styles.themeSwatch}>
                            <View style={styles.blackBlueThemePreview}>
                                <View style={styles.blackBlueAccent}></View>
                            </View>
                        </View>
                        <Text style={themedStyles.themeTitle}>Black Blue</Text>
                        {appTheme === 'blackBlueTheme' && (
                            <View style={styles.checkmarkContainer}>
                                <Feather name="check-circle" size={24} color={KolorKit.blackBlueTheme.yellow400} />
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            themedStyles.themeOption,
                            appTheme === 'darkTheme' && styles.selectedOption
                        ]} 
                        onPress={() => changeAppThemeHandler('darkTheme')}
                    >
                        <View style={styles.themeSwatch}>
                            <View style={styles.darkThemePreview}>
                                <View style={styles.darkAccent}></View>
                            </View>
                        </View>
                        <Text style={themedStyles.themeTitle}>Dark</Text>
                        {appTheme === 'darkTheme' && (
                            <View style={styles.checkmarkContainer}>
                                <Feather name="check-circle" size={24} color={KolorKit.darkTheme.iconButton} />
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            themedStyles.themeOption,
                            appTheme === 'lightTheme' && styles.selectedOption
                        ]} 
                        onPress={() => changeAppThemeHandler('lightTheme')}
                    >
                        <View style={styles.themeSwatch}>
                            <View style={styles.lightThemePreview}>
                                <View style={styles.lightAccent}></View>
                            </View>
                        </View>
                        <Text style={themedStyles.themeTitle}>Light</Text>
                        {appTheme === 'lightTheme' && (
                            <View style={styles.checkmarkContainer}>
                                <Feather name="check-circle" size={24} color={KolorKit.lightTheme.iconButton} />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
                <TouchableOpacity 
                    style={themedStyles.toggleButton}
                    onPress={() => setShowPreview(!showPreview)}
                >
                    <Feather 
                        name={showPreview ? "eye-off" : "eye"} 
                        size={20} 
                        color={theme.textWhite} 
                    />
                    <Text style={themedStyles.toggleButtonText}>
                        {showPreview ? "Hide Preview" : "Show Preview"}
                    </Text>
                </TouchableOpacity>
                {showPreview && (
                    <View style={themedStyles.previewCard}>
                        <Text style={themedStyles.previewTitle}>Theme Preview</Text>
                        <Text style={themedStyles.previewText}>
                            This is a preview of your selected theme. It shows how the different elements and colors will appear in your app.
                        </Text>
                        <View style={themedStyles.previewElement}>
                            <Text style={[themedStyles.previewText, {fontWeight: 'bold'}]}>
                                Content Area
                            </Text>
                            <Text style={themedStyles.previewText}>
                                This shows how text and content containers will look with the selected theme.
                            </Text>
                            <TouchableOpacity style={themedStyles.previewButton}>
                                <Text style={themedStyles.previewButtonText}>Sample Button</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={[themedStyles.previewTitle, {marginTop: 16}]}>Color Palette</Text>
                        <View style={themedStyles.colorPreviewRow}>
                            <View style={themedStyles.colorPreviewItem}>
                                <Text style={themedStyles.colorLabel}>Background App</Text>
                                <View style={[themedStyles.colorBox, {backgroundColor: theme.backgroundApp}]} />
                            </View>
                            <View style={themedStyles.colorPreviewItem}>
                                <Text style={themedStyles.colorLabel}>Background Content</Text>
                                <View style={[themedStyles.colorBox, {backgroundColor: theme.backgroundContent}]} />
                            </View>
                            <View style={themedStyles.colorPreviewItem}>
                                <Text style={themedStyles.colorLabel}>Background Box</Text>
                                <View style={[themedStyles.colorBox, {backgroundColor: theme.backgroundBox}]} />
                            </View>
                            <View style={themedStyles.colorPreviewItem}>
                                <Text style={themedStyles.colorLabel}>Icon Button</Text>
                                <View style={[themedStyles.colorBox, {backgroundColor: theme.iconButton}]} />
                            </View>
                            <View style={themedStyles.colorPreviewItem}>
                                <Text style={themedStyles.colorLabel}>Line Light</Text>
                                <View style={[themedStyles.colorBox, {backgroundColor: theme.lineLight}]} />
                            </View>
                            <View style={themedStyles.colorPreviewItem}>
                                <Text style={themedStyles.colorLabel}>Line Dark</Text>
                                <View style={[themedStyles.colorBox, {backgroundColor: theme.lineDark}]} />
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    scrollContainer: {
        padding: 16,
    },
    themeOptionsContainer: {
        marginBottom: 24,
    },
    selectedOption: {
        borderWidth: 2,
        borderColor: KolorKit.blackBlueTheme.yellow400,
    },
    themeSwatch: {
        marginRight: 16,
    },
    blackBlueThemePreview: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: KolorKit.blackBlueTheme.backgroundApp,
        justifyContent: 'center',
        alignItems: 'center',
    },
    blackBlueAccent: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: KolorKit.blackBlueTheme.yellow400,
    },
    darkThemePreview: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: KolorKit.darkTheme.backgroundApp,
        justifyContent: 'center',
        alignItems: 'center',
    },
    darkAccent: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: KolorKit.darkTheme.iconButton,
    },
    lightThemePreview: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: KolorKit.lightTheme.backgroundApp,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lightAccent: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: KolorKit.lightTheme.iconButton,
    },
    checkmarkContainer: {
        marginLeft: 'auto',
    },
});
