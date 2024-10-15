import { useContext, useEffect, useState } from "react";
import { StyleSheet, View, Text, Pressable, Image, SafeAreaView, Alert, ScrollView } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import { KolorKit } from "../constants/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";

import defaultUserPhoto from '../assets/DefaultProfileIcon.jpg';

import { ValueContext } from "../store/value-context";
import { fetchValues, getValue } from "../util/http";

export default function UserProphileScreen({route, navigation}) {
    const valueCtx = useContext(ValueContext);
    const { loadFile, setLoadFile, setValues } = valueCtx;

    const editedValueId = route.params?.valueId;
    const [valueData, setValueData] = useState(null);

    function prophileInfoHandler() {
        navigation.navigate('ProphileInfoScreen')
    }
    function aboutAppHandler() {
        navigation.navigate('AboutAppScreen');
    }
    function logOutHandler() {
        Alert.alert('Are you sure, you want to log out?', '', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Yes, log out',
                onPress: () => valueCtx.logoutFirebaseUser(),
            }
        ]);
    }

    useEffect(() => {
        async function fetchLoadFile() {
            const storedLoadFile = await AsyncStorage.getItem(`${valueCtx.uid}/loadFile`);
            if (storedLoadFile) {
                setLoadFile(storedLoadFile);
            }
        }
        async function getValues() {
            try {
                const values = await fetchValues(valueCtx.uid);
                setValues(values);
            } catch (error) {
                console.error('Could not get values. ', error);
            }
        }
        fetchLoadFile();
        getValues();
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


    return (
        <ScrollView style={styles.prophileScreen}>
                <Pressable onPress={prophileInfoHandler} android_ripple={{color: KolorKit.blackBlueTheme.btnNavigationHover}} style={({pressed}) => [styles.prophileInfo, pressed && styles.pressed]}>
                    <View style={styles.prophileInfoContainer}>
                        <View style={styles.prophileLogo}>
                            {userLogo}
                            {valueData?.name
                            ? <Text style={styles.userInfo}>{valueData?.name}</Text>
                            : <Text style={styles.userInfo}>User</Text>
                            }
                        </View>
                        <AntDesign name="caretright" size={8} color={KolorKit.blackBlueTheme.iconButton} />
                    </View>
                </Pressable>
                <Pressable onPress={aboutAppHandler} android_ripple={{color: KolorKit.blackBlueTheme.btnNavigationHover}} style={({pressed}) => [styles.aboutApp, pressed && styles.pressed]}>
                    <View style={styles.aboutAppContainer}>
                        <View style={styles.aboutAppLogo}>
                            <AntDesign style={styles.iconMargin} name="infocirlceo" size={18} color={KolorKit.blackBlueTheme.iconButton} />
                            <Text style={styles.title}>About App</Text>
                        </View>
                        <AntDesign name="caretright" size={8} color={KolorKit.blackBlueTheme.iconButton} />
                    </View>
                </Pressable>
                <Pressable onPress={logOutHandler} android_ripple={{color: KolorKit.blackBlueTheme.btnNavigationHover}} style={({pressed}) => [styles.logOut, pressed && styles.pressed]}>
                    <View style={styles.logOutContainer}>
                        <View style={styles.logOutLogo}>
                            <AntDesign style={styles.iconMargin} name="logout" size={18} color={KolorKit.blackBlueTheme.iconButton} />
                            <Text style={styles.logOutTitle}>Log out from account</Text>
                        </View>
                    </View>
                </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    pressed: {
        opacity: 0.7,
    },
    prophileScreen: {
        flex: 1,
        backgroundColor: KolorKit.blackBlueTheme.backgroundApp,
    },
    prophileInfo: {
        backgroundColor: KolorKit.blackBlueTheme.backgroundBox,
        marginBottom: 12,
    },
    prophileInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
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
    userInfo: {
        fontSize: 22,
        color: KolorKit.blackBlueTheme.textWhite,
    },
    aboutApp: {
        backgroundColor: KolorKit.blackBlueTheme.backgroundBox,
        marginVertical: 8,
    },
    aboutAppContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: '3%',
    },
    aboutAppLogo: {
        flexDirection: 'row',
        padding: 4,
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    title: {
        fontSize: 18,
        color: KolorKit.blackBlueTheme.textWhite,
    },
    iconMargin: {
        marginRight: 18,
    },

    logOut: {
        backgroundColor: KolorKit.blackBlueTheme.backgroundBox,
        marginVertical: 8,
    },
    logOutContainer: {
        marginHorizontal: '3%',
    },
    logOutLogo: {
        flexDirection: 'row',
        padding: 4,
    },
    logOutTitle: {
        fontSize: 18,
        color: KolorKit.blackBlueTheme.yellow400,
    },
});