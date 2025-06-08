import React, { useContext, useEffect, useState } from "react";
import { Pressable, Text, Image, SafeAreaView, View, StyleSheet, ScrollView } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from "@react-native-async-storage/async-storage";
import useTheme from "../../hooks/useTheme";

import defaultUserPhoto from '../../assets/DefaultProfileIcon.jpg';
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import AwesomeAlert from "../../components/ui/AwesomeAlert";
import ValueForm from "../../components/DinamicInfo/ValueForm";

import { ValueContext } from "../../store/value-context";
import { firebase } from '../../util/firebase';
import { updateValue } from "../../util/http";

export default function EditProfileScreen({route}) {
    const [image, setImage] = useState(null);
    const [newImage, setNewImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const theme = useTheme();

    const dataCtx = useContext(ValueContext);
    const { loadFile, setLoadFile, setValues } = dataCtx;

    const editedValueId = route.params?.valueId;

    const selectedValue = dataCtx.values.find((value) => value.id === editedValueId);

    const [alertConfig, setAlertConfig] = useState({
        show: false,
        title: '',
        message: '',
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

    async function editConfirmHandler(valueData) {
        setUploading(true);
        try {
            if (image) {
                uploadImage();
            };
            dataCtx.updateValue(editedValueId, valueData);
            await updateValue(dataCtx.uid, valueData);
            await fetchLoadFile();
            setUploading(false);
        } catch (error) {
            showAlert({
                title: 'Could not save your changes. Please try again later!',
            });
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
            showAlert({
                title: 'Could not upload image. Please try again later!'
            });
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
            showAlert({
                title: 'Could not load image. Please try again later!'
            });
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

    const themedStyles = StyleSheet.create({
        editProfile: {
            flex: 1,
            backgroundColor: theme.backgroundApp,
        },
        photoContainer: {
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: theme.backgroundBox,
            paddingTop: 25,
            paddingBottom: 10,
        },
        changePhotoText: {
            fontSize: 12,
            color: theme.yellow400,
        },
    });

    return (
        <ScrollView style={themedStyles.editProfile}>
            <View style={themedStyles.photoContainer}>
                <Pressable onPress={() => pickImage()}>
                    {userLogo}
                </Pressable>
                <Pressable onPress={() => pickImage()}>
                    <Text style={themedStyles.changePhotoText}>Change profile photo</Text>
                </Pressable>
            </View>
            <ValueForm
                onSubmit={editConfirmHandler}
                defaultValues={selectedValue}
            />

            <AwesomeAlert
                show={alertConfig.show}
                title={alertConfig.title}
                message={alertConfig.message}
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
    userPhoto: {
        borderRadius: 300,
        width: 150,
        height: 150,
        marginBottom: 15,
    },
});