/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
    const {
        resolver: { sourceExts, assetExts },
    } = await getDefaultConfig();

    return {
        transformer: {
            getTransformOptions: async () => ({
                transform: {
                    experimentalImportSupport: false,
                    inlineRequires: true,
                },
            }),
        },
        resolver: {
            assetExts,
            sourceExts,
            extraNodeModules: {
                // Polyfills for node modules
                os: require.resolve('./util/polyfills.js'),
            },
        },
    };
})();
