var videojs = require('video.js');
var _sharetools = require('./_sharetools');

var ShareTools = function(player, options) {
  this.player = player;
  var defaults = {};
  this.settings = $.extend(defaults, options);
  this.shareTools = new _sharetools();
};

ShareTools.prototype.prepareOverlay = function() {
  var $overlay = $('<div>');
  $overlay.addClass('sharetool share-widget');

  $overlay.attr({
    'data-share-url': this.settings.shareUrl || window.shareUrl,
    'data-share-description': this.settings.shareDescription  || window.share_description,
    'data-share-title': this.settings.shareTitle || window.share_title,
    'data-share-redirect-url': 'http://www.onionstudios.com/fb-close'
  });

  return $overlay;
};

ShareTools.prototype.setupTwitter = function($shareToolDiv) {
  if (!this.settings.twitter) {
    return;
  }

  this.shareTools.addNetwork({
    name: 'twitter',
    url: function (params, element) {
      var text = params.title;
      text = text.substr(0, 139);
      var queryParams = {
        text: text,
        url: params.url,
        via: window.twitter_handle
      };
      var serializedParams = decodeURIComponent($.param(queryParams));
      return 'https://www.twitter.com/share?' + serializedParams;
    }
  });

  var $twitter = $('<a>');
  $twitter.attr('title', 'Share via Twitter');
  $twitter.data('trackAction', 'Share');
  $twitter.data('trackLabel', 'Twitter');
  $twitter.addClass('share-twitter button twitter');
  $shareToolDiv.append($twitter);
};

ShareTools.prototype.setupFacebook = function($shareToolDiv) {
  if (!this.settings.facebook) {
    return;
  }

  this.shareTools.addNetwork({
    name: 'facebook',
    url: function (params, element) {
      var queryParams = {
        app_id: '632832353489701',
        display: 'popup',
        link: params.url,
        name: params.title,
        description: params.description,
        image: params.image,
        redirect_uri: params.redirectUrl
      };
      var serializedParams = decodeURIComponent($.param(queryParams));
      return 'https://www.facebook.com/dialog/feed?' + serializedParams;
    }
  });

  var $facebook = $('<a>');
  $facebook.attr('title', 'Share via Facebook');
  $facebook.data('trackAction', 'Share');
  $facebook.data('trackLabel', 'Facebook');
  $facebook.addClass('share-facebook button fb');
  $shareToolDiv.append($facebook);
};

ShareTools.prototype.setupEmbedCode = function($shareToolDiv) {
  if (!this.settings.embed) {
    return;
  }

  var $embed = $('<a>');
  $embed.addClass('button embed');
  $embed.data('trackAction', 'Share');
  $embed.data('trackLabel', 'Embed');
  $shareToolDiv.append($embed);
};

ShareTools.prototype.setup = function() {
  this.open = true;

  var $overlay = this.prepareOverlay();
  var $shareToolDiv = $('<div class="share-buttons"></div>');

  this.setupTwitter($shareToolDiv);
  this.setupFacebook($shareToolDiv);
  this.setupEmbedCode($shareToolDiv);

  $overlay.append($shareToolDiv);
  this.shareTools.setupElements($overlay);

  $(this.player.el()).append($overlay);

  $('.embed').on('click', function() {
    $('.embed-div').toggleClass('embed-active');
  });
};

var initShareTools = function(options) {
  var player = this;
  player.shareTools = new ShareTools(player, options);
};

videojs.plugin('sharetools', initShareTools);

module.exports = ShareTools;
