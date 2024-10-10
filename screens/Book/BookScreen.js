import { useCallback, useContext, useEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, FlatList, Alert, Pressable, TextInput, Animated, Easing} from "react-native";
import { KolorKit } from "../../constants/styles";
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import RNRestart from 'react-native-restart';

import LoadingOverlay from "../../components/ui/LoadingOverlay";

import { ValueContext } from "../../store/value-context";
import { getBook, fetchBookmarks, getBookmark, updateBookmarkNumber, deleteBookmarkNumber, updateReadBookName } from "../../util/http";

export default function BookScreen({route, navigation}) {
    const [loading, setLoading] = useState(false);

    const bookCtx = useContext(ValueContext);
    const { selectedBook, bookmarkIndex, setBookmarkIndex, bookmark, setBookmark, setBookmarkNumbers, readFileTitle, setReadFileTitle } = bookCtx;

    const editedBookId = route.params?.bookId;
    const [bookData, setBookData] = useState(null);

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
    const [colorBlackBlue, setColorBlackBlue] = useState(true);
    const [colorDark, setColorDark] = useState(false);
    const [colorLight, setColorLight] = useState(false);
    const [backgroundColorScheme, setBackgroundColorScheme] = useState({});
    const [textColorScheme, setTextColorScheme] = useState({});
    const [wordContainerBackgroundColorScheme, setWordContainerBackgroundColorScheme] = useState({});
    const [mark, setMark] = useState(null);
    const [viewBookHistory, setViewBookHistory] = useState(false);

    let timeoutId = null;
    const speedWords = 60000 / speedWordsValue;
    const wordTitle = { fontSize: textSizeValue };
    const bookScreen = backgroundColorScheme;
    const textColor = textColorScheme;
    const wordContainerBackgroundColor = wordContainerBackgroundColorScheme;
    // let flatListRef = null;


    useEffect(() => {
        async function fetchBookData() {
            setLoading(true);
            try {
                const bookData = await getBook(bookCtx.uid, editedBookId, selectedBook);
                setBookData(bookData);
                if (selectedBookLast7Chars === 'txtType') {
                    setRenderBookData(Object.values(bookData));
                }
                if (selectedBookLast7Chars === 'xmlType') {
                    setRenderBookData(Object.values(bookData));
                }
                console.log('fetchBookData successfully');
                setLoading(false);
            } catch (error) {
                Alert.alert('It looks like you have already deleted this book.', 'Deleted books are not removed from the Read and Favorites for collection catalogs. You can exclude a book from the catalog, thereby the trace of its existence will disappear forever.')
                console.log('Could not fetch value data: ', error);
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
    }, [timerActive, readPaused, speedWords, textSizeValue, bookmarkIndex, bookCtx.updateBookmarkNumber, bookmark, colorBlackBlue, colorDark, colorLight, backgroundColorScheme, textColorScheme, wordContainerBackgroundColorScheme, viewBookHistory]);

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
                borderRadius: 80,
            });
        } else if (colorDark) {
            setBackgroundColorScheme({
                flex: 1,
                backgroundColor: KolorKit.blackBlueTheme.backgroundBoxBlack
            });
            setTextColorScheme({
                color: KolorKit.blackBlueTheme.textWhite
            });
            setWordContainerBackgroundColorScheme({
                borderRadius: 80,
            });
        } else if (colorLight) {
            setBackgroundColorScheme({
                flex: 1,
                backgroundColor: KolorKit.blackBlueTheme.backgroundBoxWhite
            });
            setTextColorScheme({
                color: KolorKit.blackBlueTheme.textBlack
            });
            setWordContainerBackgroundColorScheme({
                borderRadius: 80,
            });
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
        if (currentIndex === renderBookData.length -1) {
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

            Alert.alert('Congratulations!', 'The book has been successfully read');
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

    while (!renderBookData && renderBookData.length <= 0) {
        setLoading(true);
    }

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
                                data={Object.values(bookData).slice(Math.max(0, currentIndex - 53), currentIndex + 1)}
                                renderItem={({ item }) => (
                                    <View style={[wordContainerBackgroundColor, styles.viewBookHistoryContainer]}>
                                        <Text style={[wordTitle, textColor]}>
                                            {item.item}
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
                                data={Object.values(bookData).slice(Math.max(0, currentIndex - 53), currentIndex + 1).filter((item) => item.item !== undefined && item.item !== null)}
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
        Alert.alert('Bookmark added!', `You have successfully created a bookmark in position: ${currentIndex + 1}.`);
        setTimeout(() => {
            RNRestart.Restart();
        }, 100);
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
                <View style={styles.readSettingsBox}>
                    <View style={styles.readSettingsContainer}>
                        <View style={styles.textSizeContainer}>
                            <TextInput
                                style={styles.textSizeInput}
                                onChangeText={textSizeHandler}
                                value={textSizeValue.toString()}
                                placeholder="28"
                                maxLength={2}
                                placeholderTextColor={KolorKit.blackBlueTheme.numeric}
                                keyboardType="numeric"
                                color={KolorKit.blackBlueTheme.numeric}
                                autoCorrect={false}
                                autoComplete="off"
                            />
                            <Text style={styles.readSettingsLabel}>px</Text>
                        </View>
                        <View style={styles.speedWordsContainer}>
                            <TextInput
                                style={styles.speedWordsInput}
                                onChangeText={speedWordsHandler}
                                value={speedWordsValue.toString()}
                                placeholder="180"
                                maxLength={5}
                                placeholderTextColor={KolorKit.blackBlueTheme.numeric}
                                keyboardType="numeric"
                                color={KolorKit.blackBlueTheme.numeric}
                                autoCorrect={false}
                                autoComplete="off"
                            />
                            <Text style={styles.readSettingsLabel}>words in min</Text>
                        </View>
                        {readPaused ? (
                            <Pressable onPress={resumeReadHandler} android_ripple={{color: KolorKit.blackBlueTheme.btnNavigationHover}} style={({pressed}) => [styles.btnResume, pressed && styles.pressed]}>
                                <Feather name="play" size={34} color={KolorKit.blackBlueTheme.numeric} />
                            </Pressable>
                        ) : (
                            <Pressable onPress={pauseReadHandler} android_ripple={{color: KolorKit.blackBlueTheme.btnNavigationHover}} style={({pressed}) => [styles.btnPause, pressed && styles.pressed]}>
                                <Feather name="pause" size={34} color={KolorKit.blackBlueTheme.numeric} />
                            </Pressable>
                        )}
                        {renderBookData && renderBookData.length > 0 && (
                            <View style={styles.wordsCountContainer}>
                                <Text style={styles.wordsCount}>{currentIndex + 1} / {renderBookData.length}</Text>
                                <Text style={styles.readSettingsLabel}>words</Text>
                            </View>
                        )}
                    </View>
                    {readPaused && (
                        <View style={styles.readSettingsContainer}>
                            <View style={styles.colorSchemeBox}>
                                <Pressable onPress={colorSchemeBlackBlueHandler} android_ripple={{color: KolorKit.blackBlueTheme.yellow400}} style={({pressed}) => [styles.colorSchemeContainer, pressed && styles.pressed]}>
                                    <View style={styles.colorSchemeBlackBlue}></View>
                                    <Text style={styles.colorSchemeTitle}>Black Blue</Text>
                                </Pressable>
                                <Pressable onPress={colorSchemeDarkHandler} android_ripple={{color: KolorKit.blackBlueTheme.yellow400}} style={({pressed}) => [styles.colorSchemeContainer, pressed && styles.pressed]}>
                                    <View style={styles.colorSchemeDark}></View>
                                    <Text style={styles.colorSchemeTitle}>Dark</Text>
                                </Pressable>
                                <Pressable onPress={colorSchemeLightHandler} android_ripple={{color: KolorKit.blackBlueTheme.yellow400}} style={({pressed}) => [styles.colorSchemeContainer, pressed && styles.pressed]}>
                                    <View style={styles.colorSchemeLight}></View>
                                    <Text style={styles.colorSchemeTitle}>Light</Text>
                                </Pressable>
                            </View>
                            <View style={styles.history_bookmark_box}>
                                <View style={styles.bookHistoryContainer}>
                                    {viewBookHistory ? (
                                        <Pressable onPress={viewBookHistoryHandler} android_ripple={{color: KolorKit.blackBlueTheme.yellow400}} style={({pressed}) => [styles.colorSchemeContainer, pressed && styles.pressed]}>
                                            <MaterialIcons name="history-toggle-off" size={28} color={KolorKit.blackBlueTheme.numeric} />
                                        </Pressable>
                                    ) : (
                                        <Pressable onPress={stopViewBookHistoryHandler} android_ripple={{color: KolorKit.blackBlueTheme.yellow400}} style={({pressed}) => [styles.colorSchemeContainer, pressed && styles.pressed]}>
                                            <MaterialIcons name="history" size={28} color={KolorKit.blackBlueTheme.numeric} />
                                        </Pressable>
                                    )}
                                </View>
                                <View style={styles.bookmarkBox}>
                                    <Pressable onPress={bookmarkHandler} android_ripple={{color: KolorKit.blackBlueTheme.yellow400}} style={({pressed}) => [styles.bookmarkContainer, pressed && styles.pressed]}>
                                        <Feather name="bookmark" size={28} color={KolorKit.blackBlueTheme.numeric} />
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
                <View style={styles.outputBookDataContainer}>
                    {outputBookData}
                </View>
            </SafeAreaView>
        );
    }



    return (
        <SafeAreaView style={bookScreen}>
            <View style={styles.readSettingsBox}>
                <View style={styles.readSettingsContainer}>
                    <View style={styles.textSizeContainer}>
                        <TextInput
                            style={styles.textSizeInput}
                            onChangeText={textSizeHandler}
                            value={textSizeValue.toString()}
                            placeholder="28"
                            maxLength={2}
                            placeholderTextColor={KolorKit.blackBlueTheme.numeric}
                            keyboardType="numeric"
                            color={KolorKit.blackBlueTheme.numeric}
                            autoCorrect={false}
                            autoComplete="off"
                        />
                        <Text style={styles.readSettingsLabel}>px</Text>
                    </View>
                    <View style={styles.speedWordsContainer}>
                        <TextInput
                            style={styles.speedWordsInput}
                            onChangeText={speedWordsHandler}
                            value={speedWordsValue.toString()}
                            placeholder="180"
                            maxLength={5}
                            placeholderTextColor={KolorKit.blackBlueTheme.numeric}
                            keyboardType="numeric"
                            color={KolorKit.blackBlueTheme.numeric}
                            autoCorrect={false}
                            autoComplete="off"
                        />
                        <Text style={styles.readSettingsLabel}>words in min</Text>
                    </View>
                    {renderBookData && renderBookData.length > 0 ? (
                        <View style={styles.wordsCountContainer}>
                            <Text style={styles.wordsCount}>{currentIndex + 1} / {renderBookData.length}</Text>
                            <Text style={styles.readSettingsLabel}>words</Text>
                        </View>
                    ) : (setLoading(true))}
                </View>
                <View style={styles.readSettingsContainer}>
                    <View style={styles.colorSchemeBox}>
                        <Pressable onPress={colorSchemeBlackBlueHandler} android_ripple={{color: KolorKit.blackBlueTheme.yellow400}} style={({pressed}) => [styles.colorSchemeContainer, pressed && styles.pressed]}>
                            <View style={styles.colorSchemeBlackBlue}></View>
                            <Text style={styles.colorSchemeTitle}>Black Blue</Text>
                        </Pressable>
                        <Pressable onPress={colorSchemeDarkHandler} android_ripple={{color: KolorKit.blackBlueTheme.yellow400}} style={({pressed}) => [styles.colorSchemeContainer, pressed && styles.pressed]}>
                            <View style={styles.colorSchemeDark}></View>
                            <Text style={styles.colorSchemeTitle}>Dark</Text>
                        </Pressable>
                        <Pressable onPress={colorSchemeLightHandler} android_ripple={{color: KolorKit.blackBlueTheme.yellow400}} style={({pressed}) => [styles.colorSchemeContainer, pressed && styles.pressed]}>
                            <View style={styles.colorSchemeLight}></View>
                            <Text style={styles.colorSchemeTitle}>Light</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
            <View>
                <Pressable onPress={startReadHandler} android_ripple={{color: KolorKit.blackBlueTheme.btnNavigationHover}} style={({pressed}) => [styles.btnStart, pressed && styles.pressed]}>
                    <View style={styles.btnStartContainer}>
                        <Text style={styles.btnStartTitle}>Start</Text>
                    </View>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    pressed: {
        opacity: 0.7,
    },
    readSettingsBox: {
        backgroundColor: KolorKit.blackBlueTheme.backgroundApp,
        flexDirection: 'column',
        borderWidth: 1,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        borderColor: KolorKit.blackBlueTheme.lineDark,
    },
    readSettingsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 50,
        marginBottom: 8,
    },
    readSettings: {
        fontSize: 16,
        color: KolorKit.blackBlueTheme.numeric,
    },
    readSettingsLabel: {
        alignSelf: 'flex-end',
        marginBottom: 10,
        fontSize: 14,
        color: KolorKit.blackBlueTheme.numeric,
    },
    speedWordsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    speedWordsInput: {
        backgroundColor: KolorKit.blackBlueTheme.backgroundBox,
        marginHorizontal: 4,
    },
    textSizeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textSizeInput: {
        backgroundColor: KolorKit.blackBlueTheme.backgroundBox,
        marginHorizontal: 4,
    },
    wordsCountContainer: {
        height: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    wordsCount: {
        fontSize: 16,
        color: KolorKit.blackBlueTheme.numeric,
        marginHorizontal: 4,
    },
    btnStart: {
        width: 150,
        marginVertical: '60%',
        backgroundColor: KolorKit.blackBlueTheme.yellow400,
        justifyContent: 'center',
        alignSelf: 'center',
        padding: 4,
        borderWidth: 1,
        borderRadius: 4,
    },
    btnStartContainer: {
        alignSelf: 'center',
    },
    btnStartTitle: {
        fontSize: 20,
        color: KolorKit.blackBlueTheme.textWhite,
    },
    outputBookDataContainer: {

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
    colorSchemeTitle: {
        fontSize: 14,
        color: KolorKit.blackBlueTheme.numeric,
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
});