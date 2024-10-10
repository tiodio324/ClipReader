import { createContext, useState, useReducer, useEffect, useContext } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebase } from "../util/firebase";

export const ValueContext = createContext({
    values: [],
    books: [],
    fileNames: [],
    favoriteFileNames: [],
    readFileNames: [],
    bookmarkNumbers: [],
    setValues: (values) => {},
    setBooks: (books) => {},
    setFileNames: (fileNames) => {},
    setFavoriteFileNames: (favoriteFileNames) => {},
    setReadFileNames: (readFileNames) => {},
    setBookmarkNumbers: (bookmarkNumbers) => {},
    deleteValue: (id) => {},
    deleteBook: (id) => {},
    deleteFileName: (id) => {},
    deleteFavoriteFileName: (id) => {},
    deleteReadFileName: (id) => {},
    deleteBookmarkNumber: (id) => {},
    updateValue: (id, {name, date}) => {},
    updateBook: (id, {index, txt}) => {},
    updateBookName: (id, {bookTitle}) => {},
    updateFavoriteBookName: (id, {favoriteBookTitle}) => {},
    updateReadBookName: (id, {readBookTitle}) => {},
    updateBookmarkNumber: (id, {bookmarkTitle}) => {},
    uid: '',
    email: '',
    isFirebaseUserAuthenticated: false,
    authenticateFirebaseUser: (createdFirebaseUser) => {},
    logoutFirebaseUser: () => {},
    deleteSelectedBookBookmarks: () => {},
});

function valuesReducer(state, action) {
    switch (action.type) {
        case 'SET':
            const inverted = action.payload.reverse();  // При обновлении приложения данные отображаются не сверху вниз, а снизу вверх. Поэтому обязательно используем reverse()
            return inverted;
        case 'UPDATE':
            const updatableValueIndex = state.findIndex((value) => value.id === action.payload.id);
            const updatableValue = state[updatableValueIndex];
            const updatedItem = {...updatableValue, ...action.payload.data};
            const updatedValues = [...state];
            updatedValues[updatableValueIndex] = updatedItem;
            return updatedValues;
        case 'DELETE':
            return state.filter((value) => value.id !== action.payload);
        default:
            return state;
    }
}

function booksReducer(state, action) {
    switch (action.type) {
        case 'SET':
            return action.payload;
        case 'UPDATE':
            const updatableBookIndex = state.findIndex((book) => book.id === action.payload.id);
            const updatableBook = state[updatableBookIndex];
            const updatedBook = { ...updatableBook, ...action.payload.data };
            const updatedBooks = [...state];
            updatedBooks[updatableBookIndex] = updatedBook;
            return updatedBooks;
        case 'DELETE':
            return state.filter((book) => book.id !== action.payload);
        default:
            return state;
    }
}

function fileNamesReducer(state, action) {
    switch (action.type) {
        case 'SET':
            return action.payload;
        case 'UPDATE':
            const updatableFileNameIndex = state.findIndex((fileName) => fileName.id === action.payload.id);
            const updatableFileName = state[updatableFileNameIndex];
            const updatedItem = {...updatableFileName, ...action.payload.data};
            const updatedFileNames = [...state];
            updatedFileNames[updatableFileNameIndex] = updatedItem;
            return updatedFileNames;
        case 'DELETE':
            return state.filter((fileName) => fileName.id !== action.payload);
        default:
            return state;
    }
}

function favoriteFileNamesReducer(state, action) {
    switch (action.type) {
        case 'SET':
            return action.payload;
        case 'UPDATE':
            const updatableFavoriteFileNameIndex = state.findIndex((favoriteFileName) => favoriteFileName.id === action.payload.id);
            const updatableFavoriteFileName = state[updatableFavoriteFileNameIndex];
            const updatedItem = {...updatableFavoriteFileName, ...action.payload.data};
            const updatedFavoriteFileNames = [...state];
            updatedFavoriteFileNames[updatableFavoriteFileNameIndex] = updatedItem;
            return updatedFavoriteFileNames;
        case 'DELETE':
            return state.filter((favoriteFileName) => favoriteFileName.id !== action.payload);
        default:
            return state;
    }
}

function readFileNamesReducer(state, action) {
    switch (action.type) {
        case 'SET':
            return action.payload;
        case 'UPDATE':
            const updatableReadFileNameIndex = state.findIndex((readFileName) => readFileName.id === action.payload.id);
            const updatableReadFileName = state[updatableReadFileNameIndex];
            const updatedItem = {...updatableReadFileName, ...action.payload.data};
            const updatedReadFileNames = [...state];
            updatedReadFileNames[updatableReadFileNameIndex] = updatedItem;
            return updatedReadFileNames;
        case 'DELETE':
            return state.filter((readFileName) => readFileName.id !== action.payload);
        default:
            return state;
    }
}

function bookmarkNumbersReducer(state, action) {
    switch (action.type) {
        case 'SET':
            return action.payload;
        case 'UPDATE':
            const updatableBookmarkIndex = state.findIndex((bookmark) => bookmark.id === action.payload.id);
            const updatableBookmark = state[updatableBookmarkIndex];
            const updatedItem = {...updatableBookmark, ...action.payload.data};
            const updatedBookmarks = [...state];
            updatedBookmarks[updatableBookmarkIndex] = updatedItem;
            return updatedBookmarks;
        case 'DELETE':
            return state.filter((bookmark) => bookmark.id !== action.payload);
        default:
            return state;
    }
}

export default function ValueContextProvider({children}) {
    const [uidState, setUidState] = useState();
    const [email, setEmail] = useState();
    const [loadFile, setLoadFile] = useState(false);
    const [editedFileContent, setEditedFileContent] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('');
    const [fileTitle, setFileTitle] = useState([]);
    const [favoriteFileTitle, setFavoriteFileTitle] = useState([]);
    const [readFileTitle, setReadFileTitle] = useState([]);
    const [selectedBook, setSelectedBook] = useState('');
    const [bookmarkIndex, setBookmarkIndex] = useState();
    const [bookmark, setBookmark] = useState([]);

    const [valuesState, dispatch] = useReducer(valuesReducer, []);
    const [booksState, dispatchBooks] = useReducer(booksReducer, []);
    const [fileNamesState, dispatchFileNames] = useReducer(fileNamesReducer, []);
    const [favoriteFileNamesState, dispatchFavoriteFileNames] = useReducer(favoriteFileNamesReducer, []);
    const [readFileNamesState, dispatchReadFileNames] = useReducer(readFileNamesReducer, []);
    const [bookmarkNumbersState, dispatchBookmarkNumbers] = useReducer(bookmarkNumbersReducer, []);


    useEffect(() => {
        const getFileTitleFromStorage = async () => {
            try {
                const storedFileTitle = await AsyncStorage.getItem('fileTitle');
                if (storedFileTitle) {
                    setFileTitle(JSON.parse(storedFileTitle));
                    // setFileTitle([]);  // Обнуляет bookTitle в firebase Realtime Database.
                }
            } catch (error) {
                console.error('getFileTitleFromStorage error: ', error);
            }
        };
        getFileTitleFromStorage();
    }, []);
    useEffect(() => {
        const storeFileTitle = async () => {
            try {
                await AsyncStorage.setItem('fileTitle', JSON.stringify(fileTitle));
            } catch (error) {
                console.error('storeFileTitle error: ', error);
            }
        };
        storeFileTitle();
    }, [fileTitle]);

    useEffect(() => {
        const getFavoriteFileTitleFromStorage = async () => {
            try {
                const storedFavoriteFileTitle = await AsyncStorage.getItem('favoriteFileTitle');
                if (storedFavoriteFileTitle) {
                    setFavoriteFileTitle(JSON.parse(storedFavoriteFileTitle));
                    // setFavoriteFileTitle([]);  // Обнуляет favoriteBookTitle в firebase Realtime Database.
                }
            } catch (error) {
                console.error('getFavoriteFileTitleFromStorage error: ', error);
            }
        };
        getFavoriteFileTitleFromStorage();
    }, []);
    useEffect(() => {
        const storeFavoriteFileTitle = async () => {
            try {
                await AsyncStorage.setItem('favoriteFileTitle', JSON.stringify(favoriteFileTitle));
            } catch (error) {
                console.error('storeFavoriteFileTitle error: ', error);
            }
        };
        storeFavoriteFileTitle();
    }, [favoriteFileTitle]);

    useEffect(() => {
        const getReadFileTitleFromStorage = async () => {
            try {
                const storedReadFileTitle = await AsyncStorage.getItem('readFileTitle');
                if (storedReadFileTitle) {
                    setReadFileTitle(JSON.parse(storedReadFileTitle));
                    // setReadFileTitle([]);  // Обнуляет readBookTitle в firebase Realtime Database.
                }
            } catch (error) {
                console.error('getReadFileTitleFromStorage error: ', error);
            }
        };
        getReadFileTitleFromStorage();
    }, []);
    useEffect(() => {
        const storeReadFileTitle = async () => {
            try {
                await AsyncStorage.setItem('readFileTitle', JSON.stringify(readFileTitle));
            } catch (error) {
                console.error('storeReadFileTitle error: ', error);
            }
        };
        storeReadFileTitle();
    }, [readFileTitle]);

    useEffect(() => {
        const getBookmarkFromStorage = async () => {
            try {
                const storedBookmark = await AsyncStorage.getItem('bookmark');
                if (storedBookmark) {
                    setBookmark(JSON.parse(storedBookmark));
                    // setBookmark([]);  // Обнуляет bookmarkTitle в firebase Realtime Database.
                }
            } catch (error) {
                console.error('getBookmarkFromStorage error: ', error);
            }
        };
        getBookmarkFromStorage();
    }, []);
    useEffect(() => {
        const storeBookmark = async () => {
            try {
                await AsyncStorage.setItem('bookmark', JSON.stringify(bookmark));
            } catch (error) {
                console.error('storeBookmark error: ', error);
            }
        };
        storeBookmark();
    }, [bookmark]);


    function setBooks(books) {
        dispatchBooks({type: 'SET', payload: books});
    }

    function deleteBook(id) {
        dispatchBooks({type: 'DELETE', payload: id});
    }

    function updateBook(id, bookData) {
        dispatchBooks({type: 'UPDATE', payload: {id: id, data: bookData}});
        return { ...booksState };
    }

    function setFileNames(fileNames) {
        dispatchFileNames({type: 'SET', payload: fileNames});
    }

    function setFavoriteFileNames(favoriteFileNames) {
        dispatchFavoriteFileNames({type: 'SET', payload: favoriteFileNames});
    }

    function setReadFileNames(readFileNames) {
        dispatchReadFileNames({type: 'SET', payload: readFileNames});
    }

    function updateBookName(id, bookData) {
        dispatchFileNames({type: 'UPDATE', payload: {id: id, data: bookData}});
    }

    function updateFavoriteBookName(id, favoriteBookData) {
        dispatchFavoriteFileNames({type: 'UPDATE', payload: {id: id, data: favoriteBookData}});
    }

    function updateReadBookName(id, readBookData) {
        dispatchReadFileNames({type: 'UPDATE', payload: {id: id, data: readBookData}});
    }

    function deleteFileName(id) {
        dispatchFileNames({type: 'DELETE', payload: id});
    }

    function deleteFavoriteFileName(id) {
        dispatchFavoriteFileNames({type: 'DELETE', payload: id});
    }

    function deleteReadFileName(id) {
        dispatchReadFileNames({type: 'DELETE', payload: id});
    }

    function setBookmarkNumbers(bookmarkNumbers) {
        dispatchBookmarkNumbers({type: 'SET', payload: bookmarkNumbers});
    }

    function updateBookmarkNumber(id, bookmarkData) {
        dispatchBookmarkNumbers({type: 'UPDATE', payload: {id: id, data: bookmarkData}});
    }

    function deleteBookmarkNumber(id) {
        dispatchBookmarkNumbers({type: 'DELETE', payload: id});
    }

    function setValues(values) {
        dispatch({type: 'SET', payload: values});
    }

    function updateValue(id, valueData) {
        dispatch({type: 'UPDATE', payload: {id: id, data: valueData}});
    }

    function deleteValue(id) {
        dispatch({type: 'DELETE', payload: id});
    }

    function authenticateFirebaseUser(createdFirebaseUser) {
        setUidState(createdFirebaseUser.uid);
        setEmail(createdFirebaseUser.email);
        AsyncStorage.setItem('createdFirebaseUser', JSON.stringify(createdFirebaseUser));
    }
    
    function logoutFirebaseUser() {
        firebase.auth().signOut().then(() => {
            setUidState(null);
            AsyncStorage.removeItem('createdFirebaseUser');
            console.log('logoutFirebaseUser successfully');
        }).catch((error) => {
            console.log('Error logoutFirebaseUser: ', error);
        });
    }

    function deleteSelectedBookBookmarks() {
        try {
            const storedBookmark = AsyncStorage.getItem('bookmark');
            if (storedBookmark) {
                setBookmark([]);
            }
        } catch (error) {
            console.error('getBookmarkFromStorage error: ', error);
        }
    }

    const value = {
        values: valuesState,
        books: booksState,
        fileNames: fileNamesState,
        favoriteFileNames: favoriteFileNamesState,
        readFileNames: readFileNamesState,
        bookmarkNumbers: bookmarkNumbersState,
        setValues: setValues,
        setBooks: setBooks,
        setFileNames: setFileNames,
        setFavoriteFileNames: setFavoriteFileNames,
        setReadFileNames: setReadFileNames,
        setBookmarkNumbers: setBookmarkNumbers,
        deleteValue: deleteValue,
        deleteBook: deleteBook,
        deleteFileName: deleteFileName,
        deleteFavoriteFileName: deleteFavoriteFileName,
        deleteReadFileName: deleteReadFileName,
        deleteBookmarkNumber: deleteBookmarkNumber,
        updateValue: updateValue,
        updateBook: updateBook,
        updateBookName: updateBookName,
        updateFavoriteBookName: updateFavoriteBookName,
        updateReadBookName: updateReadBookName,
        updateBookmarkNumber: updateBookmarkNumber,
        uid: uidState,
        email: email,
        isFirebaseUserAuthenticated: !!uidState,
        authenticateFirebaseUser: authenticateFirebaseUser,
        logoutFirebaseUser: logoutFirebaseUser,
        deleteSelectedBookBookmarks: deleteSelectedBookBookmarks,
        loadFile: loadFile,
        setLoadFile: setLoadFile,
        editedFileContent: editedFileContent,
        setEditedFileContent: setEditedFileContent,
        selectedFileName: selectedFileName,
        setSelectedFileName: setSelectedFileName,
        fileTitle: fileTitle,
        setFileTitle: setFileTitle,
        setFavoriteFileTitle: setFavoriteFileTitle,
        favoriteFileTitle: favoriteFileTitle,
        setReadFileTitle: setReadFileTitle,
        readFileTitle: readFileTitle,
        bookmarkIndex: bookmarkIndex,
        setBookmarkIndex: setBookmarkIndex,
        bookmark: bookmark,
        setBookmark: setBookmark,
        selectedBook: selectedBook,
        setSelectedBook: setSelectedBook,
    }

    return <ValueContext.Provider value={value}>{children}</ValueContext.Provider>
}