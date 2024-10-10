import axios from "axios";
import { firebase } from "./firebase";

const BACKEND_URL = 'https://clip-reader-default-rtdb.europe-west1.firebasedatabase.app/';


export async function storeValue(valueData, uid) {  // Отправить данные на сервер.
    const response = await axios.post(BACKEND_URL + `${uid}/values.json`, valueData);
    const id = response.data.name;  // У Firebase id называется name. У других серверов может быть по-другому!
    return id;
}

export async function fetchValues(uid) {  // Запросить данные сервера.
    const valuesResponse = await axios.get(BACKEND_URL + `${uid}/values.json`);

    const values = [];

    for (const key in valuesResponse.data) {
        const valueObj = {
            id: key,
            name: valuesResponse.data[key].name,
            date: new Date(valuesResponse.data[key].date)
        };
        values.push(valueObj);
    }
    return values;
}

export async function fetchFileNames(uid) {  // Запросить данные сервера.
    const fileNamesResponse = await axios.get(BACKEND_URL + `${uid}/bookTitle.json`);

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

export async function fetchFavoriteFileNames(uid) {  // Запросить данные сервера.
    const favoriteFileNamesResponse = await axios.get(BACKEND_URL + `${uid}/favoriteBookTitle.json`);

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

export async function fetchReadFileNames(uid) {  // Запросить данные сервера.
    const readFileNamesResponse = await axios.get(BACKEND_URL + `${uid}/readBookTitle.json`);

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

export async function fetchBookmarks(uid, selectedBook) {  // Запросить данные сервера.
    const bookmarksResponse = await axios.get(BACKEND_URL + `${uid}/bookmark/${selectedBook}.json`);

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

export async function fetchBooks(uid) {  // Запросить данные сервера.
    const booksResponse = await axios.get(BACKEND_URL + `${uid}/books.json`);

    const books = [];

    for (const key in booksResponse.data) {
        const bookObj = {
            id: key,
            word: booksResponse.data[key],
            index: booksResponse.data[key]?.index
        };
        books.push(bookObj);
    }
    return books;
}

export async function getValue(uid, valueId) {  // Получить данные из firebase Realtime Database.
        const dbRef = firebase.database().ref(`${uid}/values/${valueId}`);
        try {
            const snapshot = await dbRef.once('value');
            return snapshot.val();
        } catch (error) {
            console.error('Error to get values from database', error);
            return null;
        }
}

export async function getFileName(uid, bookId) {  // Получить данные из firebase Realtime Database.
    const dbRef = firebase.database().ref(`${uid}/books/bookTitle`);
    try {
        const snapshot = await dbRef.once('value');
        return snapshot.val();
    } catch (error) {
        console.error('Error to get fileNames from database', error);
        return null;
    }
}

export async function getFavoriteFileName(uid, bookId) {  // Получить данные из firebase Realtime Database.
    const dbRef = firebase.database().ref(`${uid}/books/favoriteBookTitle`);
    try {
        const snapshot = await dbRef.once('value');
        return snapshot.val();
    } catch (error) {
        console.error('Error to get favoriteFileNames from database', error);
        return null;
    }
}

export async function getReadFileName(uid, bookId) {  // Получить данные из firebase Realtime Database.
    const dbRef = firebase.database().ref(`${uid}/books/readBookTitle`);
    try {
        const snapshot = await dbRef.once('value');
        return snapshot.val();
    } catch (error) {
        console.error('Error to get readFileNames from database', error);
        return null;
    }
}

export async function getBookmark(uid, selectedBook, bookId) {  // Получить данные из firebase Realtime Database.
    const dbRef = firebase.database().ref(`${uid}/books/bookmark/${selectedBook}`);
    try {
        const snapshot = await dbRef.once('value');
        return snapshot.val();
    } catch (error) {
        console.error('Error to get bookmarks from database', error);
        return null;
    }
}

export async function getBook(uid, bookId, selectedBookTitle) {  // Получить данные из firebase Realtime Database.
    const dbRef = firebase.database().ref(`${uid}/books/${selectedBookTitle}`);
    try {
        const snapshot = await dbRef.once('value');
        const bookData = snapshot.val();
        return bookData;
    } catch (error) {
        console.error('Error to get books from database', error);
        return null;
    }
}

export function updateValue(uid, id, valueData) {  // Отправить данные на firebase Realtime Database.
    axios.put(BACKEND_URL + `${uid}/values/${id}.json`, valueData);
}

export async function updateBook(uid, id, editedFileContent, selectedFileName, startingIndex = 0) {  // Отправить данные на firebase Realtime Database.   
    for (const [index, item] of editedFileContent.entries()) {
        const globalIndex = startingIndex + index;
        const updateData = { item: item, index: globalIndex };
        await axios.put(BACKEND_URL + `${uid}/books/${selectedFileName}/${globalIndex}.json`, updateData);
    }
}

export function updateBookName(uid, updateData) {  // Отправить данные на firebase Realtime Database.
    axios.put(BACKEND_URL + `${uid}/books/bookTitle.json`, updateData);
}

export function updateFavoriteBookName(uid, updateFavoriteData) {  // Отправить данные на firebase Realtime Database.
    axios.put(BACKEND_URL + `${uid}/books/favoriteBookTitle.json`, updateFavoriteData);
}

export function updateReadBookName(uid, updateReadData) {  // Отправить данные на firebase Realtime Database.
    axios.put(BACKEND_URL + `${uid}/books/readBookTitle.json`, updateReadData);
}

export function updateBookmarkNumber(uid, selectedBook, updateData) {  // Отправить данные на firebase Realtime Database.
    axios.put(BACKEND_URL + `${uid}/books/bookmark/${selectedBook}.json`, updateData);
}

export function deleteValue(id, uid) {
    axios.delete(BACKEND_URL + `${uid}/values/${id}.json`);
}

export function deleteBook(uid, title) {
    axios.delete(BACKEND_URL + `${uid}/books/${title}.json`);
}

export function deleteBookmarkNumber(uid, selectedBook) {
    axios.delete(BACKEND_URL + `${uid}/books/bookmark/${selectedBook}.json`);
}

export async function getBooksFolderLength(uid, folder) {
    const dbRef = firebase.database().ref(`${uid}/books/${folder}`);

    const snapshot = await dbRef.once('value');
    const numChildren = snapshot.numChildren();
    return numChildren;
}