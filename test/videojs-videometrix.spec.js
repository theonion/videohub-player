var sinon = require('sinon');
var expect = require('chai').expect;
var videojs = require('video.js');
var TestHelper = require('./support/test_helper');
var VideoMetrix = require('../src/videojs-videometrix');

describe('VideoMetrix', function() {
  var videoMetrix, player, videoDiv;

  beforeEach(function() {
    videoDiv = document.createElement('div');
    videoDiv.id = 'test-video';
    document.body.appendChild(videoDiv);
    player = videojs('test-video');
  });

  afterEach(function() {
    videojs('test-video').dispose();
  });

  describe('defaults', function() {
    beforeEach(function() {
      TestHelper.stub(console, 'error');
      TestHelper.stub(ns_, 'StreamingTag');
      videoMetrix = new VideoMetrix(player, {});
    });

    it('does not instantiate StreamingTag if no id', function() {
      expect(ns_.StreamingTag.called).to.be.false;
    });

    it('throws an error if there is no ID passed in ', function() {
      expect(console.error.called).to.be.true;
    });
  });

  describe('overrides', function() {
    beforeEach(function() {
      TestHelper.stub(ns_, 'StreamingTag');
      videoMetrix = new VideoMetrix(player, {
        "id": 6036328,
        "metadata": {
          "c3": "onionstudios",
          "ns_st_ci": "onionstudios.3219",
          "c4": "AVCLUB"
        }
      });
    });

    it('overrides id', function() {
      expect(videoMetrix.settings.id).to.equal(6036328);
    });

    it('sets up metadata', function() {
      expect(videoMetrix.settings.metadata.c3).to.equal('onionstudios');
      expect(videoMetrix.settings.metadata.ns_st_ci).to.equal('onionstudios.3219');
      expect(videoMetrix.settings.metadata.c4).to.equal('AVCLUB');
    });

    it('sets up a new StreamingTag', function() {
      expect(ns_.StreamingTag.calledWith({ customerC2: 6036328 })).to.be.true;
    });
  });

  describe('#isAdPlaying', function() {
    beforeEach(function() {
      videoMetrix = new VideoMetrix(player, {});
      player.ads = undefined;
    });

    it('returns false if no ads object', function() {
      expect(videoMetrix.isAdPlaying()).to.be.undefined;
    });

    it('returns true if ad-playback', function() {
      player.ads = { state: 'ad-playback' };
      expect(videoMetrix.isAdPlaying()).to.be.true;
    });

    it('returns true if ads-ready', function() {
      player.ads = { state: 'ads-ready' };
      expect(videoMetrix.isAdPlaying()).to.be.true;
    });
  });

  describe('events', function() {
    beforeEach(function() {
      videoMetrix = new VideoMetrix(player, {
        "id": 6036328,
        "metadata": {
          "c3": "onionstudios",
          "ns_st_ci": "onionstudios.3219",
          "c4": "AVCLUB"
        }
      });
      TestHelper.stub(videoMetrix.streamingTag, 'playVideoAdvertisement');
      TestHelper.stub(videoMetrix.streamingTag, 'stop');
      TestHelper.stub(videoMetrix.streamingTag, 'playVideoContentPart');
    });

    describe('on `adstart`', function() {
      it('calls playVideoAdvertisement on adstart', function() {
        player.trigger('adstart');
        expect(videoMetrix.streamingTag.playVideoAdvertisement.called).to.be.true;
      });
    });

    describe('on `adend`', function() {
      it('calls stop on adend', function() {
        player.trigger('adend');
        expect(videoMetrix.streamingTag.stop.called).to.be.true;
      });
    });

    describe('on `play`', function() {
      it('calls playVideoContentPart on play if it is not an ad playing', function() {
        TestHelper.stub(videoMetrix, 'isAdPlaying', false);
        player.trigger('play');
        expect(videoMetrix.streamingTag.playVideoContentPart.calledWith(videoMetrix.settings.metadata)).to.be.true;
      });

      it('does not call playVideoContentPart on play if ad is playing', function() {
        TestHelper.stub(videoMetrix, 'isAdPlaying', true);
        player.trigger('play');
        expect(videoMetrix.streamingTag.playVideoContentPart.called).to.be.false;
      });
    });

    describe('on `pause`', function() {
      it('calls stop on pause if no ad is playing', function() {
        TestHelper.stub(videoMetrix, 'isAdPlaying', false);
        player.trigger('pause');
        expect(videoMetrix.streamingTag.stop.called).to.be.true;
      });

      it('does not call stop on pause if ad is playing', function() {
        TestHelper.stub(videoMetrix, 'isAdPlaying', true);
        player.trigger('pause');
        expect(videoMetrix.streamingTag.stop.called).to.be.false;
      });
    });

    describe('on `ended`', function() {
      it('calls stop on ended if no ad is playing', function() {
        TestHelper.stub(videoMetrix, 'isAdPlaying', false);
        player.trigger('ended');
        expect(videoMetrix.streamingTag.stop.called).to.be.true;
      });

      it('does not call stop on ended if ad is playing', function() {
        TestHelper.stub(videoMetrix, 'isAdPlaying', true);
        player.trigger('ended');
        expect(videoMetrix.streamingTag.stop.called).to.be.false;
      });
    });

  });
});
