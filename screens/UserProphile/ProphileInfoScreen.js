import { useContext, useEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, Pressable, Image } from "react-native";
import { KolorKit } from "../../constants/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";

import defaultUserPhoto from '../../assets/DefaultProfileIcon.jpg';

import { ValueContext } from "../../store/value-context";
import { fetchValues, getValue } from "../../util/http";

export default function ProphileInfoScreen({route, navigation}) {
    const dataCtx = useContext(ValueContext);
    const { loadFile, setLoadFile, setValues, email } = dataCtx;

    const editedValueId = route.params?.valueId;
    const [valueData, setValueData] = useState(null);

    function editProphileHandler() {
        navigation.navigate('EditProfileScreen');
    }

    let userLogo;

    if (loadFile != '') {
        userLogo = <Image source={{uri: loadFile}} style={styles.userPhoto} />
    } else {
        userLogo = <Image source={defaultUserPhoto} style={styles.userPhoto} />
    }

    useEffect(() => {
        async function fetchLoadFile() {
            const storedLoadFile = await AsyncStorage.getItem(`${dataCtx.uid}/loadFile`);
            if (storedLoadFile) {
                setLoadFile(storedLoadFile);
            }
        }
        async function getValues() {
            try {
                const values = await fetchValues(dataCtx.uid);
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
                const valueData = await getValue(dataCtx.uid, editedValueId);
                setValueData(valueData);
            } catch (error) {
                console.error('Could not fetch value data. ', error);
            }
        }
        fetchValueData();
    }, [editedValueId]);



    return (
        <SafeAreaView style={styles.userInfoScreen}>
                <View style={styles.userInfoContainer}>
                    <View style={styles.userLogo}>
                        {userLogo}
                        <View>
                            {valueData?.name
                            ? <Text style={styles.userName}>{valueData?.name}</Text>
                            : <Text style={styles.userName}>User</Text>
                            }
                            {valueData?.date && (
                                <Text style={styles.birthdayDate}>{valueData?.date.slice(0, 10)}</Text>
                            )}
                            <Text style={styles.userEmail}>{email}</Text>
                            <Pressable onPress={editProphileHandler} android_ripple={{color: KolorKit.blackBlueTheme.btnNavigationHover}} style={({pressed}) => [styles.btnEditProfile, pressed && styles.pressed]}>
                                <Text style={styles.editProfileTitle}>Edit profile</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    pressed: {
        opacity: 0.7,
    },
    userInfoScreen: {
        flex: 1,
        backgroundColor: KolorKit.blackBlueTheme.backgroundApp,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 25,
        paddingHorizontal: '2%',
        marginBottom: 12,
        backgroundColor: KolorKit.blackBlueTheme.backgroundBox,
    },
    userLogo: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    userPhoto: {
        borderRadius: 300,
        width: 100,
        height: 100,
        marginRight: 15,
    },
    userName: {
        fontSize: 20,
        color: KolorKit.blackBlueTheme.textWhite,
        marginBottom: 8,
    },
    birthdayDate: {
        fontSize: 14,
        color: KolorKit.blackBlueTheme.textWhite,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: KolorKit.blackBlueTheme.textWhite,
        marginBottom: 20,
    },
    btnEditProfile: {
        width: 120,
        padding: 8,
        borderRadius: 8,
        backgroundColor: KolorKit.blackBlueTheme.yellow400,
    },
    editProfileTitle: {
        fontSize: 18,
        color: KolorKit.blackBlueTheme.textWhite,
    }
});