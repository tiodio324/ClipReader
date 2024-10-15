import * as FileSystem from 'expo-file-system';
// import { setJSExceptionHandler, setNativeExceptionHandler } from "react-native-exception-handler";
import { useCallback, useContext, useEffect, useLayoutEffect, useState } from "react";
import {View, Text, StyleSheet, Pressable, Image, SafeAreaView, ScrollView, Alert } from "react-native";
import Fontisto from '@expo/vector-icons/Fontisto';
import { KolorKit } from "../constants/styles";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DocumentPicker from 'react-native-document-picker';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { xml2js } from 'xml-js';
import { translit } from '../constants/Ru2En';
import RNRestart from 'react-native-restart';

import { ValueContext } from '../store/value-context';
import { getBooksFolderLength, updateBook, updateBookName } from '../util/http';

export default function LibraryScreen({route, navigation}) {
    const [bookListLength, setBookListLength] = useState();
    const [favoritesListLength, setFavoritesListLength] = useState();
    const [readListLength, setReadListLength] = useState();
    const [selectedFile, setSelectedFile] = useState([]);
    const [selectedFileSize, setSelectedFileSize] = useState(0);
    const [selectedFileUri, setSelectedFileUri] = useState('');
    const [copiedFileUri, setCopiedFileUri] = useState('');
    const [selectedFileType, setSelectedFileType] = useState('');
    const [correctFileFormat, setCorrectFileFormat] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadingArray, setUploadingArray] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ globalIndex: 0, total: 0 });
    const [loadingBookListLength, setLoadingBookListLength] = useState(false);
    const [nameWithExtension, setNameWithExtension] = useState('');

    const editedBookId = route.params?.bookId;

    const contentCtx = useContext(ValueContext);
    const { editedFileContent, setEditedFileContent, selectedFileName, setSelectedFileName, fileTitle, setFileTitle } = contentCtx;


    // const errorHandler = (e, isFatal) => {
    //     if (isFatal) {
    //     Alert.alert(
    //         'Unexpected error occurred',
    //         `
    //         Error: ${(isFatal) ? 'Fatal:' : ''} ${e.name} ${e.message}
    
    //         We will need to restart the app.
    //         `,
    //         [{
    //         text: 'Restart',
    //         onPress: () => {
    //             RNRestart.Restart();
    //         }
    //         }]
    //     );
    //     } else {
    //     console.log(e);
    //     }
    // };
    
    // setJSExceptionHandler(errorHandler);

    // setNativeExceptionHandler((errorString) => {
    //     updateBookName(contentCtx.uid, errorString);
    // });

    async function scanBooksHandler() {
        await getListLengthCallback();
        RNRestart.Restart();
    }


    const openNewBookHandler = useCallback(async () => {
        try {
            const pickResult = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
                allowMultiSelection: false,
                // allowVirtualFiles: false,  // Разрешить брать файлы из google Drive и т.п. Пока использую эмулятор, оставить закоментированным. При тесте приложение на телефоне, попробовать включить false. Если что-нибудь сломается, но не использовать false и оставить строчку закоментированной.
            });
            // console.log(pickResult);
            setSelectedFile(pickResult);
            const fileNameWithExtension = pickResult[0].name;
            setNameWithExtension(fileNameWithExtension);
            const fileNameWithoutExtension = fileNameWithExtension.slice(0, fileNameWithExtension.lastIndexOf('.'));
            const fileNameOnlyEnglish = translit(fileNameWithoutExtension);
            const fileNameDoubleFormatted = fileNameOnlyEnglish.replace(/[-#$[\]\/\\=_~.]/g, ' ');
            setCorrectFileFormat(fileNameDoubleFormatted);
            setSelectedFileType(pickResult[0].type);
            setSelectedFileSize(pickResult[0].size);
            setSelectedFileUri(pickResult[0].uri);
        } catch (e) {
            console.log('file picking failed: ', e);
        }
    }, []);

    useEffect(() => {
        if (selectedFileUri) {
            if (selectedFileType === 'text/xml' || selectedFileType === 'application/octet-stream') {
                if (nameWithExtension.endsWith('.fb2') || nameWithExtension.endsWith('.FB2')) {
                    setSelectedFileName(correctFileFormat + 'xmlType');
                };
            } else if (selectedFileType === 'text/plain') {
                setSelectedFileName(correctFileFormat + 'txtType');
            }
        }
    }, [selectedFileUri]);

    const copyFile = async () => {
        if (selectedFileUri) {
            setLoading(true);
            try {
                const generateShortId = () => {
                    let result = '';
                    const characters = 'abcdefghijklmnopqrstuvwxyz';
                    for (let i = 0; i < 5; i++) {
                      result += characters.charAt(Math.floor(Math.random() * characters.length));
                    }
                    return result;
                };
                let filename;
                if (nameWithExtension.endsWith('.fb2') || nameWithExtension.endsWith('.FB2')) {
                    filename = `${generateShortId()}_${selectedFileName}.fb2`;
                } else if (selectedFileType === 'text/plain') {
                    filename = `${generateShortId()}_${selectedFileName}.txt`;
                }
                const destinationUri = `${FileSystem.cacheDirectory}${filename}`;
                await FileSystem.copyAsync({
                    from: selectedFileUri,
                    to: destinationUri
                });
                console.log('File copied successfully');
                setCopiedFileUri(destinationUri);
                setLoading(false);
            } catch (e) {
                console.log('file copping failed: ', e);
                setLoading(false);
            }
        }
    };
    useEffect(() => {
        copyFile();
    }, [selectedFileName]);


    const readFileContent = useCallback(async () => {
        if (copiedFileUri) {
            setLoading(true);
            try {
                const fileContent = await FileSystem.readAsStringAsync(copiedFileUri);
                if (selectedFileType === 'text/xml' || selectedFileType === 'application/octet-stream') {
                    if (nameWithExtension.endsWith('.fb2') || nameWithExtension.endsWith('.FB2')) {
                        const xmlDoc = xml2js(fileContent, { ignoreComment: true, alwaysArray: true });
                        const textContent = extractTextFromXml(xmlDoc.elements[0]);
                        const textArray = textContent.map(item => item.props.children);
                        // setEditedFileContent(textContent);
                        setEditedFileContent(textArray);
                        console.log('Used: text/xml (fb2)');
                    } else if (nameWithExtension.endsWith('.mobi') || nameWithExtension.endsWith('.MOBI')) {
                        Alert.alert('Invalid format!', 'MOBI format is unsupported. Please select one of this: .fb2, .txt.');
                        console.log('Used: text/xml (mobi)');
                        setLoading(false);
                        RNRestart.Restart();
                    } else if (nameWithExtension.endsWith('.xml') || nameWithExtension.endsWith('.XML')) {
                        Alert.alert('Invalid format!', 'XML format is unsupported. Please select one of this: .fb2, .txt.');
                        console.log('Used: text/xml (xml)');
                        setLoading(false);
                        RNRestart.Restart();
                    }
                } else if (selectedFileType === 'text/plain') {
                    const fileContentWithoutWhiteSpaces = fileContent.split(/\s+/);
                    const fileContentOnlyWords = [];
                    for (let i = 0; i < fileContentWithoutWhiteSpaces.length; i++) {
                        if (i < fileContentWithoutWhiteSpaces.length - 1 && fileContentWithoutWhiteSpaces[i].length <= 3) {  
                            fileContentOnlyWords.push([fileContentWithoutWhiteSpaces[i], ' ', fileContentWithoutWhiteSpaces[i + 1]]);
                            i++;
                        } else {
                            fileContentOnlyWords.push([fileContentWithoutWhiteSpaces[i]]);
                        }
                    };
                    setEditedFileContent(fileContentOnlyWords);
                    console.log('Used: text/plain');
                } else if (selectedFileType === 'application/pdf') {
                    Alert.alert('Invalid format!', 'PDF format is unsupported. Please select one of this: .fb2, .txt.');
                    setLoading(false);
                    RNRestart.Restart();
                } else if (selectedFileType === 'application/epub+zip') {
                    Alert.alert('Invalid format!', 'EPUB format is unsupported. Please select one of this: .fb2, .txt.');
                    setLoading(false);
                    RNRestart.Restart();
                } else {
                    Alert.alert('Invalid format!', 'Please use one of supported format: .fb2, .txt.');
                    setLoading(false);
                    RNRestart.Restart();
                }
                console.log('file reading successfully');
                setLoading(false);
            } catch (e) {
                console.log('Error reading file: ', e);
                Alert.alert('Failed to read file!', 'Please, use internal storage download folder.');
                // Alert.alert('Failed to read file!', e.message || JSON.stringify(e));
                // errorHandler(e, true);
                setLoading(false);
                RNRestart.Restart();
            }
        }
    })
    useEffect(() => {
        readFileContent();
    }, [copiedFileUri]);

    function extractTextFromXml(xmlNode) {
        let result = [];
        let index = 0;
        let nextWord = '';
        
        if (xmlNode.type === 'text') {
            const textWords = xmlNode.text.trim().split(/\s+/);
            textWords.forEach((item, i) => {
                if (i < textWords.length - 1 && item.length <= 3) {  // Изменение длины слова до объединения в массив.
                    const nextWord = textWords[i + 1];
                    result.push(<View key={index}>{item} {nextWord}</View>);
                    textWords.splice(i + 1, 1);
                    index++;
                } else {
                    result.push(<View key={index}>{item}</View>);
                    index++;
                }
            });
        } else if (xmlNode.elements && xmlNode.elements.length > 0) {
            xmlNode.elements.forEach(element => {
                const extractedText = extractTextFromXml(element);
                result = [...result, ...extractedText];
            });
        }
        return result;
    }

    useEffect(() => {
        const uploadData = async () => {
            if (editedFileContent) {
                setUploadingArray(true);
                setUploadProgress({ globalIndex: 0, total: editedFileContent.length });
                try {
                    const chunkSize = 100;
                    let globalIndex = 0;
                    for (let i = 0; i < editedFileContent.length; i += chunkSize) {
                        const chunk = editedFileContent.slice(i, i + chunkSize);
                        contentCtx.updateBook(editedBookId, editedFileContent);
                        await updateBook(contentCtx.uid, null, chunk, selectedFileName, globalIndex);
                        globalIndex += chunk.length;
                        setUploadProgress({ globalIndex, total: editedFileContent.length });
                    }
                    console.log('editedFileContent uploaded successfully');
                    setTimeout(() => {
                        setUploadingArray(false);
                        RNRestart.Restart();
                    }, 1000);
                } catch (e) {
                    console.log('Error uploading editedFileContent array to database: ', e);
                    setUploadingArray(false);
                }
            }
        }
        uploadData();
    }, [editedFileContent]);

    useEffect(() => {
        if (selectedFileName !== "") {
            const sortedFileTitle = [...new Set([selectedFileName, ...fileTitle])];
            setFileTitle(sortedFileTitle);
        }
    }, [selectedFileName]);

    useEffect(() => {
        if (fileTitle) {
            try {
                contentCtx.updateBookName(editedBookId, fileTitle);
                updateBookName(contentCtx.uid, fileTitle);
                console.log('fileNames uploaded successfully');
                getListLengthCallback();
            } catch (e) {
                console.log('Error uploading fileNames array to database: ', e);
            }
        }
    }, [fileTitle]);

    async function getListLengthCallback() {
        setLoadingBookListLength(true);
        try {
            const fetchedBookListLength = await getBooksFolderLength(contentCtx.uid, 'bookTitle');
            const fetchedFavoritesListLength = await getBooksFolderLength(contentCtx.uid, 'favoriteBookTitle');
            const fetchedReadListLength = await getBooksFolderLength(contentCtx.uid, 'readBookTitle');
            setBookListLength(fetchedBookListLength);
            setFavoritesListLength(fetchedFavoritesListLength);
            setReadListLength(fetchedReadListLength);
            console.log('getListLengthCallback successfully');
            setLoadingBookListLength(false);
        } catch (error) {
            console.error('Could not get list of items: ', error);
            setLoadingBookListLength(false);
        }
    }

    function bookListHandler() {
        navigation.navigate('BookListScreen');
    }
    function favoritesListHandler() {
        navigation.navigate('FavoritesListScreen');
    }
    function readListHandler() {
        navigation.navigate('ReadListScreen');
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => {
                return (
                    <Pressable onPress={openNewBookHandler} android_ripple={{color: KolorKit.blackBlueTheme.btnNavigationHover}} style={({pressed}) => [styles.headerAddBookContainer, pressed && styles.pressed]}>
                        <View style={styles.headerAddBook}>
                            <Ionicons name="add-circle-outline" size={18} color={KolorKit.blackBlueTheme.iconButton} />
                            <Text style={styles.headerAddTitle}>Add book</Text>
                        </View>
                    </Pressable>
                )
            },
            headerLeft: () => {
                return (
                    <Pressable onPress={scanBooksHandler} android_ripple={{color: KolorKit.blackBlueTheme.btnNavigationHover}} style={({pressed}) => [styles.headerScanBookContainer, pressed && styles.pressed]}>
                        <View style={styles.headerAddBook}>
                            <Text style={styles.headerScanTitle}>Scan books</Text>
                            <Ionicons name="reload" size={18} color={KolorKit.blackBlueTheme.iconButton} />
                        </View>
                    </Pressable>
                )
            },
    });}, [navigation, openNewBookHandler]);

    if (loadingBookListLength) {
        return <LoadingOverlay message='Scanning books...' />
    }

    if (loading) {
        return <LoadingOverlay message='Reading book content...' />
    }
    if (uploadingArray) {
        return <LoadingOverlay message={`Uploading words: ${uploadProgress.globalIndex} of ${uploadProgress.total}`} />
    }



    return (
        <ScrollView style={styles.home}>
            <Pressable onPress={bookListHandler} android_ripple={{color: KolorKit.blackBlueTheme.btnNavigationHover}} style={({pressed}) => [styles.bookListContainer, pressed && styles.pressed]}>
                <View style={styles.bookList}>
                    <View style={styles.bookListTitleContainer}>
                        <Text style={styles.bookListTitle}>Book List</Text>
                        {bookListLength ? (
                            <Text style={styles.bookListNumeric}>{bookListLength}</Text>
                        ) : (
                            <Text style={styles.bookListNumeric}>0</Text>
                        )}
                    </View>
                    <View style={styles.bookListImageContainer}>
                        <Image style={styles.bookListImage} />
                        <Image style={styles.bookListImage} />
                    </View>
                </View>
            </Pressable>
            <Pressable onPress={favoritesListHandler} android_ripple={{color: KolorKit.blackBlueTheme.btnNavigationHover}} style={({pressed}) => [styles.favoritesListContainer, pressed && styles.pressed]}>
                <View style={styles.favoritesList}>
                    <View style={styles.favoritesListHeaderContainer}>
                        <View style={styles.favoritesListTitleContainer}>
                            <Fontisto style={styles.iconMargin} name="favorite" size={24} color={KolorKit.blackBlueTheme.yellow400} />
                            <Text style={styles.favoritesListTitle}>Favorites</Text>
                        </View>
                        {favoritesListLength ? (
                            <Text style={styles.bookListNumeric}>{favoritesListLength}</Text>
                        ) : (
                            <Text style={styles.bookListNumeric}>0</Text>
                        )}
                    </View>
                    <View style={styles.favoritesListImageContainer}>
                        <Image style={styles.favoritesListImage} />
                        <Image style={styles.favoritesListImage} />
                    </View>
                </View>
            </Pressable>
            <Pressable onPress={readListHandler} android_ripple={{color: KolorKit.blackBlueTheme.btnNavigationHover}} style={({pressed}) => [styles.favoritesListContainer, pressed && styles.pressed]}>
                <View style={styles.favoritesList}>
                    <View style={styles.favoritesListHeaderContainer}>
                        <View style={styles.favoritesListTitleContainer}>
                            <MaterialCommunityIcons style={styles.iconMargin} name="book-check-outline" size={24} color={KolorKit.blackBlueTheme.yellow800} />
                            <Text style={styles.favoritesListTitle}>Read</Text>
                        </View>
                        {readListLength ? (
                            <Text style={styles.bookListNumeric}>{readListLength}</Text>
                        ) : (
                            <Text style={styles.bookListNumeric}>0</Text>
                        )}
                    </View>
                    <View style={styles.favoritesListImageContainer}>
                        <Image style={styles.favoritesListImage} />
                        <Image style={styles.favoritesListImage} />
                    </View>
                </View>
            </Pressable>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    home: {
        flex: 1,
        backgroundColor: KolorKit.blackBlueTheme.backgroundApp,
    },
    pressed: {
        opacity: 0.7,
    },
    headerAddBookContainer: {
        padding: 4,
        marginRight: '5%',
    },
    headerScanBookContainer: {
        padding: 4,
        marginLeft: '5%',
    },
    headerAddBook: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAddTitle: {
        fontSize: 16,
        marginLeft: 6,
        color: KolorKit.blackBlueTheme.textWhite,
    },
    headerScanTitle: {
        fontSize: 16,
        marginRight: 6,
        color: KolorKit.blackBlueTheme.textWhite,
    },
    bookListContainer: {
        marginBottom: 8,
    },
    bookList: {
        height: 250,
        padding: 20,
        backgroundColor: KolorKit.blackBlueTheme.backgroundBox,
        borderRadius: 8,
        flexDirection: 'column',
    },
    bookListTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bookListTitle: {
        fontSize: 20,
        color: KolorKit.blackBlueTheme.textWhite,
    },
    bookListNumeric: {
        fontSize: 20,
        color: KolorKit.blackBlueTheme.numeric,
    },
    bookListImageContainer: {
        
    },
    bookListImage: {

    },
    favoritesListContainer: {
        marginVertical: 8,
    },
    favoritesList: {
        height: 150,
        padding: 20,
        backgroundColor: KolorKit.blackBlueTheme.backgroundBox,
        borderRadius: 8,
        flexDirection: 'column',
    },
    favoritesListHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    favoritesListTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconMargin: {
        marginRight: 12
    },
    favoritesListTitle: {
        fontSize: 20,
        color: KolorKit.blackBlueTheme.textWhite,
    },
    favoritesListNumeric: {
        fontSize: 20,
        color: KolorKit.blackBlueTheme.numeric,
    },
    favoritesListImageContainer: {

    },
    favoritesListImage: {

    },
});