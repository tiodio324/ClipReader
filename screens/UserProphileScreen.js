import { useContext, useEffect, useState } from "react";
import { StyleSheet, View, Text, Pressable, Image, SafeAreaView, ScrollView } from "react-native";
import AppVersion from "../components/ui/AppVersion";
import AwesomeAlert from "../components/ui/AwesomeAlert";
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KolorKit } from "../constants/styles";
import useTheme from "../hooks/useTheme";

import defaultUserPhoto from '../assets/DefaultProfileIcon.jpg';

import { ValueContext } from "../store/value-context";
import { getValue } from "../util/http";
import { deleteFirebaseUser } from "../util/auth";

export default function UserProphileScreen({route, navigation}) {
    const theme = useTheme();
    const valueCtx = useContext(ValueContext);
    const { loadFile, setLoadFile, setValues } = valueCtx;

    const editedValueId = route.params?.valueId;
    const [valueData, setValueData] = useState(null);

    const [alertConfig, setAlertConfig] = useState({
        show: false,
        title: '',
        message: '',
        confirmText: 'Ok',
        showCancelButton: false,
        showConfirmButton: true,
        onCancelPressed: null,
        onConfirmPressed: null,
        shouldCloseOnOverClick: true,
        closeOnHardwareBackPress: true
    });

    const showAlert = (config) => {
        setAlertConfig(prev => ({
            ...prev,
            show: true,
            onConfirmPressed: () => hideAlert(),
            ...config,
        }));
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, show: false }));
    };

    function prophileInfoHandler() {
        navigation.navigate('ProphileInfoScreen')
    }
    function appThemeHandler() {
        navigation.navigate('AppThemeScreen');
    }
    function aboutAppHandler() {
        navigation.navigate('AboutAppScreen');
    }

    function logOutHandler() {
        showAlert({
            title: 'Are you sure, you want to log out?',
            message: '',
            confirmText: 'Log out',
            showCancelButton: true,
            showConfirmButton: true,
            onCancelPressed: hideAlert,
            onConfirmPressed: () => {
                valueCtx.logoutFirebaseUser();
            },
        });
    }

    function deleteAccountHandler() {
        showAlert({
            title: 'Are you sure, you want to delete your account?',
            message: '',
            confirmText: 'Delete',
            showCancelButton: true,
            showConfirmButton: true,
            onCancelPressed: hideAlert,
            onConfirmPressed: async () => {
                hideAlert();
                try {
                    await deleteFirebaseUser(valueCtx.uid);
                    setTimeout(() => {
                        showAlert({
                            title: 'We apologize!',
                            message: `Now, this feature is only delete all data from ${valueData?.name || 'your'} account.`,
                        onConfirmPressed: () => {
                            hideAlert();
                            valueCtx.logoutFirebaseUser();
                        },
                        showCancelButton: false,
                            confirmText: 'Ok',
                        });
                    }, 1200);
                } catch (error) {
                    showAlert({
                        title: 'Error deleting account',
                        message: 'Please try again later!',
                        onConfirmPressed: () => hideAlert()
                    });
                }
            },
        });
    }

    useEffect(() => {
        async function fetchLoadFile() {
            const storedLoadFile = await AsyncStorage.getItem(`${valueCtx.uid}/loadFile`);
            if (storedLoadFile) {
                setLoadFile(storedLoadFile);
            }
        }
        fetchLoadFile();
    }, []);

    useEffect(() => {
        async function fetchValueData() {
            try {
                const valueData = await getValue(valueCtx.uid, editedValueId);
                setValueData(valueData);
            } catch (error) {
                console.error('Could not fetch value data. ', error);
            }
        }
        fetchValueData();
    }, [editedValueId]);

    let userLogo;

    if (loadFile != '') {
        userLogo = <Image source={{uri: loadFile}} style={styles.userPhoto} />
    } else {
        userLogo = <Image source={defaultUserPhoto} style={styles.userPhoto} />;
    }

    const themedStyles = StyleSheet.create({
        prophileScreen: {
            flex: 1,
            backgroundColor: theme.backgroundApp,
        },
        prophileInfo: {
            backgroundColor: theme.backgroundBox,
            marginBottom: 20,
        },
        userInfo: {
            fontSize: 22,
            color: theme.textWhite,
        },
        cardApp: {
            backgroundColor: theme.backgroundBox,
            marginBottom: 14,
        },
        title: {
            fontSize: 18,
            color: theme.textWhite,
        },
        logOut: {
            backgroundColor: theme.backgroundBox,
            marginBottom: 14,
        },
        logOutTitle: {
            fontSize: 18,
            color: theme.yellow400,
        },
        pressed: {
            opacity: 0.7,
        },
    });

    return (
        <ScrollView style={themedStyles.prophileScreen}>
                <Pressable onPress={prophileInfoHandler} android_ripple={{color: theme.btnNavigationHover}} style={({pressed}) => [themedStyles.prophileInfo, pressed && themedStyles.pressed]}>
                    <View style={styles.prophileInfoContainer}>
                        <View style={styles.prophileLogo}>
                            {userLogo}
                            {valueData?.name
                            ? <Text style={themedStyles.userInfo}>{valueData?.name}</Text>
                            : <Text style={themedStyles.userInfo}>User</Text>
                            }
                        </View>
                        <AntDesign name="caretright" size={8} color={theme.iconButton} />
                    </View>
                </Pressable>
                <Pressable onPress={appThemeHandler} android_ripple={{color: theme.btnNavigationHover}} style={({pressed}) => [themedStyles.cardApp, pressed && themedStyles.pressed]}>
                    <View style={styles.cardAppContainer}>
                        <View style={styles.cardAppLogo}>
                            <MaterialCommunityIcons style={styles.iconMargin} name="theme-light-dark" size={18} color={theme.iconButton} />
                            <Text style={themedStyles.title}>App Theme</Text>
                        </View>
                        <AntDesign name="caretright" size={8} color={theme.iconButton} />
                    </View>
                </Pressable>
                <Pressable onPress={aboutAppHandler} android_ripple={{color: theme.btnNavigationHover}} style={({pressed}) => [themedStyles.cardApp, pressed && themedStyles.pressed]}>
                    <View style={styles.cardAppContainer}>
                        <View style={styles.cardAppLogo}>
                            <AntDesign style={styles.iconMargin} name="infocirlceo" size={18} color={theme.iconButton} />
                            <Text style={themedStyles.title}>About App</Text>
                        </View>
                        <AntDesign name="caretright" size={8} color={theme.iconButton} />
                    </View>
                </Pressable>
                <Pressable onPress={logOutHandler} android_ripple={{color: theme.btnNavigationHover}} style={({pressed}) => [themedStyles.logOut, pressed && themedStyles.pressed]}>
                    <View style={styles.logOutContainer}>
                        <View style={styles.logOutLogo}>
                            <AntDesign style={styles.iconMargin} name="logout" size={18} color={theme.iconButton} />
                            <Text style={themedStyles.logOutTitle}>Log out from account</Text>
                        </View>
                    </View>
                </Pressable>
                <Pressable onPress={deleteAccountHandler} android_ripple={{color: theme.btnNavigationHover}} style={({pressed}) => [themedStyles.logOut, pressed && themedStyles.pressed]}>
                    <View style={styles.logOutContainer}>
                        <View style={styles.logOutLogo}>
                            <AntDesign style={styles.iconMargin} name="deleteuser" size={18} color={theme.iconButton} />
                            <Text style={styles.deleteTitle}>Delete account</Text>
                        </View>
                    </View>
                </Pressable>
                <AppVersion />

                <AwesomeAlert
                    show={alertConfig.show}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    confirmText={alertConfig.confirmText}
                    showCancelButton={alertConfig.showCancelButton}
                    showConfirmButton={alertConfig.showConfirmButton}
                    onCancelPressed={alertConfig.onCancelPressed}
                    onConfirmPressed={alertConfig.onConfirmPressed}
                    shouldCloseOnOverClick={alertConfig.shouldCloseOnOverClick}
                    closeOnHardwareBackPress={alertConfig.closeOnHardwareBackPress}
                />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    prophileInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        marginHorizontal: '2%',
    },
    prophileLogo: {
        flexDirection: 'row',
        padding: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    userPhoto: {
        borderRadius: 300,
        width: 30,
        height: 30,
        marginRight: 15,
    },
    cardAppContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: '3%',
        paddingVertical: 6,
    },
    cardAppLogo: {
        flexDirection: 'row',
        padding: 4,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconMargin: {
        marginRight: 18,
    },
    logOutContainer: {
        marginHorizontal: '3%',
        paddingVertical: 6,
    },
    logOutLogo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
    },
    deleteTitle: {
        fontSize: 18,
        color: KolorKit.defaultColors.error500,
    },
});
