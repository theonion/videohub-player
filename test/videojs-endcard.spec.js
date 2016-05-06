var videojs = require('video.js');
var sinon = require('sinon');
var expect = require('chai').expect;
var TestHelper = require('./support/test_helper');
var EndCard = require('../src/videojs-endcard');

describe('EndCard', function() {
  var sampleOverlay, playerStub, videoDiv;

  beforeEach(function() {
    sampleOverlay = require('test.endcard.stub');
    videoDiv = document.createElement('div');
    document.body.appendChild(videoDiv);
    playerStub = {
      on: sinon.stub(),
      trigger: sinon.stub(),
      play: sinon.stub(),
      el: function() { return videoDiv; },
      controlBar: { show: function() {}, hide: function() {} },
      posterImage: { show: function() {}, hide: function() {} },
      shareTools: { setup: sinon.stub() }
    };
    window.picturefill = function() {};
  });

  afterEach(function() {
    $(videoDiv).remove();
  });

  describe('options', function() {
    var endCard;

    describe('defaults', function() {
      beforeEach(function() {
        endCard = new EndCard(playerStub);
      });

      it('has a default countdown', function() {
        expect(endCard.settings.countdown).to.eql(5);
      });

      it('has a default empty `next` value', function() {
        expect(endCard.settings.next).to.be.null;
      });

      it('allows countdown to next video by default', function() {
        expect(endCard.settings.allowCountdown).to.be.true;
      });

      it('allows replay of the video just viewed by default', function() {
        expect(endCard.settings.replayAllow).to.be.true;
      });
    });

    describe('overrides', function() {
      beforeEach(function() {
        endCard = new EndCard(playerStub, {
          countdown: 10,
          next: { id: 12345 },
          allowCountdown: false,
          replayAllow: false
        });
      });

      it('allows override of countdown', function() {
        expect(endCard.settings.countdown).to.eql(10);
      });

      it('allows override of `next` value', function() {
        expect(endCard.settings.next.id).to.eql(12345);
      });

      it('allows override of countdown', function() {
        expect(endCard.settings.allowCountdown).to.be.false;
      });

      it('allows override of replay', function() {
        expect(endCard.settings.replayAllow).to.be.false;
      });
    });
  });

  describe('#videoEnded', function() {
    var endCard;

    beforeEach(function() {
      endCard = new EndCard(playerStub);
    });

    describe('after ad playback', function() {
      beforeEach(function() {
        endCard.player = { ads: { state: 'ad-playback' } };
        endCard.videoEnded();
      });

      it('returns without doing a thing', function() {
        expect(endCard.timeLeft).to.be.undefined;
      });
    });

    describe('time left', function() {
      beforeEach(function() {
        endCard.videoEnded();
      });

      it('sets time left to the value of the countdown', function() {
        expect(endCard.timeLeft).to.eql(5);
      });
    });

    describe('overlay', function() {
      beforeEach(function() {
        endCard.overlay = null;
        TestHelper.stub(endCard, 'setupEndcard');
        endCard.videoEnded();
      });

      it('sets up the endcard if an overlay is not present', function() {
        expect(endCard.setupEndcard.called).to.be.true;
      });
    });
  });

  describe('#setupEndcard', function() {
    var endCard;

    beforeEach(function() {
      endCard = new EndCard(playerStub, { 'URL': '/end-cards/3739/?' });
      TestHelper.stub($, 'get');
      endCard.setupEndcard();
    });

    it('fetches the endcard overlay & sets up the callback', function() {
      expect($.get.args[0][0]).to.eql('/end-cards/3739/?');
    });
  });

  describe('#teardownEndcard', function() {
    var endCard;

    beforeEach(function() {
      endCard = new EndCard(playerStub, { 'URL': '/end-cards/3739/?' });
      endCard.player.el().appendChild($(sampleOverlay)[0]);
      endCard.$overlay = $(endCard.player.el()).find('.endcard');
      TestHelper.stub(endCard.player.posterImage, 'hide');
      TestHelper.stub(endCard.player.controlBar, 'show');
      TestHelper.stub(window, 'clearInterval');
      endCard.timeout = 4;
      endCard.teardownEndcard();
    });

    it('removes the endcard', function() {
      expect($(endCard.player.el()).find('.endcard').length).to.equal(0);
      expect(endCard.$overlay).to.be.null;
    });

    it('clears interval', function() {
      expect(window.clearInterval.calledWith(4)).to.be.true;
    });

    it('hides the poster image', function() {
      expect(endCard.player.posterImage.hide.called).to.be.true;
    });

    it('shows the control bar', function() {
      expect(endCard.player.controlBar.show.called).to.be.true;
    });
  });

  describe('#replayVideo', function() {
    var endCard;

    beforeEach(function() {
      endCard = new EndCard(playerStub, { replayAllow: true });
      TestHelper.stub(endCard, 'teardownEndcard');
      TestHelper.stub(window, 'clearInterval');
      endCard.timeout = 3;
      endCard.replayVideo();
    });

    it('triggers the replay event', function() {
      expect(endCard.player.trigger.calledWith('replay')).to.be.true;
    });

    it('tears down the endcard', function() {
      expect(endCard.teardownEndcard.called).to.be.true;
    });

    it('clears the interval for the countdown to next video', function() {
      expect(window.clearInterval.calledWith(3));
    });

    it('plays the video', function() {
      expect(endCard.player.play.called).to.be.true;
    });
  });

  describe('#pathInfo', function() {
    var endCard;

    beforeEach(function() {
      endCard = new EndCard(playerStub, { 'URL': '/end-cards/3739/?' });
    });

    it('simply returns the window location pathname', function() {
      expect(endCard.pathInfo()).to.eql(window.location.pathname);
    });
  });

  describe('#isRailPlayer', function() {
    var endCard;

    beforeEach(function() {
      endCard = new EndCard(playerStub);
    });

    it('returns true if the URL matches the pattern', function() {
      TestHelper.stub(endCard, 'pathInfo', '/channels/the-onion/rail');
      expect(endCard.isRailPlayer()).to.be.true;
    });

    it('returns false if it does not', function() {
      TestHelper.stub(endCard, 'pathInfo', '/embed');
      expect(endCard.isRailPlayer()).to.be.false;
    });
  });

  describe('#isEmbedPlayer', function() {
    var endCard;

    beforeEach(function() {
      endCard = new EndCard(playerStub);
    });

    it('returns true if the URL matches the pattern', function() {
      TestHelper.stub(endCard, 'pathInfo', '/embed');
      expect(endCard.isEmbedPlayer()).to.be.true;
    });

    it('returns false if it does not', function() {
      TestHelper.stub(endCard, 'pathInfo', '/video/some-video-12345');
      expect(endCard.isEmbedPlayer()).to.be.false;
    });
  });

  describe('#startCountdown', function() {
    var endCard;

    beforeEach(function() {
      endCard = new EndCard(playerStub);
      endCard.timeout = null;
      TestHelper.stub(window, 'setInterval', 'somevalue');
      endCard.startCountdown();
    });

    it('sets up an interval and assigns it to the timeout', function() {
      expect(window.setInterval.called).to.be.true;
      expect(endCard.timeout).to.equal('somevalue');
    });
  });

  describe('#toggleCountdown', function() {
    var endCard;

    beforeEach(function() {
      endCard = new EndCard(playerStub);
      TestHelper.stub(endCard, 'clearCountdown');
      TestHelper.stub(endCard, 'startCountdown');
      endCard.player.el().appendChild($(sampleOverlay)[0]);
      endCard.$overlay = $(endCard.player.el()).find('.endcard');
    });

    describe('with timeout', function() {
      beforeEach(function() {
        endCard.timeout = 'somevalue';
        $('.pause').removeClass('paused');
        endCard.toggleCountdown();
      });

      it('adds the paused class', function() {
        expect($('.pause').hasClass('paused')).to.be.true;
      });

      it('clears the interval', function() {
        expect(endCard.clearCountdown.called).to.be.true;
      });
    });

    describe('without timeout', function() {
      beforeEach(function() {
        endCard.timeout = null;
        $('.pause').addClass('paused');
        endCard.toggleCountdown();
      });

      it('removes the paused class', function() {
        expect($('.pause').hasClass('paused')).to.be.false;
      });

      it('starts the countdown again', function() {
        expect(endCard.startCountdown.called).to.be.true;
      });
    });
  });

  describe('#clearCountdown', function() {
    var endCard;

    beforeEach(function() {
      endCard = new EndCard(playerStub);
      endCard.timeout = 'somevalue';
      TestHelper.stub(window, 'clearInterval');
      endCard.clearCountdown();
    });

    it('clears the interval of the timeout', function() {
      expect(window.clearInterval.calledWith('somevalue')).to.be.true;
    });

    it('clears the timeout value', function() {
      expect(endCard.timeout).to.be.null;
    });
  });

  describe('#setupCountdown', function() {
    var endCard;

    beforeEach(function() {
      endCard = new EndCard(playerStub);
      TestHelper.stub(endCard, 'startCountdown');
      endCard.player.el().appendChild($(sampleOverlay)[0]);
      endCard.$overlay = $(endCard.player.el()).find('.endcard');
      endCard.setupCountdown();
    });

    it('shows the count and pause button', function() {
      expect(endCard.$overlay.find('.count').hasClass('visible')).to.be.true;
      expect(endCard.$overlay.find('.pause').hasClass('visible')).to.be.true;
    });

    it('starts the countdown', function() {
      expect(endCard.startCountdown.called).to.be.true;
    });
  });

  describe('#updateCountdown', function() {
    var endCard;

    beforeEach(function() {
      endCard = new EndCard(playerStub);
      TestHelper.stub(endCard, 'clearCountdown');
      TestHelper.stub(endCard, 'redirectTo');
      endCard.player.el().appendChild($(sampleOverlay)[0]);
      endCard.$overlay = $(endCard.player.el()).find('.endcard');
    });

    describe('some time left', function() {
      beforeEach(function() {
        endCard.timeLeft = 4;
        endCard.updateCountdown();
      });

      it('knocks one second off remaining time', function() {
        expect(endCard.timeLeft).to.equal(3);
      });

      it('updates the count in the markup to reflect new time', function() {
        expect(endCard.$overlay.find('.count').html()).to.equal('3');
      });
    });

    describe('no time left', function() {
      beforeEach(function() {
        endCard.timeLeft = 0;
        endCard.updateCountdown();
      });

      it('clears the countdown', function() {
        expect(endCard.clearCountdown.called).to.be.true;
      });

      it('redirects to the next video url', function() {
        expect(endCard.redirectTo.args[0][0]).to.have.string('/videos/candidate-profile-rick-santorum-3739');
      });
    });
  });

  describe('#displayShareTools', function() {
    var endCard;

    beforeEach(function() {
      endCard = new EndCard(playerStub);
      endCard.player.el().appendChild($(sampleOverlay)[0]);
      endCard.$overlay = $(endCard.player.el()).find('.endcard');
    });

    describe('has custom endcard', function() {
      beforeEach(function() {
        var customEndCard = document.createElement('div');
        customEndCard.id = 'custom-endcard';
        endCard.$overlay.append(customEndCard);
        endCard.displayShareTools();
      });

      it('sets the target to _blank', function() {
        expect(endCard.$overlay.find('.next-video-container a').attr('target')).to.equal('_blank');
      });

      it('removes the sharetool', function() {
        expect(endCard.$overlay.find('.sharetool').length).to.equal(0);
      });
    });

    describe('is right rail player', function() {
      beforeEach(function() {
        TestHelper.stub(endCard, 'isRailPlayer', true);
        endCard.displayShareTools();
      });

      it('sets the target to _blank', function() {
        expect(endCard.$overlay.find('.next-video-container a').attr('target')).to.equal('_blank');
      });

      it('removes the sharetool', function() {
        expect(endCard.$overlay.find('.sharetool').length).to.equal(0);
      });
    });

    describe('regular player', function() {
      beforeEach(function() {
        endCard.displayShareTools();
      });

      it('sets up the share tools', function() {
        expect(endCard.player.shareTools.setup.called).to.be.true;
      });
    });
  });

  describe('#replaceEndCardUrl', function() {
    var endCard;

    beforeEach(function() {
      endCard = new EndCard(playerStub);
      endCard.$overlay = $(sampleOverlay);
      endCard.replaceEndCardUrl();
    });

    it('replaces the URL', function() {
      var $url = endCard.$overlay.find('a');
      var videoId = $url.data('video-id');
      expect($url.attr('href')).to.equal('/v/' + videoId);
    });
  });

  describe('#endcardFetched', function() {
    var endCard;

    describe('always', function() {
      beforeEach(function() {
        endCard = new EndCard(playerStub, { 'URL': '/end-cards/3739/?' });
        TestHelper.stub(endCard, 'setupReplay');
        TestHelper.stub(endCard, 'displayShareTools');
        TestHelper.stub(endCard, 'setupCountdown');
        TestHelper.stub(endCard, 'replaceEndCardUrl');
        TestHelper.stub(endCard.player.controlBar, 'hide');
        TestHelper.stub(endCard.player.posterImage, 'show');
        TestHelper.stub(window, 'picturefill');
        endCard.endcardFetched(sampleOverlay);
      });

      it('replaces the end card URL with the /v/ shorthand URL', function() {
        expect(endCard.replaceEndCardUrl.called).to.be.true;
      });

      it('shows the poster image', function() {
        expect(endCard.player.posterImage.show.called).to.be.true;
      });

      it('sets up the replay functionality if permitted', function() {
        expect(endCard.setupReplay.called).to.be.true;
      });

      it('calls to display share tools', function() {
        expect(endCard.displayShareTools.called).to.be.true;
      });

      it('hides the controls on the player', function() {
        expect(endCard.player.controlBar.hide.called).to.be.true;
      });

      it('calls picture fill', function() {
        expect(window.picturefill.called).to.be.true;
      });
    });

    describe('rail or embed player', function() {
      beforeEach(function() {
        endCard = new EndCard(playerStub, { 'URL': '/end-cards/3739/?' });
        TestHelper.stub(endCard, 'setupReplay');
        TestHelper.stub(endCard, 'displayShareTools');
        TestHelper.stub(endCard, 'setupCountdown');
      });

      it('does not allow countdown if rail player', function() {
        TestHelper.stub(endCard, 'isRailPlayer', true);
        TestHelper.stub(endCard, 'isEmbedPlayer', false);
        endCard.endcardFetched(sampleOverlay);
        expect(endCard.settings.allowCountdown).to.be.false;
      });

      it('does not allow countdown if embed player', function() {
        TestHelper.stub(endCard, 'isEmbedPlayer', true);
        TestHelper.stub(endCard, 'isRailPlayer', false);
        endCard.endcardFetched(sampleOverlay);
        expect(endCard.settings.allowCountdown).to.be.false;
      });
    });

    describe('countdown functionality', function() {
      beforeEach(function() {
        endCard = new EndCard(playerStub, { allowCountdown: true });
        TestHelper.stub(endCard, 'setupReplay');
        TestHelper.stub(endCard, 'displayShareTools');
        TestHelper.stub(endCard, 'setupCountdown');
        endCard.endcardFetched(sampleOverlay);
      });

      it('sets up the countdown functionality', function() {
        expect(endCard.setupCountdown.called).to.be.true;
      });
    });

    describe('countdown is not allowed', function() {
      beforeEach(function() {
        endCard = new EndCard(playerStub, { allowCountdown: false });
        TestHelper.stub(endCard, 'setupReplay');
        TestHelper.stub(endCard, 'displayShareTools');
        TestHelper.stub(endCard, 'setupCountdown');
        endCard.endcardFetched(sampleOverlay);
      });

      it('makes the next video link open in a new window', function() {
        expect(endCard.$overlay.find('.next-video-container a').attr('target')).to.equal('_blank');
      });
    });
  });
});
