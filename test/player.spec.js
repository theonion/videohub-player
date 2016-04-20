var videojs = require('video.js');
var sinon = require('sinon');
var expect = require('chai').expect;
var TestHelper = require('./support/test_helper');
var VideoPlayer = require('../src/player');

describe('VideoPlayer', function() {
  var videoPlayer, videoDiv;

  beforeEach(function() {
    TestHelper.stub(VideoPlayer.prototype, 'setupPulsePlugin');
    videoDiv = document.createElement('div');
    videoDiv.id = 'test-video';
    videoDiv.style.display = 'none';
    var videoEl = document.createElement('video');
    var videoSrc = document.createElement('source');
    videoSrc.src = 'http://v.theonion.com/onionstudios/video/3768/640.mp4';
    videoSrc.type ='video/mp4';
    videoEl.appendChild(videoSrc);
    videoDiv.appendChild(videoEl);
    document.body.appendChild(videoDiv);
    window.AnalyticsManager = {
      sendEvent: function() {}
    };
    window.ga = function() {};
  });

  afterEach(function() {
    if (videoPlayer && videoPlayer.messageHandler) {
      window.removeEventListener('message', videoPlayer.messageHandler);
    }
    videojs('test-video').dispose();
  });

  describe('new VideoPlayer', function() {
    beforeEach(function() {
      TestHelper.stub(VideoPlayer.prototype, 'setupPlugins');
      TestHelper.stub(VideoPlayer.prototype, 'setCustomOptions');
      videoPlayer = new VideoPlayer(videoDiv, {
        videoId: 3237,
        pluginConfig: {
          vpbc: {
            optional: {
              flashEnabled: true
            }
          }
        }
      });
    });

    it('allows deep override of defaults', function() {
      expect(videoPlayer.settings.pluginConfig.vpbc.optional.flashEnabled).to.be.true;
      expect(videoPlayer.settings.pluginConfig.vpbc.optional.playlistAutoPlay).to.be.true;
    });

    it('sets a reference to the player element', function() {
      expect(videoPlayer.element).to.eql(videoDiv);
    });

    it('sets up VideoJS player', function() {
      expect(videoPlayer.player.el().id).to.equal('test-video');
    });

    it('sets up the player plugins', function() {
      expect(VideoPlayer.prototype.setupPlugins.called).to.be.true;
    });

    it('sets custom options', function() {
      expect(VideoPlayer.prototype.setCustomOptions.called).to.be.true;
    });
  });

  describe('#setCustomOptions', function() {
    beforeEach(function() {
      window.channelName = 'The A.V. Club';
      videoPlayer = new VideoPlayer(videoDiv, {});
    });

    it('sets embed as an option if the player is an embedded version', function() {
      TestHelper.stub(videoPlayer, 'isEmbedPlayer', true);
      videoPlayer.setCustomOptions();
      expect(videoPlayer.settings.embed).to.be.true;
    });

    it('sets autoplay as an option if autoplay is enabled', function() {
      TestHelper.stub(videoPlayer, 'isAutoplayEnabled', true);
      videoPlayer.setCustomOptions();
      expect(videoPlayer.settings.autoplay).to.be.true;
    });

    it('sends an event whether or not autoplay enabled', function() {
      TestHelper.stub(window.AnalyticsManager, 'sendEvent');
      videoPlayer.settings.autoplay = true;
      videoPlayer.setCustomOptions();
      expect(window.AnalyticsManager.sendEvent.calledWith({
        eventCategory: 'Video:' + window.channelName,
        eventAction: 'autoplay',
        eventLabel: true
      })).to.be.true;
    });

    it('sends an event whether or not stored autoplay is enabled', function() {
      TestHelper.stub(window.AnalyticsManager, 'sendEvent');
      videoPlayer.storedAutoplay = true;
      videoPlayer.setCustomOptions();
      expect(window.AnalyticsManager.sendEvent.calledWith({
        eventCategory: 'Video:' + window.channelName,
        eventAction: 'storedAutoplay',
        eventLabel: true
      })).to.be.true;
    });

    it('sets the dimension in GA whether or not autoplay enabled for all tracking post player initialization', function() {
      TestHelper.stub(window, 'ga');
      videoPlayer.settings.autoplay = false;
      videoPlayer.setCustomOptions();
      expect(ga.calledWith('set', 'dimension8', false)).to.be.true;
    });
  });

  describe('#isAutoplayEnabled', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {
        adsEnabled: false
      });
      TestHelper.stub(videoPlayer, 'isEmbedPlayer', false);
    });

    context('embedded player', function() {
      beforeEach(function() {
        videoPlayer.isEmbedPlayer.returns(true);
      });

      it('should never allow autoplay because parent is responsible', function() {
        expect(videoPlayer.isAutoplayEnabled()).to.be.false;
      });
    });

    context('options allow autoplay, storage settings allow it', function() {
      beforeEach(function() {
        TestHelper.stub(videojs, 'autoplaySettingFromStorage', true);
        videoPlayer.settings.autoplay = true;
      });

      it('should allow autoplay', function() {
        expect(videoPlayer.isAutoplayEnabled()).to.be.true;
      });
    });

    context('options allow autoplay, storage setting does not', function() {
      beforeEach(function() {
        TestHelper.stub(videojs, 'autoplaySettingFromStorage', false);
        videoPlayer.settings.autoplay = true;
      });

      it('should not allow autoplay', function() {
        expect(videoPlayer.isAutoplayEnabled()).to.be.false;
      });
    });

    context('options disable autoplay, storage settings allow it', function() {
      beforeEach(function() {
        TestHelper.stub(videojs, 'autoplaySettingFromStorage', true);
        videoPlayer.settings.autoplay = false;
      });

      it('should not allow autoplay', function() {
        expect(videoPlayer.isAutoplayEnabled()).to.be.false;
      });
    });

    context('autoplay storage setting namespace', function() {
      beforeEach(function() {
        videoPlayer.isEmbedPlayer.returns(false);
        videoPlayer.settings.pluginConfig.autoplayToggle.namespace = 'onionstudios';
        TestHelper.stub(videojs, 'autoplaySettingFromStorage', false);
      });

      it('calls the autoplay storage setting with the correct namespace', function() {
        videoPlayer.settings.autoplay = false;
        videoPlayer.isAutoplayEnabled();
        expect(videojs.autoplaySettingFromStorage.calledWith({ namespace: 'onionstudios' })).to.be.true;
      });
    });
  });

  describe('#setupPlugins', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {});
      TestHelper.stub(videoPlayer, 'setupShareToolsPlugin');
      TestHelper.stub(videoPlayer, 'setupAutoplayTogglePlugin');
      TestHelper.stub(videoPlayer, 'setupEndCardPlugin');
      TestHelper.stub(videoPlayer, 'setupVideoMetrixPlugin');
      videoPlayer.setupPlugins();
    });

    it('sets up the pulse plugin', function() {
      expect(videoPlayer.setupPulsePlugin.called).to.be.true;
    });

    it('sets up the sharetools plugin', function() {
      expect(videoPlayer.setupShareToolsPlugin.called).to.be.true;
    });

    it('sets up the autoplay toggle plugin', function() {
      expect(videoPlayer.setupAutoplayTogglePlugin.called).to.be.true;
    });

    it('sets up the endcard plugin', function() {
      expect(videoPlayer.setupEndCardPlugin.called).to.be.true;
    });

    it('sets up the videometrix plugin', function() {
      expect(videoPlayer.setupVideoMetrixPlugin.called).to.be.true;
    });
  });

  describe('#setupPulsePlugin', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {
        videoId: 3237,
        pluginConfig: {
          vpbc: {
            optional: {
              flashEnabled: true
            }
          }
        }
      });
      videoPlayer.setupPulsePlugin.restore();
    });

    it('sets up the video plaza plugin', function() {
      TestHelper.stub(videoPlayer.player, 'vpbc');
      videoPlayer.setupPulsePlugin();
      expect(videoPlayer.player.vpbc.calledWith(videoPlayer.settings.pluginConfig.vpbc)).to.be.true;
    });
  });

  describe('#setupAutoplayTogglePlugin', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {});
    });

    it('sets up the autoplay toggle plugin', function() {
      TestHelper.stub(videoPlayer.player, 'autoplayToggle');
      videoPlayer.setupAutoplayTogglePlugin();
      expect(videoPlayer.player.autoplayToggle.calledWith({ namespace: videoPlayer.settings.pluginConfig.autoplayToggle.namespace })).to.be.true;
    });
  });

  describe('#setupEndCardPlugin', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {});
    });

    it('sets up the end card plugin', function() {
      TestHelper.stub(videoPlayer.player, 'endcard');
      videoPlayer.setupEndCardPlugin();
      expect(videoPlayer.player.endcard.calledWith(videoPlayer.settings.pluginConfig.endcard)).to.be.true;
    });
  });

  describe('#setupVideoMetrixPlugin', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {});
    });

    it('sets up the video metrix plugin', function() {
      TestHelper.stub(videoPlayer.player, 'videometrix');
      videoPlayer.setupVideoMetrixPlugin();
      expect(videoPlayer.player.videometrix.calledWith(videoPlayer.settings.pluginConfig.videometrix)).to.be.true;
    });
  });

  describe('#setupCustomAnalyticsPlugin', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {
        pluginConfig: {
          videoanalytics: {
            id: 6036328
          }
        }
      });
    });

    it('sets up the custom analytics plugin', function() {
      TestHelper.stub(videoPlayer.player, 'videoanalytics');
      videoPlayer.setupCustomAnalyticsPlugin();
      expect(videoPlayer.player.videoanalytics.calledWith(videoPlayer.settings.pluginConfig.videoanalytics)).to.be.true;
    });
  });

  describe('#setupShareToolsPlugin', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {
        videoId: 3237
      });
      TestHelper.stub(videoPlayer.player, 'sharetools');
    });

    context('player is discoverable', function() {
      beforeEach(function() {
        videoPlayer.settings.isDiscoverable = true;
        videoPlayer.setupShareToolsPlugin();
      });

      it('sets up the plugin', function() {
        var expectedArgument = videoPlayer.settings.pluginConfig.sharetools;
        expectedArgument.videoId = 3237;

        expect(videoPlayer.player.sharetools.calledWith(expectedArgument)).to.be.true;
      });
    });

    context('player is not discoverable', function() {
      beforeEach(function() {
        videoPlayer.settings.isDiscoverable = false;
        videoPlayer.setupShareToolsPlugin();
      });

      it('does not set up the plugin', function() {
        expect(videoPlayer.player.sharetools.called).to.be.false;
      });
    });
  });

  describe('#setupGoogleAnalyticsPlugin', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {
        videoId: 3237
      });
      TestHelper.stub(videoPlayer.player, 'ga');
      window.channelName = 'Karma Test';
      window.videoUrl = 'http://karma.test/video-12345';
      videoPlayer.setupGoogleAnalyticsPlugin();
    });

    it('sets up the google analytics plugin', function() {
      expect(videoPlayer.player.ga.calledWith({
        eventActionPrefix: 'video_',
        percentsPlayedInterval: 25,
        eventCategory: 'Video:Karma Test',
        eventLabel: 'http://karma.test/video-12345'
      })).to.be.true;
    });
  });

  describe('#playerReady', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {
        videoId: 3237
      });
    });

    it('mutes the player if mute is enabled', function() {
      videoPlayer.settings.mute = true;
      videoPlayer.playerReady();
      expect(videoPlayer.player.muted()).to.be.true;
    });

    it('hides the controlBar if mobile device', function() {
      var temp = window.isMobile.any;
      window.isMobile.any = true;
      videoPlayer.playerReady();
      expect($(videoPlayer.player.controlBar.el()).is(':visible')).to.be.false;
      window.isMobile.any = temp;
    });

    it('sets up the GA plugin', function() {
      TestHelper.stub(videoPlayer, 'setupGoogleAnalyticsPlugin');
      videoPlayer.playerReady();
      expect(videoPlayer.setupGoogleAnalyticsPlugin.called).to.be.true;
    });

    it('sets up the custom analytics plugin', function() {
      TestHelper.stub(videoPlayer, 'setupCustomAnalyticsPlugin');
      videoPlayer.playerReady();
      expect(videoPlayer.setupCustomAnalyticsPlugin.called).to.be.true;
    });

    it('sets up the parent player events if it is an embedded player', function() {
      TestHelper.stub(videoPlayer, 'sendParentPlayerEvents');
      videoPlayer.settings.embed = true;
      videoPlayer.playerReady();
      expect(videoPlayer.sendParentPlayerEvents.called).to.be.true;
    });

    it('initiailzes player event listeners', function() {
      TestHelper.stub(videoPlayer, 'initPlayerEventListeners');
      videoPlayer.playerReady();
      expect(videoPlayer.initPlayerEventListeners.called).to.be.true;
    });

    it('initializes message event listeners', function() {
      TestHelper.stub(videoPlayer, 'initMessageEventListeners');
      videoPlayer.settings.embed = true;
      videoPlayer.playerReady();
      expect(videoPlayer.initMessageEventListeners.called).to.be.true;
    });
  });

  describe('#sendParentPlayerEvents', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {
        videoId: 3237
      });
      window.parent = {
        postMessage: sinon.stub()
      };
      videoPlayer.sendParentPlayerEvents();
    });

    it('posts message to the parent on play', function() {
      videoPlayer.player.trigger('play');
      expect(window.parent.postMessage.calledWith({ name: 'video-play'}, '*')).to.be.true;
    });

    it('posts message to the parent on pause', function() {
      videoPlayer.player.trigger('pause');
      expect(window.parent.postMessage.calledWith({ name: 'video-pause'}, '*')).to.be.true;
    });

    it('posts message to the parent on replay', function() {
      videoPlayer.player.trigger('replay');
      expect(window.parent.postMessage.calledWith({ name: 'video-replay'}, '*')).to.be.true;
    });
  });

  describe('#initPlayerEventListeners', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {
        videoId: 3237
      });
      videoPlayer.initPlayerEventListeners();
    });

    it('sets playedOnce to true whenever the `play` event fires', function() {
      videoPlayer.player.trigger('play');
      expect(videoPlayer.playedOnce).to.be.true;
    });

    it('prevents a weak play (e.g. the computers) if the user has already paused the player once...so we are not a nuisance', function() {
      videoPlayer.player.trigger('pause');
      expect(videoPlayer.preventWeakPlay).to.be.true;
    });

    it('prevents weak mute so the player keeps volume once the user has enabled it even if the computers wanted to change it', function() {
      videoPlayer.player.trigger('volumechange');
      expect(videoPlayer.preventWeakMute).to.be.true;
    });

    it('ignores autoplay if that ad has started playing', function() {
      videoPlayer.player.trigger('adstart');
      expect(videoPlayer.ignoreAutoplay).to.be.true;
    });
  });

  describe('isPulseAdPlaying', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {
        videoId: 3237
      });
    });

    it('returns false if no vpApi on the player object', function() {
      videoPlayer.player.vpApi = undefined;
      expect(videoPlayer.isPulseAdPlaying()).to.be.undefined;
    });

    it('returns false if vpApi but ad state is not `ad-playback`', function() {
      videoPlayer.player.vpApi = {};
      videoPlayer.player.ads = { state: 'content-playback' };
      expect(videoPlayer.isPulseAdPlaying()).to.be.false;
    });

    it('returns true if vpApi & ad state is ad-playback', function() {
      videoPlayer.player.vpApi = {};
      videoPlayer.player.ads = { state: 'ad-playback' };
      expect(videoPlayer.isPulseAdPlaying()).to.be.true;
    });
  });

  describe('#handleMessagePlay', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {
        videoId: 3237
      });
      videoPlayer.player.vpApi = {
        resumeAd: sinon.stub()
      };
    });

    context('pulse ad playing', function() {
      beforeEach(function() {
        TestHelper.stub(videoPlayer, 'isPulseAdPlaying', true);
        videoPlayer.handleMessagePlay();
      });

      it('resumes the ad', function() {
        expect(videoPlayer.player.vpApi.resumeAd.called).to.be.true;
      });
    });

    context('pulse ad not playing', function() {
      beforeEach(function() {
        TestHelper.stub(videoPlayer, 'isPulseAdPlaying', false);
        TestHelper.stub(videoPlayer.player, 'play');
        videoPlayer.handleMessagePlay();
      });

      it('resumes the content', function() {
        expect(videoPlayer.player.play.called).to.be.true;
      });
    });
  });

  describe('#handleMessagePause', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {
        videoId: 3237
      });
      videoPlayer.player.vpApi = {
        pauseAd: sinon.stub()
      };
    });

    context('pulse ad playing', function() {
      beforeEach(function() {
        TestHelper.stub(videoPlayer, 'isPulseAdPlaying', true);
        videoPlayer.handleMessagePause();
      });

      it('pauses the ad', function() {
        expect(videoPlayer.player.vpApi.pauseAd.called).to.be.true;
      });
    });

    context('pulse ad not playing', function() {
      beforeEach(function() {
        TestHelper.stub(videoPlayer, 'isPulseAdPlaying', false);
        TestHelper.stub(videoPlayer.player, 'pause');
        videoPlayer.handleMessagePause();
      });

      it('pauses the content', function() {
        expect(videoPlayer.player.pause.called).to.be.true;
      });
    });
  });

  describe('#handleMessageVolume', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {
        videoId: 3237
      });
      videoPlayer.player.volume(0.1);
    });

    it('sets the volume', function() {
      videoPlayer.handleMessageVolume(0);
      expect(videoPlayer.player.volume()).to.equal(0);
    });
  });

  describe('#handleMessageMuteWeak', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {
        videoId: 3237
      });
      videoPlayer.preventWeakMute = false;
      videoPlayer.player.volume(0.1);
    });

    it('mutes the player', function() {
      videoPlayer.handleMessageMuteWeak();
      expect(videoPlayer.player.muted()).to.be.true;
    });
  });

  describe('#handleMessagePauseAllowWeakPlay', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {
        videoId: 3237
      });
    });

    context('player is not paused', function() {
      beforeEach(function() {
        TestHelper.stub(videoPlayer.player, 'paused', false);
        TestHelper.stub(videoPlayer.player, 'pause');
        videoPlayer.handleMessagePauseAllowWeakPlay();
      });

      it('pauses the player', function() {
        expect(videoPlayer.player.pause.called).to.be.true;
      });
    });

    context('player is not paused, but Flash preroll ad overlay is playing', function() {
      beforeEach(function() {
        TestHelper.stub(videoPlayer.player, 'paused', true);
        TestHelper.stub(videoPlayer, 'isPulseAdPlaying', true);
        videoPlayer.player.vpApi = {
          pauseAd: sinon.stub()
        };
        videoPlayer.handleMessagePauseAllowWeakPlay();
      });

      it('pauses the flash overlay', function() {
        expect(videoPlayer.player.vpApi.pauseAd.called).to.be.true;
      });
    });
  });

  describe('#handleMessagePlayWeak', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {
        videoId: 3237
      });
      TestHelper.stub(videoPlayer.player, 'paused', true);
      TestHelper.stub(videoPlayer, 'resumePlay');
    });

    it('does not resume play if played once & weak play enabled', function() {
      videoPlayer.preventWeakPlay = true;
      videoPlayer.playedOnce = true;
      videoPlayer.handleMessagePlayWeak();
      expect(videoPlayer.resumePlay.called).to.be.false;
    });

    it('does not resume play if not ignoreAutoPlay and autoplay not enabled', function() {
      videoPlayer.preventWeakPlay = false;
      videoPlayer.playedOnce = false;
      videoPlayer.ignoreAutoplay = false;
      TestHelper.stub(videoPlayer, 'isAutoplayEnabled', false);
      videoPlayer.handleMessagePlayWeak();
      expect(videoPlayer.resumePlay.called).to.be.false;
    });

    it('does not resume play if the player is already playing', function() {
      videoPlayer.preventWeakPlay = false;
      videoPlayer.playedOnce = false;
      videoPlayer.ignoreAutoplay = true;
      TestHelper.stub(videoPlayer, 'isAutoplayEnabled', true);
      videoPlayer.player.paused.returns(false);
      videoPlayer.handleMessagePlayWeak();
      expect(videoPlayer.resumePlay.called).to.be.false;
    });

    it('resumes play if not played once, autoplay enabled, and paused', function() {
      videoPlayer.playedOnce = false;
      videoPlayer.preventWeakPlay = true;
      TestHelper.stub(videoPlayer, 'isAutoplayEnabled', true);
      videoPlayer.handleMessagePlayWeak();
      expect(videoPlayer.resumePlay.called).to.be.true;
    });

    it('resumes play if played once but preventWeakPlay is false, autoplay enabled, and paused', function() {
      videoPlayer.playedOnce = true;
      videoPlayer.preventWeakPlay = false;
      TestHelper.stub(videoPlayer, 'isAutoplayEnabled', true);
      videoPlayer.handleMessagePlayWeak();
      expect(videoPlayer.resumePlay.called).to.be.true;
    });

    it('resumes play if playedOnce OR preventWeakPlay, ignoreAutoplay true, autoplay not enabled, and paused', function() {
      videoPlayer.playedOnce = true;
      videoPlayer.ignoreAutoplay = true;
      TestHelper.stub(videoPlayer, 'isAutoplayEnabled', false);
      videoPlayer.handleMessagePlayWeak();
      expect(videoPlayer.resumePlay.called).to.be.true;
    });

    it('resumes play if playedOnce OR preventWeakPlay, and autoplay enabled, and paused', function() {
      videoPlayer.playedOnce = true;
      videoPlayer.ignoreAutoplay = false;
      TestHelper.stub(videoPlayer, 'isAutoplayEnabled', true);
      videoPlayer.handleMessagePlayWeak();
      expect(videoPlayer.resumePlay.called).to.be.true;
    });
  });

  describe('#initMessageEventListeners', function() {
    beforeEach(function() {
      videoPlayer = new VideoPlayer(videoDiv, {
        videoId: 3237
      });
      TestHelper.stub(videoPlayer, 'handleMessagePlay');
      TestHelper.stub(videoPlayer, 'handleMessagePause');
      TestHelper.stub(videoPlayer, 'handleMessageVolume');
      TestHelper.stub(videoPlayer, 'handleMessageMuteWeak');
      TestHelper.stub(videoPlayer, 'handleMessagePauseAllowWeakPlay');
      TestHelper.stub(videoPlayer, 'handleMessagePlayWeak');
      videoPlayer.initMessageEventListeners();
    });

    it('handles the `play` message', function(done) {
      window.postMessage({name: 'play'}, '*');
      setTimeout(function() {
        expect(videoPlayer.handleMessagePlay.called).to.be.true;
        done();
      }, 50);
    });

    it('handles the `pause` message', function(done) {
      window.postMessage({name: 'pause'}, '*');
      setTimeout(function() {
        expect(videoPlayer.handleMessagePause.called).to.be.true;
        done();
      }, 50);
    });

    it('handles the `setVolume` message', function(done) {
      window.postMessage({name: 'setVolume'}, '*');
      setTimeout(function() {
        expect(videoPlayer.handleMessageVolume.called).to.be.true;
        done();
      }, 50);
    });

    it('handles the `muteWeak` message', function(done) {
      window.postMessage({name: 'muteWeak'}, '*');
      setTimeout(function() {
        expect(videoPlayer.handleMessageMuteWeak.called).to.be.true;
        done();
      }, 50);
    });

    it('handles the `pauseAllowWeakPlay` message', function(done) {
      window.postMessage({name: 'pauseAllowWeakPlay'}, '*');
      setTimeout(function() {
        expect(videoPlayer.handleMessagePauseAllowWeakPlay.called).to.be.true;
        done();
      }, 50);
    });

    it('handles the `playWeak` message', function(done) {
      window.postMessage({name: 'playWeak'}, '*');
      setTimeout(function() {
        expect(videoPlayer.handleMessagePlayWeak.called).to.be.true;
        done();
      }, 50);
    });
  });
});
