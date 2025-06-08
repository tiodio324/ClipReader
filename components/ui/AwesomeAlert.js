import { StyleSheet } from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';
import useTheme from '../../hooks/useTheme';

const CustomAwesomeAlert = ({ 
    show, 
    title, 
    message, 
    showCancelButton = false,
    showConfirmButton = true,
    cancelText = 'Cancel',
    confirmText = 'OK',
    onCancelPressed,
    onConfirmPressed,
    confirmButtonColor,
    cancelButtonColor,
    shouldCloseOnOverClick = false,
    closeOnHardwareBackPress = false,
    ...otherProps 
}) => {
    const theme = useTheme();

    const themedStyles = StyleSheet.create({
        alertContainer: {
            backgroundColor: theme.backgroundBox,
            opacity: 0.85,
        },
        contentContainer: {
            backgroundColor: theme.backgroundBox,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.lineDark,
        },
        title: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.textWhite,
            textAlign: 'center',
        },
        message: {
            fontSize: 16,
            color: theme.textWhite,
            textAlign: 'center',
            opacity: 0.9,
        },
        actionContainer: {
            marginTop: 8,
        },
        confirmButton: {
            borderRadius: 8,
            paddingVertical: 10,
        },
        cancelButton: {
            borderRadius: 8,
            paddingVertical: 10,
        },
        confirmButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.btnText,
        },
        cancelButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.btnText,
        },
    });

    return (
        <AwesomeAlert
            show={show}
            showProgress={false}
            title={title}
            message={message}
            closeOnTouchOutside={shouldCloseOnOverClick}
            closeOnHardwareBackPress={closeOnHardwareBackPress}
            showCancelButton={showCancelButton}
            showConfirmButton={showConfirmButton}
            cancelText={cancelText}
            confirmText={confirmText}
            confirmButtonColor={confirmButtonColor || theme.yellow400}
            cancelButtonColor={cancelButtonColor || theme.iconButton}
            onCancelPressed={onCancelPressed}
            onConfirmPressed={onConfirmPressed}

            alertContainerStyle={themedStyles.alertContainer}
            contentContainerStyle={themedStyles.contentContainer}
            titleStyle={themedStyles.title}
            messageStyle={themedStyles.message}
            actionContainerStyle={themedStyles.actionContainer}
            confirmButtonStyle={themedStyles.confirmButton}
            cancelButtonStyle={themedStyles.cancelButton}
            confirmButtonTextStyle={themedStyles.confirmButtonText}
            cancelButtonTextStyle={themedStyles.cancelButtonText}
            useNativeDriver={false}
            {...otherProps}
        />
    );
};

export default CustomAwesomeAlert; 