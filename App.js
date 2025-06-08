import React, { useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Image, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import RNRestart from 'react-native-restart';
import useTheme from './hooks/useTheme';
import useStatusBarTheme from './hooks/useStatusBarTheme';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ValueContextProvider, { ValueContext } from './store/value-context';
import LoadingOverlay from './components/ui/LoadingOverlay';
import ScrollingText from './components/ui/ScrollingText';
import LibraryScreen from './screens/LibraryScreen';
import UserProphileScreen from './screens/UserProphileScreen';
import ProphileInfoScreen from './screens/UserProphile/ProphileInfoScreen';
import AboutAppScreen from './screens/UserProphile/AboutAppScreen';
import AppThemeScreen from './screens/UserProphile/AppThemeScreen';
import EditProfileScreen from './screens/UserProphile/EditProfileScreen';
import BookListScreen from './screens/BookListScreen';
import FavoritesListScreen from './screens/FavoritesListScreen';
import ReadListScreen from './screens/ReadListScreen';
import BookScreen from './screens/Book/BookScreen';

const Stack = createNativeStackNavigator();
const BottomTab = createBottomTabNavigator();

function AuthStack() {
    const theme = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: theme.backgroundApp,
                },
            }}>
            <Stack.Screen name='Login' component={LoginScreen} />
            <Stack.Screen name='Signup' component={SignupScreen} />
        </Stack.Navigator>
    );
}

function BottomTabNavigator() {
    const theme = useTheme();

    return (
        <BottomTab.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.backgroundContent,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.lineDark,
                },
                headerTitleAlign: 'center',
                headerTintColor: theme.textWhite,
                tabBarActiveTintColor: theme.yellow400,
                tabBarInactiveTintColor: theme.iconButton,
                tabBarStyle: {
                    backgroundColor: theme.backgroundContent,
                    borderTopWidth: 1,
                    borderTopColor: theme.lineDark,
                },
            }}>
            <BottomTab.Screen
                name='LibraryScreen'
                component={LibraryScreen}
                options={{
                    title: 'Library',
                    tabBarIcon: ({ focused }) => {
                        return (
                            <Ionicons
                                name='library'
                                size={24}
                                color={
                                    focused
                                        ? theme.yellow500
                                        : theme.iconButton
                                }
                            />
                        );
                    },
                }}
            />
            <BottomTab.Screen
                name='Prophile'
                component={UserProphileScreen}
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => {
                        return (
                            <MaterialIcons
                                name='people-alt'
                                size={24}
                                color={
                                    focused
                                        ? theme.yellow500
                                        : theme.iconButton
                                }
                            />
                        );
                    },
                }}
            />
        </BottomTab.Navigator>
    );
}

function AuthenticatedStack() {
    const authCtx = useContext(ValueContext);
    const { selectedBook, selectedBookMetadata, appTheme } = authCtx;
    const theme = useTheme();

    const getBackIcon = () => {
        return appTheme === 'lightTheme'
            ? require('./assets/backSaveIconBlack.png')
            : require('./assets/backSaveIcon.png');
    };

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.backgroundContent,
                },
                headerTintColor: theme.textWhite,
                contentStyle: {
                    borderTopWidth: 1,
                    borderTopColor: theme.lineDark,
                },
            }}>
            <Stack.Screen
                name='BottomTab'
                component={BottomTabNavigator}
                options={{
                    headerShown: false,
                    contentStyle: {
                        borderTopWidth: 0,
                    },
                }}
            />
            <Stack.Screen
                name='ProphileInfoScreen'
                component={ProphileInfoScreen}
                options={{
                    title: 'Profile Info',
                }}
            />
            <Stack.Screen
                name='AboutAppScreen'
                component={AboutAppScreen}
                options={{
                    title: 'About App',
                }}
            />
            <Stack.Screen
                name='AppThemeScreen'
                component={AppThemeScreen}
                options={{
                    title: 'Change Theme',
                }}
            />
            <Stack.Screen
                name='EditProfileScreen'
                component={EditProfileScreen}
                initialParams={{ valueId: authCtx.editedValueId }}
                options={{
                    title: 'Edit Profile',
                }}
            />
            <Stack.Screen
                name='BookListScreen'
                component={BookListScreen}
                initialParams={{ bookId: authCtx.editedBookId }}
                options={{
                    title: 'Book List',
                    headerLeft: () => (
                        <Pressable onPress={() => RNRestart.Restart()}>
                            <Image
                                source={getBackIcon()}
                                style={{
                                    marginRight: '10%',
                                    marginBottom: '25%',
                                }}
                            />
                        </Pressable>
                    ),
                }}
            />
            <Stack.Screen
                name='FavoritesListScreen'
                component={FavoritesListScreen}
                options={{
                    title: 'Favorites',
                    headerLeft: () => (
                        <Pressable onPress={() => RNRestart.Restart()}>
                            <Image
                                source={getBackIcon()}
                                style={{
                                    marginRight: '10%',
                                    marginBottom: '25%',
                                }}
                            />
                        </Pressable>
                    ),
                }}
            />
            <Stack.Screen
                name='ReadListScreen'
                component={ReadListScreen}
                options={{
                    title: 'Read',
                    headerLeft: () => (
                        <Pressable onPress={() => RNRestart.Restart()}>
                            <Image
                                source={getBackIcon()}
                                style={{
                                    marginRight: '10%',
                                    marginBottom: '25%',
                                }}
                            />
                        </Pressable>
                    ),
                }}
            />
            <Stack.Screen
                name='BookScreen'
                component={BookScreen}
                options={{
                    headerTitle: () => {
                        const displayTitle = selectedBookMetadata && selectedBookMetadata.title 
                            ? selectedBookMetadata.title 
                            : selectedBook.substring(0, selectedBook.length - 7);
                        return <ScrollingText marqueeDelay={10000} title={displayTitle} />;
                    },
                    contentStyle: {
                        borderTopWidth: 0,
                    },
                }}
            />
        </Stack.Navigator>
    );
}

function Navigation() {
    const authCtx = useContext(ValueContext);

    return (
        <NavigationContainer>
            {!authCtx.isFirebaseUserAuthenticated && <AuthStack />}
            {authCtx.isFirebaseUserAuthenticated && <AuthenticatedStack />}
        </NavigationContainer>
    );
}

function Root() {
    const [isTryingLogin, setIsTryingLogin] = useState(true);
    const authCtx = useContext(ValueContext);

    useEffect(() => {
        async function fetchCreatedFirebaseUser() {
            const storedUser = await AsyncStorage.getItem(
                'createdFirebaseUser',
            );
            const storedUserParsed = JSON.parse(storedUser);

            if (storedUser) {
                await authCtx.authenticateFirebaseUser(storedUserParsed);
            }
            setIsTryingLogin(false);
        }
        fetchCreatedFirebaseUser();
    }, []);

    if (isTryingLogin) {
        return <LoadingOverlay message='Logging you in...' />;
    }

    return <Navigation />;
}

export default function App() {
    return (
        <>
            <ValueContextProvider>
                <AppContent />
            </ValueContextProvider>
        </>
    );
}

function AppContent() {
    const statusBarTheme = useStatusBarTheme();

    return (
        <>
            <StatusBar style={statusBarTheme} />
            <Root />
        </>
    );
}
