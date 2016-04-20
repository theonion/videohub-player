var videojs = require('video.js');

var VideoAnalytics = function(player, options) {
  if (!window.AnalyticsManager) {
    console.error('AnalyticsManager unavailable');
    return;
  }

  this.player = player;
  this.handleTimeUpdate = this.handleTimeUpdate.bind(this);
  this.handlePlayerEnded = this.handlePlayerEnded.bind(this);
  this.sentEvents = {};
  player.on('timeupdate', this.handleTimeUpdate);
  player.on('ended', this.handlePlayerEnded);
};

VideoAnalytics.prototype.handlePlayerEnded = function() {
  this.sendThirtySeconds();
};

VideoAnalytics.prototype.sendAnalyticsEvent = function(key, action) {
  if (this.sentEvents[key]) {
    return;
  }

  var event = {
    eventCategory: 'Video:' + window.channelName,
    eventAction: action,
    eventLabel: window.videoUrl
  };
  AnalyticsManager.sendEvent(event);
  this.sentEvents[key] = event;
};

VideoAnalytics.prototype.sendThreeSeconds = function() {
  this.sendAnalyticsEvent('threeSeconds', '3 seconds');
};

VideoAnalytics.prototype.sendThirtySeconds = function() {
  this.sendAnalyticsEvent('thirtySeconds', '30 seconds');
};

VideoAnalytics.prototype.sendNinetyFivePercentComplete = function() {
  this.sendAnalyticsEvent('ninetyFivePercent', '95 percent');
};

VideoAnalytics.prototype.handleTimeUpdate = function() {
  if (this.player.ads && this.player.ads.state === 'ad-playback') {
    return;
  }

  var elapsedTime =  this.player.currentTime();
  var duration = this.player.duration();
  var ninetyFivePercentComplete = (duration * .95);

  if (duration === 0) {
    if (!this.warned) {
      console.warn('Video has an empty duration');
      this.warned = true;
    }

    return;
  }

  if (elapsedTime >= 3) {
    this.sendThreeSeconds();
  };

  if (elapsedTime >= 30) {
    this.sendThirtySeconds();
  };

  if (elapsedTime >= ninetyFivePercentComplete) {
    this.sendNinetyFivePercentComplete();
  };
};

var initVideoAnalytics = function (options) {
  var player = this;
  var videoAnalytics = new VideoAnalytics(player, options);
};

videojs.plugin('videoanalytics', initVideoAnalytics);

module.exports = VideoAnalytics;
