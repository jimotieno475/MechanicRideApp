const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add resolver for react-native-maps on web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    // Redirect react-native-maps to react-native-web-maps on web
    if (moduleName.startsWith('react-native-maps')) {
      return {
        filePath: require.resolve('react-native-web-maps'),
        type: 'sourceFile',
      };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './app/global.css' });