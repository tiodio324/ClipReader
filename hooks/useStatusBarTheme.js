import { useContext, useMemo } from 'react';
import { ValueContext } from '../store/value-context';

/**
 * Hook to get status bar theme based on current app theme
 * Usage: const statusBarTheme = useStatusBarTheme();
 */
export default function useStatusBarTheme() {
    const { appTheme } = useContext(ValueContext);

    const statusBarTheme = useMemo(() => {
        switch (appTheme) {
            case 'darkTheme':
                return 'light';
            case 'lightTheme':
                return 'dark';
            default:
                return 'light';
        }
    }, [appTheme]);

    return statusBarTheme;
}