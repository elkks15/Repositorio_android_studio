const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  three: path.resolve(__dirname, 'node_modules/three/build/three.cjs'),
  'cannon-es': path.resolve(__dirname, 'node_modules/cannon-es/dist/cannon-es.cjs.js'),
};

module.exports = config;
