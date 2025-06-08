import axios from 'axios';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { firebase, db } from './firebase';

// eslint-disable-next-line prettier/prettier
const BACKEND_URL =
    'https://clip-reader-default-rtdb.europe-west1.firebasedatabase.app/';

export async function fetchFileNames(uid) {
    // Запросить данные сервера.
    const fileNamesResponse = await axios.get(
        BACKEND_URL + `${uid}/bookTitle.json`,
    );

    const fileNames = [];

    for (const key in fileNamesResponse.data) {
        const fileNameObj = {
            id: key,
            bookTitle: valuesResponse.data[key].bookTitle,
        };
        fileNames.push(fileNameObj);
    }
    return fileNames;
}

export async function fetchFavoriteFileNames(uid) {
    // Запросить данные сервера.
    const favoriteFileNamesResponse = await axios.get(
        BACKEND_URL + `${uid}/favoriteBookTitle.json`,
    );

    const favoriteFileNames = [];

    for (const key in favoriteFileNamesResponse.data) {
        const favoriteFileNameObj = {
            id: key,
            favoriteBookTitle: valuesResponse.data[key].favoriteBookTitle,
        };
        favoriteFileNames.push(favoriteFileNameObj);
    }
    return favoriteFileNames;
}

export async function fetchReadFileNames(uid) {
    // Запросить данные сервера.
    const readFileNamesResponse = await axios.get(
        BACKEND_URL + `${uid}/readBookTitle.json`,
    );

    const readFileNames = [];

    for (const key in readFileNamesResponse.data) {
        const readFileNameObj = {
            id: key,
            readBookTitle: valuesResponse.data[key].readBookTitle,
        };
        readFileNames.push(readFileNameObj);
    }
    return readFileNames;
}

export async function fetchBookmarks(uid, selectedBook) {
    // Запросить данные сервера.
    const bookmarksResponse = await axios.get(
        BACKEND_URL + `${uid}/bookmark/${selectedBook}.json`,
    );

    const bookmarks = [];

    for (const key in bookmarksResponse.data) {
        const bookmarkObj = {
            id: key,
            bookmarkTitle: valuesResponse.data[key].bookmarkTitle,
        };
        bookmarks.push(bookmarkObj);
    }
    return bookmarks;
}

export async function fetchBooks(uid) {
    // Запросить данные сервера.
    const booksResponse = await axios.get(BACKEND_URL + `${uid}/books.json`);

    const books = [];

    for (const key in booksResponse.data) {
        const bookObj = {
            id: key,
            word: booksResponse.data[key],
            index: booksResponse.data[key]?.index,
        };
        books.push(bookObj);
    }
    return books;
}

export async function getValue(uid) {
    // Получить данные из firebase Realtime Database.
    const dbRef = firebase.database().ref(`${uid}/values/personal`);
    try {
        const snapshot = await dbRef.once('value');
        return snapshot.val();
    } catch (error) {
        console.error('Error to get values from database', error);
        return null;
    }
}

export async function getFileName(uid, bookId) {
    // Получить данные из firebase Realtime Database.
    const dbRef = firebase.database().ref(`${uid}/books/bookTitle`);
    try {
        const snapshot = await dbRef.once('value');
        return snapshot.val();
    } catch (error) {
        console.error('Error to get fileNames from database', error);
        return null;
    }
}

export async function getFavoriteFileName(uid, bookId) {
    // Получить данные из firebase Realtime Database.
    const dbRef = firebase.database().ref(`${uid}/books/favoriteBookTitle`);
    try {
        const snapshot = await dbRef.once('value');
        return snapshot.val();
    } catch (error) {
        console.error('Error to get favoriteFileNames from database', error);
        return null;
    }
}

export async function getReadFileName(uid, bookId) {
    // Получить данные из firebase Realtime Database.
    const dbRef = firebase.database().ref(`${uid}/books/readBookTitle`);
    try {
        const snapshot = await dbRef.once('value');
        return snapshot.val();
    } catch (error) {
        console.error('Error to get readFileNames from database', error);
        return null;
    }
}

export async function getBookmark(uid, selectedBook, bookId) {
    // Получить данные из firebase Realtime Database.
    const dbRef = firebase
        .database()
        .ref(`${uid}/books/bookmark/${selectedBook}`);
    try {
        const snapshot = await dbRef.once('value');
        return snapshot.val();
    } catch (error) {
        console.error('Error to get bookmarks from database', error);
        return null;
    }
}

export async function getBook(uid, bookId, selectedBookTitle) {
    // Получить данные из firebase Realtime Database.
    const dbRef = firebase.database().ref(`${uid}/books/${selectedBookTitle}`);
    try {
        // Получить данные из Firestore Cloud Database
        // const snapshot = await getDocs(collection(db, `${uid}/books/${selectedBookTitle}`));
        // const bookData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const snapshot = await dbRef.once('value');
        const bookData = snapshot.val();

        if (!bookData) return null;


        const bookDataWithoutMetadata = {};
        Object.keys(bookData).forEach(key => {
            if (key !== 'bookMetadata') {
                bookDataWithoutMetadata[key] = bookData[key];
            }
        });

        return bookDataWithoutMetadata;
    } catch (error) {
        console.error('Error to get books from database', error);
        return null;
    }
}

export function updateValue(uid, valueData) {
    // Отправить данные на firebase Realtime Database.
    axios.put(BACKEND_URL + `${uid}/values/personal.json`, valueData);
}

export async function updateBook(
    uid,
    id,
    editedFileContent,
    selectedFileName,
    startingIndex = 0,
    bookMetadata,
) {
    if (bookMetadata) {
        await axios.put(
            BACKEND_URL + `${uid}/books/${selectedFileName}/bookMetadata.json`,
            bookMetadata
        );
    }

    // Отправить данные на firebase Realtime Database.
    for (const [index, item] of editedFileContent.entries()) {
        const globalIndex = startingIndex + index;
        const updateData = { item: item, index: globalIndex };
        await axios.put(
            BACKEND_URL +
                `${uid}/books/${selectedFileName}/${globalIndex}.json`,
            updateData,
        );

        // Отправить данные на Firestore Cloud Database
        // await setDoc(doc(db, `${uid}/books/${selectedFileName}/${globalIndex}`), updateData);
    }
}

export function updateBookName(uid, updateData) {
    // Отправить данные на firebase Realtime Database.
    axios.put(BACKEND_URL + `${uid}/books/bookTitle.json`, updateData);
}

export function updateFavoriteBookName(uid, updateFavoriteData) {
    // Отправить данные на firebase Realtime Database.
    axios.put(
        BACKEND_URL + `${uid}/books/favoriteBookTitle.json`,
        updateFavoriteData,
    );
}

export function updateReadBookName(uid, updateReadData) {
    // Отправить данные на firebase Realtime Database.
    axios.put(BACKEND_URL + `${uid}/books/readBookTitle.json`, updateReadData);
}

export function updateBookmarkNumber(uid, selectedBook, updateData) {
    // Отправить данные на firebase Realtime Database.
    axios.put(
        BACKEND_URL + `${uid}/books/bookmark/${selectedBook}.json`,
        updateData,
    );
}

export function deleteValue(uid) {
    axios.delete(BACKEND_URL + `${uid}/values/personal.json`);
}

export function deleteBook(uid, title) {
    return new Promise(async (resolve, reject) => {
        try {
            const metadataRef = firebase.database().ref(`${uid}/books/${title}/bookMetadata`);
            const metadataSnapshot = await metadataRef.once('value');
            const metadata = metadataSnapshot.val();

            const bookRef = firebase.database().ref(`${uid}/books/${title}`);
            await bookRef.remove();

            if (metadata) {
                await metadataRef.set(metadata);
            }

            resolve(metadata);
        } catch (error) {
            console.error('Error deleting book while preserving metadata:', error);
            reject(error);
        }
    });
}

export function deleteBookMetadata(uid, title) {
    axios.delete(BACKEND_URL + `${uid}/books/${title}/bookMetadata.json`);
}

export function deleteBookmarkNumber(uid, selectedBook) {
    axios.delete(BACKEND_URL + `${uid}/books/bookmark/${selectedBook}.json`);
}

export function deleteAllAccountData(uid) {
    axios.delete(BACKEND_URL + `${uid}.json`);
    deleteAllUserStorageFiles(uid);
}

async function deleteAllUserStorageFiles(uid) {
    try {
        const storageRef = firebase.storage().ref(uid);
        const listResult = await storageRef.listAll();
        const deletePromises = listResult.items.map(fileRef => fileRef.delete());

        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Error deleting user files from Firebase Storage:', error);
    }
}

export async function getBooksFolderLength(uid, folder) {
    const dbRef = firebase.database().ref(`${uid}/books/${folder}`);

    const snapshot = await dbRef.once('value');
    const numChildren = snapshot.numChildren();
    return numChildren;
}

export async function getBookMetadata(uid, selectedBookTitle) {
    const dbRef = firebase.database().ref(`${uid}/books/${selectedBookTitle}/bookMetadata`);
    try {
        const snapshot = await dbRef.once('value');
        const metadata = snapshot.val();

        if (metadata) {
            return [{
                title: selectedBookTitle,
                metadata: metadata
            }];
        } else {
            return [{
                title: selectedBookTitle,
                metadata: {}
            }];
        }
    } catch (error) {
        console.error('Error to get books metadata from database', error);
        return [{
            title: selectedBookTitle,
            metadata: {}
        }];
    }
}

export async function getAllBooksMetadata(uid, bookListSliceNumber = 8, favoritesListSliceNumber = 12, readListSliceNumber = 12) {
    try {
        const bookTitlesRef = firebase.database().ref(`${uid}/books/bookTitle`);
        const bookTitlesSnapshot = await bookTitlesRef.once('value');
        const bookTitles = bookTitlesSnapshot.val();

        const favoriteBookTitlesRef = firebase.database().ref(`${uid}/books/favoriteBookTitle`);
        const favoriteBookTitlesSnapshot = await favoriteBookTitlesRef.once('value');
        const favoriteBookTitles = favoriteBookTitlesSnapshot.val();

        const readBookTitlesRef = firebase.database().ref(`${uid}/books/readBookTitle`);
        const readBookTitlesSnapshot = await readBookTitlesRef.once('value');
        const readBookTitles = readBookTitlesSnapshot.val();

        if ((!bookTitles || !bookTitles.length) && 
            (!favoriteBookTitles || !favoriteBookTitles.length) && 
            (!readBookTitles || !readBookTitles.length)) {
            return { allMetadata: [], firstImgCovers: { bookList: [], favorites: [], readList: [] } };
        }

        const uniqueTitles = new Set();

        if (bookTitles) {
            bookTitles.forEach(title => uniqueTitles.add(title));
        }

        if (favoriteBookTitles) {
            favoriteBookTitles.forEach(title => uniqueTitles.add(title));
        }

        if (readBookTitles) {
            readBookTitles.forEach(title => uniqueTitles.add(title));
        }

        const metadataPromises = Array.from(uniqueTitles).map(async (bookTitle) => {
            const metadataRef = firebase.database().ref(`${uid}/books/${bookTitle}/bookMetadata`);
            const metadataSnapshot = await metadataRef.once('value');
            const metadata = metadataSnapshot.val();

            return {
                title: bookTitle,
                coverImage: metadata?.coverImage || '',
                inBookList: bookTitles && bookTitles.includes(bookTitle),
                inFavorites: favoriteBookTitles && favoriteBookTitles.includes(bookTitle),
                inReadList: readBookTitles && readBookTitles.includes(bookTitle),
                metadata: metadata || {}
            };
        });

        const allMetadata = await Promise.all(metadataPromises);

        const firstImgCovers = {
            bookList: allMetadata
                .filter(book => book.inBookList && book.coverImage && book.coverImage !== '')
                .slice(0, bookListSliceNumber)
                .map(book => ({
                    title: book.title,
                    coverImage: book.coverImage
                })),
                
            favorites: allMetadata
                .filter(book => book.inFavorites && book.coverImage && book.coverImage !== '')
                .slice(0, favoritesListSliceNumber)
                .map(book => ({
                    title: book.title,
                    coverImage: book.coverImage
                })),
                
            readList: allMetadata
                .filter(book => book.inReadList && book.coverImage && book.coverImage !== '')
                .slice(0, readListSliceNumber)
                .map(book => ({
                    title: book.title,
                    coverImage: book.coverImage
                }))
        };

        return { allMetadata, firstImgCovers };
    } catch (error) {
        console.error('Error getting all books metadata from database:', error);
        return { allMetadata: [], firstImgCovers: { bookList: [], favorites: [], readList: [] } };
    }
}
