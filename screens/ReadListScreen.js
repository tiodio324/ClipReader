import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Image, Pressable, SafeAreaView, Text, View, StyleSheet, FlatList, Alert } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { KolorKit } from "../constants/styles";
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoadingOverlay from '../components/ui/LoadingOverlay';

import { ValueContext } from '../store/value-context';
import { deleteBook, updateBookName, fetchReadFileNames, getReadFileName, updateReadBookName, deleteBookmarkNumber } from '../util/http';

export default function ReadListScreen({route, navigation}) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(null);

    const bookCtx = useContext(ValueContext);
    const { readFileTitle, setReadFileNames, setSelectedBook } = bookCtx;

    const editedBookId = route.params?.bookId;


    function readBookHandler(selectedBookTitle) {
        setSelectedBook(selectedBookTitle);
        navigation.navigate('BookScreen');
    }

    function preDeleteBookHandler(selectedBookTitle) {
        Alert.alert(`Are you sure, you want to delete ${selectedBookTitle}?`, '', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Yes, delete',
                onPress: () => deleteBookHandler(selectedBookTitle),
            }
        ]);
    }
    async function deleteBookHandler(selectedBookTitle) {
        setLoading(true);
        try {
            const storedFileTitle = await AsyncStorage.getItem('fileTitle');
            if (storedFileTitle) {
                const fileTitleArray = JSON.parse(storedFileTitle);
                const updatedFileTitleArray = fileTitleArray.filter(title => title !== selectedBookTitle);
                await AsyncStorage.setItem('fileTitle', JSON.stringify(updatedFileTitleArray));

                updateBookName(bookCtx.uid, updatedFileTitleArray);
            }
            const storedReadFileTitle = await AsyncStorage.getItem('readFileTitle');
            if (storedReadFileTitle) {
                const readFileTitleArray = JSON.parse(storedReadFileTitle);
                const updatedReadFileTitleArray = readFileTitleArray.filter(title => title !== selectedBookTitle);
                await AsyncStorage.setItem('readFileTitle', JSON.stringify(updatedReadFileTitleArray));

                updateReadBookName(bookCtx.uid, updatedReadFileTitleArray);
            }

            bookCtx.deleteSelectedBookBookmarks();
            bookCtx.deleteBookmarkNumber(editedBookId);
            deleteBookmarkNumber(bookCtx.uid, selectedBookTitle);

            bookCtx.deleteBook(editedBookId);
            await deleteBook(bookCtx.uid, selectedBookTitle);

            setTimeout(() => {
                getReadFileTitlesCallback();
                fetchReadFileTitlesCallback();
            }, 100);
        } catch (e) {
            console.log('Could not delete book', e);
            setLoading(false);
        }
    }

    async function removeFromReadHandler(selectedBookTitle) {
        setLoading(true);
        try {
            const storedReadFileTitle = await AsyncStorage.getItem('readFileTitle');
            if (storedReadFileTitle) {
                const readFileTitleArray = JSON.parse(storedReadFileTitle);
                const updatedReadFileTitleArray = readFileTitleArray.filter(title => title !== selectedBookTitle);
                await AsyncStorage.setItem('readFileTitle', JSON.stringify(updatedReadFileTitleArray));

                updateReadBookName(bookCtx.uid, updatedReadFileTitleArray);
            }

            setTimeout(() => {
                getReadFileTitlesCallback();
                fetchReadFileTitlesCallback();
            }, 100);
        } catch (e) {
            console.log('Could not remove book from read', e);
            setLoading(false);
        }
    }


    const getReadFileTitlesCallback = useCallback(async () => {
        try {
            const fetchedReadFileTitles = await fetchReadFileNames(bookCtx.uid);
            setReadFileNames(fetchedReadFileTitles);
            console.log('getReadFileTitles successfully');
        } catch (error) {
            console.error('Could not get read file titles: ', error);
            setLoading(false);
        }
    }, [readFileTitle]);
    useEffect(() => {
        getReadFileTitlesCallback();
    }, [getReadFileTitlesCallback]);

    const fetchReadFileTitlesCallback = useCallback(async () => {
        try {
            const titles = await getReadFileName(bookCtx.uid, editedBookId);
            setTitle(titles);
            console.log('fetchReadFileTitles successfully');
            setLoading(false);
        } catch (error) {
            console.error('Could not fetch read value data: ', error);
            setLoading(false);
        }
    }, [editedBookId]);
    useEffect(() => {
        fetchReadFileTitlesCallback();
    }, [fetchReadFileTitlesCallback]);


    if (loading) {
        return <LoadingOverlay message='Scanning read...' />
    }

    if (title === null) {
        return (
            <View style={styles.fallbackContainer}>
                <Text style={styles.fallbackText}>No book read yet!</Text>
            </View>
        );
    }



    return (
        <SafeAreaView style={styles.bookListScreen}>
            {title && (
                <FlatList
                    data={title}
                    renderItem={({ item }) => (
                        <View style={styles.rootContainer}>
                            <Pressable onPress={() => readBookHandler(item)} android_ripple={{color: KolorKit.blackBlueTheme.btnNavigationHover}} style={({pressed}) => [styles.bookPressableContainer, pressed && styles.pressed]}>
                                <View style={styles.bookContainer}>
                                    <View style={styles.bookInfoContainer}>
                                        <View style={styles.bookImgContainer}>
                                        <Image style={styles.bookImg} source={require('../assets/bookDefaultCover.png')} />
                                        </View>
                                        <View style={styles.bookContentContainer}>
                                            <Text style={styles.bookTitle}>{item.substring(0, item.length - 7)}</Text>
                                            <Text style={styles.bookPages}>Pages</Text>
                                        </View>
                                    </View>
                                    <View style={styles.bookOptionsContainer}>
                                        <MaterialCommunityIcons style={{padding: 6}} onPress={() => removeFromReadHandler(item)} name="book-cancel-outline" size={26} color={KolorKit.blackBlueTheme.yellow800} />
                                        <MaterialIcons style={{padding: 6}} onPress={() => preDeleteBookHandler(item)} name="delete-forever" size={26} color={KolorKit.defaultColors.error500} />
                                    </View>
                                </View>
                            </Pressable>
                        </View>
                    )}
                    keyExtractor={(index) => index.toString()}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    bookListScreen: {
        flex: 1,
        backgroundColor: KolorKit.blackBlueTheme.backgroundApp,
    },
    pressed: {
        opacity: 0.7,
    },
    fallbackContainer: {
        flex: 1,
        backgroundColor: KolorKit.blackBlueTheme.backgroundApp,
        justifyContent: 'center',
        alignItems: 'center'
    },
    fallbackText: {
        fontSize: 16,
        color: KolorKit.blackBlueTheme.textWhite
    },
    rootContainer: {
        backgroundColor: KolorKit.blackBlueTheme.backgroundBox,
        marginBottom: 25,
    },
    bookPressableContainer: {
        width: '95%',
        alignSelf: 'center',
    },
    bookContainer: {
        minHeight: 150,
        padding: 12,
        flexDirection: 'row',
    },
    bookInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingRight: 20,
    },
    bookImgContainer: {
        width: '30%',
    },
    bookImg: {

    },
    bookContentContainer: {
        flexDirection: 'column',
        width: '55%',
        marginLeft: 12,
    },
    bookTitle: {
        fontSize: 20,
        color: KolorKit.blackBlueTheme.textWhite,
    },
    bookPages: {
        fontSize: 18,
        marginTop: 8,
        color: KolorKit.blackBlueTheme.numeric,
    },
    bookOptionsContainer: {
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '15%',
    },
});