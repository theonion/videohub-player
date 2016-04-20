var webpack = require('webpack');
var BowerWebpackPlugin = require('bower-webpack-plugin');

module.exports = {
  entry: {
    'videohub-player': './src/export-module.js',
    'videohub-player-global': './src/export-global.js',
  },
  output: {
    path: './dist',
    filename: '[name].js',
  },
  plugins: [
    new webpack.ProvidePlugin({
      isMobile: 'isMobile',
      'window.isMobile': 'isMobile',
    }), 
  ],  
  resolve: {
    modulesDirectories: [
      'node_modules',
      'bower_components',
    ],
    alias: {
      'video.js': 'video.js/dist/video-js/video.dev',
    },
  },
};
