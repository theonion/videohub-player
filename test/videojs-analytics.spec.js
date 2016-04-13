var sinon = require('sinon');
var expect = require('chai').expect;
var TestHelper = require('./support/test_helper');
var videojs = require('video.js');
var VideoAnalytics = require('../src/videojs-analytics');

describe('VideoAnalytics', function() {
  var videoAnalytics, player, videoDiv;

  beforeEach(function() {
    videoDiv = document.createElement('div');
    videoDiv.id = 'test-video';
    document.body.appendChild(videoDiv);
    player = videojs('test-video');
    TestHelper.stub(player, 'duration', 100);
    window.channelName = 'Karma Suite';
    window.videoUrl = '/video/some-video-1234';
    window.AnalyticsManager = {
      sendEvent: sinon.stub()
    };
  });

  afterEach(function() {
    videojs('test-video').dispose();
  });

  describe('no AnalyticsManager on window', function() {
    beforeEach(function() {
      window.AnalyticsManager = undefined;
      TestHelper.stub(console, 'error');
      videoAnalytics = new VideoAnalytics(player, {});
    });

    it('logs an error if AnalyticsManager not defined', function() {
      expect(console.error.called).to.be.true;
    });
  });

  describe('#handlePlayerEnded', function() {
    beforeEach(function() {
      videoAnalytics = new VideoAnalytics(player, {});
      TestHelper.stub(videoAnalytics, 'sendThirtySeconds');
    });

    describe('sends 30 seconds event', function() {
      it('should call sendThirtySeconds', function() {
        videoAnalytics.handlePlayerEnded();
        expect(videoAnalytics.sendThirtySeconds.called).to.be.true;
      });
    });
  });

  describe('#sendThreeSeconds', function() {
    beforeEach(function() {
      videoAnalytics = new VideoAnalytics(player, {});
    });

    describe('never sent yet', function() {
      beforeEach(function() {
        videoAnalytics.sendThreeSeconds();
      });

      it('sends an event to analytics manager if it not already', function() {
        expect(AnalyticsManager.sendEvent.calledWith({
          eventCategory: 'Video:' + window.channelName,
          eventAction: '3 seconds',
          eventLabel: window.videoUrl
        })).to.be.true;
      });

      it('adds event to memory store', function() {
        expect(videoAnalytics.sentEvents.threeSeconds).to.eql({
          eventCategory: 'Video:' + window.channelName,
          eventAction: '3 seconds',
          eventLabel: window.videoUrl
        });
      });
    });

    describe('already sent once', function() {
      it('does not send an event', function() {
        videoAnalytics.sentEvents.threeSeconds = {
          eventCategory: 'Video:' + window.channelName,
          eventAction: '3 seconds',
          eventLabel: window.videoUrl
        };
        videoAnalytics.sendThreeSeconds();
        expect(AnalyticsManager.sendEvent.called).to.be.false;
      });
    });
  });

  describe('#sendThirtySeconds', function() {
    beforeEach(function() {
      videoAnalytics = new VideoAnalytics(player, {});
    });

    describe('never sent yet', function() {
      beforeEach(function() {
        videoAnalytics.sendThirtySeconds();
      });

      it('sends an event to analytics manager if it not already', function() {
        expect(AnalyticsManager.sendEvent.calledWith({
          eventCategory: 'Video:' + window.channelName,
          eventAction: '30 seconds',
          eventLabel: window.videoUrl
        })).to.be.true;
      });

      it('adds event to memory store', function() {
        expect(videoAnalytics.sentEvents.thirtySeconds).to.eql({
          eventCategory: 'Video:' + window.channelName,
          eventAction: '30 seconds',
          eventLabel: window.videoUrl
        });
      });
    });

    describe('already sent once', function() {
      it('does not send an event', function() {
        videoAnalytics.sentEvents.thirtySeconds = {
          eventCategory: 'Video:' + window.channelName,
          eventAction: '30 seconds',
          eventLabel: window.videoUrl
        };
        videoAnalytics.sendThirtySeconds();
        expect(AnalyticsManager.sendEvent.called).to.be.false;
      });
    });
  });

  describe('#sendNinetyFivePercentComplete', function() {
    beforeEach(function() {
      videoAnalytics = new VideoAnalytics(player, {});
    });

    describe('never sent yet', function() {
      beforeEach(function() {
        videoAnalytics.sendNinetyFivePercentComplete();
      });

      it('sends an event to analytics manager if it not already', function() {
        expect(AnalyticsManager.sendEvent.calledWith({
          eventCategory: 'Video:' + window.channelName,
          eventAction: '95 percent',
          eventLabel: window.videoUrl
        })).to.be.true;
      });

      it('adds event to memory store', function() {
        expect(videoAnalytics.sentEvents.ninetyFivePercent).to.eql({
          eventCategory: 'Video:' + window.channelName,
          eventAction: '95 percent',
          eventLabel: window.videoUrl
        });
      });
    });

    describe('already sent once', function() {
      it('does not send an event', function() {
        videoAnalytics.sentEvents.ninetyFivePercent = {
          eventCategory: 'Video:' + window.channelName,
          eventAction: '95 percent',
          eventLabel: window.videoUrl
        };
        videoAnalytics.sendNinetyFivePercentComplete();
        expect(AnalyticsManager.sendEvent.called).to.be.false;
      });
    });
  });

  describe('#handleTimeUpdate', function() {

    describe('during ad playback state', function() {
      beforeEach(function() {
        TestHelper.stub(player, 'currentTime');
        player.ads = {
          state:'ad-playback'
        };
        videoAnalytics = new VideoAnalytics(player, {});
        videoAnalytics.handleTimeUpdate();
      });

      it('should not try to get the time from the player', function() {
        expect(player.currentTime.called).to.be.false;
      });
    });

    describe('not during ad play back state', function() {
      beforeEach(function() {
        videoAnalytics = new VideoAnalytics(player, {});
        TestHelper.stub(videoAnalytics, 'sendThreeSeconds');
        TestHelper.stub(videoAnalytics, 'sendThirtySeconds');
        TestHelper.stub(videoAnalytics, 'sendNinetyFivePercentComplete');
      });

      it('should fire nothing once just started', function() {
        TestHelper.stub(player, 'currentTime', 0);
        videoAnalytics.handleTimeUpdate();
        expect(videoAnalytics.sendThreeSeconds.called).to.be.false;
        expect(videoAnalytics.sendThirtySeconds.called).to.be.false;
        expect(videoAnalytics.sendNinetyFivePercentComplete.called).to.be.false;
      });

      it('should event if past 3 seconds', function() {
        TestHelper.stub(player, 'currentTime', 3);
        videoAnalytics.handleTimeUpdate();
        expect(videoAnalytics.sendThreeSeconds.called).to.be.true;
        expect(videoAnalytics.sendThirtySeconds.called).to.be.false;
        expect(videoAnalytics.sendNinetyFivePercentComplete.called).to.be.false;
      });

      it('should try to fire both events if past 30 seconds', function() {
        TestHelper.stub(player, 'currentTime', 30);
        videoAnalytics.handleTimeUpdate();
        expect(videoAnalytics.sendThreeSeconds.called).to.be.true;
        expect(videoAnalytics.sendThirtySeconds.called).to.be.true;
        expect(videoAnalytics.sendNinetyFivePercentComplete.called).to.be.false;
      });

      it('should try to fire all events if at 95%', function() {
        TestHelper.stub(player, 'currentTime', 95);
        videoAnalytics.handleTimeUpdate();
        expect(videoAnalytics.sendThreeSeconds.called).to.be.true;
        expect(videoAnalytics.sendThirtySeconds.called).to.be.true;
        expect(videoAnalytics.sendNinetyFivePercentComplete.called).to.be.true;
      });
    });
  });
});
