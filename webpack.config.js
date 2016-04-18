var webpack = require('webpack');
var BowerWebpackPlugin = require('bower-webpack-plugin');

module.exports = {
  entry: './src/player.js',
  output: {
    path: './dist',
    filename: 'videohub-player.js',
    libraryTarget: 'this',
    library: 'VideohubPlayer',
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
