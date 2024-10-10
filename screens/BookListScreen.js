import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Image, Pressable, SafeAreaView, Text, View, StyleSheet, FlatList } from "react-native";
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { KolorKit } from "../constants/styles";
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoadingOverlay from '../components/ui/LoadingOverlay';

import { ValueContext } from '../store/value-context';
import { deleteBook, fetchFileNames, getFileName, updateBookName, updateFavoriteBookName, deleteBookmarkNumber } from '../util/http';

export default function BookListScreen({route, navigation}) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(null);

    const bookCtx = useContext(ValueContext);
    const { fileTitle, setFileNames, setSelectedBook, favoriteFileTitle, setFavoriteFileTitle } = bookCtx;

    const editedBookId = route.params?.bookId;


    function readBookHandler(selectedBookTitle) {
        setSelectedBook(selectedBookTitle);
        navigation.navigate('BookScreen');
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

            bookCtx.deleteSelectedBookBookmarks();
            bookCtx.deleteBookmarkNumber(editedBookId);
            deleteBookmarkNumber(bookCtx.uid, selectedBookTitle);

            bookCtx.deleteBook(editedBookId);
            await deleteBook(bookCtx.uid, selectedBookTitle);

            getFileTitlesCallback();
            fetchFileTitlesCallback();
        } catch (e) {
            console.log('Could not delete book', e);
            setLoading(false);
        }
    }

    function addToFavoritesHandler(selectedBookTitle) {
        try {
            const sortedFavoriteFileTitle = [...new Set([selectedBookTitle, ...favoriteFileTitle])];
            setFavoriteFileTitle(sortedFavoriteFileTitle);
        } catch (e) {
            console.log('Could not add book to favorites', e);
        }
    }

    useEffect(() => {
        if (favoriteFileTitle) {
            try {
                bookCtx.updateFavoriteBookName(editedBookId, favoriteFileTitle);
                updateFavoriteBookName(bookCtx.uid, favoriteFileTitle);
                console.log('favoriteFileNames uploaded successfully');
            } catch (e) {
                console.log('Error uploading favoriteFileNames array to database: ', e);
            }
        }
    }, [favoriteFileTitle]);


    const getFileTitlesCallback = useCallback(async () => {
        try {
            const fetchedFileTitles = await fetchFileNames(bookCtx.uid);
            setFileNames(fetchedFileTitles);
            console.log('getFileTitles successfully');
        } catch (error) {
            console.error('Could not get file titles: ', error);
            setLoading(false);
        }
    }, [fileTitle]);
    useEffect(() => {
        getFileTitlesCallback();
    }, [getFileTitlesCallback]);

    const fetchFileTitlesCallback = useCallback(async () => {
        try {
            const titles = await getFileName(bookCtx.uid, editedBookId);
            setTitle(titles);
            console.log('fetchFileTitles successfully');
            setLoading(false);
        } catch (error) {
            console.error('Could not fetch value data: ', error);
            setLoading(false);
        }
    }, [editedBookId]);
    useEffect(() => {
        fetchFileTitlesCallback();
    }, [fetchFileTitlesCallback]);


    if (loading) {
        return <LoadingOverlay message='Downloading file...' />
    }

    if (title === null) {
        return (
            <View style={styles.fallbackContainer}>
                <Text style={styles.fallbackText}>No book added yet!</Text>
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
                                        <Pressable onPress={() => addToFavoritesHandler(item)} android_ripple={{color: KolorKit.blackBlueTheme.yellow400}} style={({pressed}) =>  pressed && styles.pressed}>
                                            <Fontisto style={{padding: 6}} name="favorite" size={26} color={KolorKit.blackBlueTheme.iconButton} />
                                        </Pressable>
                                        <MaterialIcons style={{padding: 6}} onPress={() => deleteBookHandler(item)} name="delete-forever" size={26} color={KolorKit.defaultColors.error500} />
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