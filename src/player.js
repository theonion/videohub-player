//require('jquery/dist/jquery');
require('succinct/jQuery.succinct');
require('isMobile/isMobile');
require('videojs-vp-plugin/index');
require('videojs-autoplay-toggle/videojs.autoplay-toggle');
require('videojs-ga/dist/videojs.ga.js');

var videojs = require('video.js');

require('./utils/swfobject');
require('./loaded_metadata');
require('./sharetools');
require('./videojs-endcard');
require('./videojs-analytics');
require('./videojs-videometrix');
require('./videojs-sharetools');

var VideoPlayer = function(element, options) {
  var defaults = {
    pluginConfig: {
      vpbc: {
        vpHost: 'http://us-theonion.videoplaza.tv',
        optional: {
          playlistAutoPlay: true,
          flashTimeout: 3,
          skip: {
            timeout: 3,
            text: 'Skip Ad'
          },
          muteButton: {
            html: false,
            flash: true
          }
        },
        vpContentForm: 'shortForm'
      },
      autoplayToggle: {
        namespace: 'onionstudios'
      },
      sharetools: {
        showOnPause: true,
        embed: function(settings) {
          return '<iframe name="embedded" allowfullscreen webkitallowfullscreen mozallowfullscreen frameborder="no" width="480" height="270" scrolling="no" src="http://' + document.location.host + '/embed?id=' + settings.videoId + '"></iframe>';
        },
        facebook: function(settings) {
          return "https://www.facebook.com/sharer/sharer.php?u=" + settings.shareUrl;
        },
        twitter: function(settings) {
          return "https://twitter.com/share?url=" + settings.shareUrl + "&via=" + settings.shareTwitterHandle;
        }
      }
    },
    nativeControlsForTouch: window.isMobile.any,
    autoplay: true,
    mute: false,
    adsEnabled: true
  };

  this.element = element;
  this.settings = $.extend(true, defaults, options);
  this.setCustomOptions();
  this.playedOnce = false;
  this.preventWeakPlay = false;
  this.preventWeakMute = false;
  this.ignoreAutoplay = false;
  this.bindEventHandlerContext();
  this.player = videojs(element, this.settings);
  this.setupPlugins();
  this.player.ready(this.playerReady.bind(this));
};

VideoPlayer.prototype.bindEventHandlerContext = function() {
  this.handleMessagePlay = this.handleMessagePlay.bind(this);
  this.handleMessagePause = this.handleMessagePause.bind(this);
  this.handleMessageVolume = this.handleMessageVolume.bind(this);
  this.handleMessageMuteWeak = this.handleMessageMuteWeak.bind(this);
  this.handleMessagePauseAllowWeakPlay = this.handleMessagePauseAllowWeakPlay.bind(this);
  this.handleMessagePlayWeak = this.handleMessagePlayWeak.bind(this);
};

VideoPlayer.prototype.isEmbedPlayer = function() {
  return window.location.pathname.match(/embed/i);
};

VideoPlayer.prototype.isAutoplayEnabled = function() {
  var autoplayEnabled = this.settings.autoplay;
  this.storedAutoplay = videojs.autoplaySettingFromStorage({
    namespace: this.settings.pluginConfig.autoplayToggle.namespace
  });

  if (this.isEmbedPlayer()) {
    // Prevent autoplay, parent is responsible for sending a weakPlay event to start playing
    autoplayEnabled = false;
  } else if (videojs.hasOwnProperty('autoplaySettingFromStorage')) {
    autoplayEnabled = this.storedAutoplay && this.settings.autoplay;
  }

  return autoplayEnabled;
};

VideoPlayer.prototype.setCustomOptions = function() {
  this.settings.embed = this.isEmbedPlayer();
  this.settings.autoplay = this.isAutoplayEnabled();
  if (!window.AnalyticsManager) {
    console.error('AnalyticsManager unavailable');
  } else {
    window.AnalyticsManager.sendEvent({
      eventCategory: 'Video:' + window.channelName,
      eventAction: 'autoplay',
      eventLabel: this.settings.autoplay
    });
    window.AnalyticsManager.sendEvent({
      eventCategory: 'Video:' + window.channelName,
      eventAction: 'storedAutoplay',
      eventLabel: this.storedAutoplay
    });
  }
  ga('set', 'dimension8', this.settings.autoplay);
};

VideoPlayer.prototype.setupPlugins = function() {
  this.setupPulsePlugin();
  this.setupShareToolsPlugin();
  this.setupAutoplayTogglePlugin();
  this.setupEndCardPlugin();
  this.setupVideoMetrixPlugin();
};

VideoPlayer.prototype.setupPulsePlugin = function() {
  if (!this.settings.adsEnabled) {
    return;
  }
  this.player.vpbc(this.settings.pluginConfig.vpbc);
};

VideoPlayer.prototype.setupAutoplayTogglePlugin = function() {
  this.player.autoplayToggle({ namespace: this.settings.pluginConfig.autoplayToggle.namespace });
};

VideoPlayer.prototype.setupShareToolsPlugin = function() {
  if (this.settings.isDiscoverable) {
    var options = $.extend({ videoId: this.settings.videoId }, this.settings.pluginConfig.sharetools);
    this.player.sharetools(options);
  }
};

VideoPlayer.prototype.setupEndCardPlugin = function() {
  this.player.endcard(this.settings.pluginConfig.endcard);
};

VideoPlayer.prototype.setupVideoMetrixPlugin = function() {
  this.player.videometrix(this.settings.pluginConfig.videometrix);
};

VideoPlayer.prototype.setupCustomAnalyticsPlugin = function() {
  this.player.videoanalytics(this.settings.pluginConfig.videoanalytics);
};

VideoPlayer.prototype.setupGoogleAnalyticsPlugin = function() {
  this.player.ga({
    eventActionPrefix: 'video_',
    percentsPlayedInterval: 25,
    eventCategory: 'Video:' + window.channelName,
    eventLabel: window.videoUrl
  });
};

VideoPlayer.prototype.playerReady = function() {
  var player = this.player;

  if (this.settings.mute) {
    player.volume(0);
  }

  if (isMobile.any) {
    player.controlBar.hide();
  }

  this.setupCustomAnalyticsPlugin();
  this.setupGoogleAnalyticsPlugin();

  // We are in a transition from <iframe> to <bulbs-video> embeds
  if (this.settings.embed) {
    this.sendParentPlayerEvents();
    this.initMessageEventListeners();
  }

  this.initPlayerEventListeners();
};

VideoPlayer.prototype.initPlayerEventListeners = function() {
  var that = this;

  this.player.on('play', function () {
    that.playedOnce = true;
  });

  // If a user pauses, keep video paused until they manually hit play, weak
  // plays will continue once user hits play again
  this.player.on('pause', function () {
    that.preventWeakPlay = true;
  });

  // Works in same fashion as weak play
  this.player.on('volumechange', function () {
    that.preventWeakMute = true;
  });

  // If we have autoplay off, but the ad hasn't finished, we want to continue
  //    playing automatically, since the user doesn't have controls, this works
  //    in conjunction with the playedOnce flag since we don't care about autoplay
  //    after both first play and ads have started
  this.player.on('adstart', function () {
    that.ignoreAutoplay = true;
  });

  // We are in a transition from <iframe> to <bulbs-video> embeds
  if (this.settings.embed) {
    this.player.on('dispose', function() {
      if (that.messageHandler) {
        window.removeEventListener('message', that.messageHandler);
      }
    });
  }
};

VideoPlayer.prototype.isPulseAdPlaying = function() {
  return this.player.vpApi && this.player.ads.state === 'ad-playback';
};

VideoPlayer.prototype.handleMessagePlay = function() {
  if (!this.player.el()) {
    return;
  }

  this.resumePlay();
};

VideoPlayer.prototype.handleMessagePause = function() {
  if (!this.player.el()) {
    return;
  }

  if (this.isPulseAdPlaying()) {
    this.player.vpApi.pauseAd();
  } else {
    this.player.pause();
  }
};

VideoPlayer.prototype.handleMessageVolume = function(params) {
  if (!this.player.el()) {
    return;
  }

  this.player.volume(params);
};

/**
* Mute only if user has never manually changed the volume.
*/
VideoPlayer.prototype.handleMessageMuteWeak = function() {
  if (!this.player.el() || this.player.muted() || this.preventWeakMute) {
    return;
  }

  var that = this;
  this.player.one('volumechange', function () {
    // TODO - ask Kos
    that.preventWeakMute = false;
  });

  this.player.muted(true);
};

/**
* Pause with an event that allows weak plays.
*/
VideoPlayer.prototype.handleMessagePauseAllowWeakPlay = function() {
  var player = this.player;

  if (!player.el()) {
    return;
  }

  if (!player.paused()) {
    player.one('pause', function () {
      preventWeakPlay = false;
    });
    player.pause();
  } else if (this.isPulseAdPlaying()) {
    player.vpApi.pauseAd();
  }
};

VideoPlayer.prototype.resumePlay = function() {
  if (this.isPulseAdPlaying()) {
    this.player.vpApi.resumeAd();
  } else {
    this.player.play();
  }
};

/**
* Play only if user has never manually paused and autoplay is on.
*/
VideoPlayer.prototype.handleMessagePlayWeak = function() {
  if (!this.player.el()) {
    return;
  }

  // TODO - Ask Kos, if not played once and preventWeakPlay on, still play?
  if ((!this.playedOnce || !this.preventWeakPlay) &&
      (this.ignoreAutoplay || this.isAutoplayEnabled()) &&
      this.player.paused()) {
    this.resumePlay();
  }
};


// These are relevant to <iframe> embeds, not <bulbs-video> embeds
  VideoPlayer.prototype.initMessageEventListeners = function() {
    var player = this.player;

    player.messageHandlers = {
      play: this.handleMessagePlay,
      pause: this.handleMessagePause,
      setVolume: this.handleMessageVolume,
      muteWeak: this.handleMessageMuteWeak,
      pauseAllowWeakPlay: this.handleMessagePauseAllowWeakPlay,
      playWeak: this.handleMessagePlayWeak
    };

    this.messageHandler = function(event) {
      if (event.data.name in player.messageHandlers) {
        player.messageHandlers[event.data.name](event.data.params);
      }
    };
    window.addEventListener('message', this.messageHandler);
  };

  VideoPlayer.prototype.sendParentPlayerEvents = function() {
    if (!window.parent) {
      return;
    }

    this.player.on('play', function () {
      window.parent.postMessage({name: 'video-play'}, '*');
    });

    this.player.on('pause', function () {
      window.parent.postMessage({name: 'video-pause'}, '*');
    });

    this.player.on('replay', function () {
      window.parent.postMessage({name: 'video-replay'}, '*');
    });
  };
// END of <iframe> relevant methods.

module.exports = VideoPlayer;
