import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useTheme from '../../hooks/useTheme';
import packageJson from '../../package.json';

const AppVersion = () => {
    const theme = useTheme();

    const themedStyles = StyleSheet.create({
        container: {
            backgroundColor: theme.backgroundBox,
            marginHorizontal: 16,
            marginTop: 20,
            marginBottom: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.yellow500,
            paddingVertical: 14,
            alignItems: 'center',
            elevation: 3,
        },
        appInfo: {
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'center',
        },
        appName: {
            fontSize: 14,
            color: theme.textWhite,
            opacity: 0.8,
        },
        separator: {
            fontSize: 14,
            color: theme.textWhite,
            opacity: 0.5,
            marginHorizontal: 6,
        },
        version: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.yellow500,
        },
        versionLabel: {
            fontSize: 12,
            color: theme.textWhite,
            opacity: 0.6,
            marginTop: 4,
        }
    });

    return (
        <View style={themedStyles.container}>
            <View style={themedStyles.appInfo}>
                <Text style={themedStyles.appName}>{packageJson.name}</Text>
                <Text style={themedStyles.separator}>•</Text>
                <Text style={themedStyles.version}>v{packageJson.version}</Text>
            </View>
            <Text style={themedStyles.versionLabel}>Current Version</Text>
        </View>
    );
};

export default AppVersion;