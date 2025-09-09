module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'react-native-web',
        {
          resolve: {
            '@expo/vector-icons': '@expo/vector-icons/build/vendor/react-native-svg',
          },
        },
      ],
    ],
  };
};
