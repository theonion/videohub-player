'use strict'; // eslint-disable-line

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const styleExtractor = new ExtractTextPlugin('[name].css');

const includeDirs = [
  path.join(__dirname, 'src'),
];

module.exports = {
  entry: {
    'videohub-player': './src/export-module.js',
    'videohub-player-global': './src/export-global.js',
  },
  output: {
    path: './dist',
    filename: '[name].js',
  },
  module: {
    loaders: [{
      match: /\.scss$/,
      test: /\.scss$/,
      loader: styleExtractor.extract(
        'style-loader',
        'css-loader!postcss-loader!sass-loader'
      ),
      include: includeDirs,
    }],
  },
  plugins: [
    new webpack.ProvidePlugin({
      isMobile: 'isMobile',
      'window.isMobile': 'isMobile',
    }),
    styleExtractor,
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
