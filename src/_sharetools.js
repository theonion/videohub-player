// TODO - This needs to be merged with the adjacent sharetools.js...
var _shareTools = function () {
  this.networks = {};
  this.storageKeyPrefix = 'shareTools-';
};

_shareTools.prototype.addNetwork = function (options) {
  this.networks[options.name] = options;
  return this;
};

_shareTools.prototype.getUrlFor = function (networkName, params) {
  var network = this.networks[networkName];
  return network.url(params);
};

_shareTools.prototype.shouldShowPostShareDialog = function (networkName) {
  if (localStorage.getItem(this.storageKeyPrefix + 'dont-bother') != null) {
    return false;
  }
  if (isMobile.any) {  // dont do it on small screens
    return false;
  }
  return this.networks[networkName].postShareDialog || false;
};

_shareTools.prototype.flagDontShowPostShareDialog = function () {
  localStorage.setItem(this.storageKeyPrefix + 'dont-bother', 'yup');
};

_shareTools.prototype.setupElements = function (selector) {

  var $shareToolElements = selector instanceof jQuery ? selector : $(selector);

  // where all the dom-related stuff gets wired up
  var self = this;
  $shareToolElements.each(function (i, element) {
    element = $(element);
    for (var networkName in self.networks) {
      if (!self.networks.hasOwnProperty(networkName)) {
        continue;
      }
      // We wait until the last moment to get the url so more dynamic
      // things like quizzes have an opportunity to override the DOM params.
      // e.g. "I answered X out of Y correctly"
      $('.share-' + networkName, element).click(function (name, shareWidget) {
        return function (event) {
          var euc = encodeURIComponent;
          var params = {
            title: euc(shareWidget.data('shareTitle')),
            description: euc(shareWidget.data('shareDescription')),
            image: euc(shareWidget.data('shareImageUrl')),
            url: euc(shareWidget.data('shareUrl')),
            redirectUrl: euc(shareWidget.data('shareRedirectUrl'))
          };
          var url = self.getUrlFor(name, params);
          var link = $(this);

          // position it in the middle of the browser window
          var left = 0,
            top = 0;
          if (typeof window.screenLeft !== 'undefined') {
            left = window.screenLeft;
            top = window.screenTop;
          } else if (typeof window.screenX !== 'undefined') {
            left = window.screenX;
            tp = window.screenY;
          }
          // popup dimensions
          var width = 600,
            height = 260;
          left += ($(window).width() - width) / 2;
          top += ($(window).height() - height) / 2;
          var shareWindow = window.open(
            url, '',
            'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height='
            + height + ',width=' + width + ',top=' + top + ',left=' + left
          );
          event.preventDefault();
        }
      }(networkName, element));
    }
  });
};

module.exports = _shareTools;
