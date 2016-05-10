var videojs = require('video.js');

var EndCard = function(player, options) {
  this.player = player;
  this.videoEnded = this.videoEnded.bind(this);
  var defaults = {
    countdown: 5,
    next: null,
    allowCountdown: true,
    replayAllow: true
  };
  this.player.on('ended', this.videoEnded);
  this.settings = $.extend(defaults, options);
  this.$overlay = null;
};

EndCard.prototype.videoEnded = function() {
  var player = this.player;
  if (player.ads && player.ads.state === 'ad-playback') {
    // Don't show an endcard after ad play.
    return;
  }
  if (this.settings.countdown !== null) {
    this.timeLeft = parseInt(this.settings.countdown, 10);
  }

  if (this.$overlay === null) {
    this.setupEndcard();
  }
};

EndCard.prototype.setupEndcard = function() {
  $.get(this.settings.URL, this.endcardFetched.bind(this));
};

EndCard.prototype.teardownEndcard = function () {
  if (this.$overlay) {
    $(this.player.el()).find('.endcard').remove();
    this.$overlay = null;
  }
  if (this.timeout) {
    this.clearCountdown();
  }
  this.player.posterImage.hide();
  this.player.controlBar.show();
};

EndCard.prototype.replayVideo = function() {
  if (this.settings.replayAllow) {
    this.player.trigger('replay');
    this.teardownEndcard();
    clearInterval(this.timeout);
    this.player.play();
  }
};

EndCard.prototype.setupReplay = function() {
  var replayButton = this.$overlay.find('.ec-replay')[0];
  $(replayButton).on('click', this.replayVideo.bind(this));
};

EndCard.prototype.startCountdown = function() {
  if (this.settings.countdown !== null) {
    this.timeout = setInterval(this.updateCountdown.bind(this), 1000);
  }
};

EndCard.prototype.toggleCountdown = function() {
  var $pause = $('.pause');

  $pause
    .toggleClass('paused')
    .data('trackLabel', '#');

  if (this.timeout) {
    $pause.data('trackAction', 'Autostart: Pause');
    this.clearCountdown();
  } else {
    $pause.data('trackAction', 'Autostart: Play');
    this.startCountdown();
  }
};

EndCard.prototype.clearCountdown = function() {
  clearInterval(this.timeout);
  this.timeout = null;
};

EndCard.prototype.setupCountdown = function() {
  this.$overlay.find('.count, .pause').addClass('visible');

  if (this.$overlay.find('.countdown').length > 0) {
    this.$overlay.find('.pause').on('click', this.toggleCountdown.bind(this));
    this.startCountdown();
  }
};

EndCard.prototype.updateCountdown = function () {
  if (this.timeLeft > 0) {
    this.timeLeft -= 1;
    $(this.player.el()).find('.count').html(this.timeLeft.toString());
  } else {
    this.clearCountdown();
    var nextUrl = this.$overlay.find('.next a')[0].href;
    this.redirectTo(nextUrl);
  }
};

EndCard.prototype.redirectTo = function(url) {
  window.location = url;
};

EndCard.prototype.displayShareTools = function() {
  if ($('#custom-endcard').length > 0 || this.isRailPlayer()) {
    this.$overlay.find('.next-video-container a').attr('target','_blank');
    $('.sharetool').remove();
  } else if ($.isFunction(this.player.shareTools.setup)) {
    this.player.shareTools.setup();
  }
};

EndCard.prototype.replaceEndCardUrl = function() {
  var endCardUrl = this.$overlay.find('a');
  var videoId = endCardUrl.data('video-id');

  if (videoId) {
    endCardUrl.attr('href', '/v/' + videoId);
  }
};

EndCard.prototype.endcardFetched = function(endCardMarkup) {
  var playerElement = this.player.el();

  if (this.$overlay) {
    return;
  }

  if (this.player.posterImage) {
    this.player.posterImage.show();
  }

  this.$overlay = $(endCardMarkup);

  this.replaceEndCardUrl();

  this.setupReplay();

  // Don't do countdown if embed or if it is the rail player
  if (this.isRailPlayer() || this.isEmbedPlayer()) {
    this.settings.allowCountdown = false;
  }

  if (this.settings.allowCountdown) {
    this.setupCountdown();
  }

  this.displayShareTools();

  playerElement.appendChild(this.$overlay[0]);

  var $shareTool = $(playerElement).find('.sharetool');
  var $endcardShareContainer = $(playerElement).find('.ec-social');
  $shareTool.appendTo($endcardShareContainer).show();

  this.player.controlBar.hide();
  if (window.picturefill) {
    window.picturefill(document.querySelectorAll('.endcard [data-type="image"]'));
  }
  else {
    console.warn('videohub-player could not find `window.picturefill`');
  }
};

EndCard.prototype.pathInfo = function() {
  return window.location.pathname;
};

EndCard.prototype.isRailPlayer = function() {
  return this.pathInfo().match(/^\/channels\/.+\/rail/) ? true : false;
};

EndCard.prototype.isEmbedPlayer = function() {
  return this.pathInfo().match(/embed/i) ? true : false;
};

var initEndCard = function (options) {
  var player = this;
  var endCard = new EndCard(player, options);
};

videojs.plugin('endcard', initEndCard);

module.exports = EndCard;
