import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Image, Pressable, SafeAreaView, Text, View, StyleSheet, FlatList, Linking } from "react-native";
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { KolorKit } from "../constants/styles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import useTheme from '../hooks/useTheme';

import LoadingOverlay from '../components/ui/LoadingOverlay';
import ScrollingText from '../components/ui/ScrollingText';
import AwesomeAlert from '../components/ui/AwesomeAlert';

import { ValueContext } from '../store/value-context';
import { deleteBook, fetchFileNames, getFileName, updateBookName, updateFavoriteBookName, deleteBookmarkNumber } from '../util/http';

export default function BookListScreen({route, navigation}) {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(null);
    const [localFavorites, setLocalFavorites] = useState(new Set());

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

    const bookCtx = useContext(ValueContext);
    const { fileTitle, setFileNames, setSelectedBook, setSelectedBookMetadata, favoriteFileTitle, setFavoriteFileTitle, meta } = bookCtx;

    const editedBookId = route.params?.bookId;

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

    const themedStyles = StyleSheet.create({
        bookListScreen: {
            flex: 1,
            backgroundColor: theme.backgroundApp,
        },
        pressed: {
            opacity: 0.7,
        },
        fallbackContainer: {
            flex: 1,
            backgroundColor: theme.backgroundApp,
            justifyContent: 'center',
            alignItems: 'center'
        },
        fallbackText: {
            fontSize: 16,
            color: theme.textWhite
        },
        rootContainer: {
            backgroundColor: theme.backgroundBox,
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
            width: '100%',
            height: 140,
            borderRadius: 8,
        },
        bookContentContainer: {
            flexDirection: 'column',
            width: '55%',
            marginLeft: 12,
            height: 145,
            justifyContent: 'space-between',
        },
        bookTitle: {
            fontSize: 20,
        },
        bookPages: {
            fontSize: 18,
            marginTop: 8,
            color: theme.numeric,
        },
        bookOptionsContainer: {
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '15%',
        },
        bookAuthor: {
            fontSize: 18,
            fontStyle: 'italic',
            opacity: 0.95,
            marginTop: 5,
            color: theme.textWhite,
        },
        bookIsbn: {
            fontSize: 14,
            fontStyle: 'italic',
            marginTop: 3,
            color: theme.yellow800,
            textDecorationLine: 'underline',
        },
        spacer: {
            flex: 1,
        },
    });


    function readBookHandler(selectedBookTitle, metadata) {
        setSelectedBook(selectedBookTitle);
        setSelectedBookMetadata(metadata);
        navigation.navigate('BookScreen');
    }

    function preDeleteBookHandler(selectedBookTitle, selectedBookMeta) {
        showAlert({
            title: 'Are you sure?',
            message: `Delete: ${selectedBookMeta}?`,
            confirmText: 'Delete',
            showCancelButton: true,
            onCancelPressed: () => hideAlert(),
            onConfirmPressed: () => {
                hideAlert();
                deleteBookHandler(selectedBookTitle);
            }
        });
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

            setTimeout(() => {
                getFileTitlesCallback();
                fetchFileTitlesCallback();
            }, 100);
        } catch (e) {
            console.log('Could not delete book', e);
            setLoading(false);
        }
    }

    function addToFavoritesHandler(selectedBookTitle) {
        try {
            const sortedFavoriteFileTitle = [...new Set([selectedBookTitle, ...favoriteFileTitle])];
            setFavoriteFileTitle(sortedFavoriteFileTitle);
            setLocalFavorites(prevFavorites => new Set([...prevFavorites, selectedBookTitle]));
        } catch (e) {
            console.log('Could not add book to favorites', e);
        }
    }

    useEffect(() => {
        if (favoriteFileTitle) {
            try {
                bookCtx.updateFavoriteBookName(editedBookId, favoriteFileTitle);
                updateFavoriteBookName(bookCtx.uid, favoriteFileTitle);
                setLocalFavorites(new Set(favoriteFileTitle));
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
        return <LoadingOverlay message='Scanning books...' />
    }

    if (title === null) {
        return (
            <View style={themedStyles.fallbackContainer}>
                <Text style={themedStyles.fallbackText}>No book added yet!</Text>
            </View>
        );
    }


    return (
        <SafeAreaView style={themedStyles.bookListScreen}>
            {title && (
                <FlatList
                    data={title}
                    renderItem={({ item }) => (
                        <View style={themedStyles.rootContainer}>
                            <Pressable 
                                onPress={() => {
                                    const metadata = meta && meta.find(m => m.title === item)?.metadata 
                                        ? meta.find(m => m.title === item).metadata 
                                        : null;
                                    readBookHandler(item, metadata);
                                }} 
                                android_ripple={{color: theme.btnNavigationHover}} 
                                style={({pressed}) => [themedStyles.bookPressableContainer, pressed && themedStyles.pressed]}
                            >
                                <View style={themedStyles.bookContainer}>
                                    <View style={themedStyles.bookInfoContainer}>
                                        <View style={themedStyles.bookImgContainer}>
                                            {meta && meta.find(m => m.title === item)?.metadata?.coverImage ? (
                                                <Image 
                                                    style={themedStyles.bookImg} 
                                                    source={{uri: `data:image/jpeg;base64,${meta.find(m => m.title === item).metadata.coverImage}`}} 
                                                    resizeMode="contain"
                                                />
                                            ) : (
                                                <Image style={themedStyles.bookImg} source={require('../assets/bookDefaultCover.png')} />
                                            )}
                                        </View>
                                        <View style={themedStyles.bookContentContainer}>
                                            <ScrollingText style={themedStyles.bookTitle} title={
                                                meta && meta.find(m => m.title === item)?.metadata?.title ? 
                                                meta.find(m => m.title === item).metadata.title : 
                                                item.substring(0, item.length - 7)
                                            } />
                                            {meta && meta.find(m => m.title === item)?.metadata && (
                                                <>
                                                    {meta.find(m => m.title === item).metadata.author && (
                                                        <ScrollingText style={themedStyles.bookAuthor} title={meta.find(m => m.title === item).metadata.author} />
                                                    )}
                                                    {meta.find(m => m.title === item).metadata.isbn && (
                                                        <ScrollingText
                                                            marqueeDelay={15000}
                                                            repeatSpacer={20}
                                                            duration={4000}
                                                            style={themedStyles.bookIsbn}
                                                            onPress={() => Linking.openURL(`https://www.google.com/search?q=isbn+${meta.find(m => m.title === item).metadata.isbn}`)}
                                                            title={`ISBN: ${meta.find(m => m.title === item).metadata.isbn}`}
                                                        />
                                                    )}
                                                </>
                                            )}
                                            <View style={themedStyles.spacer} />
                                            {meta && meta.find(m => m.title === item)?.metadata?.pageCount && (
                                                <Text style={themedStyles.bookPages}>{meta.find(m => m.title === item).metadata.pageCount} pages</Text>
                                            )}
                                        </View>
                                    </View>
                                    <View style={themedStyles.bookOptionsContainer}>
                                        <Pressable onPress={() => addToFavoritesHandler(item)} android_ripple={{color: theme.yellow400}} style={({pressed}) => pressed && themedStyles.pressed}>
                                            <Fontisto style={{padding: 6}} name="favorite" size={28} color={localFavorites.has(item) ? theme.yellow400 : theme.iconButton} />
                                        </Pressable>
                                        <MaterialIcons style={{padding: 6}} onPress={() => preDeleteBookHandler(item, meta.find(m => m.title === item)?.metadata?.title || item.substring(0, item.length - 7))} name="delete-forever" size={28} color={KolorKit.defaultColors.error500} />
                                    </View>
                                </View>
                            </Pressable>
                        </View>
                    )}
                    keyExtractor={(index) => index.toString()}
                />
            )}

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
        </SafeAreaView>
    );
}