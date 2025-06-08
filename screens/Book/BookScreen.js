import { useCallback, useContext, useEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, FlatList, Alert, Pressable, TextInput, Animated, Easing, ScrollView, Image, Linking } from "react-native";
import { KolorKit } from "../../constants/styles";
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import ScrollingText from "../../components/ui/ScrollingText";
import RNRestart from 'react-native-restart';
import FullScreenImage from "../../components/ui/FullScreenImage";
import BookLoader from "../../assets/SVG/BookLoader";
import useTheme from "../../hooks/useTheme";

import LoadingOverlay from "../../components/ui/LoadingOverlay";
import AwesomeAlert from "../../components/ui/AwesomeAlert";

import { ValueContext } from "../../store/value-context";
import { getBook, fetchBookmarks, getBookmark, updateBookmarkNumber, deleteBookmarkNumber, updateReadBookName } from "../../util/http";


const renderTextWithLineBreaksParagraphs = (text) => {
    if (!text) return null;

    // Split the text by <br /> tags
    const parts = text.split(/<br\s*\/?>|<br\s*>/i);

    return parts.map((part, index) => (
        <Text key={index}>
            {part.trim()}
            {index === 0 && '    '}
            {index > 0 && index < parts.length - 1 && '\n    '}
        </Text>
    ));
};


export default function BookScreen({route, navigation}) {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [metadataReady, setMetadataReady] = useState(false);
    const [isImageViewVisible, setIsImageViewVisible] = useState(false);

    const [alertConfig, setAlertConfig] = useState({
        show: false,
        title: '',
        message: '',
        showCancelButton: false,
        showConfirmButton: true,
        onCancelPressed: null,
        onConfirmPressed: null,
        confirmText: 'Ok',
        cancelText: 'Cancel',
        shouldCloseOnOverClick: false,
        closeOnHardwareBackPress: false,
    });

    const bookCtx = useContext(ValueContext);
    const { selectedBook, bookmarkIndex, setBookmarkIndex, bookmark, setBookmark, setBookmarkNumbers, readFileTitle, setReadFileTitle, selectedBookMetadata, appTheme } = bookCtx;

    const editedBookId = route.params?.bookId;
    const showAlert = (config) => {
        setAlertConfig(prev => ({
            ...prev,
            show: true,
            onConfirmPressed: () => hideAlert(),
            onCancelPressed: () => hideAlert(),
            ...config,
        }));
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, show: false }));
    };

    const [bookData, setBookData] = useState(null);
    const [showDeletedBookMetadata, setShowDeletedBookMetadata] = useState(false);
    const selectedBookLast7Chars = selectedBook.slice(-7);

    const opacity = new Animated.Value(0);
    const translateY = new Animated.Value(0);

    const [timerActive, setTimerActive] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [renderBookData, setRenderBookData] = useState([]);
    const [startRead, setStartRead] = useState(false);
    const [readPaused, setReadPaused] = useState(false);
    const [speedWordsValue, setSpeedWordsValue] = useState(180);
    const [textSizeValue, setTextSizeValue] = useState(28);
    const [paddingTopValue, setPaddingTopValue] = useState({});
    const [colorBlackBlue, setColorBlackBlue] = useState(appTheme === 'blackBlueTheme' ? true : false);
    const [colorDark, setColorDark] = useState(appTheme === 'darkTheme' ? true : false);
    const [colorLight, setColorLight] = useState(appTheme === 'lightTheme' ? true : false);
    const [backgroundColorScheme, setBackgroundColorScheme] = useState({});
    const [textColorScheme, setTextColorScheme] = useState({});
    const [wordContainerBackgroundColorScheme, setWordContainerBackgroundColorScheme] = useState({});
    const [mark, setMark] = useState(null);
    const [viewBookHistory, setViewBookHistory] = useState(false);

    let timeoutId = null;
    let growthFactor;
    if (speedWordsValue < 100) {
        growthFactor = speedWordsValue * 0.153;
    } else if (speedWordsValue >= 100 && speedWordsValue < 200) {
        growthFactor = speedWordsValue * 0.1576;
    } else if (speedWordsValue >= 200 && speedWordsValue < 400) {
        growthFactor = speedWordsValue * 0.162;
    } else if (speedWordsValue >= 400 && speedWordsValue < 600) {
        growthFactor = speedWordsValue * 0.1647;
    } else if (speedWordsValue >= 600 && speedWordsValue < 700) {
        growthFactor = speedWordsValue * 0.168;
    } else if (speedWordsValue >= 700 && speedWordsValue < 800){
        growthFactor = speedWordsValue * 0.1694;
    } else if (speedWordsValue >= 800 && speedWordsValue < 1000) {
        growthFactor = speedWordsValue * 0.1706;
    } else if (speedWordsValue >= 1000 && speedWordsValue < 1200) {
        growthFactor = speedWordsValue * 0.1731;
    } else if (speedWordsValue >= 1200 && speedWordsValue <= 1400) {
        growthFactor = speedWordsValue * 0.176;
    } else if (speedWordsValue > 1400) {
        growthFactor = speedWordsValue * 0.1805;
    }
    const growthWords = speedWordsValue + growthFactor;
    const speedWords = 60000 / growthWords;

    const wordTitle = { fontSize: textSizeValue };
    const bookScreen = backgroundColorScheme;
    const textColor = textColorScheme;
    const wordContainerBackgroundColor = wordContainerBackgroundColorScheme;
    // let flatListRef = null;

    const themedStyles = StyleSheet.create({
        readSettingsBox: {
            backgroundColor: theme.backgroundApp,
            flexDirection: 'column',
            borderWidth: 1,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            borderColor: theme.lineDark,
        },
        readSettingsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: 50,
            marginBottom: 8,
        },
        readSettingsLabel: {
            alignSelf: 'flex-end',
            marginBottom: 10,
            fontSize: 12,
            color: theme.numeric,
        },
        speedWordsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        speedWordsInput: {
            backgroundColor: theme.backgroundBox,
            marginHorizontal: 4,
        },
        textSizeContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        textSizeInput: {
            backgroundColor: theme.backgroundBox,
            marginHorizontal: 4,
        },
        wordsCountContainer: {
            height: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        wordsCount: {
            fontSize: 14,
            color: theme.numeric,
            marginHorizontal: 4,
        },
        colorSchemeBox: {
            marginHorizontal: 4,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        colorSchemeContainer: {
            marginHorizontal: 15,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        },
        colorSchemeTitle: {
            fontSize: 14,
            color: theme.numeric,
        },
        history_bookmark_box: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-evenly',
        },
        bookHistoryContainer: {
            marginHorizontal: 4,
        },
        bookmarkBox: {
            marginHorizontal: 4,
        },
        bookmarkContainer: {
            marginHorizontal: 4,
        },
        pressed: {
            opacity: 0.7,
        },
        btnResume: {
            padding: 4,
        },
        btnPause: {
            padding: 4,
        },
        btnStart: {
            width: 200,
            marginVertical: 30,
            backgroundColor: theme.yellow400,
            justifyContent: 'center',
            alignSelf: 'center',
            padding: 12,
            borderRadius: 8,
            elevation: 3,
        },
        btnStartContainer: {
            alignSelf: 'center',
        },
        btnStartTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.btnText,
        },
        btnStartLoadingContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        bookPreviewContainer: {
            flexDirection: 'row',
            padding: 16,
            backgroundColor: theme.backgroundBox,
            marginHorizontal: 12,
            marginTop: 16,
            borderRadius: 8,
            elevation: 2,
        },
        bookCoverContainer: {
            width: '35%',
        },
        bookCoverImage: {
            width: '100%',
            height: 220,
            borderRadius: 6,
        },
        bookDetailsContainer: {
            width: '65%',
            paddingLeft: 16,
            justifyContent: 'flex-start',
        },
        bookTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.textWhite,
            marginBottom: 8,
        },
        bookAuthor: {
            fontSize: 16,
            fontStyle: 'italic',
            color: theme.textWhite,
            opacity: 0.9,
            marginBottom: 6,
        },
        bookPages: {
            fontSize: 14,
            color: theme.numeric,
            marginBottom: 6,
        },
        bookIsbn: {
            fontSize: 14,
            fontStyle: 'italic',
            color: theme.yellow800,
            textDecorationLine: 'underline',
            marginBottom: 12,
        },
        language: {
            fontSize: 14,
            color: theme.yellow300,
        },
        languageContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 6,
            marginBottom: 10,
        },
        languageBadge: {
            backgroundColor: theme.backgroundBox,
            borderWidth: 1,
            borderColor: theme.yellow300,
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 3,
            marginRight: 8,
            marginBottom: 6,
        },
        languageText: {
            fontSize: 12,
            color: theme.yellow300,
            fontWeight: '600',
        },
        languageLabel: {
            fontSize: 13,
            color: theme.yellow500,
            marginBottom: 4,
        },
        bookAnnotationWrapper: {
            backgroundColor: theme.backgroundBox,
            marginHorizontal: 12,
            marginTop: 16,
            borderRadius: 8,
            padding: 16,
            elevation: 2,
        },
        bookAnnotationHeader: {
            marginBottom: 12,
        },
        bookAnnotationTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.yellow800,
            marginBottom: 4,
        },
        bookAnnotationDivider: {
            height: 2,
            backgroundColor: theme.yellow800,
            width: 60,
            marginTop: 4,
        },
        bookAnnotationContainer: {
            
        },
        bookAnnotationText: {
            fontSize: 15,
            lineHeight: 22,
            color: theme.textWhite,
            opacity: 0.95,
            textAlign: 'justify',
        },
        metadataSection: {
            marginBottom: 6,
            paddingBottom: 6,
            borderBottomWidth: 1,
            borderBottomColor: theme.lineDark,
        },
        metadataLabel: {
            fontSize: 13,
            fontWeight: 'bold',
            color: theme.yellow500,
            marginBottom: 2,
        },
        metadataText: {
            fontSize: 13,
            color: theme.textWhite,
            opacity: 0.9,
            fontStyle: 'italic',
        },
        metadataHeader: {
            marginBottom: 12,
            paddingBottom: 6,
            borderBottomWidth: 1,
            borderBottomColor: theme.lineDark,
        },
        metadataHeaderText: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.yellow800,
            marginBottom: 4,
        },
        metadataHeaderDivider: {
            height: 2,
            backgroundColor: theme.yellow800,
            width: 60,
            marginTop: 4,
        },
        outputBookDataContainer: {

        },
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setMetadataReady(true);
        }, 100);

        return () => clearTimeout(timer);
    }, [selectedBookMetadata]);

    useEffect(() => {
        async function fetchBookData() {
            setLoading(true);
            try {
                const bookData = await getBook(bookCtx.uid, editedBookId, selectedBook);
                if (Object.keys(bookData).length > 0) {
                    setBookData(bookData);
                    if (selectedBookLast7Chars === 'txtType' || selectedBookLast7Chars === 'xmlType') {
                        const filteredData = Object.entries(bookData)
                            .filter(([key]) => key !== 'bookMetadata' && key !== 'metadata')
                            .map(([_, value]) => value);
                        setRenderBookData(filteredData);
                    }
                } else {
                    setBookData(null);
                    setRenderBookData([]);
                    setShowDeletedBookMetadata(true);
                    showAlert({
                        title: 'It looks like you have already deleted this book.',
                        message: 'Deleted books are not removed from the Read and Favorites for collection catalogs. You can exclude a book from the catalog, thereby the trace of its existence will disappear forever.',
                        shouldCloseOnOverClick: true,
                        closeOnHardwareBackPress: true
                    });
                }
                console.log('fetchBookData successfully');
                setLoading(false);
            } catch (error) {
                showAlert({
                    title: 'Could not find this book. Please try again later!',
                    confirmText: 'Go back',
                    onConfirmPressed: () => {
                        navigation.goBack();
                    }
                });
                console.error('Could not get book data: ', error);
                setLoading(false);
            }
        }
        fetchBookData();
    }, [editedBookId]);

    timeoutId = timerActive && setTimeout(() => {
        setCurrentIndex((currentIndex + 1) % renderBookData.length);
    }, speedWords);

    useEffect(() => {
        if (timerActive && !readPaused) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                Animated.timing(translateY, {
                    toValue: -5,
                    duration: speedWords,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                    useNativeDriver: true,
                }).start(() => {
                    setCurrentIndex((currentIndex + 1) % renderBookData.length);
                    translateY.setValue(5);
                    opacity.setValue(0);
                })
            }, speedWords);
        } else {
            translateY.setValue(5);
            opacity.setValue(0);
            clearTimeout(timeoutId);
        }
    }, [timerActive, readPaused, speedWords, textSizeValue, bookmarkIndex, bookCtx.updateBookmarkNumber, bookmark, colorBlackBlue, colorDark, colorLight, backgroundColorScheme, textColorScheme, wordContainerBackgroundColorScheme, viewBookHistory, alertConfig]);

    useEffect(() => {
        if (timerActive || readPaused) {
            clearTimeout(timeoutId);
        }
    }, [timerActive, readPaused]);

    useEffect(() => {
        if (currentIndex < renderBookData.length) {
            Animated.timing(opacity, {
                toValue: 1,
                duration: speedWords,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start();
        }
    }, [currentIndex, speedWords]);

    useEffect(() => {
        if (colorBlackBlue) {
            setBackgroundColorScheme({
                flex: 1,
                backgroundColor: KolorKit.blackBlueTheme.backgroundApp
            });
            setTextColorScheme({
                color: KolorKit.blackBlueTheme.textWhite
            });
            setWordContainerBackgroundColorScheme({
                backgroundColor: KolorKit.blackBlueTheme.backgroundBox,
                borderRadius: 80
            });
        } else if (colorDark) {
            setBackgroundColorScheme({
                flex: 1,
                backgroundColor: KolorKit.blackBlueTheme.backgroundBoxBlack
            });
            setTextColorScheme({
                color: KolorKit.blackBlueTheme.textWhite
            });
            setWordContainerBackgroundColorScheme({});
        } else if (colorLight) {
            setBackgroundColorScheme({
                flex: 1,
                backgroundColor: KolorKit.blackBlueTheme.backgroundBoxWhite
            });
            setTextColorScheme({
                color: KolorKit.blackBlueTheme.textBlack
            });
            setWordContainerBackgroundColorScheme({});
        }
    }, [colorBlackBlue, colorDark, colorLight]);

    useEffect(() => {
        if (bookmarkIndex && bookmarkIndex > 0) {
            const sortedBookmark = [...new Set([selectedBook + '_' + bookmarkIndex, ...bookmark])];
            setBookmark(sortedBookmark);
        }
    }, [bookmarkIndex]);

    useEffect(() => {
        if (bookmark) {
            try {
                bookCtx.updateBookmarkNumber(editedBookId, bookmark);
                if (selectedBook === bookmark[0].split('_')[0]) {
                    updateBookmarkNumber(bookCtx.uid, selectedBook, bookmark);
                }
                console.log('bookmarkNumbers uploaded successfully');
            } catch (e) {
                if (e.message !== "Cannot read property 'split' of undefined") {
                    console.log('Error uploading bookmarkNumbers array to database: ', e);
                }
            }
        }
    }, [bookmark]);

    const getBookmarksCallback = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedBookmarks = await fetchBookmarks(bookCtx.uid, selectedBook);
            setBookmarkNumbers(fetchedBookmarks);
            console.log('getBookmarks successfully');
            setLoading(false);
        } catch (error) {
            console.error('Could not get bookmarks: ', error);
            setLoading(false);
        }
    }, [selectedBook]);
    useEffect(() => {
        getBookmarksCallback();
    }, [getBookmarksCallback]);

    const fetchBookmarksCallback = useCallback(async () => {
        setLoading(true);
        try {
            const marks = await getBookmark(bookCtx.uid, selectedBook, editedBookId);
            setMark(marks);
            console.log('fetchBookmarks successfully');
            setLoading(false);
        } catch (error) {
            console.error('Could not fetch bookmarks: ', error);
            setLoading(false);
        }
    }, [editedBookId]);
    useEffect(() => {
        fetchBookmarksCallback();
    }, [fetchBookmarksCallback]);

    useEffect(() => {
        if (currentIndex === renderBookData.length - 2) {
            navigation.setOptions({
                headerShown: true
            });
            setPaddingTopValue({});
            if (timerActive) {
                setReadPaused(true);
                clearTimeout(timeoutId);
            }
            try {
                bookCtx.deleteSelectedBookBookmarks();

                bookCtx.deleteBookmarkNumber(editedBookId);
                deleteBookmarkNumber(bookCtx.uid, selectedBook);
                console.log('Delete bookmarks successfully');
            } catch (e) {
                console.error('Could not delete bookmarks: ', e);
            }

            try {
                const sortedReadFileTitle = [...new Set([selectedBook, ...readFileTitle])];
                setReadFileTitle(sortedReadFileTitle);
            } catch (e) {
                console.log('Could not add book to read', e);
            }

            showAlert({
                title: 'Congratulations!',
                message: 'The book has been successfully read',
                showCancelButton: false,
                showConfirmButton: true,
                onConfirmPressed: () => {
                    RNRestart.Restart();
                },
                showCancelButton: true,
                cancelText: 'Hide'
            });
        }
    }, [currentIndex]);

    useEffect(() => {
        if (readFileTitle) {
            try {
                bookCtx.updateReadBookName(editedBookId, readFileTitle);
                updateReadBookName(bookCtx.uid, readFileTitle);
                console.log('readFileNames uploaded successfully');
            } catch (e) {
                console.log('Error uploading readFileNames array to database: ', e);
            }
        }
    }, [readFileTitle]);

    // function scrollToTheEnd() {
    //     try {
    //         if (currentIndex >= 8 && flatListRef) {
    //             setTimeout(() => {
    //                 flatListRef.scrollToEnd();
    //             }, 1000);
    //         }
    //     } catch (e) {
    //         console.error('Error scrolling to the end: ', e);
    //     }
    // };

    useEffect(() => {
        if (!showDeletedBookMetadata) {
            while (!renderBookData && renderBookData.length <= 0) {
                setLoading(true);
            }
        }
    }, [showDeletedBookMetadata]);

    if (loading) {
        return <LoadingOverlay message='Extracting file...' />
    }


    const outputBookData = bookData ? (
        selectedBookLast7Chars === 'txtType' ? (
            renderBookData && renderBookData.length > 0 ? (
                <View style={styles.contentContainer}>
                    {viewBookHistory && (
                        <View style={styles.viewBookHistoryBox}>
                            <FlatList
                                data={Object.entries(bookData)
                                    .filter(([key]) => key !== 'bookMetadata' && key !== 'metadata')
                                    .map(([_, value]) => value)
                                    .slice(Math.max(0, currentIndex - 53), currentIndex + 1)}
                                renderItem={({ item }) => (
                                    <View style={[wordContainerBackgroundColor, styles.viewBookHistoryContainer]}>
                                        <Text style={[wordTitle, textColor]}>
                                            {Array.isArray(item.item) ? item.item.join(' ') : item.item}
                                        </Text>
                                    </View>
                                )}
                                keyExtractor={(item) => item.index.toString()}
                                // onLayout={scrollToTheEnd}
                                // ref={(ref) => { flatListRef = ref; }}
                            />
                        </View>
                    )}
                    <View style={[styles.wordContainer, viewBookHistory ? styles.wordContainer : styles.wordBox, wordContainerBackgroundColor]}>
                        {!readPaused ? (
                            <Animated.Text style={[wordTitle, textColor, { transform: [{ translateY: translateY }], opacity: opacity }]}>
                                {renderBookData[currentIndex].item?.join(' ')}
                            </Animated.Text>
                        ) : (
                            <Text style={[wordTitle, textColor]}>
                                {renderBookData[currentIndex].item?.join(' ')}
                            </Text>
                        )}
                    </View>
                </View>
            ) : null
        ) : selectedBookLast7Chars === 'xmlType' ? (
            renderBookData && renderBookData.length > 0 ? (
                <View style={styles.contentContainer}>
                    {viewBookHistory && (
                        <View style={styles.viewBookHistoryBox}>
                            <FlatList
                                data={Object.entries(bookData)
                                    .filter(([key]) => key !== 'bookMetadata' && key !== 'metadata')
                                    .map(([_, value]) => value)
                                    .slice(Math.max(0, currentIndex - 53), currentIndex + 1)}
                                renderItem={({ item }) => (
                                    <View style={[wordContainerBackgroundColor, styles.viewBookHistoryContainer]}>
                                        <Text style={[wordTitle, textColor]}>
                                            {Array.isArray(item.item) ? item.item.join(' ') : item.item}
                                        </Text>
                                    </View>
                                )}
                                keyExtractor={(item) => item.index.toString()}
                                // onLayout={scrollToTheEnd}
                                // ref={(ref) => { flatListRef = ref; }}
                            />
                        </View>
                    )}
                    <View style={[styles.wordContainer, viewBookHistory ? styles.wordContainer : styles.wordBox, wordContainerBackgroundColor]}>
                        {!readPaused ? (
                            <Animated.Text style={[wordTitle, textColor, { transform: [{ translateY: translateY }], opacity: opacity }]}>
                                {Array.isArray(renderBookData[currentIndex].item) ? renderBookData[currentIndex].item.join(' ') : renderBookData[currentIndex].item}
                            </Animated.Text>
                        ) : (
                            <Text style={[wordTitle, textColor]}>
                                {Array.isArray(renderBookData[currentIndex].item) ? renderBookData[currentIndex].item.join(' ') : renderBookData[currentIndex].item}
                            </Text>
                        )}
                    </View>
                </View>
            ) : null
        ) : (
            <View style={[styles.wordContainer, wordContainerBackgroundColor]}>
                <Text style={[wordTitle, textColor]}>Something went wrong! This format is unsupported. Please delete it.</Text>
            </View>
        )
    ) : null;


    function startReadHandler() {
        navigation.setOptions({
            headerShown: false
        });
        setPaddingTopValue({ paddingTop: '10%' });
        setStartRead(true);
        setTimerActive(true);
        if (mark !== null) {
            const markIndex = parseInt(mark[0].split(selectedBook + '_')[1]);
            timeoutId = setTimeout(() => {
                setCurrentIndex((markIndex) % renderBookData.length);
            }, speedWords);
        } else {
            timeoutId = setTimeout(() => {
                setCurrentIndex((currentIndex + 1) % renderBookData.length);
            }, speedWords);
        }
    }

    function pauseReadHandler() {
        navigation.setOptions({
            headerShown: true
        });
        setPaddingTopValue({});
        if (timerActive) {
            setReadPaused(true);
            clearTimeout(timeoutId);
        }
    }

    function resumeReadHandler() {
        navigation.setOptions({
            headerShown: false
        });
        setPaddingTopValue({ paddingTop: '10%' });
        if (viewBookHistory) {
            setViewBookHistory(false);
        }
        if (timerActive) {
            setReadPaused(false);
            timeoutId = setTimeout(() => {
                if (currentIndex - 3 > 0 && speedWordsValue <= 260) {
                    setCurrentIndex((currentIndex - 2) % renderBookData.length);
                } else if (currentIndex - 6 > 0 && speedWordsValue > 260 && speedWordsValue <= 540) {
                    setCurrentIndex((currentIndex - 5) % renderBookData.length);
                } else if (currentIndex - 9 > 0 && speedWordsValue > 540 && speedWordsValue <= 720) {
                    setCurrentIndex((currentIndex - 8) % renderBookData.length);
                } else if (currentIndex - 12 > 0 && speedWordsValue > 720 && speedWordsValue <= 900) {
                    setCurrentIndex((currentIndex - 11) % renderBookData.length);
                } else if (currentIndex - 18 > 0 && speedWordsValue > 900 && speedWordsValue <= 1440) {
                    setCurrentIndex((currentIndex - 17) % renderBookData.length);
                } else if (currentIndex - 24 > 0 && speedWordsValue > 1440) {
                    setCurrentIndex((currentIndex - 23) % renderBookData.length);
                } else {
                    setCurrentIndex(0);
                }
            }, speedWords);
        }
    }

    function speedWordsHandler(enteredText) {
        if (enteredText !== '' && enteredText !== '0' && enteredText > 0) {
            setSpeedWordsValue(parseInt(enteredText, 10));
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    }

    function textSizeHandler(enteredText) {
        if (enteredText !== '' && enteredText !== '0' && enteredText > 0) {
            setTextSizeValue(parseInt(enteredText, 10));
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    }

    function bookmarkHandler() {
        setBookmarkIndex(currentIndex);
        showAlert({
            title: 'Bookmark added!',
            message: `You have successfully created a bookmark in position: ${currentIndex + 1}.`,
            onConfirmPressed: () => {
                hideAlert();
                setTimeout(() => {
                    RNRestart.Restart();
                }, 100);
            },
            showCancelButton: true,
            cancelText: 'Continue reading'
        });
    }

    function colorSchemeBlackBlueHandler() {
        setColorBlackBlue(true);
        setColorDark(false);
        setColorLight(false);
    }
    function colorSchemeDarkHandler() {
        setColorBlackBlue(false);
        setColorDark(true);
        setColorLight(false);
    }
    function colorSchemeLightHandler() {
        setColorBlackBlue(false);
        setColorDark(false);
        setColorLight(true);
    }

    function viewBookHistoryHandler() {
        setViewBookHistory(false);
    }
    function stopViewBookHistoryHandler() {
        setViewBookHistory(true);
    }



    if (startRead) {
        return (
            <SafeAreaView style={[bookScreen, paddingTopValue]}>
                <View style={themedStyles.readSettingsBox}>
                    <View style={themedStyles.readSettingsContainer}>
                        <View style={themedStyles.textSizeContainer}>
                            <TextInput
                                style={themedStyles.textSizeInput}
                                onChangeText={textSizeHandler}
                                value={textSizeValue.toString()}
                                placeholder="28"
                                maxLength={2}
                                placeholderTextColor={theme.numeric}
                                keyboardType="numeric"
                                color={theme.numeric}
                                autoCorrect={false}
                                autoComplete="off"
                            />
                            <Text style={themedStyles.readSettingsLabel}>px</Text>
                        </View>
                        <View style={themedStyles.speedWordsContainer}>
                            <TextInput
                                style={themedStyles.speedWordsInput}
                                onChangeText={speedWordsHandler}
                                value={speedWordsValue.toString()}
                                placeholder="180"
                                maxLength={5}
                                placeholderTextColor={theme.numeric}
                                keyboardType="numeric"
                                color={theme.numeric}
                                autoCorrect={false}
                                autoComplete="off"
                            />
                            <Text style={themedStyles.readSettingsLabel}>words in min</Text>
                        </View>
                        {readPaused ? (
                            <Pressable onPress={resumeReadHandler} android_ripple={{color: theme.btnNavigationHover}} style={({pressed}) => [themedStyles.btnResume, pressed && themedStyles.pressed]}>
                                <Feather name="play" size={34} color={theme.numeric} />
                            </Pressable>
                        ) : (
                            <Pressable onPress={pauseReadHandler} android_ripple={{color: theme.btnNavigationHover}} style={({pressed}) => [themedStyles.btnPause, pressed && themedStyles.pressed]}>
                                <Feather name="pause" size={34} color={theme.numeric} />
                            </Pressable>
                        )}
                        {renderBookData && renderBookData.length > 0 && (
                            <View style={themedStyles.wordsCountContainer}>
                                <Text style={themedStyles.wordsCount}>{currentIndex + 1} / {renderBookData.length - 1}</Text>
                                <Text style={themedStyles.readSettingsLabel}> words</Text>
                            </View>
                        )}
                    </View>
                    {readPaused && (
                        <View style={themedStyles.readSettingsContainer}>
                            <View style={themedStyles.colorSchemeBox}>
                                <Pressable onPress={colorSchemeBlackBlueHandler} android_ripple={{color: theme.yellow400}} style={({pressed}) => [themedStyles.colorSchemeContainer, pressed && themedStyles.pressed]}>
                                    <View style={styles.colorSchemeBlackBlue}></View>
                                    <Text style={themedStyles.colorSchemeTitle}>Black Blue</Text>
                                </Pressable>
                                <Pressable onPress={colorSchemeDarkHandler} android_ripple={{color: theme.yellow400}} style={({pressed}) => [themedStyles.colorSchemeContainer, pressed && themedStyles.pressed]}>
                                    <View style={styles.colorSchemeDark}></View>
                                    <Text style={themedStyles.colorSchemeTitle}>Dark</Text>
                                </Pressable>
                                <Pressable onPress={colorSchemeLightHandler} android_ripple={{color: theme.yellow400}} style={({pressed}) => [themedStyles.colorSchemeContainer, pressed && themedStyles.pressed]}>
                                    <View style={styles.colorSchemeLight}></View>
                                    <Text style={themedStyles.colorSchemeTitle}>Light</Text>
                                </Pressable>
                            </View>
                            <View style={themedStyles.history_bookmark_box}>
                                <View style={themedStyles.bookHistoryContainer}>
                                    {viewBookHistory ? (
                                        <Pressable onPress={viewBookHistoryHandler} android_ripple={{color: theme.yellow400}} style={({pressed}) => [themedStyles.colorSchemeContainer, pressed && themedStyles.pressed]}>
                                            <MaterialIcons name="history-toggle-off" size={28} color={theme.numeric} />
                                        </Pressable>
                                    ) : (
                                        <Pressable onPress={stopViewBookHistoryHandler} android_ripple={{color: theme.yellow400}} style={({pressed}) => [themedStyles.colorSchemeContainer, pressed && themedStyles.pressed]}>
                                            <MaterialIcons name="history" size={28} color={theme.numeric} />
                                        </Pressable>
                                    )}
                                </View>
                                <View style={themedStyles.bookmarkBox}>
                                    <Pressable onPress={bookmarkHandler} android_ripple={{color: theme.yellow400}} style={({pressed}) => [themedStyles.bookmarkContainer, pressed && themedStyles.pressed]}>
                                        <Feather name="bookmark" size={28} color={theme.numeric} />
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
                <ScrollView style={themedStyles.outputBookDataContainer}>
                    {outputBookData}
                </ScrollView>

                <AwesomeAlert
                    show={alertConfig.show}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    showCancelButton={alertConfig.showCancelButton}
                    showConfirmButton={alertConfig.showConfirmButton}
                    onCancelPressed={alertConfig.onCancelPressed}
                    onConfirmPressed={alertConfig.onConfirmPressed}
                    confirmText={alertConfig.confirmText}
                    cancelText={alertConfig.cancelText}
                    shouldCloseOnOverClick={alertConfig.shouldCloseOnOverClick}
                    closeOnHardwareBackPress={alertConfig.closeOnHardwareBackPress}
                />
            </SafeAreaView>
        );
    }



    return (
        <SafeAreaView style={bookScreen}>
            <View style={themedStyles.readSettingsBox}>
                <View style={themedStyles.readSettingsContainer}>
                    <View style={themedStyles.textSizeContainer}>
                        <TextInput
                            style={themedStyles.textSizeInput}
                            onChangeText={textSizeHandler}
                            value={textSizeValue.toString()}
                            placeholder="28"
                            maxLength={2}
                            placeholderTextColor={theme.numeric}
                            keyboardType="numeric"
                            color={theme.numeric}
                            autoCorrect={false}
                            autoComplete="off"
                        />
                        <Text style={themedStyles.readSettingsLabel}>px</Text>
                    </View>
                    <View style={themedStyles.speedWordsContainer}>
                        <TextInput
                            style={themedStyles.speedWordsInput}
                            onChangeText={speedWordsHandler}
                            value={speedWordsValue.toString()}
                            placeholder="180"
                            maxLength={5}
                            placeholderTextColor={theme.numeric}
                            keyboardType="numeric"
                            color={theme.numeric}
                            autoCorrect={false}
                            autoComplete="off"
                        />
                        <Text style={themedStyles.readSettingsLabel}>words in min</Text>
                    </View>
                    {!showDeletedBookMetadata && renderBookData && renderBookData.length > 0 ? (
                        <View style={themedStyles.wordsCountContainer}>
                            <Text style={themedStyles.wordsCount}>{currentIndex + 1} / {renderBookData.length - 1}</Text>
                            <Text style={themedStyles.readSettingsLabel}> words</Text>
                        </View>
                    ) : (
                        <View style={themedStyles.wordsCountContainer}>
                            <Text style={themedStyles.wordsCount}>{metadataReady && selectedBookMetadata ? selectedBookMetadata.pageCount : ''}</Text>
                            <Text style={themedStyles.readSettingsLabel}> pages</Text>
                        </View>
                    )}
                </View>
                <View style={themedStyles.readSettingsContainer}>
                    <View style={themedStyles.colorSchemeBox}>
                        <Pressable onPress={colorSchemeBlackBlueHandler} android_ripple={{color: theme.yellow400}} style={({pressed}) => [themedStyles.colorSchemeContainer, pressed && themedStyles.pressed]}>
                            <View style={styles.colorSchemeBlackBlue}></View>
                            <Text style={themedStyles.colorSchemeTitle}>Black Blue</Text>
                        </Pressable>
                        <Pressable onPress={colorSchemeDarkHandler} android_ripple={{color: theme.yellow400}} style={({pressed}) => [themedStyles.colorSchemeContainer, pressed && themedStyles.pressed]}>
                            <View style={styles.colorSchemeDark}></View>
                            <Text style={themedStyles.colorSchemeTitle}>Dark</Text>
                        </Pressable>
                        <Pressable onPress={colorSchemeLightHandler} android_ripple={{color: theme.yellow400}} style={({pressed}) => [themedStyles.colorSchemeContainer, pressed && themedStyles.pressed]}>
                            <View style={styles.colorSchemeLight}></View>
                            <Text style={themedStyles.colorSchemeTitle}>Light</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
            <ScrollView>
                {metadataReady && selectedBookMetadata && (
                    <View style={themedStyles.bookPreviewContainer}>
                        <View style={themedStyles.bookCoverContainer}>
                            {selectedBookMetadata.coverImage ? (
                                <Pressable onPress={() => setIsImageViewVisible(true)}>
                                    <Image 
                                        style={themedStyles.bookCoverImage} 
                                        source={{uri: `data:image/jpeg;base64,${selectedBookMetadata.coverImage}`}}
                                        resizeMode="contain"
                                    />
                                </Pressable>
                            ) : (
                                <Pressable onPress={() => setIsImageViewVisible(true)}>
                                    <Image 
                                        style={themedStyles.bookCoverImage} 
                                        source={require('../../assets/bookDefaultCover.png')} 
                                    />
                                </Pressable>
                            )}
                        </View>
                        <View style={themedStyles.bookDetailsContainer}>
                            {selectedBookMetadata.title ? (
                                <ScrollingText
                                    style={themedStyles.bookTitle}
                                    marqueeDelay={3000}
                                    repeatSpacer={30}
                                    title={selectedBookMetadata.title}
                                />
                            ) : (
                                <ScrollingText
                                    style={themedStyles.bookTitle}
                                    marqueeDelay={3000}
                                    repeatSpacer={30}
                                    title={selectedBook.substring(0, selectedBook.length - 7)}
                                />
                            )}
                            {selectedBookMetadata.author && (
                                <ScrollingText
                                    style={themedStyles.bookAuthor}
                                    marqueeDelay={3000}
                                    repeatSpacer={30}
                                    title={selectedBookMetadata.author}
                                />
                            )}
                            {selectedBookMetadata.pageCount && (
                                <Text style={themedStyles.bookPages}>{selectedBookMetadata.pageCount} pages</Text>
                            )}
                            {selectedBookMetadata.isbn && (
                                <ScrollingText
                                    style={themedStyles.bookIsbn}
                                    marqueeDelay={15000}
                                    repeatSpacer={20}
                                    duration={4000}
                                    title={`ISBN: ${selectedBookMetadata.isbn}`}
                                    onPress={() => Linking.openURL(`https://www.google.com/search?q=isbn+${selectedBookMetadata.isbn}`)}
                                />
                            )}
                            {(selectedBookMetadata.language || selectedBookMetadata.origin_language) && (
                                <View style={themedStyles.metadataSection}>
                                    <Text style={themedStyles.languageLabel}>Languages:</Text>
                                    <View style={themedStyles.languageContainer}>
                                        {selectedBookMetadata.origin_language && (
                                            <View style={themedStyles.languageBadge}>
                                                <Text style={themedStyles.languageText}>
                                                    {selectedBookMetadata.origin_language}
                                                </Text>
                                            </View>
                                        )}
                                        {selectedBookMetadata.language && (
                                            <View style={themedStyles.languageBadge}>
                                                <Text style={themedStyles.languageText}>
                                                    {selectedBookMetadata.language}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}
                            {(selectedBookMetadata.genres?.length > 0 || 
                                selectedBookMetadata.sequences?.length > 0 || 
                                selectedBookMetadata.keywords?.length > 0) && (
                                <View style={themedStyles.metadataHeader}>
                                    <Text style={themedStyles.metadataHeaderText}>Information</Text>
                                    <View style={themedStyles.metadataHeaderDivider} />
                                </View>
                            )}
                            {selectedBookMetadata.genres && selectedBookMetadata.genres.length > 0 && (
                                <View style={themedStyles.metadataSection}>
                                    <Text style={themedStyles.metadataLabel}>Genres:</Text>
                                    <ScrollingText
                                        repeatSpacer={40}
                                        duration={12000}
                                        style={themedStyles.metadataText}
                                        title={selectedBookMetadata.genres.join(', ')}
                                    />
                                </View>
                            )}
                            {selectedBookMetadata.sequences && selectedBookMetadata.sequences.length > 0 && (
                                <View style={themedStyles.metadataSection}>
                                    <Text style={themedStyles.metadataLabel}>Series:</Text>
                                    <ScrollingText
                                        repeatSpacer={40}
                                        duration={12000}
                                        style={themedStyles.metadataText}
                                        title={selectedBookMetadata.sequences
                                            .slice(0, 18)
                                            .map(seq => seq.title || '')
                                            .join(', ')}
                                    />
                                </View>
                            )}
                            {selectedBookMetadata.keywords && selectedBookMetadata.keywords.length > 0 && (
                                <View style={themedStyles.metadataSection}>
                                    <Text style={themedStyles.metadataLabel}>Keywords:</Text>
                                    <ScrollingText
                                        repeatSpacer={40}
                                        duration={12000}
                                        style={themedStyles.metadataText}
                                        title={selectedBookMetadata.keywords.join(', ')}
                                    />
                                </View>
                            )}
                        </View>
                    </View>
                )}
                {metadataReady && selectedBookMetadata && selectedBookMetadata.annotation && (
                    <View style={themedStyles.bookAnnotationWrapper}>
                        <View style={themedStyles.bookAnnotationHeader}>
                            <Text style={themedStyles.bookAnnotationTitle}>Annotation</Text>
                            <View style={themedStyles.bookAnnotationDivider} />
                        </View>
                        <View style={themedStyles.bookAnnotationContainer}>
                            <Text style={themedStyles.bookAnnotationText}>
                                {renderTextWithLineBreaksParagraphs(selectedBookMetadata.annotation)}
                            </Text>
                        </View>
                    </View>
                )}
                {!showDeletedBookMetadata ? (
                    <Pressable onPress={startReadHandler} android_ripple={{color: theme.btnNavigationHover}} style={({pressed}) => [themedStyles.btnStart, pressed && themedStyles.pressed]}>
                        <View style={themedStyles.btnStartContainer}>
                            {renderBookData.length <= 0 ? (
                                <View style={themedStyles.btnStartLoadingContainer}>
                                    <BookLoader width={28} height={28} color={theme.btnText} />
                                    <Text style={themedStyles.btnStartTitle}>Start</Text>
                                </View>
                            ) : (
                                <Text style={themedStyles.btnStartTitle}>Start</Text>
                            )}
                        </View>
                    </Pressable>
                ) : (
                    <Pressable onPress={() => navigation.navigate('LibraryScreen')} android_ripple={{color: theme.btnNavigationHover}} style={({pressed}) => [themedStyles.btnStart, pressed && themedStyles.pressed]}>
                        <View style={themedStyles.btnStartContainer}>
                            <Text style={themedStyles.btnStartTitle}>Go Home</Text>
                        </View>
                    </Pressable>
                )}
            </ScrollView>

            {metadataReady && selectedBookMetadata && selectedBookMetadata.coverImage ? (
                <FullScreenImage
                    source={{uri: `data:image/jpeg;base64,${selectedBookMetadata.coverImage}`}}
                    visible={isImageViewVisible}
                    onClose={() => setIsImageViewVisible(false)}
                />
            ) : (
                <FullScreenImage
                    source={require('../../assets/bookDefaultCover.png')}
                    visible={isImageViewVisible}
                    onClose={() => setIsImageViewVisible(false)}
                />
            )}

            <AwesomeAlert
                show={alertConfig.show}
                title={alertConfig.title}
                message={alertConfig.message}
                showCancelButton={alertConfig.showCancelButton}
                showConfirmButton={alertConfig.showConfirmButton}
                onCancelPressed={alertConfig.onCancelPressed}
                onConfirmPressed={alertConfig.onConfirmPressed}
                confirmText={alertConfig.confirmText}
                cancelText={alertConfig.cancelText}
                shouldCloseOnOverClick={alertConfig.shouldCloseOnOverClick}
                closeOnHardwareBackPress={alertConfig.closeOnHardwareBackPress}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    pressed: {
        opacity: 0.7,
    },
    readSettings: {
        fontSize: 14,
        color: KolorKit.blackBlueTheme.numeric,
    },
    wordBox: {
        marginVertical: '60%',
    },
    wordContainer: {
        alignSelf: 'center',
        minWidth: 180,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    viewBookHistoryBox: {
        height: 250,
        width: '100%',
        marginTop: '3%',
        marginBottom: '10%',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: KolorKit.blackBlueTheme.lineLight,
    },
    viewBookHistoryContainer: {
        borderRadius: 0,
        opacity: 0.75,
        paddingTop: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorSchemeBlackBlue: {
        backgroundColor: KolorKit.blackBlueTheme.backgroundApp,
        width: 30,
        height: 30,
        borderWidth: 1,
        borderRadius: 300,
        borderColor: KolorKit.blackBlueTheme.yellow800,
    },
    colorSchemeDark: {
        backgroundColor: KolorKit.blackBlueTheme.backgroundBoxBlack,
        width: 30,
        height: 30,
        borderWidth: 1,
        borderRadius: 300,
        borderColor: KolorKit.blackBlueTheme.yellow800,
    },
    colorSchemeLight: {
        backgroundColor: KolorKit.blackBlueTheme.backgroundBoxWhite,
        width: 30,
        height: 30,
        borderWidth: 1,
        borderRadius: 300,
        borderColor: KolorKit.blackBlueTheme.yellow800,
    },
});