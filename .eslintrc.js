module.exports = {
    root: true,
    extends: '@react-native-community',
    rules: {
        'jsx-quotes': 'off',
        'react-native/no-inline-styles': 'off',
        'react-hooks/exhaustive-deps': 'off',
        'prettier/prettier': [
            'warn',
            {
                endOfLine: 'auto',
            },
        ],
    },
    'prettier/prettier': [
        'warn',
        {
            endOfLine: 'auto',
        },
    ],
};
