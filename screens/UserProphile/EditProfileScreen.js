import React, { useContext, useEffect, useState } from "react";
import { Pressable, Text, Image, SafeAreaView, View, StyleSheet, Alert, ScrollView } from "react-native";
import { KolorKit } from "../../constants/styles";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from "@react-native-async-storage/async-storage";

import defaultUserPhoto from '../../assets/DefaultProfileIcon.jpg';
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import ValueForm from "../../components/DinamicInfo/ValueForm";

import { ValueContext } from "../../store/value-context";
import { firebase } from '../../util/firebase';
import { storeValue, updateValue } from "../../util/http";


export default function EditProfileScreen({route}) {
    const [image, setImage] = useState(null);
    const [newImage, setNewImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    const dataCtx = useContext(ValueContext);
    const { loadFile, setLoadFile, setValues } = dataCtx;

    const editedValueId = route.params?.valueId;

    const selectedValue = dataCtx.values.find((value) => value.id === editedValueId);

    async function editConfirmHandler(valueData) {
        setUploading(true);
        try {
            if (image) {
                uploadImage();
            };
            dataCtx.updateValue(editedValueId, valueData);
            await updateValue(dataCtx.uid, editedValueId, valueData);
            await fetchLoadFile();
            setUploading(false);
        } catch (error) {
            Alert.alert('Could not save your changes. Please try again later!', error.message);
            setUploading(false);
        }
    }


    async function pickImage() {
        try {
            let imageResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
            if (!imageResult.canceled) {
                setNewImage(imageResult.assets[0].uri);
                setImage(imageResult.assets[0].uri);
            }
        }   catch (error) {
            Alert.alert('Could not upload image. Please try again later!', error.message);
        }
    }

    async function uploadImage() {
        setUploading(true);
        try {
            let imageUri = newImage || image;
            const {uri} = await FileSystem.getInfoAsync(imageUri);
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    resolve(xhr.response);
                };
                xhr.onerror = (e) => {
                    reject(new TypeError('Network request failed'));
                };
                xhr.responseType = 'blob';
                xhr.open('GET', uri, true);
                xhr.send(null);
            });
            const filename = image.substring(image.lastIndexOf('/') + 1);
            const ref = firebase.storage().ref(dataCtx.uid).child(filename);
            await ref.put(blob);
            const loadFileURL = await ref.getDownloadURL();
            setLoadFile(loadFileURL);
            setImage(null);
            await AsyncStorage.setItem(`${dataCtx.uid}/loadFile`, loadFileURL);
            setUploading(false);
            setNewImage(null);
        }   catch (error) {
            Alert.alert('Could not load image. Please try again later!', error.message);
            console.log(error.message);
            setUploading(false);
        }
    };

    async function fetchLoadFile() {
        const storedLoadFile = await AsyncStorage.getItem(`${dataCtx.uid}/loadFile`);
        if (storedLoadFile) {
            setLoadFile(storedLoadFile);
        }
    }


    let userLogo;

    if (loadFile != '') {
        userLogo = <Image source={{uri: loadFile}} style={styles.userPhoto} />
    } else if (image) {
        userLogo = <Image source={{uri: image}} style={styles.userPhoto} />
    } else {
        userLogo = <Image source={defaultUserPhoto} style={styles.userPhoto} />;
    }
    
    if (uploading) {
        return <LoadingOverlay message="Confirming your changes..."/>
    }


    return (
        <ScrollView style={styles.editProfile}>
            <View style={styles.photoContainer}>
                <Pressable onPress={() => pickImage()}>
                    {userLogo}
                </Pressable>
                <Pressable onPress={() => pickImage()}>
                    <Text style={styles.changePhotoText}>Change profile photo</Text>
                </Pressable>
            </View>
            <ValueForm
                onSubmit={editConfirmHandler}
                defaultValues={selectedValue}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    editProfile: {
        flex: 1,
        backgroundColor: KolorKit.blackBlueTheme.backgroundApp,
    },
    photoContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: KolorKit.blackBlueTheme.backgroundBox,
        paddingTop: 25,
        paddingBottom: 10,
    },
    userPhoto: {
        borderRadius: 300,
        width: 150,
        height: 150,
        marginBottom: 15,
    },
    changePhotoText: {
        fontSize: 12,
        color: KolorKit.blackBlueTheme.yellow400,
    },
});