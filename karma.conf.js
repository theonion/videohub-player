var karmaConfig = require('./karma.base');
var webpackConfig = require('./webpack.config');
Object.assign(webpackConfig.resolve.alias, {
  'test.endcard.stub': './support/endcard_stub'
});


module.exports = function(config) {
  config.logLevel = config.LOG_DISABLE;
  config.set(karmaConfig);
};

