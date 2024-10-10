import React, { useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {
    Text,
    View,
    Image,
    Pressable
} from 'react-native';
import {KolorKit} from './constants/styles';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import RNRestart from 'react-native-restart';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ValueContextProvider, { ValueContext } from './store/value-context';
import LoadingOverlay from './components/ui/LoadingOverlay';
import LibraryScreen from './screens/LibraryScreen';
import UserProphileScreen from './screens/UserProphileScreen';
import ProphileInfoScreen from './screens/UserProphile/ProphileInfoScreen';
import AboutAppScreen from './screens/UserProphile/AboutAppScreen';
import EditProfileScreen from './screens/UserProphile/EditProfileScreen';
import BookListScreen from './screens/BookListScreen';
import FavoritesListScreen from './screens/FavoritesListScreen';
import ReadListScreen from './screens/ReadListScreen';
import BookScreen from './screens/Book/BookScreen';


const Stack = createNativeStackNavigator();
const BottomTab = createBottomTabNavigator();

function AuthStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: KolorKit.blackBlueTheme.backgroundApp },
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Navigator>
    );
}


function BottomTabNavigator() {
    return (
        <BottomTab.Navigator screenOptions={{
            headerStyle: {
                backgroundColor: KolorKit.blackBlueTheme.backgroundContent,
                borderBottomWidth: 1,
                borderBottomColor: KolorKit.blackBlueTheme.lineDark,
            },
            headerTitleAlign: 'center',
            headerTintColor: KolorKit.blackBlueTheme.textWhite,
            tabBarActiveTintColor: KolorKit.blackBlueTheme.yellow400,
            tabBarInactiveTintColor: KolorKit.blackBlueTheme.iconButton,
            tabBarStyle: {
                backgroundColor: KolorKit.blackBlueTheme.backgroundContent,
                borderTopWidth: 1,
                borderTopColor: KolorKit.blackBlueTheme.lineDark,
            },
        }}>
            <BottomTab.Screen
                name="LibraryScreen"
                component={LibraryScreen}
                options={{
                    title: 'Library',
                    tabBarIcon: ({focused}) => {
                        return <Ionicons name="library" size={24} color={focused ? KolorKit.blackBlueTheme.yellow500 : KolorKit.blackBlueTheme.iconButton}/>
                    },
                }}
            />
            <BottomTab.Screen
                name='Prophile'
                component={UserProphileScreen}
                options={{
                    title: 'Profile',
                    tabBarIcon: ({focused}) => {
                        return <MaterialIcons name="people-alt" size={24} color={focused ? KolorKit.blackBlueTheme.yellow500 : KolorKit.blackBlueTheme.iconButton}/>
                    },
                }}
            />
        </BottomTab.Navigator>
    );
}

function AuthenticatedStack() {
    const authCtx = useContext(ValueContext);
    const { selectedBook } = authCtx;



    return (
        <Stack.Navigator screenOptions={{
            headerStyle: {
                backgroundColor: KolorKit.blackBlueTheme.backgroundContent,
            },
            headerTintColor: KolorKit.blackBlueTheme.textWhite,
            contentStyle: {
                borderTopWidth: 1,
                borderTopColor: KolorKit.blackBlueTheme.lineDark,
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
                    title: 'Profile Info'
                }}
            />
            <Stack.Screen
                name='AboutAppScreen'
                component={AboutAppScreen}
                options={{
                    title: 'About App'
                }}
            />
            <Stack.Screen
                name='EditProfileScreen'
                component={EditProfileScreen}
                initialParams={{ valueId: authCtx.editedValueId }}
                options={{
                    title: 'Edit Profile'
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
                            <Image source={require('./assets/backSaveIcon.png')} style={{marginRight: '10%', marginBottom: '25%'}} />
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
                            <Image source={require('./assets/backSaveIcon.png')} style={{marginRight: '10%', marginBottom: '25%'}} />
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
                            <Image source={require('./assets/backSaveIcon.png')} style={{marginRight: '10%', marginBottom: '25%'}} />
                        </Pressable>
                    ),
                }}
            />
            <Stack.Screen
                name='BookScreen'
                component={BookScreen}
                options={{
                    headerTitle: selectedBook.substring(0, selectedBook.length - 7),
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
            const storedUser  = await AsyncStorage.getItem('createdFirebaseUser');
            const storedUserParsed = JSON.parse(storedUser);

            if (storedUser) {
                await authCtx.authenticateFirebaseUser(storedUserParsed);
            }
            setIsTryingLogin(false);
        }
        fetchCreatedFirebaseUser();
    }, []);

    if (isTryingLogin) {
        return <LoadingOverlay message="Logging you in..." />
    }

    return <Navigation />
}



export default function App() {
    return (
        <>
            <StatusBar style='light'/>
            <ValueContextProvider>
                <Root />
            </ValueContextProvider>
        </>
    );
}