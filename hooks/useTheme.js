import { useContext, useMemo } from 'react';
import { ValueContext } from '../store/value-context';
import { KolorKit } from '../constants/styles';

/**
 * Hook to get theme values based on current app theme
 * Usage: const theme = useTheme();
 * Then access theme values like: theme.backgroundApp, theme.textWhite, etc.
 */
export default function useTheme() {
    const { appTheme } = useContext(ValueContext);

    const theme = useMemo(() => {
        switch (appTheme) {
            case 'darkTheme':
                return KolorKit.darkTheme;
            case 'lightTheme':
                return KolorKit.lightTheme;
            default:
                return KolorKit.blackBlueTheme;
        }
    }, [appTheme]);

    return theme;
}
