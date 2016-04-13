var webpack = require('webpack');
var BowerWebpackPlugin = require('bower-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: './dist',
    filename: 'videohub-player.js',
  },
  plugins: [
    //new BowerWebpackPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
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
