module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // <--- ESSA É A LINHA MÁGICA QUE CONSERTA O ERRO
    ],
  };
};