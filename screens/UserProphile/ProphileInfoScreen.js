import { useContext, useEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, Pressable, Image, ScrollView } from "react-native";
import FullScreenImage from "../../components/ui/FullScreenImage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ensureDateFormat } from "../../util/birthdayDate";
import useTheme from "../../hooks/useTheme";

import defaultUserPhoto from '../../assets/DefaultProfileIcon.jpg';

import { ValueContext } from "../../store/value-context";
import { getValue } from "../../util/http";

export default function ProphileInfoScreen({route, navigation}) {
    const theme = useTheme();
    const dataCtx = useContext(ValueContext);
    const { loadFile, setLoadFile, setValues, email } = dataCtx;

    const editedValueId = route.params?.valueId;
    const [valueData, setValueData] = useState(null);
    const [isImageViewVisible, setIsImageViewVisible] = useState(false);

    function editProphileHandler() {
        navigation.navigate('EditProfileScreen');
    }

    let userLogo;

    if (loadFile && loadFile !== '') {
        userLogo = (
            <Pressable onPress={() => setIsImageViewVisible(true)}>
                <Image source={{uri: loadFile}} style={styles.userPhoto} />
            </Pressable>
        );
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
        fetchLoadFile();
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

    const themedStyles = StyleSheet.create({
        userInfoScreen: {
            flex: 1,
            backgroundColor: theme.backgroundApp,
        },
        userInfoContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 25,
            paddingHorizontal: '2%',
            marginBottom: 12,
            backgroundColor: theme.backgroundBox,
        },
        userName: {
            fontSize: 20,
            color: theme.textWhite,
            marginBottom: 8,
        },
        birthdayDate: {
            fontSize: 14,
            color: theme.textWhite,
            marginBottom: 4,
        },
        userEmail: {
            fontSize: 14,
            color: theme.textWhite,
            marginBottom: 20,
        },
        btnEditProfile: {
            width: 120,
            padding: 8,
            borderRadius: 8,
            backgroundColor: theme.yellow400,
        },
        editProfileTitle: {
            fontSize: 18,
            color: theme.btnText,
        },
        pressed: {
            opacity: 0.7,
        }
    });

    return (
        <ScrollView style={themedStyles.userInfoScreen}>
            <View style={themedStyles.userInfoContainer}>
                <View style={styles.userLogo}>
                    {userLogo}
                    <View>
                        {valueData?.name
                        ? <Text style={themedStyles.userName}>{valueData?.name}</Text>
                        : <Text style={themedStyles.userName}>User</Text>
                        }
                        {valueData?.date && (
                            <Text style={themedStyles.birthdayDate}>{ensureDateFormat(valueData?.date)}</Text>
                        )}
                        <Text style={themedStyles.userEmail}>{email}</Text>
                        <Pressable onPress={editProphileHandler} android_ripple={{color: theme.btnNavigationHover}} style={({pressed}) => [themedStyles.btnEditProfile, pressed && themedStyles.pressed]}>
                            <Text style={themedStyles.editProfileTitle}>Edit profile</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
            {loadFile && loadFile !== '' && (
                <FullScreenImage
                    source={{uri: loadFile}}
                    visible={isImageViewVisible}
                    onClose={() => setIsImageViewVisible(false)}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
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
});