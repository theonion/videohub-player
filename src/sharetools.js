(function (window) {

// this is probably a little overkill
  function agentIsMobile() {
    var check = false;
    (function (a) {
      if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))check = true
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  }

  function objToParams(obj) {
    var urlParams = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        urlParams.push(key + '=' + obj[key]);
      }
    }
    return urlParams.join('&');
  }

  function ShareTools() {
    this.networks = {};
    this.storageKeyPrefix = 'shareTools-'
  }

  ShareTools.prototype.addNetwork = function (options) {
    this.networks[options.name] = options;
    return this;
  };

  ShareTools.prototype.getUrlFor = function (networkName, params) {
    var network = this.networks[networkName];
    return network.url(params);
  };

  ShareTools.prototype.shouldShowPostShareDialog = function (networkName) {
    if (localStorage.getItem(this.storageKeyPrefix + 'dont-bother') != null) {
      return false;
    }
    if (agentIsMobile()) {  // dont do it on small screens
      return false;
    }
    return this.networks[networkName].postShareDialog || false;
  };

  ShareTools.prototype.flagDontShowPostShareDialog = function () {
    localStorage.setItem(this.storageKeyPrefix + 'dont-bother', 'yup');
  };

  ShareTools.prototype.setupElements = function (selector) {

    var $shareToolElements = selector instanceof jQuery ? selector : $(selector);

    // where all the dom-related stuff gets wired up
    var shareTools = this;
    $shareToolElements.each(function (i, element) {
      element = $(element);
      for (var networkName in shareTools.networks) {
        if (!shareTools.networks.hasOwnProperty(networkName)) {
          continue;
        }
        // We wait until the last moment to get the url so more dynamic
        // things like quizzes have an opportunity to override the DOM params.
        // e.g. "I answered X out of Y correctly"
        $('.share-' + networkName, element).click(function (name, shareWidget) {
          return function (event) {
            var euc = encodeURIComponent;
            var params = {
              title: euc(shareWidget.data('shareTitle')),
              description: euc(shareWidget.data('shareDescription')),
              image: euc(shareWidget.data('shareImageUrl')),
              url: euc(shareWidget.data('shareUrl')),
              redirectUrl: euc(shareWidget.data('shareRedirectUrl'))
            };
            var url = shareTools.getUrlFor(name, params);
            var link = $(this);
            if (name != 'mail') {
              // position it in the middle of the browser window
              var left = 0,
                top = 0;
              if (typeof window.screenLeft !== 'undefined') {
                left = window.screenLeft;
                top = window.screenTop;
              } else if (typeof window.screenX !== 'undefined') {
                left = window.screenX;
                tp = window.screenY;
              }
              // popup dimensions
              var width = 600,
                height = 260;
              left += ($(window).width() - width) / 2;
              top += ($(window).height() - height) / 2;
              var shareWindow = window.open(
                url, '',
                'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height='
                + height + ',width=' + width + ',top=' + top + ',left=' + left
              );
              // show a post-share dialog?
              if (shareTools.shouldShowPostShareDialog(name) && shareWindow) {
                // wait for the share window to close. gotta poll here :(
                var windowInterval = setInterval(function () {
                  if (shareWindow.closed) {
                    clearInterval(windowInterval);
                    var psd = $('<div class="post-share-modal modal"></div>');
                    psd.load('/shared?s=' + name, function (data) {
                      $('body').append(psd);
                      $('.dont-show-again', psd).click(function (event) {
                        event.preventDefault();
                        shareTools.flagDontShowPostShareDialog();
                        $.modal.close();
                      });
                      psd.modal({
                        zIndex: 30000,
                        closeText: '<span class="fa fa-times"></span>'
                      });
                      shareTools.setupElements(psd);
                    });
                    ;
                  }
                }, 500);
              }
              event.preventDefault();
            } else {
              // email is special
              link.attr('href', url);
            }
          }
        }(networkName, element));
      }
    });
  };


  $(function () {
    // configure our social networks
    var shareTools = window.shareTools = new ShareTools()

    shareTools.addNetwork({
      name: 'facebook',
      url: function (params, element) {
        var ps = {
          app_id: '632832353489701',
          display: 'popup',
          link: params.url,
          name: params.title,
          description: params.description,
          image: params.image,
          redirect_uri: params.redirectUrl
        };
        return 'https://www.facebook.com/dialog/feed?' + objToParams(ps);
      },
      postShareDialog: false
    }).addNetwork({
      name: 'facebook-follow',
      url: function (params, element) {
        return 'http://www.facebook.com/plugins/follow.php?href=https%3A%2F%2Fwww.facebook.com%2Ftheonion';
      },
      postShareDialog: false
    }).addNetwork({
      name: 'twitter',
      url: function (params, element) {
        var text = params.title;
        text = text.substr(0, 139);
        ps = {
          text: text,
          url: params.url,
          via: twitter_handle
        };
        return 'https://www.twitter.com/share?' + objToParams(ps);
      },
      postShareDialog: false
    }).addNetwork({
      name: 'twitter-follow',
      url: function (params, element) {
        var text = params.title;
        text = text.substr(0, 139);
        ps = {
          screen_name: 'theonion'
        };
        return 'https://twitter.com/intent/follow?' + objToParams(ps);
      },
      postShareDialog: false
    }).addNetwork({
      name: 'mail',
      url: function (params, element) {
        var body = params.url + '%0D%0A%0D%0A' + params.description + '%0D%0A%0D%0Avia theonion.com';
        var ps = {
          subject: params.title,
          body: body
        };
        return 'mailto:?' + objToParams(ps);
      },
      postShareDialog: false
    }).addNetwork({
      name: 'pinterest',
      url: function (params, element) {
        var ps = {
          url: params.url,
          media: params.image,
          description: params.title + ' - ' + params.description + ' @theonion'
        };
        return 'http://www.pinterest.com/pin/create/button/?' + objToParams(ps);
      },
      postShareDialog: false
    }).addNetwork({
      name: 'pinterest-follow',
      url: function (params, element) {
        return 'http://www.pinterest.com/theonion/';
      },
      postShareDialog: false
    }).addNetwork({
      name: 'reddit',
      url: function (params, element) {
        var ps = {
          url: params.url,
          title: params.title
        };
        return 'http://www.reddit.com/submit?' + objToParams(ps);
      },
      postShareDialog: false
    }).addNetwork({
      name: 'tumblr',
      url: function (params, element) {
        var ps = {
          url: params.url,
          name: params.title,
          description: params.description
        };
        return 'http://www.tumblr.com/share/link?' + objToParams(ps);
      },
      postShareDialog: false
    }).addNetwork({
      name: 'tumblr-follow',
      url: function (params, element) {
        return 'http://www.tumblr.com/follow/theonion';
      },
      postShareDialog: false
    }).addNetwork({
      name: 'google-plus',
      url: function (params, element) {
        var ps = {
          url: params.url
        };
        return 'https://plus.google.com/share?' + objToParams(ps);
      },
      postShareDialog: false
    }).addNetwork({
      name: 'google-plus-follow',
      url: function (params, element) {
        return 'https://plus.google.com/101973235797849021923';
      },
      postShareDialog: false
    });
    shareTools.setupElements('.share-widget');
  });

}(window));
