var videojs = require('video.js');
var sinon = require('sinon');
var expect = require('chai').expect;
var TestHelper = require('./support/test_helper');
var ShareTools = require('../src/videojs-sharetools');

describe('ShareTools', function() {
  var shareTools, player, videoDiv;

  beforeEach(function() {
    videoDiv = document.createElement('div');
    videoDiv.id = 'test-video';
    document.body.appendChild(videoDiv);
    player = videojs('test-video');
  });

  afterEach(function() {
    videojs('test-video').dispose();
  });

  it('has sharetools object reference', function() {
    shareTools = new ShareTools(player, {});
    expect(typeof(shareTools.shareTools.addNetwork)).to.equal('function');
  });

  describe('#prepareOverlay', function() {
    context('with global settings', function() {
      beforeEach(function() {
        window.shareUrl = 'http://karma.com';
        window.share_description = 'This video';
        window.share_title = 'This title of a video';
        shareTools = new ShareTools(player, {});
      });

      it('sets up an overlay div', function() {
        var $overlay = shareTools.prepareOverlay();
        expect($overlay.data('shareTitle')).to.equal('This title of a video');
        expect($overlay.data('shareDescription')).to.equal('This video');
        expect($overlay.data('shareUrl')).to.equal('http://karma.com');
      });
    });

    context('with configured settings', function() {
      beforeEach(function() {
        delete window.shareUrl;
        delete window.share_description;
        delete window.share_title;
        shareTools = new ShareTools(player, {
          shareTitle: 'Example title of a video',
          shareDescription: 'Example video',
          shareUrl: 'http://example.org',
        });
      });

      it('sets up an overlay div', function() {
        var $overlay = shareTools.prepareOverlay();
        expect($overlay.data('shareTitle')).to.equal('Example title of a video');
        expect($overlay.data('shareDescription')).to.equal('Example video');
        expect($overlay.data('shareUrl')).to.equal('http://example.org');
      });
    });
  });

  describe('#setupTwitter', function() {
    var $shareToolDiv;

    beforeEach(function() {
      $shareToolDiv = $('<div class="share-buttons"></div>');
      shareTools = new ShareTools(player, {});
    });

    describe('twitter not configured', function() {
      beforeEach(function() {
        shareTools.settings.twitter = undefined;
        shareTools.setupTwitter($shareToolDiv);
      });

      it('does not set up the button', function() {
        expect($shareToolDiv.children().length).to.equal(0);
      });
    });

    describe('twitter configured', function() {
      beforeEach(function() {
        shareTools.settings.twitter = true;
        shareTools.setupTwitter($shareToolDiv);
      });

      it('sets up the button', function() {
        expect($shareToolDiv.children().length).to.equal(1);
        expect($shareToolDiv.find('.share-twitter').attr('title')).to.equal('Share via Twitter');
      });
    });

  });

  describe('#setupFacebook', function() {
    var $shareToolDiv;

    beforeEach(function() {
      $shareToolDiv = $('<div class="share-buttons"></div>');
      shareTools = new ShareTools(player, {});
    });

    describe('facebook not configured', function() {
      beforeEach(function() {
        shareTools.settings.facebook = undefined;
        shareTools.setupFacebook($shareToolDiv);
      });

      it('does not set up the button', function() {
        expect($shareToolDiv.children().length).to.equal(0);
      });
    });

    describe('facebook configured', function() {
      beforeEach(function() {
        shareTools.settings.facebook = true;
        shareTools.setupFacebook($shareToolDiv);
      });

      it('sets up the button', function() {
        expect($shareToolDiv.children().length).to.equal(1);
        expect($shareToolDiv.find('.share-facebook').attr('title')).to.equal('Share via Facebook');
      });
    });

  });

  describe('#setupEmbedCode', function() {
    var $shareToolDiv;

    beforeEach(function() {
      $shareToolDiv = $('<div class="share-buttons"></div>');
      shareTools = new ShareTools(player, {});
    });

    describe('embed not configured', function() {
      beforeEach(function() {
        shareTools.settings.embed = undefined;
        shareTools.setupEmbedCode($shareToolDiv);
      });

      it('does not set up the button', function() {
        expect($shareToolDiv.children().length).to.equal(0);
      });
    });

    describe('embed configured', function() {
      beforeEach(function() {
        shareTools.settings.embed = true;
        shareTools.setupEmbedCode($shareToolDiv);
      });

      it('sets up the button', function() {
        expect($shareToolDiv.children().first().hasClass('embed')).to.be.true;
      });
    });
  });

  describe('#setup', function() {
    var $shareToolDiv, $overlay;

    beforeEach(function() {
      $shareToolDiv = $('<div class="share-buttons"></div>');
      shareTools = new ShareTools(player, {
        twitter: true,
        facebook: true,
        embed: true
      });
      TestHelper.stub(shareTools.shareTools, 'setupElements');
      shareTools.setup();
      $overlay = $(player.el()).find('.share-widget');
    });

    it('has an embed button in the overlay', function() {
      expect($overlay.find('.embed').length).to.equal(1);
    });

    it('has a twitter button in the overlay', function() {
      expect($overlay.find('.share-twitter').length).to.equal(1);
    });

    it('has a facebook button in the overlay', function() {
      expect($overlay.find('.share-facebook').length).to.equal(1);
    });

    it('toggles embed-active class on click', function() {
      $overlay.append($('<div class="embed-div">'));
      $overlay.find('.embed').trigger('click');
      expect($('.embed-div').hasClass('embed-active')).to.be.true;

      $overlay.find('.embed').trigger('click');
      expect($('.embed-div').hasClass('embed-active')).to.be.false;
    });
  });
});
