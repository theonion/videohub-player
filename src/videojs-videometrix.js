require('./streamsense.4.1411.18.min');

var VideoMetrix = function(player, options) {
  var defaults = {};
  this.player = player;
  this.settings = $.extend(defaults, options);

  if (!this.settings.id) {
    console.error('Invalid video metrics configuration.  Must contain ID');
    return;
  }

  this.streamingTag = new ns_.StreamingTag({ customerC2: this.settings.id });

  var that = this;

  player.on('adstart', function(){
    that.streamingTag.playVideoAdvertisement();
  });

  player.on('adend', function(){
    that.streamingTag.stop();
  });

  player.on('play', function(){
    if (!that.isAdPlaying()) {
      that.streamingTag.playVideoContentPart(that.settings.metadata);
    }
  });

  player.on('pause', function(){
    if(!that.isAdPlaying()) {
      that.streamingTag.stop();
    }
  });

  player.on('ended', function(){
    if(!that.isAdPlaying()) {
      that.streamingTag.stop();
    }
  });
};

VideoMetrix.prototype.isAdPlaying = function() {
  return (this.player.ads && (this.player.ads.state === 'ad-playback' || this.player.ads.state === 'ads-ready'));
};

var initVideoMetrix = function(options) {
  var player = this;
  var videoMetrix = new VideoMetrix(player, options);
};

videojs.plugin('videometrix', initVideoMetrix);

module.exports = VideoMetrix;
