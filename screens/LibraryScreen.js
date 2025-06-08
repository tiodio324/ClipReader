import * as FileSystem from 'expo-file-system';
// import { setJSExceptionHandler, setNativeExceptionHandler } from "react-native-exception-handler";
import { useCallback, useContext, useEffect, useLayoutEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Image, ScrollView } from "react-native";
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DocumentPicker from 'react-native-document-picker';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import AwesomeAlert from '../components/ui/AwesomeAlert';
import { xml2js } from 'xml-js';
import Parser_fb2 from 'viva-parser-fb2';
import { translit } from '../constants/Ru2En';
import RNRestart from 'react-native-restart';
import useTheme from '../hooks/useTheme';

import { ValueContext } from '../store/value-context';
import { getAllBooksMetadata, getBooksFolderLength, updateBook, updateBookName } from '../util/http';

export default function LibraryScreen({route, navigation}) {
    const theme = useTheme();
    const [bookListLength, setBookListLength] = useState(0);
    const [favoritesListLength, setFavoritesListLength] = useState(0);
    const [readListLength, setReadListLength] = useState(0);
    const [allFetchedBooksLength, setAllFetchedBooksLength] = useState(0);
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
    const [bookCovers, setBookCovers] = useState({ bookList: [], favorites: [], readList: [] });

    const [alertConfig, setAlertConfig] = useState({
        show: false,
        title: '',
        message: '',
        showConfirmButton: true,
        onCancelPressed: null,
        onConfirmPressed: null,
    });

    const editedBookId = route.params?.bookId;

    const contentCtx = useContext(ValueContext);
    const { editedFileContent, setEditedFileContent, bookMetadata, setBookMetadata, selectedFileName, setSelectedFileName, fileTitle, setFileTitle, setMeta } = contentCtx;

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
        home: {
            flex: 1,
            backgroundColor: theme.backgroundApp,
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
            color: theme.textWhite,
        },
        headerScanTitle: {
            fontSize: 16,
            marginRight: 6,
            color: theme.textWhite,
        },
        bookListContainer: {
            marginBottom: 8,
        },
        bookList: {
            height: 250,
            padding: 20,
            backgroundColor: theme.backgroundBox,
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
            color: theme.textWhite,
        },
        bookListNumeric: {
            fontSize: 20,
            color: theme.numeric,
        },
        bookListImageContainer: {
            marginTop: 16,
        },
        bookListImageContent: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 20,
        },
        bookListImage: {
            width: 130,
            height: 170,
            borderRadius: 8,
            marginRight: 12,
        },
        favoritesListContainer: {
            marginVertical: 8,
        },
        favoritesList: {
            height: 165,
            padding: 20,
            backgroundColor: theme.backgroundBox,
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
            color: theme.textWhite,
        },
        favoritesListNumeric: {
            fontSize: 20,
            color: theme.numeric,
        },
        favoritesListImageContainer: {
            marginTop: 12,
        },
        favoritesListImageContent: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 20,
        },
        favoritesListImage: {
            width: 60,
            height: 90,
            borderRadius: 4,
            marginRight: 12,
        },
    });

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
        setTimeout(() => {
            RNRestart.Restart();
        }, 300);
    }

    const fetchBookMetadataCallback = useCallback(async () => {
        setLoadingBookListLength(true);
        if (allFetchedBooksLength) {
            try {
                const metadataResult = await getAllBooksMetadata(contentCtx.uid);
                if (metadataResult.allMetadata && metadataResult.allMetadata.length > 0) {
                    setMeta(metadataResult.allMetadata);
                    setBookCovers(metadataResult.firstImgCovers);
                    console.log('fetchBookMetadataCallback successfully');
                }
            } catch (error) {
                console.error('Could not fetch book metadata: ', error);
                setLoadingBookListLength(false);
            }
        }
        setLoadingBookListLength(false);
    }, [allFetchedBooksLength]);
    useEffect(() => {
        fetchBookMetadataCallback();
    }, [fetchBookMetadataCallback]);

    const openNewBookHandler = useCallback(async () => {
        try {
            const pickResult = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
                allowMultiSelection: false,
                // allowVirtualFiles: false,  // Разрешить брать файлы из google Drive и т.п. облачных хранилищ. Пока использую эмулятор, оставить закоментированным. При тесте приложение на телефоне, попробовать включить false. Если что-нибудь сломается, но не использовать false и оставить строчку закоментированной.
            });
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
                } else {
                    showAlert({
                        title: 'Invalid format!',
                        message: 'Please use one of supported format: .fb2, .txt.',
                        onConfirmPressed: () => RNRestart.Restart()
                    });
                    setLoading(false);
                    RNRestart.Restart();
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

    async function parseFb2BookMetadata(fileContent) {
        try {
            const fb2Parser = new Parser_fb2();
            const isValidFb2 = fb2Parser.parse(fileContent);

            if (isValidFb2) {
                const bookMetadata = fb2Parser.book;
                const coverImage = fb2Parser.get_cover_image();
                const annotation = fb2Parser.get_formatted_annotation({
                    format: 'markdown',
                    indent: '<br />'
                });

                const cleanAnnotation = annotation
                    .replace(/\.,/g, '.')

                let authorName = '';
                if (bookMetadata.origin_author) {
                    const author = bookMetadata.origin_author;
                    const parts = [];
                    if (author.first_name) parts.push(author.first_name);
                    if (author.middle_name) parts.push(author.middle_name);
                    if (author.last_name) parts.push(author.last_name);
                    authorName = parts.join(' ');
                }

                const language = bookMetadata.translator_language;
                const origin_language = bookMetadata.origin_language;

                const formattedText = fb2Parser.get_formatted_text({
                    format: 'plain'
                });
                const wordCount = formattedText.split(/\s+/).length;
                const pageCount = Math.max(1, Math.ceil((wordCount / 300) * 1.5));

                return {
                    title: bookMetadata.title ? bookMetadata.title : correctFileFormat !== '' ? correctFileFormat : '',
                    author: authorName,
                    coverImage: coverImage,
                    annotation: cleanAnnotation,
                    pageCount: pageCount,
                    genres: bookMetadata.genre_list || [],
                    sequences: bookMetadata.sequence_list || [],
                    isbn: bookMetadata.isbn || '',
                    keywords: bookMetadata.keyword_list || [],
                    language: language,
                    origin_language: origin_language
                };
            } else {
                console.log('FB2 parsing metadata failed: Invalid FB2 format');
                return null;
            }
        } catch (e) {
            console.error('Error parsing book metadata: ', e);
            return null;
        }
    }

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
                        const metadata = await parseFb2BookMetadata(fileContent);

                        if (metadata) setBookMetadata(metadata);
                        setEditedFileContent(textArray);
                        console.log('Used: text/xml (fb2)');
                    } else if (nameWithExtension.endsWith('.mobi') || nameWithExtension.endsWith('.MOBI')) {
                        setLoading(false);
                        showAlert({
                            title: 'Invalid format!',
                            message: 'MOBI format is unsupported. Please select one of this: .fb2, .txt.',
                            onConfirmPressed: () => RNRestart.Restart()
                        });
                        console.log('Used: text/xml (mobi)');
                        return;
                    } else if (nameWithExtension.endsWith('.xml') || nameWithExtension.endsWith('.XML')) {
                        setLoading(false);
                        showAlert({
                            title: 'Invalid format!',
                            message: 'XML format is unsupported. Please select one of this: .fb2, .txt.',
                            onConfirmPressed: () => RNRestart.Restart()
                        });
                        console.log('Used: text/xml (xml)');
                        return;
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

                    setBookMetadata({
                        title: correctFileFormat !== '' ? correctFileFormat : '',
                        author: '',
                        coverImage: '',
                        annotation: '',
                        pageCount: Math.max(1, Math.ceil((fileContentOnlyWords.length / 300) * 1.5)),
                        genres: [],
                        sequences: [],
                        isbn: '',
                        keywords: [],
                    });
                    setEditedFileContent(fileContentOnlyWords);
                    console.log('Used: text/plain');
                } else if (selectedFileType === 'application/pdf') {
                    setLoading(false);
                    showAlert({
                        title: 'Invalid format!',
                        message: 'PDF format is unsupported. Please select one of this: .fb2, .txt.',
                        onConfirmPressed: () => RNRestart.Restart()
                    });
                    return;
                } else if (selectedFileType === 'application/epub+zip') {
                    setLoading(false);
                    showAlert({
                        title: 'Invalid format!',
                        message: 'EPUB format is unsupported. Please select one of this: .fb2, .txt.',
                        onConfirmPressed: () => RNRestart.Restart()
                    });
                    return;
                } else {
                    setLoading(false);
                    showAlert({
                        title: 'Invalid format!',
                        message: 'Please use one of supported format: .fb2, .txt.',
                        onConfirmPressed: () => RNRestart.Restart()
                    });
                    return;
                }
                setLoading(false);
            } catch (e) {
                console.log('Error reading file: ', e);
                setLoading(false);
                if (e instanceof RangeError && e.message.includes('Property storage exceeds')) {
                    showAlert({
                        title: 'Memory Limit Reached',
                        message: 'This book is too large to fully finish processing. Some content was uploaded successfully, but the complete book exceeds device memory limits. Please create a GitHub issue at: https://github.com/tiodio324/clip-reader',
                        onConfirmPressed: () => RNRestart.Restart()
                    });
                } else {
                    showAlert({
                        title: 'Failed to read file!',
                        message: 'Please, use internal storage downloads folder.',
                        onConfirmPressed: () => RNRestart.Restart()
                    });
                }
                // Alert.alert('Failed to read file!', e.message || JSON.stringify(e));
                // errorHandler(e, true);
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
                        contentCtx.updateBook(editedBookId, editedFileContent, bookMetadata);
                        await updateBook(contentCtx.uid, null, chunk, selectedFileName, globalIndex, bookMetadata);
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
            setAllFetchedBooksLength(fetchedBookListLength + fetchedFavoritesListLength + fetchedReadListLength);
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
                    <Pressable onPress={openNewBookHandler} android_ripple={{color: theme.btnNavigationHover}} style={({pressed}) => [themedStyles.headerAddBookContainer, pressed && themedStyles.pressed]}>
                        <View style={themedStyles.headerAddBook}>
                            <Ionicons name="add-circle-outline" size={18} color={theme.iconButton} />
                            <Text style={themedStyles.headerAddTitle}>Add book</Text>
                        </View>
                    </Pressable>
                )
            },
            headerLeft: () => {
                return (
                    <Pressable onPress={scanBooksHandler} android_ripple={{color: theme.btnNavigationHover}} style={({pressed}) => [themedStyles.headerScanBookContainer, pressed && themedStyles.pressed]}>
                        <View style={themedStyles.headerAddBook}>
                            <Text style={themedStyles.headerScanTitle}>Scan books</Text>
                            <Ionicons name="reload" size={18} color={theme.iconButton} />
                        </View>
                    </Pressable>
                )
            },
    });}, [navigation, openNewBookHandler, theme]);

    if (loadingBookListLength) {
        return <LoadingOverlay message='Scanning books...' />
    }
    if (loading) {
        return <LoadingOverlay message='Reading book content...' />
    }
    if (uploadingArray) {
        return <LoadingOverlay message={`Uploading words and metadata:<br />${uploadProgress.globalIndex} of ${uploadProgress.total}`} />
    }



    return (
        <ScrollView style={themedStyles.home}>
            <Pressable onPress={bookListHandler} android_ripple={{color: theme.btnNavigationHover}} style={({pressed}) => [themedStyles.bookListContainer, pressed && themedStyles.pressed]}>
                <View style={themedStyles.bookList}>
                    <View style={themedStyles.bookListTitleContainer}>
                        <Text style={themedStyles.bookListTitle}>Book List</Text>
                        {bookListLength > 0 ? (
                            <Text style={themedStyles.bookListNumeric}>{bookListLength}</Text>
                        ) : (
                            <Text style={themedStyles.bookListNumeric}>0</Text>
                        )}
                    </View>
                    <View style={themedStyles.bookListImageContainer}>
                        <ScrollView 
                            horizontal={true} 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={themedStyles.bookListImageContent}
                        >
                            {bookCovers.bookList && bookCovers.bookList.length > 0 && bookCovers.bookList.map((item, index) => (
                                <Image
                                    key={index}
                                    style={themedStyles.bookListImage}
                                    source={{uri: `data:image/jpeg;base64,${item.coverImage}`}}
                                    resizeMode="contain"
                                />
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Pressable>
            <Pressable onPress={favoritesListHandler} android_ripple={{color: theme.btnNavigationHover}} style={({pressed}) => [themedStyles.favoritesListContainer, pressed && themedStyles.pressed]}>
                <View style={themedStyles.favoritesList}>
                    <View style={themedStyles.favoritesListHeaderContainer}>
                        <View style={themedStyles.favoritesListTitleContainer}>
                            <Fontisto style={themedStyles.iconMargin} name="favorite" size={24} color={theme.yellow400} />
                            <Text style={themedStyles.favoritesListTitle}>Favorites</Text>
                        </View>
                        {favoritesListLength > 0 ? (
                            <Text style={themedStyles.bookListNumeric}>{favoritesListLength}</Text>
                        ) : (
                            <Text style={themedStyles.bookListNumeric}>0</Text>
                        )}
                    </View>
                    <View style={themedStyles.favoritesListImageContainer}>
                        <ScrollView 
                            horizontal={true} 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={themedStyles.favoritesListImageContent}
                        >
                            {bookCovers.favorites && bookCovers.favorites.length > 0 && bookCovers.favorites.map((item, index) => (
                                <Image
                                    key={index}
                                    style={themedStyles.favoritesListImage}
                                    source={{uri: `data:image/jpeg;base64,${item.coverImage}`}}
                                    resizeMode="contain"
                                />
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Pressable>
            <Pressable onPress={readListHandler} android_ripple={{color: theme.btnNavigationHover}} style={({pressed}) => [themedStyles.favoritesListContainer, pressed && themedStyles.pressed]}>
                <View style={themedStyles.favoritesList}>
                    <View style={themedStyles.favoritesListHeaderContainer}>
                        <View style={themedStyles.favoritesListTitleContainer}>
                            <MaterialCommunityIcons style={themedStyles.iconMargin} name="book-check-outline" size={24} color={theme.yellow800} />
                            <Text style={themedStyles.favoritesListTitle}>Read</Text>
                        </View>
                        {readListLength > 0 ? (
                            <Text style={themedStyles.bookListNumeric}>{readListLength}</Text>
                        ) : (
                            <Text style={themedStyles.bookListNumeric}>0</Text>
                        )}
                    </View>
                    <View style={themedStyles.favoritesListImageContainer}>
                        <ScrollView 
                            horizontal={true} 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={themedStyles.favoritesListImageContent}
                        >
                            {bookCovers.readList && bookCovers.readList.length > 0 && bookCovers.readList.map((item, index) => (
                                <Image
                                    key={index}
                                    style={themedStyles.favoritesListImage}
                                    source={{uri: `data:image/jpeg;base64,${item.coverImage}`}}
                                    resizeMode="contain"
                                />
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Pressable>

            <AwesomeAlert
                show={alertConfig.show}
                title={alertConfig.title}
                message={alertConfig.message}
                showCancelButton={alertConfig.showCancelButton}
                showConfirmButton={alertConfig.showConfirmButton}
                cancelText={alertConfig.cancelText}
                confirmText={alertConfig.confirmText}
                onCancelPressed={alertConfig.onCancelPressed}
                onConfirmPressed={alertConfig.onConfirmPressed}
            />
        </ScrollView>
    );
}