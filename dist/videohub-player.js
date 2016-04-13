/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {__webpack_require__(2);
	__webpack_require__(3);
	__webpack_require__(4);
	__webpack_require__(5);
	__webpack_require__(6);
	__webpack_require__(7);
	__webpack_require__(10);
	__webpack_require__(11);
	__webpack_require__(12);
	__webpack_require__(13);
	__webpack_require__(14);
	
	__webpack_require__(15);
	__webpack_require__(16);
	__webpack_require__(17);
	__webpack_require__(18);
	
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
	  this.player = window.videojs(element, this.settings);
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
	
	  if (this.settings.embed) {
	    this.sendParentPlayerEvents();
	  }
	
	  this.initPlayerEventListeners();
	  this.initMessageEventListeners();
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
	
	  this.player.on('dispose', function() {
	    if (that.messageHandler) {
	      window.removeEventListener('message', that.messageHandler);
	    }
	  });
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
	
	module.exports = VideoPlayer;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2);

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * jQuery JavaScript Library v2.2.3
	 * http://jquery.com/
	 *
	 * Includes Sizzle.js
	 * http://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2016-04-05T19:26Z
	 */
	
	(function( global, factory ) {
	
		if ( typeof module === "object" && typeof module.exports === "object" ) {
			// For CommonJS and CommonJS-like environments where a proper `window`
			// is present, execute the factory and get jQuery.
			// For environments that do not have a `window` with a `document`
			// (such as Node.js), expose a factory as module.exports.
			// This accentuates the need for the creation of a real `window`.
			// e.g. var jQuery = require("jquery")(window);
			// See ticket #14549 for more info.
			module.exports = global.document ?
				factory( global, true ) :
				function( w ) {
					if ( !w.document ) {
						throw new Error( "jQuery requires a window with a document" );
					}
					return factory( w );
				};
		} else {
			factory( global );
		}
	
	// Pass this if window is not defined yet
	}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {
	
	// Support: Firefox 18+
	// Can't be in strict mode, several libs including ASP.NET trace
	// the stack via arguments.caller.callee and Firefox dies if
	// you try to trace through "use strict" call chains. (#13335)
	//"use strict";
	var arr = [];
	
	var document = window.document;
	
	var slice = arr.slice;
	
	var concat = arr.concat;
	
	var push = arr.push;
	
	var indexOf = arr.indexOf;
	
	var class2type = {};
	
	var toString = class2type.toString;
	
	var hasOwn = class2type.hasOwnProperty;
	
	var support = {};
	
	
	
	var
		version = "2.2.3",
	
		// Define a local copy of jQuery
		jQuery = function( selector, context ) {
	
			// The jQuery object is actually just the init constructor 'enhanced'
			// Need init if jQuery is called (just allow error to be thrown if not included)
			return new jQuery.fn.init( selector, context );
		},
	
		// Support: Android<4.1
		// Make sure we trim BOM and NBSP
		rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
	
		// Matches dashed string for camelizing
		rmsPrefix = /^-ms-/,
		rdashAlpha = /-([\da-z])/gi,
	
		// Used by jQuery.camelCase as callback to replace()
		fcamelCase = function( all, letter ) {
			return letter.toUpperCase();
		};
	
	jQuery.fn = jQuery.prototype = {
	
		// The current version of jQuery being used
		jquery: version,
	
		constructor: jQuery,
	
		// Start with an empty selector
		selector: "",
	
		// The default length of a jQuery object is 0
		length: 0,
	
		toArray: function() {
			return slice.call( this );
		},
	
		// Get the Nth element in the matched element set OR
		// Get the whole matched element set as a clean array
		get: function( num ) {
			return num != null ?
	
				// Return just the one element from the set
				( num < 0 ? this[ num + this.length ] : this[ num ] ) :
	
				// Return all the elements in a clean array
				slice.call( this );
		},
	
		// Take an array of elements and push it onto the stack
		// (returning the new matched element set)
		pushStack: function( elems ) {
	
			// Build a new jQuery matched element set
			var ret = jQuery.merge( this.constructor(), elems );
	
			// Add the old object onto the stack (as a reference)
			ret.prevObject = this;
			ret.context = this.context;
	
			// Return the newly-formed element set
			return ret;
		},
	
		// Execute a callback for every element in the matched set.
		each: function( callback ) {
			return jQuery.each( this, callback );
		},
	
		map: function( callback ) {
			return this.pushStack( jQuery.map( this, function( elem, i ) {
				return callback.call( elem, i, elem );
			} ) );
		},
	
		slice: function() {
			return this.pushStack( slice.apply( this, arguments ) );
		},
	
		first: function() {
			return this.eq( 0 );
		},
	
		last: function() {
			return this.eq( -1 );
		},
	
		eq: function( i ) {
			var len = this.length,
				j = +i + ( i < 0 ? len : 0 );
			return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
		},
	
		end: function() {
			return this.prevObject || this.constructor();
		},
	
		// For internal use only.
		// Behaves like an Array's method, not like a jQuery method.
		push: push,
		sort: arr.sort,
		splice: arr.splice
	};
	
	jQuery.extend = jQuery.fn.extend = function() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[ 0 ] || {},
			i = 1,
			length = arguments.length,
			deep = false;
	
		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;
	
			// Skip the boolean and the target
			target = arguments[ i ] || {};
			i++;
		}
	
		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
			target = {};
		}
	
		// Extend jQuery itself if only one argument is passed
		if ( i === length ) {
			target = this;
			i--;
		}
	
		for ( ; i < length; i++ ) {
	
			// Only deal with non-null/undefined values
			if ( ( options = arguments[ i ] ) != null ) {
	
				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];
	
					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}
	
					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
						( copyIsArray = jQuery.isArray( copy ) ) ) ) {
	
						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && jQuery.isArray( src ) ? src : [];
	
						} else {
							clone = src && jQuery.isPlainObject( src ) ? src : {};
						}
	
						// Never move original objects, clone them
						target[ name ] = jQuery.extend( deep, clone, copy );
	
					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}
	
		// Return the modified object
		return target;
	};
	
	jQuery.extend( {
	
		// Unique for each copy of jQuery on the page
		expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),
	
		// Assume jQuery is ready without the ready module
		isReady: true,
	
		error: function( msg ) {
			throw new Error( msg );
		},
	
		noop: function() {},
	
		isFunction: function( obj ) {
			return jQuery.type( obj ) === "function";
		},
	
		isArray: Array.isArray,
	
		isWindow: function( obj ) {
			return obj != null && obj === obj.window;
		},
	
		isNumeric: function( obj ) {
	
			// parseFloat NaNs numeric-cast false positives (null|true|false|"")
			// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
			// subtraction forces infinities to NaN
			// adding 1 corrects loss of precision from parseFloat (#15100)
			var realStringObj = obj && obj.toString();
			return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
		},
	
		isPlainObject: function( obj ) {
			var key;
	
			// Not plain objects:
			// - Any object or value whose internal [[Class]] property is not "[object Object]"
			// - DOM nodes
			// - window
			if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
				return false;
			}
	
			// Not own constructor property must be Object
			if ( obj.constructor &&
					!hasOwn.call( obj, "constructor" ) &&
					!hasOwn.call( obj.constructor.prototype || {}, "isPrototypeOf" ) ) {
				return false;
			}
	
			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own
			for ( key in obj ) {}
	
			return key === undefined || hasOwn.call( obj, key );
		},
	
		isEmptyObject: function( obj ) {
			var name;
			for ( name in obj ) {
				return false;
			}
			return true;
		},
	
		type: function( obj ) {
			if ( obj == null ) {
				return obj + "";
			}
	
			// Support: Android<4.0, iOS<6 (functionish RegExp)
			return typeof obj === "object" || typeof obj === "function" ?
				class2type[ toString.call( obj ) ] || "object" :
				typeof obj;
		},
	
		// Evaluates a script in a global context
		globalEval: function( code ) {
			var script,
				indirect = eval;
	
			code = jQuery.trim( code );
	
			if ( code ) {
	
				// If the code includes a valid, prologue position
				// strict mode pragma, execute code by injecting a
				// script tag into the document.
				if ( code.indexOf( "use strict" ) === 1 ) {
					script = document.createElement( "script" );
					script.text = code;
					document.head.appendChild( script ).parentNode.removeChild( script );
				} else {
	
					// Otherwise, avoid the DOM node creation, insertion
					// and removal by using an indirect global eval
	
					indirect( code );
				}
			}
		},
	
		// Convert dashed to camelCase; used by the css and data modules
		// Support: IE9-11+
		// Microsoft forgot to hump their vendor prefix (#9572)
		camelCase: function( string ) {
			return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
		},
	
		nodeName: function( elem, name ) {
			return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
		},
	
		each: function( obj, callback ) {
			var length, i = 0;
	
			if ( isArrayLike( obj ) ) {
				length = obj.length;
				for ( ; i < length; i++ ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			}
	
			return obj;
		},
	
		// Support: Android<4.1
		trim: function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},
	
		// results is for internal usage only
		makeArray: function( arr, results ) {
			var ret = results || [];
	
			if ( arr != null ) {
				if ( isArrayLike( Object( arr ) ) ) {
					jQuery.merge( ret,
						typeof arr === "string" ?
						[ arr ] : arr
					);
				} else {
					push.call( ret, arr );
				}
			}
	
			return ret;
		},
	
		inArray: function( elem, arr, i ) {
			return arr == null ? -1 : indexOf.call( arr, elem, i );
		},
	
		merge: function( first, second ) {
			var len = +second.length,
				j = 0,
				i = first.length;
	
			for ( ; j < len; j++ ) {
				first[ i++ ] = second[ j ];
			}
	
			first.length = i;
	
			return first;
		},
	
		grep: function( elems, callback, invert ) {
			var callbackInverse,
				matches = [],
				i = 0,
				length = elems.length,
				callbackExpect = !invert;
	
			// Go through the array, only saving the items
			// that pass the validator function
			for ( ; i < length; i++ ) {
				callbackInverse = !callback( elems[ i ], i );
				if ( callbackInverse !== callbackExpect ) {
					matches.push( elems[ i ] );
				}
			}
	
			return matches;
		},
	
		// arg is for internal usage only
		map: function( elems, callback, arg ) {
			var length, value,
				i = 0,
				ret = [];
	
			// Go through the array, translating each of the items to their new values
			if ( isArrayLike( elems ) ) {
				length = elems.length;
				for ( ; i < length; i++ ) {
					value = callback( elems[ i ], i, arg );
	
					if ( value != null ) {
						ret.push( value );
					}
				}
	
			// Go through every key on the object,
			} else {
				for ( i in elems ) {
					value = callback( elems[ i ], i, arg );
	
					if ( value != null ) {
						ret.push( value );
					}
				}
			}
	
			// Flatten any nested arrays
			return concat.apply( [], ret );
		},
	
		// A global GUID counter for objects
		guid: 1,
	
		// Bind a function to a context, optionally partially applying any
		// arguments.
		proxy: function( fn, context ) {
			var tmp, args, proxy;
	
			if ( typeof context === "string" ) {
				tmp = fn[ context ];
				context = fn;
				fn = tmp;
			}
	
			// Quick check to determine if target is callable, in the spec
			// this throws a TypeError, but we will just return undefined.
			if ( !jQuery.isFunction( fn ) ) {
				return undefined;
			}
	
			// Simulated bind
			args = slice.call( arguments, 2 );
			proxy = function() {
				return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
			};
	
			// Set the guid of unique handler to the same of original handler, so it can be removed
			proxy.guid = fn.guid = fn.guid || jQuery.guid++;
	
			return proxy;
		},
	
		now: Date.now,
	
		// jQuery.support is not used in Core but other projects attach their
		// properties to it so it needs to exist.
		support: support
	} );
	
	// JSHint would error on this code due to the Symbol not being defined in ES5.
	// Defining this global in .jshintrc would create a danger of using the global
	// unguarded in another place, it seems safer to just disable JSHint for these
	// three lines.
	/* jshint ignore: start */
	if ( typeof Symbol === "function" ) {
		jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
	}
	/* jshint ignore: end */
	
	// Populate the class2type map
	jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
	function( i, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );
	
	function isArrayLike( obj ) {
	
		// Support: iOS 8.2 (not reproducible in simulator)
		// `in` check used to prevent JIT error (gh-2145)
		// hasOwn isn't used here due to false negatives
		// regarding Nodelist length in IE
		var length = !!obj && "length" in obj && obj.length,
			type = jQuery.type( obj );
	
		if ( type === "function" || jQuery.isWindow( obj ) ) {
			return false;
		}
	
		return type === "array" || length === 0 ||
			typeof length === "number" && length > 0 && ( length - 1 ) in obj;
	}
	var Sizzle =
	/*!
	 * Sizzle CSS Selector Engine v2.2.1
	 * http://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2015-10-17
	 */
	(function( window ) {
	
	var i,
		support,
		Expr,
		getText,
		isXML,
		tokenize,
		compile,
		select,
		outermostContext,
		sortInput,
		hasDuplicate,
	
		// Local document vars
		setDocument,
		document,
		docElem,
		documentIsHTML,
		rbuggyQSA,
		rbuggyMatches,
		matches,
		contains,
	
		// Instance-specific data
		expando = "sizzle" + 1 * new Date(),
		preferredDoc = window.document,
		dirruns = 0,
		done = 0,
		classCache = createCache(),
		tokenCache = createCache(),
		compilerCache = createCache(),
		sortOrder = function( a, b ) {
			if ( a === b ) {
				hasDuplicate = true;
			}
			return 0;
		},
	
		// General-purpose constants
		MAX_NEGATIVE = 1 << 31,
	
		// Instance methods
		hasOwn = ({}).hasOwnProperty,
		arr = [],
		pop = arr.pop,
		push_native = arr.push,
		push = arr.push,
		slice = arr.slice,
		// Use a stripped-down indexOf as it's faster than native
		// http://jsperf.com/thor-indexof-vs-for/5
		indexOf = function( list, elem ) {
			var i = 0,
				len = list.length;
			for ( ; i < len; i++ ) {
				if ( list[i] === elem ) {
					return i;
				}
			}
			return -1;
		},
	
		booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
	
		// Regular expressions
	
		// http://www.w3.org/TR/css3-selectors/#whitespace
		whitespace = "[\\x20\\t\\r\\n\\f]",
	
		// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
		identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
	
		// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
		attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
			// Operator (capture 2)
			"*([*^$|!~]?=)" + whitespace +
			// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
			"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
			"*\\]",
	
		pseudos = ":(" + identifier + ")(?:\\((" +
			// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
			// 1. quoted (capture 3; capture 4 or capture 5)
			"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
			// 2. simple (capture 6)
			"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
			// 3. anything else (capture 2)
			".*" +
			")\\)|)",
	
		// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
		rwhitespace = new RegExp( whitespace + "+", "g" ),
		rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),
	
		rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
		rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),
	
		rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),
	
		rpseudo = new RegExp( pseudos ),
		ridentifier = new RegExp( "^" + identifier + "$" ),
	
		matchExpr = {
			"ID": new RegExp( "^#(" + identifier + ")" ),
			"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
			"TAG": new RegExp( "^(" + identifier + "|[*])" ),
			"ATTR": new RegExp( "^" + attributes ),
			"PSEUDO": new RegExp( "^" + pseudos ),
			"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
				"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
				"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
			"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
			// For use in libraries implementing .is()
			// We use this for POS matching in `select`
			"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
				whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
		},
	
		rinputs = /^(?:input|select|textarea|button)$/i,
		rheader = /^h\d$/i,
	
		rnative = /^[^{]+\{\s*\[native \w/,
	
		// Easily-parseable/retrievable ID or TAG or CLASS selectors
		rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
	
		rsibling = /[+~]/,
		rescape = /'|\\/g,
	
		// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
		runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
		funescape = function( _, escaped, escapedWhitespace ) {
			var high = "0x" + escaped - 0x10000;
			// NaN means non-codepoint
			// Support: Firefox<24
			// Workaround erroneous numeric interpretation of +"0x"
			return high !== high || escapedWhitespace ?
				escaped :
				high < 0 ?
					// BMP codepoint
					String.fromCharCode( high + 0x10000 ) :
					// Supplemental Plane codepoint (surrogate pair)
					String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
		},
	
		// Used for iframes
		// See setDocument()
		// Removing the function wrapper causes a "Permission Denied"
		// error in IE
		unloadHandler = function() {
			setDocument();
		};
	
	// Optimize for push.apply( _, NodeList )
	try {
		push.apply(
			(arr = slice.call( preferredDoc.childNodes )),
			preferredDoc.childNodes
		);
		// Support: Android<4.0
		// Detect silently failing push.apply
		arr[ preferredDoc.childNodes.length ].nodeType;
	} catch ( e ) {
		push = { apply: arr.length ?
	
			// Leverage slice if possible
			function( target, els ) {
				push_native.apply( target, slice.call(els) );
			} :
	
			// Support: IE<9
			// Otherwise append directly
			function( target, els ) {
				var j = target.length,
					i = 0;
				// Can't trust NodeList.length
				while ( (target[j++] = els[i++]) ) {}
				target.length = j - 1;
			}
		};
	}
	
	function Sizzle( selector, context, results, seed ) {
		var m, i, elem, nid, nidselect, match, groups, newSelector,
			newContext = context && context.ownerDocument,
	
			// nodeType defaults to 9, since context defaults to document
			nodeType = context ? context.nodeType : 9;
	
		results = results || [];
	
		// Return early from calls with invalid selector or context
		if ( typeof selector !== "string" || !selector ||
			nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {
	
			return results;
		}
	
		// Try to shortcut find operations (as opposed to filters) in HTML documents
		if ( !seed ) {
	
			if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
				setDocument( context );
			}
			context = context || document;
	
			if ( documentIsHTML ) {
	
				// If the selector is sufficiently simple, try using a "get*By*" DOM method
				// (excepting DocumentFragment context, where the methods don't exist)
				if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {
	
					// ID selector
					if ( (m = match[1]) ) {
	
						// Document context
						if ( nodeType === 9 ) {
							if ( (elem = context.getElementById( m )) ) {
	
								// Support: IE, Opera, Webkit
								// TODO: identify versions
								// getElementById can match elements by name instead of ID
								if ( elem.id === m ) {
									results.push( elem );
									return results;
								}
							} else {
								return results;
							}
	
						// Element context
						} else {
	
							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( newContext && (elem = newContext.getElementById( m )) &&
								contains( context, elem ) &&
								elem.id === m ) {
	
								results.push( elem );
								return results;
							}
						}
	
					// Type selector
					} else if ( match[2] ) {
						push.apply( results, context.getElementsByTagName( selector ) );
						return results;
	
					// Class selector
					} else if ( (m = match[3]) && support.getElementsByClassName &&
						context.getElementsByClassName ) {
	
						push.apply( results, context.getElementsByClassName( m ) );
						return results;
					}
				}
	
				// Take advantage of querySelectorAll
				if ( support.qsa &&
					!compilerCache[ selector + " " ] &&
					(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
	
					if ( nodeType !== 1 ) {
						newContext = context;
						newSelector = selector;
	
					// qSA looks outside Element context, which is not what we want
					// Thanks to Andrew Dupont for this workaround technique
					// Support: IE <=8
					// Exclude object elements
					} else if ( context.nodeName.toLowerCase() !== "object" ) {
	
						// Capture the context ID, setting it first if necessary
						if ( (nid = context.getAttribute( "id" )) ) {
							nid = nid.replace( rescape, "\\$&" );
						} else {
							context.setAttribute( "id", (nid = expando) );
						}
	
						// Prefix every selector in the list
						groups = tokenize( selector );
						i = groups.length;
						nidselect = ridentifier.test( nid ) ? "#" + nid : "[id='" + nid + "']";
						while ( i-- ) {
							groups[i] = nidselect + " " + toSelector( groups[i] );
						}
						newSelector = groups.join( "," );
	
						// Expand context for sibling selectors
						newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
							context;
					}
	
					if ( newSelector ) {
						try {
							push.apply( results,
								newContext.querySelectorAll( newSelector )
							);
							return results;
						} catch ( qsaError ) {
						} finally {
							if ( nid === expando ) {
								context.removeAttribute( "id" );
							}
						}
					}
				}
			}
		}
	
		// All others
		return select( selector.replace( rtrim, "$1" ), context, results, seed );
	}
	
	/**
	 * Create key-value caches of limited size
	 * @returns {function(string, object)} Returns the Object data after storing it on itself with
	 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
	 *	deleting the oldest entry
	 */
	function createCache() {
		var keys = [];
	
		function cache( key, value ) {
			// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
			if ( keys.push( key + " " ) > Expr.cacheLength ) {
				// Only keep the most recent entries
				delete cache[ keys.shift() ];
			}
			return (cache[ key + " " ] = value);
		}
		return cache;
	}
	
	/**
	 * Mark a function for special use by Sizzle
	 * @param {Function} fn The function to mark
	 */
	function markFunction( fn ) {
		fn[ expando ] = true;
		return fn;
	}
	
	/**
	 * Support testing using an element
	 * @param {Function} fn Passed the created div and expects a boolean result
	 */
	function assert( fn ) {
		var div = document.createElement("div");
	
		try {
			return !!fn( div );
		} catch (e) {
			return false;
		} finally {
			// Remove from its parent by default
			if ( div.parentNode ) {
				div.parentNode.removeChild( div );
			}
			// release memory in IE
			div = null;
		}
	}
	
	/**
	 * Adds the same handler for all of the specified attrs
	 * @param {String} attrs Pipe-separated list of attributes
	 * @param {Function} handler The method that will be applied
	 */
	function addHandle( attrs, handler ) {
		var arr = attrs.split("|"),
			i = arr.length;
	
		while ( i-- ) {
			Expr.attrHandle[ arr[i] ] = handler;
		}
	}
	
	/**
	 * Checks document order of two siblings
	 * @param {Element} a
	 * @param {Element} b
	 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
	 */
	function siblingCheck( a, b ) {
		var cur = b && a,
			diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
				( ~b.sourceIndex || MAX_NEGATIVE ) -
				( ~a.sourceIndex || MAX_NEGATIVE );
	
		// Use IE sourceIndex if available on both nodes
		if ( diff ) {
			return diff;
		}
	
		// Check if b follows a
		if ( cur ) {
			while ( (cur = cur.nextSibling) ) {
				if ( cur === b ) {
					return -1;
				}
			}
		}
	
		return a ? 1 : -1;
	}
	
	/**
	 * Returns a function to use in pseudos for input types
	 * @param {String} type
	 */
	function createInputPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === type;
		};
	}
	
	/**
	 * Returns a function to use in pseudos for buttons
	 * @param {String} type
	 */
	function createButtonPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && elem.type === type;
		};
	}
	
	/**
	 * Returns a function to use in pseudos for positionals
	 * @param {Function} fn
	 */
	function createPositionalPseudo( fn ) {
		return markFunction(function( argument ) {
			argument = +argument;
			return markFunction(function( seed, matches ) {
				var j,
					matchIndexes = fn( [], seed.length, argument ),
					i = matchIndexes.length;
	
				// Match elements found at the specified indexes
				while ( i-- ) {
					if ( seed[ (j = matchIndexes[i]) ] ) {
						seed[j] = !(matches[j] = seed[j]);
					}
				}
			});
		});
	}
	
	/**
	 * Checks a node for validity as a Sizzle context
	 * @param {Element|Object=} context
	 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
	 */
	function testContext( context ) {
		return context && typeof context.getElementsByTagName !== "undefined" && context;
	}
	
	// Expose support vars for convenience
	support = Sizzle.support = {};
	
	/**
	 * Detects XML nodes
	 * @param {Element|Object} elem An element or a document
	 * @returns {Boolean} True iff elem is a non-HTML XML node
	 */
	isXML = Sizzle.isXML = function( elem ) {
		// documentElement is verified for cases where it doesn't yet exist
		// (such as loading iframes in IE - #4833)
		var documentElement = elem && (elem.ownerDocument || elem).documentElement;
		return documentElement ? documentElement.nodeName !== "HTML" : false;
	};
	
	/**
	 * Sets document-related variables once based on the current document
	 * @param {Element|Object} [doc] An element or document object to use to set the document
	 * @returns {Object} Returns the current document
	 */
	setDocument = Sizzle.setDocument = function( node ) {
		var hasCompare, parent,
			doc = node ? node.ownerDocument || node : preferredDoc;
	
		// Return early if doc is invalid or already selected
		if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
			return document;
		}
	
		// Update global variables
		document = doc;
		docElem = document.documentElement;
		documentIsHTML = !isXML( document );
	
		// Support: IE 9-11, Edge
		// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
		if ( (parent = document.defaultView) && parent.top !== parent ) {
			// Support: IE 11
			if ( parent.addEventListener ) {
				parent.addEventListener( "unload", unloadHandler, false );
	
			// Support: IE 9 - 10 only
			} else if ( parent.attachEvent ) {
				parent.attachEvent( "onunload", unloadHandler );
			}
		}
	
		/* Attributes
		---------------------------------------------------------------------- */
	
		// Support: IE<8
		// Verify that getAttribute really returns attributes and not properties
		// (excepting IE8 booleans)
		support.attributes = assert(function( div ) {
			div.className = "i";
			return !div.getAttribute("className");
		});
	
		/* getElement(s)By*
		---------------------------------------------------------------------- */
	
		// Check if getElementsByTagName("*") returns only elements
		support.getElementsByTagName = assert(function( div ) {
			div.appendChild( document.createComment("") );
			return !div.getElementsByTagName("*").length;
		});
	
		// Support: IE<9
		support.getElementsByClassName = rnative.test( document.getElementsByClassName );
	
		// Support: IE<10
		// Check if getElementById returns elements by name
		// The broken getElementById methods don't pick up programatically-set names,
		// so use a roundabout getElementsByName test
		support.getById = assert(function( div ) {
			docElem.appendChild( div ).id = expando;
			return !document.getElementsByName || !document.getElementsByName( expando ).length;
		});
	
		// ID find and filter
		if ( support.getById ) {
			Expr.find["ID"] = function( id, context ) {
				if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
					var m = context.getElementById( id );
					return m ? [ m ] : [];
				}
			};
			Expr.filter["ID"] = function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					return elem.getAttribute("id") === attrId;
				};
			};
		} else {
			// Support: IE6/7
			// getElementById is not reliable as a find shortcut
			delete Expr.find["ID"];
	
			Expr.filter["ID"] =  function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== "undefined" &&
						elem.getAttributeNode("id");
					return node && node.value === attrId;
				};
			};
		}
	
		// Tag
		Expr.find["TAG"] = support.getElementsByTagName ?
			function( tag, context ) {
				if ( typeof context.getElementsByTagName !== "undefined" ) {
					return context.getElementsByTagName( tag );
	
				// DocumentFragment nodes don't have gEBTN
				} else if ( support.qsa ) {
					return context.querySelectorAll( tag );
				}
			} :
	
			function( tag, context ) {
				var elem,
					tmp = [],
					i = 0,
					// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
					results = context.getElementsByTagName( tag );
	
				// Filter out possible comments
				if ( tag === "*" ) {
					while ( (elem = results[i++]) ) {
						if ( elem.nodeType === 1 ) {
							tmp.push( elem );
						}
					}
	
					return tmp;
				}
				return results;
			};
	
		// Class
		Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
			if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
				return context.getElementsByClassName( className );
			}
		};
	
		/* QSA/matchesSelector
		---------------------------------------------------------------------- */
	
		// QSA and matchesSelector support
	
		// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
		rbuggyMatches = [];
	
		// qSa(:focus) reports false when true (Chrome 21)
		// We allow this because of a bug in IE8/9 that throws an error
		// whenever `document.activeElement` is accessed on an iframe
		// So, we allow :focus to pass through QSA all the time to avoid the IE error
		// See http://bugs.jquery.com/ticket/13378
		rbuggyQSA = [];
	
		if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
			// Build QSA regex
			// Regex strategy adopted from Diego Perini
			assert(function( div ) {
				// Select is set to empty string on purpose
				// This is to test IE's treatment of not explicitly
				// setting a boolean content attribute,
				// since its presence should be enough
				// http://bugs.jquery.com/ticket/12359
				docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
					"<select id='" + expando + "-\r\\' msallowcapture=''>" +
					"<option selected=''></option></select>";
	
				// Support: IE8, Opera 11-12.16
				// Nothing should be selected when empty strings follow ^= or $= or *=
				// The test attribute must be unknown in Opera but "safe" for WinRT
				// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
				if ( div.querySelectorAll("[msallowcapture^='']").length ) {
					rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
				}
	
				// Support: IE8
				// Boolean attributes and "value" are not treated correctly
				if ( !div.querySelectorAll("[selected]").length ) {
					rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
				}
	
				// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
				if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
					rbuggyQSA.push("~=");
				}
	
				// Webkit/Opera - :checked should return selected option elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				// IE8 throws error here and will not see later tests
				if ( !div.querySelectorAll(":checked").length ) {
					rbuggyQSA.push(":checked");
				}
	
				// Support: Safari 8+, iOS 8+
				// https://bugs.webkit.org/show_bug.cgi?id=136851
				// In-page `selector#id sibing-combinator selector` fails
				if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
					rbuggyQSA.push(".#.+[+~]");
				}
			});
	
			assert(function( div ) {
				// Support: Windows 8 Native Apps
				// The type and name attributes are restricted during .innerHTML assignment
				var input = document.createElement("input");
				input.setAttribute( "type", "hidden" );
				div.appendChild( input ).setAttribute( "name", "D" );
	
				// Support: IE8
				// Enforce case-sensitivity of name attribute
				if ( div.querySelectorAll("[name=d]").length ) {
					rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
				}
	
				// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
				// IE8 throws error here and will not see later tests
				if ( !div.querySelectorAll(":enabled").length ) {
					rbuggyQSA.push( ":enabled", ":disabled" );
				}
	
				// Opera 10-11 does not throw on post-comma invalid pseudos
				div.querySelectorAll("*,:x");
				rbuggyQSA.push(",.*:");
			});
		}
	
		if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
			docElem.webkitMatchesSelector ||
			docElem.mozMatchesSelector ||
			docElem.oMatchesSelector ||
			docElem.msMatchesSelector) )) ) {
	
			assert(function( div ) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				support.disconnectedMatch = matches.call( div, "div" );
	
				// This should fail with an exception
				// Gecko does not error, returns false instead
				matches.call( div, "[s!='']:x" );
				rbuggyMatches.push( "!=", pseudos );
			});
		}
	
		rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
		rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );
	
		/* Contains
		---------------------------------------------------------------------- */
		hasCompare = rnative.test( docElem.compareDocumentPosition );
	
		// Element contains another
		// Purposefully self-exclusive
		// As in, an element does not contain itself
		contains = hasCompare || rnative.test( docElem.contains ) ?
			function( a, b ) {
				var adown = a.nodeType === 9 ? a.documentElement : a,
					bup = b && b.parentNode;
				return a === bup || !!( bup && bup.nodeType === 1 && (
					adown.contains ?
						adown.contains( bup ) :
						a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
				));
			} :
			function( a, b ) {
				if ( b ) {
					while ( (b = b.parentNode) ) {
						if ( b === a ) {
							return true;
						}
					}
				}
				return false;
			};
	
		/* Sorting
		---------------------------------------------------------------------- */
	
		// Document order sorting
		sortOrder = hasCompare ?
		function( a, b ) {
	
			// Flag for duplicate removal
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}
	
			// Sort on method existence if only one input has compareDocumentPosition
			var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
			if ( compare ) {
				return compare;
			}
	
			// Calculate position if both inputs belong to the same document
			compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
				a.compareDocumentPosition( b ) :
	
				// Otherwise we know they are disconnected
				1;
	
			// Disconnected nodes
			if ( compare & 1 ||
				(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {
	
				// Choose the first element that is related to our preferred document
				if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
					return -1;
				}
				if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
					return 1;
				}
	
				// Maintain original order
				return sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;
			}
	
			return compare & 4 ? -1 : 1;
		} :
		function( a, b ) {
			// Exit early if the nodes are identical
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}
	
			var cur,
				i = 0,
				aup = a.parentNode,
				bup = b.parentNode,
				ap = [ a ],
				bp = [ b ];
	
			// Parentless nodes are either documents or disconnected
			if ( !aup || !bup ) {
				return a === document ? -1 :
					b === document ? 1 :
					aup ? -1 :
					bup ? 1 :
					sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;
	
			// If the nodes are siblings, we can do a quick check
			} else if ( aup === bup ) {
				return siblingCheck( a, b );
			}
	
			// Otherwise we need full lists of their ancestors for comparison
			cur = a;
			while ( (cur = cur.parentNode) ) {
				ap.unshift( cur );
			}
			cur = b;
			while ( (cur = cur.parentNode) ) {
				bp.unshift( cur );
			}
	
			// Walk down the tree looking for a discrepancy
			while ( ap[i] === bp[i] ) {
				i++;
			}
	
			return i ?
				// Do a sibling check if the nodes have a common ancestor
				siblingCheck( ap[i], bp[i] ) :
	
				// Otherwise nodes in our document sort first
				ap[i] === preferredDoc ? -1 :
				bp[i] === preferredDoc ? 1 :
				0;
		};
	
		return document;
	};
	
	Sizzle.matches = function( expr, elements ) {
		return Sizzle( expr, null, null, elements );
	};
	
	Sizzle.matchesSelector = function( elem, expr ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}
	
		// Make sure that attribute selectors are quoted
		expr = expr.replace( rattributeQuotes, "='$1']" );
	
		if ( support.matchesSelector && documentIsHTML &&
			!compilerCache[ expr + " " ] &&
			( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
			( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {
	
			try {
				var ret = matches.call( elem, expr );
	
				// IE 9's matchesSelector returns false on disconnected nodes
				if ( ret || support.disconnectedMatch ||
						// As well, disconnected nodes are said to be in a document
						// fragment in IE 9
						elem.document && elem.document.nodeType !== 11 ) {
					return ret;
				}
			} catch (e) {}
		}
	
		return Sizzle( expr, document, null, [ elem ] ).length > 0;
	};
	
	Sizzle.contains = function( context, elem ) {
		// Set document vars if needed
		if ( ( context.ownerDocument || context ) !== document ) {
			setDocument( context );
		}
		return contains( context, elem );
	};
	
	Sizzle.attr = function( elem, name ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}
	
		var fn = Expr.attrHandle[ name.toLowerCase() ],
			// Don't get fooled by Object.prototype properties (jQuery #13807)
			val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
				fn( elem, name, !documentIsHTML ) :
				undefined;
	
		return val !== undefined ?
			val :
			support.attributes || !documentIsHTML ?
				elem.getAttribute( name ) :
				(val = elem.getAttributeNode(name)) && val.specified ?
					val.value :
					null;
	};
	
	Sizzle.error = function( msg ) {
		throw new Error( "Syntax error, unrecognized expression: " + msg );
	};
	
	/**
	 * Document sorting and removing duplicates
	 * @param {ArrayLike} results
	 */
	Sizzle.uniqueSort = function( results ) {
		var elem,
			duplicates = [],
			j = 0,
			i = 0;
	
		// Unless we *know* we can detect duplicates, assume their presence
		hasDuplicate = !support.detectDuplicates;
		sortInput = !support.sortStable && results.slice( 0 );
		results.sort( sortOrder );
	
		if ( hasDuplicate ) {
			while ( (elem = results[i++]) ) {
				if ( elem === results[ i ] ) {
					j = duplicates.push( i );
				}
			}
			while ( j-- ) {
				results.splice( duplicates[ j ], 1 );
			}
		}
	
		// Clear input after sorting to release objects
		// See https://github.com/jquery/sizzle/pull/225
		sortInput = null;
	
		return results;
	};
	
	/**
	 * Utility function for retrieving the text value of an array of DOM nodes
	 * @param {Array|Element} elem
	 */
	getText = Sizzle.getText = function( elem ) {
		var node,
			ret = "",
			i = 0,
			nodeType = elem.nodeType;
	
		if ( !nodeType ) {
			// If no nodeType, this is expected to be an array
			while ( (node = elem[i++]) ) {
				// Do not traverse comment nodes
				ret += getText( node );
			}
		} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (jQuery #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse its children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
		// Do not include comment or processing instruction nodes
	
		return ret;
	};
	
	Expr = Sizzle.selectors = {
	
		// Can be adjusted by the user
		cacheLength: 50,
	
		createPseudo: markFunction,
	
		match: matchExpr,
	
		attrHandle: {},
	
		find: {},
	
		relative: {
			">": { dir: "parentNode", first: true },
			" ": { dir: "parentNode" },
			"+": { dir: "previousSibling", first: true },
			"~": { dir: "previousSibling" }
		},
	
		preFilter: {
			"ATTR": function( match ) {
				match[1] = match[1].replace( runescape, funescape );
	
				// Move the given value to match[3] whether quoted or unquoted
				match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );
	
				if ( match[2] === "~=" ) {
					match[3] = " " + match[3] + " ";
				}
	
				return match.slice( 0, 4 );
			},
	
			"CHILD": function( match ) {
				/* matches from matchExpr["CHILD"]
					1 type (only|nth|...)
					2 what (child|of-type)
					3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
					4 xn-component of xn+y argument ([+-]?\d*n|)
					5 sign of xn-component
					6 x of xn-component
					7 sign of y-component
					8 y of y-component
				*/
				match[1] = match[1].toLowerCase();
	
				if ( match[1].slice( 0, 3 ) === "nth" ) {
					// nth-* requires argument
					if ( !match[3] ) {
						Sizzle.error( match[0] );
					}
	
					// numeric x and y parameters for Expr.filter.CHILD
					// remember that false/true cast respectively to 0/1
					match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
					match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );
	
				// other types prohibit arguments
				} else if ( match[3] ) {
					Sizzle.error( match[0] );
				}
	
				return match;
			},
	
			"PSEUDO": function( match ) {
				var excess,
					unquoted = !match[6] && match[2];
	
				if ( matchExpr["CHILD"].test( match[0] ) ) {
					return null;
				}
	
				// Accept quoted arguments as-is
				if ( match[3] ) {
					match[2] = match[4] || match[5] || "";
	
				// Strip excess characters from unquoted arguments
				} else if ( unquoted && rpseudo.test( unquoted ) &&
					// Get excess from tokenize (recursively)
					(excess = tokenize( unquoted, true )) &&
					// advance to the next closing parenthesis
					(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {
	
					// excess is a negative index
					match[0] = match[0].slice( 0, excess );
					match[2] = unquoted.slice( 0, excess );
				}
	
				// Return only captures needed by the pseudo filter method (type and argument)
				return match.slice( 0, 3 );
			}
		},
	
		filter: {
	
			"TAG": function( nodeNameSelector ) {
				var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
				return nodeNameSelector === "*" ?
					function() { return true; } :
					function( elem ) {
						return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
					};
			},
	
			"CLASS": function( className ) {
				var pattern = classCache[ className + " " ];
	
				return pattern ||
					(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
					classCache( className, function( elem ) {
						return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
					});
			},
	
			"ATTR": function( name, operator, check ) {
				return function( elem ) {
					var result = Sizzle.attr( elem, name );
	
					if ( result == null ) {
						return operator === "!=";
					}
					if ( !operator ) {
						return true;
					}
	
					result += "";
	
					return operator === "=" ? result === check :
						operator === "!=" ? result !== check :
						operator === "^=" ? check && result.indexOf( check ) === 0 :
						operator === "*=" ? check && result.indexOf( check ) > -1 :
						operator === "$=" ? check && result.slice( -check.length ) === check :
						operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
						operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
						false;
				};
			},
	
			"CHILD": function( type, what, argument, first, last ) {
				var simple = type.slice( 0, 3 ) !== "nth",
					forward = type.slice( -4 ) !== "last",
					ofType = what === "of-type";
	
				return first === 1 && last === 0 ?
	
					// Shortcut for :nth-*(n)
					function( elem ) {
						return !!elem.parentNode;
					} :
	
					function( elem, context, xml ) {
						var cache, uniqueCache, outerCache, node, nodeIndex, start,
							dir = simple !== forward ? "nextSibling" : "previousSibling",
							parent = elem.parentNode,
							name = ofType && elem.nodeName.toLowerCase(),
							useCache = !xml && !ofType,
							diff = false;
	
						if ( parent ) {
	
							// :(first|last|only)-(child|of-type)
							if ( simple ) {
								while ( dir ) {
									node = elem;
									while ( (node = node[ dir ]) ) {
										if ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) {
	
											return false;
										}
									}
									// Reverse direction for :only-* (if we haven't yet done so)
									start = dir = type === "only" && !start && "nextSibling";
								}
								return true;
							}
	
							start = [ forward ? parent.firstChild : parent.lastChild ];
	
							// non-xml :nth-child(...) stores cache data on `parent`
							if ( forward && useCache ) {
	
								// Seek `elem` from a previously-cached index
	
								// ...in a gzip-friendly way
								node = parent;
								outerCache = node[ expando ] || (node[ expando ] = {});
	
								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});
	
								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex && cache[ 2 ];
								node = nodeIndex && parent.childNodes[ nodeIndex ];
	
								while ( (node = ++nodeIndex && node && node[ dir ] ||
	
									// Fallback to seeking `elem` from the start
									(diff = nodeIndex = 0) || start.pop()) ) {
	
									// When found, cache indexes on `parent` and break
									if ( node.nodeType === 1 && ++diff && node === elem ) {
										uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
										break;
									}
								}
	
							} else {
								// Use previously-cached element index if available
								if ( useCache ) {
									// ...in a gzip-friendly way
									node = elem;
									outerCache = node[ expando ] || (node[ expando ] = {});
	
									// Support: IE <9 only
									// Defend against cloned attroperties (jQuery gh-1709)
									uniqueCache = outerCache[ node.uniqueID ] ||
										(outerCache[ node.uniqueID ] = {});
	
									cache = uniqueCache[ type ] || [];
									nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
									diff = nodeIndex;
								}
	
								// xml :nth-child(...)
								// or :nth-last-child(...) or :nth(-last)?-of-type(...)
								if ( diff === false ) {
									// Use the same loop as above to seek `elem` from the start
									while ( (node = ++nodeIndex && node && node[ dir ] ||
										(diff = nodeIndex = 0) || start.pop()) ) {
	
										if ( ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) &&
											++diff ) {
	
											// Cache the index of each encountered element
											if ( useCache ) {
												outerCache = node[ expando ] || (node[ expando ] = {});
	
												// Support: IE <9 only
												// Defend against cloned attroperties (jQuery gh-1709)
												uniqueCache = outerCache[ node.uniqueID ] ||
													(outerCache[ node.uniqueID ] = {});
	
												uniqueCache[ type ] = [ dirruns, diff ];
											}
	
											if ( node === elem ) {
												break;
											}
										}
									}
								}
							}
	
							// Incorporate the offset, then check against cycle size
							diff -= last;
							return diff === first || ( diff % first === 0 && diff / first >= 0 );
						}
					};
			},
	
			"PSEUDO": function( pseudo, argument ) {
				// pseudo-class names are case-insensitive
				// http://www.w3.org/TR/selectors/#pseudo-classes
				// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
				// Remember that setFilters inherits from pseudos
				var args,
					fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
						Sizzle.error( "unsupported pseudo: " + pseudo );
	
				// The user may use createPseudo to indicate that
				// arguments are needed to create the filter function
				// just as Sizzle does
				if ( fn[ expando ] ) {
					return fn( argument );
				}
	
				// But maintain support for old signatures
				if ( fn.length > 1 ) {
					args = [ pseudo, pseudo, "", argument ];
					return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
						markFunction(function( seed, matches ) {
							var idx,
								matched = fn( seed, argument ),
								i = matched.length;
							while ( i-- ) {
								idx = indexOf( seed, matched[i] );
								seed[ idx ] = !( matches[ idx ] = matched[i] );
							}
						}) :
						function( elem ) {
							return fn( elem, 0, args );
						};
				}
	
				return fn;
			}
		},
	
		pseudos: {
			// Potentially complex pseudos
			"not": markFunction(function( selector ) {
				// Trim the selector passed to compile
				// to avoid treating leading and trailing
				// spaces as combinators
				var input = [],
					results = [],
					matcher = compile( selector.replace( rtrim, "$1" ) );
	
				return matcher[ expando ] ?
					markFunction(function( seed, matches, context, xml ) {
						var elem,
							unmatched = matcher( seed, null, xml, [] ),
							i = seed.length;
	
						// Match elements unmatched by `matcher`
						while ( i-- ) {
							if ( (elem = unmatched[i]) ) {
								seed[i] = !(matches[i] = elem);
							}
						}
					}) :
					function( elem, context, xml ) {
						input[0] = elem;
						matcher( input, null, xml, results );
						// Don't keep the element (issue #299)
						input[0] = null;
						return !results.pop();
					};
			}),
	
			"has": markFunction(function( selector ) {
				return function( elem ) {
					return Sizzle( selector, elem ).length > 0;
				};
			}),
	
			"contains": markFunction(function( text ) {
				text = text.replace( runescape, funescape );
				return function( elem ) {
					return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
				};
			}),
	
			// "Whether an element is represented by a :lang() selector
			// is based solely on the element's language value
			// being equal to the identifier C,
			// or beginning with the identifier C immediately followed by "-".
			// The matching of C against the element's language value is performed case-insensitively.
			// The identifier C does not have to be a valid language name."
			// http://www.w3.org/TR/selectors/#lang-pseudo
			"lang": markFunction( function( lang ) {
				// lang value must be a valid identifier
				if ( !ridentifier.test(lang || "") ) {
					Sizzle.error( "unsupported lang: " + lang );
				}
				lang = lang.replace( runescape, funescape ).toLowerCase();
				return function( elem ) {
					var elemLang;
					do {
						if ( (elemLang = documentIsHTML ?
							elem.lang :
							elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {
	
							elemLang = elemLang.toLowerCase();
							return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
						}
					} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
					return false;
				};
			}),
	
			// Miscellaneous
			"target": function( elem ) {
				var hash = window.location && window.location.hash;
				return hash && hash.slice( 1 ) === elem.id;
			},
	
			"root": function( elem ) {
				return elem === docElem;
			},
	
			"focus": function( elem ) {
				return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
			},
	
			// Boolean properties
			"enabled": function( elem ) {
				return elem.disabled === false;
			},
	
			"disabled": function( elem ) {
				return elem.disabled === true;
			},
	
			"checked": function( elem ) {
				// In CSS3, :checked should return both checked and selected elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				var nodeName = elem.nodeName.toLowerCase();
				return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
			},
	
			"selected": function( elem ) {
				// Accessing this property makes selected-by-default
				// options in Safari work properly
				if ( elem.parentNode ) {
					elem.parentNode.selectedIndex;
				}
	
				return elem.selected === true;
			},
	
			// Contents
			"empty": function( elem ) {
				// http://www.w3.org/TR/selectors/#empty-pseudo
				// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
				//   but not by others (comment: 8; processing instruction: 7; etc.)
				// nodeType < 6 works because attributes (2) do not appear as children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					if ( elem.nodeType < 6 ) {
						return false;
					}
				}
				return true;
			},
	
			"parent": function( elem ) {
				return !Expr.pseudos["empty"]( elem );
			},
	
			// Element/input types
			"header": function( elem ) {
				return rheader.test( elem.nodeName );
			},
	
			"input": function( elem ) {
				return rinputs.test( elem.nodeName );
			},
	
			"button": function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && elem.type === "button" || name === "button";
			},
	
			"text": function( elem ) {
				var attr;
				return elem.nodeName.toLowerCase() === "input" &&
					elem.type === "text" &&
	
					// Support: IE<8
					// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
					( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
			},
	
			// Position-in-collection
			"first": createPositionalPseudo(function() {
				return [ 0 ];
			}),
	
			"last": createPositionalPseudo(function( matchIndexes, length ) {
				return [ length - 1 ];
			}),
	
			"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
				return [ argument < 0 ? argument + length : argument ];
			}),
	
			"even": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 0;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),
	
			"odd": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 1;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),
	
			"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; --i >= 0; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),
	
			"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; ++i < length; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			})
		}
	};
	
	Expr.pseudos["nth"] = Expr.pseudos["eq"];
	
	// Add button/input type pseudos
	for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
		Expr.pseudos[ i ] = createInputPseudo( i );
	}
	for ( i in { submit: true, reset: true } ) {
		Expr.pseudos[ i ] = createButtonPseudo( i );
	}
	
	// Easy API for creating new setFilters
	function setFilters() {}
	setFilters.prototype = Expr.filters = Expr.pseudos;
	Expr.setFilters = new setFilters();
	
	tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
		var matched, match, tokens, type,
			soFar, groups, preFilters,
			cached = tokenCache[ selector + " " ];
	
		if ( cached ) {
			return parseOnly ? 0 : cached.slice( 0 );
		}
	
		soFar = selector;
		groups = [];
		preFilters = Expr.preFilter;
	
		while ( soFar ) {
	
			// Comma and first run
			if ( !matched || (match = rcomma.exec( soFar )) ) {
				if ( match ) {
					// Don't consume trailing commas as valid
					soFar = soFar.slice( match[0].length ) || soFar;
				}
				groups.push( (tokens = []) );
			}
	
			matched = false;
	
			// Combinators
			if ( (match = rcombinators.exec( soFar )) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					// Cast descendant combinators to space
					type: match[0].replace( rtrim, " " )
				});
				soFar = soFar.slice( matched.length );
			}
	
			// Filters
			for ( type in Expr.filter ) {
				if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
					(match = preFilters[ type ]( match ))) ) {
					matched = match.shift();
					tokens.push({
						value: matched,
						type: type,
						matches: match
					});
					soFar = soFar.slice( matched.length );
				}
			}
	
			if ( !matched ) {
				break;
			}
		}
	
		// Return the length of the invalid excess
		// if we're just parsing
		// Otherwise, throw an error or return tokens
		return parseOnly ?
			soFar.length :
			soFar ?
				Sizzle.error( selector ) :
				// Cache the tokens
				tokenCache( selector, groups ).slice( 0 );
	};
	
	function toSelector( tokens ) {
		var i = 0,
			len = tokens.length,
			selector = "";
		for ( ; i < len; i++ ) {
			selector += tokens[i].value;
		}
		return selector;
	}
	
	function addCombinator( matcher, combinator, base ) {
		var dir = combinator.dir,
			checkNonElements = base && dir === "parentNode",
			doneName = done++;
	
		return combinator.first ?
			// Check against closest ancestor/preceding element
			function( elem, context, xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						return matcher( elem, context, xml );
					}
				}
			} :
	
			// Check against all ancestor/preceding elements
			function( elem, context, xml ) {
				var oldCache, uniqueCache, outerCache,
					newCache = [ dirruns, doneName ];
	
				// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
				if ( xml ) {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							if ( matcher( elem, context, xml ) ) {
								return true;
							}
						}
					}
				} else {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							outerCache = elem[ expando ] || (elem[ expando ] = {});
	
							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});
	
							if ( (oldCache = uniqueCache[ dir ]) &&
								oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {
	
								// Assign to newCache so results back-propagate to previous elements
								return (newCache[ 2 ] = oldCache[ 2 ]);
							} else {
								// Reuse newcache so results back-propagate to previous elements
								uniqueCache[ dir ] = newCache;
	
								// A match means we're done; a fail means we have to keep checking
								if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
									return true;
								}
							}
						}
					}
				}
			};
	}
	
	function elementMatcher( matchers ) {
		return matchers.length > 1 ?
			function( elem, context, xml ) {
				var i = matchers.length;
				while ( i-- ) {
					if ( !matchers[i]( elem, context, xml ) ) {
						return false;
					}
				}
				return true;
			} :
			matchers[0];
	}
	
	function multipleContexts( selector, contexts, results ) {
		var i = 0,
			len = contexts.length;
		for ( ; i < len; i++ ) {
			Sizzle( selector, contexts[i], results );
		}
		return results;
	}
	
	function condense( unmatched, map, filter, context, xml ) {
		var elem,
			newUnmatched = [],
			i = 0,
			len = unmatched.length,
			mapped = map != null;
	
		for ( ; i < len; i++ ) {
			if ( (elem = unmatched[i]) ) {
				if ( !filter || filter( elem, context, xml ) ) {
					newUnmatched.push( elem );
					if ( mapped ) {
						map.push( i );
					}
				}
			}
		}
	
		return newUnmatched;
	}
	
	function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
		if ( postFilter && !postFilter[ expando ] ) {
			postFilter = setMatcher( postFilter );
		}
		if ( postFinder && !postFinder[ expando ] ) {
			postFinder = setMatcher( postFinder, postSelector );
		}
		return markFunction(function( seed, results, context, xml ) {
			var temp, i, elem,
				preMap = [],
				postMap = [],
				preexisting = results.length,
	
				// Get initial elements from seed or context
				elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),
	
				// Prefilter to get matcher input, preserving a map for seed-results synchronization
				matcherIn = preFilter && ( seed || !selector ) ?
					condense( elems, preMap, preFilter, context, xml ) :
					elems,
	
				matcherOut = matcher ?
					// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
					postFinder || ( seed ? preFilter : preexisting || postFilter ) ?
	
						// ...intermediate processing is necessary
						[] :
	
						// ...otherwise use results directly
						results :
					matcherIn;
	
			// Find primary matches
			if ( matcher ) {
				matcher( matcherIn, matcherOut, context, xml );
			}
	
			// Apply postFilter
			if ( postFilter ) {
				temp = condense( matcherOut, postMap );
				postFilter( temp, [], context, xml );
	
				// Un-match failing elements by moving them back to matcherIn
				i = temp.length;
				while ( i-- ) {
					if ( (elem = temp[i]) ) {
						matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
					}
				}
			}
	
			if ( seed ) {
				if ( postFinder || preFilter ) {
					if ( postFinder ) {
						// Get the final matcherOut by condensing this intermediate into postFinder contexts
						temp = [];
						i = matcherOut.length;
						while ( i-- ) {
							if ( (elem = matcherOut[i]) ) {
								// Restore matcherIn since elem is not yet a final match
								temp.push( (matcherIn[i] = elem) );
							}
						}
						postFinder( null, (matcherOut = []), temp, xml );
					}
	
					// Move matched elements from seed to results to keep them synchronized
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) &&
							(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {
	
							seed[temp] = !(results[temp] = elem);
						}
					}
				}
	
			// Add elements to results, through postFinder if defined
			} else {
				matcherOut = condense(
					matcherOut === results ?
						matcherOut.splice( preexisting, matcherOut.length ) :
						matcherOut
				);
				if ( postFinder ) {
					postFinder( null, results, matcherOut, xml );
				} else {
					push.apply( results, matcherOut );
				}
			}
		});
	}
	
	function matcherFromTokens( tokens ) {
		var checkContext, matcher, j,
			len = tokens.length,
			leadingRelative = Expr.relative[ tokens[0].type ],
			implicitRelative = leadingRelative || Expr.relative[" "],
			i = leadingRelative ? 1 : 0,
	
			// The foundational matcher ensures that elements are reachable from top-level context(s)
			matchContext = addCombinator( function( elem ) {
				return elem === checkContext;
			}, implicitRelative, true ),
			matchAnyContext = addCombinator( function( elem ) {
				return indexOf( checkContext, elem ) > -1;
			}, implicitRelative, true ),
			matchers = [ function( elem, context, xml ) {
				var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
					(checkContext = context).nodeType ?
						matchContext( elem, context, xml ) :
						matchAnyContext( elem, context, xml ) );
				// Avoid hanging onto element (issue #299)
				checkContext = null;
				return ret;
			} ];
	
		for ( ; i < len; i++ ) {
			if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
				matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
			} else {
				matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );
	
				// Return special upon seeing a positional matcher
				if ( matcher[ expando ] ) {
					// Find the next relative operator (if any) for proper handling
					j = ++i;
					for ( ; j < len; j++ ) {
						if ( Expr.relative[ tokens[j].type ] ) {
							break;
						}
					}
					return setMatcher(
						i > 1 && elementMatcher( matchers ),
						i > 1 && toSelector(
							// If the preceding token was a descendant combinator, insert an implicit any-element `*`
							tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
						).replace( rtrim, "$1" ),
						matcher,
						i < j && matcherFromTokens( tokens.slice( i, j ) ),
						j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
						j < len && toSelector( tokens )
					);
				}
				matchers.push( matcher );
			}
		}
	
		return elementMatcher( matchers );
	}
	
	function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
		var bySet = setMatchers.length > 0,
			byElement = elementMatchers.length > 0,
			superMatcher = function( seed, context, xml, results, outermost ) {
				var elem, j, matcher,
					matchedCount = 0,
					i = "0",
					unmatched = seed && [],
					setMatched = [],
					contextBackup = outermostContext,
					// We must always have either seed elements or outermost context
					elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
					// Use integer dirruns iff this is the outermost matcher
					dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
					len = elems.length;
	
				if ( outermost ) {
					outermostContext = context === document || context || outermost;
				}
	
				// Add elements passing elementMatchers directly to results
				// Support: IE<9, Safari
				// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
				for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
					if ( byElement && elem ) {
						j = 0;
						if ( !context && elem.ownerDocument !== document ) {
							setDocument( elem );
							xml = !documentIsHTML;
						}
						while ( (matcher = elementMatchers[j++]) ) {
							if ( matcher( elem, context || document, xml) ) {
								results.push( elem );
								break;
							}
						}
						if ( outermost ) {
							dirruns = dirrunsUnique;
						}
					}
	
					// Track unmatched elements for set filters
					if ( bySet ) {
						// They will have gone through all possible matchers
						if ( (elem = !matcher && elem) ) {
							matchedCount--;
						}
	
						// Lengthen the array for every element, matched or not
						if ( seed ) {
							unmatched.push( elem );
						}
					}
				}
	
				// `i` is now the count of elements visited above, and adding it to `matchedCount`
				// makes the latter nonnegative.
				matchedCount += i;
	
				// Apply set filters to unmatched elements
				// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
				// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
				// no element matchers and no seed.
				// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
				// case, which will result in a "00" `matchedCount` that differs from `i` but is also
				// numerically zero.
				if ( bySet && i !== matchedCount ) {
					j = 0;
					while ( (matcher = setMatchers[j++]) ) {
						matcher( unmatched, setMatched, context, xml );
					}
	
					if ( seed ) {
						// Reintegrate element matches to eliminate the need for sorting
						if ( matchedCount > 0 ) {
							while ( i-- ) {
								if ( !(unmatched[i] || setMatched[i]) ) {
									setMatched[i] = pop.call( results );
								}
							}
						}
	
						// Discard index placeholder values to get only actual matches
						setMatched = condense( setMatched );
					}
	
					// Add matches to results
					push.apply( results, setMatched );
	
					// Seedless set matches succeeding multiple successful matchers stipulate sorting
					if ( outermost && !seed && setMatched.length > 0 &&
						( matchedCount + setMatchers.length ) > 1 ) {
	
						Sizzle.uniqueSort( results );
					}
				}
	
				// Override manipulation of globals by nested matchers
				if ( outermost ) {
					dirruns = dirrunsUnique;
					outermostContext = contextBackup;
				}
	
				return unmatched;
			};
	
		return bySet ?
			markFunction( superMatcher ) :
			superMatcher;
	}
	
	compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
		var i,
			setMatchers = [],
			elementMatchers = [],
			cached = compilerCache[ selector + " " ];
	
		if ( !cached ) {
			// Generate a function of recursive functions that can be used to check each element
			if ( !match ) {
				match = tokenize( selector );
			}
			i = match.length;
			while ( i-- ) {
				cached = matcherFromTokens( match[i] );
				if ( cached[ expando ] ) {
					setMatchers.push( cached );
				} else {
					elementMatchers.push( cached );
				}
			}
	
			// Cache the compiled function
			cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	
			// Save selector and tokenization
			cached.selector = selector;
		}
		return cached;
	};
	
	/**
	 * A low-level selection function that works with Sizzle's compiled
	 *  selector functions
	 * @param {String|Function} selector A selector or a pre-compiled
	 *  selector function built with Sizzle.compile
	 * @param {Element} context
	 * @param {Array} [results]
	 * @param {Array} [seed] A set of elements to match against
	 */
	select = Sizzle.select = function( selector, context, results, seed ) {
		var i, tokens, token, type, find,
			compiled = typeof selector === "function" && selector,
			match = !seed && tokenize( (selector = compiled.selector || selector) );
	
		results = results || [];
	
		// Try to minimize operations if there is only one selector in the list and no seed
		// (the latter of which guarantees us context)
		if ( match.length === 1 ) {
	
			// Reduce context if the leading compound selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					support.getById && context.nodeType === 9 && documentIsHTML &&
					Expr.relative[ tokens[1].type ] ) {
	
				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
				if ( !context ) {
					return results;
	
				// Precompiled matchers will still verify ancestry, so step up a level
				} else if ( compiled ) {
					context = context.parentNode;
				}
	
				selector = selector.slice( tokens.shift().value.length );
			}
	
			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];
	
				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
					)) ) {
	
						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}
	
						break;
					}
				}
			}
		}
	
		// Compile and execute a filtering function if one is not provided
		// Provide `match` to avoid retokenization if we modified the selector above
		( compiled || compile( selector, match ) )(
			seed,
			context,
			!documentIsHTML,
			results,
			!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
		);
		return results;
	};
	
	// One-time assignments
	
	// Sort stability
	support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;
	
	// Support: Chrome 14-35+
	// Always assume duplicates if they aren't passed to the comparison function
	support.detectDuplicates = !!hasDuplicate;
	
	// Initialize against the default document
	setDocument();
	
	// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
	// Detached nodes confoundingly follow *each other*
	support.sortDetached = assert(function( div1 ) {
		// Should return 1, but returns 4 (following)
		return div1.compareDocumentPosition( document.createElement("div") ) & 1;
	});
	
	// Support: IE<8
	// Prevent attribute/property "interpolation"
	// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
	if ( !assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild.getAttribute("href") === "#" ;
	}) ) {
		addHandle( "type|href|height|width", function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
			}
		});
	}
	
	// Support: IE<9
	// Use defaultValue in place of getAttribute("value")
	if ( !support.attributes || !assert(function( div ) {
		div.innerHTML = "<input/>";
		div.firstChild.setAttribute( "value", "" );
		return div.firstChild.getAttribute( "value" ) === "";
	}) ) {
		addHandle( "value", function( elem, name, isXML ) {
			if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
				return elem.defaultValue;
			}
		});
	}
	
	// Support: IE<9
	// Use getAttributeNode to fetch booleans when getAttribute lies
	if ( !assert(function( div ) {
		return div.getAttribute("disabled") == null;
	}) ) {
		addHandle( booleans, function( elem, name, isXML ) {
			var val;
			if ( !isXML ) {
				return elem[ name ] === true ? name.toLowerCase() :
						(val = elem.getAttributeNode( name )) && val.specified ?
						val.value :
					null;
			}
		});
	}
	
	return Sizzle;
	
	})( window );
	
	
	
	jQuery.find = Sizzle;
	jQuery.expr = Sizzle.selectors;
	jQuery.expr[ ":" ] = jQuery.expr.pseudos;
	jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
	jQuery.text = Sizzle.getText;
	jQuery.isXMLDoc = Sizzle.isXML;
	jQuery.contains = Sizzle.contains;
	
	
	
	var dir = function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;
	
		while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	};
	
	
	var siblings = function( n, elem ) {
		var matched = [];
	
		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}
	
		return matched;
	};
	
	
	var rneedsContext = jQuery.expr.match.needsContext;
	
	var rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );
	
	
	
	var risSimple = /^.[^:#\[\.,]*$/;
	
	// Implement the identical functionality for filter and not
	function winnow( elements, qualifier, not ) {
		if ( jQuery.isFunction( qualifier ) ) {
			return jQuery.grep( elements, function( elem, i ) {
				/* jshint -W018 */
				return !!qualifier.call( elem, i, elem ) !== not;
			} );
	
		}
	
		if ( qualifier.nodeType ) {
			return jQuery.grep( elements, function( elem ) {
				return ( elem === qualifier ) !== not;
			} );
	
		}
	
		if ( typeof qualifier === "string" ) {
			if ( risSimple.test( qualifier ) ) {
				return jQuery.filter( qualifier, elements, not );
			}
	
			qualifier = jQuery.filter( qualifier, elements );
		}
	
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}
	
	jQuery.filter = function( expr, elems, not ) {
		var elem = elems[ 0 ];
	
		if ( not ) {
			expr = ":not(" + expr + ")";
		}
	
		return elems.length === 1 && elem.nodeType === 1 ?
			jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
			jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
				return elem.nodeType === 1;
			} ) );
	};
	
	jQuery.fn.extend( {
		find: function( selector ) {
			var i,
				len = this.length,
				ret = [],
				self = this;
	
			if ( typeof selector !== "string" ) {
				return this.pushStack( jQuery( selector ).filter( function() {
					for ( i = 0; i < len; i++ ) {
						if ( jQuery.contains( self[ i ], this ) ) {
							return true;
						}
					}
				} ) );
			}
	
			for ( i = 0; i < len; i++ ) {
				jQuery.find( selector, self[ i ], ret );
			}
	
			// Needed because $( selector, context ) becomes $( context ).find( selector )
			ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
			ret.selector = this.selector ? this.selector + " " + selector : selector;
			return ret;
		},
		filter: function( selector ) {
			return this.pushStack( winnow( this, selector || [], false ) );
		},
		not: function( selector ) {
			return this.pushStack( winnow( this, selector || [], true ) );
		},
		is: function( selector ) {
			return !!winnow(
				this,
	
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				typeof selector === "string" && rneedsContext.test( selector ) ?
					jQuery( selector ) :
					selector || [],
				false
			).length;
		}
	} );
	
	
	// Initialize a jQuery object
	
	
	// A central reference to the root jQuery(document)
	var rootjQuery,
	
		// A simple way to check for HTML strings
		// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
		// Strict HTML recognition (#11290: must start with <)
		rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
	
		init = jQuery.fn.init = function( selector, context, root ) {
			var match, elem;
	
			// HANDLE: $(""), $(null), $(undefined), $(false)
			if ( !selector ) {
				return this;
			}
	
			// Method init() accepts an alternate rootjQuery
			// so migrate can support jQuery.sub (gh-2101)
			root = root || rootjQuery;
	
			// Handle HTML strings
			if ( typeof selector === "string" ) {
				if ( selector[ 0 ] === "<" &&
					selector[ selector.length - 1 ] === ">" &&
					selector.length >= 3 ) {
	
					// Assume that strings that start and end with <> are HTML and skip the regex check
					match = [ null, selector, null ];
	
				} else {
					match = rquickExpr.exec( selector );
				}
	
				// Match html or make sure no context is specified for #id
				if ( match && ( match[ 1 ] || !context ) ) {
	
					// HANDLE: $(html) -> $(array)
					if ( match[ 1 ] ) {
						context = context instanceof jQuery ? context[ 0 ] : context;
	
						// Option to run scripts is true for back-compat
						// Intentionally let the error be thrown if parseHTML is not present
						jQuery.merge( this, jQuery.parseHTML(
							match[ 1 ],
							context && context.nodeType ? context.ownerDocument || context : document,
							true
						) );
	
						// HANDLE: $(html, props)
						if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
							for ( match in context ) {
	
								// Properties of context are called as methods if possible
								if ( jQuery.isFunction( this[ match ] ) ) {
									this[ match ]( context[ match ] );
	
								// ...and otherwise set as attributes
								} else {
									this.attr( match, context[ match ] );
								}
							}
						}
	
						return this;
	
					// HANDLE: $(#id)
					} else {
						elem = document.getElementById( match[ 2 ] );
	
						// Support: Blackberry 4.6
						// gEBID returns nodes no longer in the document (#6963)
						if ( elem && elem.parentNode ) {
	
							// Inject the element directly into the jQuery object
							this.length = 1;
							this[ 0 ] = elem;
						}
	
						this.context = document;
						this.selector = selector;
						return this;
					}
	
				// HANDLE: $(expr, $(...))
				} else if ( !context || context.jquery ) {
					return ( context || root ).find( selector );
	
				// HANDLE: $(expr, context)
				// (which is just equivalent to: $(context).find(expr)
				} else {
					return this.constructor( context ).find( selector );
				}
	
			// HANDLE: $(DOMElement)
			} else if ( selector.nodeType ) {
				this.context = this[ 0 ] = selector;
				this.length = 1;
				return this;
	
			// HANDLE: $(function)
			// Shortcut for document ready
			} else if ( jQuery.isFunction( selector ) ) {
				return root.ready !== undefined ?
					root.ready( selector ) :
	
					// Execute immediately if ready is not present
					selector( jQuery );
			}
	
			if ( selector.selector !== undefined ) {
				this.selector = selector.selector;
				this.context = selector.context;
			}
	
			return jQuery.makeArray( selector, this );
		};
	
	// Give the init function the jQuery prototype for later instantiation
	init.prototype = jQuery.fn;
	
	// Initialize central reference
	rootjQuery = jQuery( document );
	
	
	var rparentsprev = /^(?:parents|prev(?:Until|All))/,
	
		// Methods guaranteed to produce a unique set when starting from a unique set
		guaranteedUnique = {
			children: true,
			contents: true,
			next: true,
			prev: true
		};
	
	jQuery.fn.extend( {
		has: function( target ) {
			var targets = jQuery( target, this ),
				l = targets.length;
	
			return this.filter( function() {
				var i = 0;
				for ( ; i < l; i++ ) {
					if ( jQuery.contains( this, targets[ i ] ) ) {
						return true;
					}
				}
			} );
		},
	
		closest: function( selectors, context ) {
			var cur,
				i = 0,
				l = this.length,
				matched = [],
				pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
					jQuery( selectors, context || this.context ) :
					0;
	
			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {
	
					// Always skip document fragments
					if ( cur.nodeType < 11 && ( pos ?
						pos.index( cur ) > -1 :
	
						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {
	
						matched.push( cur );
						break;
					}
				}
			}
	
			return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
		},
	
		// Determine the position of an element within the set
		index: function( elem ) {
	
			// No argument, return index in parent
			if ( !elem ) {
				return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
			}
	
			// Index in selector
			if ( typeof elem === "string" ) {
				return indexOf.call( jQuery( elem ), this[ 0 ] );
			}
	
			// Locate the position of the desired element
			return indexOf.call( this,
	
				// If it receives a jQuery object, the first element is used
				elem.jquery ? elem[ 0 ] : elem
			);
		},
	
		add: function( selector, context ) {
			return this.pushStack(
				jQuery.uniqueSort(
					jQuery.merge( this.get(), jQuery( selector, context ) )
				)
			);
		},
	
		addBack: function( selector ) {
			return this.add( selector == null ?
				this.prevObject : this.prevObject.filter( selector )
			);
		}
	} );
	
	function sibling( cur, dir ) {
		while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
		return cur;
	}
	
	jQuery.each( {
		parent: function( elem ) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function( elem ) {
			return dir( elem, "parentNode" );
		},
		parentsUntil: function( elem, i, until ) {
			return dir( elem, "parentNode", until );
		},
		next: function( elem ) {
			return sibling( elem, "nextSibling" );
		},
		prev: function( elem ) {
			return sibling( elem, "previousSibling" );
		},
		nextAll: function( elem ) {
			return dir( elem, "nextSibling" );
		},
		prevAll: function( elem ) {
			return dir( elem, "previousSibling" );
		},
		nextUntil: function( elem, i, until ) {
			return dir( elem, "nextSibling", until );
		},
		prevUntil: function( elem, i, until ) {
			return dir( elem, "previousSibling", until );
		},
		siblings: function( elem ) {
			return siblings( ( elem.parentNode || {} ).firstChild, elem );
		},
		children: function( elem ) {
			return siblings( elem.firstChild );
		},
		contents: function( elem ) {
			return elem.contentDocument || jQuery.merge( [], elem.childNodes );
		}
	}, function( name, fn ) {
		jQuery.fn[ name ] = function( until, selector ) {
			var matched = jQuery.map( this, fn, until );
	
			if ( name.slice( -5 ) !== "Until" ) {
				selector = until;
			}
	
			if ( selector && typeof selector === "string" ) {
				matched = jQuery.filter( selector, matched );
			}
	
			if ( this.length > 1 ) {
	
				// Remove duplicates
				if ( !guaranteedUnique[ name ] ) {
					jQuery.uniqueSort( matched );
				}
	
				// Reverse order for parents* and prev-derivatives
				if ( rparentsprev.test( name ) ) {
					matched.reverse();
				}
			}
	
			return this.pushStack( matched );
		};
	} );
	var rnotwhite = ( /\S+/g );
	
	
	
	// Convert String-formatted options into Object-formatted ones
	function createOptions( options ) {
		var object = {};
		jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
			object[ flag ] = true;
		} );
		return object;
	}
	
	/*
	 * Create a callback list using the following parameters:
	 *
	 *	options: an optional list of space-separated options that will change how
	 *			the callback list behaves or a more traditional option object
	 *
	 * By default a callback list will act like an event callback list and can be
	 * "fired" multiple times.
	 *
	 * Possible options:
	 *
	 *	once:			will ensure the callback list can only be fired once (like a Deferred)
	 *
	 *	memory:			will keep track of previous values and will call any callback added
	 *					after the list has been fired right away with the latest "memorized"
	 *					values (like a Deferred)
	 *
	 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
	 *
	 *	stopOnFalse:	interrupt callings when a callback returns false
	 *
	 */
	jQuery.Callbacks = function( options ) {
	
		// Convert options from String-formatted to Object-formatted if needed
		// (we check in cache first)
		options = typeof options === "string" ?
			createOptions( options ) :
			jQuery.extend( {}, options );
	
		var // Flag to know if list is currently firing
			firing,
	
			// Last fire value for non-forgettable lists
			memory,
	
			// Flag to know if list was already fired
			fired,
	
			// Flag to prevent firing
			locked,
	
			// Actual callback list
			list = [],
	
			// Queue of execution data for repeatable lists
			queue = [],
	
			// Index of currently firing callback (modified by add/remove as needed)
			firingIndex = -1,
	
			// Fire callbacks
			fire = function() {
	
				// Enforce single-firing
				locked = options.once;
	
				// Execute callbacks for all pending executions,
				// respecting firingIndex overrides and runtime changes
				fired = firing = true;
				for ( ; queue.length; firingIndex = -1 ) {
					memory = queue.shift();
					while ( ++firingIndex < list.length ) {
	
						// Run callback and check for early termination
						if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
							options.stopOnFalse ) {
	
							// Jump to end and forget the data so .add doesn't re-fire
							firingIndex = list.length;
							memory = false;
						}
					}
				}
	
				// Forget the data if we're done with it
				if ( !options.memory ) {
					memory = false;
				}
	
				firing = false;
	
				// Clean up if we're done firing for good
				if ( locked ) {
	
					// Keep an empty list if we have data for future add calls
					if ( memory ) {
						list = [];
	
					// Otherwise, this object is spent
					} else {
						list = "";
					}
				}
			},
	
			// Actual Callbacks object
			self = {
	
				// Add a callback or a collection of callbacks to the list
				add: function() {
					if ( list ) {
	
						// If we have memory from a past run, we should fire after adding
						if ( memory && !firing ) {
							firingIndex = list.length - 1;
							queue.push( memory );
						}
	
						( function add( args ) {
							jQuery.each( args, function( _, arg ) {
								if ( jQuery.isFunction( arg ) ) {
									if ( !options.unique || !self.has( arg ) ) {
										list.push( arg );
									}
								} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {
	
									// Inspect recursively
									add( arg );
								}
							} );
						} )( arguments );
	
						if ( memory && !firing ) {
							fire();
						}
					}
					return this;
				},
	
				// Remove a callback from the list
				remove: function() {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
	
							// Handle firing indexes
							if ( index <= firingIndex ) {
								firingIndex--;
							}
						}
					} );
					return this;
				},
	
				// Check if a given callback is in the list.
				// If no argument is given, return whether or not list has callbacks attached.
				has: function( fn ) {
					return fn ?
						jQuery.inArray( fn, list ) > -1 :
						list.length > 0;
				},
	
				// Remove all callbacks from the list
				empty: function() {
					if ( list ) {
						list = [];
					}
					return this;
				},
	
				// Disable .fire and .add
				// Abort any current/pending executions
				// Clear all callbacks and values
				disable: function() {
					locked = queue = [];
					list = memory = "";
					return this;
				},
				disabled: function() {
					return !list;
				},
	
				// Disable .fire
				// Also disable .add unless we have memory (since it would have no effect)
				// Abort any pending executions
				lock: function() {
					locked = queue = [];
					if ( !memory ) {
						list = memory = "";
					}
					return this;
				},
				locked: function() {
					return !!locked;
				},
	
				// Call all callbacks with the given context and arguments
				fireWith: function( context, args ) {
					if ( !locked ) {
						args = args || [];
						args = [ context, args.slice ? args.slice() : args ];
						queue.push( args );
						if ( !firing ) {
							fire();
						}
					}
					return this;
				},
	
				// Call all the callbacks with the given arguments
				fire: function() {
					self.fireWith( this, arguments );
					return this;
				},
	
				// To know if the callbacks have already been called at least once
				fired: function() {
					return !!fired;
				}
			};
	
		return self;
	};
	
	
	jQuery.extend( {
	
		Deferred: function( func ) {
			var tuples = [
	
					// action, add listener, listener list, final state
					[ "resolve", "done", jQuery.Callbacks( "once memory" ), "resolved" ],
					[ "reject", "fail", jQuery.Callbacks( "once memory" ), "rejected" ],
					[ "notify", "progress", jQuery.Callbacks( "memory" ) ]
				],
				state = "pending",
				promise = {
					state: function() {
						return state;
					},
					always: function() {
						deferred.done( arguments ).fail( arguments );
						return this;
					},
					then: function( /* fnDone, fnFail, fnProgress */ ) {
						var fns = arguments;
						return jQuery.Deferred( function( newDefer ) {
							jQuery.each( tuples, function( i, tuple ) {
								var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
	
								// deferred[ done | fail | progress ] for forwarding actions to newDefer
								deferred[ tuple[ 1 ] ]( function() {
									var returned = fn && fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise()
											.progress( newDefer.notify )
											.done( newDefer.resolve )
											.fail( newDefer.reject );
									} else {
										newDefer[ tuple[ 0 ] + "With" ](
											this === promise ? newDefer.promise() : this,
											fn ? [ returned ] : arguments
										);
									}
								} );
							} );
							fns = null;
						} ).promise();
					},
	
					// Get a promise for this deferred
					// If obj is provided, the promise aspect is added to the object
					promise: function( obj ) {
						return obj != null ? jQuery.extend( obj, promise ) : promise;
					}
				},
				deferred = {};
	
			// Keep pipe for back-compat
			promise.pipe = promise.then;
	
			// Add list-specific methods
			jQuery.each( tuples, function( i, tuple ) {
				var list = tuple[ 2 ],
					stateString = tuple[ 3 ];
	
				// promise[ done | fail | progress ] = list.add
				promise[ tuple[ 1 ] ] = list.add;
	
				// Handle state
				if ( stateString ) {
					list.add( function() {
	
						// state = [ resolved | rejected ]
						state = stateString;
	
					// [ reject_list | resolve_list ].disable; progress_list.lock
					}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
				}
	
				// deferred[ resolve | reject | notify ]
				deferred[ tuple[ 0 ] ] = function() {
					deferred[ tuple[ 0 ] + "With" ]( this === deferred ? promise : this, arguments );
					return this;
				};
				deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
			} );
	
			// Make the deferred a promise
			promise.promise( deferred );
	
			// Call given func if any
			if ( func ) {
				func.call( deferred, deferred );
			}
	
			// All done!
			return deferred;
		},
	
		// Deferred helper
		when: function( subordinate /* , ..., subordinateN */ ) {
			var i = 0,
				resolveValues = slice.call( arguments ),
				length = resolveValues.length,
	
				// the count of uncompleted subordinates
				remaining = length !== 1 ||
					( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,
	
				// the master Deferred.
				// If resolveValues consist of only a single Deferred, just use that.
				deferred = remaining === 1 ? subordinate : jQuery.Deferred(),
	
				// Update function for both resolve and progress values
				updateFunc = function( i, contexts, values ) {
					return function( value ) {
						contexts[ i ] = this;
						values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
						if ( values === progressValues ) {
							deferred.notifyWith( contexts, values );
						} else if ( !( --remaining ) ) {
							deferred.resolveWith( contexts, values );
						}
					};
				},
	
				progressValues, progressContexts, resolveContexts;
	
			// Add listeners to Deferred subordinates; treat others as resolved
			if ( length > 1 ) {
				progressValues = new Array( length );
				progressContexts = new Array( length );
				resolveContexts = new Array( length );
				for ( ; i < length; i++ ) {
					if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
						resolveValues[ i ].promise()
							.progress( updateFunc( i, progressContexts, progressValues ) )
							.done( updateFunc( i, resolveContexts, resolveValues ) )
							.fail( deferred.reject );
					} else {
						--remaining;
					}
				}
			}
	
			// If we're not waiting on anything, resolve the master
			if ( !remaining ) {
				deferred.resolveWith( resolveContexts, resolveValues );
			}
	
			return deferred.promise();
		}
	} );
	
	
	// The deferred used on DOM ready
	var readyList;
	
	jQuery.fn.ready = function( fn ) {
	
		// Add the callback
		jQuery.ready.promise().done( fn );
	
		return this;
	};
	
	jQuery.extend( {
	
		// Is the DOM ready to be used? Set to true once it occurs.
		isReady: false,
	
		// A counter to track how many items to wait for before
		// the ready event fires. See #6781
		readyWait: 1,
	
		// Hold (or release) the ready event
		holdReady: function( hold ) {
			if ( hold ) {
				jQuery.readyWait++;
			} else {
				jQuery.ready( true );
			}
		},
	
		// Handle when the DOM is ready
		ready: function( wait ) {
	
			// Abort if there are pending holds or we're already ready
			if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
				return;
			}
	
			// Remember that the DOM is ready
			jQuery.isReady = true;
	
			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}
	
			// If there are functions bound, to execute
			readyList.resolveWith( document, [ jQuery ] );
	
			// Trigger any bound ready events
			if ( jQuery.fn.triggerHandler ) {
				jQuery( document ).triggerHandler( "ready" );
				jQuery( document ).off( "ready" );
			}
		}
	} );
	
	/**
	 * The ready event handler and self cleanup method
	 */
	function completed() {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );
		jQuery.ready();
	}
	
	jQuery.ready.promise = function( obj ) {
		if ( !readyList ) {
	
			readyList = jQuery.Deferred();
	
			// Catch cases where $(document).ready() is called
			// after the browser event has already occurred.
			// Support: IE9-10 only
			// Older IE sometimes signals "interactive" too soon
			if ( document.readyState === "complete" ||
				( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {
	
				// Handle it asynchronously to allow scripts the opportunity to delay ready
				window.setTimeout( jQuery.ready );
	
			} else {
	
				// Use the handy event callback
				document.addEventListener( "DOMContentLoaded", completed );
	
				// A fallback to window.onload, that will always work
				window.addEventListener( "load", completed );
			}
		}
		return readyList.promise( obj );
	};
	
	// Kick off the DOM ready check even if the user does not
	jQuery.ready.promise();
	
	
	
	
	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			len = elems.length,
			bulk = key == null;
	
		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				access( elems, fn, i, key[ i ], true, emptyGet, raw );
			}
	
		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;
	
			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}
	
			if ( bulk ) {
	
				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;
	
				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}
	
			if ( fn ) {
				for ( ; i < len; i++ ) {
					fn(
						elems[ i ], key, raw ?
						value :
						value.call( elems[ i ], i, fn( elems[ i ], key ) )
					);
				}
			}
		}
	
		return chainable ?
			elems :
	
			// Gets
			bulk ?
				fn.call( elems ) :
				len ? fn( elems[ 0 ], key ) : emptyGet;
	};
	var acceptData = function( owner ) {
	
		// Accepts only:
		//  - Node
		//    - Node.ELEMENT_NODE
		//    - Node.DOCUMENT_NODE
		//  - Object
		//    - Any
		/* jshint -W018 */
		return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
	};
	
	
	
	
	function Data() {
		this.expando = jQuery.expando + Data.uid++;
	}
	
	Data.uid = 1;
	
	Data.prototype = {
	
		register: function( owner, initial ) {
			var value = initial || {};
	
			// If it is a node unlikely to be stringify-ed or looped over
			// use plain assignment
			if ( owner.nodeType ) {
				owner[ this.expando ] = value;
	
			// Otherwise secure it in a non-enumerable, non-writable property
			// configurability must be true to allow the property to be
			// deleted with the delete operator
			} else {
				Object.defineProperty( owner, this.expando, {
					value: value,
					writable: true,
					configurable: true
				} );
			}
			return owner[ this.expando ];
		},
		cache: function( owner ) {
	
			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( !acceptData( owner ) ) {
				return {};
			}
	
			// Check if the owner object already has a cache
			var value = owner[ this.expando ];
	
			// If not, create one
			if ( !value ) {
				value = {};
	
				// We can accept data for non-element nodes in modern browsers,
				// but we should not, see #8335.
				// Always return an empty object.
				if ( acceptData( owner ) ) {
	
					// If it is a node unlikely to be stringify-ed or looped over
					// use plain assignment
					if ( owner.nodeType ) {
						owner[ this.expando ] = value;
	
					// Otherwise secure it in a non-enumerable property
					// configurable must be true to allow the property to be
					// deleted when data is removed
					} else {
						Object.defineProperty( owner, this.expando, {
							value: value,
							configurable: true
						} );
					}
				}
			}
	
			return value;
		},
		set: function( owner, data, value ) {
			var prop,
				cache = this.cache( owner );
	
			// Handle: [ owner, key, value ] args
			if ( typeof data === "string" ) {
				cache[ data ] = value;
	
			// Handle: [ owner, { properties } ] args
			} else {
	
				// Copy the properties one-by-one to the cache object
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
			return cache;
		},
		get: function( owner, key ) {
			return key === undefined ?
				this.cache( owner ) :
				owner[ this.expando ] && owner[ this.expando ][ key ];
		},
		access: function( owner, key, value ) {
			var stored;
	
			// In cases where either:
			//
			//   1. No key was specified
			//   2. A string key was specified, but no value provided
			//
			// Take the "read" path and allow the get method to determine
			// which value to return, respectively either:
			//
			//   1. The entire cache object
			//   2. The data stored at the key
			//
			if ( key === undefined ||
					( ( key && typeof key === "string" ) && value === undefined ) ) {
	
				stored = this.get( owner, key );
	
				return stored !== undefined ?
					stored : this.get( owner, jQuery.camelCase( key ) );
			}
	
			// When the key is not a string, or both a key and value
			// are specified, set or extend (existing objects) with either:
			//
			//   1. An object of properties
			//   2. A key and value
			//
			this.set( owner, key, value );
	
			// Since the "set" path can have two possible entry points
			// return the expected data based on which path was taken[*]
			return value !== undefined ? value : key;
		},
		remove: function( owner, key ) {
			var i, name, camel,
				cache = owner[ this.expando ];
	
			if ( cache === undefined ) {
				return;
			}
	
			if ( key === undefined ) {
				this.register( owner );
	
			} else {
	
				// Support array or space separated string of keys
				if ( jQuery.isArray( key ) ) {
	
					// If "name" is an array of keys...
					// When data is initially created, via ("key", "val") signature,
					// keys will be converted to camelCase.
					// Since there is no way to tell _how_ a key was added, remove
					// both plain key and camelCase key. #12786
					// This will only penalize the array argument path.
					name = key.concat( key.map( jQuery.camelCase ) );
				} else {
					camel = jQuery.camelCase( key );
	
					// Try the string as a key before any manipulation
					if ( key in cache ) {
						name = [ key, camel ];
					} else {
	
						// If a key with the spaces exists, use it.
						// Otherwise, create an array by matching non-whitespace
						name = camel;
						name = name in cache ?
							[ name ] : ( name.match( rnotwhite ) || [] );
					}
				}
	
				i = name.length;
	
				while ( i-- ) {
					delete cache[ name[ i ] ];
				}
			}
	
			// Remove the expando if there's no more data
			if ( key === undefined || jQuery.isEmptyObject( cache ) ) {
	
				// Support: Chrome <= 35-45+
				// Webkit & Blink performance suffers when deleting properties
				// from DOM nodes, so set to undefined instead
				// https://code.google.com/p/chromium/issues/detail?id=378607
				if ( owner.nodeType ) {
					owner[ this.expando ] = undefined;
				} else {
					delete owner[ this.expando ];
				}
			}
		},
		hasData: function( owner ) {
			var cache = owner[ this.expando ];
			return cache !== undefined && !jQuery.isEmptyObject( cache );
		}
	};
	var dataPriv = new Data();
	
	var dataUser = new Data();
	
	
	
	//	Implementation Summary
	//
	//	1. Enforce API surface and semantic compatibility with 1.9.x branch
	//	2. Improve the module's maintainability by reducing the storage
	//		paths to a single mechanism.
	//	3. Use the same single mechanism to support "private" and "user" data.
	//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	//	5. Avoid exposing implementation details on user objects (eg. expando properties)
	//	6. Provide a clear path for implementation upgrade to WeakMap in 2014
	
	var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
		rmultiDash = /[A-Z]/g;
	
	function dataAttr( elem, key, data ) {
		var name;
	
		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if ( data === undefined && elem.nodeType === 1 ) {
			name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
			data = elem.getAttribute( name );
	
			if ( typeof data === "string" ) {
				try {
					data = data === "true" ? true :
						data === "false" ? false :
						data === "null" ? null :
	
						// Only convert to a number if it doesn't change the string
						+data + "" === data ? +data :
						rbrace.test( data ) ? jQuery.parseJSON( data ) :
						data;
				} catch ( e ) {}
	
				// Make sure we set the data so it isn't changed later
				dataUser.set( elem, key, data );
			} else {
				data = undefined;
			}
		}
		return data;
	}
	
	jQuery.extend( {
		hasData: function( elem ) {
			return dataUser.hasData( elem ) || dataPriv.hasData( elem );
		},
	
		data: function( elem, name, data ) {
			return dataUser.access( elem, name, data );
		},
	
		removeData: function( elem, name ) {
			dataUser.remove( elem, name );
		},
	
		// TODO: Now that all calls to _data and _removeData have been replaced
		// with direct calls to dataPriv methods, these can be deprecated.
		_data: function( elem, name, data ) {
			return dataPriv.access( elem, name, data );
		},
	
		_removeData: function( elem, name ) {
			dataPriv.remove( elem, name );
		}
	} );
	
	jQuery.fn.extend( {
		data: function( key, value ) {
			var i, name, data,
				elem = this[ 0 ],
				attrs = elem && elem.attributes;
	
			// Gets all values
			if ( key === undefined ) {
				if ( this.length ) {
					data = dataUser.get( elem );
	
					if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
						i = attrs.length;
						while ( i-- ) {
	
							// Support: IE11+
							// The attrs elements can be null (#14894)
							if ( attrs[ i ] ) {
								name = attrs[ i ].name;
								if ( name.indexOf( "data-" ) === 0 ) {
									name = jQuery.camelCase( name.slice( 5 ) );
									dataAttr( elem, name, data[ name ] );
								}
							}
						}
						dataPriv.set( elem, "hasDataAttrs", true );
					}
				}
	
				return data;
			}
	
			// Sets multiple values
			if ( typeof key === "object" ) {
				return this.each( function() {
					dataUser.set( this, key );
				} );
			}
	
			return access( this, function( value ) {
				var data, camelKey;
	
				// The calling jQuery object (element matches) is not empty
				// (and therefore has an element appears at this[ 0 ]) and the
				// `value` parameter was not undefined. An empty jQuery object
				// will result in `undefined` for elem = this[ 0 ] which will
				// throw an exception if an attempt to read a data cache is made.
				if ( elem && value === undefined ) {
	
					// Attempt to get data from the cache
					// with the key as-is
					data = dataUser.get( elem, key ) ||
	
						// Try to find dashed key if it exists (gh-2779)
						// This is for 2.2.x only
						dataUser.get( elem, key.replace( rmultiDash, "-$&" ).toLowerCase() );
	
					if ( data !== undefined ) {
						return data;
					}
	
					camelKey = jQuery.camelCase( key );
	
					// Attempt to get data from the cache
					// with the key camelized
					data = dataUser.get( elem, camelKey );
					if ( data !== undefined ) {
						return data;
					}
	
					// Attempt to "discover" the data in
					// HTML5 custom data-* attrs
					data = dataAttr( elem, camelKey, undefined );
					if ( data !== undefined ) {
						return data;
					}
	
					// We tried really hard, but the data doesn't exist.
					return;
				}
	
				// Set the data...
				camelKey = jQuery.camelCase( key );
				this.each( function() {
	
					// First, attempt to store a copy or reference of any
					// data that might've been store with a camelCased key.
					var data = dataUser.get( this, camelKey );
	
					// For HTML5 data-* attribute interop, we have to
					// store property names with dashes in a camelCase form.
					// This might not apply to all properties...*
					dataUser.set( this, camelKey, value );
	
					// *... In the case of properties that might _actually_
					// have dashes, we need to also store a copy of that
					// unchanged property.
					if ( key.indexOf( "-" ) > -1 && data !== undefined ) {
						dataUser.set( this, key, value );
					}
				} );
			}, null, value, arguments.length > 1, null, true );
		},
	
		removeData: function( key ) {
			return this.each( function() {
				dataUser.remove( this, key );
			} );
		}
	} );
	
	
	jQuery.extend( {
		queue: function( elem, type, data ) {
			var queue;
	
			if ( elem ) {
				type = ( type || "fx" ) + "queue";
				queue = dataPriv.get( elem, type );
	
				// Speed up dequeue by getting out quickly if this is just a lookup
				if ( data ) {
					if ( !queue || jQuery.isArray( data ) ) {
						queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
					} else {
						queue.push( data );
					}
				}
				return queue || [];
			}
		},
	
		dequeue: function( elem, type ) {
			type = type || "fx";
	
			var queue = jQuery.queue( elem, type ),
				startLength = queue.length,
				fn = queue.shift(),
				hooks = jQuery._queueHooks( elem, type ),
				next = function() {
					jQuery.dequeue( elem, type );
				};
	
			// If the fx queue is dequeued, always remove the progress sentinel
			if ( fn === "inprogress" ) {
				fn = queue.shift();
				startLength--;
			}
	
			if ( fn ) {
	
				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				if ( type === "fx" ) {
					queue.unshift( "inprogress" );
				}
	
				// Clear up the last queue stop function
				delete hooks.stop;
				fn.call( elem, next, hooks );
			}
	
			if ( !startLength && hooks ) {
				hooks.empty.fire();
			}
		},
	
		// Not public - generate a queueHooks object, or return the current one
		_queueHooks: function( elem, type ) {
			var key = type + "queueHooks";
			return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
				empty: jQuery.Callbacks( "once memory" ).add( function() {
					dataPriv.remove( elem, [ type + "queue", key ] );
				} )
			} );
		}
	} );
	
	jQuery.fn.extend( {
		queue: function( type, data ) {
			var setter = 2;
	
			if ( typeof type !== "string" ) {
				data = type;
				type = "fx";
				setter--;
			}
	
			if ( arguments.length < setter ) {
				return jQuery.queue( this[ 0 ], type );
			}
	
			return data === undefined ?
				this :
				this.each( function() {
					var queue = jQuery.queue( this, type, data );
	
					// Ensure a hooks for this queue
					jQuery._queueHooks( this, type );
	
					if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
						jQuery.dequeue( this, type );
					}
				} );
		},
		dequeue: function( type ) {
			return this.each( function() {
				jQuery.dequeue( this, type );
			} );
		},
		clearQueue: function( type ) {
			return this.queue( type || "fx", [] );
		},
	
		// Get a promise resolved when queues of a certain type
		// are emptied (fx is the type by default)
		promise: function( type, obj ) {
			var tmp,
				count = 1,
				defer = jQuery.Deferred(),
				elements = this,
				i = this.length,
				resolve = function() {
					if ( !( --count ) ) {
						defer.resolveWith( elements, [ elements ] );
					}
				};
	
			if ( typeof type !== "string" ) {
				obj = type;
				type = undefined;
			}
			type = type || "fx";
	
			while ( i-- ) {
				tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
				if ( tmp && tmp.empty ) {
					count++;
					tmp.empty.add( resolve );
				}
			}
			resolve();
			return defer.promise( obj );
		}
	} );
	var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;
	
	var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );
	
	
	var cssExpand = [ "Top", "Right", "Bottom", "Left" ];
	
	var isHidden = function( elem, el ) {
	
			// isHidden might be called from jQuery#filter function;
			// in that case, element will be second argument
			elem = el || elem;
			return jQuery.css( elem, "display" ) === "none" ||
				!jQuery.contains( elem.ownerDocument, elem );
		};
	
	
	
	function adjustCSS( elem, prop, valueParts, tween ) {
		var adjusted,
			scale = 1,
			maxIterations = 20,
			currentValue = tween ?
				function() { return tween.cur(); } :
				function() { return jQuery.css( elem, prop, "" ); },
			initial = currentValue(),
			unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),
	
			// Starting value computation is required for potential unit mismatches
			initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
				rcssNum.exec( jQuery.css( elem, prop ) );
	
		if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {
	
			// Trust units reported by jQuery.css
			unit = unit || initialInUnit[ 3 ];
	
			// Make sure we update the tween properties later on
			valueParts = valueParts || [];
	
			// Iteratively approximate from a nonzero starting point
			initialInUnit = +initial || 1;
	
			do {
	
				// If previous iteration zeroed out, double until we get *something*.
				// Use string for doubling so we don't accidentally see scale as unchanged below
				scale = scale || ".5";
	
				// Adjust and apply
				initialInUnit = initialInUnit / scale;
				jQuery.style( elem, prop, initialInUnit + unit );
	
			// Update scale, tolerating zero or NaN from tween.cur()
			// Break the loop if scale is unchanged or perfect, or if we've just had enough.
			} while (
				scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
			);
		}
	
		if ( valueParts ) {
			initialInUnit = +initialInUnit || +initial || 0;
	
			// Apply relative offset (+=/-=) if specified
			adjusted = valueParts[ 1 ] ?
				initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
				+valueParts[ 2 ];
			if ( tween ) {
				tween.unit = unit;
				tween.start = initialInUnit;
				tween.end = adjusted;
			}
		}
		return adjusted;
	}
	var rcheckableType = ( /^(?:checkbox|radio)$/i );
	
	var rtagName = ( /<([\w:-]+)/ );
	
	var rscriptType = ( /^$|\/(?:java|ecma)script/i );
	
	
	
	// We have to close these tags to support XHTML (#13200)
	var wrapMap = {
	
		// Support: IE9
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
	
		// XHTML parsers do not magically insert elements in the
		// same way that tag soup parsers do. So we cannot shorten
		// this by omitting <tbody> or other required elements.
		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
	
		_default: [ 0, "", "" ]
	};
	
	// Support: IE9
	wrapMap.optgroup = wrapMap.option;
	
	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;
	
	
	function getAll( context, tag ) {
	
		// Support: IE9-11+
		// Use typeof to avoid zero-argument method invocation on host objects (#15151)
		var ret = typeof context.getElementsByTagName !== "undefined" ?
				context.getElementsByTagName( tag || "*" ) :
				typeof context.querySelectorAll !== "undefined" ?
					context.querySelectorAll( tag || "*" ) :
				[];
	
		return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
			jQuery.merge( [ context ], ret ) :
			ret;
	}
	
	
	// Mark scripts as having already been evaluated
	function setGlobalEval( elems, refElements ) {
		var i = 0,
			l = elems.length;
	
		for ( ; i < l; i++ ) {
			dataPriv.set(
				elems[ i ],
				"globalEval",
				!refElements || dataPriv.get( refElements[ i ], "globalEval" )
			);
		}
	}
	
	
	var rhtml = /<|&#?\w+;/;
	
	function buildFragment( elems, context, scripts, selection, ignored ) {
		var elem, tmp, tag, wrap, contains, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;
	
		for ( ; i < l; i++ ) {
			elem = elems[ i ];
	
			if ( elem || elem === 0 ) {
	
				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
	
					// Support: Android<4.1, PhantomJS<2
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );
	
				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );
	
				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement( "div" ) );
	
					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];
	
					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}
	
					// Support: Android<4.1, PhantomJS<2
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, tmp.childNodes );
	
					// Remember the top-level container
					tmp = fragment.firstChild;
	
					// Ensure the created nodes are orphaned (#12392)
					tmp.textContent = "";
				}
			}
		}
	
		// Remove wrapper from fragment
		fragment.textContent = "";
	
		i = 0;
		while ( ( elem = nodes[ i++ ] ) ) {
	
			// Skip elements already in the context collection (trac-4087)
			if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
				if ( ignored ) {
					ignored.push( elem );
				}
				continue;
			}
	
			contains = jQuery.contains( elem.ownerDocument, elem );
	
			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );
	
			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}
	
			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( ( elem = tmp[ j++ ] ) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}
	
		return fragment;
	}
	
	
	( function() {
		var fragment = document.createDocumentFragment(),
			div = fragment.appendChild( document.createElement( "div" ) ),
			input = document.createElement( "input" );
	
		// Support: Android 4.0-4.3, Safari<=5.1
		// Check state lost if the name is set (#11217)
		// Support: Windows Web Apps (WWA)
		// `name` and `type` must use .setAttribute for WWA (#14901)
		input.setAttribute( "type", "radio" );
		input.setAttribute( "checked", "checked" );
		input.setAttribute( "name", "t" );
	
		div.appendChild( input );
	
		// Support: Safari<=5.1, Android<4.2
		// Older WebKit doesn't clone checked state correctly in fragments
		support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;
	
		// Support: IE<=11+
		// Make sure textarea (and checkbox) defaultValue is properly cloned
		div.innerHTML = "<textarea>x</textarea>";
		support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
	} )();
	
	
	var
		rkeyEvent = /^key/,
		rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
		rtypenamespace = /^([^.]*)(?:\.(.+)|)/;
	
	function returnTrue() {
		return true;
	}
	
	function returnFalse() {
		return false;
	}
	
	// Support: IE9
	// See #13393 for more info
	function safeActiveElement() {
		try {
			return document.activeElement;
		} catch ( err ) { }
	}
	
	function on( elem, types, selector, data, fn, one ) {
		var origFn, type;
	
		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
	
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
	
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				on( elem, type, selector, data, types[ type ], one );
			}
			return elem;
		}
	
		if ( data == null && fn == null ) {
	
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
	
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
	
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return elem;
		}
	
		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
	
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
	
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return elem.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		} );
	}
	
	/*
	 * Helper functions for managing events -- not part of the public interface.
	 * Props to Dean Edwards' addEvent library for many of the ideas.
	 */
	jQuery.event = {
	
		global: {},
	
		add: function( elem, types, handler, data, selector ) {
	
			var handleObjIn, eventHandle, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.get( elem );
	
			// Don't attach events to noData or text/comment nodes (but allow plain objects)
			if ( !elemData ) {
				return;
			}
	
			// Caller can pass in an object of custom data in lieu of the handler
			if ( handler.handler ) {
				handleObjIn = handler;
				handler = handleObjIn.handler;
				selector = handleObjIn.selector;
			}
	
			// Make sure that the handler has a unique ID, used to find/remove it later
			if ( !handler.guid ) {
				handler.guid = jQuery.guid++;
			}
	
			// Init the element's event structure and main handler, if this is the first
			if ( !( events = elemData.events ) ) {
				events = elemData.events = {};
			}
			if ( !( eventHandle = elemData.handle ) ) {
				eventHandle = elemData.handle = function( e ) {
	
					// Discard the second event of a jQuery.event.trigger() and
					// when an event is called after a page has unloaded
					return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
						jQuery.event.dispatch.apply( elem, arguments ) : undefined;
				};
			}
	
			// Handle multiple events separated by a space
			types = ( types || "" ).match( rnotwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();
	
				// There *must* be a type, no attaching namespace-only handlers
				if ( !type ) {
					continue;
				}
	
				// If event changes its type, use the special event handlers for the changed type
				special = jQuery.event.special[ type ] || {};
	
				// If selector defined, determine special event api type, otherwise given type
				type = ( selector ? special.delegateType : special.bindType ) || type;
	
				// Update special based on newly reset type
				special = jQuery.event.special[ type ] || {};
	
				// handleObj is passed to all event handlers
				handleObj = jQuery.extend( {
					type: type,
					origType: origType,
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
					namespace: namespaces.join( "." )
				}, handleObjIn );
	
				// Init the event handler queue if we're the first
				if ( !( handlers = events[ type ] ) ) {
					handlers = events[ type ] = [];
					handlers.delegateCount = 0;
	
					// Only use addEventListener if the special events handler returns false
					if ( !special.setup ||
						special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
	
						if ( elem.addEventListener ) {
							elem.addEventListener( type, eventHandle );
						}
					}
				}
	
				if ( special.add ) {
					special.add.call( elem, handleObj );
	
					if ( !handleObj.handler.guid ) {
						handleObj.handler.guid = handler.guid;
					}
				}
	
				// Add to the element's handler list, delegates in front
				if ( selector ) {
					handlers.splice( handlers.delegateCount++, 0, handleObj );
				} else {
					handlers.push( handleObj );
				}
	
				// Keep track of which events have ever been used, for event optimization
				jQuery.event.global[ type ] = true;
			}
	
		},
	
		// Detach an event or set of events from an element
		remove: function( elem, types, handler, selector, mappedTypes ) {
	
			var j, origCount, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );
	
			if ( !elemData || !( events = elemData.events ) ) {
				return;
			}
	
			// Once for each type.namespace in types; type may be omitted
			types = ( types || "" ).match( rnotwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();
	
				// Unbind all events (on this namespace, if provided) for the element
				if ( !type ) {
					for ( type in events ) {
						jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
					}
					continue;
				}
	
				special = jQuery.event.special[ type ] || {};
				type = ( selector ? special.delegateType : special.bindType ) || type;
				handlers = events[ type ] || [];
				tmp = tmp[ 2 ] &&
					new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );
	
				// Remove matching events
				origCount = j = handlers.length;
				while ( j-- ) {
					handleObj = handlers[ j ];
	
					if ( ( mappedTypes || origType === handleObj.origType ) &&
						( !handler || handler.guid === handleObj.guid ) &&
						( !tmp || tmp.test( handleObj.namespace ) ) &&
						( !selector || selector === handleObj.selector ||
							selector === "**" && handleObj.selector ) ) {
						handlers.splice( j, 1 );
	
						if ( handleObj.selector ) {
							handlers.delegateCount--;
						}
						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}
				}
	
				// Remove generic event handler if we removed something and no more handlers exist
				// (avoids potential for endless recursion during removal of special event handlers)
				if ( origCount && !handlers.length ) {
					if ( !special.teardown ||
						special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
	
						jQuery.removeEvent( elem, type, elemData.handle );
					}
	
					delete events[ type ];
				}
			}
	
			// Remove data and the expando if it's no longer used
			if ( jQuery.isEmptyObject( events ) ) {
				dataPriv.remove( elem, "handle events" );
			}
		},
	
		dispatch: function( event ) {
	
			// Make a writable jQuery.Event from the native event object
			event = jQuery.event.fix( event );
	
			var i, j, ret, matched, handleObj,
				handlerQueue = [],
				args = slice.call( arguments ),
				handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
				special = jQuery.event.special[ event.type ] || {};
	
			// Use the fix-ed jQuery.Event rather than the (read-only) native event
			args[ 0 ] = event;
			event.delegateTarget = this;
	
			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
				return;
			}
	
			// Determine handlers
			handlerQueue = jQuery.event.handlers.call( this, event, handlers );
	
			// Run delegates first; they may want to stop propagation beneath us
			i = 0;
			while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
				event.currentTarget = matched.elem;
	
				j = 0;
				while ( ( handleObj = matched.handlers[ j++ ] ) &&
					!event.isImmediatePropagationStopped() ) {
	
					// Triggered event must either 1) have no namespace, or 2) have namespace(s)
					// a subset or equal to those in the bound event (both can have no namespace).
					if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {
	
						event.handleObj = handleObj;
						event.data = handleObj.data;
	
						ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
							handleObj.handler ).apply( matched.elem, args );
	
						if ( ret !== undefined ) {
							if ( ( event.result = ret ) === false ) {
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				}
			}
	
			// Call the postDispatch hook for the mapped type
			if ( special.postDispatch ) {
				special.postDispatch.call( this, event );
			}
	
			return event.result;
		},
	
		handlers: function( event, handlers ) {
			var i, matches, sel, handleObj,
				handlerQueue = [],
				delegateCount = handlers.delegateCount,
				cur = event.target;
	
			// Support (at least): Chrome, IE9
			// Find delegate handlers
			// Black-hole SVG <use> instance trees (#13180)
			//
			// Support: Firefox<=42+
			// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
			if ( delegateCount && cur.nodeType &&
				( event.type !== "click" || isNaN( event.button ) || event.button < 1 ) ) {
	
				for ( ; cur !== this; cur = cur.parentNode || this ) {
	
					// Don't check non-elements (#13208)
					// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
					if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
						matches = [];
						for ( i = 0; i < delegateCount; i++ ) {
							handleObj = handlers[ i ];
	
							// Don't conflict with Object.prototype properties (#13203)
							sel = handleObj.selector + " ";
	
							if ( matches[ sel ] === undefined ) {
								matches[ sel ] = handleObj.needsContext ?
									jQuery( sel, this ).index( cur ) > -1 :
									jQuery.find( sel, this, null, [ cur ] ).length;
							}
							if ( matches[ sel ] ) {
								matches.push( handleObj );
							}
						}
						if ( matches.length ) {
							handlerQueue.push( { elem: cur, handlers: matches } );
						}
					}
				}
			}
	
			// Add the remaining (directly-bound) handlers
			if ( delegateCount < handlers.length ) {
				handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
			}
	
			return handlerQueue;
		},
	
		// Includes some event props shared by KeyEvent and MouseEvent
		props: ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
			"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),
	
		fixHooks: {},
	
		keyHooks: {
			props: "char charCode key keyCode".split( " " ),
			filter: function( event, original ) {
	
				// Add which for key events
				if ( event.which == null ) {
					event.which = original.charCode != null ? original.charCode : original.keyCode;
				}
	
				return event;
			}
		},
	
		mouseHooks: {
			props: ( "button buttons clientX clientY offsetX offsetY pageX pageY " +
				"screenX screenY toElement" ).split( " " ),
			filter: function( event, original ) {
				var eventDoc, doc, body,
					button = original.button;
	
				// Calculate pageX/Y if missing and clientX/Y available
				if ( event.pageX == null && original.clientX != null ) {
					eventDoc = event.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;
	
					event.pageX = original.clientX +
						( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
						( doc && doc.clientLeft || body && body.clientLeft || 0 );
					event.pageY = original.clientY +
						( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
						( doc && doc.clientTop  || body && body.clientTop  || 0 );
				}
	
				// Add which for click: 1 === left; 2 === middle; 3 === right
				// Note: button is not normalized, so don't use it
				if ( !event.which && button !== undefined ) {
					event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
				}
	
				return event;
			}
		},
	
		fix: function( event ) {
			if ( event[ jQuery.expando ] ) {
				return event;
			}
	
			// Create a writable copy of the event object and normalize some properties
			var i, prop, copy,
				type = event.type,
				originalEvent = event,
				fixHook = this.fixHooks[ type ];
	
			if ( !fixHook ) {
				this.fixHooks[ type ] = fixHook =
					rmouseEvent.test( type ) ? this.mouseHooks :
					rkeyEvent.test( type ) ? this.keyHooks :
					{};
			}
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;
	
			event = new jQuery.Event( originalEvent );
	
			i = copy.length;
			while ( i-- ) {
				prop = copy[ i ];
				event[ prop ] = originalEvent[ prop ];
			}
	
			// Support: Cordova 2.5 (WebKit) (#13255)
			// All events should have a target; Cordova deviceready doesn't
			if ( !event.target ) {
				event.target = document;
			}
	
			// Support: Safari 6.0+, Chrome<28
			// Target should not be a text node (#504, #13143)
			if ( event.target.nodeType === 3 ) {
				event.target = event.target.parentNode;
			}
	
			return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
		},
	
		special: {
			load: {
	
				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			focus: {
	
				// Fire native event if possible so blur/focus sequence is correct
				trigger: function() {
					if ( this !== safeActiveElement() && this.focus ) {
						this.focus();
						return false;
					}
				},
				delegateType: "focusin"
			},
			blur: {
				trigger: function() {
					if ( this === safeActiveElement() && this.blur ) {
						this.blur();
						return false;
					}
				},
				delegateType: "focusout"
			},
			click: {
	
				// For checkbox, fire native event so checked state will be right
				trigger: function() {
					if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
						this.click();
						return false;
					}
				},
	
				// For cross-browser consistency, don't fire native .click() on links
				_default: function( event ) {
					return jQuery.nodeName( event.target, "a" );
				}
			},
	
			beforeunload: {
				postDispatch: function( event ) {
	
					// Support: Firefox 20+
					// Firefox doesn't alert if the returnValue field is not set.
					if ( event.result !== undefined && event.originalEvent ) {
						event.originalEvent.returnValue = event.result;
					}
				}
			}
		}
	};
	
	jQuery.removeEvent = function( elem, type, handle ) {
	
		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	};
	
	jQuery.Event = function( src, props ) {
	
		// Allow instantiation without the 'new' keyword
		if ( !( this instanceof jQuery.Event ) ) {
			return new jQuery.Event( src, props );
		}
	
		// Event object
		if ( src && src.type ) {
			this.originalEvent = src;
			this.type = src.type;
	
			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = src.defaultPrevented ||
					src.defaultPrevented === undefined &&
	
					// Support: Android<4.0
					src.returnValue === false ?
				returnTrue :
				returnFalse;
	
		// Event type
		} else {
			this.type = src;
		}
	
		// Put explicitly provided properties onto the event object
		if ( props ) {
			jQuery.extend( this, props );
		}
	
		// Create a timestamp if incoming event doesn't have one
		this.timeStamp = src && src.timeStamp || jQuery.now();
	
		// Mark it as fixed
		this[ jQuery.expando ] = true;
	};
	
	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype = {
		constructor: jQuery.Event,
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse,
	
		preventDefault: function() {
			var e = this.originalEvent;
	
			this.isDefaultPrevented = returnTrue;
	
			if ( e ) {
				e.preventDefault();
			}
		},
		stopPropagation: function() {
			var e = this.originalEvent;
	
			this.isPropagationStopped = returnTrue;
	
			if ( e ) {
				e.stopPropagation();
			}
		},
		stopImmediatePropagation: function() {
			var e = this.originalEvent;
	
			this.isImmediatePropagationStopped = returnTrue;
	
			if ( e ) {
				e.stopImmediatePropagation();
			}
	
			this.stopPropagation();
		}
	};
	
	// Create mouseenter/leave events using mouseover/out and event-time checks
	// so that event delegation works in jQuery.
	// Do the same for pointerenter/pointerleave and pointerover/pointerout
	//
	// Support: Safari 7 only
	// Safari sends mouseenter too often; see:
	// https://code.google.com/p/chromium/issues/detail?id=470258
	// for the description of the bug (it existed in older Chrome versions as well).
	jQuery.each( {
		mouseenter: "mouseover",
		mouseleave: "mouseout",
		pointerenter: "pointerover",
		pointerleave: "pointerout"
	}, function( orig, fix ) {
		jQuery.event.special[ orig ] = {
			delegateType: fix,
			bindType: fix,
	
			handle: function( event ) {
				var ret,
					target = this,
					related = event.relatedTarget,
					handleObj = event.handleObj;
	
				// For mouseenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply( this, arguments );
					event.type = fix;
				}
				return ret;
			}
		};
	} );
	
	jQuery.fn.extend( {
		on: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn );
		},
		one: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn, 1 );
		},
		off: function( types, selector, fn ) {
			var handleObj, type;
			if ( types && types.preventDefault && types.handleObj ) {
	
				// ( event )  dispatched jQuery.Event
				handleObj = types.handleObj;
				jQuery( types.delegateTarget ).off(
					handleObj.namespace ?
						handleObj.origType + "." + handleObj.namespace :
						handleObj.origType,
					handleObj.selector,
					handleObj.handler
				);
				return this;
			}
			if ( typeof types === "object" ) {
	
				// ( types-object [, selector] )
				for ( type in types ) {
					this.off( type, selector, types[ type ] );
				}
				return this;
			}
			if ( selector === false || typeof selector === "function" ) {
	
				// ( types [, fn] )
				fn = selector;
				selector = undefined;
			}
			if ( fn === false ) {
				fn = returnFalse;
			}
			return this.each( function() {
				jQuery.event.remove( this, types, fn, selector );
			} );
		}
	} );
	
	
	var
		rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,
	
		// Support: IE 10-11, Edge 10240+
		// In IE/Edge using regex groups here causes severe slowdowns.
		// See https://connect.microsoft.com/IE/feedback/details/1736512/
		rnoInnerhtml = /<script|<style|<link/i,
	
		// checked="checked" or checked
		rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
		rscriptTypeMasked = /^true\/(.*)/,
		rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;
	
	// Manipulating tables requires a tbody
	function manipulationTarget( elem, content ) {
		return jQuery.nodeName( elem, "table" ) &&
			jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?
	
			elem.getElementsByTagName( "tbody" )[ 0 ] ||
				elem.appendChild( elem.ownerDocument.createElement( "tbody" ) ) :
			elem;
	}
	
	// Replace/restore the type attribute of script elements for safe DOM manipulation
	function disableScript( elem ) {
		elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
		return elem;
	}
	function restoreScript( elem ) {
		var match = rscriptTypeMasked.exec( elem.type );
	
		if ( match ) {
			elem.type = match[ 1 ];
		} else {
			elem.removeAttribute( "type" );
		}
	
		return elem;
	}
	
	function cloneCopyEvent( src, dest ) {
		var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;
	
		if ( dest.nodeType !== 1 ) {
			return;
		}
	
		// 1. Copy private data: events, handlers, etc.
		if ( dataPriv.hasData( src ) ) {
			pdataOld = dataPriv.access( src );
			pdataCur = dataPriv.set( dest, pdataOld );
			events = pdataOld.events;
	
			if ( events ) {
				delete pdataCur.handle;
				pdataCur.events = {};
	
				for ( type in events ) {
					for ( i = 0, l = events[ type ].length; i < l; i++ ) {
						jQuery.event.add( dest, type, events[ type ][ i ] );
					}
				}
			}
		}
	
		// 2. Copy user data
		if ( dataUser.hasData( src ) ) {
			udataOld = dataUser.access( src );
			udataCur = jQuery.extend( {}, udataOld );
	
			dataUser.set( dest, udataCur );
		}
	}
	
	// Fix IE bugs, see support tests
	function fixInput( src, dest ) {
		var nodeName = dest.nodeName.toLowerCase();
	
		// Fails to persist the checked state of a cloned checkbox or radio button.
		if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
			dest.checked = src.checked;
	
		// Fails to return the selected option to the default selected state when cloning options
		} else if ( nodeName === "input" || nodeName === "textarea" ) {
			dest.defaultValue = src.defaultValue;
		}
	}
	
	function domManip( collection, args, callback, ignored ) {
	
		// Flatten any nested arrays
		args = concat.apply( [], args );
	
		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = collection.length,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );
	
		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return collection.each( function( index ) {
				var self = collection.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				domManip( self, args, callback, ignored );
			} );
		}
	
		if ( l ) {
			fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
			first = fragment.firstChild;
	
			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}
	
			// Require either new content or an interest in ignored elements to invoke the callback
			if ( first || ignored ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;
	
				// Use the original fragment for the last item
				// instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;
	
					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );
	
						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
	
							// Support: Android<4.1, PhantomJS<2
							// push.apply(_, arraylike) throws on ancient WebKit
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}
	
					callback.call( collection[ i ], node, i );
				}
	
				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;
	
					// Reenable scripts
					jQuery.map( scripts, restoreScript );
	
					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!dataPriv.access( node, "globalEval" ) &&
							jQuery.contains( doc, node ) ) {
	
							if ( node.src ) {
	
								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
							}
						}
					}
				}
			}
		}
	
		return collection;
	}
	
	function remove( elem, selector, keepData ) {
		var node,
			nodes = selector ? jQuery.filter( selector, elem ) : elem,
			i = 0;
	
		for ( ; ( node = nodes[ i ] ) != null; i++ ) {
			if ( !keepData && node.nodeType === 1 ) {
				jQuery.cleanData( getAll( node ) );
			}
	
			if ( node.parentNode ) {
				if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
					setGlobalEval( getAll( node, "script" ) );
				}
				node.parentNode.removeChild( node );
			}
		}
	
		return elem;
	}
	
	jQuery.extend( {
		htmlPrefilter: function( html ) {
			return html.replace( rxhtmlTag, "<$1></$2>" );
		},
	
		clone: function( elem, dataAndEvents, deepDataAndEvents ) {
			var i, l, srcElements, destElements,
				clone = elem.cloneNode( true ),
				inPage = jQuery.contains( elem.ownerDocument, elem );
	
			// Fix IE cloning issues
			if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
					!jQuery.isXMLDoc( elem ) ) {
	
				// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
				destElements = getAll( clone );
				srcElements = getAll( elem );
	
				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					fixInput( srcElements[ i ], destElements[ i ] );
				}
			}
	
			// Copy the events from the original to the clone
			if ( dataAndEvents ) {
				if ( deepDataAndEvents ) {
					srcElements = srcElements || getAll( elem );
					destElements = destElements || getAll( clone );
	
					for ( i = 0, l = srcElements.length; i < l; i++ ) {
						cloneCopyEvent( srcElements[ i ], destElements[ i ] );
					}
				} else {
					cloneCopyEvent( elem, clone );
				}
			}
	
			// Preserve script evaluation history
			destElements = getAll( clone, "script" );
			if ( destElements.length > 0 ) {
				setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
			}
	
			// Return the cloned set
			return clone;
		},
	
		cleanData: function( elems ) {
			var data, elem, type,
				special = jQuery.event.special,
				i = 0;
	
			for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
				if ( acceptData( elem ) ) {
					if ( ( data = elem[ dataPriv.expando ] ) ) {
						if ( data.events ) {
							for ( type in data.events ) {
								if ( special[ type ] ) {
									jQuery.event.remove( elem, type );
	
								// This is a shortcut to avoid jQuery.event.remove's overhead
								} else {
									jQuery.removeEvent( elem, type, data.handle );
								}
							}
						}
	
						// Support: Chrome <= 35-45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataPriv.expando ] = undefined;
					}
					if ( elem[ dataUser.expando ] ) {
	
						// Support: Chrome <= 35-45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataUser.expando ] = undefined;
					}
				}
			}
		}
	} );
	
	jQuery.fn.extend( {
	
		// Keep domManip exposed until 3.0 (gh-2225)
		domManip: domManip,
	
		detach: function( selector ) {
			return remove( this, selector, true );
		},
	
		remove: function( selector ) {
			return remove( this, selector );
		},
	
		text: function( value ) {
			return access( this, function( value ) {
				return value === undefined ?
					jQuery.text( this ) :
					this.empty().each( function() {
						if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
							this.textContent = value;
						}
					} );
			}, null, value, arguments.length );
		},
	
		append: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.appendChild( elem );
				}
			} );
		},
	
		prepend: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.insertBefore( elem, target.firstChild );
				}
			} );
		},
	
		before: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this );
				}
			} );
		},
	
		after: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this.nextSibling );
				}
			} );
		},
	
		empty: function() {
			var elem,
				i = 0;
	
			for ( ; ( elem = this[ i ] ) != null; i++ ) {
				if ( elem.nodeType === 1 ) {
	
					// Prevent memory leaks
					jQuery.cleanData( getAll( elem, false ) );
	
					// Remove any remaining nodes
					elem.textContent = "";
				}
			}
	
			return this;
		},
	
		clone: function( dataAndEvents, deepDataAndEvents ) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
	
			return this.map( function() {
				return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
			} );
		},
	
		html: function( value ) {
			return access( this, function( value ) {
				var elem = this[ 0 ] || {},
					i = 0,
					l = this.length;
	
				if ( value === undefined && elem.nodeType === 1 ) {
					return elem.innerHTML;
				}
	
				// See if we can take a shortcut and just use innerHTML
				if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
					!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {
	
					value = jQuery.htmlPrefilter( value );
	
					try {
						for ( ; i < l; i++ ) {
							elem = this[ i ] || {};
	
							// Remove element nodes and prevent memory leaks
							if ( elem.nodeType === 1 ) {
								jQuery.cleanData( getAll( elem, false ) );
								elem.innerHTML = value;
							}
						}
	
						elem = 0;
	
					// If using innerHTML throws an exception, use the fallback method
					} catch ( e ) {}
				}
	
				if ( elem ) {
					this.empty().append( value );
				}
			}, null, value, arguments.length );
		},
	
		replaceWith: function() {
			var ignored = [];
	
			// Make the changes, replacing each non-ignored context element with the new content
			return domManip( this, arguments, function( elem ) {
				var parent = this.parentNode;
	
				if ( jQuery.inArray( this, ignored ) < 0 ) {
					jQuery.cleanData( getAll( this ) );
					if ( parent ) {
						parent.replaceChild( elem, this );
					}
				}
	
			// Force callback invocation
			}, ignored );
		}
	} );
	
	jQuery.each( {
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var elems,
				ret = [],
				insert = jQuery( selector ),
				last = insert.length - 1,
				i = 0;
	
			for ( ; i <= last; i++ ) {
				elems = i === last ? this : this.clone( true );
				jQuery( insert[ i ] )[ original ]( elems );
	
				// Support: QtWebKit
				// .get() because push.apply(_, arraylike) throws
				push.apply( ret, elems.get() );
			}
	
			return this.pushStack( ret );
		};
	} );
	
	
	var iframe,
		elemdisplay = {
	
			// Support: Firefox
			// We have to pre-define these values for FF (#10227)
			HTML: "block",
			BODY: "block"
		};
	
	/**
	 * Retrieve the actual display of a element
	 * @param {String} name nodeName of the element
	 * @param {Object} doc Document object
	 */
	
	// Called only from within defaultDisplay
	function actualDisplay( name, doc ) {
		var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
	
			display = jQuery.css( elem[ 0 ], "display" );
	
		// We don't have any data stored on the element,
		// so use "detach" method as fast way to get rid of the element
		elem.detach();
	
		return display;
	}
	
	/**
	 * Try to determine the default display value of an element
	 * @param {String} nodeName
	 */
	function defaultDisplay( nodeName ) {
		var doc = document,
			display = elemdisplay[ nodeName ];
	
		if ( !display ) {
			display = actualDisplay( nodeName, doc );
	
			// If the simple way fails, read from inside an iframe
			if ( display === "none" || !display ) {
	
				// Use the already-created iframe if possible
				iframe = ( iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" ) )
					.appendTo( doc.documentElement );
	
				// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
				doc = iframe[ 0 ].contentDocument;
	
				// Support: IE
				doc.write();
				doc.close();
	
				display = actualDisplay( nodeName, doc );
				iframe.detach();
			}
	
			// Store the correct default display
			elemdisplay[ nodeName ] = display;
		}
	
		return display;
	}
	var rmargin = ( /^margin/ );
	
	var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );
	
	var getStyles = function( elem ) {
	
			// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
			// IE throws on elements created in popups
			// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
			var view = elem.ownerDocument.defaultView;
	
			if ( !view || !view.opener ) {
				view = window;
			}
	
			return view.getComputedStyle( elem );
		};
	
	var swap = function( elem, options, callback, args ) {
		var ret, name,
			old = {};
	
		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}
	
		ret = callback.apply( elem, args || [] );
	
		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}
	
		return ret;
	};
	
	
	var documentElement = document.documentElement;
	
	
	
	( function() {
		var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
			container = document.createElement( "div" ),
			div = document.createElement( "div" );
	
		// Finish early in limited (non-browser) environments
		if ( !div.style ) {
			return;
		}
	
		// Support: IE9-11+
		// Style of cloned element affects source element cloned (#8908)
		div.style.backgroundClip = "content-box";
		div.cloneNode( true ).style.backgroundClip = "";
		support.clearCloneStyle = div.style.backgroundClip === "content-box";
	
		container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
			"padding:0;margin-top:1px;position:absolute";
		container.appendChild( div );
	
		// Executing both pixelPosition & boxSizingReliable tests require only one layout
		// so they're executed at the same time to save the second computation.
		function computeStyleTests() {
			div.style.cssText =
	
				// Support: Firefox<29, Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;" +
				"position:relative;display:block;" +
				"margin:auto;border:1px;padding:1px;" +
				"top:1%;width:50%";
			div.innerHTML = "";
			documentElement.appendChild( container );
	
			var divStyle = window.getComputedStyle( div );
			pixelPositionVal = divStyle.top !== "1%";
			reliableMarginLeftVal = divStyle.marginLeft === "2px";
			boxSizingReliableVal = divStyle.width === "4px";
	
			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = divStyle.marginRight === "4px";
	
			documentElement.removeChild( container );
		}
	
		jQuery.extend( support, {
			pixelPosition: function() {
	
				// This test is executed only once but we still do memoizing
				// since we can use the boxSizingReliable pre-computing.
				// No need to check if the test was already performed, though.
				computeStyleTests();
				return pixelPositionVal;
			},
			boxSizingReliable: function() {
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return boxSizingReliableVal;
			},
			pixelMarginRight: function() {
	
				// Support: Android 4.0-4.3
				// We're checking for boxSizingReliableVal here instead of pixelMarginRightVal
				// since that compresses better and they're computed together anyway.
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return pixelMarginRightVal;
			},
			reliableMarginLeft: function() {
	
				// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return reliableMarginLeftVal;
			},
			reliableMarginRight: function() {
	
				// Support: Android 2.3
				// Check if div with explicit width and no margin-right incorrectly
				// gets computed margin-right based on width of container. (#3333)
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// This support function is only executed once so no memoizing is needed.
				var ret,
					marginDiv = div.appendChild( document.createElement( "div" ) );
	
				// Reset CSS: box-sizing; display; margin; border; padding
				marginDiv.style.cssText = div.style.cssText =
	
					// Support: Android 2.3
					// Vendor-prefix box-sizing
					"-webkit-box-sizing:content-box;box-sizing:content-box;" +
					"display:block;margin:0;border:0;padding:0";
				marginDiv.style.marginRight = marginDiv.style.width = "0";
				div.style.width = "1px";
				documentElement.appendChild( container );
	
				ret = !parseFloat( window.getComputedStyle( marginDiv ).marginRight );
	
				documentElement.removeChild( container );
				div.removeChild( marginDiv );
	
				return ret;
			}
		} );
	} )();
	
	
	function curCSS( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;
	
		computed = computed || getStyles( elem );
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;
	
		// Support: Opera 12.1x only
		// Fall back to style even without computed
		// computed is undefined for elems on document fragments
		if ( ( ret === "" || ret === undefined ) && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}
	
		// Support: IE9
		// getPropertyValue is only needed for .css('filter') (#12537)
		if ( computed ) {
	
			// A tribute to the "awesome hack by Dean Edwards"
			// Android Browser returns percentage for some values,
			// but width seems to be reliably pixels.
			// This is against the CSSOM draft spec:
			// http://dev.w3.org/csswg/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {
	
				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;
	
				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;
	
				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}
	
		return ret !== undefined ?
	
			// Support: IE9-11+
			// IE returns zIndex value as an integer.
			ret + "" :
			ret;
	}
	
	
	function addGetHookIf( conditionFn, hookFn ) {
	
		// Define the hook, we'll check on the first run if it's really needed.
		return {
			get: function() {
				if ( conditionFn() ) {
	
					// Hook not needed (or it's not possible to use it due
					// to missing dependency), remove it.
					delete this.get;
					return;
				}
	
				// Hook needed; redefine it so that the support test is not executed again.
				return ( this.get = hookFn ).apply( this, arguments );
			}
		};
	}
	
	
	var
	
		// Swappable if display is none or starts with table
		// except "table", "table-cell", or "table-caption"
		// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
		rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	
		cssShow = { position: "absolute", visibility: "hidden", display: "block" },
		cssNormalTransform = {
			letterSpacing: "0",
			fontWeight: "400"
		},
	
		cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
		emptyStyle = document.createElement( "div" ).style;
	
	// Return a css property mapped to a potentially vendor prefixed property
	function vendorPropName( name ) {
	
		// Shortcut for names that are not vendor prefixed
		if ( name in emptyStyle ) {
			return name;
		}
	
		// Check for vendor prefixed names
		var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
			i = cssPrefixes.length;
	
		while ( i-- ) {
			name = cssPrefixes[ i ] + capName;
			if ( name in emptyStyle ) {
				return name;
			}
		}
	}
	
	function setPositiveNumber( elem, value, subtract ) {
	
		// Any relative (+/-) values have already been
		// normalized at this point
		var matches = rcssNum.exec( value );
		return matches ?
	
			// Guard against undefined "subtract", e.g., when used as in cssHooks
			Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
			value;
	}
	
	function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
		var i = extra === ( isBorderBox ? "border" : "content" ) ?
	
			// If we already have the right measurement, avoid augmentation
			4 :
	
			// Otherwise initialize for horizontal or vertical properties
			name === "width" ? 1 : 0,
	
			val = 0;
	
		for ( ; i < 4; i += 2 ) {
	
			// Both box models exclude margin, so add it if we want it
			if ( extra === "margin" ) {
				val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
			}
	
			if ( isBorderBox ) {
	
				// border-box includes padding, so remove it if we want content
				if ( extra === "content" ) {
					val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
				}
	
				// At this point, extra isn't border nor margin, so remove border
				if ( extra !== "margin" ) {
					val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			} else {
	
				// At this point, extra isn't content, so add padding
				val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
	
				// At this point, extra isn't content nor padding, so add border
				if ( extra !== "padding" ) {
					val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			}
		}
	
		return val;
	}
	
	function getWidthOrHeight( elem, name, extra ) {
	
		// Start with offset property, which is equivalent to the border-box value
		var valueIsBorderBox = true,
			val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
			styles = getStyles( elem ),
			isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";
	
		// Support: IE11 only
		// In IE 11 fullscreen elements inside of an iframe have
		// 100x too small dimensions (gh-1764).
		if ( document.msFullscreenElement && window.top !== window ) {
	
			// Support: IE11 only
			// Running getBoundingClientRect on a disconnected node
			// in IE throws an error.
			if ( elem.getClientRects().length ) {
				val = Math.round( elem.getBoundingClientRect()[ name ] * 100 );
			}
		}
	
		// Some non-html elements return undefined for offsetWidth, so check for null/undefined
		// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
		// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
		if ( val <= 0 || val == null ) {
	
			// Fall back to computed then uncomputed css if necessary
			val = curCSS( elem, name, styles );
			if ( val < 0 || val == null ) {
				val = elem.style[ name ];
			}
	
			// Computed unit is not pixels. Stop here and return.
			if ( rnumnonpx.test( val ) ) {
				return val;
			}
	
			// Check for style in case a browser which returns unreliable values
			// for getComputedStyle silently falls back to the reliable elem.style
			valueIsBorderBox = isBorderBox &&
				( support.boxSizingReliable() || val === elem.style[ name ] );
	
			// Normalize "", auto, and prepare for extra
			val = parseFloat( val ) || 0;
		}
	
		// Use the active box-sizing model to add/subtract irrelevant styles
		return ( val +
			augmentWidthOrHeight(
				elem,
				name,
				extra || ( isBorderBox ? "border" : "content" ),
				valueIsBorderBox,
				styles
			)
		) + "px";
	}
	
	function showHide( elements, show ) {
		var display, elem, hidden,
			values = [],
			index = 0,
			length = elements.length;
	
		for ( ; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}
	
			values[ index ] = dataPriv.get( elem, "olddisplay" );
			display = elem.style.display;
			if ( show ) {
	
				// Reset the inline display of this element to learn if it is
				// being hidden by cascaded rules or not
				if ( !values[ index ] && display === "none" ) {
					elem.style.display = "";
				}
	
				// Set elements which have been overridden with display: none
				// in a stylesheet to whatever the default browser style is
				// for such an element
				if ( elem.style.display === "" && isHidden( elem ) ) {
					values[ index ] = dataPriv.access(
						elem,
						"olddisplay",
						defaultDisplay( elem.nodeName )
					);
				}
			} else {
				hidden = isHidden( elem );
	
				if ( display !== "none" || !hidden ) {
					dataPriv.set(
						elem,
						"olddisplay",
						hidden ? display : jQuery.css( elem, "display" )
					);
				}
			}
		}
	
		// Set the display of most of the elements in a second loop
		// to avoid the constant reflow
		for ( index = 0; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}
			if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
				elem.style.display = show ? values[ index ] || "" : "none";
			}
		}
	
		return elements;
	}
	
	jQuery.extend( {
	
		// Add in style property hooks for overriding the default
		// behavior of getting and setting a style property
		cssHooks: {
			opacity: {
				get: function( elem, computed ) {
					if ( computed ) {
	
						// We should always get a number back from opacity
						var ret = curCSS( elem, "opacity" );
						return ret === "" ? "1" : ret;
					}
				}
			}
		},
	
		// Don't automatically add "px" to these possibly-unitless properties
		cssNumber: {
			"animationIterationCount": true,
			"columnCount": true,
			"fillOpacity": true,
			"flexGrow": true,
			"flexShrink": true,
			"fontWeight": true,
			"lineHeight": true,
			"opacity": true,
			"order": true,
			"orphans": true,
			"widows": true,
			"zIndex": true,
			"zoom": true
		},
	
		// Add in properties whose names you wish to fix before
		// setting or getting the value
		cssProps: {
			"float": "cssFloat"
		},
	
		// Get and set the style property on a DOM Node
		style: function( elem, name, value, extra ) {
	
			// Don't set styles on text and comment nodes
			if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
				return;
			}
	
			// Make sure that we're working with the right name
			var ret, type, hooks,
				origName = jQuery.camelCase( name ),
				style = elem.style;
	
			name = jQuery.cssProps[ origName ] ||
				( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );
	
			// Gets hook for the prefixed version, then unprefixed version
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];
	
			// Check if we're setting a value
			if ( value !== undefined ) {
				type = typeof value;
	
				// Convert "+=" or "-=" to relative numbers (#7345)
				if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
					value = adjustCSS( elem, name, ret );
	
					// Fixes bug #9237
					type = "number";
				}
	
				// Make sure that null and NaN values aren't set (#7116)
				if ( value == null || value !== value ) {
					return;
				}
	
				// If a number was passed in, add the unit (except for certain CSS properties)
				if ( type === "number" ) {
					value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
				}
	
				// Support: IE9-11+
				// background-* props affect original clone's values
				if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
					style[ name ] = "inherit";
				}
	
				// If a hook was provided, use that value, otherwise just set the specified value
				if ( !hooks || !( "set" in hooks ) ||
					( value = hooks.set( elem, value, extra ) ) !== undefined ) {
	
					style[ name ] = value;
				}
	
			} else {
	
				// If a hook was provided get the non-computed value from there
				if ( hooks && "get" in hooks &&
					( ret = hooks.get( elem, false, extra ) ) !== undefined ) {
	
					return ret;
				}
	
				// Otherwise just get the value from the style object
				return style[ name ];
			}
		},
	
		css: function( elem, name, extra, styles ) {
			var val, num, hooks,
				origName = jQuery.camelCase( name );
	
			// Make sure that we're working with the right name
			name = jQuery.cssProps[ origName ] ||
				( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );
	
			// Try prefixed name followed by the unprefixed name
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];
	
			// If a hook was provided get the computed value from there
			if ( hooks && "get" in hooks ) {
				val = hooks.get( elem, true, extra );
			}
	
			// Otherwise, if a way to get the computed value exists, use that
			if ( val === undefined ) {
				val = curCSS( elem, name, styles );
			}
	
			// Convert "normal" to computed value
			if ( val === "normal" && name in cssNormalTransform ) {
				val = cssNormalTransform[ name ];
			}
	
			// Make numeric if forced or a qualifier was provided and val looks numeric
			if ( extra === "" || extra ) {
				num = parseFloat( val );
				return extra === true || isFinite( num ) ? num || 0 : val;
			}
			return val;
		}
	} );
	
	jQuery.each( [ "height", "width" ], function( i, name ) {
		jQuery.cssHooks[ name ] = {
			get: function( elem, computed, extra ) {
				if ( computed ) {
	
					// Certain elements can have dimension info if we invisibly show them
					// but it must have a current display style that would benefit
					return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
						elem.offsetWidth === 0 ?
							swap( elem, cssShow, function() {
								return getWidthOrHeight( elem, name, extra );
							} ) :
							getWidthOrHeight( elem, name, extra );
				}
			},
	
			set: function( elem, value, extra ) {
				var matches,
					styles = extra && getStyles( elem ),
					subtract = extra && augmentWidthOrHeight(
						elem,
						name,
						extra,
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
						styles
					);
	
				// Convert to pixels if value adjustment is needed
				if ( subtract && ( matches = rcssNum.exec( value ) ) &&
					( matches[ 3 ] || "px" ) !== "px" ) {
	
					elem.style[ name ] = value;
					value = jQuery.css( elem, name );
				}
	
				return setPositiveNumber( elem, value, subtract );
			}
		};
	} );
	
	jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
		function( elem, computed ) {
			if ( computed ) {
				return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} )
					) + "px";
			}
		}
	);
	
	// Support: Android 2.3
	jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
		function( elem, computed ) {
			if ( computed ) {
				return swap( elem, { "display": "inline-block" },
					curCSS, [ elem, "marginRight" ] );
			}
		}
	);
	
	// These hooks are used by animate to expand properties
	jQuery.each( {
		margin: "",
		padding: "",
		border: "Width"
	}, function( prefix, suffix ) {
		jQuery.cssHooks[ prefix + suffix ] = {
			expand: function( value ) {
				var i = 0,
					expanded = {},
	
					// Assumes a single number if not a string
					parts = typeof value === "string" ? value.split( " " ) : [ value ];
	
				for ( ; i < 4; i++ ) {
					expanded[ prefix + cssExpand[ i ] + suffix ] =
						parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
				}
	
				return expanded;
			}
		};
	
		if ( !rmargin.test( prefix ) ) {
			jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
		}
	} );
	
	jQuery.fn.extend( {
		css: function( name, value ) {
			return access( this, function( elem, name, value ) {
				var styles, len,
					map = {},
					i = 0;
	
				if ( jQuery.isArray( name ) ) {
					styles = getStyles( elem );
					len = name.length;
	
					for ( ; i < len; i++ ) {
						map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
					}
	
					return map;
				}
	
				return value !== undefined ?
					jQuery.style( elem, name, value ) :
					jQuery.css( elem, name );
			}, name, value, arguments.length > 1 );
		},
		show: function() {
			return showHide( this, true );
		},
		hide: function() {
			return showHide( this );
		},
		toggle: function( state ) {
			if ( typeof state === "boolean" ) {
				return state ? this.show() : this.hide();
			}
	
			return this.each( function() {
				if ( isHidden( this ) ) {
					jQuery( this ).show();
				} else {
					jQuery( this ).hide();
				}
			} );
		}
	} );
	
	
	function Tween( elem, options, prop, end, easing ) {
		return new Tween.prototype.init( elem, options, prop, end, easing );
	}
	jQuery.Tween = Tween;
	
	Tween.prototype = {
		constructor: Tween,
		init: function( elem, options, prop, end, easing, unit ) {
			this.elem = elem;
			this.prop = prop;
			this.easing = easing || jQuery.easing._default;
			this.options = options;
			this.start = this.now = this.cur();
			this.end = end;
			this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
		},
		cur: function() {
			var hooks = Tween.propHooks[ this.prop ];
	
			return hooks && hooks.get ?
				hooks.get( this ) :
				Tween.propHooks._default.get( this );
		},
		run: function( percent ) {
			var eased,
				hooks = Tween.propHooks[ this.prop ];
	
			if ( this.options.duration ) {
				this.pos = eased = jQuery.easing[ this.easing ](
					percent, this.options.duration * percent, 0, 1, this.options.duration
				);
			} else {
				this.pos = eased = percent;
			}
			this.now = ( this.end - this.start ) * eased + this.start;
	
			if ( this.options.step ) {
				this.options.step.call( this.elem, this.now, this );
			}
	
			if ( hooks && hooks.set ) {
				hooks.set( this );
			} else {
				Tween.propHooks._default.set( this );
			}
			return this;
		}
	};
	
	Tween.prototype.init.prototype = Tween.prototype;
	
	Tween.propHooks = {
		_default: {
			get: function( tween ) {
				var result;
	
				// Use a property on the element directly when it is not a DOM element,
				// or when there is no matching style property that exists.
				if ( tween.elem.nodeType !== 1 ||
					tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
					return tween.elem[ tween.prop ];
				}
	
				// Passing an empty string as a 3rd parameter to .css will automatically
				// attempt a parseFloat and fallback to a string if the parse fails.
				// Simple values such as "10px" are parsed to Float;
				// complex values such as "rotate(1rad)" are returned as-is.
				result = jQuery.css( tween.elem, tween.prop, "" );
	
				// Empty strings, null, undefined and "auto" are converted to 0.
				return !result || result === "auto" ? 0 : result;
			},
			set: function( tween ) {
	
				// Use step hook for back compat.
				// Use cssHook if its there.
				// Use .style if available and use plain properties where available.
				if ( jQuery.fx.step[ tween.prop ] ) {
					jQuery.fx.step[ tween.prop ]( tween );
				} else if ( tween.elem.nodeType === 1 &&
					( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
						jQuery.cssHooks[ tween.prop ] ) ) {
					jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
				} else {
					tween.elem[ tween.prop ] = tween.now;
				}
			}
		}
	};
	
	// Support: IE9
	// Panic based approach to setting things on disconnected nodes
	Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
		set: function( tween ) {
			if ( tween.elem.nodeType && tween.elem.parentNode ) {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	};
	
	jQuery.easing = {
		linear: function( p ) {
			return p;
		},
		swing: function( p ) {
			return 0.5 - Math.cos( p * Math.PI ) / 2;
		},
		_default: "swing"
	};
	
	jQuery.fx = Tween.prototype.init;
	
	// Back Compat <1.8 extension point
	jQuery.fx.step = {};
	
	
	
	
	var
		fxNow, timerId,
		rfxtypes = /^(?:toggle|show|hide)$/,
		rrun = /queueHooks$/;
	
	// Animations created synchronously will run synchronously
	function createFxNow() {
		window.setTimeout( function() {
			fxNow = undefined;
		} );
		return ( fxNow = jQuery.now() );
	}
	
	// Generate parameters to create a standard animation
	function genFx( type, includeWidth ) {
		var which,
			i = 0,
			attrs = { height: type };
	
		// If we include width, step value is 1 to do all cssExpand values,
		// otherwise step value is 2 to skip over Left and Right
		includeWidth = includeWidth ? 1 : 0;
		for ( ; i < 4 ; i += 2 - includeWidth ) {
			which = cssExpand[ i ];
			attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
		}
	
		if ( includeWidth ) {
			attrs.opacity = attrs.width = type;
		}
	
		return attrs;
	}
	
	function createTween( value, prop, animation ) {
		var tween,
			collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {
	
				// We're done with this property
				return tween;
			}
		}
	}
	
	function defaultPrefilter( elem, props, opts ) {
		/* jshint validthis: true */
		var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
			anim = this,
			orig = {},
			style = elem.style,
			hidden = elem.nodeType && isHidden( elem ),
			dataShow = dataPriv.get( elem, "fxshow" );
	
		// Handle queue: false promises
		if ( !opts.queue ) {
			hooks = jQuery._queueHooks( elem, "fx" );
			if ( hooks.unqueued == null ) {
				hooks.unqueued = 0;
				oldfire = hooks.empty.fire;
				hooks.empty.fire = function() {
					if ( !hooks.unqueued ) {
						oldfire();
					}
				};
			}
			hooks.unqueued++;
	
			anim.always( function() {
	
				// Ensure the complete handler is called before this completes
				anim.always( function() {
					hooks.unqueued--;
					if ( !jQuery.queue( elem, "fx" ).length ) {
						hooks.empty.fire();
					}
				} );
			} );
		}
	
		// Height/width overflow pass
		if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
	
			// Make sure that nothing sneaks out
			// Record all 3 overflow attributes because IE9-10 do not
			// change the overflow attribute when overflowX and
			// overflowY are set to the same value
			opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];
	
			// Set display property to inline-block for height/width
			// animations on inline elements that are having width/height animated
			display = jQuery.css( elem, "display" );
	
			// Test default display if display is currently "none"
			checkDisplay = display === "none" ?
				dataPriv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;
	
			if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
				style.display = "inline-block";
			}
		}
	
		if ( opts.overflow ) {
			style.overflow = "hidden";
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}
	
		// show/hide pass
		for ( prop in props ) {
			value = props[ prop ];
			if ( rfxtypes.exec( value ) ) {
				delete props[ prop ];
				toggle = toggle || value === "toggle";
				if ( value === ( hidden ? "hide" : "show" ) ) {
	
					// If there is dataShow left over from a stopped hide or show
					// and we are going to proceed with show, we should pretend to be hidden
					if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
						hidden = true;
					} else {
						continue;
					}
				}
				orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
	
			// Any non-fx value stops us from restoring the original display value
			} else {
				display = undefined;
			}
		}
	
		if ( !jQuery.isEmptyObject( orig ) ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", {} );
			}
	
			// Store state if its toggle - enables .stop().toggle() to "reverse"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}
			if ( hidden ) {
				jQuery( elem ).show();
			} else {
				anim.done( function() {
					jQuery( elem ).hide();
				} );
			}
			anim.done( function() {
				var prop;
	
				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
			for ( prop in orig ) {
				tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
	
				if ( !( prop in dataShow ) ) {
					dataShow[ prop ] = tween.start;
					if ( hidden ) {
						tween.end = tween.start;
						tween.start = prop === "width" || prop === "height" ? 1 : 0;
					}
				}
			}
	
		// If this is a noop like .hide().hide(), restore an overwritten display value
		} else if ( ( display === "none" ? defaultDisplay( elem.nodeName ) : display ) === "inline" ) {
			style.display = display;
		}
	}
	
	function propFilter( props, specialEasing ) {
		var index, name, easing, value, hooks;
	
		// camelCase, specialEasing and expand cssHook pass
		for ( index in props ) {
			name = jQuery.camelCase( index );
			easing = specialEasing[ name ];
			value = props[ index ];
			if ( jQuery.isArray( value ) ) {
				easing = value[ 1 ];
				value = props[ index ] = value[ 0 ];
			}
	
			if ( index !== name ) {
				props[ name ] = value;
				delete props[ index ];
			}
	
			hooks = jQuery.cssHooks[ name ];
			if ( hooks && "expand" in hooks ) {
				value = hooks.expand( value );
				delete props[ name ];
	
				// Not quite $.extend, this won't overwrite existing keys.
				// Reusing 'index' because we have the correct "name"
				for ( index in value ) {
					if ( !( index in props ) ) {
						props[ index ] = value[ index ];
						specialEasing[ index ] = easing;
					}
				}
			} else {
				specialEasing[ name ] = easing;
			}
		}
	}
	
	function Animation( elem, properties, options ) {
		var result,
			stopped,
			index = 0,
			length = Animation.prefilters.length,
			deferred = jQuery.Deferred().always( function() {
	
				// Don't match elem in the :animated selector
				delete tick.elem;
			} ),
			tick = function() {
				if ( stopped ) {
					return false;
				}
				var currentTime = fxNow || createFxNow(),
					remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
	
					// Support: Android 2.3
					// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
					temp = remaining / animation.duration || 0,
					percent = 1 - temp,
					index = 0,
					length = animation.tweens.length;
	
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( percent );
				}
	
				deferred.notifyWith( elem, [ animation, percent, remaining ] );
	
				if ( percent < 1 && length ) {
					return remaining;
				} else {
					deferred.resolveWith( elem, [ animation ] );
					return false;
				}
			},
			animation = deferred.promise( {
				elem: elem,
				props: jQuery.extend( {}, properties ),
				opts: jQuery.extend( true, {
					specialEasing: {},
					easing: jQuery.easing._default
				}, options ),
				originalProperties: properties,
				originalOptions: options,
				startTime: fxNow || createFxNow(),
				duration: options.duration,
				tweens: [],
				createTween: function( prop, end ) {
					var tween = jQuery.Tween( elem, animation.opts, prop, end,
							animation.opts.specialEasing[ prop ] || animation.opts.easing );
					animation.tweens.push( tween );
					return tween;
				},
				stop: function( gotoEnd ) {
					var index = 0,
	
						// If we are going to the end, we want to run all the tweens
						// otherwise we skip this part
						length = gotoEnd ? animation.tweens.length : 0;
					if ( stopped ) {
						return this;
					}
					stopped = true;
					for ( ; index < length ; index++ ) {
						animation.tweens[ index ].run( 1 );
					}
	
					// Resolve when we played the last frame; otherwise, reject
					if ( gotoEnd ) {
						deferred.notifyWith( elem, [ animation, 1, 0 ] );
						deferred.resolveWith( elem, [ animation, gotoEnd ] );
					} else {
						deferred.rejectWith( elem, [ animation, gotoEnd ] );
					}
					return this;
				}
			} ),
			props = animation.props;
	
		propFilter( props, animation.opts.specialEasing );
	
		for ( ; index < length ; index++ ) {
			result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
			if ( result ) {
				if ( jQuery.isFunction( result.stop ) ) {
					jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
						jQuery.proxy( result.stop, result );
				}
				return result;
			}
		}
	
		jQuery.map( props, createTween, animation );
	
		if ( jQuery.isFunction( animation.opts.start ) ) {
			animation.opts.start.call( elem, animation );
		}
	
		jQuery.fx.timer(
			jQuery.extend( tick, {
				elem: elem,
				anim: animation,
				queue: animation.opts.queue
			} )
		);
	
		// attach callbacks from options
		return animation.progress( animation.opts.progress )
			.done( animation.opts.done, animation.opts.complete )
			.fail( animation.opts.fail )
			.always( animation.opts.always );
	}
	
	jQuery.Animation = jQuery.extend( Animation, {
		tweeners: {
			"*": [ function( prop, value ) {
				var tween = this.createTween( prop, value );
				adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
				return tween;
			} ]
		},
	
		tweener: function( props, callback ) {
			if ( jQuery.isFunction( props ) ) {
				callback = props;
				props = [ "*" ];
			} else {
				props = props.match( rnotwhite );
			}
	
			var prop,
				index = 0,
				length = props.length;
	
			for ( ; index < length ; index++ ) {
				prop = props[ index ];
				Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
				Animation.tweeners[ prop ].unshift( callback );
			}
		},
	
		prefilters: [ defaultPrefilter ],
	
		prefilter: function( callback, prepend ) {
			if ( prepend ) {
				Animation.prefilters.unshift( callback );
			} else {
				Animation.prefilters.push( callback );
			}
		}
	} );
	
	jQuery.speed = function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
		};
	
		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ?
			opt.duration : opt.duration in jQuery.fx.speeds ?
				jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;
	
		// Normalize opt.queue - true/undefined/null -> "fx"
		if ( opt.queue == null || opt.queue === true ) {
			opt.queue = "fx";
		}
	
		// Queueing
		opt.old = opt.complete;
	
		opt.complete = function() {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}
	
			if ( opt.queue ) {
				jQuery.dequeue( this, opt.queue );
			}
		};
	
		return opt;
	};
	
	jQuery.fn.extend( {
		fadeTo: function( speed, to, easing, callback ) {
	
			// Show any hidden elements after setting opacity to 0
			return this.filter( isHidden ).css( "opacity", 0 ).show()
	
				// Animate to the value specified
				.end().animate( { opacity: to }, speed, easing, callback );
		},
		animate: function( prop, speed, easing, callback ) {
			var empty = jQuery.isEmptyObject( prop ),
				optall = jQuery.speed( speed, easing, callback ),
				doAnimation = function() {
	
					// Operate on a copy of prop so per-property easing won't be lost
					var anim = Animation( this, jQuery.extend( {}, prop ), optall );
	
					// Empty animations, or finishing resolves immediately
					if ( empty || dataPriv.get( this, "finish" ) ) {
						anim.stop( true );
					}
				};
				doAnimation.finish = doAnimation;
	
			return empty || optall.queue === false ?
				this.each( doAnimation ) :
				this.queue( optall.queue, doAnimation );
		},
		stop: function( type, clearQueue, gotoEnd ) {
			var stopQueue = function( hooks ) {
				var stop = hooks.stop;
				delete hooks.stop;
				stop( gotoEnd );
			};
	
			if ( typeof type !== "string" ) {
				gotoEnd = clearQueue;
				clearQueue = type;
				type = undefined;
			}
			if ( clearQueue && type !== false ) {
				this.queue( type || "fx", [] );
			}
	
			return this.each( function() {
				var dequeue = true,
					index = type != null && type + "queueHooks",
					timers = jQuery.timers,
					data = dataPriv.get( this );
	
				if ( index ) {
					if ( data[ index ] && data[ index ].stop ) {
						stopQueue( data[ index ] );
					}
				} else {
					for ( index in data ) {
						if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
							stopQueue( data[ index ] );
						}
					}
				}
	
				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this &&
						( type == null || timers[ index ].queue === type ) ) {
	
						timers[ index ].anim.stop( gotoEnd );
						dequeue = false;
						timers.splice( index, 1 );
					}
				}
	
				// Start the next in the queue if the last step wasn't forced.
				// Timers currently will call their complete callbacks, which
				// will dequeue but only if they were gotoEnd.
				if ( dequeue || !gotoEnd ) {
					jQuery.dequeue( this, type );
				}
			} );
		},
		finish: function( type ) {
			if ( type !== false ) {
				type = type || "fx";
			}
			return this.each( function() {
				var index,
					data = dataPriv.get( this ),
					queue = data[ type + "queue" ],
					hooks = data[ type + "queueHooks" ],
					timers = jQuery.timers,
					length = queue ? queue.length : 0;
	
				// Enable finishing flag on private data
				data.finish = true;
	
				// Empty the queue first
				jQuery.queue( this, type, [] );
	
				if ( hooks && hooks.stop ) {
					hooks.stop.call( this, true );
				}
	
				// Look for any active animations, and finish them
				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
						timers[ index ].anim.stop( true );
						timers.splice( index, 1 );
					}
				}
	
				// Look for any animations in the old queue and finish them
				for ( index = 0; index < length; index++ ) {
					if ( queue[ index ] && queue[ index ].finish ) {
						queue[ index ].finish.call( this );
					}
				}
	
				// Turn off finishing flag
				delete data.finish;
			} );
		}
	} );
	
	jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
		var cssFn = jQuery.fn[ name ];
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return speed == null || typeof speed === "boolean" ?
				cssFn.apply( this, arguments ) :
				this.animate( genFx( name, true ), speed, easing, callback );
		};
	} );
	
	// Generate shortcuts for custom animations
	jQuery.each( {
		slideDown: genFx( "show" ),
		slideUp: genFx( "hide" ),
		slideToggle: genFx( "toggle" ),
		fadeIn: { opacity: "show" },
		fadeOut: { opacity: "hide" },
		fadeToggle: { opacity: "toggle" }
	}, function( name, props ) {
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return this.animate( props, speed, easing, callback );
		};
	} );
	
	jQuery.timers = [];
	jQuery.fx.tick = function() {
		var timer,
			i = 0,
			timers = jQuery.timers;
	
		fxNow = jQuery.now();
	
		for ( ; i < timers.length; i++ ) {
			timer = timers[ i ];
	
			// Checks the timer has not already been removed
			if ( !timer() && timers[ i ] === timer ) {
				timers.splice( i--, 1 );
			}
		}
	
		if ( !timers.length ) {
			jQuery.fx.stop();
		}
		fxNow = undefined;
	};
	
	jQuery.fx.timer = function( timer ) {
		jQuery.timers.push( timer );
		if ( timer() ) {
			jQuery.fx.start();
		} else {
			jQuery.timers.pop();
		}
	};
	
	jQuery.fx.interval = 13;
	jQuery.fx.start = function() {
		if ( !timerId ) {
			timerId = window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
		}
	};
	
	jQuery.fx.stop = function() {
		window.clearInterval( timerId );
	
		timerId = null;
	};
	
	jQuery.fx.speeds = {
		slow: 600,
		fast: 200,
	
		// Default speed
		_default: 400
	};
	
	
	// Based off of the plugin by Clint Helfers, with permission.
	// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
	jQuery.fn.delay = function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";
	
		return this.queue( type, function( next, hooks ) {
			var timeout = window.setTimeout( next, time );
			hooks.stop = function() {
				window.clearTimeout( timeout );
			};
		} );
	};
	
	
	( function() {
		var input = document.createElement( "input" ),
			select = document.createElement( "select" ),
			opt = select.appendChild( document.createElement( "option" ) );
	
		input.type = "checkbox";
	
		// Support: iOS<=5.1, Android<=4.2+
		// Default value for a checkbox should be "on"
		support.checkOn = input.value !== "";
	
		// Support: IE<=11+
		// Must access selectedIndex to make default options select
		support.optSelected = opt.selected;
	
		// Support: Android<=2.3
		// Options inside disabled selects are incorrectly marked as disabled
		select.disabled = true;
		support.optDisabled = !opt.disabled;
	
		// Support: IE<=11+
		// An input loses its value after becoming a radio
		input = document.createElement( "input" );
		input.value = "t";
		input.type = "radio";
		support.radioValue = input.value === "t";
	} )();
	
	
	var boolHook,
		attrHandle = jQuery.expr.attrHandle;
	
	jQuery.fn.extend( {
		attr: function( name, value ) {
			return access( this, jQuery.attr, name, value, arguments.length > 1 );
		},
	
		removeAttr: function( name ) {
			return this.each( function() {
				jQuery.removeAttr( this, name );
			} );
		}
	} );
	
	jQuery.extend( {
		attr: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;
	
			// Don't get/set attributes on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}
	
			// Fallback to prop when attributes are not supported
			if ( typeof elem.getAttribute === "undefined" ) {
				return jQuery.prop( elem, name, value );
			}
	
			// All attributes are lowercase
			// Grab necessary hook if one is defined
			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
				name = name.toLowerCase();
				hooks = jQuery.attrHooks[ name ] ||
					( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
			}
	
			if ( value !== undefined ) {
				if ( value === null ) {
					jQuery.removeAttr( elem, name );
					return;
				}
	
				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}
	
				elem.setAttribute( name, value + "" );
				return value;
			}
	
			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}
	
			ret = jQuery.find.attr( elem, name );
	
			// Non-existent attributes return null, we normalize to undefined
			return ret == null ? undefined : ret;
		},
	
		attrHooks: {
			type: {
				set: function( elem, value ) {
					if ( !support.radioValue && value === "radio" &&
						jQuery.nodeName( elem, "input" ) ) {
						var val = elem.value;
						elem.setAttribute( "type", value );
						if ( val ) {
							elem.value = val;
						}
						return value;
					}
				}
			}
		},
	
		removeAttr: function( elem, value ) {
			var name, propName,
				i = 0,
				attrNames = value && value.match( rnotwhite );
	
			if ( attrNames && elem.nodeType === 1 ) {
				while ( ( name = attrNames[ i++ ] ) ) {
					propName = jQuery.propFix[ name ] || name;
	
					// Boolean attributes get special treatment (#10870)
					if ( jQuery.expr.match.bool.test( name ) ) {
	
						// Set corresponding property to false
						elem[ propName ] = false;
					}
	
					elem.removeAttribute( name );
				}
			}
		}
	} );
	
	// Hooks for boolean attributes
	boolHook = {
		set: function( elem, value, name ) {
			if ( value === false ) {
	
				// Remove boolean attributes when set to false
				jQuery.removeAttr( elem, name );
			} else {
				elem.setAttribute( name, name );
			}
			return name;
		}
	};
	jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
		var getter = attrHandle[ name ] || jQuery.find.attr;
	
		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle;
			if ( !isXML ) {
	
				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ name ];
				attrHandle[ name ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					name.toLowerCase() :
					null;
				attrHandle[ name ] = handle;
			}
			return ret;
		};
	} );
	
	
	
	
	var rfocusable = /^(?:input|select|textarea|button)$/i,
		rclickable = /^(?:a|area)$/i;
	
	jQuery.fn.extend( {
		prop: function( name, value ) {
			return access( this, jQuery.prop, name, value, arguments.length > 1 );
		},
	
		removeProp: function( name ) {
			return this.each( function() {
				delete this[ jQuery.propFix[ name ] || name ];
			} );
		}
	} );
	
	jQuery.extend( {
		prop: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;
	
			// Don't get/set properties on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}
	
			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
	
				// Fix name and attach hooks
				name = jQuery.propFix[ name ] || name;
				hooks = jQuery.propHooks[ name ];
			}
	
			if ( value !== undefined ) {
				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}
	
				return ( elem[ name ] = value );
			}
	
			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}
	
			return elem[ name ];
		},
	
		propHooks: {
			tabIndex: {
				get: function( elem ) {
	
					// elem.tabIndex doesn't always return the
					// correct value when it hasn't been explicitly set
					// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					// Use proper attribute retrieval(#12072)
					var tabindex = jQuery.find.attr( elem, "tabindex" );
	
					return tabindex ?
						parseInt( tabindex, 10 ) :
						rfocusable.test( elem.nodeName ) ||
							rclickable.test( elem.nodeName ) && elem.href ?
								0 :
								-1;
				}
			}
		},
	
		propFix: {
			"for": "htmlFor",
			"class": "className"
		}
	} );
	
	// Support: IE <=11 only
	// Accessing the selectedIndex property
	// forces the browser to respect setting selected
	// on the option
	// The getter ensures a default option is selected
	// when in an optgroup
	if ( !support.optSelected ) {
		jQuery.propHooks.selected = {
			get: function( elem ) {
				var parent = elem.parentNode;
				if ( parent && parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
				return null;
			},
			set: function( elem ) {
				var parent = elem.parentNode;
				if ( parent ) {
					parent.selectedIndex;
	
					if ( parent.parentNode ) {
						parent.parentNode.selectedIndex;
					}
				}
			}
		};
	}
	
	jQuery.each( [
		"tabIndex",
		"readOnly",
		"maxLength",
		"cellSpacing",
		"cellPadding",
		"rowSpan",
		"colSpan",
		"useMap",
		"frameBorder",
		"contentEditable"
	], function() {
		jQuery.propFix[ this.toLowerCase() ] = this;
	} );
	
	
	
	
	var rclass = /[\t\r\n\f]/g;
	
	function getClass( elem ) {
		return elem.getAttribute && elem.getAttribute( "class" ) || "";
	}
	
	jQuery.fn.extend( {
		addClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;
	
			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
				} );
			}
	
			if ( typeof value === "string" && value ) {
				classes = value.match( rnotwhite ) || [];
	
				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );
					cur = elem.nodeType === 1 &&
						( " " + curValue + " " ).replace( rclass, " " );
	
					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {
							if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
								cur += clazz + " ";
							}
						}
	
						// Only assign if different to avoid unneeded rendering.
						finalValue = jQuery.trim( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}
	
			return this;
		},
	
		removeClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;
	
			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
				} );
			}
	
			if ( !arguments.length ) {
				return this.attr( "class", "" );
			}
	
			if ( typeof value === "string" && value ) {
				classes = value.match( rnotwhite ) || [];
	
				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );
	
					// This expression is here for better compressibility (see addClass)
					cur = elem.nodeType === 1 &&
						( " " + curValue + " " ).replace( rclass, " " );
	
					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {
	
							// Remove *all* instances
							while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
								cur = cur.replace( " " + clazz + " ", " " );
							}
						}
	
						// Only assign if different to avoid unneeded rendering.
						finalValue = jQuery.trim( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}
	
			return this;
		},
	
		toggleClass: function( value, stateVal ) {
			var type = typeof value;
	
			if ( typeof stateVal === "boolean" && type === "string" ) {
				return stateVal ? this.addClass( value ) : this.removeClass( value );
			}
	
			if ( jQuery.isFunction( value ) ) {
				return this.each( function( i ) {
					jQuery( this ).toggleClass(
						value.call( this, i, getClass( this ), stateVal ),
						stateVal
					);
				} );
			}
	
			return this.each( function() {
				var className, i, self, classNames;
	
				if ( type === "string" ) {
	
					// Toggle individual class names
					i = 0;
					self = jQuery( this );
					classNames = value.match( rnotwhite ) || [];
	
					while ( ( className = classNames[ i++ ] ) ) {
	
						// Check each className given, space separated list
						if ( self.hasClass( className ) ) {
							self.removeClass( className );
						} else {
							self.addClass( className );
						}
					}
	
				// Toggle whole class name
				} else if ( value === undefined || type === "boolean" ) {
					className = getClass( this );
					if ( className ) {
	
						// Store className if set
						dataPriv.set( this, "__className__", className );
					}
	
					// If the element has a class name or if we're passed `false`,
					// then remove the whole classname (if there was one, the above saved it).
					// Otherwise bring back whatever was previously saved (if anything),
					// falling back to the empty string if nothing was stored.
					if ( this.setAttribute ) {
						this.setAttribute( "class",
							className || value === false ?
							"" :
							dataPriv.get( this, "__className__" ) || ""
						);
					}
				}
			} );
		},
	
		hasClass: function( selector ) {
			var className, elem,
				i = 0;
	
			className = " " + selector + " ";
			while ( ( elem = this[ i++ ] ) ) {
				if ( elem.nodeType === 1 &&
					( " " + getClass( elem ) + " " ).replace( rclass, " " )
						.indexOf( className ) > -1
				) {
					return true;
				}
			}
	
			return false;
		}
	} );
	
	
	
	
	var rreturn = /\r/g,
		rspaces = /[\x20\t\r\n\f]+/g;
	
	jQuery.fn.extend( {
		val: function( value ) {
			var hooks, ret, isFunction,
				elem = this[ 0 ];
	
			if ( !arguments.length ) {
				if ( elem ) {
					hooks = jQuery.valHooks[ elem.type ] ||
						jQuery.valHooks[ elem.nodeName.toLowerCase() ];
	
					if ( hooks &&
						"get" in hooks &&
						( ret = hooks.get( elem, "value" ) ) !== undefined
					) {
						return ret;
					}
	
					ret = elem.value;
	
					return typeof ret === "string" ?
	
						// Handle most common string cases
						ret.replace( rreturn, "" ) :
	
						// Handle cases where value is null/undef or number
						ret == null ? "" : ret;
				}
	
				return;
			}
	
			isFunction = jQuery.isFunction( value );
	
			return this.each( function( i ) {
				var val;
	
				if ( this.nodeType !== 1 ) {
					return;
				}
	
				if ( isFunction ) {
					val = value.call( this, i, jQuery( this ).val() );
				} else {
					val = value;
				}
	
				// Treat null/undefined as ""; convert numbers to string
				if ( val == null ) {
					val = "";
	
				} else if ( typeof val === "number" ) {
					val += "";
	
				} else if ( jQuery.isArray( val ) ) {
					val = jQuery.map( val, function( value ) {
						return value == null ? "" : value + "";
					} );
				}
	
				hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];
	
				// If set returns undefined, fall back to normal setting
				if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
					this.value = val;
				}
			} );
		}
	} );
	
	jQuery.extend( {
		valHooks: {
			option: {
				get: function( elem ) {
	
					var val = jQuery.find.attr( elem, "value" );
					return val != null ?
						val :
	
						// Support: IE10-11+
						// option.text throws exceptions (#14686, #14858)
						// Strip and collapse whitespace
						// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
						jQuery.trim( jQuery.text( elem ) ).replace( rspaces, " " );
				}
			},
			select: {
				get: function( elem ) {
					var value, option,
						options = elem.options,
						index = elem.selectedIndex,
						one = elem.type === "select-one" || index < 0,
						values = one ? null : [],
						max = one ? index + 1 : options.length,
						i = index < 0 ?
							max :
							one ? index : 0;
	
					// Loop through all the selected options
					for ( ; i < max; i++ ) {
						option = options[ i ];
	
						// IE8-9 doesn't update selected after form reset (#2551)
						if ( ( option.selected || i === index ) &&
	
								// Don't return options that are disabled or in a disabled optgroup
								( support.optDisabled ?
									!option.disabled : option.getAttribute( "disabled" ) === null ) &&
								( !option.parentNode.disabled ||
									!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {
	
							// Get the specific value for the option
							value = jQuery( option ).val();
	
							// We don't need an array for one selects
							if ( one ) {
								return value;
							}
	
							// Multi-Selects return an array
							values.push( value );
						}
					}
	
					return values;
				},
	
				set: function( elem, value ) {
					var optionSet, option,
						options = elem.options,
						values = jQuery.makeArray( value ),
						i = options.length;
	
					while ( i-- ) {
						option = options[ i ];
						if ( option.selected =
							jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
						) {
							optionSet = true;
						}
					}
	
					// Force browsers to behave consistently when non-matching value is set
					if ( !optionSet ) {
						elem.selectedIndex = -1;
					}
					return values;
				}
			}
		}
	} );
	
	// Radios and checkboxes getter/setter
	jQuery.each( [ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			set: function( elem, value ) {
				if ( jQuery.isArray( value ) ) {
					return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
				}
			}
		};
		if ( !support.checkOn ) {
			jQuery.valHooks[ this ].get = function( elem ) {
				return elem.getAttribute( "value" ) === null ? "on" : elem.value;
			};
		}
	} );
	
	
	
	
	// Return jQuery for attributes-only inclusion
	
	
	var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;
	
	jQuery.extend( jQuery.event, {
	
		trigger: function( event, data, elem, onlyHandlers ) {
	
			var i, cur, tmp, bubbleType, ontype, handle, special,
				eventPath = [ elem || document ],
				type = hasOwn.call( event, "type" ) ? event.type : event,
				namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];
	
			cur = tmp = elem = elem || document;
	
			// Don't do events on text and comment nodes
			if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
				return;
			}
	
			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
				return;
			}
	
			if ( type.indexOf( "." ) > -1 ) {
	
				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split( "." );
				type = namespaces.shift();
				namespaces.sort();
			}
			ontype = type.indexOf( ":" ) < 0 && "on" + type;
	
			// Caller can pass in a jQuery.Event object, Object, or just an event type string
			event = event[ jQuery.expando ] ?
				event :
				new jQuery.Event( type, typeof event === "object" && event );
	
			// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
			event.isTrigger = onlyHandlers ? 2 : 3;
			event.namespace = namespaces.join( "." );
			event.rnamespace = event.namespace ?
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
				null;
	
			// Clean up the event in case it is being reused
			event.result = undefined;
			if ( !event.target ) {
				event.target = elem;
			}
	
			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data == null ?
				[ event ] :
				jQuery.makeArray( data, [ event ] );
	
			// Allow special events to draw outside the lines
			special = jQuery.event.special[ type ] || {};
			if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
				return;
			}
	
			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {
	
				bubbleType = special.delegateType || type;
				if ( !rfocusMorph.test( bubbleType + type ) ) {
					cur = cur.parentNode;
				}
				for ( ; cur; cur = cur.parentNode ) {
					eventPath.push( cur );
					tmp = cur;
				}
	
				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if ( tmp === ( elem.ownerDocument || document ) ) {
					eventPath.push( tmp.defaultView || tmp.parentWindow || window );
				}
			}
	
			// Fire handlers on the event path
			i = 0;
			while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
	
				event.type = i > 1 ?
					bubbleType :
					special.bindType || type;
	
				// jQuery handler
				handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
					dataPriv.get( cur, "handle" );
				if ( handle ) {
					handle.apply( cur, data );
				}
	
				// Native handler
				handle = ontype && cur[ ontype ];
				if ( handle && handle.apply && acceptData( cur ) ) {
					event.result = handle.apply( cur, data );
					if ( event.result === false ) {
						event.preventDefault();
					}
				}
			}
			event.type = type;
	
			// If nobody prevented the default action, do it now
			if ( !onlyHandlers && !event.isDefaultPrevented() ) {
	
				if ( ( !special._default ||
					special._default.apply( eventPath.pop(), data ) === false ) &&
					acceptData( elem ) ) {
	
					// Call a native DOM method on the target with the same name name as the event.
					// Don't do default actions on window, that's where global variables be (#6170)
					if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {
	
						// Don't re-trigger an onFOO event when we call its FOO() method
						tmp = elem[ ontype ];
	
						if ( tmp ) {
							elem[ ontype ] = null;
						}
	
						// Prevent re-triggering of the same event, since we already bubbled it above
						jQuery.event.triggered = type;
						elem[ type ]();
						jQuery.event.triggered = undefined;
	
						if ( tmp ) {
							elem[ ontype ] = tmp;
						}
					}
				}
			}
	
			return event.result;
		},
	
		// Piggyback on a donor event to simulate a different one
		simulate: function( type, elem, event ) {
			var e = jQuery.extend(
				new jQuery.Event(),
				event,
				{
					type: type,
					isSimulated: true
	
					// Previously, `originalEvent: {}` was set here, so stopPropagation call
					// would not be triggered on donor event, since in our own
					// jQuery.event.stopPropagation function we had a check for existence of
					// originalEvent.stopPropagation method, so, consequently it would be a noop.
					//
					// But now, this "simulate" function is used only for events
					// for which stopPropagation() is noop, so there is no need for that anymore.
					//
					// For the 1.x branch though, guard for "click" and "submit"
					// events is still used, but was moved to jQuery.event.stopPropagation function
					// because `originalEvent` should point to the original event for the constancy
					// with other events and for more focused logic
				}
			);
	
			jQuery.event.trigger( e, null, elem );
	
			if ( e.isDefaultPrevented() ) {
				event.preventDefault();
			}
		}
	
	} );
	
	jQuery.fn.extend( {
	
		trigger: function( type, data ) {
			return this.each( function() {
				jQuery.event.trigger( type, data, this );
			} );
		},
		triggerHandler: function( type, data ) {
			var elem = this[ 0 ];
			if ( elem ) {
				return jQuery.event.trigger( type, data, elem, true );
			}
		}
	} );
	
	
	jQuery.each( ( "blur focus focusin focusout load resize scroll unload click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup error contextmenu" ).split( " " ),
		function( i, name ) {
	
		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			return arguments.length > 0 ?
				this.on( name, null, data, fn ) :
				this.trigger( name );
		};
	} );
	
	jQuery.fn.extend( {
		hover: function( fnOver, fnOut ) {
			return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
		}
	} );
	
	
	
	
	support.focusin = "onfocusin" in window;
	
	
	// Support: Firefox
	// Firefox doesn't have focus(in | out) events
	// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
	//
	// Support: Chrome, Safari
	// focus(in | out) events fire after focus & blur events,
	// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
	// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
	if ( !support.focusin ) {
		jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {
	
			// Attach a single capturing handler on the document while someone wants focusin/focusout
			var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
			};
	
			jQuery.event.special[ fix ] = {
				setup: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix );
	
					if ( !attaches ) {
						doc.addEventListener( orig, handler, true );
					}
					dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
				},
				teardown: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix ) - 1;
	
					if ( !attaches ) {
						doc.removeEventListener( orig, handler, true );
						dataPriv.remove( doc, fix );
	
					} else {
						dataPriv.access( doc, fix, attaches );
					}
				}
			};
		} );
	}
	var location = window.location;
	
	var nonce = jQuery.now();
	
	var rquery = ( /\?/ );
	
	
	
	// Support: Android 2.3
	// Workaround failure to string-cast null input
	jQuery.parseJSON = function( data ) {
		return JSON.parse( data + "" );
	};
	
	
	// Cross-browser xml parsing
	jQuery.parseXML = function( data ) {
		var xml;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
	
		// Support: IE9
		try {
			xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
		} catch ( e ) {
			xml = undefined;
		}
	
		if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	};
	
	
	var
		rhash = /#.*$/,
		rts = /([?&])_=[^&]*/,
		rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
	
		// #7653, #8125, #8152: local protocol detection
		rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
		rnoContent = /^(?:GET|HEAD)$/,
		rprotocol = /^\/\//,
	
		/* Prefilters
		 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
		 * 2) These are called:
		 *    - BEFORE asking for a transport
		 *    - AFTER param serialization (s.data is a string if s.processData is true)
		 * 3) key is the dataType
		 * 4) the catchall symbol "*" can be used
		 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
		 */
		prefilters = {},
	
		/* Transports bindings
		 * 1) key is the dataType
		 * 2) the catchall symbol "*" can be used
		 * 3) selection will start with transport dataType and THEN go to "*" if needed
		 */
		transports = {},
	
		// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
		allTypes = "*/".concat( "*" ),
	
		// Anchor tag for parsing the document origin
		originAnchor = document.createElement( "a" );
		originAnchor.href = location.href;
	
	// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
	function addToPrefiltersOrTransports( structure ) {
	
		// dataTypeExpression is optional and defaults to "*"
		return function( dataTypeExpression, func ) {
	
			if ( typeof dataTypeExpression !== "string" ) {
				func = dataTypeExpression;
				dataTypeExpression = "*";
			}
	
			var dataType,
				i = 0,
				dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];
	
			if ( jQuery.isFunction( func ) ) {
	
				// For each dataType in the dataTypeExpression
				while ( ( dataType = dataTypes[ i++ ] ) ) {
	
					// Prepend if requested
					if ( dataType[ 0 ] === "+" ) {
						dataType = dataType.slice( 1 ) || "*";
						( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );
	
					// Otherwise append
					} else {
						( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
					}
				}
			}
		};
	}
	
	// Base inspection function for prefilters and transports
	function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {
	
		var inspected = {},
			seekingTransport = ( structure === transports );
	
		function inspect( dataType ) {
			var selected;
			inspected[ dataType ] = true;
			jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
				var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
				if ( typeof dataTypeOrTransport === "string" &&
					!seekingTransport && !inspected[ dataTypeOrTransport ] ) {
	
					options.dataTypes.unshift( dataTypeOrTransport );
					inspect( dataTypeOrTransport );
					return false;
				} else if ( seekingTransport ) {
					return !( selected = dataTypeOrTransport );
				}
			} );
			return selected;
		}
	
		return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
	}
	
	// A special extend for ajax options
	// that takes "flat" options (not to be deep extended)
	// Fixes #9887
	function ajaxExtend( target, src ) {
		var key, deep,
			flatOptions = jQuery.ajaxSettings.flatOptions || {};
	
		for ( key in src ) {
			if ( src[ key ] !== undefined ) {
				( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
			}
		}
		if ( deep ) {
			jQuery.extend( true, target, deep );
		}
	
		return target;
	}
	
	/* Handles responses to an ajax request:
	 * - finds the right dataType (mediates between content-type and expected dataType)
	 * - returns the corresponding response
	 */
	function ajaxHandleResponses( s, jqXHR, responses ) {
	
		var ct, type, finalDataType, firstDataType,
			contents = s.contents,
			dataTypes = s.dataTypes;
	
		// Remove auto dataType and get content-type in the process
		while ( dataTypes[ 0 ] === "*" ) {
			dataTypes.shift();
			if ( ct === undefined ) {
				ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
			}
		}
	
		// Check if we're dealing with a known content-type
		if ( ct ) {
			for ( type in contents ) {
				if ( contents[ type ] && contents[ type ].test( ct ) ) {
					dataTypes.unshift( type );
					break;
				}
			}
		}
	
		// Check to see if we have a response for the expected dataType
		if ( dataTypes[ 0 ] in responses ) {
			finalDataType = dataTypes[ 0 ];
		} else {
	
			// Try convertible dataTypes
			for ( type in responses ) {
				if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
					finalDataType = type;
					break;
				}
				if ( !firstDataType ) {
					firstDataType = type;
				}
			}
	
			// Or just use first one
			finalDataType = finalDataType || firstDataType;
		}
	
		// If we found a dataType
		// We add the dataType to the list if needed
		// and return the corresponding response
		if ( finalDataType ) {
			if ( finalDataType !== dataTypes[ 0 ] ) {
				dataTypes.unshift( finalDataType );
			}
			return responses[ finalDataType ];
		}
	}
	
	/* Chain conversions given the request and the original response
	 * Also sets the responseXXX fields on the jqXHR instance
	 */
	function ajaxConvert( s, response, jqXHR, isSuccess ) {
		var conv2, current, conv, tmp, prev,
			converters = {},
	
			// Work with a copy of dataTypes in case we need to modify it for conversion
			dataTypes = s.dataTypes.slice();
	
		// Create converters map with lowercased keys
		if ( dataTypes[ 1 ] ) {
			for ( conv in s.converters ) {
				converters[ conv.toLowerCase() ] = s.converters[ conv ];
			}
		}
	
		current = dataTypes.shift();
	
		// Convert to each sequential dataType
		while ( current ) {
	
			if ( s.responseFields[ current ] ) {
				jqXHR[ s.responseFields[ current ] ] = response;
			}
	
			// Apply the dataFilter if provided
			if ( !prev && isSuccess && s.dataFilter ) {
				response = s.dataFilter( response, s.dataType );
			}
	
			prev = current;
			current = dataTypes.shift();
	
			if ( current ) {
	
			// There's only work to do if current dataType is non-auto
				if ( current === "*" ) {
	
					current = prev;
	
				// Convert response if prev dataType is non-auto and differs from current
				} else if ( prev !== "*" && prev !== current ) {
	
					// Seek a direct converter
					conv = converters[ prev + " " + current ] || converters[ "* " + current ];
	
					// If none found, seek a pair
					if ( !conv ) {
						for ( conv2 in converters ) {
	
							// If conv2 outputs current
							tmp = conv2.split( " " );
							if ( tmp[ 1 ] === current ) {
	
								// If prev can be converted to accepted input
								conv = converters[ prev + " " + tmp[ 0 ] ] ||
									converters[ "* " + tmp[ 0 ] ];
								if ( conv ) {
	
									// Condense equivalence converters
									if ( conv === true ) {
										conv = converters[ conv2 ];
	
									// Otherwise, insert the intermediate dataType
									} else if ( converters[ conv2 ] !== true ) {
										current = tmp[ 0 ];
										dataTypes.unshift( tmp[ 1 ] );
									}
									break;
								}
							}
						}
					}
	
					// Apply converter (if not an equivalence)
					if ( conv !== true ) {
	
						// Unless errors are allowed to bubble, catch and return them
						if ( conv && s.throws ) {
							response = conv( response );
						} else {
							try {
								response = conv( response );
							} catch ( e ) {
								return {
									state: "parsererror",
									error: conv ? e : "No conversion from " + prev + " to " + current
								};
							}
						}
					}
				}
			}
		}
	
		return { state: "success", data: response };
	}
	
	jQuery.extend( {
	
		// Counter for holding the number of active queries
		active: 0,
	
		// Last-Modified header cache for next request
		lastModified: {},
		etag: {},
	
		ajaxSettings: {
			url: location.href,
			type: "GET",
			isLocal: rlocalProtocol.test( location.protocol ),
			global: true,
			processData: true,
			async: true,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			/*
			timeout: 0,
			data: null,
			dataType: null,
			username: null,
			password: null,
			cache: null,
			throws: false,
			traditional: false,
			headers: {},
			*/
	
			accepts: {
				"*": allTypes,
				text: "text/plain",
				html: "text/html",
				xml: "application/xml, text/xml",
				json: "application/json, text/javascript"
			},
	
			contents: {
				xml: /\bxml\b/,
				html: /\bhtml/,
				json: /\bjson\b/
			},
	
			responseFields: {
				xml: "responseXML",
				text: "responseText",
				json: "responseJSON"
			},
	
			// Data converters
			// Keys separate source (or catchall "*") and destination types with a single space
			converters: {
	
				// Convert anything to text
				"* text": String,
	
				// Text to html (true = no transformation)
				"text html": true,
	
				// Evaluate text as a json expression
				"text json": jQuery.parseJSON,
	
				// Parse text as xml
				"text xml": jQuery.parseXML
			},
	
			// For options that shouldn't be deep extended:
			// you can add your own custom options here if
			// and when you create one that shouldn't be
			// deep extended (see ajaxExtend)
			flatOptions: {
				url: true,
				context: true
			}
		},
	
		// Creates a full fledged settings object into target
		// with both ajaxSettings and settings fields.
		// If target is omitted, writes into ajaxSettings.
		ajaxSetup: function( target, settings ) {
			return settings ?
	
				// Building a settings object
				ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :
	
				// Extending ajaxSettings
				ajaxExtend( jQuery.ajaxSettings, target );
		},
	
		ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
		ajaxTransport: addToPrefiltersOrTransports( transports ),
	
		// Main method
		ajax: function( url, options ) {
	
			// If url is an object, simulate pre-1.5 signature
			if ( typeof url === "object" ) {
				options = url;
				url = undefined;
			}
	
			// Force options to be an object
			options = options || {};
	
			var transport,
	
				// URL without anti-cache param
				cacheURL,
	
				// Response headers
				responseHeadersString,
				responseHeaders,
	
				// timeout handle
				timeoutTimer,
	
				// Url cleanup var
				urlAnchor,
	
				// To know if global events are to be dispatched
				fireGlobals,
	
				// Loop variable
				i,
	
				// Create the final options object
				s = jQuery.ajaxSetup( {}, options ),
	
				// Callbacks context
				callbackContext = s.context || s,
	
				// Context for global events is callbackContext if it is a DOM node or jQuery collection
				globalEventContext = s.context &&
					( callbackContext.nodeType || callbackContext.jquery ) ?
						jQuery( callbackContext ) :
						jQuery.event,
	
				// Deferreds
				deferred = jQuery.Deferred(),
				completeDeferred = jQuery.Callbacks( "once memory" ),
	
				// Status-dependent callbacks
				statusCode = s.statusCode || {},
	
				// Headers (they are sent all at once)
				requestHeaders = {},
				requestHeadersNames = {},
	
				// The jqXHR state
				state = 0,
	
				// Default abort message
				strAbort = "canceled",
	
				// Fake xhr
				jqXHR = {
					readyState: 0,
	
					// Builds headers hashtable if needed
					getResponseHeader: function( key ) {
						var match;
						if ( state === 2 ) {
							if ( !responseHeaders ) {
								responseHeaders = {};
								while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
									responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
								}
							}
							match = responseHeaders[ key.toLowerCase() ];
						}
						return match == null ? null : match;
					},
	
					// Raw string
					getAllResponseHeaders: function() {
						return state === 2 ? responseHeadersString : null;
					},
	
					// Caches the header
					setRequestHeader: function( name, value ) {
						var lname = name.toLowerCase();
						if ( !state ) {
							name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
							requestHeaders[ name ] = value;
						}
						return this;
					},
	
					// Overrides response content-type header
					overrideMimeType: function( type ) {
						if ( !state ) {
							s.mimeType = type;
						}
						return this;
					},
	
					// Status-dependent callbacks
					statusCode: function( map ) {
						var code;
						if ( map ) {
							if ( state < 2 ) {
								for ( code in map ) {
	
									// Lazy-add the new callback in a way that preserves old ones
									statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
								}
							} else {
	
								// Execute the appropriate callbacks
								jqXHR.always( map[ jqXHR.status ] );
							}
						}
						return this;
					},
	
					// Cancel the request
					abort: function( statusText ) {
						var finalText = statusText || strAbort;
						if ( transport ) {
							transport.abort( finalText );
						}
						done( 0, finalText );
						return this;
					}
				};
	
			// Attach deferreds
			deferred.promise( jqXHR ).complete = completeDeferred.add;
			jqXHR.success = jqXHR.done;
			jqXHR.error = jqXHR.fail;
	
			// Remove hash character (#7531: and string promotion)
			// Add protocol if not provided (prefilters might expect it)
			// Handle falsy url in the settings object (#10093: consistency with old signature)
			// We also use the url parameter if available
			s.url = ( ( url || s.url || location.href ) + "" ).replace( rhash, "" )
				.replace( rprotocol, location.protocol + "//" );
	
			// Alias method option to type as per ticket #12004
			s.type = options.method || options.type || s.method || s.type;
	
			// Extract dataTypes list
			s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];
	
			// A cross-domain request is in order when the origin doesn't match the current origin.
			if ( s.crossDomain == null ) {
				urlAnchor = document.createElement( "a" );
	
				// Support: IE8-11+
				// IE throws exception if url is malformed, e.g. http://example.com:80x/
				try {
					urlAnchor.href = s.url;
	
					// Support: IE8-11+
					// Anchor's host property isn't correctly set when s.url is relative
					urlAnchor.href = urlAnchor.href;
					s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
						urlAnchor.protocol + "//" + urlAnchor.host;
				} catch ( e ) {
	
					// If there is an error parsing the URL, assume it is crossDomain,
					// it can be rejected by the transport if it is invalid
					s.crossDomain = true;
				}
			}
	
			// Convert data if not already a string
			if ( s.data && s.processData && typeof s.data !== "string" ) {
				s.data = jQuery.param( s.data, s.traditional );
			}
	
			// Apply prefilters
			inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );
	
			// If request was aborted inside a prefilter, stop there
			if ( state === 2 ) {
				return jqXHR;
			}
	
			// We can fire global events as of now if asked to
			// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
			fireGlobals = jQuery.event && s.global;
	
			// Watch for a new set of requests
			if ( fireGlobals && jQuery.active++ === 0 ) {
				jQuery.event.trigger( "ajaxStart" );
			}
	
			// Uppercase the type
			s.type = s.type.toUpperCase();
	
			// Determine if request has content
			s.hasContent = !rnoContent.test( s.type );
	
			// Save the URL in case we're toying with the If-Modified-Since
			// and/or If-None-Match header later on
			cacheURL = s.url;
	
			// More options handling for requests with no content
			if ( !s.hasContent ) {
	
				// If data is available, append data to url
				if ( s.data ) {
					cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
	
					// #9682: remove data so that it's not used in an eventual retry
					delete s.data;
				}
	
				// Add anti-cache in url if needed
				if ( s.cache === false ) {
					s.url = rts.test( cacheURL ) ?
	
						// If there is already a '_' parameter, set its value
						cacheURL.replace( rts, "$1_=" + nonce++ ) :
	
						// Otherwise add one to the end
						cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
				}
			}
	
			// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
			if ( s.ifModified ) {
				if ( jQuery.lastModified[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
				}
				if ( jQuery.etag[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
				}
			}
	
			// Set the correct header, if data is being sent
			if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
				jqXHR.setRequestHeader( "Content-Type", s.contentType );
			}
	
			// Set the Accepts header for the server, depending on the dataType
			jqXHR.setRequestHeader(
				"Accept",
				s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
					s.accepts[ s.dataTypes[ 0 ] ] +
						( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
					s.accepts[ "*" ]
			);
	
			// Check for headers option
			for ( i in s.headers ) {
				jqXHR.setRequestHeader( i, s.headers[ i ] );
			}
	
			// Allow custom headers/mimetypes and early abort
			if ( s.beforeSend &&
				( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
	
				// Abort if not done already and return
				return jqXHR.abort();
			}
	
			// Aborting is no longer a cancellation
			strAbort = "abort";
	
			// Install callbacks on deferreds
			for ( i in { success: 1, error: 1, complete: 1 } ) {
				jqXHR[ i ]( s[ i ] );
			}
	
			// Get transport
			transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );
	
			// If no transport, we auto-abort
			if ( !transport ) {
				done( -1, "No Transport" );
			} else {
				jqXHR.readyState = 1;
	
				// Send global event
				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
				}
	
				// If request was aborted inside ajaxSend, stop there
				if ( state === 2 ) {
					return jqXHR;
				}
	
				// Timeout
				if ( s.async && s.timeout > 0 ) {
					timeoutTimer = window.setTimeout( function() {
						jqXHR.abort( "timeout" );
					}, s.timeout );
				}
	
				try {
					state = 1;
					transport.send( requestHeaders, done );
				} catch ( e ) {
	
					// Propagate exception as error if not done
					if ( state < 2 ) {
						done( -1, e );
	
					// Simply rethrow otherwise
					} else {
						throw e;
					}
				}
			}
	
			// Callback for when everything is done
			function done( status, nativeStatusText, responses, headers ) {
				var isSuccess, success, error, response, modified,
					statusText = nativeStatusText;
	
				// Called once
				if ( state === 2 ) {
					return;
				}
	
				// State is "done" now
				state = 2;
	
				// Clear timeout if it exists
				if ( timeoutTimer ) {
					window.clearTimeout( timeoutTimer );
				}
	
				// Dereference transport for early garbage collection
				// (no matter how long the jqXHR object will be used)
				transport = undefined;
	
				// Cache response headers
				responseHeadersString = headers || "";
	
				// Set readyState
				jqXHR.readyState = status > 0 ? 4 : 0;
	
				// Determine if successful
				isSuccess = status >= 200 && status < 300 || status === 304;
	
				// Get response data
				if ( responses ) {
					response = ajaxHandleResponses( s, jqXHR, responses );
				}
	
				// Convert no matter what (that way responseXXX fields are always set)
				response = ajaxConvert( s, response, jqXHR, isSuccess );
	
				// If successful, handle type chaining
				if ( isSuccess ) {
	
					// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
					if ( s.ifModified ) {
						modified = jqXHR.getResponseHeader( "Last-Modified" );
						if ( modified ) {
							jQuery.lastModified[ cacheURL ] = modified;
						}
						modified = jqXHR.getResponseHeader( "etag" );
						if ( modified ) {
							jQuery.etag[ cacheURL ] = modified;
						}
					}
	
					// if no content
					if ( status === 204 || s.type === "HEAD" ) {
						statusText = "nocontent";
	
					// if not modified
					} else if ( status === 304 ) {
						statusText = "notmodified";
	
					// If we have data, let's convert it
					} else {
						statusText = response.state;
						success = response.data;
						error = response.error;
						isSuccess = !error;
					}
				} else {
	
					// Extract error from statusText and normalize for non-aborts
					error = statusText;
					if ( status || !statusText ) {
						statusText = "error";
						if ( status < 0 ) {
							status = 0;
						}
					}
				}
	
				// Set data for the fake xhr object
				jqXHR.status = status;
				jqXHR.statusText = ( nativeStatusText || statusText ) + "";
	
				// Success/Error
				if ( isSuccess ) {
					deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
				} else {
					deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
				}
	
				// Status-dependent callbacks
				jqXHR.statusCode( statusCode );
				statusCode = undefined;
	
				if ( fireGlobals ) {
					globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
						[ jqXHR, s, isSuccess ? success : error ] );
				}
	
				// Complete
				completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );
	
				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
	
					// Handle the global AJAX counter
					if ( !( --jQuery.active ) ) {
						jQuery.event.trigger( "ajaxStop" );
					}
				}
			}
	
			return jqXHR;
		},
	
		getJSON: function( url, data, callback ) {
			return jQuery.get( url, data, callback, "json" );
		},
	
		getScript: function( url, callback ) {
			return jQuery.get( url, undefined, callback, "script" );
		}
	} );
	
	jQuery.each( [ "get", "post" ], function( i, method ) {
		jQuery[ method ] = function( url, data, callback, type ) {
	
			// Shift arguments if data argument was omitted
			if ( jQuery.isFunction( data ) ) {
				type = type || callback;
				callback = data;
				data = undefined;
			}
	
			// The url can be an options object (which then must have .url)
			return jQuery.ajax( jQuery.extend( {
				url: url,
				type: method,
				dataType: type,
				data: data,
				success: callback
			}, jQuery.isPlainObject( url ) && url ) );
		};
	} );
	
	
	jQuery._evalUrl = function( url ) {
		return jQuery.ajax( {
			url: url,
	
			// Make this explicit, since user can override this through ajaxSetup (#11264)
			type: "GET",
			dataType: "script",
			async: false,
			global: false,
			"throws": true
		} );
	};
	
	
	jQuery.fn.extend( {
		wrapAll: function( html ) {
			var wrap;
	
			if ( jQuery.isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapAll( html.call( this, i ) );
				} );
			}
	
			if ( this[ 0 ] ) {
	
				// The elements to wrap the target around
				wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );
	
				if ( this[ 0 ].parentNode ) {
					wrap.insertBefore( this[ 0 ] );
				}
	
				wrap.map( function() {
					var elem = this;
	
					while ( elem.firstElementChild ) {
						elem = elem.firstElementChild;
					}
	
					return elem;
				} ).append( this );
			}
	
			return this;
		},
	
		wrapInner: function( html ) {
			if ( jQuery.isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapInner( html.call( this, i ) );
				} );
			}
	
			return this.each( function() {
				var self = jQuery( this ),
					contents = self.contents();
	
				if ( contents.length ) {
					contents.wrapAll( html );
	
				} else {
					self.append( html );
				}
			} );
		},
	
		wrap: function( html ) {
			var isFunction = jQuery.isFunction( html );
	
			return this.each( function( i ) {
				jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
			} );
		},
	
		unwrap: function() {
			return this.parent().each( function() {
				if ( !jQuery.nodeName( this, "body" ) ) {
					jQuery( this ).replaceWith( this.childNodes );
				}
			} ).end();
		}
	} );
	
	
	jQuery.expr.filters.hidden = function( elem ) {
		return !jQuery.expr.filters.visible( elem );
	};
	jQuery.expr.filters.visible = function( elem ) {
	
		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		// Use OR instead of AND as the element is not visible if either is true
		// See tickets #10406 and #13132
		return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
	};
	
	
	
	
	var r20 = /%20/g,
		rbracket = /\[\]$/,
		rCRLF = /\r?\n/g,
		rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
		rsubmittable = /^(?:input|select|textarea|keygen)/i;
	
	function buildParams( prefix, obj, traditional, add ) {
		var name;
	
		if ( jQuery.isArray( obj ) ) {
	
			// Serialize array item.
			jQuery.each( obj, function( i, v ) {
				if ( traditional || rbracket.test( prefix ) ) {
	
					// Treat each array item as a scalar.
					add( prefix, v );
	
				} else {
	
					// Item is non-scalar (array or object), encode its numeric index.
					buildParams(
						prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
						v,
						traditional,
						add
					);
				}
			} );
	
		} else if ( !traditional && jQuery.type( obj ) === "object" ) {
	
			// Serialize object item.
			for ( name in obj ) {
				buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
			}
	
		} else {
	
			// Serialize scalar item.
			add( prefix, obj );
		}
	}
	
	// Serialize an array of form elements or a set of
	// key/values into a query string
	jQuery.param = function( a, traditional ) {
		var prefix,
			s = [],
			add = function( key, value ) {
	
				// If value is a function, invoke it and return its value
				value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};
	
		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
		}
	
		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
	
			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			} );
	
		} else {
	
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}
	
		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	};
	
	jQuery.fn.extend( {
		serialize: function() {
			return jQuery.param( this.serializeArray() );
		},
		serializeArray: function() {
			return this.map( function() {
	
				// Can add propHook for "elements" to filter or add form elements
				var elements = jQuery.prop( this, "elements" );
				return elements ? jQuery.makeArray( elements ) : this;
			} )
			.filter( function() {
				var type = this.type;
	
				// Use .is( ":disabled" ) so that fieldset[disabled] works
				return this.name && !jQuery( this ).is( ":disabled" ) &&
					rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
					( this.checked || !rcheckableType.test( type ) );
			} )
			.map( function( i, elem ) {
				var val = jQuery( this ).val();
	
				return val == null ?
					null :
					jQuery.isArray( val ) ?
						jQuery.map( val, function( val ) {
							return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
						} ) :
						{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
			} ).get();
		}
	} );
	
	
	jQuery.ajaxSettings.xhr = function() {
		try {
			return new window.XMLHttpRequest();
		} catch ( e ) {}
	};
	
	var xhrSuccessStatus = {
	
			// File protocol always yields status code 0, assume 200
			0: 200,
	
			// Support: IE9
			// #1450: sometimes IE returns 1223 when it should be 204
			1223: 204
		},
		xhrSupported = jQuery.ajaxSettings.xhr();
	
	support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
	support.ajax = xhrSupported = !!xhrSupported;
	
	jQuery.ajaxTransport( function( options ) {
		var callback, errorCallback;
	
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( support.cors || xhrSupported && !options.crossDomain ) {
			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr();
	
					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);
	
					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}
	
					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}
	
					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}
	
					// Set headers
					for ( i in headers ) {
						xhr.setRequestHeader( i, headers[ i ] );
					}
	
					// Callback
					callback = function( type ) {
						return function() {
							if ( callback ) {
								callback = errorCallback = xhr.onload =
									xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;
	
								if ( type === "abort" ) {
									xhr.abort();
								} else if ( type === "error" ) {
	
									// Support: IE9
									// On a manual native abort, IE9 throws
									// errors on any property access that is not readyState
									if ( typeof xhr.status !== "number" ) {
										complete( 0, "error" );
									} else {
										complete(
	
											// File: protocol always yields status 0; see #8605, #14207
											xhr.status,
											xhr.statusText
										);
									}
								} else {
									complete(
										xhrSuccessStatus[ xhr.status ] || xhr.status,
										xhr.statusText,
	
										// Support: IE9 only
										// IE9 has no XHR2 but throws on binary (trac-11426)
										// For XHR2 non-text, let the caller handle it (gh-2498)
										( xhr.responseType || "text" ) !== "text"  ||
										typeof xhr.responseText !== "string" ?
											{ binary: xhr.response } :
											{ text: xhr.responseText },
										xhr.getAllResponseHeaders()
									);
								}
							}
						};
					};
	
					// Listen to events
					xhr.onload = callback();
					errorCallback = xhr.onerror = callback( "error" );
	
					// Support: IE9
					// Use onreadystatechange to replace onabort
					// to handle uncaught aborts
					if ( xhr.onabort !== undefined ) {
						xhr.onabort = errorCallback;
					} else {
						xhr.onreadystatechange = function() {
	
							// Check readyState before timeout as it changes
							if ( xhr.readyState === 4 ) {
	
								// Allow onerror to be called first,
								// but that will not handle a native abort
								// Also, save errorCallback to a variable
								// as xhr.onerror cannot be accessed
								window.setTimeout( function() {
									if ( callback ) {
										errorCallback();
									}
								} );
							}
						};
					}
	
					// Create the abort callback
					callback = callback( "abort" );
	
					try {
	
						// Do send the request (this may raise an exception)
						xhr.send( options.hasContent && options.data || null );
					} catch ( e ) {
	
						// #14683: Only rethrow if this hasn't been notified as an error yet
						if ( callback ) {
							throw e;
						}
					}
				},
	
				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );
	
	
	
	
	// Install script dataType
	jQuery.ajaxSetup( {
		accepts: {
			script: "text/javascript, application/javascript, " +
				"application/ecmascript, application/x-ecmascript"
		},
		contents: {
			script: /\b(?:java|ecma)script\b/
		},
		converters: {
			"text script": function( text ) {
				jQuery.globalEval( text );
				return text;
			}
		}
	} );
	
	// Handle cache's special case and crossDomain
	jQuery.ajaxPrefilter( "script", function( s ) {
		if ( s.cache === undefined ) {
			s.cache = false;
		}
		if ( s.crossDomain ) {
			s.type = "GET";
		}
	} );
	
	// Bind script tag hack transport
	jQuery.ajaxTransport( "script", function( s ) {
	
		// This transport only deals with cross domain requests
		if ( s.crossDomain ) {
			var script, callback;
			return {
				send: function( _, complete ) {
					script = jQuery( "<script>" ).prop( {
						charset: s.scriptCharset,
						src: s.url
					} ).on(
						"load error",
						callback = function( evt ) {
							script.remove();
							callback = null;
							if ( evt ) {
								complete( evt.type === "error" ? 404 : 200, evt.type );
							}
						}
					);
	
					// Use native DOM manipulation to avoid our domManip AJAX trickery
					document.head.appendChild( script[ 0 ] );
				},
				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );
	
	
	
	
	var oldCallbacks = [],
		rjsonp = /(=)\?(?=&|$)|\?\?/;
	
	// Default jsonp settings
	jQuery.ajaxSetup( {
		jsonp: "callback",
		jsonpCallback: function() {
			var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
			this[ callback ] = true;
			return callback;
		}
	} );
	
	// Detect, normalize options and install callbacks for jsonp requests
	jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {
	
		var callbackName, overwritten, responseContainer,
			jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
				"url" :
				typeof s.data === "string" &&
					( s.contentType || "" )
						.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
					rjsonp.test( s.data ) && "data"
			);
	
		// Handle iff the expected data type is "jsonp" or we have a parameter to set
		if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {
	
			// Get callback name, remembering preexisting value associated with it
			callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
				s.jsonpCallback() :
				s.jsonpCallback;
	
			// Insert callback into url or form data
			if ( jsonProp ) {
				s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
			} else if ( s.jsonp !== false ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
			}
	
			// Use data converter to retrieve json after script execution
			s.converters[ "script json" ] = function() {
				if ( !responseContainer ) {
					jQuery.error( callbackName + " was not called" );
				}
				return responseContainer[ 0 ];
			};
	
			// Force json dataType
			s.dataTypes[ 0 ] = "json";
	
			// Install callback
			overwritten = window[ callbackName ];
			window[ callbackName ] = function() {
				responseContainer = arguments;
			};
	
			// Clean-up function (fires after converters)
			jqXHR.always( function() {
	
				// If previous value didn't exist - remove it
				if ( overwritten === undefined ) {
					jQuery( window ).removeProp( callbackName );
	
				// Otherwise restore preexisting value
				} else {
					window[ callbackName ] = overwritten;
				}
	
				// Save back as free
				if ( s[ callbackName ] ) {
	
					// Make sure that re-using the options doesn't screw things around
					s.jsonpCallback = originalSettings.jsonpCallback;
	
					// Save the callback name for future use
					oldCallbacks.push( callbackName );
				}
	
				// Call if it was a function and we have a response
				if ( responseContainer && jQuery.isFunction( overwritten ) ) {
					overwritten( responseContainer[ 0 ] );
				}
	
				responseContainer = overwritten = undefined;
			} );
	
			// Delegate to script
			return "script";
		}
	} );
	
	
	
	
	// Argument "data" should be string of html
	// context (optional): If specified, the fragment will be created in this context,
	// defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	jQuery.parseHTML = function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
		context = context || document;
	
		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];
	
		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[ 1 ] ) ];
		}
	
		parsed = buildFragment( [ data ], context, scripts );
	
		if ( scripts && scripts.length ) {
			jQuery( scripts ).remove();
		}
	
		return jQuery.merge( [], parsed.childNodes );
	};
	
	
	// Keep a copy of the old load method
	var _load = jQuery.fn.load;
	
	/**
	 * Load a url into a page
	 */
	jQuery.fn.load = function( url, params, callback ) {
		if ( typeof url !== "string" && _load ) {
			return _load.apply( this, arguments );
		}
	
		var selector, type, response,
			self = this,
			off = url.indexOf( " " );
	
		if ( off > -1 ) {
			selector = jQuery.trim( url.slice( off ) );
			url = url.slice( 0, off );
		}
	
		// If it's a function
		if ( jQuery.isFunction( params ) ) {
	
			// We assume that it's the callback
			callback = params;
			params = undefined;
	
		// Otherwise, build a param string
		} else if ( params && typeof params === "object" ) {
			type = "POST";
		}
	
		// If we have elements to modify, make the request
		if ( self.length > 0 ) {
			jQuery.ajax( {
				url: url,
	
				// If "type" variable is undefined, then "GET" method will be used.
				// Make value of this field explicit since
				// user can override it through ajaxSetup method
				type: type || "GET",
				dataType: "html",
				data: params
			} ).done( function( responseText ) {
	
				// Save response for use in complete callback
				response = arguments;
	
				self.html( selector ?
	
					// If a selector was specified, locate the right elements in a dummy div
					// Exclude scripts to avoid IE 'Permission Denied' errors
					jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :
	
					// Otherwise use the full result
					responseText );
	
			// If the request succeeds, this function gets "data", "status", "jqXHR"
			// but they are ignored because response was set above.
			// If it fails, this function gets "jqXHR", "status", "error"
			} ).always( callback && function( jqXHR, status ) {
				self.each( function() {
					callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
				} );
			} );
		}
	
		return this;
	};
	
	
	
	
	// Attach a bunch of functions for handling common AJAX events
	jQuery.each( [
		"ajaxStart",
		"ajaxStop",
		"ajaxComplete",
		"ajaxError",
		"ajaxSuccess",
		"ajaxSend"
	], function( i, type ) {
		jQuery.fn[ type ] = function( fn ) {
			return this.on( type, fn );
		};
	} );
	
	
	
	
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep( jQuery.timers, function( fn ) {
			return elem === fn.elem;
		} ).length;
	};
	
	
	
	
	/**
	 * Gets a window from an element
	 */
	function getWindow( elem ) {
		return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
	}
	
	jQuery.offset = {
		setOffset: function( elem, options, i ) {
			var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
				position = jQuery.css( elem, "position" ),
				curElem = jQuery( elem ),
				props = {};
	
			// Set position first, in-case top/left are set even on static elem
			if ( position === "static" ) {
				elem.style.position = "relative";
			}
	
			curOffset = curElem.offset();
			curCSSTop = jQuery.css( elem, "top" );
			curCSSLeft = jQuery.css( elem, "left" );
			calculatePosition = ( position === "absolute" || position === "fixed" ) &&
				( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;
	
			// Need to be able to calculate position if either
			// top or left is auto and position is either absolute or fixed
			if ( calculatePosition ) {
				curPosition = curElem.position();
				curTop = curPosition.top;
				curLeft = curPosition.left;
	
			} else {
				curTop = parseFloat( curCSSTop ) || 0;
				curLeft = parseFloat( curCSSLeft ) || 0;
			}
	
			if ( jQuery.isFunction( options ) ) {
	
				// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
				options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
			}
	
			if ( options.top != null ) {
				props.top = ( options.top - curOffset.top ) + curTop;
			}
			if ( options.left != null ) {
				props.left = ( options.left - curOffset.left ) + curLeft;
			}
	
			if ( "using" in options ) {
				options.using.call( elem, props );
	
			} else {
				curElem.css( props );
			}
		}
	};
	
	jQuery.fn.extend( {
		offset: function( options ) {
			if ( arguments.length ) {
				return options === undefined ?
					this :
					this.each( function( i ) {
						jQuery.offset.setOffset( this, options, i );
					} );
			}
	
			var docElem, win,
				elem = this[ 0 ],
				box = { top: 0, left: 0 },
				doc = elem && elem.ownerDocument;
	
			if ( !doc ) {
				return;
			}
	
			docElem = doc.documentElement;
	
			// Make sure it's not a disconnected DOM node
			if ( !jQuery.contains( docElem, elem ) ) {
				return box;
			}
	
			box = elem.getBoundingClientRect();
			win = getWindow( doc );
			return {
				top: box.top + win.pageYOffset - docElem.clientTop,
				left: box.left + win.pageXOffset - docElem.clientLeft
			};
		},
	
		position: function() {
			if ( !this[ 0 ] ) {
				return;
			}
	
			var offsetParent, offset,
				elem = this[ 0 ],
				parentOffset = { top: 0, left: 0 };
	
			// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
			// because it is its only offset parent
			if ( jQuery.css( elem, "position" ) === "fixed" ) {
	
				// Assume getBoundingClientRect is there when computed position is fixed
				offset = elem.getBoundingClientRect();
	
			} else {
	
				// Get *real* offsetParent
				offsetParent = this.offsetParent();
	
				// Get correct offsets
				offset = this.offset();
				if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
					parentOffset = offsetParent.offset();
				}
	
				// Add offsetParent borders
				parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
			}
	
			// Subtract parent offsets and element margins
			return {
				top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
				left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
			};
		},
	
		// This method will return documentElement in the following cases:
		// 1) For the element inside the iframe without offsetParent, this method will return
		//    documentElement of the parent window
		// 2) For the hidden or detached element
		// 3) For body or html element, i.e. in case of the html node - it will return itself
		//
		// but those exceptions were never presented as a real life use-cases
		// and might be considered as more preferable results.
		//
		// This logic, however, is not guaranteed and can change at any point in the future
		offsetParent: function() {
			return this.map( function() {
				var offsetParent = this.offsetParent;
	
				while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
					offsetParent = offsetParent.offsetParent;
				}
	
				return offsetParent || documentElement;
			} );
		}
	} );
	
	// Create scrollLeft and scrollTop methods
	jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
		var top = "pageYOffset" === prop;
	
		jQuery.fn[ method ] = function( val ) {
			return access( this, function( elem, method, val ) {
				var win = getWindow( elem );
	
				if ( val === undefined ) {
					return win ? win[ prop ] : elem[ method ];
				}
	
				if ( win ) {
					win.scrollTo(
						!top ? val : win.pageXOffset,
						top ? val : win.pageYOffset
					);
	
				} else {
					elem[ method ] = val;
				}
			}, method, val, arguments.length );
		};
	} );
	
	// Support: Safari<7-8+, Chrome<37-44+
	// Add the top/left cssHooks using jQuery.fn.position
	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
	// getComputedStyle returns percent when specified for top/left/bottom/right;
	// rather than make the css module depend on the offset module, just check for it here
	jQuery.each( [ "top", "left" ], function( i, prop ) {
		jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
			function( elem, computed ) {
				if ( computed ) {
					computed = curCSS( elem, prop );
	
					// If curCSS returns percentage, fallback to offset
					return rnumnonpx.test( computed ) ?
						jQuery( elem ).position()[ prop ] + "px" :
						computed;
				}
			}
		);
	} );
	
	
	// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
	jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
		jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
			function( defaultExtra, funcName ) {
	
			// Margin is only for outerHeight, outerWidth
			jQuery.fn[ funcName ] = function( margin, value ) {
				var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
					extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );
	
				return access( this, function( elem, type, value ) {
					var doc;
	
					if ( jQuery.isWindow( elem ) ) {
	
						// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
						// isn't a whole lot we can do. See pull request at this URL for discussion:
						// https://github.com/jquery/jquery/pull/764
						return elem.document.documentElement[ "client" + name ];
					}
	
					// Get document width or height
					if ( elem.nodeType === 9 ) {
						doc = elem.documentElement;
	
						// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
						// whichever is greatest
						return Math.max(
							elem.body[ "scroll" + name ], doc[ "scroll" + name ],
							elem.body[ "offset" + name ], doc[ "offset" + name ],
							doc[ "client" + name ]
						);
					}
	
					return value === undefined ?
	
						// Get width or height on the element, requesting but not forcing parseFloat
						jQuery.css( elem, type, extra ) :
	
						// Set width or height on the element
						jQuery.style( elem, type, value, extra );
				}, type, chainable ? margin : undefined, chainable, null );
			};
		} );
	} );
	
	
	jQuery.fn.extend( {
	
		bind: function( types, data, fn ) {
			return this.on( types, null, data, fn );
		},
		unbind: function( types, fn ) {
			return this.off( types, null, fn );
		},
	
		delegate: function( selector, types, data, fn ) {
			return this.on( types, selector, data, fn );
		},
		undelegate: function( selector, types, fn ) {
	
			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length === 1 ?
				this.off( selector, "**" ) :
				this.off( types, selector || "**", fn );
		},
		size: function() {
			return this.length;
		}
	} );
	
	jQuery.fn.andSelf = jQuery.fn.addBack;
	
	
	
	
	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.
	
	// Note that for maximum portability, libraries that are not jQuery should
	// declare themselves as anonymous modules, and avoid setting a global if an
	// AMD loader is present. jQuery is a special case. For more information, see
	// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon
	
	if ( true ) {
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
			return jQuery;
		}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}
	
	
	
	var
	
		// Map over jQuery in case of overwrite
		_jQuery = window.jQuery,
	
		// Map over the $ in case of overwrite
		_$ = window.$;
	
	jQuery.noConflict = function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}
	
		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}
	
		return jQuery;
	};
	
	// Expose jQuery and $ identifiers, even in AMD
	// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
	// and CommonJS for browser emulators (#13566)
	if ( !noGlobal ) {
		window.jQuery = window.$ = jQuery;
	}
	
	return jQuery;
	}));


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(jQuery) {/*
	 * Copyright (c) 2014 Mike King (@micjamking)
	 *
	 * jQuery Succinct plugin
	 * Version 1.1.0 (October 2014)
	 *
	 * Licensed under the MIT License
	 */
	
	 /*global jQuery*/
	(function($) {
		'use strict';
	
		$.fn.succinct = function(options) {
	
			var settings = $.extend({
					size: 240,
					omission: '...',
					ignore: true
				}, options);
	
			return this.each(function() {
	
				var textDefault,
					textTruncated,
					elements = $(this),
					regex    = /[!-\/:-@\[-`{-~]$/,
					init     = function() {
						elements.each(function() {
							textDefault = $(this).html();
	
							if (textDefault.length > settings.size) {
								textTruncated = $.trim(textDefault)
												.substring(0, settings.size)
												.split(' ')
												.slice(0, -1)
												.join(' ');
	
								if (settings.ignore) {
									textTruncated = textTruncated.replace(regex, '');
								}
	
								$(this).html(textTruncated + settings.omission);
							}
						});
					};
				init();
			});
		};
	})(jQuery);
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * isMobile.js v0.4.0
	 *
	 * A simple library to detect Apple phones and tablets,
	 * Android phones and tablets, other mobile devices (like blackberry, mini-opera and windows phone),
	 * and any kind of seven inch device, via user agent sniffing.
	 *
	 * @author: Kai Mallea (kmallea@gmail.com)
	 *
	 * @license: http://creativecommons.org/publicdomain/zero/1.0/
	 */
	(function (global) {
	
	    var apple_phone         = /iPhone/i,
	        apple_ipod          = /iPod/i,
	        apple_tablet        = /iPad/i,
	        android_phone       = /(?=.*\bAndroid\b)(?=.*\bMobile\b)/i, // Match 'Android' AND 'Mobile'
	        android_tablet      = /Android/i,
	        amazon_phone        = /(?=.*\bAndroid\b)(?=.*\bSD4930UR\b)/i,
	        amazon_tablet       = /(?=.*\bAndroid\b)(?=.*\b(?:KFOT|KFTT|KFJWI|KFJWA|KFSOWI|KFTHWI|KFTHWA|KFAPWI|KFAPWA|KFARWI|KFASWI|KFSAWI|KFSAWA)\b)/i,
	        windows_phone       = /IEMobile/i,
	        windows_tablet      = /(?=.*\bWindows\b)(?=.*\bARM\b)/i, // Match 'Windows' AND 'ARM'
	        other_blackberry    = /BlackBerry/i,
	        other_blackberry_10 = /BB10/i,
	        other_opera         = /Opera Mini/i,
	        other_chrome        = /(CriOS|Chrome)(?=.*\bMobile\b)/i,
	        other_firefox       = /(?=.*\bFirefox\b)(?=.*\bMobile\b)/i, // Match 'Firefox' AND 'Mobile'
	        seven_inch = new RegExp(
	            '(?:' +         // Non-capturing group
	
	            'Nexus 7' +     // Nexus 7
	
	            '|' +           // OR
	
	            'BNTV250' +     // B&N Nook Tablet 7 inch
	
	            '|' +           // OR
	
	            'Kindle Fire' + // Kindle Fire
	
	            '|' +           // OR
	
	            'Silk' +        // Kindle Fire, Silk Accelerated
	
	            '|' +           // OR
	
	            'GT-P1000' +    // Galaxy Tab 7 inch
	
	            ')',            // End non-capturing group
	
	            'i');           // Case-insensitive matching
	
	    var match = function(regex, userAgent) {
	        return regex.test(userAgent);
	    };
	
	    var IsMobileClass = function(userAgent) {
	        var ua = userAgent || navigator.userAgent;
	
	        // Facebook mobile app's integrated browser adds a bunch of strings that
	        // match everything. Strip it out if it exists.
	        var tmp = ua.split('[FBAN');
	        if (typeof tmp[1] !== 'undefined') {
	            ua = tmp[0];
	        }
	
	        // Twitter mobile app's integrated browser on iPad adds a "Twitter for
	        // iPhone" string. Same probable happens on other tablet platforms.
	        // This will confuse detection so strip it out if it exists.
	        tmp = ua.split('Twitter');
	        if (typeof tmp[1] !== 'undefined') {
	            ua = tmp[0];
	        }
	
	        this.apple = {
	            phone:  match(apple_phone, ua),
	            ipod:   match(apple_ipod, ua),
	            tablet: !match(apple_phone, ua) && match(apple_tablet, ua),
	            device: match(apple_phone, ua) || match(apple_ipod, ua) || match(apple_tablet, ua)
	        };
	        this.amazon = {
	            phone:  match(amazon_phone, ua),
	            tablet: !match(amazon_phone, ua) && match(amazon_tablet, ua),
	            device: match(amazon_phone, ua) || match(amazon_tablet, ua)
	        };
	        this.android = {
	            phone:  match(amazon_phone, ua) || match(android_phone, ua),
	            tablet: !match(amazon_phone, ua) && !match(android_phone, ua) && (match(amazon_tablet, ua) || match(android_tablet, ua)),
	            device: match(amazon_phone, ua) || match(amazon_tablet, ua) || match(android_phone, ua) || match(android_tablet, ua)
	        };
	        this.windows = {
	            phone:  match(windows_phone, ua),
	            tablet: match(windows_tablet, ua),
	            device: match(windows_phone, ua) || match(windows_tablet, ua)
	        };
	        this.other = {
	            blackberry:   match(other_blackberry, ua),
	            blackberry10: match(other_blackberry_10, ua),
	            opera:        match(other_opera, ua),
	            firefox:      match(other_firefox, ua),
	            chrome:       match(other_chrome, ua),
	            device:       match(other_blackberry, ua) || match(other_blackberry_10, ua) || match(other_opera, ua) || match(other_firefox, ua) || match(other_chrome, ua)
	        };
	        this.seven_inch = match(seven_inch, ua);
	        this.any = this.apple.device || this.android.device || this.windows.device || this.other.device || this.seven_inch;
	
	        // excludes 'other' devices and ipods, targeting touchscreen phones
	        this.phone = this.apple.phone || this.android.phone || this.windows.phone;
	
	        // excludes 7 inch devices, classifying as phone or tablet is left to the user
	        this.tablet = this.apple.tablet || this.android.tablet || this.windows.tablet;
	
	        if (typeof window === 'undefined') {
	            return this;
	        }
	    };
	
	    var instantiate = function() {
	        var IM = new IsMobileClass();
	        IM.Class = IsMobileClass;
	        return IM;
	    };
	
	    if (typeof module !== 'undefined' && module.exports && typeof window === 'undefined') {
	        //node
	        module.exports = IsMobileClass;
	    } else if (typeof module !== 'undefined' && module.exports && typeof window !== 'undefined') {
	        //browserify
	        module.exports = instantiate();
	    } else if (true) {
	        //AMD
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (global.isMobile = instantiate()), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else {
	        global.isMobile = instantiate();
	    }
	
	})(this);


/***/ },
/* 5 */
/***/ function(module, exports) {

	/*	SWFObject v2.2 <http://code.google.com/p/swfobject/>
		is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
	*/
	var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();


/***/ },
/* 6 */
/***/ function(module, exports) {

	if (window.addEventListener) {
	  window.addEventListener('loadedmetadata', function (event) {
	    event.target.setAttribute('data-loadedmetadata', true);
	  }, true);
	}


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module) {/**
	 * @fileoverview Main function src.
	 */
	
	// HTML5 Shiv. Must be in <head> to support older browsers.
	document.createElement('video');
	document.createElement('audio');
	document.createElement('track');
	
	/**
	 * Doubles as the main function for users to create a player instance and also
	 * the main library object.
	 *
	 * **ALIASES** videojs, _V_ (deprecated)
	 *
	 * The `vjs` function can be used to initialize or retrieve a player.
	 *
	 *     var myPlayer = vjs('my_video_id');
	 *
	 * @param  {String|Element} id      Video element or video element ID
	 * @param  {Object=} options        Optional options object for config/settings
	 * @param  {Function=} ready        Optional ready callback
	 * @return {vjs.Player}             A player instance
	 * @namespace
	 */
	var vjs = function(id, options, ready){
	  var tag; // Element of ID
	
	  // Allow for element or ID to be passed in
	  // String ID
	  if (typeof id === 'string') {
	
	    // Adjust for jQuery ID syntax
	    if (id.indexOf('#') === 0) {
	      id = id.slice(1);
	    }
	
	    // If a player instance has already been created for this ID return it.
	    if (vjs.players[id]) {
	
	      // If options or ready funtion are passed, warn
	      if (options) {
	        vjs.log.warn ('Player "' + id + '" is already initialised. Options will not be applied.');
	      }
	
	      if (ready) {
	        vjs.players[id].ready(ready);
	      }
	
	      return vjs.players[id];
	
	    // Otherwise get element for ID
	    } else {
	      tag = vjs.el(id);
	    }
	
	  // ID is a media element
	  } else {
	    tag = id;
	  }
	
	  // Check for a useable element
	  if (!tag || !tag.nodeName) { // re: nodeName, could be a box div also
	    throw new TypeError('The element or ID supplied is not valid. (videojs)'); // Returns
	  }
	
	  // Element may have a player attr referring to an already created player instance.
	  // If not, set up a new player and return the instance.
	  return tag['player'] || new vjs.Player(tag, options, ready);
	};
	
	// Extended name, also available externally, window.videojs
	var videojs = window['videojs'] = vjs;
	
	// CDN Version. Used to target right flash swf.
	vjs.CDN_VERSION = '4.12';
	vjs.ACCESS_PROTOCOL = ('https:' == document.location.protocol ? 'https://' : 'http://');
	
	/**
	* Full player version
	* @type {string}
	*/
	vjs['VERSION'] = '4.12.15';
	
	/**
	 * Global Player instance options, surfaced from vjs.Player.prototype.options_
	 * vjs.options = vjs.Player.prototype.options_
	 * All options should use string keys so they avoid
	 * renaming by closure compiler
	 * @type {Object}
	 */
	vjs.options = {
	  // Default order of fallback technology
	  'techOrder': ['html5','flash'],
	  // techOrder: ['flash','html5'],
	
	  'html5': {},
	  'flash': {},
	
	  // Default of web browser is 300x150. Should rely on source width/height.
	  'width': 300,
	  'height': 150,
	  // defaultVolume: 0.85,
	  'defaultVolume': 0.00, // The freakin seaguls are driving me crazy!
	
	  // default playback rates
	  'playbackRates': [],
	  // Add playback rate selection by adding rates
	  // 'playbackRates': [0.5, 1, 1.5, 2],
	
	  // default inactivity timeout
	  'inactivityTimeout': 2000,
	
	  // Included control sets
	  'children': {
	    'mediaLoader': {},
	    'posterImage': {},
	    'loadingSpinner': {},
	    'textTrackDisplay': {},
	    'bigPlayButton': {},
	    'controlBar': {},
	    'errorDisplay': {},
	    'textTrackSettings': {}
	  },
	
	  'language': document.getElementsByTagName('html')[0].getAttribute('lang') || navigator.languages && navigator.languages[0] || navigator.userLanguage || navigator.language || 'en',
	
	  // locales and their language translations
	  'languages': {},
	
	  // Default message to show when a video cannot be played.
	  'notSupportedMessage': 'No compatible source was found for this video.'
	};
	
	// Set CDN Version of swf
	// The added (+) blocks the replace from changing this 4.12 string
	if (vjs.CDN_VERSION !== 'GENERATED'+'_CDN_VSN') {
	  videojs.options['flash']['swf'] = vjs.ACCESS_PROTOCOL + 'vjs.zencdn.net/'+vjs.CDN_VERSION+'/video-js.swf';
	}
	
	/**
	 * Utility function for adding languages to the default options. Useful for
	 * amending multiple language support at runtime.
	 *
	 * Example: vjs.addLanguage('es', {'Hello':'Hola'});
	 *
	 * @param  {String} code The language code or dictionary property
	 * @param  {Object} data The data values to be translated
	 * @return {Object} The resulting global languages dictionary object
	 */
	vjs.addLanguage = function(code, data){
	  if(vjs.options['languages'][code] !== undefined) {
	    vjs.options['languages'][code] = vjs.util.mergeOptions(vjs.options['languages'][code], data);
	  } else {
	    vjs.options['languages'][code] = data;
	  }
	  return vjs.options['languages'];
	};
	
	/**
	 * Global player list
	 * @type {Object}
	 */
	vjs.players = {};
	
	/*!
	 * Custom Universal Module Definition (UMD)
	 *
	 * Video.js will never be a non-browser lib so we can simplify UMD a bunch and
	 * still support requirejs and browserify. This also needs to be closure
	 * compiler compatible, so string keys are used.
	 */
	if ("function" === 'function' && __webpack_require__(9)['amd']) {
	  !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function(){ return videojs; }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	
	// checking that module is an object too because of umdjs/umd#35
	} else if (true) {
	  module['exports'] = videojs;
	}
	/**
	 * Core Object/Class for objects that use inheritance + constructors
	 *
	 * To create a class that can be subclassed itself, extend the CoreObject class.
	 *
	 *     var Animal = CoreObject.extend();
	 *     var Horse = Animal.extend();
	 *
	 * The constructor can be defined through the init property of an object argument.
	 *
	 *     var Animal = CoreObject.extend({
	 *       init: function(name, sound){
	 *         this.name = name;
	 *       }
	 *     });
	 *
	 * Other methods and properties can be added the same way, or directly to the
	 * prototype.
	 *
	 *    var Animal = CoreObject.extend({
	 *       init: function(name){
	 *         this.name = name;
	 *       },
	 *       getName: function(){
	 *         return this.name;
	 *       },
	 *       sound: '...'
	 *    });
	 *
	 *    Animal.prototype.makeSound = function(){
	 *      alert(this.sound);
	 *    };
	 *
	 * To create an instance of a class, use the create method.
	 *
	 *    var fluffy = Animal.create('Fluffy');
	 *    fluffy.getName(); // -> Fluffy
	 *
	 * Methods and properties can be overridden in subclasses.
	 *
	 *     var Horse = Animal.extend({
	 *       sound: 'Neighhhhh!'
	 *     });
	 *
	 *     var horsey = Horse.create('Horsey');
	 *     horsey.getName(); // -> Horsey
	 *     horsey.makeSound(); // -> Alert: Neighhhhh!
	 *
	 * @class
	 * @constructor
	 */
	vjs.CoreObject = vjs['CoreObject'] = function(){};
	// Manually exporting vjs['CoreObject'] here for Closure Compiler
	// because of the use of the extend/create class methods
	// If we didn't do this, those functions would get flattened to something like
	// `a = ...` and `this.prototype` would refer to the global object instead of
	// CoreObject
	
	/**
	 * Create a new object that inherits from this Object
	 *
	 *     var Animal = CoreObject.extend();
	 *     var Horse = Animal.extend();
	 *
	 * @param {Object} props Functions and properties to be applied to the
	 *                       new object's prototype
	 * @return {vjs.CoreObject} An object that inherits from CoreObject
	 * @this {*}
	 */
	vjs.CoreObject.extend = function(props){
	  var init, subObj;
	
	  props = props || {};
	  // Set up the constructor using the supplied init method
	  // or using the init of the parent object
	  // Make sure to check the unobfuscated version for external libs
	  init = props['init'] || props.init || this.prototype['init'] || this.prototype.init || function(){};
	  // In Resig's simple class inheritance (previously used) the constructor
	  //  is a function that calls `this.init.apply(arguments)`
	  // However that would prevent us from using `ParentObject.call(this);`
	  //  in a Child constructor because the `this` in `this.init`
	  //  would still refer to the Child and cause an infinite loop.
	  // We would instead have to do
	  //    `ParentObject.prototype.init.apply(this, arguments);`
	  //  Bleh. We're not creating a _super() function, so it's good to keep
	  //  the parent constructor reference simple.
	  subObj = function(){
	    init.apply(this, arguments);
	  };
	
	  // Inherit from this object's prototype
	  subObj.prototype = vjs.obj.create(this.prototype);
	  // Reset the constructor property for subObj otherwise
	  // instances of subObj would have the constructor of the parent Object
	  subObj.prototype.constructor = subObj;
	
	  // Make the class extendable
	  subObj.extend = vjs.CoreObject.extend;
	  // Make a function for creating instances
	  subObj.create = vjs.CoreObject.create;
	
	  // Extend subObj's prototype with functions and other properties from props
	  for (var name in props) {
	    if (props.hasOwnProperty(name)) {
	      subObj.prototype[name] = props[name];
	    }
	  }
	
	  return subObj;
	};
	
	/**
	 * Create a new instance of this Object class
	 *
	 *     var myAnimal = Animal.create();
	 *
	 * @return {vjs.CoreObject} An instance of a CoreObject subclass
	 * @this {*}
	 */
	vjs.CoreObject.create = function(){
	  // Create a new object that inherits from this object's prototype
	  var inst = vjs.obj.create(this.prototype);
	
	  // Apply this constructor function to the new object
	  this.apply(inst, arguments);
	
	  // Return the new object
	  return inst;
	};
	/**
	 * @fileoverview Event System (John Resig - Secrets of a JS Ninja http://jsninja.com/)
	 * (Original book version wasn't completely usable, so fixed some things and made Closure Compiler compatible)
	 * This should work very similarly to jQuery's events, however it's based off the book version which isn't as
	 * robust as jquery's, so there's probably some differences.
	 */
	
	/**
	 * Add an event listener to element
	 * It stores the handler function in a separate cache object
	 * and adds a generic handler to the element's event,
	 * along with a unique id (guid) to the element.
	 * @param  {Element|Object}   elem Element or object to bind listeners to
	 * @param  {String|Array}   type Type of event to bind to.
	 * @param  {Function} fn   Event listener.
	 * @private
	 */
	vjs.on = function(elem, type, fn){
	  if (vjs.obj.isArray(type)) {
	    return _handleMultipleEvents(vjs.on, elem, type, fn);
	  }
	
	  var data = vjs.getData(elem);
	
	  // We need a place to store all our handler data
	  if (!data.handlers) data.handlers = {};
	
	  if (!data.handlers[type]) data.handlers[type] = [];
	
	  if (!fn.guid) fn.guid = vjs.guid++;
	
	  data.handlers[type].push(fn);
	
	  if (!data.dispatcher) {
	    data.disabled = false;
	
	    data.dispatcher = function (event){
	
	      if (data.disabled) return;
	      event = vjs.fixEvent(event);
	
	      var handlers = data.handlers[event.type];
	
	      if (handlers) {
	        // Copy handlers so if handlers are added/removed during the process it doesn't throw everything off.
	        var handlersCopy = handlers.slice(0);
	
	        for (var m = 0, n = handlersCopy.length; m < n; m++) {
	          if (event.isImmediatePropagationStopped()) {
	            break;
	          } else {
	            handlersCopy[m].call(elem, event);
	          }
	        }
	      }
	    };
	  }
	
	  if (data.handlers[type].length == 1) {
	    if (elem.addEventListener) {
	      elem.addEventListener(type, data.dispatcher, false);
	    } else if (elem.attachEvent) {
	      elem.attachEvent('on' + type, data.dispatcher);
	    }
	  }
	};
	
	/**
	 * Removes event listeners from an element
	 * @param  {Element|Object}   elem Object to remove listeners from
	 * @param  {String|Array=}   type Type of listener to remove. Don't include to remove all events from element.
	 * @param  {Function} fn   Specific listener to remove. Don't include to remove listeners for an event type.
	 * @private
	 */
	vjs.off = function(elem, type, fn) {
	  // Don't want to add a cache object through getData if not needed
	  if (!vjs.hasData(elem)) return;
	
	  var data = vjs.getData(elem);
	
	  // If no events exist, nothing to unbind
	  if (!data.handlers) { return; }
	
	  if (vjs.obj.isArray(type)) {
	    return _handleMultipleEvents(vjs.off, elem, type, fn);
	  }
	
	  // Utility function
	  var removeType = function(t){
	     data.handlers[t] = [];
	     vjs.cleanUpEvents(elem,t);
	  };
	
	  // Are we removing all bound events?
	  if (!type) {
	    for (var t in data.handlers) removeType(t);
	    return;
	  }
	
	  var handlers = data.handlers[type];
	
	  // If no handlers exist, nothing to unbind
	  if (!handlers) return;
	
	  // If no listener was provided, remove all listeners for type
	  if (!fn) {
	    removeType(type);
	    return;
	  }
	
	  // We're only removing a single handler
	  if (fn.guid) {
	    for (var n = 0; n < handlers.length; n++) {
	      if (handlers[n].guid === fn.guid) {
	        handlers.splice(n--, 1);
	      }
	    }
	  }
	
	  vjs.cleanUpEvents(elem, type);
	};
	
	/**
	 * Clean up the listener cache and dispatchers
	 * @param  {Element|Object} elem Element to clean up
	 * @param  {String} type Type of event to clean up
	 * @private
	 */
	vjs.cleanUpEvents = function(elem, type) {
	  var data = vjs.getData(elem);
	
	  // Remove the events of a particular type if there are none left
	  if (data.handlers[type].length === 0) {
	    delete data.handlers[type];
	    // data.handlers[type] = null;
	    // Setting to null was causing an error with data.handlers
	
	    // Remove the meta-handler from the element
	    if (elem.removeEventListener) {
	      elem.removeEventListener(type, data.dispatcher, false);
	    } else if (elem.detachEvent) {
	      elem.detachEvent('on' + type, data.dispatcher);
	    }
	  }
	
	  // Remove the events object if there are no types left
	  if (vjs.isEmpty(data.handlers)) {
	    delete data.handlers;
	    delete data.dispatcher;
	    delete data.disabled;
	
	    // data.handlers = null;
	    // data.dispatcher = null;
	    // data.disabled = null;
	  }
	
	  // Finally remove the expando if there is no data left
	  if (vjs.isEmpty(data)) {
	    vjs.removeData(elem);
	  }
	};
	
	/**
	 * Fix a native event to have standard property values
	 * @param  {Object} event Event object to fix
	 * @return {Object}
	 * @private
	 */
	vjs.fixEvent = function(event) {
	
	  function returnTrue() { return true; }
	  function returnFalse() { return false; }
	
	  // Test if fixing up is needed
	  // Used to check if !event.stopPropagation instead of isPropagationStopped
	  // But native events return true for stopPropagation, but don't have
	  // other expected methods like isPropagationStopped. Seems to be a problem
	  // with the Javascript Ninja code. So we're just overriding all events now.
	  if (!event || !event.isPropagationStopped) {
	    var old = event || window.event;
	
	    event = {};
	    // Clone the old object so that we can modify the values event = {};
	    // IE8 Doesn't like when you mess with native event properties
	    // Firefox returns false for event.hasOwnProperty('type') and other props
	    //  which makes copying more difficult.
	    // TODO: Probably best to create a whitelist of event props
	    for (var key in old) {
	      // Safari 6.0.3 warns you if you try to copy deprecated layerX/Y
	      // Chrome warns you if you try to copy deprecated keyboardEvent.keyLocation
	      if (key !== 'layerX' && key !== 'layerY' && key !== 'keyLocation') {
	        // Chrome 32+ warns if you try to copy deprecated returnValue, but
	        // we still want to if preventDefault isn't supported (IE8).
	        if (!(key == 'returnValue' && old.preventDefault)) {
	          event[key] = old[key];
	        }
	      }
	    }
	
	    // The event occurred on this element
	    if (!event.target) {
	      event.target = event.srcElement || document;
	    }
	
	    // Handle which other element the event is related to
	    event.relatedTarget = event.fromElement === event.target ?
	      event.toElement :
	      event.fromElement;
	
	    // Stop the default browser action
	    event.preventDefault = function () {
	      if (old.preventDefault) {
	        old.preventDefault();
	      }
	      event.returnValue = false;
	      event.isDefaultPrevented = returnTrue;
	      event.defaultPrevented = true;
	    };
	
	    event.isDefaultPrevented = returnFalse;
	    event.defaultPrevented = false;
	
	    // Stop the event from bubbling
	    event.stopPropagation = function () {
	      if (old.stopPropagation) {
	        old.stopPropagation();
	      }
	      event.cancelBubble = true;
	      event.isPropagationStopped = returnTrue;
	    };
	
	    event.isPropagationStopped = returnFalse;
	
	    // Stop the event from bubbling and executing other handlers
	    event.stopImmediatePropagation = function () {
	      if (old.stopImmediatePropagation) {
	        old.stopImmediatePropagation();
	      }
	      event.isImmediatePropagationStopped = returnTrue;
	      event.stopPropagation();
	    };
	
	    event.isImmediatePropagationStopped = returnFalse;
	
	    // Handle mouse position
	    if (event.clientX != null) {
	      var doc = document.documentElement, body = document.body;
	
	      event.pageX = event.clientX +
	        (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
	        (doc && doc.clientLeft || body && body.clientLeft || 0);
	      event.pageY = event.clientY +
	        (doc && doc.scrollTop || body && body.scrollTop || 0) -
	        (doc && doc.clientTop || body && body.clientTop || 0);
	    }
	
	    // Handle key presses
	    event.which = event.charCode || event.keyCode;
	
	    // Fix button for mouse clicks:
	    // 0 == left; 1 == middle; 2 == right
	    if (event.button != null) {
	      event.button = (event.button & 1 ? 0 :
	        (event.button & 4 ? 1 :
	          (event.button & 2 ? 2 : 0)));
	    }
	  }
	
	  // Returns fixed-up instance
	  return event;
	};
	
	/**
	 * Trigger an event for an element
	 * @param  {Element|Object}      elem  Element to trigger an event on
	 * @param  {Event|Object|String} event A string (the type) or an event object with a type attribute
	 * @private
	 */
	vjs.trigger = function(elem, event) {
	  // Fetches element data and a reference to the parent (for bubbling).
	  // Don't want to add a data object to cache for every parent,
	  // so checking hasData first.
	  var elemData = (vjs.hasData(elem)) ? vjs.getData(elem) : {};
	  var parent = elem.parentNode || elem.ownerDocument;
	      // type = event.type || event,
	      // handler;
	
	  // If an event name was passed as a string, creates an event out of it
	  if (typeof event === 'string') {
	    event = { type:event, target:elem };
	  }
	  // Normalizes the event properties.
	  event = vjs.fixEvent(event);
	
	  // If the passed element has a dispatcher, executes the established handlers.
	  if (elemData.dispatcher) {
	    elemData.dispatcher.call(elem, event);
	  }
	
	  // Unless explicitly stopped or the event does not bubble (e.g. media events)
	    // recursively calls this function to bubble the event up the DOM.
	    if (parent && !event.isPropagationStopped() && event.bubbles !== false) {
	    vjs.trigger(parent, event);
	
	  // If at the top of the DOM, triggers the default action unless disabled.
	  } else if (!parent && !event.defaultPrevented) {
	    var targetData = vjs.getData(event.target);
	
	    // Checks if the target has a default action for this event.
	    if (event.target[event.type]) {
	      // Temporarily disables event dispatching on the target as we have already executed the handler.
	      targetData.disabled = true;
	      // Executes the default action.
	      if (typeof event.target[event.type] === 'function') {
	        event.target[event.type]();
	      }
	      // Re-enables event dispatching.
	      targetData.disabled = false;
	    }
	  }
	
	  // Inform the triggerer if the default was prevented by returning false
	  return !event.defaultPrevented;
	  /* Original version of js ninja events wasn't complete.
	   * We've since updated to the latest version, but keeping this around
	   * for now just in case.
	   */
	  // // Added in addition to book. Book code was broke.
	  // event = typeof event === 'object' ?
	  //   event[vjs.expando] ?
	  //     event :
	  //     new vjs.Event(type, event) :
	  //   new vjs.Event(type);
	
	  // event.type = type;
	  // if (handler) {
	  //   handler.call(elem, event);
	  // }
	
	  // // Clean up the event in case it is being reused
	  // event.result = undefined;
	  // event.target = elem;
	};
	
	/**
	 * Trigger a listener only once for an event
	 * @param  {Element|Object}   elem Element or object to
	 * @param  {String|Array}   type
	 * @param  {Function} fn
	 * @private
	 */
	vjs.one = function(elem, type, fn) {
	  if (vjs.obj.isArray(type)) {
	    return _handleMultipleEvents(vjs.one, elem, type, fn);
	  }
	  var func = function(){
	    vjs.off(elem, type, func);
	    fn.apply(this, arguments);
	  };
	  // copy the guid to the new function so it can removed using the original function's ID
	  func.guid = fn.guid = fn.guid || vjs.guid++;
	  vjs.on(elem, type, func);
	};
	
	/**
	 * Loops through an array of event types and calls the requested method for each type.
	 * @param  {Function} fn   The event method we want to use.
	 * @param  {Element|Object} elem Element or object to bind listeners to
	 * @param  {String}   type Type of event to bind to.
	 * @param  {Function} callback   Event listener.
	 * @private
	 */
	function _handleMultipleEvents(fn, elem, type, callback) {
	  vjs.arr.forEach(type, function(type) {
	    fn(elem, type, callback); //Call the event method for each one of the types
	  });
	}
	var hasOwnProp = Object.prototype.hasOwnProperty;
	
	/**
	 * Creates an element and applies properties.
	 * @param  {String=} tagName    Name of tag to be created.
	 * @param  {Object=} properties Element properties to be applied.
	 * @return {Element}
	 * @private
	 */
	vjs.createEl = function(tagName, properties){
	  var el;
	
	  tagName = tagName || 'div';
	  properties = properties || {};
	
	  el = document.createElement(tagName);
	
	  vjs.obj.each(properties, function(propName, val){
	    // Not remembering why we were checking for dash
	    // but using setAttribute means you have to use getAttribute
	
	    // The check for dash checks for the aria-* attributes, like aria-label, aria-valuemin.
	    // The additional check for "role" is because the default method for adding attributes does not
	    // add the attribute "role". My guess is because it's not a valid attribute in some namespaces, although
	    // browsers handle the attribute just fine. The W3C allows for aria-* attributes to be used in pre-HTML5 docs.
	    // http://www.w3.org/TR/wai-aria-primer/#ariahtml. Using setAttribute gets around this problem.
	    if (propName.indexOf('aria-') !== -1 || propName == 'role') {
	     el.setAttribute(propName, val);
	    } else {
	     el[propName] = val;
	    }
	  });
	
	  return el;
	};
	
	/**
	 * Uppercase the first letter of a string
	 * @param  {String} string String to be uppercased
	 * @return {String}
	 * @private
	 */
	vjs.capitalize = function(string){
	  return string.charAt(0).toUpperCase() + string.slice(1);
	};
	
	/**
	 * Object functions container
	 * @type {Object}
	 * @private
	 */
	vjs.obj = {};
	
	/**
	 * Object.create shim for prototypal inheritance
	 *
	 * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create
	 *
	 * @function
	 * @param  {Object}   obj Object to use as prototype
	 * @private
	 */
	vjs.obj.create = Object.create || function(obj){
	  //Create a new function called 'F' which is just an empty object.
	  function F() {}
	
	  //the prototype of the 'F' function should point to the
	  //parameter of the anonymous function.
	  F.prototype = obj;
	
	  //create a new constructor function based off of the 'F' function.
	  return new F();
	};
	
	/**
	 * Loop through each property in an object and call a function
	 * whose arguments are (key,value)
	 * @param  {Object}   obj Object of properties
	 * @param  {Function} fn  Function to be called on each property.
	 * @this {*}
	 * @private
	 */
	vjs.obj.each = function(obj, fn, context){
	  for (var key in obj) {
	    if (hasOwnProp.call(obj, key)) {
	      fn.call(context || this, key, obj[key]);
	    }
	  }
	};
	
	/**
	 * Merge two objects together and return the original.
	 * @param  {Object} obj1
	 * @param  {Object} obj2
	 * @return {Object}
	 * @private
	 */
	vjs.obj.merge = function(obj1, obj2){
	  if (!obj2) { return obj1; }
	  for (var key in obj2){
	    if (hasOwnProp.call(obj2, key)) {
	      obj1[key] = obj2[key];
	    }
	  }
	  return obj1;
	};
	
	/**
	 * Merge two objects, and merge any properties that are objects
	 * instead of just overwriting one. Uses to merge options hashes
	 * where deeper default settings are important.
	 * @param  {Object} obj1 Object to override
	 * @param  {Object} obj2 Overriding object
	 * @return {Object}      New object. Obj1 and Obj2 will be untouched.
	 * @private
	 */
	vjs.obj.deepMerge = function(obj1, obj2){
	  var key, val1, val2;
	
	  // make a copy of obj1 so we're not overwriting original values.
	  // like prototype.options_ and all sub options objects
	  obj1 = vjs.obj.copy(obj1);
	
	  for (key in obj2){
	    if (hasOwnProp.call(obj2, key)) {
	      val1 = obj1[key];
	      val2 = obj2[key];
	
	      // Check if both properties are pure objects and do a deep merge if so
	      if (vjs.obj.isPlain(val1) && vjs.obj.isPlain(val2)) {
	        obj1[key] = vjs.obj.deepMerge(val1, val2);
	      } else {
	        obj1[key] = obj2[key];
	      }
	    }
	  }
	  return obj1;
	};
	
	/**
	 * Make a copy of the supplied object
	 * @param  {Object} obj Object to copy
	 * @return {Object}     Copy of object
	 * @private
	 */
	vjs.obj.copy = function(obj){
	  return vjs.obj.merge({}, obj);
	};
	
	/**
	 * Check if an object is plain, and not a dom node or any object sub-instance
	 * @param  {Object} obj Object to check
	 * @return {Boolean}     True if plain, false otherwise
	 * @private
	 */
	vjs.obj.isPlain = function(obj){
	  return !!obj
	    && typeof obj === 'object'
	    && obj.toString() === '[object Object]'
	    && obj.constructor === Object;
	};
	
	/**
	 * Check if an object is Array
	*  Since instanceof Array will not work on arrays created in another frame we need to use Array.isArray, but since IE8 does not support Array.isArray we need this shim
	 * @param  {Object} obj Object to check
	 * @return {Boolean}     True if plain, false otherwise
	 * @private
	 */
	vjs.obj.isArray = Array.isArray || function(arr) {
	  return Object.prototype.toString.call(arr) === '[object Array]';
	};
	
	/**
	 * Check to see whether the input is NaN or not.
	 * NaN is the only JavaScript construct that isn't equal to itself
	 * @param {Number} num Number to check
	 * @return {Boolean} True if NaN, false otherwise
	 * @private
	 */
	vjs.isNaN = function(num) {
	  return num !== num;
	};
	
	/**
	 * Bind (a.k.a proxy or Context). A simple method for changing the context of a function
	   It also stores a unique id on the function so it can be easily removed from events
	 * @param  {*}   context The object to bind as scope
	 * @param  {Function} fn      The function to be bound to a scope
	 * @param  {Number=}   uid     An optional unique ID for the function to be set
	 * @return {Function}
	 * @private
	 */
	vjs.bind = function(context, fn, uid) {
	  // Make sure the function has a unique ID
	  if (!fn.guid) { fn.guid = vjs.guid++; }
	
	  // Create the new function that changes the context
	  var ret = function() {
	    return fn.apply(context, arguments);
	  };
	
	  // Allow for the ability to individualize this function
	  // Needed in the case where multiple objects might share the same prototype
	  // IF both items add an event listener with the same function, then you try to remove just one
	  // it will remove both because they both have the same guid.
	  // when using this, you need to use the bind method when you remove the listener as well.
	  // currently used in text tracks
	  ret.guid = (uid) ? uid + '_' + fn.guid : fn.guid;
	
	  return ret;
	};
	
	/**
	 * Element Data Store. Allows for binding data to an element without putting it directly on the element.
	 * Ex. Event listeners are stored here.
	 * (also from jsninja.com, slightly modified and updated for closure compiler)
	 * @type {Object}
	 * @private
	 */
	vjs.cache = {};
	
	/**
	 * Unique ID for an element or function
	 * @type {Number}
	 * @private
	 */
	vjs.guid = 1;
	
	/**
	 * Unique attribute name to store an element's guid in
	 * @type {String}
	 * @constant
	 * @private
	 */
	vjs.expando = 'vdata' + (new Date()).getTime();
	
	/**
	 * Returns the cache object where data for an element is stored
	 * @param  {Element} el Element to store data for.
	 * @return {Object}
	 * @private
	 */
	vjs.getData = function(el){
	  var id = el[vjs.expando];
	  if (!id) {
	    id = el[vjs.expando] = vjs.guid++;
	  }
	  if (!vjs.cache[id]) {
	    vjs.cache[id] = {};
	  }
	  return vjs.cache[id];
	};
	
	/**
	 * Returns the cache object where data for an element is stored
	 * @param  {Element} el Element to store data for.
	 * @return {Object}
	 * @private
	 */
	vjs.hasData = function(el){
	  var id = el[vjs.expando];
	  return !(!id || vjs.isEmpty(vjs.cache[id]));
	};
	
	/**
	 * Delete data for the element from the cache and the guid attr from getElementById
	 * @param  {Element} el Remove data for an element
	 * @private
	 */
	vjs.removeData = function(el){
	  var id = el[vjs.expando];
	  if (!id) { return; }
	  // Remove all stored data
	  // Changed to = null
	  // http://coding.smashingmagazine.com/2012/11/05/writing-fast-memory-efficient-javascript/
	  // vjs.cache[id] = null;
	  delete vjs.cache[id];
	
	  // Remove the expando property from the DOM node
	  try {
	    delete el[vjs.expando];
	  } catch(e) {
	    if (el.removeAttribute) {
	      el.removeAttribute(vjs.expando);
	    } else {
	      // IE doesn't appear to support removeAttribute on the document element
	      el[vjs.expando] = null;
	    }
	  }
	};
	
	/**
	 * Check if an object is empty
	 * @param  {Object}  obj The object to check for emptiness
	 * @return {Boolean}
	 * @private
	 */
	vjs.isEmpty = function(obj) {
	  for (var prop in obj) {
	    // Inlude null properties as empty.
	    if (obj[prop] !== null) {
	      return false;
	    }
	  }
	  return true;
	};
	
	/**
	 * Check if an element has a CSS class
	 * @param {Element} element Element to check
	 * @param {String} classToCheck Classname to check
	 * @private
	 */
	vjs.hasClass = function(element, classToCheck){
	  return ((' ' + element.className + ' ').indexOf(' ' + classToCheck + ' ') !== -1);
	};
	
	
	/**
	 * Add a CSS class name to an element
	 * @param {Element} element    Element to add class name to
	 * @param {String} classToAdd Classname to add
	 * @private
	 */
	vjs.addClass = function(element, classToAdd){
	  if (!vjs.hasClass(element, classToAdd)) {
	    element.className = element.className === '' ? classToAdd : element.className + ' ' + classToAdd;
	  }
	};
	
	/**
	 * Remove a CSS class name from an element
	 * @param {Element} element    Element to remove from class name
	 * @param {String} classToAdd Classname to remove
	 * @private
	 */
	vjs.removeClass = function(element, classToRemove){
	  var classNames, i;
	
	  if (!vjs.hasClass(element, classToRemove)) {return;}
	
	  classNames = element.className.split(' ');
	
	  // no arr.indexOf in ie8, and we don't want to add a big shim
	  for (i = classNames.length - 1; i >= 0; i--) {
	    if (classNames[i] === classToRemove) {
	      classNames.splice(i,1);
	    }
	  }
	
	  element.className = classNames.join(' ');
	};
	
	/**
	 * Element for testing browser HTML5 video capabilities
	 * @type {Element}
	 * @constant
	 * @private
	 */
	vjs.TEST_VID = vjs.createEl('video');
	(function() {
	  var track = document.createElement('track');
	  track.kind = 'captions';
	  track.srclang = 'en';
	  track.label = 'English';
	  vjs.TEST_VID.appendChild(track);
	})();
	
	/**
	 * Useragent for browser testing.
	 * @type {String}
	 * @constant
	 * @private
	 */
	vjs.USER_AGENT = navigator.userAgent;
	
	/**
	 * Device is an iPhone
	 * @type {Boolean}
	 * @constant
	 * @private
	 */
	vjs.IS_IPHONE = (/iPhone/i).test(vjs.USER_AGENT);
	vjs.IS_IPAD = (/iPad/i).test(vjs.USER_AGENT);
	vjs.IS_IPOD = (/iPod/i).test(vjs.USER_AGENT);
	vjs.IS_IOS = vjs.IS_IPHONE || vjs.IS_IPAD || vjs.IS_IPOD;
	
	vjs.IOS_VERSION = (function(){
	  var match = vjs.USER_AGENT.match(/OS (\d+)_/i);
	  if (match && match[1]) { return match[1]; }
	})();
	
	vjs.IS_ANDROID = (/Android/i).test(vjs.USER_AGENT);
	vjs.ANDROID_VERSION = (function() {
	  // This matches Android Major.Minor.Patch versions
	  // ANDROID_VERSION is Major.Minor as a Number, if Minor isn't available, then only Major is returned
	  var match = vjs.USER_AGENT.match(/Android (\d+)(?:\.(\d+))?(?:\.(\d+))*/i),
	    major,
	    minor;
	
	  if (!match) {
	    return null;
	  }
	
	  major = match[1] && parseFloat(match[1]);
	  minor = match[2] && parseFloat(match[2]);
	
	  if (major && minor) {
	    return parseFloat(match[1] + '.' + match[2]);
	  } else if (major) {
	    return major;
	  } else {
	    return null;
	  }
	})();
	// Old Android is defined as Version older than 2.3, and requiring a webkit version of the android browser
	vjs.IS_OLD_ANDROID = vjs.IS_ANDROID && (/webkit/i).test(vjs.USER_AGENT) && vjs.ANDROID_VERSION < 2.3;
	
	vjs.IS_FIREFOX = (/Firefox/i).test(vjs.USER_AGENT);
	vjs.IS_CHROME = (/Chrome/i).test(vjs.USER_AGENT);
	vjs.IS_IE8 = (/MSIE\s8\.0/).test(vjs.USER_AGENT);
	
	vjs.TOUCH_ENABLED = !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch);
	vjs.BACKGROUND_SIZE_SUPPORTED = 'backgroundSize' in vjs.TEST_VID.style;
	
	/**
	 * Apply attributes to an HTML element.
	 * @param  {Element} el         Target element.
	 * @param  {Object=} attributes Element attributes to be applied.
	 * @private
	 */
	vjs.setElementAttributes = function(el, attributes){
	  vjs.obj.each(attributes, function(attrName, attrValue) {
	    if (attrValue === null || typeof attrValue === 'undefined' || attrValue === false) {
	      el.removeAttribute(attrName);
	    } else {
	      el.setAttribute(attrName, (attrValue === true ? '' : attrValue));
	    }
	  });
	};
	
	/**
	 * Get an element's attribute values, as defined on the HTML tag
	 * Attributes are not the same as properties. They're defined on the tag
	 * or with setAttribute (which shouldn't be used with HTML)
	 * This will return true or false for boolean attributes.
	 * @param  {Element} tag Element from which to get tag attributes
	 * @return {Object}
	 * @private
	 */
	vjs.getElementAttributes = function(tag){
	  var obj, knownBooleans, attrs, attrName, attrVal;
	
	  obj = {};
	
	  // known boolean attributes
	  // we can check for matching boolean properties, but older browsers
	  // won't know about HTML5 boolean attributes that we still read from
	  knownBooleans = ','+'autoplay,controls,loop,muted,default'+',';
	
	  if (tag && tag.attributes && tag.attributes.length > 0) {
	    attrs = tag.attributes;
	
	    for (var i = attrs.length - 1; i >= 0; i--) {
	      attrName = attrs[i].name;
	      attrVal = attrs[i].value;
	
	      // check for known booleans
	      // the matching element property will return a value for typeof
	      if (typeof tag[attrName] === 'boolean' || knownBooleans.indexOf(','+attrName+',') !== -1) {
	        // the value of an included boolean attribute is typically an empty
	        // string ('') which would equal false if we just check for a false value.
	        // we also don't want support bad code like autoplay='false'
	        attrVal = (attrVal !== null) ? true : false;
	      }
	
	      obj[attrName] = attrVal;
	    }
	  }
	
	  return obj;
	};
	
	/**
	 * Get the computed style value for an element
	 * From http://robertnyman.com/2006/04/24/get-the-rendered-style-of-an-element/
	 * @param  {Element} el        Element to get style value for
	 * @param  {String} strCssRule Style name
	 * @return {String}            Style value
	 * @private
	 */
	vjs.getComputedDimension = function(el, strCssRule){
	  var strValue = '';
	  if(document.defaultView && document.defaultView.getComputedStyle){
	    strValue = document.defaultView.getComputedStyle(el, '').getPropertyValue(strCssRule);
	
	  } else if(el.currentStyle){
	    // IE8 Width/Height support
	    strValue = el['client'+strCssRule.substr(0,1).toUpperCase() + strCssRule.substr(1)] + 'px';
	  }
	  return strValue;
	};
	
	/**
	 * Insert an element as the first child node of another
	 * @param  {Element} child   Element to insert
	 * @param  {[type]} parent Element to insert child into
	 * @private
	 */
	vjs.insertFirst = function(child, parent){
	  if (parent.firstChild) {
	    parent.insertBefore(child, parent.firstChild);
	  } else {
	    parent.appendChild(child);
	  }
	};
	
	/**
	 * Object to hold browser support information
	 * @type {Object}
	 * @private
	 */
	vjs.browser = {};
	
	/**
	 * Shorthand for document.getElementById()
	 * Also allows for CSS (jQuery) ID syntax. But nothing other than IDs.
	 * @param  {String} id  Element ID
	 * @return {Element}    Element with supplied ID
	 * @private
	 */
	vjs.el = function(id){
	  if (id.indexOf('#') === 0) {
	    id = id.slice(1);
	  }
	
	  return document.getElementById(id);
	};
	
	/**
	 * Format seconds as a time string, H:MM:SS or M:SS
	 * Supplying a guide (in seconds) will force a number of leading zeros
	 * to cover the length of the guide
	 * @param  {Number} seconds Number of seconds to be turned into a string
	 * @param  {Number} guide   Number (in seconds) to model the string after
	 * @return {String}         Time formatted as H:MM:SS or M:SS
	 * @private
	 */
	vjs.formatTime = function(seconds, guide) {
	  // Default to using seconds as guide
	  guide = guide || seconds;
	  var s = Math.floor(seconds % 60),
	      m = Math.floor(seconds / 60 % 60),
	      h = Math.floor(seconds / 3600),
	      gm = Math.floor(guide / 60 % 60),
	      gh = Math.floor(guide / 3600);
	
	  // handle invalid times
	  if (isNaN(seconds) || seconds === Infinity) {
	    // '-' is false for all relational operators (e.g. <, >=) so this setting
	    // will add the minimum number of fields specified by the guide
	    h = m = s = '-';
	  }
	
	  // Check if we need to show hours
	  h = (h > 0 || gh > 0) ? h + ':' : '';
	
	  // If hours are showing, we may need to add a leading zero.
	  // Always show at least one digit of minutes.
	  m = (((h || gm >= 10) && m < 10) ? '0' + m : m) + ':';
	
	  // Check if leading zero is need for seconds
	  s = (s < 10) ? '0' + s : s;
	
	  return h + m + s;
	};
	
	// Attempt to block the ability to select text while dragging controls
	vjs.blockTextSelection = function(){
	  document.body.focus();
	  document.onselectstart = function () { return false; };
	};
	// Turn off text selection blocking
	vjs.unblockTextSelection = function(){ document.onselectstart = function () { return true; }; };
	
	/**
	 * Trim whitespace from the ends of a string.
	 * @param  {String} string String to trim
	 * @return {String}        Trimmed string
	 * @private
	 */
	vjs.trim = function(str){
	  return (str+'').replace(/^\s+|\s+$/g, '');
	};
	
	/**
	 * Should round off a number to a decimal place
	 * @param  {Number} num Number to round
	 * @param  {Number} dec Number of decimal places to round to
	 * @return {Number}     Rounded number
	 * @private
	 */
	vjs.round = function(num, dec) {
	  if (!dec) { dec = 0; }
	  return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	};
	
	/**
	 * Should create a fake TimeRange object
	 * Mimics an HTML5 time range instance, which has functions that
	 * return the start and end times for a range
	 * TimeRanges are returned by the buffered() method
	 * @param  {Number} start Start time in seconds
	 * @param  {Number} end   End time in seconds
	 * @return {Object}       Fake TimeRange object
	 * @private
	 */
	vjs.createTimeRange = function(start, end){
	  if (start === undefined && end === undefined) {
	    return {
	      length: 0,
	      start: function() {
	        throw new Error('This TimeRanges object is empty');
	      },
	      end: function() {
	        throw new Error('This TimeRanges object is empty');
	      }
	    };
	  }
	
	  return {
	    length: 1,
	    start: function() { return start; },
	    end: function() { return end; }
	  };
	};
	
	/**
	 * Add to local storage (may removable)
	 * @private
	 */
	vjs.setLocalStorage = function(key, value){
	  try {
	    // IE was throwing errors referencing the var anywhere without this
	    var localStorage = window.localStorage || false;
	    if (!localStorage) { return; }
	    localStorage[key] = value;
	  } catch(e) {
	    if (e.code == 22 || e.code == 1014) { // Webkit == 22 / Firefox == 1014
	      vjs.log('LocalStorage Full (VideoJS)', e);
	    } else {
	      if (e.code == 18) {
	        vjs.log('LocalStorage not allowed (VideoJS)', e);
	      } else {
	        vjs.log('LocalStorage Error (VideoJS)', e);
	      }
	    }
	  }
	};
	
	/**
	 * Get absolute version of relative URL. Used to tell flash correct URL.
	 * http://stackoverflow.com/questions/470832/getting-an-absolute-url-from-a-relative-one-ie6-issue
	 * @param  {String} url URL to make absolute
	 * @return {String}     Absolute URL
	 * @private
	 */
	vjs.getAbsoluteURL = function(url){
	
	  // Check if absolute URL
	  if (!url.match(/^https?:\/\//)) {
	    // Convert to absolute URL. Flash hosted off-site needs an absolute URL.
	    url = vjs.createEl('div', {
	      innerHTML: '<a href="'+url+'">x</a>'
	    }).firstChild.href;
	  }
	
	  return url;
	};
	
	
	/**
	 * Resolve and parse the elements of a URL
	 * @param  {String} url The url to parse
	 * @return {Object}     An object of url details
	 */
	vjs.parseUrl = function(url) {
	  var div, a, addToBody, props, details;
	
	  props = ['protocol', 'hostname', 'port', 'pathname', 'search', 'hash', 'host'];
	
	  // add the url to an anchor and let the browser parse the URL
	  a = vjs.createEl('a', { href: url });
	
	  // IE8 (and 9?) Fix
	  // ie8 doesn't parse the URL correctly until the anchor is actually
	  // added to the body, and an innerHTML is needed to trigger the parsing
	  addToBody = (a.host === '' && a.protocol !== 'file:');
	  if (addToBody) {
	    div = vjs.createEl('div');
	    div.innerHTML = '<a href="'+url+'"></a>';
	    a = div.firstChild;
	    // prevent the div from affecting layout
	    div.setAttribute('style', 'display:none; position:absolute;');
	    document.body.appendChild(div);
	  }
	
	  // Copy the specific URL properties to a new object
	  // This is also needed for IE8 because the anchor loses its
	  // properties when it's removed from the dom
	  details = {};
	  for (var i = 0; i < props.length; i++) {
	    details[props[i]] = a[props[i]];
	  }
	
	  // IE9 adds the port to the host property unlike everyone else. If
	  // a port identifier is added for standard ports, strip it.
	  if (details.protocol === 'http:') {
	    details.host = details.host.replace(/:80$/, '');
	  }
	  if (details.protocol === 'https:') {
	    details.host = details.host.replace(/:443$/, '');
	  }
	
	  if (addToBody) {
	    document.body.removeChild(div);
	  }
	
	  return details;
	};
	
	/**
	 * Log messages to the console and history based on the type of message
	 *
	 * @param  {String} type The type of message, or `null` for `log`
	 * @param  {[type]} args The args to be passed to the log
	 * @private
	 */
	function _logType(type, args){
	  var argsArray, noop, console;
	
	  // convert args to an array to get array functions
	  argsArray = Array.prototype.slice.call(args);
	  // if there's no console then don't try to output messages
	  // they will still be stored in vjs.log.history
	  // Was setting these once outside of this function, but containing them
	  // in the function makes it easier to test cases where console doesn't exist
	  noop = function(){};
	  console = window['console'] || {
	    'log': noop,
	    'warn': noop,
	    'error': noop
	  };
	
	  if (type) {
	    // add the type to the front of the message
	    argsArray.unshift(type.toUpperCase()+':');
	  } else {
	    // default to log with no prefix
	    type = 'log';
	  }
	
	  // add to history
	  vjs.log.history.push(argsArray);
	
	  // add console prefix after adding to history
	  argsArray.unshift('VIDEOJS:');
	
	  // call appropriate log function
	  if (console[type].apply) {
	    console[type].apply(console, argsArray);
	  } else {
	    // ie8 doesn't allow error.apply, but it will just join() the array anyway
	    console[type](argsArray.join(' '));
	  }
	}
	
	/**
	 * Log plain debug messages
	 */
	vjs.log = function(){
	  _logType(null, arguments);
	};
	
	/**
	 * Keep a history of log messages
	 * @type {Array}
	 */
	vjs.log.history = [];
	
	/**
	 * Log error messages
	 */
	vjs.log.error = function(){
	  _logType('error', arguments);
	};
	
	/**
	 * Log warning messages
	 */
	vjs.log.warn = function(){
	  _logType('warn', arguments);
	};
	
	// Offset Left
	// getBoundingClientRect technique from John Resig http://ejohn.org/blog/getboundingclientrect-is-awesome/
	vjs.findPosition = function(el) {
	  var box, docEl, body, clientLeft, scrollLeft, left, clientTop, scrollTop, top;
	
	  if (el.getBoundingClientRect && el.parentNode) {
	    box = el.getBoundingClientRect();
	  }
	
	  if (!box) {
	    return {
	      left: 0,
	      top: 0
	    };
	  }
	
	  docEl = document.documentElement;
	  body = document.body;
	
	  clientLeft = docEl.clientLeft || body.clientLeft || 0;
	  scrollLeft = window.pageXOffset || body.scrollLeft;
	  left = box.left + scrollLeft - clientLeft;
	
	  clientTop = docEl.clientTop || body.clientTop || 0;
	  scrollTop = window.pageYOffset || body.scrollTop;
	  top = box.top + scrollTop - clientTop;
	
	  // Android sometimes returns slightly off decimal values, so need to round
	  return {
	    left: vjs.round(left),
	    top: vjs.round(top)
	  };
	};
	
	/**
	 * Array functions container
	 * @type {Object}
	 * @private
	 */
	vjs.arr = {};
	
	/*
	 * Loops through an array and runs a function for each item inside it.
	 * @param  {Array}    array       The array
	 * @param  {Function} callback    The function to be run for each item
	 * @param  {*}        thisArg     The `this` binding of callback
	 * @returns {Array}               The array
	 * @private
	 */
	vjs.arr.forEach = function(array, callback, thisArg) {
	  if (vjs.obj.isArray(array) && callback instanceof Function) {
	    for (var i = 0, len = array.length; i < len; ++i) {
	      callback.call(thisArg || vjs, array[i], i, array);
	    }
	  }
	
	  return array;
	};
	/**
	 * Simple http request for retrieving external files (e.g. text tracks)
	 *
	 * ##### Example
	 *
	 *     // using url string
	 *     videojs.xhr('http://example.com/myfile.vtt', function(error, response, responseBody){});
	 *
	 *     // or options block
	 *     videojs.xhr({
	 *       uri: 'http://example.com/myfile.vtt',
	 *       method: 'GET',
	 *       responseType: 'text'
	 *     }, function(error, response, responseBody){
	 *       if (error) {
	 *         // log the error
	 *       } else {
	 *         // successful, do something with the response
	 *       }
	 *     });
	 *
	 *
	 * API is modeled after the Raynos/xhr, which we hope to use after
	 * getting browserify implemented.
	 * https://github.com/Raynos/xhr/blob/master/index.js
	 *
	 * @param  {Object|String}  options   Options block or URL string
	 * @param  {Function}       callback  The callback function
	 * @returns {Object}                  The request
	 */
	vjs.xhr = function(options, callback){
	  var XHR, request, urlInfo, winLoc, fileUrl, crossOrigin, abortTimeout, successHandler, errorHandler;
	
	  // If options is a string it's the url
	  if (typeof options === 'string') {
	    options = {
	      uri: options
	    };
	  }
	
	  // Merge with default options
	  videojs.util.mergeOptions({
	    method: 'GET',
	    timeout: 45 * 1000
	  }, options);
	
	  callback = callback || function(){};
	
	  successHandler = function(){
	    window.clearTimeout(abortTimeout);
	    callback(null, request, request.response || request.responseText);
	  };
	
	  errorHandler = function(err){
	    window.clearTimeout(abortTimeout);
	
	    if (!err || typeof err === 'string') {
	      err = new Error(err);
	    }
	
	    callback(err, request);
	  };
	
	  XHR = window.XMLHttpRequest;
	
	  if (typeof XHR === 'undefined') {
	    // Shim XMLHttpRequest for older IEs
	    XHR = function () {
	      try { return new window.ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch (e) {}
	      try { return new window.ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch (f) {}
	      try { return new window.ActiveXObject('Msxml2.XMLHTTP'); } catch (g) {}
	      throw new Error('This browser does not support XMLHttpRequest.');
	    };
	  }
	
	  request = new XHR();
	  // Store a reference to the url on the request instance
	  request.uri = options.uri;
	
	  urlInfo = vjs.parseUrl(options.uri);
	  winLoc = window.location;
	  // Check if url is for another domain/origin
	  // IE8 doesn't know location.origin, so we won't rely on it here
	  crossOrigin = (urlInfo.protocol + urlInfo.host) !== (winLoc.protocol + winLoc.host);
	
	  // XDomainRequest -- Use for IE if XMLHTTPRequest2 isn't available
	  // 'withCredentials' is only available in XMLHTTPRequest2
	  // Also XDomainRequest has a lot of gotchas, so only use if cross domain
	  if (crossOrigin && window.XDomainRequest && !('withCredentials' in request)) {
	    request = new window.XDomainRequest();
	    request.onload = successHandler;
	    request.onerror = errorHandler;
	    // These blank handlers need to be set to fix ie9
	    // http://cypressnorth.com/programming/internet-explorer-aborting-ajax-requests-fixed/
	    request.onprogress = function(){};
	    request.ontimeout = function(){};
	
	  // XMLHTTPRequest
	  } else {
	    fileUrl = (urlInfo.protocol == 'file:' || winLoc.protocol == 'file:');
	
	    request.onreadystatechange = function() {
	      if (request.readyState === 4) {
	        if (request.timedout) {
	          return errorHandler('timeout');
	        }
	
	        if (request.status === 200 || fileUrl && request.status === 0) {
	          successHandler();
	        } else {
	          errorHandler();
	        }
	      }
	    };
	
	    if (options.timeout) {
	      abortTimeout = window.setTimeout(function() {
	        if (request.readyState !== 4) {
	          request.timedout = true;
	          request.abort();
	        }
	      }, options.timeout);
	    }
	  }
	
	  // open the connection
	  try {
	    // Third arg is async, or ignored by XDomainRequest
	    request.open(options.method || 'GET', options.uri, true);
	  } catch(err) {
	    return errorHandler(err);
	  }
	
	  // withCredentials only supported by XMLHttpRequest2
	  if(options.withCredentials) {
	    request.withCredentials = true;
	  }
	
	  if (options.responseType) {
	    request.responseType = options.responseType;
	  }
	
	  // send the request
	  try {
	    request.send();
	  } catch(err) {
	    return errorHandler(err);
	  }
	
	  return request;
	};
	/**
	 * Utility functions namespace
	 * @namespace
	 * @type {Object}
	 */
	vjs.util = {};
	
	/**
	 * Merge two options objects, recursively merging any plain object properties as
	 * well.  Previously `deepMerge`
	 *
	 * @param  {Object} obj1 Object to override values in
	 * @param  {Object} obj2 Overriding object
	 * @return {Object}      New object -- obj1 and obj2 will be untouched
	 */
	vjs.util.mergeOptions = function(obj1, obj2){
	  var key, val1, val2;
	
	  // make a copy of obj1 so we're not overwriting original values.
	  // like prototype.options_ and all sub options objects
	  obj1 = vjs.obj.copy(obj1);
	
	  for (key in obj2){
	    if (obj2.hasOwnProperty(key)) {
	      val1 = obj1[key];
	      val2 = obj2[key];
	
	      // Check if both properties are pure objects and do a deep merge if so
	      if (vjs.obj.isPlain(val1) && vjs.obj.isPlain(val2)) {
	        obj1[key] = vjs.util.mergeOptions(val1, val2);
	      } else {
	        obj1[key] = obj2[key];
	      }
	    }
	  }
	  return obj1;
	};vjs.EventEmitter = function() {
	};
	
	vjs.EventEmitter.prototype.allowedEvents_ = {
	};
	
	vjs.EventEmitter.prototype.on = function(type, fn) {
	  // Remove the addEventListener alias before calling vjs.on
	  // so we don't get into an infinite type loop
	  var ael = this.addEventListener;
	  this.addEventListener = Function.prototype;
	  vjs.on(this, type, fn);
	  this.addEventListener = ael;
	};
	vjs.EventEmitter.prototype.addEventListener = vjs.EventEmitter.prototype.on;
	
	vjs.EventEmitter.prototype.off = function(type, fn) {
	  vjs.off(this, type, fn);
	};
	vjs.EventEmitter.prototype.removeEventListener = vjs.EventEmitter.prototype.off;
	
	vjs.EventEmitter.prototype.one = function(type, fn) {
	  vjs.one(this, type, fn);
	};
	
	vjs.EventEmitter.prototype.trigger = function(event) {
	  var type = event.type || event;
	
	  if (typeof event === 'string') {
	    event = {
	      type: type
	    };
	  }
	  event = vjs.fixEvent(event);
	
	  if (this.allowedEvents_[type] && this['on' + type]) {
	    this['on' + type](event);
	  }
	
	  vjs.trigger(this, event);
	};
	// The standard DOM EventTarget.dispatchEvent() is aliased to trigger()
	vjs.EventEmitter.prototype.dispatchEvent = vjs.EventEmitter.prototype.trigger;
	/**
	 * @fileoverview Player Component - Base class for all UI objects
	 *
	 */
	
	/**
	 * Base UI Component class
	 *
	 * Components are embeddable UI objects that are represented by both a
	 * javascript object and an element in the DOM. They can be children of other
	 * components, and can have many children themselves.
	 *
	 *     // adding a button to the player
	 *     var button = player.addChild('button');
	 *     button.el(); // -> button element
	 *
	 *     <div class="video-js">
	 *       <div class="vjs-button">Button</div>
	 *     </div>
	 *
	 * Components are also event emitters.
	 *
	 *     button.on('click', function(){
	 *       console.log('Button Clicked!');
	 *     });
	 *
	 *     button.trigger('customevent');
	 *
	 * @param {Object} player  Main Player
	 * @param {Object=} options
	 * @class
	 * @constructor
	 * @extends vjs.CoreObject
	 */
	vjs.Component = vjs.CoreObject.extend({
	  /**
	   * the constructor function for the class
	   *
	   * @constructor
	   */
	  init: function(player, options, ready){
	    this.player_ = player;
	
	    // Make a copy of prototype.options_ to protect against overriding global defaults
	    this.options_ = vjs.obj.copy(this.options_);
	
	    // Updated options with supplied options
	    options = this.options(options);
	
	    // Get ID from options or options element if one is supplied
	    this.id_ = options['id'] || (options['el'] && options['el']['id']);
	
	    // If there was no ID from the options, generate one
	    if (!this.id_) {
	      // Don't require the player ID function in the case of mock players
	      this.id_ = ((player.id && player.id()) || 'no_player') + '_component_' + vjs.guid++;
	    }
	
	    this.name_ = options['name'] || null;
	
	    // Create element if one wasn't provided in options
	    this.el_ = options['el'] || this.createEl();
	
	    this.children_ = [];
	    this.childIndex_ = {};
	    this.childNameIndex_ = {};
	
	    // Add any child components in options
	    this.initChildren();
	
	    this.ready(ready);
	    // Don't want to trigger ready here or it will before init is actually
	    // finished for all children that run this constructor
	
	    if (options.reportTouchActivity !== false) {
	      this.enableTouchActivity();
	    }
	  }
	});
	
	/**
	 * Dispose of the component and all child components
	 */
	vjs.Component.prototype.dispose = function(){
	  this.trigger({ type: 'dispose', 'bubbles': false });
	
	  // Dispose all children.
	  if (this.children_) {
	    for (var i = this.children_.length - 1; i >= 0; i--) {
	      if (this.children_[i].dispose) {
	        this.children_[i].dispose();
	      }
	    }
	  }
	
	  // Delete child references
	  this.children_ = null;
	  this.childIndex_ = null;
	  this.childNameIndex_ = null;
	
	  // Remove all event listeners.
	  this.off();
	
	  // Remove element from DOM
	  if (this.el_.parentNode) {
	    this.el_.parentNode.removeChild(this.el_);
	  }
	
	  vjs.removeData(this.el_);
	  this.el_ = null;
	};
	
	/**
	 * Reference to main player instance
	 *
	 * @type {vjs.Player}
	 * @private
	 */
	vjs.Component.prototype.player_ = true;
	
	/**
	 * Return the component's player
	 *
	 * @return {vjs.Player}
	 */
	vjs.Component.prototype.player = function(){
	  return this.player_;
	};
	
	/**
	 * The component's options object
	 *
	 * @type {Object}
	 * @private
	 */
	vjs.Component.prototype.options_;
	
	/**
	 * Deep merge of options objects
	 *
	 * Whenever a property is an object on both options objects
	 * the two properties will be merged using vjs.obj.deepMerge.
	 *
	 * This is used for merging options for child components. We
	 * want it to be easy to override individual options on a child
	 * component without having to rewrite all the other default options.
	 *
	 *     Parent.prototype.options_ = {
	 *       children: {
	 *         'childOne': { 'foo': 'bar', 'asdf': 'fdsa' },
	 *         'childTwo': {},
	 *         'childThree': {}
	 *       }
	 *     }
	 *     newOptions = {
	 *       children: {
	 *         'childOne': { 'foo': 'baz', 'abc': '123' }
	 *         'childTwo': null,
	 *         'childFour': {}
	 *       }
	 *     }
	 *
	 *     this.options(newOptions);
	 *
	 * RESULT
	 *
	 *     {
	 *       children: {
	 *         'childOne': { 'foo': 'baz', 'asdf': 'fdsa', 'abc': '123' },
	 *         'childTwo': null, // Disabled. Won't be initialized.
	 *         'childThree': {},
	 *         'childFour': {}
	 *       }
	 *     }
	 *
	 * @param  {Object} obj Object of new option values
	 * @return {Object}     A NEW object of this.options_ and obj merged
	 */
	vjs.Component.prototype.options = function(obj){
	  if (obj === undefined) return this.options_;
	
	  return this.options_ = vjs.util.mergeOptions(this.options_, obj);
	};
	
	/**
	 * The DOM element for the component
	 *
	 * @type {Element}
	 * @private
	 */
	vjs.Component.prototype.el_;
	
	/**
	 * Create the component's DOM element
	 *
	 * @param  {String=} tagName  Element's node type. e.g. 'div'
	 * @param  {Object=} attributes An object of element attributes that should be set on the element
	 * @return {Element}
	 */
	vjs.Component.prototype.createEl = function(tagName, attributes){
	  return vjs.createEl(tagName, attributes);
	};
	
	vjs.Component.prototype.localize = function(string){
	  var lang = this.player_.language(),
	      languages = this.player_.languages();
	  if (languages && languages[lang] && languages[lang][string]) {
	    return languages[lang][string];
	  }
	  return string;
	};
	
	/**
	 * Get the component's DOM element
	 *
	 *     var domEl = myComponent.el();
	 *
	 * @return {Element}
	 */
	vjs.Component.prototype.el = function(){
	  return this.el_;
	};
	
	/**
	 * An optional element where, if defined, children will be inserted instead of
	 * directly in `el_`
	 *
	 * @type {Element}
	 * @private
	 */
	vjs.Component.prototype.contentEl_;
	
	/**
	 * Return the component's DOM element for embedding content.
	 * Will either be el_ or a new element defined in createEl.
	 *
	 * @return {Element}
	 */
	vjs.Component.prototype.contentEl = function(){
	  return this.contentEl_ || this.el_;
	};
	
	/**
	 * The ID for the component
	 *
	 * @type {String}
	 * @private
	 */
	vjs.Component.prototype.id_;
	
	/**
	 * Get the component's ID
	 *
	 *     var id = myComponent.id();
	 *
	 * @return {String}
	 */
	vjs.Component.prototype.id = function(){
	  return this.id_;
	};
	
	/**
	 * The name for the component. Often used to reference the component.
	 *
	 * @type {String}
	 * @private
	 */
	vjs.Component.prototype.name_;
	
	/**
	 * Get the component's name. The name is often used to reference the component.
	 *
	 *     var name = myComponent.name();
	 *
	 * @return {String}
	 */
	vjs.Component.prototype.name = function(){
	  return this.name_;
	};
	
	/**
	 * Array of child components
	 *
	 * @type {Array}
	 * @private
	 */
	vjs.Component.prototype.children_;
	
	/**
	 * Get an array of all child components
	 *
	 *     var kids = myComponent.children();
	 *
	 * @return {Array} The children
	 */
	vjs.Component.prototype.children = function(){
	  return this.children_;
	};
	
	/**
	 * Object of child components by ID
	 *
	 * @type {Object}
	 * @private
	 */
	vjs.Component.prototype.childIndex_;
	
	/**
	 * Returns a child component with the provided ID
	 *
	 * @return {vjs.Component}
	 */
	vjs.Component.prototype.getChildById = function(id){
	  return this.childIndex_[id];
	};
	
	/**
	 * Object of child components by name
	 *
	 * @type {Object}
	 * @private
	 */
	vjs.Component.prototype.childNameIndex_;
	
	/**
	 * Returns a child component with the provided name
	 *
	 * @return {vjs.Component}
	 */
	vjs.Component.prototype.getChild = function(name){
	  return this.childNameIndex_[name];
	};
	
	/**
	 * Adds a child component inside this component
	 *
	 *     myComponent.el();
	 *     // -> <div class='my-component'></div>
	 *     myComonent.children();
	 *     // [empty array]
	 *
	 *     var myButton = myComponent.addChild('MyButton');
	 *     // -> <div class='my-component'><div class="my-button">myButton<div></div>
	 *     // -> myButton === myComonent.children()[0];
	 *
	 * Pass in options for child constructors and options for children of the child
	 *
	 *     var myButton = myComponent.addChild('MyButton', {
	 *       text: 'Press Me',
	 *       children: {
	 *         buttonChildExample: {
	 *           buttonChildOption: true
	 *         }
	 *       }
	 *     });
	 *
	 * @param {String|vjs.Component} child The class name or instance of a child to add
	 * @param {Object=} options Options, including options to be passed to children of the child.
	 * @return {vjs.Component} The child component (created by this process if a string was used)
	 * @suppress {accessControls|checkRegExp|checkTypes|checkVars|const|constantProperty|deprecated|duplicate|es5Strict|fileoverviewTags|globalThis|invalidCasts|missingProperties|nonStandardJsDocs|strictModuleDepCheck|undefinedNames|undefinedVars|unknownDefines|uselessCode|visibility}
	 */
	vjs.Component.prototype.addChild = function(child, options){
	  var component, componentClass, componentName;
	
	  // If child is a string, create new component with options
	  if (typeof child === 'string') {
	    componentName = child;
	
	    // Make sure options is at least an empty object to protect against errors
	    options = options || {};
	
	    // If no componentClass in options, assume componentClass is the name lowercased
	    // (e.g. playButton)
	    componentClass = options['componentClass'] || vjs.capitalize(componentName);
	
	    // Set name through options
	    options['name'] = componentName;
	
	    // Create a new object & element for this controls set
	    // If there's no .player_, this is a player
	    // Closure Compiler throws an 'incomplete alias' warning if we use the vjs variable directly.
	    // Every class should be exported, so this should never be a problem here.
	    component = new window['videojs'][componentClass](this.player_ || this, options);
	
	  // child is a component instance
	  } else {
	    component = child;
	  }
	
	  this.children_.push(component);
	
	  if (typeof component.id === 'function') {
	    this.childIndex_[component.id()] = component;
	  }
	
	  // If a name wasn't used to create the component, check if we can use the
	  // name function of the component
	  componentName = componentName || (component.name && component.name());
	
	  if (componentName) {
	    this.childNameIndex_[componentName] = component;
	  }
	
	  // Add the UI object's element to the container div (box)
	  // Having an element is not required
	  if (typeof component['el'] === 'function' && component['el']()) {
	    this.contentEl().appendChild(component['el']());
	  }
	
	  // Return so it can stored on parent object if desired.
	  return component;
	};
	
	/**
	 * Remove a child component from this component's list of children, and the
	 * child component's element from this component's element
	 *
	 * @param  {vjs.Component} component Component to remove
	 */
	vjs.Component.prototype.removeChild = function(component){
	  if (typeof component === 'string') {
	    component = this.getChild(component);
	  }
	
	  if (!component || !this.children_) return;
	
	  var childFound = false;
	  for (var i = this.children_.length - 1; i >= 0; i--) {
	    if (this.children_[i] === component) {
	      childFound = true;
	      this.children_.splice(i,1);
	      break;
	    }
	  }
	
	  if (!childFound) return;
	
	  this.childIndex_[component.id()] = null;
	  this.childNameIndex_[component.name()] = null;
	
	  var compEl = component.el();
	  if (compEl && compEl.parentNode === this.contentEl()) {
	    this.contentEl().removeChild(component.el());
	  }
	};
	
	/**
	 * Add and initialize default child components from options
	 *
	 *     // when an instance of MyComponent is created, all children in options
	 *     // will be added to the instance by their name strings and options
	 *     MyComponent.prototype.options_.children = {
	 *       myChildComponent: {
	 *         myChildOption: true
	 *       }
	 *     }
	 *
	 *     // Or when creating the component
	 *     var myComp = new MyComponent(player, {
	 *       children: {
	 *         myChildComponent: {
	 *           myChildOption: true
	 *         }
	 *       }
	 *     });
	 *
	 * The children option can also be an Array of child names or
	 * child options objects (that also include a 'name' key).
	 *
	 *     var myComp = new MyComponent(player, {
	 *       children: [
	 *         'button',
	 *         {
	 *           name: 'button',
	 *           someOtherOption: true
	 *         }
	 *       ]
	 *     });
	 *
	 */
	vjs.Component.prototype.initChildren = function(){
	  var parent, parentOptions, children, child, name, opts, handleAdd;
	
	  parent = this;
	  parentOptions = parent.options();
	  children = parentOptions['children'];
	
	  if (children) {
	    handleAdd = function(name, opts){
	      // Allow options for children to be set at the parent options
	      // e.g. videojs(id, { controlBar: false });
	      // instead of videojs(id, { children: { controlBar: false });
	      if (parentOptions[name] !== undefined) {
	        opts = parentOptions[name];
	      }
	
	      // Allow for disabling default components
	      // e.g. vjs.options['children']['posterImage'] = false
	      if (opts === false) return;
	
	      // Create and add the child component.
	      // Add a direct reference to the child by name on the parent instance.
	      // If two of the same component are used, different names should be supplied
	      // for each
	      parent[name] = parent.addChild(name, opts);
	    };
	
	    // Allow for an array of children details to passed in the options
	    if (vjs.obj.isArray(children)) {
	      for (var i = 0; i < children.length; i++) {
	        child = children[i];
	
	        if (typeof child == 'string') {
	          // ['myComponent']
	          name = child;
	          opts = {};
	        } else {
	          // [{ name: 'myComponent', otherOption: true }]
	          name = child.name;
	          opts = child;
	        }
	
	        handleAdd(name, opts);
	      }
	    } else {
	      vjs.obj.each(children, handleAdd);
	    }
	  }
	};
	
	/**
	 * Allows sub components to stack CSS class names
	 *
	 * @return {String} The constructed class name
	 */
	vjs.Component.prototype.buildCSSClass = function(){
	    // Child classes can include a function that does:
	    // return 'CLASS NAME' + this._super();
	    return '';
	};
	
	/* Events
	============================================================================= */
	
	/**
	 * Add an event listener to this component's element
	 *
	 *     var myFunc = function(){
	 *       var myComponent = this;
	 *       // Do something when the event is fired
	 *     };
	 *
	 *     myComponent.on('eventType', myFunc);
	 *
	 * The context of myFunc will be myComponent unless previously bound.
	 *
	 * Alternatively, you can add a listener to another element or component.
	 *
	 *     myComponent.on(otherElement, 'eventName', myFunc);
	 *     myComponent.on(otherComponent, 'eventName', myFunc);
	 *
	 * The benefit of using this over `vjs.on(otherElement, 'eventName', myFunc)`
	 * and `otherComponent.on('eventName', myFunc)` is that this way the listeners
	 * will be automatically cleaned up when either component is disposed.
	 * It will also bind myComponent as the context of myFunc.
	 *
	 * **NOTE**: When using this on elements in the page other than window
	 * and document (both permanent), if you remove the element from the DOM
	 * you need to call `vjs.trigger(el, 'dispose')` on it to clean up
	 * references to it and allow the browser to garbage collect it.
	 *
	 * @param  {String|vjs.Component} first   The event type or other component
	 * @param  {Function|String}      second  The event handler or event type
	 * @param  {Function}             third   The event handler
	 * @return {vjs.Component}        self
	 */
	vjs.Component.prototype.on = function(first, second, third){
	  var target, type, fn, removeOnDispose, cleanRemover, thisComponent;
	
	  if (typeof first === 'string' || vjs.obj.isArray(first)) {
	    vjs.on(this.el_, first, vjs.bind(this, second));
	
	  // Targeting another component or element
	  } else {
	    target = first;
	    type = second;
	    fn = vjs.bind(this, third);
	    thisComponent = this;
	
	    // When this component is disposed, remove the listener from the other component
	    removeOnDispose = function(){
	      thisComponent.off(target, type, fn);
	    };
	    // Use the same function ID so we can remove it later it using the ID
	    // of the original listener
	    removeOnDispose.guid = fn.guid;
	    this.on('dispose', removeOnDispose);
	
	    // If the other component is disposed first we need to clean the reference
	    // to the other component in this component's removeOnDispose listener
	    // Otherwise we create a memory leak.
	    cleanRemover = function(){
	      thisComponent.off('dispose', removeOnDispose);
	    };
	    // Add the same function ID so we can easily remove it later
	    cleanRemover.guid = fn.guid;
	
	    // Check if this is a DOM node
	    if (first.nodeName) {
	      // Add the listener to the other element
	      vjs.on(target, type, fn);
	      vjs.on(target, 'dispose', cleanRemover);
	
	    // Should be a component
	    // Not using `instanceof vjs.Component` because it makes mock players difficult
	    } else if (typeof first.on === 'function') {
	      // Add the listener to the other component
	      target.on(type, fn);
	      target.on('dispose', cleanRemover);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * Remove an event listener from this component's element
	 *
	 *     myComponent.off('eventType', myFunc);
	 *
	 * If myFunc is excluded, ALL listeners for the event type will be removed.
	 * If eventType is excluded, ALL listeners will be removed from the component.
	 *
	 * Alternatively you can use `off` to remove listeners that were added to other
	 * elements or components using `myComponent.on(otherComponent...`.
	 * In this case both the event type and listener function are REQUIRED.
	 *
	 *     myComponent.off(otherElement, 'eventType', myFunc);
	 *     myComponent.off(otherComponent, 'eventType', myFunc);
	 *
	 * @param  {String=|vjs.Component}  first  The event type or other component
	 * @param  {Function=|String}       second The listener function or event type
	 * @param  {Function=}              third  The listener for other component
	 * @return {vjs.Component}
	 */
	vjs.Component.prototype.off = function(first, second, third){
	  var target, otherComponent, type, fn, otherEl;
	
	  if (!first || typeof first === 'string' || vjs.obj.isArray(first)) {
	    vjs.off(this.el_, first, second);
	  } else {
	    target = first;
	    type = second;
	    // Ensure there's at least a guid, even if the function hasn't been used
	    fn = vjs.bind(this, third);
	
	    // Remove the dispose listener on this component,
	    // which was given the same guid as the event listener
	    this.off('dispose', fn);
	
	    if (first.nodeName) {
	      // Remove the listener
	      vjs.off(target, type, fn);
	      // Remove the listener for cleaning the dispose listener
	      vjs.off(target, 'dispose', fn);
	    } else {
	      target.off(type, fn);
	      target.off('dispose', fn);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * Add an event listener to be triggered only once and then removed
	 *
	 *     myComponent.one('eventName', myFunc);
	 *
	 * Alternatively you can add a listener to another element or component
	 * that will be triggered only once.
	 *
	 *     myComponent.one(otherElement, 'eventName', myFunc);
	 *     myComponent.one(otherComponent, 'eventName', myFunc);
	 *
	 * @param  {String|vjs.Component}  first   The event type or other component
	 * @param  {Function|String}       second  The listener function or event type
	 * @param  {Function=}             third   The listener function for other component
	 * @return {vjs.Component}
	 */
	vjs.Component.prototype.one = function(first, second, third) {
	  var target, type, fn, thisComponent, newFunc;
	
	  if (typeof first === 'string' || vjs.obj.isArray(first)) {
	    vjs.one(this.el_, first, vjs.bind(this, second));
	  } else {
	    target = first;
	    type = second;
	    fn = vjs.bind(this, third);
	    thisComponent = this;
	
	    newFunc = function(){
	      thisComponent.off(target, type, newFunc);
	      fn.apply(this, arguments);
	    };
	    // Keep the same function ID so we can remove it later
	    newFunc.guid = fn.guid;
	
	    this.on(target, type, newFunc);
	  }
	
	  return this;
	};
	
	/**
	 * Trigger an event on an element
	 *
	 *     myComponent.trigger('eventName');
	 *     myComponent.trigger({'type':'eventName'});
	 *
	 * @param  {Event|Object|String} event  A string (the type) or an event object with a type attribute
	 * @return {vjs.Component}       self
	 */
	vjs.Component.prototype.trigger = function(event){
	  vjs.trigger(this.el_, event);
	  return this;
	};
	
	/* Ready
	================================================================================ */
	/**
	 * Is the component loaded
	 * This can mean different things depending on the component.
	 *
	 * @private
	 * @type {Boolean}
	 */
	vjs.Component.prototype.isReady_;
	
	/**
	 * Trigger ready as soon as initialization is finished
	 *
	 * Allows for delaying ready. Override on a sub class prototype.
	 * If you set this.isReadyOnInitFinish_ it will affect all components.
	 * Specially used when waiting for the Flash player to asynchronously load.
	 *
	 * @type {Boolean}
	 * @private
	 */
	vjs.Component.prototype.isReadyOnInitFinish_ = true;
	
	/**
	 * List of ready listeners
	 *
	 * @type {Array}
	 * @private
	 */
	vjs.Component.prototype.readyQueue_;
	
	/**
	 * Bind a listener to the component's ready state
	 *
	 * Different from event listeners in that if the ready event has already happened
	 * it will trigger the function immediately.
	 *
	 * @param  {Function} fn Ready listener
	 * @return {vjs.Component}
	 */
	vjs.Component.prototype.ready = function(fn){
	  if (fn) {
	    if (this.isReady_) {
	      fn.call(this);
	    } else {
	      if (this.readyQueue_ === undefined) {
	        this.readyQueue_ = [];
	      }
	      this.readyQueue_.push(fn);
	    }
	  }
	  return this;
	};
	
	/**
	 * Trigger the ready listeners
	 *
	 * @return {vjs.Component}
	 */
	vjs.Component.prototype.triggerReady = function(){
	  this.isReady_ = true;
	
	  var readyQueue = this.readyQueue_;
	
	  // Reset Ready Queue
	  this.readyQueue_ = [];
	
	  if (readyQueue && readyQueue.length > 0) {
	
	    for (var i = 0, j = readyQueue.length; i < j; i++) {
	      readyQueue[i].call(this);
	    }
	
	    // Allow for using event listeners also, in case you want to do something everytime a source is ready.
	    this.trigger('ready');
	  }
	};
	
	/* Display
	============================================================================= */
	
	/**
	 * Check if a component's element has a CSS class name
	 *
	 * @param {String} classToCheck Classname to check
	 * @return {vjs.Component}
	 */
	vjs.Component.prototype.hasClass = function(classToCheck){
	  return vjs.hasClass(this.el_, classToCheck);
	};
	
	/**
	 * Add a CSS class name to the component's element
	 *
	 * @param {String} classToAdd Classname to add
	 * @return {vjs.Component}
	 */
	vjs.Component.prototype.addClass = function(classToAdd){
	  vjs.addClass(this.el_, classToAdd);
	  return this;
	};
	
	/**
	 * Remove a CSS class name from the component's element
	 *
	 * @param {String} classToRemove Classname to remove
	 * @return {vjs.Component}
	 */
	vjs.Component.prototype.removeClass = function(classToRemove){
	  vjs.removeClass(this.el_, classToRemove);
	  return this;
	};
	
	/**
	 * Show the component element if hidden
	 *
	 * @return {vjs.Component}
	 */
	vjs.Component.prototype.show = function(){
	  this.removeClass('vjs-hidden');
	  return this;
	};
	
	/**
	 * Hide the component element if currently showing
	 *
	 * @return {vjs.Component}
	 */
	vjs.Component.prototype.hide = function(){
	  this.addClass('vjs-hidden');
	  return this;
	};
	
	/**
	 * Lock an item in its visible state
	 * To be used with fadeIn/fadeOut.
	 *
	 * @return {vjs.Component}
	 * @private
	 */
	vjs.Component.prototype.lockShowing = function(){
	  this.addClass('vjs-lock-showing');
	  return this;
	};
	
	/**
	 * Unlock an item to be hidden
	 * To be used with fadeIn/fadeOut.
	 *
	 * @return {vjs.Component}
	 * @private
	 */
	vjs.Component.prototype.unlockShowing = function(){
	  this.removeClass('vjs-lock-showing');
	  return this;
	};
	
	/**
	 * Disable component by making it unshowable
	 *
	 * Currently private because we're moving towards more css-based states.
	 * @private
	 */
	vjs.Component.prototype.disable = function(){
	  this.hide();
	  this.show = function(){};
	};
	
	/**
	 * Set or get the width of the component (CSS values)
	 *
	 * Setting the video tag dimension values only works with values in pixels.
	 * Percent values will not work.
	 * Some percents can be used, but width()/height() will return the number + %,
	 * not the actual computed width/height.
	 *
	 * @param  {Number|String=} num   Optional width number
	 * @param  {Boolean} skipListeners Skip the 'resize' event trigger
	 * @return {vjs.Component} This component, when setting the width
	 * @return {Number|String} The width, when getting
	 */
	vjs.Component.prototype.width = function(num, skipListeners){
	  return this.dimension('width', num, skipListeners);
	};
	
	/**
	 * Get or set the height of the component (CSS values)
	 *
	 * Setting the video tag dimension values only works with values in pixels.
	 * Percent values will not work.
	 * Some percents can be used, but width()/height() will return the number + %,
	 * not the actual computed width/height.
	 *
	 * @param  {Number|String=} num     New component height
	 * @param  {Boolean=} skipListeners Skip the resize event trigger
	 * @return {vjs.Component} This component, when setting the height
	 * @return {Number|String} The height, when getting
	 */
	vjs.Component.prototype.height = function(num, skipListeners){
	  return this.dimension('height', num, skipListeners);
	};
	
	/**
	 * Set both width and height at the same time
	 *
	 * @param  {Number|String} width
	 * @param  {Number|String} height
	 * @return {vjs.Component} The component
	 */
	vjs.Component.prototype.dimensions = function(width, height){
	  // Skip resize listeners on width for optimization
	  return this.width(width, true).height(height);
	};
	
	/**
	 * Get or set width or height
	 *
	 * This is the shared code for the width() and height() methods.
	 * All for an integer, integer + 'px' or integer + '%';
	 *
	 * Known issue: Hidden elements officially have a width of 0. We're defaulting
	 * to the style.width value and falling back to computedStyle which has the
	 * hidden element issue. Info, but probably not an efficient fix:
	 * http://www.foliotek.com/devblog/getting-the-width-of-a-hidden-element-with-jquery-using-width/
	 *
	 * @param  {String} widthOrHeight  'width' or 'height'
	 * @param  {Number|String=} num     New dimension
	 * @param  {Boolean=} skipListeners Skip resize event trigger
	 * @return {vjs.Component} The component if a dimension was set
	 * @return {Number|String} The dimension if nothing was set
	 * @private
	 */
	vjs.Component.prototype.dimension = function(widthOrHeight, num, skipListeners){
	  if (num !== undefined) {
	    if (num === null || vjs.isNaN(num)) {
	      num = 0;
	    }
	
	    // Check if using css width/height (% or px) and adjust
	    if ((''+num).indexOf('%') !== -1 || (''+num).indexOf('px') !== -1) {
	      this.el_.style[widthOrHeight] = num;
	    } else if (num === 'auto') {
	      this.el_.style[widthOrHeight] = '';
	    } else {
	      this.el_.style[widthOrHeight] = num+'px';
	    }
	
	    // skipListeners allows us to avoid triggering the resize event when setting both width and height
	    if (!skipListeners) { this.trigger('resize'); }
	
	    // Return component
	    return this;
	  }
	
	  // Not setting a value, so getting it
	  // Make sure element exists
	  if (!this.el_) return 0;
	
	  // Get dimension value from style
	  var val = this.el_.style[widthOrHeight];
	  var pxIndex = val.indexOf('px');
	  if (pxIndex !== -1) {
	    // Return the pixel value with no 'px'
	    return parseInt(val.slice(0,pxIndex), 10);
	
	  // No px so using % or no style was set, so falling back to offsetWidth/height
	  // If component has display:none, offset will return 0
	  // TODO: handle display:none and no dimension style using px
	  } else {
	
	    return parseInt(this.el_['offset'+vjs.capitalize(widthOrHeight)], 10);
	
	    // ComputedStyle version.
	    // Only difference is if the element is hidden it will return
	    // the percent value (e.g. '100%'')
	    // instead of zero like offsetWidth returns.
	    // var val = vjs.getComputedStyleValue(this.el_, widthOrHeight);
	    // var pxIndex = val.indexOf('px');
	
	    // if (pxIndex !== -1) {
	    //   return val.slice(0, pxIndex);
	    // } else {
	    //   return val;
	    // }
	  }
	};
	
	/**
	 * Fired when the width and/or height of the component changes
	 * @event resize
	 */
	vjs.Component.prototype.onResize;
	
	/**
	 * Emit 'tap' events when touch events are supported
	 *
	 * This is used to support toggling the controls through a tap on the video.
	 *
	 * We're requiring them to be enabled because otherwise every component would
	 * have this extra overhead unnecessarily, on mobile devices where extra
	 * overhead is especially bad.
	 * @private
	 */
	vjs.Component.prototype.emitTapEvents = function(){
	  var touchStart, firstTouch, touchTime, couldBeTap, noTap,
	      xdiff, ydiff, touchDistance, tapMovementThreshold, touchTimeThreshold;
	
	  // Track the start time so we can determine how long the touch lasted
	  touchStart = 0;
	  firstTouch = null;
	
	  // Maximum movement allowed during a touch event to still be considered a tap
	  // Other popular libs use anywhere from 2 (hammer.js) to 15, so 10 seems like a nice, round number.
	  tapMovementThreshold = 10;
	
	  // The maximum length a touch can be while still being considered a tap
	  touchTimeThreshold = 200;
	
	  this.on('touchstart', function(event) {
	    // If more than one finger, don't consider treating this as a click
	    if (event.touches.length === 1) {
	      firstTouch = vjs.obj.copy(event.touches[0]);
	      // Record start time so we can detect a tap vs. "touch and hold"
	      touchStart = new Date().getTime();
	      // Reset couldBeTap tracking
	      couldBeTap = true;
	    }
	  });
	
	  this.on('touchmove', function(event) {
	    // If more than one finger, don't consider treating this as a click
	    if (event.touches.length > 1) {
	      couldBeTap = false;
	    } else if (firstTouch) {
	      // Some devices will throw touchmoves for all but the slightest of taps.
	      // So, if we moved only a small distance, this could still be a tap
	      xdiff = event.touches[0].pageX - firstTouch.pageX;
	      ydiff = event.touches[0].pageY - firstTouch.pageY;
	      touchDistance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
	      if (touchDistance > tapMovementThreshold) {
	        couldBeTap = false;
	      }
	    }
	  });
	
	  noTap = function(){
	    couldBeTap = false;
	  };
	  // TODO: Listen to the original target. http://youtu.be/DujfpXOKUp8?t=13m8s
	  this.on('touchleave', noTap);
	  this.on('touchcancel', noTap);
	
	  // When the touch ends, measure how long it took and trigger the appropriate
	  // event
	  this.on('touchend', function(event) {
	    firstTouch = null;
	    // Proceed only if the touchmove/leave/cancel event didn't happen
	    if (couldBeTap === true) {
	      // Measure how long the touch lasted
	      touchTime = new Date().getTime() - touchStart;
	      // Make sure the touch was less than the threshold to be considered a tap
	      if (touchTime < touchTimeThreshold) {
	        event.preventDefault(); // Don't let browser turn this into a click
	        this.trigger('tap');
	        // It may be good to copy the touchend event object and change the
	        // type to tap, if the other event properties aren't exact after
	        // vjs.fixEvent runs (e.g. event.target)
	      }
	    }
	  });
	};
	
	/**
	 * Report user touch activity when touch events occur
	 *
	 * User activity is used to determine when controls should show/hide. It's
	 * relatively simple when it comes to mouse events, because any mouse event
	 * should show the controls. So we capture mouse events that bubble up to the
	 * player and report activity when that happens.
	 *
	 * With touch events it isn't as easy. We can't rely on touch events at the
	 * player level, because a tap (touchstart + touchend) on the video itself on
	 * mobile devices is meant to turn controls off (and on). User activity is
	 * checked asynchronously, so what could happen is a tap event on the video
	 * turns the controls off, then the touchend event bubbles up to the player,
	 * which if it reported user activity, would turn the controls right back on.
	 * (We also don't want to completely block touch events from bubbling up)
	 *
	 * Also a touchmove, touch+hold, and anything other than a tap is not supposed
	 * to turn the controls back on on a mobile device.
	 *
	 * Here we're setting the default component behavior to report user activity
	 * whenever touch events happen, and this can be turned off by components that
	 * want touch events to act differently.
	 */
	vjs.Component.prototype.enableTouchActivity = function() {
	  var report, touchHolding, touchEnd;
	
	  // Don't continue if the root player doesn't support reporting user activity
	  if (!this.player().reportUserActivity) {
	    return;
	  }
	
	  // listener for reporting that the user is active
	  report = vjs.bind(this.player(), this.player().reportUserActivity);
	
	  this.on('touchstart', function() {
	    report();
	    // For as long as the they are touching the device or have their mouse down,
	    // we consider them active even if they're not moving their finger or mouse.
	    // So we want to continue to update that they are active
	    this.clearInterval(touchHolding);
	    // report at the same interval as activityCheck
	    touchHolding = this.setInterval(report, 250);
	  });
	
	  touchEnd = function(event) {
	    report();
	    // stop the interval that maintains activity if the touch is holding
	    this.clearInterval(touchHolding);
	  };
	
	  this.on('touchmove', report);
	  this.on('touchend', touchEnd);
	  this.on('touchcancel', touchEnd);
	};
	
	/**
	 * Creates timeout and sets up disposal automatically.
	 * @param {Function} fn The function to run after the timeout.
	 * @param {Number} timeout Number of ms to delay before executing specified function.
	 * @return {Number} Returns the timeout ID
	 */
	vjs.Component.prototype.setTimeout = function(fn, timeout) {
	  fn = vjs.bind(this, fn);
	
	  // window.setTimeout would be preferable here, but due to some bizarre issue with Sinon and/or Phantomjs, we can't.
	  var timeoutId = setTimeout(fn, timeout);
	
	  var disposeFn = function() {
	    this.clearTimeout(timeoutId);
	  };
	
	  disposeFn.guid = 'vjs-timeout-'+ timeoutId;
	
	  this.on('dispose', disposeFn);
	
	  return timeoutId;
	};
	
	
	/**
	 * Clears a timeout and removes the associated dispose listener
	 * @param {Number} timeoutId The id of the timeout to clear
	 * @return {Number} Returns the timeout ID
	 */
	vjs.Component.prototype.clearTimeout = function(timeoutId) {
	  clearTimeout(timeoutId);
	
	  var disposeFn = function(){};
	  disposeFn.guid = 'vjs-timeout-'+ timeoutId;
	
	  this.off('dispose', disposeFn);
	
	  return timeoutId;
	};
	
	/**
	 * Creates an interval and sets up disposal automatically.
	 * @param {Function} fn The function to run every N seconds.
	 * @param {Number} interval Number of ms to delay before executing specified function.
	 * @return {Number} Returns the interval ID
	 */
	vjs.Component.prototype.setInterval = function(fn, interval) {
	  fn = vjs.bind(this, fn);
	
	  var intervalId = setInterval(fn, interval);
	
	  var disposeFn = function() {
	    this.clearInterval(intervalId);
	  };
	
	  disposeFn.guid = 'vjs-interval-'+ intervalId;
	
	  this.on('dispose', disposeFn);
	
	  return intervalId;
	};
	
	/**
	 * Clears an interval and removes the associated dispose listener
	 * @param {Number} intervalId The id of the interval to clear
	 * @return {Number} Returns the interval ID
	 */
	vjs.Component.prototype.clearInterval = function(intervalId) {
	  clearInterval(intervalId);
	
	  var disposeFn = function(){};
	  disposeFn.guid = 'vjs-interval-'+ intervalId;
	
	  this.off('dispose', disposeFn);
	
	  return intervalId;
	};
	/* Button - Base class for all buttons
	================================================================================ */
	/**
	 * Base class for all buttons
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @class
	 * @constructor
	 */
	vjs.Button = vjs.Component.extend({
	  /**
	   * @constructor
	   * @inheritDoc
	   */
	  init: function(player, options){
	    vjs.Component.call(this, player, options);
	
	    this.emitTapEvents();
	
	    this.on('tap', this.onClick);
	    this.on('click', this.onClick);
	    this.on('focus', this.onFocus);
	    this.on('blur', this.onBlur);
	  }
	});
	
	vjs.Button.prototype.createEl = function(type, props){
	  var el;
	
	  // Add standard Aria and Tabindex info
	  props = vjs.obj.merge({
	    className: this.buildCSSClass(),
	    'role': 'button',
	    'aria-live': 'polite', // let the screen reader user know that the text of the button may change
	    tabIndex: 0
	  }, props);
	
	  el = vjs.Component.prototype.createEl.call(this, type, props);
	
	  // if innerHTML hasn't been overridden (bigPlayButton), add content elements
	  if (!props.innerHTML) {
	    this.contentEl_ = vjs.createEl('div', {
	      className: 'vjs-control-content'
	    });
	
	    this.controlText_ = vjs.createEl('span', {
	      className: 'vjs-control-text',
	      innerHTML: this.localize(this.buttonText) || 'Need Text'
	    });
	
	    this.contentEl_.appendChild(this.controlText_);
	    el.appendChild(this.contentEl_);
	  }
	
	  return el;
	};
	
	vjs.Button.prototype.buildCSSClass = function(){
	  // TODO: Change vjs-control to vjs-button?
	  return 'vjs-control ' + vjs.Component.prototype.buildCSSClass.call(this);
	};
	
	  // Click - Override with specific functionality for button
	vjs.Button.prototype.onClick = function(){};
	
	  // Focus - Add keyboard functionality to element
	vjs.Button.prototype.onFocus = function(){
	  vjs.on(document, 'keydown', vjs.bind(this, this.onKeyPress));
	};
	
	  // KeyPress (document level) - Trigger click when keys are pressed
	vjs.Button.prototype.onKeyPress = function(event){
	  // Check for space bar (32) or enter (13) keys
	  if (event.which == 32 || event.which == 13) {
	    event.preventDefault();
	    this.onClick();
	  }
	};
	
	// Blur - Remove keyboard triggers
	vjs.Button.prototype.onBlur = function(){
	  vjs.off(document, 'keydown', vjs.bind(this, this.onKeyPress));
	};
	/* Slider
	================================================================================ */
	/**
	 * The base functionality for sliders like the volume bar and seek bar
	 *
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.Slider = vjs.Component.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.Component.call(this, player, options);
	
	    // Set property names to bar and handle to match with the child Slider class is looking for
	    this.bar = this.getChild(this.options_['barName']);
	    this.handle = this.getChild(this.options_['handleName']);
	
	    this.on('mousedown', this.onMouseDown);
	    this.on('touchstart', this.onMouseDown);
	    this.on('focus', this.onFocus);
	    this.on('blur', this.onBlur);
	    this.on('click', this.onClick);
	
	    this.on(player, 'controlsvisible', this.update);
	    this.on(player, this.playerEvent, this.update);
	  }
	});
	
	vjs.Slider.prototype.createEl = function(type, props) {
	  props = props || {};
	  // Add the slider element class to all sub classes
	  props.className = props.className + ' vjs-slider';
	  props = vjs.obj.merge({
	    'role': 'slider',
	    'aria-valuenow': 0,
	    'aria-valuemin': 0,
	    'aria-valuemax': 100,
	    tabIndex: 0
	  }, props);
	
	  return vjs.Component.prototype.createEl.call(this, type, props);
	};
	
	vjs.Slider.prototype.onMouseDown = function(event){
	  event.preventDefault();
	  vjs.blockTextSelection();
	  this.addClass('vjs-sliding');
	
	  this.on(document, 'mousemove', this.onMouseMove);
	  this.on(document, 'mouseup', this.onMouseUp);
	  this.on(document, 'touchmove', this.onMouseMove);
	  this.on(document, 'touchend', this.onMouseUp);
	
	  this.onMouseMove(event);
	};
	
	// To be overridden by a subclass
	vjs.Slider.prototype.onMouseMove = function(){};
	
	vjs.Slider.prototype.onMouseUp = function() {
	  vjs.unblockTextSelection();
	  this.removeClass('vjs-sliding');
	
	  this.off(document, 'mousemove', this.onMouseMove);
	  this.off(document, 'mouseup', this.onMouseUp);
	  this.off(document, 'touchmove', this.onMouseMove);
	  this.off(document, 'touchend', this.onMouseUp);
	
	  this.update();
	};
	
	vjs.Slider.prototype.update = function(){
	  // In VolumeBar init we have a setTimeout for update that pops and update to the end of the
	  // execution stack. The player is destroyed before then update will cause an error
	  if (!this.el_) return;
	
	  // If scrubbing, we could use a cached value to make the handle keep up with the user's mouse.
	  // On HTML5 browsers scrubbing is really smooth, but some flash players are slow, so we might want to utilize this later.
	  // var progress =  (this.player_.scrubbing) ? this.player_.getCache().currentTime / this.player_.duration() : this.player_.currentTime() / this.player_.duration();
	
	  var barProgress,
	      progress = this.getPercent(),
	      handle = this.handle,
	      bar = this.bar;
	
	  // Protect against no duration and other division issues
	  if (typeof progress !== 'number' ||
	      progress !== progress ||
	      progress < 0 ||
	      progress === Infinity) {
	        progress = 0;
	  }
	
	  barProgress = progress;
	
	  // If there is a handle, we need to account for the handle in our calculation for progress bar
	  // so that it doesn't fall short of or extend past the handle.
	  if (handle) {
	
	    var box = this.el_,
	        boxWidth = box.offsetWidth,
	
	        handleWidth = handle.el().offsetWidth,
	
	        // The width of the handle in percent of the containing box
	        // In IE, widths may not be ready yet causing NaN
	        handlePercent = (handleWidth) ? handleWidth / boxWidth : 0,
	
	        // Get the adjusted size of the box, considering that the handle's center never touches the left or right side.
	        // There is a margin of half the handle's width on both sides.
	        boxAdjustedPercent = 1 - handlePercent,
	
	        // Adjust the progress that we'll use to set widths to the new adjusted box width
	        adjustedProgress = progress * boxAdjustedPercent;
	
	    // The bar does reach the left side, so we need to account for this in the bar's width
	    barProgress = adjustedProgress + (handlePercent / 2);
	
	    // Move the handle from the left based on the adjected progress
	    handle.el().style.left = vjs.round(adjustedProgress * 100, 2) + '%';
	  }
	
	  // Set the new bar width
	  if (bar) {
	    bar.el().style.width = vjs.round(barProgress * 100, 2) + '%';
	  }
	};
	
	vjs.Slider.prototype.calculateDistance = function(event){
	  var el, box, boxX, boxY, boxW, boxH, handle, pageX, pageY;
	
	  el = this.el_;
	  box = vjs.findPosition(el);
	  boxW = boxH = el.offsetWidth;
	  handle = this.handle;
	
	  if (this.options()['vertical']) {
	    boxY = box.top;
	
	    if (event.changedTouches) {
	      pageY = event.changedTouches[0].pageY;
	    } else {
	      pageY = event.pageY;
	    }
	
	    if (handle) {
	      var handleH = handle.el().offsetHeight;
	      // Adjusted X and Width, so handle doesn't go outside the bar
	      boxY = boxY + (handleH / 2);
	      boxH = boxH - handleH;
	    }
	
	    // Percent that the click is through the adjusted area
	    return Math.max(0, Math.min(1, ((boxY - pageY) + boxH) / boxH));
	
	  } else {
	    boxX = box.left;
	
	    if (event.changedTouches) {
	      pageX = event.changedTouches[0].pageX;
	    } else {
	      pageX = event.pageX;
	    }
	
	    if (handle) {
	      var handleW = handle.el().offsetWidth;
	
	      // Adjusted X and Width, so handle doesn't go outside the bar
	      boxX = boxX + (handleW / 2);
	      boxW = boxW - handleW;
	    }
	
	    // Percent that the click is through the adjusted area
	    return Math.max(0, Math.min(1, (pageX - boxX) / boxW));
	  }
	};
	
	vjs.Slider.prototype.onFocus = function(){
	  this.on(document, 'keydown', this.onKeyPress);
	};
	
	vjs.Slider.prototype.onKeyPress = function(event){
	  if (event.which == 37 || event.which == 40) { // Left and Down Arrows
	    event.preventDefault();
	    this.stepBack();
	  } else if (event.which == 38 || event.which == 39) { // Up and Right Arrows
	    event.preventDefault();
	    this.stepForward();
	  }
	};
	
	vjs.Slider.prototype.onBlur = function(){
	  this.off(document, 'keydown', this.onKeyPress);
	};
	
	/**
	 * Listener for click events on slider, used to prevent clicks
	 *   from bubbling up to parent elements like button menus.
	 * @param  {Object} event Event object
	 */
	vjs.Slider.prototype.onClick = function(event){
	  event.stopImmediatePropagation();
	  event.preventDefault();
	};
	
	/**
	 * SeekBar Behavior includes play progress bar, and seek handle
	 * Needed so it can determine seek position based on handle position/size
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.SliderHandle = vjs.Component.extend();
	
	/**
	 * Default value of the slider
	 *
	 * @type {Number}
	 * @private
	 */
	vjs.SliderHandle.prototype.defaultValue = 0;
	
	/** @inheritDoc */
	vjs.SliderHandle.prototype.createEl = function(type, props) {
	  props = props || {};
	  // Add the slider element class to all sub classes
	  props.className = props.className + ' vjs-slider-handle';
	  props = vjs.obj.merge({
	    innerHTML: '<span class="vjs-control-text">'+this.defaultValue+'</span>'
	  }, props);
	
	  return vjs.Component.prototype.createEl.call(this, 'div', props);
	};
	/* Menu
	================================================================================ */
	/**
	 * The Menu component is used to build pop up menus, including subtitle and
	 * captions selection menus.
	 *
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @class
	 * @constructor
	 */
	vjs.Menu = vjs.Component.extend();
	
	/**
	 * Add a menu item to the menu
	 * @param {Object|String} component Component or component type to add
	 */
	vjs.Menu.prototype.addItem = function(component){
	  this.addChild(component);
	  component.on('click', vjs.bind(this, function(){
	    this.unlockShowing();
	  }));
	};
	
	/** @inheritDoc */
	vjs.Menu.prototype.createEl = function(){
	  var contentElType = this.options().contentElType || 'ul';
	  this.contentEl_ = vjs.createEl(contentElType, {
	    className: 'vjs-menu-content'
	  });
	  var el = vjs.Component.prototype.createEl.call(this, 'div', {
	    append: this.contentEl_,
	    className: 'vjs-menu'
	  });
	  el.appendChild(this.contentEl_);
	
	  // Prevent clicks from bubbling up. Needed for Menu Buttons,
	  // where a click on the parent is significant
	  vjs.on(el, 'click', function(event){
	    event.preventDefault();
	    event.stopImmediatePropagation();
	  });
	
	  return el;
	};
	
	/**
	 * The component for a menu item. `<li>`
	 *
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @class
	 * @constructor
	 */
	vjs.MenuItem = vjs.Button.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.Button.call(this, player, options);
	    this.selected(options['selected']);
	  }
	});
	
	/** @inheritDoc */
	vjs.MenuItem.prototype.createEl = function(type, props){
	  return vjs.Button.prototype.createEl.call(this, 'li', vjs.obj.merge({
	    className: 'vjs-menu-item',
	    innerHTML: this.localize(this.options_['label'])
	  }, props));
	};
	
	/**
	 * Handle a click on the menu item, and set it to selected
	 */
	vjs.MenuItem.prototype.onClick = function(){
	  this.selected(true);
	};
	
	/**
	 * Set this menu item as selected or not
	 * @param  {Boolean} selected
	 */
	vjs.MenuItem.prototype.selected = function(selected){
	  if (selected) {
	    this.addClass('vjs-selected');
	    this.el_.setAttribute('aria-selected',true);
	  } else {
	    this.removeClass('vjs-selected');
	    this.el_.setAttribute('aria-selected',false);
	  }
	};
	
	
	/**
	 * A button class with a popup menu
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.MenuButton = vjs.Button.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.Button.call(this, player, options);
	
	    this.update();
	
	    this.on('keydown', this.onKeyPress);
	    this.el_.setAttribute('aria-haspopup', true);
	    this.el_.setAttribute('role', 'button');
	  }
	});
	
	vjs.MenuButton.prototype.update = function() {
	  var menu = this.createMenu();
	
	  if (this.menu) {
	    this.removeChild(this.menu);
	  }
	
	  this.menu = menu;
	  this.addChild(menu);
	
	  if (this.items && this.items.length === 0) {
	    this.hide();
	  } else if (this.items && this.items.length > 1) {
	    this.show();
	  }
	};
	
	/**
	 * Track the state of the menu button
	 * @type {Boolean}
	 * @private
	 */
	vjs.MenuButton.prototype.buttonPressed_ = false;
	
	vjs.MenuButton.prototype.createMenu = function(){
	  var menu = new vjs.Menu(this.player_);
	
	  // Add a title list item to the top
	  if (this.options().title) {
	    menu.contentEl().appendChild(vjs.createEl('li', {
	      className: 'vjs-menu-title',
	      innerHTML: vjs.capitalize(this.options().title),
	      tabindex: -1
	    }));
	  }
	
	  this.items = this['createItems']();
	
	  if (this.items) {
	    // Add menu items to the menu
	    for (var i = 0; i < this.items.length; i++) {
	      menu.addItem(this.items[i]);
	    }
	  }
	
	  return menu;
	};
	
	/**
	 * Create the list of menu items. Specific to each subclass.
	 */
	vjs.MenuButton.prototype.createItems = function(){};
	
	/** @inheritDoc */
	vjs.MenuButton.prototype.buildCSSClass = function(){
	  return this.className + ' vjs-menu-button ' + vjs.Button.prototype.buildCSSClass.call(this);
	};
	
	// Focus - Add keyboard functionality to element
	// This function is not needed anymore. Instead, the keyboard functionality is handled by
	// treating the button as triggering a submenu. When the button is pressed, the submenu
	// appears. Pressing the button again makes the submenu disappear.
	vjs.MenuButton.prototype.onFocus = function(){};
	// Can't turn off list display that we turned on with focus, because list would go away.
	vjs.MenuButton.prototype.onBlur = function(){};
	
	vjs.MenuButton.prototype.onClick = function(){
	  // When you click the button it adds focus, which will show the menu indefinitely.
	  // So we'll remove focus when the mouse leaves the button.
	  // Focus is needed for tab navigation.
	  this.one('mouseout', vjs.bind(this, function(){
	    this.menu.unlockShowing();
	    this.el_.blur();
	  }));
	  if (this.buttonPressed_){
	    this.unpressButton();
	  } else {
	    this.pressButton();
	  }
	};
	
	vjs.MenuButton.prototype.onKeyPress = function(event){
	
	  // Check for space bar (32) or enter (13) keys
	  if (event.which == 32 || event.which == 13) {
	    if (this.buttonPressed_){
	      this.unpressButton();
	    } else {
	      this.pressButton();
	    }
	    event.preventDefault();
	  // Check for escape (27) key
	  } else if (event.which == 27){
	    if (this.buttonPressed_){
	      this.unpressButton();
	    }
	    event.preventDefault();
	  }
	};
	
	vjs.MenuButton.prototype.pressButton = function(){
	  this.buttonPressed_ = true;
	  this.menu.lockShowing();
	  this.el_.setAttribute('aria-pressed', true);
	  if (this.items && this.items.length > 0) {
	    this.items[0].el().focus(); // set the focus to the title of the submenu
	  }
	};
	
	vjs.MenuButton.prototype.unpressButton = function(){
	  this.buttonPressed_ = false;
	  this.menu.unlockShowing();
	  this.el_.setAttribute('aria-pressed', false);
	};
	/**
	 * Custom MediaError to mimic the HTML5 MediaError
	 * @param {Number} code The media error code
	 */
	vjs.MediaError = function(code){
	  if (typeof code === 'number') {
	    this.code = code;
	  } else if (typeof code === 'string') {
	    // default code is zero, so this is a custom error
	    this.message = code;
	  } else if (typeof code === 'object') { // object
	    vjs.obj.merge(this, code);
	  }
	
	  if (!this.message) {
	    this.message = vjs.MediaError.defaultMessages[this.code] || '';
	  }
	};
	
	/**
	 * The error code that refers two one of the defined
	 * MediaError types
	 * @type {Number}
	 */
	vjs.MediaError.prototype.code = 0;
	
	/**
	 * An optional message to be shown with the error.
	 * Message is not part of the HTML5 video spec
	 * but allows for more informative custom errors.
	 * @type {String}
	 */
	vjs.MediaError.prototype.message = '';
	
	/**
	 * An optional status code that can be set by plugins
	 * to allow even more detail about the error.
	 * For example the HLS plugin might provide the specific
	 * HTTP status code that was returned when the error
	 * occurred, then allowing a custom error overlay
	 * to display more information.
	 * @type {[type]}
	 */
	vjs.MediaError.prototype.status = null;
	
	vjs.MediaError.errorTypes = [
	  'MEDIA_ERR_CUSTOM',            // = 0
	  'MEDIA_ERR_ABORTED',           // = 1
	  'MEDIA_ERR_NETWORK',           // = 2
	  'MEDIA_ERR_DECODE',            // = 3
	  'MEDIA_ERR_SRC_NOT_SUPPORTED', // = 4
	  'MEDIA_ERR_ENCRYPTED'          // = 5
	];
	
	vjs.MediaError.defaultMessages = {
	  1: 'You aborted the video playback',
	  2: 'A network error caused the video download to fail part-way.',
	  3: 'The video playback was aborted due to a corruption problem or because the video used features your browser did not support.',
	  4: 'The video could not be loaded, either because the server or network failed or because the format is not supported.',
	  5: 'The video is encrypted and we do not have the keys to decrypt it.'
	};
	
	// Add types as properties on MediaError
	// e.g. MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED = 4;
	for (var errNum = 0; errNum < vjs.MediaError.errorTypes.length; errNum++) {
	  vjs.MediaError[vjs.MediaError.errorTypes[errNum]] = errNum;
	  // values should be accessible on both the class and instance
	  vjs.MediaError.prototype[vjs.MediaError.errorTypes[errNum]] = errNum;
	}
	(function(){
	  var apiMap, specApi, browserApi, i;
	
	  /**
	   * Store the browser-specific methods for the fullscreen API
	   * @type {Object|undefined}
	   * @private
	   */
	  vjs.browser.fullscreenAPI;
	
	  // browser API methods
	  // map approach from Screenful.js - https://github.com/sindresorhus/screenfull.js
	  apiMap = [
	    // Spec: https://dvcs.w3.org/hg/fullscreen/raw-file/tip/Overview.html
	    [
	      'requestFullscreen',
	      'exitFullscreen',
	      'fullscreenElement',
	      'fullscreenEnabled',
	      'fullscreenchange',
	      'fullscreenerror'
	    ],
	    // WebKit
	    [
	      'webkitRequestFullscreen',
	      'webkitExitFullscreen',
	      'webkitFullscreenElement',
	      'webkitFullscreenEnabled',
	      'webkitfullscreenchange',
	      'webkitfullscreenerror'
	    ],
	    // Old WebKit (Safari 5.1)
	    [
	      'webkitRequestFullScreen',
	      'webkitCancelFullScreen',
	      'webkitCurrentFullScreenElement',
	      'webkitCancelFullScreen',
	      'webkitfullscreenchange',
	      'webkitfullscreenerror'
	    ],
	    // Mozilla
	    [
	      'mozRequestFullScreen',
	      'mozCancelFullScreen',
	      'mozFullScreenElement',
	      'mozFullScreenEnabled',
	      'mozfullscreenchange',
	      'mozfullscreenerror'
	    ],
	    // Microsoft
	    [
	      'msRequestFullscreen',
	      'msExitFullscreen',
	      'msFullscreenElement',
	      'msFullscreenEnabled',
	      'MSFullscreenChange',
	      'MSFullscreenError'
	    ]
	  ];
	
	  specApi = apiMap[0];
	
	  // determine the supported set of functions
	  for (i=0; i<apiMap.length; i++) {
	    // check for exitFullscreen function
	    if (apiMap[i][1] in document) {
	      browserApi = apiMap[i];
	      break;
	    }
	  }
	
	  // map the browser API names to the spec API names
	  // or leave vjs.browser.fullscreenAPI undefined
	  if (browserApi) {
	    vjs.browser.fullscreenAPI = {};
	
	    for (i=0; i<browserApi.length; i++) {
	      vjs.browser.fullscreenAPI[specApi[i]] = browserApi[i];
	    }
	  }
	
	})();
	/**
	 * An instance of the `vjs.Player` class is created when any of the Video.js setup methods are used to initialize a video.
	 *
	 * ```js
	 * var myPlayer = videojs('example_video_1');
	 * ```
	 *
	 * In the following example, the `data-setup` attribute tells the Video.js library to create a player instance when the library is ready.
	 *
	 * ```html
	 * <video id="example_video_1" data-setup='{}' controls>
	 *   <source src="my-source.mp4" type="video/mp4">
	 * </video>
	 * ```
	 *
	 * After an instance has been created it can be accessed globally using `Video('example_video_1')`.
	 *
	 * @class
	 * @extends vjs.Component
	 */
	vjs.Player = vjs.Component.extend({
	
	  /**
	   * player's constructor function
	   *
	   * @constructs
	   * @method init
	   * @param {Element} tag        The original video tag used for configuring options
	   * @param {Object=} options    Player options
	   * @param {Function=} ready    Ready callback function
	   */
	  init: function(tag, options, ready){
	    this.tag = tag; // Store the original tag used to set options
	
	    // Make sure tag ID exists
	    tag.id = tag.id || 'vjs_video_' + vjs.guid++;
	
	    // Store the tag attributes used to restore html5 element
	    this.tagAttributes = tag && vjs.getElementAttributes(tag);
	
	    // Set Options
	    // The options argument overrides options set in the video tag
	    // which overrides globally set options.
	    // This latter part coincides with the load order
	    // (tag must exist before Player)
	    options = vjs.obj.merge(this.getTagSettings(tag), options);
	
	    // Update Current Language
	    this.language_ = options['language'] || vjs.options['language'];
	
	    // Update Supported Languages
	    this.languages_ = options['languages'] || vjs.options['languages'];
	
	    // Cache for video property values.
	    this.cache_ = {};
	
	    // Set poster
	    this.poster_ = options['poster'] || '';
	
	    // Set controls
	    this.controls_ = !!options['controls'];
	    // Original tag settings stored in options
	    // now remove immediately so native controls don't flash.
	    // May be turned back on by HTML5 tech if nativeControlsForTouch is true
	    tag.controls = false;
	
	    // we don't want the player to report touch activity on itself
	    // see enableTouchActivity in Component
	    options.reportTouchActivity = false;
	
	    // Set isAudio based on whether or not an audio tag was used
	    this.isAudio(this.tag.nodeName.toLowerCase() === 'audio');
	
	    // Run base component initializing with new options.
	    // Builds the element through createEl()
	    // Inits and embeds any child components in opts
	    vjs.Component.call(this, this, options, ready);
	
	    // Update controls className. Can't do this when the controls are initially
	    // set because the element doesn't exist yet.
	    if (this.controls()) {
	      this.addClass('vjs-controls-enabled');
	    } else {
	      this.addClass('vjs-controls-disabled');
	    }
	
	    if (this.isAudio()) {
	      this.addClass('vjs-audio');
	    }
	
	    // TODO: Make this smarter. Toggle user state between touching/mousing
	    // using events, since devices can have both touch and mouse events.
	    // if (vjs.TOUCH_ENABLED) {
	    //   this.addClass('vjs-touch-enabled');
	    // }
	
	    // Make player easily findable by ID
	    vjs.players[this.id_] = this;
	
	    if (options['plugins']) {
	      vjs.obj.each(options['plugins'], function(key, val){
	        this[key](val);
	      }, this);
	    }
	
	    this.listenForUserActivity();
	  }
	});
	
	/**
	 * The player's stored language code
	 *
	 * @type {String}
	 * @private
	 */
	vjs.Player.prototype.language_;
	
	/**
	 * The player's language code
	 * @param  {String} languageCode  The locale string
	 * @return {String}             The locale string when getting
	 * @return {vjs.Player}         self, when setting
	 */
	vjs.Player.prototype.language = function (languageCode) {
	  if (languageCode === undefined) {
	    return this.language_;
	  }
	
	  this.language_ = languageCode;
	  return this;
	};
	
	/**
	 * The player's stored language dictionary
	 *
	 * @type {Object}
	 * @private
	 */
	vjs.Player.prototype.languages_;
	
	vjs.Player.prototype.languages = function(){
	  return this.languages_;
	};
	
	/**
	 * Player instance options, surfaced using vjs.options
	 * vjs.options = vjs.Player.prototype.options_
	 * Make changes in vjs.options, not here.
	 * All options should use string keys so they avoid
	 * renaming by closure compiler
	 * @type {Object}
	 * @private
	 */
	vjs.Player.prototype.options_ = vjs.options;
	
	/**
	 * Destroys the video player and does any necessary cleanup
	 *
	 *     myPlayer.dispose();
	 *
	 * This is especially helpful if you are dynamically adding and removing videos
	 * to/from the DOM.
	 */
	vjs.Player.prototype.dispose = function(){
	  this.trigger('dispose');
	  // prevent dispose from being called twice
	  this.off('dispose');
	
	  // Kill reference to this player
	  vjs.players[this.id_] = null;
	  if (this.tag && this.tag['player']) { this.tag['player'] = null; }
	  if (this.el_ && this.el_['player']) { this.el_['player'] = null; }
	
	  if (this.tech) { this.tech.dispose(); }
	
	  // Component dispose
	  vjs.Component.prototype.dispose.call(this);
	};
	
	vjs.Player.prototype.getTagSettings = function(tag){
	  var tagOptions,
	      dataSetup,
	      options = {
	        'sources': [],
	        'tracks': []
	      };
	
	  tagOptions = vjs.getElementAttributes(tag);
	  dataSetup = tagOptions['data-setup'];
	
	  // Check if data-setup attr exists.
	  if (dataSetup !== null){
	    // Parse options JSON
	    // If empty string, make it a parsable json object.
	    vjs.obj.merge(tagOptions, vjs.JSON.parse(dataSetup || '{}'));
	  }
	
	  vjs.obj.merge(options, tagOptions);
	
	  // Get tag children settings
	  if (tag.hasChildNodes()) {
	    var children, child, childName, i, j;
	
	    children = tag.childNodes;
	
	    for (i=0,j=children.length; i<j; i++) {
	      child = children[i];
	      // Change case needed: http://ejohn.org/blog/nodename-case-sensitivity/
	      childName = child.nodeName.toLowerCase();
	      if (childName === 'source') {
	        options['sources'].push(vjs.getElementAttributes(child));
	      } else if (childName === 'track') {
	        options['tracks'].push(vjs.getElementAttributes(child));
	      }
	    }
	  }
	
	  return options;
	};
	
	vjs.Player.prototype.createEl = function(){
	  var
	    el = this.el_ = vjs.Component.prototype.createEl.call(this, 'div'),
	    tag = this.tag,
	    attrs;
	
	  // Remove width/height attrs from tag so CSS can make it 100% width/height
	  tag.removeAttribute('width');
	  tag.removeAttribute('height');
	
	  // Copy over all the attributes from the tag, including ID and class
	  // ID will now reference player box, not the video tag
	  attrs = vjs.getElementAttributes(tag);
	  vjs.obj.each(attrs, function(attr) {
	    // workaround so we don't totally break IE7
	    // http://stackoverflow.com/questions/3653444/css-styles-not-applied-on-dynamic-elements-in-internet-explorer-7
	    if (attr == 'class') {
	      el.className = attrs[attr];
	    } else {
	      el.setAttribute(attr, attrs[attr]);
	    }
	  });
	
	  // Update tag id/class for use as HTML5 playback tech
	  // Might think we should do this after embedding in container so .vjs-tech class
	  // doesn't flash 100% width/height, but class only applies with .video-js parent
	  tag.id += '_html5_api';
	  tag.className = 'vjs-tech';
	
	  // Make player findable on elements
	  tag['player'] = el['player'] = this;
	  // Default state of video is paused
	  this.addClass('vjs-paused');
	
	  // Make box use width/height of tag, or rely on default implementation
	  // Enforce with CSS since width/height attrs don't work on divs
	  this.width(this.options_['width'], true); // (true) Skip resize listener on load
	  this.height(this.options_['height'], true);
	
	  // vjs.insertFirst seems to cause the networkState to flicker from 3 to 2, so
	  // keep track of the original for later so we can know if the source originally failed
	  tag.initNetworkState_ = tag.networkState;
	
	  // Wrap video tag in div (el/box) container
	  if (tag.parentNode) {
	    tag.parentNode.insertBefore(el, tag);
	  }
	  vjs.insertFirst(tag, el); // Breaks iPhone, fixed in HTML5 setup.
	
	  // The event listeners need to be added before the children are added
	  // in the component init because the tech (loaded with mediaLoader) may
	  // fire events, like loadstart, that these events need to capture.
	  // Long term it might be better to expose a way to do this in component.init
	  // like component.initEventListeners() that runs between el creation and
	  // adding children
	  this.el_ = el;
	  this.on('loadstart', this.onLoadStart);
	  this.on('waiting', this.onWaiting);
	  this.on(['canplay', 'canplaythrough', 'playing', 'ended'], this.onWaitEnd);
	  this.on('seeking', this.onSeeking);
	  this.on('seeked', this.onSeeked);
	  this.on('ended', this.onEnded);
	  this.on('play', this.onPlay);
	  this.on('firstplay', this.onFirstPlay);
	  this.on('pause', this.onPause);
	  this.on('progress', this.onProgress);
	  this.on('durationchange', this.onDurationChange);
	  this.on('fullscreenchange', this.onFullscreenChange);
	
	  return el;
	};
	
	// /* Media Technology (tech)
	// ================================================================================ */
	// Load/Create an instance of playback technology including element and API methods
	// And append playback element in player div.
	vjs.Player.prototype.loadTech = function(techName, source){
	
	  // Pause and remove current playback technology
	  if (this.tech) {
	    this.unloadTech();
	  }
	
	  // get rid of the HTML5 video tag as soon as we are using another tech
	  if (techName !== 'Html5' && this.tag) {
	    vjs.Html5.disposeMediaElement(this.tag);
	    this.tag = null;
	  }
	
	  this.techName = techName;
	
	  // Turn off API access because we're loading a new tech that might load asynchronously
	  this.isReady_ = false;
	
	  var techReady = function(){
	    this.player_.triggerReady();
	  };
	
	  // Grab tech-specific options from player options and add source and parent element to use.
	  var techOptions = vjs.obj.merge({ 'source': source, 'parentEl': this.el_ }, this.options_[techName.toLowerCase()]);
	
	  if (source) {
	    this.currentType_ = source.type;
	    if (source.src == this.cache_.src && this.cache_.currentTime > 0) {
	      techOptions['startTime'] = this.cache_.currentTime;
	    }
	
	    this.cache_.src = source.src;
	  }
	
	  // Initialize tech instance
	  this.tech = new window['videojs'][techName](this, techOptions);
	
	  this.tech.ready(techReady);
	};
	
	vjs.Player.prototype.unloadTech = function(){
	  this.isReady_ = false;
	
	  this.tech.dispose();
	
	  this.tech = false;
	};
	
	// There's many issues around changing the size of a Flash (or other plugin) object.
	// First is a plugin reload issue in Firefox that has been around for 11 years: https://bugzilla.mozilla.org/show_bug.cgi?id=90268
	// Then with the new fullscreen API, Mozilla and webkit browsers will reload the flash object after going to fullscreen.
	// To get around this, we're unloading the tech, caching source and currentTime values, and reloading the tech once the plugin is resized.
	// reloadTech: function(betweenFn){
	//   vjs.log('unloadingTech')
	//   this.unloadTech();
	//   vjs.log('unloadedTech')
	//   if (betweenFn) { betweenFn.call(); }
	//   vjs.log('LoadingTech')
	//   this.loadTech(this.techName, { src: this.cache_.src })
	//   vjs.log('loadedTech')
	// },
	
	// /* Player event handlers (how the player reacts to certain events)
	// ================================================================================ */
	
	/**
	 * Fired when the user agent begins looking for media data
	 * @event loadstart
	 */
	vjs.Player.prototype.onLoadStart = function() {
	  // TODO: Update to use `emptied` event instead. See #1277.
	
	  this.removeClass('vjs-ended');
	
	  // reset the error state
	  this.error(null);
	
	  // If it's already playing we want to trigger a firstplay event now.
	  // The firstplay event relies on both the play and loadstart events
	  // which can happen in any order for a new source
	  if (!this.paused()) {
	    this.trigger('firstplay');
	  } else {
	    // reset the hasStarted state
	    this.hasStarted(false);
	  }
	};
	
	vjs.Player.prototype.hasStarted_ = false;
	
	vjs.Player.prototype.hasStarted = function(hasStarted){
	  if (hasStarted !== undefined) {
	    // only update if this is a new value
	    if (this.hasStarted_ !== hasStarted) {
	      this.hasStarted_ = hasStarted;
	      if (hasStarted) {
	        this.addClass('vjs-has-started');
	        // trigger the firstplay event if this newly has played
	        this.trigger('firstplay');
	      } else {
	        this.removeClass('vjs-has-started');
	      }
	    }
	    return this;
	  }
	  return this.hasStarted_;
	};
	
	/**
	 * Fired when the player has initial duration and dimension information
	 * @event loadedmetadata
	 */
	vjs.Player.prototype.onLoadedMetaData;
	
	/**
	 * Fired when the player has downloaded data at the current playback position
	 * @event loadeddata
	 */
	vjs.Player.prototype.onLoadedData;
	
	/**
	 * Fired when the player has finished downloading the source data
	 * @event loadedalldata
	 */
	vjs.Player.prototype.onLoadedAllData;
	
	/**
	 * Fired whenever the media begins or resumes playback
	 * @event play
	 */
	vjs.Player.prototype.onPlay = function(){
	  this.removeClass('vjs-ended');
	  this.removeClass('vjs-paused');
	  this.addClass('vjs-playing');
	
	  // hide the poster when the user hits play
	  // https://html.spec.whatwg.org/multipage/embedded-content.html#dom-media-play
	  this.hasStarted(true);
	};
	
	/**
	 * Fired whenever the media begins waiting
	 * @event waiting
	 */
	vjs.Player.prototype.onWaiting = function(){
	  this.addClass('vjs-waiting');
	};
	
	/**
	 * A handler for events that signal that waiting has ended
	 * which is not consistent between browsers. See #1351
	 * @private
	 */
	vjs.Player.prototype.onWaitEnd = function(){
	  this.removeClass('vjs-waiting');
	};
	
	/**
	 * Fired whenever the player is jumping to a new time
	 * @event seeking
	 */
	vjs.Player.prototype.onSeeking = function(){
	  this.addClass('vjs-seeking');
	};
	
	/**
	 * Fired when the player has finished jumping to a new time
	 * @event seeked
	 */
	vjs.Player.prototype.onSeeked = function(){
	  this.removeClass('vjs-seeking');
	};
	
	/**
	 * Fired the first time a video is played
	 *
	 * Not part of the HLS spec, and we're not sure if this is the best
	 * implementation yet, so use sparingly. If you don't have a reason to
	 * prevent playback, use `myPlayer.one('play');` instead.
	 *
	 * @event firstplay
	 */
	vjs.Player.prototype.onFirstPlay = function(){
	    //If the first starttime attribute is specified
	    //then we will start at the given offset in seconds
	    if(this.options_['starttime']){
	      this.currentTime(this.options_['starttime']);
	    }
	
	    this.addClass('vjs-has-started');
	};
	
	/**
	 * Fired whenever the media has been paused
	 * @event pause
	 */
	vjs.Player.prototype.onPause = function(){
	  this.removeClass('vjs-playing');
	  this.addClass('vjs-paused');
	};
	
	/**
	 * Fired when the current playback position has changed
	 *
	 * During playback this is fired every 15-250 milliseconds, depending on the
	 * playback technology in use.
	 * @event timeupdate
	 */
	vjs.Player.prototype.onTimeUpdate;
	
	/**
	 * Fired while the user agent is downloading media data
	 * @event progress
	 */
	vjs.Player.prototype.onProgress = function(){
	  // Add custom event for when source is finished downloading.
	  if (this.bufferedPercent() == 1) {
	    this.trigger('loadedalldata');
	  }
	};
	
	/**
	 * Fired when the end of the media resource is reached (currentTime == duration)
	 * @event ended
	 */
	vjs.Player.prototype.onEnded = function(){
	  this.addClass('vjs-ended');
	  if (this.options_['loop']) {
	    this.currentTime(0);
	    this.play();
	  } else if (!this.paused()) {
	    this.pause();
	  }
	};
	
	/**
	 * Fired when the duration of the media resource is first known or changed
	 * @event durationchange
	 */
	vjs.Player.prototype.onDurationChange = function(){
	  // Allows for caching value instead of asking player each time.
	  // We need to get the techGet response and check for a value so we don't
	  // accidentally cause the stack to blow up.
	  var duration = this.techGet('duration');
	  if (duration) {
	    if (duration < 0) {
	      duration = Infinity;
	    }
	    this.duration(duration);
	    // Determine if the stream is live and propagate styles down to UI.
	    if (duration === Infinity) {
	      this.addClass('vjs-live');
	    } else {
	      this.removeClass('vjs-live');
	    }
	  }
	};
	
	/**
	 * Fired when the volume changes
	 * @event volumechange
	 */
	vjs.Player.prototype.onVolumeChange;
	
	/**
	 * Fired when the player switches in or out of fullscreen mode
	 * @event fullscreenchange
	 */
	vjs.Player.prototype.onFullscreenChange = function() {
	  if (this.isFullscreen()) {
	    this.addClass('vjs-fullscreen');
	  } else {
	    this.removeClass('vjs-fullscreen');
	  }
	};
	
	/**
	 * Fired when an error occurs
	 * @event error
	 */
	vjs.Player.prototype.onError;
	
	// /* Player API
	// ================================================================================ */
	
	/**
	 * Object for cached values.
	 * @private
	 */
	vjs.Player.prototype.cache_;
	
	vjs.Player.prototype.getCache = function(){
	  return this.cache_;
	};
	
	// Pass values to the playback tech
	vjs.Player.prototype.techCall = function(method, arg){
	  // If it's not ready yet, call method when it is
	  if (this.tech && !this.tech.isReady_) {
	    this.tech.ready(function(){
	      this[method](arg);
	    });
	
	  // Otherwise call method now
	  } else {
	    try {
	      this.tech[method](arg);
	    } catch(e) {
	      vjs.log(e);
	      throw e;
	    }
	  }
	};
	
	// Get calls can't wait for the tech, and sometimes don't need to.
	vjs.Player.prototype.techGet = function(method){
	  if (this.tech && this.tech.isReady_) {
	
	    // Flash likes to die and reload when you hide or reposition it.
	    // In these cases the object methods go away and we get errors.
	    // When that happens we'll catch the errors and inform tech that it's not ready any more.
	    try {
	      return this.tech[method]();
	    } catch(e) {
	      // When building additional tech libs, an expected method may not be defined yet
	      if (this.tech[method] === undefined) {
	        vjs.log('Video.js: ' + method + ' method not defined for '+this.techName+' playback technology.', e);
	      } else {
	        // When a method isn't available on the object it throws a TypeError
	        if (e.name == 'TypeError') {
	          vjs.log('Video.js: ' + method + ' unavailable on '+this.techName+' playback technology element.', e);
	          this.tech.isReady_ = false;
	        } else {
	          vjs.log(e);
	        }
	      }
	      throw e;
	    }
	  }
	
	  return;
	};
	
	/**
	 * start media playback
	 *
	 *     myPlayer.play();
	 *
	 * @return {vjs.Player} self
	 */
	vjs.Player.prototype.play = function(){
	  this.techCall('play');
	  return this;
	};
	
	/**
	 * Pause the video playback
	 *
	 *     myPlayer.pause();
	 *
	 * @return {vjs.Player} self
	 */
	vjs.Player.prototype.pause = function(){
	  this.techCall('pause');
	  return this;
	};
	
	/**
	 * Check if the player is paused
	 *
	 *     var isPaused = myPlayer.paused();
	 *     var isPlaying = !myPlayer.paused();
	 *
	 * @return {Boolean} false if the media is currently playing, or true otherwise
	 */
	vjs.Player.prototype.paused = function(){
	  // The initial state of paused should be true (in Safari it's actually false)
	  return (this.techGet('paused') === false) ? false : true;
	};
	
	/**
	 * Get or set the current time (in seconds)
	 *
	 *     // get
	 *     var whereYouAt = myPlayer.currentTime();
	 *
	 *     // set
	 *     myPlayer.currentTime(120); // 2 minutes into the video
	 *
	 * @param  {Number|String=} seconds The time to seek to
	 * @return {Number}        The time in seconds, when not setting
	 * @return {vjs.Player}    self, when the current time is set
	 */
	vjs.Player.prototype.currentTime = function(seconds){
	  if (seconds !== undefined) {
	
	    this.techCall('setCurrentTime', seconds);
	
	    return this;
	  }
	
	  // cache last currentTime and return. default to 0 seconds
	  //
	  // Caching the currentTime is meant to prevent a massive amount of reads on the tech's
	  // currentTime when scrubbing, but may not provide much performance benefit afterall.
	  // Should be tested. Also something has to read the actual current time or the cache will
	  // never get updated.
	  return this.cache_.currentTime = (this.techGet('currentTime') || 0);
	};
	
	/**
	 * Get the length in time of the video in seconds
	 *
	 *     var lengthOfVideo = myPlayer.duration();
	 *
	 * **NOTE**: The video must have started loading before the duration can be
	 * known, and in the case of Flash, may not be known until the video starts
	 * playing.
	 *
	 * @return {Number} The duration of the video in seconds
	 */
	vjs.Player.prototype.duration = function(seconds){
	  if (seconds !== undefined) {
	
	    // cache the last set value for optimized scrubbing (esp. Flash)
	    this.cache_.duration = parseFloat(seconds);
	
	    return this;
	  }
	
	  if (this.cache_.duration === undefined) {
	    this.onDurationChange();
	  }
	
	  return this.cache_.duration || 0;
	};
	
	/**
	 * Calculates how much time is left.
	 *
	 *     var timeLeft = myPlayer.remainingTime();
	 *
	 * Not a native video element function, but useful
	 * @return {Number} The time remaining in seconds
	 */
	vjs.Player.prototype.remainingTime = function(){
	  return this.duration() - this.currentTime();
	};
	
	// http://dev.w3.org/html5/spec/video.html#dom-media-buffered
	// Buffered returns a timerange object.
	// Kind of like an array of portions of the video that have been downloaded.
	
	/**
	 * Get a TimeRange object with the times of the video that have been downloaded
	 *
	 * If you just want the percent of the video that's been downloaded,
	 * use bufferedPercent.
	 *
	 *     // Number of different ranges of time have been buffered. Usually 1.
	 *     numberOfRanges = bufferedTimeRange.length,
	 *
	 *     // Time in seconds when the first range starts. Usually 0.
	 *     firstRangeStart = bufferedTimeRange.start(0),
	 *
	 *     // Time in seconds when the first range ends
	 *     firstRangeEnd = bufferedTimeRange.end(0),
	 *
	 *     // Length in seconds of the first time range
	 *     firstRangeLength = firstRangeEnd - firstRangeStart;
	 *
	 * @return {Object} A mock TimeRange object (following HTML spec)
	 */
	vjs.Player.prototype.buffered = function(){
	  var buffered = this.techGet('buffered');
	
	  if (!buffered || !buffered.length) {
	    buffered = vjs.createTimeRange(0,0);
	  }
	
	  return buffered;
	};
	
	/**
	 * Get the percent (as a decimal) of the video that's been downloaded
	 *
	 *     var howMuchIsDownloaded = myPlayer.bufferedPercent();
	 *
	 * 0 means none, 1 means all.
	 * (This method isn't in the HTML5 spec, but it's very convenient)
	 *
	 * @return {Number} A decimal between 0 and 1 representing the percent
	 */
	vjs.Player.prototype.bufferedPercent = function(){
	  var duration = this.duration(),
	      buffered = this.buffered(),
	      bufferedDuration = 0,
	      start, end;
	
	  if (!duration) {
	    return 0;
	  }
	
	  for (var i=0; i<buffered.length; i++){
	    start = buffered.start(i);
	    end   = buffered.end(i);
	
	    // buffered end can be bigger than duration by a very small fraction
	    if (end > duration) {
	      end = duration;
	    }
	
	    bufferedDuration += end - start;
	  }
	
	  return bufferedDuration / duration;
	};
	
	/**
	 * Get the ending time of the last buffered time range
	 *
	 * This is used in the progress bar to encapsulate all time ranges.
	 * @return {Number} The end of the last buffered time range
	 */
	vjs.Player.prototype.bufferedEnd = function(){
	  var buffered = this.buffered(),
	      duration = this.duration(),
	      end = buffered.end(buffered.length-1);
	
	  if (end > duration) {
	    end = duration;
	  }
	
	  return end;
	};
	
	/**
	 * Get or set the current volume of the media
	 *
	 *     // get
	 *     var howLoudIsIt = myPlayer.volume();
	 *
	 *     // set
	 *     myPlayer.volume(0.5); // Set volume to half
	 *
	 * 0 is off (muted), 1.0 is all the way up, 0.5 is half way.
	 *
	 * @param  {Number} percentAsDecimal The new volume as a decimal percent
	 * @return {Number}                  The current volume, when getting
	 * @return {vjs.Player}              self, when setting
	 */
	vjs.Player.prototype.volume = function(percentAsDecimal){
	  var vol;
	
	  if (percentAsDecimal !== undefined) {
	    vol = Math.max(0, Math.min(1, parseFloat(percentAsDecimal))); // Force value to between 0 and 1
	    this.cache_.volume = vol;
	    this.techCall('setVolume', vol);
	    vjs.setLocalStorage('volume', vol);
	    return this;
	  }
	
	  // Default to 1 when returning current volume.
	  vol = parseFloat(this.techGet('volume'));
	  return (isNaN(vol)) ? 1 : vol;
	};
	
	
	/**
	 * Get the current muted state, or turn mute on or off
	 *
	 *     // get
	 *     var isVolumeMuted = myPlayer.muted();
	 *
	 *     // set
	 *     myPlayer.muted(true); // mute the volume
	 *
	 * @param  {Boolean=} muted True to mute, false to unmute
	 * @return {Boolean} True if mute is on, false if not, when getting
	 * @return {vjs.Player} self, when setting mute
	 */
	vjs.Player.prototype.muted = function(muted){
	  if (muted !== undefined) {
	    this.techCall('setMuted', muted);
	    return this;
	  }
	  return this.techGet('muted') || false; // Default to false
	};
	
	// Check if current tech can support native fullscreen
	// (e.g. with built in controls like iOS, so not our flash swf)
	vjs.Player.prototype.supportsFullScreen = function(){
	  return this.techGet('supportsFullScreen') || false;
	};
	
	/**
	 * is the player in fullscreen
	 * @type {Boolean}
	 * @private
	 */
	vjs.Player.prototype.isFullscreen_ = false;
	
	/**
	 * Check if the player is in fullscreen mode
	 *
	 *     // get
	 *     var fullscreenOrNot = myPlayer.isFullscreen();
	 *
	 *     // set
	 *     myPlayer.isFullscreen(true); // tell the player it's in fullscreen
	 *
	 * NOTE: As of the latest HTML5 spec, isFullscreen is no longer an official
	 * property and instead document.fullscreenElement is used. But isFullscreen is
	 * still a valuable property for internal player workings.
	 *
	 * @param  {Boolean=} isFS Update the player's fullscreen state
	 * @return {Boolean} true if fullscreen, false if not
	 * @return {vjs.Player} self, when setting
	 */
	vjs.Player.prototype.isFullscreen = function(isFS){
	  if (isFS !== undefined) {
	    this.isFullscreen_ = !!isFS;
	    return this;
	  }
	  return this.isFullscreen_;
	};
	
	/**
	 * Old naming for isFullscreen()
	 * @deprecated for lowercase 's' version
	 */
	vjs.Player.prototype.isFullScreen = function(isFS){
	  vjs.log.warn('player.isFullScreen() has been deprecated, use player.isFullscreen() with a lowercase "s")');
	  return this.isFullscreen(isFS);
	};
	
	/**
	 * Increase the size of the video to full screen
	 *
	 *     myPlayer.requestFullscreen();
	 *
	 * In some browsers, full screen is not supported natively, so it enters
	 * "full window mode", where the video fills the browser window.
	 * In browsers and devices that support native full screen, sometimes the
	 * browser's default controls will be shown, and not the Video.js custom skin.
	 * This includes most mobile devices (iOS, Android) and older versions of
	 * Safari.
	 *
	 * @return {vjs.Player} self
	 */
	vjs.Player.prototype.requestFullscreen = function(){
	  var fsApi = vjs.browser.fullscreenAPI;
	
	  this.isFullscreen(true);
	
	  if (fsApi) {
	    // the browser supports going fullscreen at the element level so we can
	    // take the controls fullscreen as well as the video
	
	    // Trigger fullscreenchange event after change
	    // We have to specifically add this each time, and remove
	    // when canceling fullscreen. Otherwise if there's multiple
	    // players on a page, they would all be reacting to the same fullscreen
	    // events
	    vjs.on(document, fsApi['fullscreenchange'], vjs.bind(this, function(e){
	      this.isFullscreen(document[fsApi.fullscreenElement]);
	
	      // If cancelling fullscreen, remove event listener.
	      if (this.isFullscreen() === false) {
	        vjs.off(document, fsApi['fullscreenchange'], arguments.callee);
	      }
	
	      this.trigger('fullscreenchange');
	    }));
	
	    this.el_[fsApi.requestFullscreen]();
	
	  } else if (this.tech.supportsFullScreen()) {
	    // we can't take the video.js controls fullscreen but we can go fullscreen
	    // with native controls
	    this.techCall('enterFullScreen');
	  } else {
	    // fullscreen isn't supported so we'll just stretch the video element to
	    // fill the viewport
	    this.enterFullWindow();
	    this.trigger('fullscreenchange');
	  }
	
	  return this;
	};
	
	/**
	 * Old naming for requestFullscreen
	 * @deprecated for lower case 's' version
	 */
	vjs.Player.prototype.requestFullScreen = function(){
	  vjs.log.warn('player.requestFullScreen() has been deprecated, use player.requestFullscreen() with a lowercase "s")');
	  return this.requestFullscreen();
	};
	
	
	/**
	 * Return the video to its normal size after having been in full screen mode
	 *
	 *     myPlayer.exitFullscreen();
	 *
	 * @return {vjs.Player} self
	 */
	vjs.Player.prototype.exitFullscreen = function(){
	  var fsApi = vjs.browser.fullscreenAPI;
	  this.isFullscreen(false);
	
	  // Check for browser element fullscreen support
	  if (fsApi) {
	    document[fsApi.exitFullscreen]();
	  } else if (this.tech.supportsFullScreen()) {
	   this.techCall('exitFullScreen');
	  } else {
	   this.exitFullWindow();
	   this.trigger('fullscreenchange');
	  }
	
	  return this;
	};
	
	/**
	 * Old naming for exitFullscreen
	 * @deprecated for exitFullscreen
	 */
	vjs.Player.prototype.cancelFullScreen = function(){
	  vjs.log.warn('player.cancelFullScreen() has been deprecated, use player.exitFullscreen()');
	  return this.exitFullscreen();
	};
	
	// When fullscreen isn't supported we can stretch the video container to as wide as the browser will let us.
	vjs.Player.prototype.enterFullWindow = function(){
	  this.isFullWindow = true;
	
	  // Storing original doc overflow value to return to when fullscreen is off
	  this.docOrigOverflow = document.documentElement.style.overflow;
	
	  // Add listener for esc key to exit fullscreen
	  vjs.on(document, 'keydown', vjs.bind(this, this.fullWindowOnEscKey));
	
	  // Hide any scroll bars
	  document.documentElement.style.overflow = 'hidden';
	
	  // Apply fullscreen styles
	  vjs.addClass(document.body, 'vjs-full-window');
	
	  this.trigger('enterFullWindow');
	};
	vjs.Player.prototype.fullWindowOnEscKey = function(event){
	  if (event.keyCode === 27) {
	    if (this.isFullscreen() === true) {
	      this.exitFullscreen();
	    } else {
	      this.exitFullWindow();
	    }
	  }
	};
	
	vjs.Player.prototype.exitFullWindow = function(){
	  this.isFullWindow = false;
	  vjs.off(document, 'keydown', this.fullWindowOnEscKey);
	
	  // Unhide scroll bars.
	  document.documentElement.style.overflow = this.docOrigOverflow;
	
	  // Remove fullscreen styles
	  vjs.removeClass(document.body, 'vjs-full-window');
	
	  // Resize the box, controller, and poster to original sizes
	  // this.positionAll();
	  this.trigger('exitFullWindow');
	};
	
	vjs.Player.prototype.selectSource = function(sources){
	  // Loop through each playback technology in the options order
	  for (var i=0,j=this.options_['techOrder'];i<j.length;i++) {
	    var techName = vjs.capitalize(j[i]),
	        tech = window['videojs'][techName];
	
	    // Check if the current tech is defined before continuing
	    if (!tech) {
	      vjs.log.error('The "' + techName + '" tech is undefined. Skipped browser support check for that tech.');
	      continue;
	    }
	
	    // Check if the browser supports this technology
	    if (tech.isSupported()) {
	      // Loop through each source object
	      for (var a=0,b=sources;a<b.length;a++) {
	        var source = b[a];
	
	        // Check if source can be played with this technology
	        if (tech['canPlaySource'](source)) {
	          return { source: source, tech: techName };
	        }
	      }
	    }
	  }
	
	  return false;
	};
	
	/**
	 * The source function updates the video source
	 *
	 * There are three types of variables you can pass as the argument.
	 *
	 * **URL String**: A URL to the the video file. Use this method if you are sure
	 * the current playback technology (HTML5/Flash) can support the source you
	 * provide. Currently only MP4 files can be used in both HTML5 and Flash.
	 *
	 *     myPlayer.src("http://www.example.com/path/to/video.mp4");
	 *
	 * **Source Object (or element):** A javascript object containing information
	 * about the source file. Use this method if you want the player to determine if
	 * it can support the file using the type information.
	 *
	 *     myPlayer.src({ type: "video/mp4", src: "http://www.example.com/path/to/video.mp4" });
	 *
	 * **Array of Source Objects:** To provide multiple versions of the source so
	 * that it can be played using HTML5 across browsers you can use an array of
	 * source objects. Video.js will detect which version is supported and load that
	 * file.
	 *
	 *     myPlayer.src([
	 *       { type: "video/mp4", src: "http://www.example.com/path/to/video.mp4" },
	 *       { type: "video/webm", src: "http://www.example.com/path/to/video.webm" },
	 *       { type: "video/ogg", src: "http://www.example.com/path/to/video.ogv" }
	 *     ]);
	 *
	 * @param  {String|Object|Array=} source The source URL, object, or array of sources
	 * @return {String} The current video source when getting
	 * @return {String} The player when setting
	 */
	vjs.Player.prototype.src = function(source){
	  if (source === undefined) {
	    return this.techGet('src');
	  }
	
	  // case: Array of source objects to choose from and pick the best to play
	  if (vjs.obj.isArray(source)) {
	    this.sourceList_(source);
	
	  // case: URL String (http://myvideo...)
	  } else if (typeof source === 'string') {
	    // create a source object from the string
	    this.src({ src: source });
	
	  // case: Source object { src: '', type: '' ... }
	  } else if (source instanceof Object) {
	    // check if the source has a type and the loaded tech cannot play the source
	    // if there's no type we'll just try the current tech
	    if (source.type && !window['videojs'][this.techName]['canPlaySource'](source)) {
	      // create a source list with the current source and send through
	      // the tech loop to check for a compatible technology
	      this.sourceList_([source]);
	    } else {
	      this.cache_.src = source.src;
	      this.currentType_ = source.type || '';
	
	      // wait until the tech is ready to set the source
	      this.ready(function(){
	
	        // The setSource tech method was added with source handlers
	        // so older techs won't support it
	        // We need to check the direct prototype for the case where subclasses
	        // of the tech do not support source handlers
	        if (window['videojs'][this.techName].prototype.hasOwnProperty('setSource')) {
	          this.techCall('setSource', source);
	        } else {
	          this.techCall('src', source.src);
	        }
	
	        if (this.options_['preload'] == 'auto') {
	          this.load();
	        }
	
	        if (this.options_['autoplay']) {
	          this.play();
	        }
	      });
	    }
	  }
	
	  return this;
	};
	
	/**
	 * Handle an array of source objects
	 * @param  {[type]} sources Array of source objects
	 * @private
	 */
	vjs.Player.prototype.sourceList_ = function(sources){
	  var sourceTech = this.selectSource(sources);
	
	  if (sourceTech) {
	    if (sourceTech.tech === this.techName) {
	      // if this technology is already loaded, set the source
	      this.src(sourceTech.source);
	    } else {
	      // load this technology with the chosen source
	      this.loadTech(sourceTech.tech, sourceTech.source);
	    }
	  } else {
	    // We need to wrap this in a timeout to give folks a chance to add error event handlers
	    this.setTimeout( function() {
	      this.error({ code: 4, message: this.localize(this.options()['notSupportedMessage']) });
	    }, 0);
	
	    // we could not find an appropriate tech, but let's still notify the delegate that this is it
	    // this needs a better comment about why this is needed
	    this.triggerReady();
	  }
	};
	
	/**
	 * Begin loading the src data.
	 * @return {vjs.Player} Returns the player
	 */
	vjs.Player.prototype.load = function(){
	  this.techCall('load');
	  return this;
	};
	
	/**
	 * Returns the fully qualified URL of the current source value e.g. http://mysite.com/video.mp4
	 * Can be used in conjuction with `currentType` to assist in rebuilding the current source object.
	 * @return {String} The current source
	 */
	vjs.Player.prototype.currentSrc = function(){
	  return this.techGet('currentSrc') || this.cache_.src || '';
	};
	
	/**
	 * Get the current source type e.g. video/mp4
	 * This can allow you rebuild the current source object so that you could load the same
	 * source and tech later
	 * @return {String} The source MIME type
	 */
	vjs.Player.prototype.currentType = function(){
	    return this.currentType_ || '';
	};
	
	/**
	 * Get or set the preload attribute.
	 * @return {String} The preload attribute value when getting
	 * @return {vjs.Player} Returns the player when setting
	 */
	vjs.Player.prototype.preload = function(value){
	  if (value !== undefined) {
	    this.techCall('setPreload', value);
	    this.options_['preload'] = value;
	    return this;
	  }
	  return this.techGet('preload');
	};
	
	/**
	 * Get or set the autoplay attribute.
	 * @return {String} The autoplay attribute value when getting
	 * @return {vjs.Player} Returns the player when setting
	 */
	vjs.Player.prototype.autoplay = function(value){
	  if (value !== undefined) {
	    this.techCall('setAutoplay', value);
	    this.options_['autoplay'] = value;
	    return this;
	  }
	  return this.techGet('autoplay', value);
	};
	
	/**
	 * Get or set the loop attribute on the video element.
	 * @return {String} The loop attribute value when getting
	 * @return {vjs.Player} Returns the player when setting
	 */
	vjs.Player.prototype.loop = function(value){
	  if (value !== undefined) {
	    this.techCall('setLoop', value);
	    this.options_['loop'] = value;
	    return this;
	  }
	  return this.techGet('loop');
	};
	
	/**
	 * the url of the poster image source
	 * @type {String}
	 * @private
	 */
	vjs.Player.prototype.poster_;
	
	/**
	 * get or set the poster image source url
	 *
	 * ##### EXAMPLE:
	 *
	 *     // getting
	 *     var currentPoster = myPlayer.poster();
	 *
	 *     // setting
	 *     myPlayer.poster('http://example.com/myImage.jpg');
	 *
	 * @param  {String=} [src] Poster image source URL
	 * @return {String} poster URL when getting
	 * @return {vjs.Player} self when setting
	 */
	vjs.Player.prototype.poster = function(src){
	  if (src === undefined) {
	    return this.poster_;
	  }
	
	  // The correct way to remove a poster is to set as an empty string
	  // other falsey values will throw errors
	  if (!src) {
	    src = '';
	  }
	
	  // update the internal poster variable
	  this.poster_ = src;
	
	  // update the tech's poster
	  this.techCall('setPoster', src);
	
	  // alert components that the poster has been set
	  this.trigger('posterchange');
	
	  return this;
	};
	
	/**
	 * Whether or not the controls are showing
	 * @type {Boolean}
	 * @private
	 */
	vjs.Player.prototype.controls_;
	
	/**
	 * Get or set whether or not the controls are showing.
	 * @param  {Boolean} controls Set controls to showing or not
	 * @return {Boolean}    Controls are showing
	 */
	vjs.Player.prototype.controls = function(bool){
	  if (bool !== undefined) {
	    bool = !!bool; // force boolean
	    // Don't trigger a change event unless it actually changed
	    if (this.controls_ !== bool) {
	      this.controls_ = bool;
	      if (bool) {
	        this.removeClass('vjs-controls-disabled');
	        this.addClass('vjs-controls-enabled');
	        this.trigger('controlsenabled');
	      } else {
	        this.removeClass('vjs-controls-enabled');
	        this.addClass('vjs-controls-disabled');
	        this.trigger('controlsdisabled');
	      }
	    }
	    return this;
	  }
	  return this.controls_;
	};
	
	vjs.Player.prototype.usingNativeControls_;
	
	/**
	 * Toggle native controls on/off. Native controls are the controls built into
	 * devices (e.g. default iPhone controls), Flash, or other techs
	 * (e.g. Vimeo Controls)
	 *
	 * **This should only be set by the current tech, because only the tech knows
	 * if it can support native controls**
	 *
	 * @param  {Boolean} bool    True signals that native controls are on
	 * @return {vjs.Player}      Returns the player
	 * @private
	 */
	vjs.Player.prototype.usingNativeControls = function(bool){
	  if (bool !== undefined) {
	    bool = !!bool; // force boolean
	    // Don't trigger a change event unless it actually changed
	    if (this.usingNativeControls_ !== bool) {
	      this.usingNativeControls_ = bool;
	      if (bool) {
	        this.addClass('vjs-using-native-controls');
	
	        /**
	         * player is using the native device controls
	         *
	         * @event usingnativecontrols
	         * @memberof vjs.Player
	         * @instance
	         * @private
	         */
	        this.trigger('usingnativecontrols');
	      } else {
	        this.removeClass('vjs-using-native-controls');
	
	        /**
	         * player is using the custom HTML controls
	         *
	         * @event usingcustomcontrols
	         * @memberof vjs.Player
	         * @instance
	         * @private
	         */
	        this.trigger('usingcustomcontrols');
	      }
	    }
	    return this;
	  }
	  return this.usingNativeControls_;
	};
	
	/**
	 * Store the current media error
	 * @type {Object}
	 * @private
	 */
	vjs.Player.prototype.error_ = null;
	
	/**
	 * Set or get the current MediaError
	 * @param  {*} err A MediaError or a String/Number to be turned into a MediaError
	 * @return {vjs.MediaError|null}     when getting
	 * @return {vjs.Player}              when setting
	 */
	vjs.Player.prototype.error = function(err){
	  if (err === undefined) {
	    return this.error_;
	  }
	
	  // restoring to default
	  if (err === null) {
	    this.error_ = err;
	    this.removeClass('vjs-error');
	    return this;
	  }
	
	  // error instance
	  if (err instanceof vjs.MediaError) {
	    this.error_ = err;
	  } else {
	    this.error_ = new vjs.MediaError(err);
	  }
	
	  // fire an error event on the player
	  this.trigger('error');
	
	  // add the vjs-error classname to the player
	  this.addClass('vjs-error');
	
	  // log the name of the error type and any message
	  // ie8 just logs "[object object]" if you just log the error object
	  vjs.log.error('(CODE:'+this.error_.code+' '+vjs.MediaError.errorTypes[this.error_.code]+')', this.error_.message, this.error_);
	
	  return this;
	};
	
	/**
	 * Returns whether or not the player is in the "ended" state.
	 * @return {Boolean} True if the player is in the ended state, false if not.
	 */
	vjs.Player.prototype.ended = function(){ return this.techGet('ended'); };
	
	/**
	 * Returns whether or not the player is in the "seeking" state.
	 * @return {Boolean} True if the player is in the seeking state, false if not.
	 */
	vjs.Player.prototype.seeking = function(){ return this.techGet('seeking'); };
	
	/**
	 * Returns the TimeRanges of the media that are currently available
	 * for seeking to.
	 * @return {TimeRanges} the seekable intervals of the media timeline
	 */
	vjs.Player.prototype.seekable = function(){ return this.techGet('seekable'); };
	
	// When the player is first initialized, trigger activity so components
	// like the control bar show themselves if needed
	vjs.Player.prototype.userActivity_ = true;
	vjs.Player.prototype.reportUserActivity = function(event){
	  this.userActivity_ = true;
	};
	
	vjs.Player.prototype.userActive_ = true;
	vjs.Player.prototype.userActive = function(bool){
	  if (bool !== undefined) {
	    bool = !!bool;
	    if (bool !== this.userActive_) {
	      this.userActive_ = bool;
	      if (bool) {
	        // If the user was inactive and is now active we want to reset the
	        // inactivity timer
	        this.userActivity_ = true;
	        this.removeClass('vjs-user-inactive');
	        this.addClass('vjs-user-active');
	        this.trigger('useractive');
	      } else {
	        // We're switching the state to inactive manually, so erase any other
	        // activity
	        this.userActivity_ = false;
	
	        // Chrome/Safari/IE have bugs where when you change the cursor it can
	        // trigger a mousemove event. This causes an issue when you're hiding
	        // the cursor when the user is inactive, and a mousemove signals user
	        // activity. Making it impossible to go into inactive mode. Specifically
	        // this happens in fullscreen when we really need to hide the cursor.
	        //
	        // When this gets resolved in ALL browsers it can be removed
	        // https://code.google.com/p/chromium/issues/detail?id=103041
	        if(this.tech) {
	          this.tech.one('mousemove', function(e){
	            e.stopPropagation();
	            e.preventDefault();
	          });
	        }
	
	        this.removeClass('vjs-user-active');
	        this.addClass('vjs-user-inactive');
	        this.trigger('userinactive');
	      }
	    }
	    return this;
	  }
	  return this.userActive_;
	};
	
	vjs.Player.prototype.listenForUserActivity = function(){
	  var onActivity, onMouseMove, onMouseDown, mouseInProgress, onMouseUp,
	      activityCheck, inactivityTimeout, lastMoveX, lastMoveY;
	
	  onActivity = vjs.bind(this, this.reportUserActivity);
	
	  onMouseMove = function(e) {
	    // #1068 - Prevent mousemove spamming
	    // Chrome Bug: https://code.google.com/p/chromium/issues/detail?id=366970
	    if(e.screenX != lastMoveX || e.screenY != lastMoveY) {
	      lastMoveX = e.screenX;
	      lastMoveY = e.screenY;
	      onActivity();
	    }
	  };
	
	  onMouseDown = function() {
	    onActivity();
	    // For as long as the they are touching the device or have their mouse down,
	    // we consider them active even if they're not moving their finger or mouse.
	    // So we want to continue to update that they are active
	    this.clearInterval(mouseInProgress);
	    // Setting userActivity=true now and setting the interval to the same time
	    // as the activityCheck interval (250) should ensure we never miss the
	    // next activityCheck
	    mouseInProgress = this.setInterval(onActivity, 250);
	  };
	
	  onMouseUp = function(event) {
	    onActivity();
	    // Stop the interval that maintains activity if the mouse/touch is down
	    this.clearInterval(mouseInProgress);
	  };
	
	  // Any mouse movement will be considered user activity
	  this.on('mousedown', onMouseDown);
	  this.on('mousemove', onMouseMove);
	  this.on('mouseup', onMouseUp);
	
	  // Listen for keyboard navigation
	  // Shouldn't need to use inProgress interval because of key repeat
	  this.on('keydown', onActivity);
	  this.on('keyup', onActivity);
	
	  // Run an interval every 250 milliseconds instead of stuffing everything into
	  // the mousemove/touchmove function itself, to prevent performance degradation.
	  // `this.reportUserActivity` simply sets this.userActivity_ to true, which
	  // then gets picked up by this loop
	  // http://ejohn.org/blog/learning-from-twitter/
	  activityCheck = this.setInterval(function() {
	    // Check to see if mouse/touch activity has happened
	    if (this.userActivity_) {
	      // Reset the activity tracker
	      this.userActivity_ = false;
	
	      // If the user state was inactive, set the state to active
	      this.userActive(true);
	
	      // Clear any existing inactivity timeout to start the timer over
	      this.clearTimeout(inactivityTimeout);
	
	      var timeout = this.options()['inactivityTimeout'];
	      if (timeout > 0) {
	          // In <timeout> milliseconds, if no more activity has occurred the
	          // user will be considered inactive
	          inactivityTimeout = this.setTimeout(function () {
	              // Protect against the case where the inactivityTimeout can trigger just
	              // before the next user activity is picked up by the activityCheck loop
	              // causing a flicker
	              if (!this.userActivity_) {
	                  this.userActive(false);
	              }
	          }, timeout);
	      }
	    }
	  }, 250);
	};
	
	/**
	 * Gets or sets the current playback rate.
	 * @param  {Boolean} rate   New playback rate to set.
	 * @return {Number}         Returns the new playback rate when setting
	 * @return {Number}         Returns the current playback rate when getting
	 */
	vjs.Player.prototype.playbackRate = function(rate) {
	  if (rate !== undefined) {
	    this.techCall('setPlaybackRate', rate);
	    return this;
	  }
	
	  if (this.tech && this.tech['featuresPlaybackRate']) {
	    return this.techGet('playbackRate');
	  } else {
	    return 1.0;
	  }
	
	};
	
	/**
	 * Store the current audio state
	 * @type {Boolean}
	 * @private
	 */
	vjs.Player.prototype.isAudio_ = false;
	
	/**
	 * Gets or sets the audio flag
	 *
	 * @param  {Boolean} bool    True signals that this is an audio player.
	 * @return {Boolean}         Returns true if player is audio, false if not when getting
	 * @return {vjs.Player}      Returns the player if setting
	 * @private
	 */
	vjs.Player.prototype.isAudio = function(bool) {
	  if (bool !== undefined) {
	    this.isAudio_ = !!bool;
	    return this;
	  }
	
	  return this.isAudio_;
	};
	
	/**
	 * Returns the current state of network activity for the element, from
	 * the codes in the list below.
	 * - NETWORK_EMPTY (numeric value 0)
	 *   The element has not yet been initialised. All attributes are in
	 *   their initial states.
	 * - NETWORK_IDLE (numeric value 1)
	 *   The element's resource selection algorithm is active and has
	 *   selected a resource, but it is not actually using the network at
	 *   this time.
	 * - NETWORK_LOADING (numeric value 2)
	 *   The user agent is actively trying to download data.
	 * - NETWORK_NO_SOURCE (numeric value 3)
	 *   The element's resource selection algorithm is active, but it has
	 *   not yet found a resource to use.
	 * @return {Number} the current network activity state
	 * @see https://html.spec.whatwg.org/multipage/embedded-content.html#network-states
	 */
	vjs.Player.prototype.networkState = function(){
	  return this.techGet('networkState');
	};
	
	/**
	 * Returns a value that expresses the current state of the element
	 * with respect to rendering the current playback position, from the
	 * codes in the list below.
	 * - HAVE_NOTHING (numeric value 0)
	 *   No information regarding the media resource is available.
	 * - HAVE_METADATA (numeric value 1)
	 *   Enough of the resource has been obtained that the duration of the
	 *   resource is available.
	 * - HAVE_CURRENT_DATA (numeric value 2)
	 *   Data for the immediate current playback position is available.
	 * - HAVE_FUTURE_DATA (numeric value 3)
	 *   Data for the immediate current playback position is available, as
	 *   well as enough data for the user agent to advance the current
	 *   playback position in the direction of playback.
	 * - HAVE_ENOUGH_DATA (numeric value 4)
	 *   The user agent estimates that enough data is available for
	 *   playback to proceed uninterrupted.
	 * @return {Number} the current playback rendering state
	 * @see https://html.spec.whatwg.org/multipage/embedded-content.html#dom-media-readystate
	 */
	vjs.Player.prototype.readyState = function(){
	  return this.techGet('readyState');
	};
	
	/**
	 * Text tracks are tracks of timed text events.
	 * Captions - text displayed over the video for the hearing impaired
	 * Subtitles - text displayed over the video for those who don't understand language in the video
	 * Chapters - text displayed in a menu allowing the user to jump to particular points (chapters) in the video
	 * Descriptions (not supported yet) - audio descriptions that are read back to the user by a screen reading device
	 */
	
	/**
	 * Get an array of associated text tracks. captions, subtitles, chapters, descriptions
	 * http://www.w3.org/html/wg/drafts/html/master/embedded-content-0.html#dom-media-texttracks
	 * @return {Array}           Array of track objects
	 */
	vjs.Player.prototype.textTracks = function(){
	  // cannot use techGet directly because it checks to see whether the tech is ready.
	  // Flash is unlikely to be ready in time but textTracks should still work.
	  return this.tech && this.tech['textTracks']();
	};
	
	vjs.Player.prototype.remoteTextTracks = function() {
	  return this.tech && this.tech['remoteTextTracks']();
	};
	
	/**
	 * Add a text track
	 * In addition to the W3C settings we allow adding additional info through options.
	 * http://www.w3.org/html/wg/drafts/html/master/embedded-content-0.html#dom-media-addtexttrack
	 * @param {String}  kind        Captions, subtitles, chapters, descriptions, or metadata
	 * @param {String=} label       Optional label
	 * @param {String=} language    Optional language
	 */
	vjs.Player.prototype.addTextTrack = function(kind, label, language) {
	  return this.tech && this.tech['addTextTrack'](kind, label, language);
	};
	
	vjs.Player.prototype.addRemoteTextTrack = function(options) {
	  return this.tech && this.tech['addRemoteTextTrack'](options);
	};
	
	vjs.Player.prototype.removeRemoteTextTrack = function(track) {
	  this.tech && this.tech['removeRemoteTextTrack'](track);
	};
	
	// Methods to add support for
	// initialTime: function(){ return this.techCall('initialTime'); },
	// startOffsetTime: function(){ return this.techCall('startOffsetTime'); },
	// played: function(){ return this.techCall('played'); },
	// seekable: function(){ return this.techCall('seekable'); },
	// videoTracks: function(){ return this.techCall('videoTracks'); },
	// audioTracks: function(){ return this.techCall('audioTracks'); },
	// videoWidth: function(){ return this.techCall('videoWidth'); },
	// videoHeight: function(){ return this.techCall('videoHeight'); },
	// defaultPlaybackRate: function(){ return this.techCall('defaultPlaybackRate'); },
	// mediaGroup: function(){ return this.techCall('mediaGroup'); },
	// controller: function(){ return this.techCall('controller'); },
	// defaultMuted: function(){ return this.techCall('defaultMuted'); }
	
	// TODO
	// currentSrcList: the array of sources including other formats and bitrates
	// playList: array of source lists in order of playback
	/**
	 * Container of main controls
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @class
	 * @constructor
	 * @extends vjs.Component
	 */
	vjs.ControlBar = vjs.Component.extend();
	
	vjs.ControlBar.prototype.options_ = {
	  loadEvent: 'play',
	  children: {
	    'playToggle': {},
	    'currentTimeDisplay': {},
	    'timeDivider': {},
	    'durationDisplay': {},
	    'remainingTimeDisplay': {},
	    'liveDisplay': {},
	    'progressControl': {},
	    'fullscreenToggle': {},
	    'volumeControl': {},
	    'muteToggle': {},
	    // 'volumeMenuButton': {},
	    'playbackRateMenuButton': {},
	    'subtitlesButton': {},
	    'captionsButton': {},
	    'chaptersButton': {}
	  }
	};
	
	vjs.ControlBar.prototype.createEl = function(){
	  return vjs.createEl('div', {
	    className: 'vjs-control-bar'
	  });
	};
	/**
	 * Displays the live indicator
	 * TODO - Future make it click to snap to live
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.LiveDisplay = vjs.Component.extend({
	  init: function(player, options){
	    vjs.Component.call(this, player, options);
	  }
	});
	
	vjs.LiveDisplay.prototype.createEl = function(){
	  var el = vjs.Component.prototype.createEl.call(this, 'div', {
	    className: 'vjs-live-controls vjs-control'
	  });
	
	  this.contentEl_ = vjs.createEl('div', {
	    className: 'vjs-live-display',
	    innerHTML: '<span class="vjs-control-text">' + this.localize('Stream Type') + '</span>' + this.localize('LIVE'),
	    'aria-live': 'off'
	  });
	
	  el.appendChild(this.contentEl_);
	
	  return el;
	};
	/**
	 * Button to toggle between play and pause
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @class
	 * @constructor
	 */
	vjs.PlayToggle = vjs.Button.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.Button.call(this, player, options);
	
	    this.on(player, 'play', this.onPlay);
	    this.on(player, 'pause', this.onPause);
	  }
	});
	
	vjs.PlayToggle.prototype.buttonText = 'Play';
	
	vjs.PlayToggle.prototype.buildCSSClass = function(){
	  return 'vjs-play-control ' + vjs.Button.prototype.buildCSSClass.call(this);
	};
	
	// OnClick - Toggle between play and pause
	vjs.PlayToggle.prototype.onClick = function(){
	  if (this.player_.paused()) {
	    this.player_.play();
	  } else {
	    this.player_.pause();
	  }
	};
	
	  // OnPlay - Add the vjs-playing class to the element so it can change appearance
	vjs.PlayToggle.prototype.onPlay = function(){
	  this.removeClass('vjs-paused');
	  this.addClass('vjs-playing');
	  this.el_.children[0].children[0].innerHTML = this.localize('Pause'); // change the button text to "Pause"
	};
	
	  // OnPause - Add the vjs-paused class to the element so it can change appearance
	vjs.PlayToggle.prototype.onPause = function(){
	  this.removeClass('vjs-playing');
	  this.addClass('vjs-paused');
	  this.el_.children[0].children[0].innerHTML = this.localize('Play'); // change the button text to "Play"
	};
	/**
	 * Displays the current time
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.CurrentTimeDisplay = vjs.Component.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.Component.call(this, player, options);
	
	    this.on(player, 'timeupdate', this.updateContent);
	  }
	});
	
	vjs.CurrentTimeDisplay.prototype.createEl = function(){
	  var el = vjs.Component.prototype.createEl.call(this, 'div', {
	    className: 'vjs-current-time vjs-time-controls vjs-control'
	  });
	
	  this.contentEl_ = vjs.createEl('div', {
	    className: 'vjs-current-time-display',
	    innerHTML: '<span class="vjs-control-text">Current Time </span>' + '0:00', // label the current time for screen reader users
	    'aria-live': 'off' // tell screen readers not to automatically read the time as it changes
	  });
	
	  el.appendChild(this.contentEl_);
	  return el;
	};
	
	vjs.CurrentTimeDisplay.prototype.updateContent = function(){
	  // Allows for smooth scrubbing, when player can't keep up.
	  var time = (this.player_.scrubbing) ? this.player_.getCache().currentTime : this.player_.currentTime();
	  this.contentEl_.innerHTML = '<span class="vjs-control-text">' + this.localize('Current Time') + '</span> ' + vjs.formatTime(time, this.player_.duration());
	};
	
	/**
	 * Displays the duration
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.DurationDisplay = vjs.Component.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.Component.call(this, player, options);
	
	    // this might need to be changed to 'durationchange' instead of 'timeupdate' eventually,
	    // however the durationchange event fires before this.player_.duration() is set,
	    // so the value cannot be written out using this method.
	    // Once the order of durationchange and this.player_.duration() being set is figured out,
	    // this can be updated.
	    this.on(player, 'timeupdate', this.updateContent);
	    this.on(player, 'loadedmetadata', this.updateContent);
	  }
	});
	
	vjs.DurationDisplay.prototype.createEl = function(){
	  var el = vjs.Component.prototype.createEl.call(this, 'div', {
	    className: 'vjs-duration vjs-time-controls vjs-control'
	  });
	
	  this.contentEl_ = vjs.createEl('div', {
	    className: 'vjs-duration-display',
	    innerHTML: '<span class="vjs-control-text">' + this.localize('Duration Time') + '</span> ' + '0:00', // label the duration time for screen reader users
	    'aria-live': 'off' // tell screen readers not to automatically read the time as it changes
	  });
	
	  el.appendChild(this.contentEl_);
	  return el;
	};
	
	vjs.DurationDisplay.prototype.updateContent = function(){
	  var duration = this.player_.duration();
	  if (duration) {
	      this.contentEl_.innerHTML = '<span class="vjs-control-text">' + this.localize('Duration Time') + '</span> ' + vjs.formatTime(duration); // label the duration time for screen reader users
	  }
	};
	
	/**
	 * The separator between the current time and duration
	 *
	 * Can be hidden if it's not needed in the design.
	 *
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.TimeDivider = vjs.Component.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.Component.call(this, player, options);
	  }
	});
	
	vjs.TimeDivider.prototype.createEl = function(){
	  return vjs.Component.prototype.createEl.call(this, 'div', {
	    className: 'vjs-time-divider',
	    innerHTML: '<div><span>/</span></div>'
	  });
	};
	
	/**
	 * Displays the time left in the video
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.RemainingTimeDisplay = vjs.Component.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.Component.call(this, player, options);
	
	    this.on(player, 'timeupdate', this.updateContent);
	  }
	});
	
	vjs.RemainingTimeDisplay.prototype.createEl = function(){
	  var el = vjs.Component.prototype.createEl.call(this, 'div', {
	    className: 'vjs-remaining-time vjs-time-controls vjs-control'
	  });
	
	  this.contentEl_ = vjs.createEl('div', {
	    className: 'vjs-remaining-time-display',
	    innerHTML: '<span class="vjs-control-text">' + this.localize('Remaining Time') + '</span> ' + '-0:00', // label the remaining time for screen reader users
	    'aria-live': 'off' // tell screen readers not to automatically read the time as it changes
	  });
	
	  el.appendChild(this.contentEl_);
	  return el;
	};
	
	vjs.RemainingTimeDisplay.prototype.updateContent = function(){
	  if (this.player_.duration()) {
	    this.contentEl_.innerHTML = '<span class="vjs-control-text">' + this.localize('Remaining Time') + '</span> ' + '-'+ vjs.formatTime(this.player_.remainingTime());
	  }
	
	  // Allows for smooth scrubbing, when player can't keep up.
	  // var time = (this.player_.scrubbing) ? this.player_.getCache().currentTime : this.player_.currentTime();
	  // this.contentEl_.innerHTML = vjs.formatTime(time, this.player_.duration());
	};
	/**
	 * Toggle fullscreen video
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @class
	 * @extends vjs.Button
	 */
	vjs.FullscreenToggle = vjs.Button.extend({
	  /**
	   * @constructor
	   * @memberof vjs.FullscreenToggle
	   * @instance
	   */
	  init: function(player, options){
	    vjs.Button.call(this, player, options);
	  }
	});
	
	vjs.FullscreenToggle.prototype.buttonText = 'Fullscreen';
	
	vjs.FullscreenToggle.prototype.buildCSSClass = function(){
	  return 'vjs-fullscreen-control ' + vjs.Button.prototype.buildCSSClass.call(this);
	};
	
	vjs.FullscreenToggle.prototype.onClick = function(){
	  if (!this.player_.isFullscreen()) {
	    this.player_.requestFullscreen();
	    this.controlText_.innerHTML = this.localize('Non-Fullscreen');
	  } else {
	    this.player_.exitFullscreen();
	    this.controlText_.innerHTML = this.localize('Fullscreen');
	  }
	};
	/**
	 * The Progress Control component contains the seek bar, load progress,
	 * and play progress
	 *
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.ProgressControl = vjs.Component.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.Component.call(this, player, options);
	  }
	});
	
	vjs.ProgressControl.prototype.options_ = {
	  children: {
	    'seekBar': {}
	  }
	};
	
	vjs.ProgressControl.prototype.createEl = function(){
	  return vjs.Component.prototype.createEl.call(this, 'div', {
	    className: 'vjs-progress-control vjs-control'
	  });
	};
	
	/**
	 * Seek Bar and holder for the progress bars
	 *
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.SeekBar = vjs.Slider.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.Slider.call(this, player, options);
	    this.on(player, 'timeupdate', this.updateARIAAttributes);
	    player.ready(vjs.bind(this, this.updateARIAAttributes));
	  }
	});
	
	vjs.SeekBar.prototype.options_ = {
	  children: {
	    'loadProgressBar': {},
	    'playProgressBar': {},
	    'seekHandle': {}
	  },
	  'barName': 'playProgressBar',
	  'handleName': 'seekHandle'
	};
	
	vjs.SeekBar.prototype.playerEvent = 'timeupdate';
	
	vjs.SeekBar.prototype.createEl = function(){
	  return vjs.Slider.prototype.createEl.call(this, 'div', {
	    className: 'vjs-progress-holder',
	    'aria-label': 'video progress bar'
	  });
	};
	
	vjs.SeekBar.prototype.updateARIAAttributes = function(){
	    // Allows for smooth scrubbing, when player can't keep up.
	    var time = (this.player_.scrubbing) ? this.player_.getCache().currentTime : this.player_.currentTime();
	    this.el_.setAttribute('aria-valuenow',vjs.round(this.getPercent()*100, 2)); // machine readable value of progress bar (percentage complete)
	    this.el_.setAttribute('aria-valuetext',vjs.formatTime(time, this.player_.duration())); // human readable value of progress bar (time complete)
	};
	
	vjs.SeekBar.prototype.getPercent = function(){
	  return this.player_.currentTime() / this.player_.duration();
	};
	
	vjs.SeekBar.prototype.onMouseDown = function(event){
	  vjs.Slider.prototype.onMouseDown.call(this, event);
	
	  this.player_.scrubbing = true;
	  this.player_.addClass('vjs-scrubbing');
	
	  this.videoWasPlaying = !this.player_.paused();
	  this.player_.pause();
	};
	
	vjs.SeekBar.prototype.onMouseMove = function(event){
	  var newTime = this.calculateDistance(event) * this.player_.duration();
	
	  // Don't let video end while scrubbing.
	  if (newTime == this.player_.duration()) { newTime = newTime - 0.1; }
	
	  // Set new time (tell player to seek to new time)
	  this.player_.currentTime(newTime);
	};
	
	vjs.SeekBar.prototype.onMouseUp = function(event){
	  vjs.Slider.prototype.onMouseUp.call(this, event);
	
	  this.player_.scrubbing = false;
	  this.player_.removeClass('vjs-scrubbing');
	  if (this.videoWasPlaying) {
	    this.player_.play();
	  }
	};
	
	vjs.SeekBar.prototype.stepForward = function(){
	  this.player_.currentTime(this.player_.currentTime() + 5); // more quickly fast forward for keyboard-only users
	};
	
	vjs.SeekBar.prototype.stepBack = function(){
	  this.player_.currentTime(this.player_.currentTime() - 5); // more quickly rewind for keyboard-only users
	};
	
	/**
	 * Shows load progress
	 *
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.LoadProgressBar = vjs.Component.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.Component.call(this, player, options);
	    this.on(player, 'progress', this.update);
	  }
	});
	
	vjs.LoadProgressBar.prototype.createEl = function(){
	  return vjs.Component.prototype.createEl.call(this, 'div', {
	    className: 'vjs-load-progress',
	    innerHTML: '<span class="vjs-control-text"><span>' + this.localize('Loaded') + '</span>: 0%</span>'
	  });
	};
	
	vjs.LoadProgressBar.prototype.update = function(){
	  var i, start, end, part,
	      buffered = this.player_.buffered(),
	      duration = this.player_.duration(),
	      bufferedEnd = this.player_.bufferedEnd(),
	      children = this.el_.children,
	      // get the percent width of a time compared to the total end
	      percentify = function (time, end){
	        var percent = (time / end) || 0; // no NaN
	        return (percent * 100) + '%';
	      };
	
	  // update the width of the progress bar
	  this.el_.style.width = percentify(bufferedEnd, duration);
	
	  // add child elements to represent the individual buffered time ranges
	  for (i = 0; i < buffered.length; i++) {
	    start = buffered.start(i),
	    end = buffered.end(i),
	    part = children[i];
	
	    if (!part) {
	      part = this.el_.appendChild(vjs.createEl());
	    }
	
	    // set the percent based on the width of the progress bar (bufferedEnd)
	    part.style.left = percentify(start, bufferedEnd);
	    part.style.width = percentify(end - start, bufferedEnd);
	  }
	
	  // remove unused buffered range elements
	  for (i = children.length; i > buffered.length; i--) {
	    this.el_.removeChild(children[i-1]);
	  }
	};
	
	/**
	 * Shows play progress
	 *
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.PlayProgressBar = vjs.Component.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.Component.call(this, player, options);
	  }
	});
	
	vjs.PlayProgressBar.prototype.createEl = function(){
	  return vjs.Component.prototype.createEl.call(this, 'div', {
	    className: 'vjs-play-progress',
	    innerHTML: '<span class="vjs-control-text"><span>' + this.localize('Progress') + '</span>: 0%</span>'
	  });
	};
	
	/**
	 * The Seek Handle shows the current position of the playhead during playback,
	 * and can be dragged to adjust the playhead.
	 *
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.SeekHandle = vjs.SliderHandle.extend({
	  init: function(player, options) {
	    vjs.SliderHandle.call(this, player, options);
	    this.on(player, 'timeupdate', this.updateContent);
	  }
	});
	
	/**
	 * The default value for the handle content, which may be read by screen readers
	 *
	 * @type {String}
	 * @private
	 */
	vjs.SeekHandle.prototype.defaultValue = '00:00';
	
	/** @inheritDoc */
	vjs.SeekHandle.prototype.createEl = function() {
	  return vjs.SliderHandle.prototype.createEl.call(this, 'div', {
	    className: 'vjs-seek-handle',
	    'aria-live': 'off'
	  });
	};
	
	vjs.SeekHandle.prototype.updateContent = function() {
	  var time = (this.player_.scrubbing) ? this.player_.getCache().currentTime : this.player_.currentTime();
	  this.el_.innerHTML = '<span class="vjs-control-text">' + vjs.formatTime(time, this.player_.duration()) + '</span>';
	};
	/**
	 * The component for controlling the volume level
	 *
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.VolumeControl = vjs.Component.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.Component.call(this, player, options);
	
	    // hide volume controls when they're not supported by the current tech
	    if (player.tech && player.tech['featuresVolumeControl'] === false) {
	      this.addClass('vjs-hidden');
	    }
	    this.on(player, 'loadstart', function(){
	      if (player.tech['featuresVolumeControl'] === false) {
	        this.addClass('vjs-hidden');
	      } else {
	        this.removeClass('vjs-hidden');
	      }
	    });
	  }
	});
	
	vjs.VolumeControl.prototype.options_ = {
	  children: {
	    'volumeBar': {}
	  }
	};
	
	vjs.VolumeControl.prototype.createEl = function(){
	  return vjs.Component.prototype.createEl.call(this, 'div', {
	    className: 'vjs-volume-control vjs-control'
	  });
	};
	
	/**
	 * The bar that contains the volume level and can be clicked on to adjust the level
	 *
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.VolumeBar = vjs.Slider.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.Slider.call(this, player, options);
	    this.on(player, 'volumechange', this.updateARIAAttributes);
	    player.ready(vjs.bind(this, this.updateARIAAttributes));
	  }
	});
	
	vjs.VolumeBar.prototype.updateARIAAttributes = function(){
	  // Current value of volume bar as a percentage
	  this.el_.setAttribute('aria-valuenow',vjs.round(this.player_.volume()*100, 2));
	  this.el_.setAttribute('aria-valuetext',vjs.round(this.player_.volume()*100, 2)+'%');
	};
	
	vjs.VolumeBar.prototype.options_ = {
	  children: {
	    'volumeLevel': {},
	    'volumeHandle': {}
	  },
	  'barName': 'volumeLevel',
	  'handleName': 'volumeHandle'
	};
	
	vjs.VolumeBar.prototype.playerEvent = 'volumechange';
	
	vjs.VolumeBar.prototype.createEl = function(){
	  return vjs.Slider.prototype.createEl.call(this, 'div', {
	    className: 'vjs-volume-bar',
	    'aria-label': 'volume level'
	  });
	};
	
	vjs.VolumeBar.prototype.onMouseMove = function(event) {
	  if (this.player_.muted()) {
	    this.player_.muted(false);
	  }
	
	  this.player_.volume(this.calculateDistance(event));
	};
	
	vjs.VolumeBar.prototype.getPercent = function(){
	  if (this.player_.muted()) {
	    return 0;
	  } else {
	    return this.player_.volume();
	  }
	};
	
	vjs.VolumeBar.prototype.stepForward = function(){
	  this.player_.volume(this.player_.volume() + 0.1);
	};
	
	vjs.VolumeBar.prototype.stepBack = function(){
	  this.player_.volume(this.player_.volume() - 0.1);
	};
	
	/**
	 * Shows volume level
	 *
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.VolumeLevel = vjs.Component.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.Component.call(this, player, options);
	  }
	});
	
	vjs.VolumeLevel.prototype.createEl = function(){
	  return vjs.Component.prototype.createEl.call(this, 'div', {
	    className: 'vjs-volume-level',
	    innerHTML: '<span class="vjs-control-text"></span>'
	  });
	};
	
	/**
	 * The volume handle can be dragged to adjust the volume level
	 *
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	 vjs.VolumeHandle = vjs.SliderHandle.extend();
	
	 vjs.VolumeHandle.prototype.defaultValue = '00:00';
	
	 /** @inheritDoc */
	 vjs.VolumeHandle.prototype.createEl = function(){
	   return vjs.SliderHandle.prototype.createEl.call(this, 'div', {
	     className: 'vjs-volume-handle'
	   });
	 };
	/**
	 * A button component for muting the audio
	 *
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.MuteToggle = vjs.Button.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.Button.call(this, player, options);
	
	    this.on(player, 'volumechange', this.update);
	
	    // hide mute toggle if the current tech doesn't support volume control
	    if (player.tech && player.tech['featuresVolumeControl'] === false) {
	      this.addClass('vjs-hidden');
	    }
	
	    this.on(player, 'loadstart', function(){
	      if (player.tech['featuresVolumeControl'] === false) {
	        this.addClass('vjs-hidden');
	      } else {
	        this.removeClass('vjs-hidden');
	      }
	    });
	  }
	});
	
	vjs.MuteToggle.prototype.createEl = function(){
	  return vjs.Button.prototype.createEl.call(this, 'div', {
	    className: 'vjs-mute-control vjs-control',
	    innerHTML: '<div><span class="vjs-control-text">' + this.localize('Mute') + '</span></div>'
	  });
	};
	
	vjs.MuteToggle.prototype.onClick = function(){
	  this.player_.muted( this.player_.muted() ? false : true );
	};
	
	vjs.MuteToggle.prototype.update = function(){
	  var vol = this.player_.volume(),
	      level = 3;
	
	  if (vol === 0 || this.player_.muted()) {
	    level = 0;
	  } else if (vol < 0.33) {
	    level = 1;
	  } else if (vol < 0.67) {
	    level = 2;
	  }
	
	  // Don't rewrite the button text if the actual text doesn't change.
	  // This causes unnecessary and confusing information for screen reader users.
	  // This check is needed because this function gets called every time the volume level is changed.
	  if(this.player_.muted()){
	      if(this.el_.children[0].children[0].innerHTML!=this.localize('Unmute')){
	          this.el_.children[0].children[0].innerHTML = this.localize('Unmute'); // change the button text to "Unmute"
	      }
	  } else {
	      if(this.el_.children[0].children[0].innerHTML!=this.localize('Mute')){
	          this.el_.children[0].children[0].innerHTML = this.localize('Mute'); // change the button text to "Mute"
	      }
	  }
	
	  /* TODO improve muted icon classes */
	  for (var i = 0; i < 4; i++) {
	    vjs.removeClass(this.el_, 'vjs-vol-'+i);
	  }
	  vjs.addClass(this.el_, 'vjs-vol-'+level);
	};
	/**
	 * Menu button with a popup for showing the volume slider.
	 * @constructor
	 */
	vjs.VolumeMenuButton = vjs.MenuButton.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.MenuButton.call(this, player, options);
	
	    // Same listeners as MuteToggle
	    this.on(player, 'volumechange', this.volumeUpdate);
	
	    // hide mute toggle if the current tech doesn't support volume control
	    if (player.tech && player.tech['featuresVolumeControl'] === false) {
	      this.addClass('vjs-hidden');
	    }
	    this.on(player, 'loadstart', function(){
	      if (player.tech['featuresVolumeControl'] === false) {
	        this.addClass('vjs-hidden');
	      } else {
	        this.removeClass('vjs-hidden');
	      }
	    });
	    this.addClass('vjs-menu-button');
	  }
	});
	
	vjs.VolumeMenuButton.prototype.createMenu = function(){
	  var menu = new vjs.Menu(this.player_, {
	    contentElType: 'div'
	  });
	  var vc = new vjs.VolumeBar(this.player_, this.options_['volumeBar']);
	  vc.on('focus', function() {
	    menu.lockShowing();
	  });
	  vc.on('blur', function() {
	    menu.unlockShowing();
	  });
	  menu.addChild(vc);
	  return menu;
	};
	
	vjs.VolumeMenuButton.prototype.onClick = function(){
	  vjs.MuteToggle.prototype.onClick.call(this);
	  vjs.MenuButton.prototype.onClick.call(this);
	};
	
	vjs.VolumeMenuButton.prototype.createEl = function(){
	  return vjs.Button.prototype.createEl.call(this, 'div', {
	    className: 'vjs-volume-menu-button vjs-menu-button vjs-control',
	    innerHTML: '<div><span class="vjs-control-text">' + this.localize('Mute') + '</span></div>'
	  });
	};
	vjs.VolumeMenuButton.prototype.volumeUpdate = vjs.MuteToggle.prototype.update;
	/**
	 * The component for controlling the playback rate
	 *
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.PlaybackRateMenuButton = vjs.MenuButton.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.MenuButton.call(this, player, options);
	
	    this.updateVisibility();
	    this.updateLabel();
	
	    this.on(player, 'loadstart', this.updateVisibility);
	    this.on(player, 'ratechange', this.updateLabel);
	  }
	});
	
	vjs.PlaybackRateMenuButton.prototype.buttonText = 'Playback Rate';
	vjs.PlaybackRateMenuButton.prototype.className = 'vjs-playback-rate';
	
	vjs.PlaybackRateMenuButton.prototype.createEl = function(){
	  var el = vjs.MenuButton.prototype.createEl.call(this);
	
	  this.labelEl_ = vjs.createEl('div', {
	    className: 'vjs-playback-rate-value',
	    innerHTML: 1.0
	  });
	
	  el.appendChild(this.labelEl_);
	
	  return el;
	};
	
	// Menu creation
	vjs.PlaybackRateMenuButton.prototype.createMenu = function(){
	  var menu = new vjs.Menu(this.player());
	  var rates = this.player().options()['playbackRates'];
	
	  if (rates) {
	    for (var i = rates.length - 1; i >= 0; i--) {
	      menu.addChild(
	        new vjs.PlaybackRateMenuItem(this.player(), { 'rate': rates[i] + 'x'})
	        );
	    }
	  }
	
	  return menu;
	};
	
	vjs.PlaybackRateMenuButton.prototype.updateARIAAttributes = function(){
	  // Current playback rate
	  this.el().setAttribute('aria-valuenow', this.player().playbackRate());
	};
	
	vjs.PlaybackRateMenuButton.prototype.onClick = function(){
	  // select next rate option
	  var currentRate = this.player().playbackRate();
	  var rates = this.player().options()['playbackRates'];
	  // this will select first one if the last one currently selected
	  var newRate = rates[0];
	  for (var i = 0; i <rates.length ; i++) {
	    if (rates[i] > currentRate) {
	      newRate = rates[i];
	      break;
	    }
	  }
	  this.player().playbackRate(newRate);
	};
	
	vjs.PlaybackRateMenuButton.prototype.playbackRateSupported = function(){
	  return this.player().tech
	    && this.player().tech['featuresPlaybackRate']
	    && this.player().options()['playbackRates']
	    && this.player().options()['playbackRates'].length > 0
	  ;
	};
	
	/**
	 * Hide playback rate controls when they're no playback rate options to select
	 */
	vjs.PlaybackRateMenuButton.prototype.updateVisibility = function(){
	  if (this.playbackRateSupported()) {
	    this.removeClass('vjs-hidden');
	  } else {
	    this.addClass('vjs-hidden');
	  }
	};
	
	/**
	 * Update button label when rate changed
	 */
	vjs.PlaybackRateMenuButton.prototype.updateLabel = function(){
	  if (this.playbackRateSupported()) {
	    this.labelEl_.innerHTML = this.player().playbackRate() + 'x';
	  }
	};
	
	/**
	 * The specific menu item type for selecting a playback rate
	 *
	 * @constructor
	 */
	vjs.PlaybackRateMenuItem = vjs.MenuItem.extend({
	  contentElType: 'button',
	  /** @constructor */
	  init: function(player, options){
	    var label = this.label = options['rate'];
	    var rate = this.rate = parseFloat(label, 10);
	
	    // Modify options for parent MenuItem class's init.
	    options['label'] = label;
	    options['selected'] = rate === 1;
	    vjs.MenuItem.call(this, player, options);
	
	    this.on(player, 'ratechange', this.update);
	  }
	});
	
	vjs.PlaybackRateMenuItem.prototype.onClick = function(){
	  vjs.MenuItem.prototype.onClick.call(this);
	  this.player().playbackRate(this.rate);
	};
	
	vjs.PlaybackRateMenuItem.prototype.update = function(){
	  this.selected(this.player().playbackRate() == this.rate);
	};
	/* Poster Image
	================================================================================ */
	/**
	 * The component that handles showing the poster image.
	 *
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.PosterImage = vjs.Button.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.Button.call(this, player, options);
	
	    this.update();
	    player.on('posterchange', vjs.bind(this, this.update));
	  }
	});
	
	/**
	 * Clean up the poster image
	 */
	vjs.PosterImage.prototype.dispose = function(){
	  this.player().off('posterchange', this.update);
	  vjs.Button.prototype.dispose.call(this);
	};
	
	/**
	 * Create the poster image element
	 * @return {Element}
	 */
	vjs.PosterImage.prototype.createEl = function(){
	  var el = vjs.createEl('div', {
	    className: 'vjs-poster',
	
	    // Don't want poster to be tabbable.
	    tabIndex: -1
	  });
	
	  // To ensure the poster image resizes while maintaining its original aspect
	  // ratio, use a div with `background-size` when available. For browsers that
	  // do not support `background-size` (e.g. IE8), fall back on using a regular
	  // img element.
	  if (!vjs.BACKGROUND_SIZE_SUPPORTED) {
	    this.fallbackImg_ = vjs.createEl('img');
	    el.appendChild(this.fallbackImg_);
	  }
	
	  return el;
	};
	
	/**
	 * Event handler for updates to the player's poster source
	 */
	vjs.PosterImage.prototype.update = function(){
	  var url = this.player().poster();
	
	  this.setSrc(url);
	
	  // If there's no poster source we should display:none on this component
	  // so it's not still clickable or right-clickable
	  if (url) {
	    this.show();
	  } else {
	    this.hide();
	  }
	};
	
	/**
	 * Set the poster source depending on the display method
	 */
	vjs.PosterImage.prototype.setSrc = function(url){
	  var backgroundImage;
	
	  if (this.fallbackImg_) {
	    this.fallbackImg_.src = url;
	  } else {
	    backgroundImage = '';
	    // Any falsey values should stay as an empty string, otherwise
	    // this will throw an extra error
	    if (url) {
	      backgroundImage = 'url("' + url + '")';
	    }
	
	    this.el_.style.backgroundImage = backgroundImage;
	  }
	};
	
	/**
	 * Event handler for clicks on the poster image
	 */
	vjs.PosterImage.prototype.onClick = function(){
	  // We don't want a click to trigger playback when controls are disabled
	  // but CSS should be hiding the poster to prevent that from happening
	  this.player_.play();
	};
	/* Loading Spinner
	================================================================================ */
	/**
	 * Loading spinner for waiting events
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @class
	 * @constructor
	 */
	vjs.LoadingSpinner = vjs.Component.extend({
	  /** @constructor */
	  init: function(player, options){
	    vjs.Component.call(this, player, options);
	
	    // MOVING DISPLAY HANDLING TO CSS
	
	    // player.on('canplay', vjs.bind(this, this.hide));
	    // player.on('canplaythrough', vjs.bind(this, this.hide));
	    // player.on('playing', vjs.bind(this, this.hide));
	    // player.on('seeking', vjs.bind(this, this.show));
	
	    // in some browsers seeking does not trigger the 'playing' event,
	    // so we also need to trap 'seeked' if we are going to set a
	    // 'seeking' event
	    // player.on('seeked', vjs.bind(this, this.hide));
	
	    // player.on('ended', vjs.bind(this, this.hide));
	
	    // Not showing spinner on stalled any more. Browsers may stall and then not trigger any events that would remove the spinner.
	    // Checked in Chrome 16 and Safari 5.1.2. http://help.videojs.com/discussions/problems/883-why-is-the-download-progress-showing
	    // player.on('stalled', vjs.bind(this, this.show));
	
	    // player.on('waiting', vjs.bind(this, this.show));
	  }
	});
	
	vjs.LoadingSpinner.prototype.createEl = function(){
	  return vjs.Component.prototype.createEl.call(this, 'div', {
	    className: 'vjs-loading-spinner'
	  });
	};
	/* Big Play Button
	================================================================================ */
	/**
	 * Initial play button. Shows before the video has played. The hiding of the
	 * big play button is done via CSS and player states.
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @class
	 * @constructor
	 */
	vjs.BigPlayButton = vjs.Button.extend();
	
	vjs.BigPlayButton.prototype.createEl = function(){
	  return vjs.Button.prototype.createEl.call(this, 'div', {
	    className: 'vjs-big-play-button',
	    innerHTML: '<span aria-hidden="true"></span>',
	    'aria-label': 'play video'
	  });
	};
	
	vjs.BigPlayButton.prototype.onClick = function(){
	  this.player_.play();
	};
	/**
	 * Display that an error has occurred making the video unplayable
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @constructor
	 */
	vjs.ErrorDisplay = vjs.Component.extend({
	  init: function(player, options){
	    vjs.Component.call(this, player, options);
	
	    this.update();
	    this.on(player, 'error', this.update);
	  }
	});
	
	vjs.ErrorDisplay.prototype.createEl = function(){
	  var el = vjs.Component.prototype.createEl.call(this, 'div', {
	    className: 'vjs-error-display'
	  });
	
	  this.contentEl_ = vjs.createEl('div');
	  el.appendChild(this.contentEl_);
	
	  return el;
	};
	
	vjs.ErrorDisplay.prototype.update = function(){
	  if (this.player().error()) {
	    this.contentEl_.innerHTML = this.localize(this.player().error().message);
	  }
	};
	(function() {
	  var createTrackHelper;
	/**
	 * @fileoverview Media Technology Controller - Base class for media playback
	 * technology controllers like Flash and HTML5
	 */
	
	/**
	 * Base class for media (HTML5 Video, Flash) controllers
	 * @param {vjs.Player|Object} player  Central player instance
	 * @param {Object=} options Options object
	 * @constructor
	 */
	vjs.MediaTechController = vjs.Component.extend({
	  /** @constructor */
	  init: function(player, options, ready){
	    options = options || {};
	    // we don't want the tech to report user activity automatically.
	    // This is done manually in addControlsListeners
	    options.reportTouchActivity = false;
	    vjs.Component.call(this, player, options, ready);
	
	    // Manually track progress in cases where the browser/flash player doesn't report it.
	    if (!this['featuresProgressEvents']) {
	      this.manualProgressOn();
	    }
	
	    // Manually track timeupdates in cases where the browser/flash player doesn't report it.
	    if (!this['featuresTimeupdateEvents']) {
	      this.manualTimeUpdatesOn();
	    }
	
	    this.initControlsListeners();
	
	    if (!this['featuresNativeTextTracks']) {
	      this.emulateTextTracks();
	    }
	
	    this.initTextTrackListeners();
	  }
	});
	
	/**
	 * Set up click and touch listeners for the playback element
	 * On desktops, a click on the video itself will toggle playback,
	 * on a mobile device a click on the video toggles controls.
	 * (toggling controls is done by toggling the user state between active and
	 * inactive)
	 *
	 * A tap can signal that a user has become active, or has become inactive
	 * e.g. a quick tap on an iPhone movie should reveal the controls. Another
	 * quick tap should hide them again (signaling the user is in an inactive
	 * viewing state)
	 *
	 * In addition to this, we still want the user to be considered inactive after
	 * a few seconds of inactivity.
	 *
	 * Note: the only part of iOS interaction we can't mimic with this setup
	 * is a touch and hold on the video element counting as activity in order to
	 * keep the controls showing, but that shouldn't be an issue. A touch and hold on
	 * any controls will still keep the user active
	 */
	vjs.MediaTechController.prototype.initControlsListeners = function(){
	  var player, activateControls;
	
	  player = this.player();
	
	  activateControls = function(){
	    if (player.controls() && !player.usingNativeControls()) {
	      this.addControlsListeners();
	    }
	  };
	
	  // Set up event listeners once the tech is ready and has an element to apply
	  // listeners to
	  this.ready(activateControls);
	  this.on(player, 'controlsenabled', activateControls);
	  this.on(player, 'controlsdisabled', this.removeControlsListeners);
	
	  // if we're loading the playback object after it has started loading or playing the
	  // video (often with autoplay on) then the loadstart event has already fired and we
	  // need to fire it manually because many things rely on it.
	  // Long term we might consider how we would do this for other events like 'canplay'
	  // that may also have fired.
	  this.ready(function(){
	    if (this.networkState && this.networkState() > 0) {
	      this.player().trigger('loadstart');
	    }
	  });
	};
	
	vjs.MediaTechController.prototype.addControlsListeners = function(){
	  var userWasActive;
	
	  // Some browsers (Chrome & IE) don't trigger a click on a flash swf, but do
	  // trigger mousedown/up.
	  // http://stackoverflow.com/questions/1444562/javascript-onclick-event-over-flash-object
	  // Any touch events are set to block the mousedown event from happening
	  this.on('mousedown', this.onClick);
	
	  // If the controls were hidden we don't want that to change without a tap event
	  // so we'll check if the controls were already showing before reporting user
	  // activity
	  this.on('touchstart', function(event) {
	    userWasActive = this.player_.userActive();
	  });
	
	  this.on('touchmove', function(event) {
	    if (userWasActive){
	      this.player().reportUserActivity();
	    }
	  });
	
	  this.on('touchend', function(event) {
	    // Stop the mouse events from also happening
	    event.preventDefault();
	  });
	
	  // Turn on component tap events
	  this.emitTapEvents();
	
	  // The tap listener needs to come after the touchend listener because the tap
	  // listener cancels out any reportedUserActivity when setting userActive(false)
	  this.on('tap', this.onTap);
	};
	
	/**
	 * Remove the listeners used for click and tap controls. This is needed for
	 * toggling to controls disabled, where a tap/touch should do nothing.
	 */
	vjs.MediaTechController.prototype.removeControlsListeners = function(){
	  // We don't want to just use `this.off()` because there might be other needed
	  // listeners added by techs that extend this.
	  this.off('tap');
	  this.off('touchstart');
	  this.off('touchmove');
	  this.off('touchleave');
	  this.off('touchcancel');
	  this.off('touchend');
	  this.off('click');
	  this.off('mousedown');
	};
	
	/**
	 * Handle a click on the media element. By default will play/pause the media.
	 */
	vjs.MediaTechController.prototype.onClick = function(event){
	  // We're using mousedown to detect clicks thanks to Flash, but mousedown
	  // will also be triggered with right-clicks, so we need to prevent that
	  if (event.button !== 0) return;
	
	  // When controls are disabled a click should not toggle playback because
	  // the click is considered a control
	  if (this.player().controls()) {
	    if (this.player().paused()) {
	      this.player().play();
	    } else {
	      this.player().pause();
	    }
	  }
	};
	
	/**
	 * Handle a tap on the media element. By default it will toggle the user
	 * activity state, which hides and shows the controls.
	 */
	vjs.MediaTechController.prototype.onTap = function(){
	  this.player().userActive(!this.player().userActive());
	};
	
	/* Fallbacks for unsupported event types
	================================================================================ */
	// Manually trigger progress events based on changes to the buffered amount
	// Many flash players and older HTML5 browsers don't send progress or progress-like events
	vjs.MediaTechController.prototype.manualProgressOn = function(){
	  this.manualProgress = true;
	
	  // Trigger progress watching when a source begins loading
	  this.trackProgress();
	};
	
	vjs.MediaTechController.prototype.manualProgressOff = function(){
	  this.manualProgress = false;
	  this.stopTrackingProgress();
	};
	
	vjs.MediaTechController.prototype.trackProgress = function(){
	  this.progressInterval = this.setInterval(function(){
	    // Don't trigger unless buffered amount is greater than last time
	
	    var bufferedPercent = this.player().bufferedPercent();
	
	    if (this.bufferedPercent_ != bufferedPercent) {
	      this.player().trigger('progress');
	    }
	
	    this.bufferedPercent_ = bufferedPercent;
	
	    if (bufferedPercent === 1) {
	      this.stopTrackingProgress();
	    }
	  }, 500);
	};
	vjs.MediaTechController.prototype.stopTrackingProgress = function(){ this.clearInterval(this.progressInterval); };
	
	/*! Time Tracking -------------------------------------------------------------- */
	vjs.MediaTechController.prototype.manualTimeUpdatesOn = function(){
	  var player = this.player_;
	
	  this.manualTimeUpdates = true;
	
	  this.on(player, 'play', this.trackCurrentTime);
	  this.on(player, 'pause', this.stopTrackingCurrentTime);
	  // timeupdate is also called by .currentTime whenever current time is set
	
	  // Watch for native timeupdate event
	  this.one('timeupdate', function(){
	    // Update known progress support for this playback technology
	    this['featuresTimeupdateEvents'] = true;
	    // Turn off manual progress tracking
	    this.manualTimeUpdatesOff();
	  });
	};
	
	vjs.MediaTechController.prototype.manualTimeUpdatesOff = function(){
	  var player = this.player_;
	
	  this.manualTimeUpdates = false;
	  this.stopTrackingCurrentTime();
	  this.off(player, 'play', this.trackCurrentTime);
	  this.off(player, 'pause', this.stopTrackingCurrentTime);
	};
	
	vjs.MediaTechController.prototype.trackCurrentTime = function(){
	  if (this.currentTimeInterval) { this.stopTrackingCurrentTime(); }
	  this.currentTimeInterval = this.setInterval(function(){
	    this.player().trigger('timeupdate');
	  }, 250); // 42 = 24 fps // 250 is what Webkit uses // FF uses 15
	};
	
	// Turn off play progress tracking (when paused or dragging)
	vjs.MediaTechController.prototype.stopTrackingCurrentTime = function(){
	  this.clearInterval(this.currentTimeInterval);
	
	  // #1002 - if the video ends right before the next timeupdate would happen,
	  // the progress bar won't make it all the way to the end
	  this.player().trigger('timeupdate');
	};
	
	vjs.MediaTechController.prototype.dispose = function() {
	  // Turn off any manual progress or timeupdate tracking
	  if (this.manualProgress) { this.manualProgressOff(); }
	
	  if (this.manualTimeUpdates) { this.manualTimeUpdatesOff(); }
	
	  vjs.Component.prototype.dispose.call(this);
	};
	
	vjs.MediaTechController.prototype.setCurrentTime = function() {
	  // improve the accuracy of manual timeupdates
	  if (this.manualTimeUpdates) { this.player().trigger('timeupdate'); }
	};
	
	// TODO: Consider looking at moving this into the text track display directly
	// https://github.com/videojs/video.js/issues/1863
	vjs.MediaTechController.prototype.initTextTrackListeners = function() {
	  var player = this.player_,
	      tracks,
	      textTrackListChanges = function() {
	        var textTrackDisplay = player.getChild('textTrackDisplay'),
	            controlBar;
	
	        if (textTrackDisplay) {
	          textTrackDisplay.updateDisplay();
	        }
	      };
	
	  tracks = this.textTracks();
	
	  if (!tracks) {
	    return;
	  }
	
	  tracks.addEventListener('removetrack', textTrackListChanges);
	  tracks.addEventListener('addtrack', textTrackListChanges);
	
	  this.on('dispose', vjs.bind(this, function() {
	    tracks.removeEventListener('removetrack', textTrackListChanges);
	    tracks.removeEventListener('addtrack', textTrackListChanges);
	  }));
	};
	
	vjs.MediaTechController.prototype.emulateTextTracks = function() {
	  var player = this.player_,
	      textTracksChanges,
	      tracks,
	      script;
	
	  if (!window['WebVTT']) {
	    script = document.createElement('script');
	    script.src = player.options()['vtt.js'] || '../node_modules/vtt.js/dist/vtt.js';
	    player.el().appendChild(script);
	    window['WebVTT'] = true;
	  }
	
	  tracks = this.textTracks();
	  if (!tracks) {
	    return;
	  }
	
	  textTracksChanges = function() {
	    var i, track, textTrackDisplay;
	
	    textTrackDisplay = player.getChild('textTrackDisplay'),
	
	    textTrackDisplay.updateDisplay();
	
	    for (i = 0; i < this.length; i++) {
	      track = this[i];
	      track.removeEventListener('cuechange', vjs.bind(textTrackDisplay, textTrackDisplay.updateDisplay));
	      if (track.mode === 'showing') {
	        track.addEventListener('cuechange', vjs.bind(textTrackDisplay, textTrackDisplay.updateDisplay));
	      }
	    }
	  };
	
	  tracks.addEventListener('change', textTracksChanges);
	
	  this.on('dispose', vjs.bind(this, function() {
	    tracks.removeEventListener('change', textTracksChanges);
	  }));
	};
	
	/**
	 * Provide default methods for text tracks.
	 *
	 * Html5 tech overrides these.
	 */
	
	/**
	 * List of associated text tracks
	 * @type {Array}
	 * @private
	 */
	vjs.MediaTechController.prototype.textTracks_;
	
	vjs.MediaTechController.prototype.textTracks = function() {
	  this.player_.textTracks_ = this.player_.textTracks_ || new vjs.TextTrackList();
	  return this.player_.textTracks_;
	};
	
	vjs.MediaTechController.prototype.remoteTextTracks = function() {
	  this.player_.remoteTextTracks_ = this.player_.remoteTextTracks_ || new vjs.TextTrackList();
	  return this.player_.remoteTextTracks_;
	};
	
	createTrackHelper = function(self, kind, label, language, options) {
	  var tracks = self.textTracks(),
	      track;
	
	  options = options || {};
	
	  options['kind'] = kind;
	  if (label) {
	    options['label'] = label;
	  }
	  if (language) {
	    options['language'] = language;
	  }
	  options['player'] = self.player_;
	
	  track = new vjs.TextTrack(options);
	  tracks.addTrack_(track);
	
	  return track;
	};
	
	vjs.MediaTechController.prototype.addTextTrack = function(kind, label, language) {
	  if (!kind) {
	    throw new Error('TextTrack kind is required but was not provided');
	  }
	
	  return createTrackHelper(this, kind, label, language);
	};
	
	vjs.MediaTechController.prototype.addRemoteTextTrack = function(options) {
	  var track = createTrackHelper(this, options['kind'], options['label'], options['language'], options);
	  this.remoteTextTracks().addTrack_(track);
	  return {
	    track: track
	  };
	};
	
	vjs.MediaTechController.prototype.removeRemoteTextTrack = function(track) {
	  this.textTracks().removeTrack_(track);
	  this.remoteTextTracks().removeTrack_(track);
	};
	
	/**
	 * Provide a default setPoster method for techs
	 *
	 * Poster support for techs should be optional, so we don't want techs to
	 * break if they don't have a way to set a poster.
	 */
	vjs.MediaTechController.prototype.setPoster = function(){};
	
	vjs.MediaTechController.prototype['featuresVolumeControl'] = true;
	
	// Resizing plugins using request fullscreen reloads the plugin
	vjs.MediaTechController.prototype['featuresFullscreenResize'] = false;
	vjs.MediaTechController.prototype['featuresPlaybackRate'] = false;
	
	// Optional events that we can manually mimic with timers
	// currently not triggered by video-js-swf
	vjs.MediaTechController.prototype['featuresProgressEvents'] = false;
	vjs.MediaTechController.prototype['featuresTimeupdateEvents'] = false;
	
	vjs.MediaTechController.prototype['featuresNativeTextTracks'] = false;
	
	/**
	 * A functional mixin for techs that want to use the Source Handler pattern.
	 *
	 * ##### EXAMPLE:
	 *
	 *   videojs.MediaTechController.withSourceHandlers.call(MyTech);
	 *
	 */
	vjs.MediaTechController.withSourceHandlers = function(Tech){
	  /**
	   * Register a source handler
	   * Source handlers are scripts for handling specific formats.
	   * The source handler pattern is used for adaptive formats (HLS, DASH) that
	   * manually load video data and feed it into a Source Buffer (Media Source Extensions)
	   * @param  {Function} handler  The source handler
	   * @param  {Boolean}  first    Register it before any existing handlers
	   */
	  Tech['registerSourceHandler'] = function(handler, index){
	    var handlers = Tech.sourceHandlers;
	
	    if (!handlers) {
	      handlers = Tech.sourceHandlers = [];
	    }
	
	    if (index === undefined) {
	      // add to the end of the list
	      index = handlers.length;
	    }
	
	    handlers.splice(index, 0, handler);
	  };
	
	  /**
	   * Return the first source handler that supports the source
	   * TODO: Answer question: should 'probably' be prioritized over 'maybe'
	   * @param  {Object} source The source object
	   * @returns {Object}       The first source handler that supports the source
	   * @returns {null}         Null if no source handler is found
	   */
	  Tech.selectSourceHandler = function(source){
	    var handlers = Tech.sourceHandlers || [],
	        can;
	
	    for (var i = 0; i < handlers.length; i++) {
	      can = handlers[i]['canHandleSource'](source);
	
	      if (can) {
	        return handlers[i];
	      }
	    }
	
	    return null;
	  };
	
	  /**
	  * Check if the tech can support the given source
	  * @param  {Object} srcObj  The source object
	  * @return {String}         'probably', 'maybe', or '' (empty string)
	  */
	  Tech.canPlaySource = function(srcObj){
	    var sh = Tech.selectSourceHandler(srcObj);
	
	    if (sh) {
	      return sh['canHandleSource'](srcObj);
	    }
	
	    return '';
	  };
	
	  /**
	   * Create a function for setting the source using a source object
	   * and source handlers.
	   * Should never be called unless a source handler was found.
	   * @param {Object} source  A source object with src and type keys
	   * @return {vjs.MediaTechController} self
	   */
	  Tech.prototype.setSource = function(source){
	    var sh = Tech.selectSourceHandler(source);
	
	    if (!sh) {
	      // Fall back to a native source hander when unsupported sources are
	      // deliberately set
	      if (Tech['nativeSourceHandler']) {
	        sh = Tech['nativeSourceHandler'];
	      } else {
	        vjs.log.error('No source hander found for the current source.');
	      }
	    }
	
	    // Dispose any existing source handler
	    this.disposeSourceHandler();
	    this.off('dispose', this.disposeSourceHandler);
	
	    this.currentSource_ = source;
	    this.sourceHandler_ = sh['handleSource'](source, this);
	    this.on('dispose', this.disposeSourceHandler);
	
	    return this;
	  };
	
	  /**
	   * Clean up any existing source handler
	   */
	  Tech.prototype.disposeSourceHandler = function(){
	    if (this.sourceHandler_ && this.sourceHandler_['dispose']) {
	      this.sourceHandler_['dispose']();
	    }
	  };
	
	};
	
	vjs.media = {};
	
	})();
	/**
	 * @fileoverview HTML5 Media Controller - Wrapper for HTML5 Media API
	 */
	
	/**
	 * HTML5 Media Controller - Wrapper for HTML5 Media API
	 * @param {vjs.Player|Object} player
	 * @param {Object=} options
	 * @param {Function=} ready
	 * @constructor
	 */
	vjs.Html5 = vjs.MediaTechController.extend({
	  /** @constructor */
	  init: function(player, options, ready){
	    var  nodes, nodesLength, i, node, nodeName, removeNodes;
	
	    if (options['nativeCaptions'] === false || options['nativeTextTracks'] === false) {
	      this['featuresNativeTextTracks'] = false;
	    }
	
	    vjs.MediaTechController.call(this, player, options, ready);
	
	    this.setupTriggers();
	
	    var source = options['source'];
	
	    // Set the source if one is provided
	    // 1) Check if the source is new (if not, we want to keep the original so playback isn't interrupted)
	    // 2) Check to see if the network state of the tag was failed at init, and if so, reset the source
	    // anyway so the error gets fired.
	    if (source && (this.el_.currentSrc !== source.src || (player.tag && player.tag.initNetworkState_ === 3))) {
	      this.setSource(source);
	    }
	
	    if (this.el_.hasChildNodes()) {
	
	      nodes = this.el_.childNodes;
	      nodesLength = nodes.length;
	      removeNodes = [];
	
	      while (nodesLength--) {
	        node = nodes[nodesLength];
	        nodeName = node.nodeName.toLowerCase();
	        if (nodeName === 'track') {
	          if (!this['featuresNativeTextTracks']) {
	            // Empty video tag tracks so the built-in player doesn't use them also.
	            // This may not be fast enough to stop HTML5 browsers from reading the tags
	            // so we'll need to turn off any default tracks if we're manually doing
	            // captions and subtitles. videoElement.textTracks
	            removeNodes.push(node);
	          } else {
	            this.remoteTextTracks().addTrack_(node['track']);
	          }
	        }
	      }
	
	      for (i=0; i<removeNodes.length; i++) {
	        this.el_.removeChild(removeNodes[i]);
	      }
	    }
	
	    // Determine if native controls should be used
	    // Our goal should be to get the custom controls on mobile solid everywhere
	    // so we can remove this all together. Right now this will block custom
	    // controls on touch enabled laptops like the Chrome Pixel
	    if (vjs.TOUCH_ENABLED && player.options()['nativeControlsForTouch'] === true) {
	      this.useNativeControls();
	    }
	
	    // Chrome and Safari both have issues with autoplay.
	    // In Safari (5.1.1), when we move the video element into the container div, autoplay doesn't work.
	    // In Chrome (15), if you have autoplay + a poster + no controls, the video gets hidden (but audio plays)
	    // This fixes both issues. Need to wait for API, so it updates displays correctly
	    player.ready(function(){
	      if (this.src() && this.tag && this.options_['autoplay'] && this.paused()) {
	        delete this.tag['poster']; // Chrome Fix. Fixed in Chrome v16.
	        this.play();
	      }
	    });
	
	    this.triggerReady();
	  }
	});
	
	vjs.Html5.prototype.dispose = function(){
	  vjs.Html5.disposeMediaElement(this.el_);
	  vjs.MediaTechController.prototype.dispose.call(this);
	};
	
	vjs.Html5.prototype.createEl = function(){
	  var player = this.player_,
	      track,
	      trackEl,
	      i,
	      // If possible, reuse original tag for HTML5 playback technology element
	      el = player.tag,
	      attributes,
	      newEl,
	      clone;
	
	  // Check if this browser supports moving the element into the box.
	  // On the iPhone video will break if you move the element,
	  // So we have to create a brand new element.
	  if (!el || this['movingMediaElementInDOM'] === false) {
	
	    // If the original tag is still there, clone and remove it.
	    if (el) {
	      clone = el.cloneNode(false);
	      vjs.Html5.disposeMediaElement(el);
	      el = clone;
	      player.tag = null;
	    } else {
	      el = vjs.createEl('video');
	
	      // determine if native controls should be used
	      attributes = videojs.util.mergeOptions({}, player.tagAttributes);
	      if (!vjs.TOUCH_ENABLED || player.options()['nativeControlsForTouch'] !== true) {
	        delete attributes.controls;
	      }
	
	      vjs.setElementAttributes(el,
	        vjs.obj.merge(attributes, {
	          id:player.id() + '_html5_api',
	          'class':'vjs-tech'
	        })
	      );
	    }
	    // associate the player with the new tag
	    el['player'] = player;
	
	    if (player.options_.tracks) {
	      for (i = 0; i < player.options_.tracks.length; i++) {
	        track = player.options_.tracks[i];
	        trackEl = document.createElement('track');
	        trackEl.kind = track.kind;
	        trackEl.label = track.label;
	        trackEl.srclang = track.srclang;
	        trackEl.src = track.src;
	        if ('default' in track) {
	          trackEl.setAttribute('default', 'default');
	        }
	        el.appendChild(trackEl);
	      }
	    }
	
	    vjs.insertFirst(el, player.el());
	  }
	
	  // Update specific tag settings, in case they were overridden
	  var settingsAttrs = ['autoplay','preload','loop','muted'];
	  for (i = settingsAttrs.length - 1; i >= 0; i--) {
	    var attr = settingsAttrs[i];
	    var overwriteAttrs = {};
	    if (typeof player.options_[attr] !== 'undefined') {
	      overwriteAttrs[attr] = player.options_[attr];
	    }
	    vjs.setElementAttributes(el, overwriteAttrs);
	  }
	
	  return el;
	  // jenniisawesome = true;
	};
	
	// Make video events trigger player events
	// May seem verbose here, but makes other APIs possible.
	// Triggers removed using this.off when disposed
	vjs.Html5.prototype.setupTriggers = function(){
	  for (var i = vjs.Html5.Events.length - 1; i >= 0; i--) {
	    this.on(vjs.Html5.Events[i], this.eventHandler);
	  }
	};
	
	vjs.Html5.prototype.eventHandler = function(evt){
	  // In the case of an error on the video element, set the error prop
	  // on the player and let the player handle triggering the event. On
	  // some platforms, error events fire that do not cause the error
	  // property on the video element to be set. See #1465 for an example.
	  if (evt.type == 'error' && this.error()) {
	    this.player().error(this.error().code);
	
	  // in some cases we pass the event directly to the player
	  } else {
	    // No need for media events to bubble up.
	    evt.bubbles = false;
	
	    this.player().trigger(evt);
	  }
	};
	
	vjs.Html5.prototype.useNativeControls = function(){
	  var tech, player, controlsOn, controlsOff, cleanUp;
	
	  tech = this;
	  player = this.player();
	
	  // If the player controls are enabled turn on the native controls
	  tech.setControls(player.controls());
	
	  // Update the native controls when player controls state is updated
	  controlsOn = function(){
	    tech.setControls(true);
	  };
	  controlsOff = function(){
	    tech.setControls(false);
	  };
	  player.on('controlsenabled', controlsOn);
	  player.on('controlsdisabled', controlsOff);
	
	  // Clean up when not using native controls anymore
	  cleanUp = function(){
	    player.off('controlsenabled', controlsOn);
	    player.off('controlsdisabled', controlsOff);
	  };
	  tech.on('dispose', cleanUp);
	  player.on('usingcustomcontrols', cleanUp);
	
	  // Update the state of the player to using native controls
	  player.usingNativeControls(true);
	};
	
	
	vjs.Html5.prototype.play = function(){ this.el_.play(); };
	vjs.Html5.prototype.pause = function(){ this.el_.pause(); };
	vjs.Html5.prototype.paused = function(){ return this.el_.paused; };
	
	vjs.Html5.prototype.currentTime = function(){ return this.el_.currentTime; };
	vjs.Html5.prototype.setCurrentTime = function(seconds){
	  try {
	    this.el_.currentTime = seconds;
	  } catch(e) {
	    vjs.log(e, 'Video is not ready. (Video.js)');
	    // this.warning(VideoJS.warnings.videoNotReady);
	  }
	};
	
	vjs.Html5.prototype.duration = function(){ return this.el_.duration || 0; };
	vjs.Html5.prototype.buffered = function(){ return this.el_.buffered; };
	
	vjs.Html5.prototype.volume = function(){ return this.el_.volume; };
	vjs.Html5.prototype.setVolume = function(percentAsDecimal){ this.el_.volume = percentAsDecimal; };
	vjs.Html5.prototype.muted = function(){ return this.el_.muted; };
	vjs.Html5.prototype.setMuted = function(muted){ this.el_.muted = muted; };
	
	vjs.Html5.prototype.width = function(){ return this.el_.offsetWidth; };
	vjs.Html5.prototype.height = function(){ return this.el_.offsetHeight; };
	
	vjs.Html5.prototype.supportsFullScreen = function(){
	  if (typeof this.el_.webkitEnterFullScreen == 'function') {
	
	    // Seems to be broken in Chromium/Chrome && Safari in Leopard
	    if (/Android/.test(vjs.USER_AGENT) || !/Chrome|Mac OS X 10.5/.test(vjs.USER_AGENT)) {
	      return true;
	    }
	  }
	  return false;
	};
	
	vjs.Html5.prototype.enterFullScreen = function(){
	  var video = this.el_;
	
	  if ('webkitDisplayingFullscreen' in video) {
	    this.one('webkitbeginfullscreen', function() {
	      this.player_.isFullscreen(true);
	
	      this.one('webkitendfullscreen', function() {
	        this.player_.isFullscreen(false);
	        this.player_.trigger('fullscreenchange');
	      });
	
	      this.player_.trigger('fullscreenchange');
	    });
	  }
	
	  if (video.paused && video.networkState <= video.HAVE_METADATA) {
	    // attempt to prime the video element for programmatic access
	    // this isn't necessary on the desktop but shouldn't hurt
	    this.el_.play();
	
	    // playing and pausing synchronously during the transition to fullscreen
	    // can get iOS ~6.1 devices into a play/pause loop
	    this.setTimeout(function(){
	      video.pause();
	      video.webkitEnterFullScreen();
	    }, 0);
	  } else {
	    video.webkitEnterFullScreen();
	  }
	};
	
	vjs.Html5.prototype.exitFullScreen = function(){
	  this.el_.webkitExitFullScreen();
	};
	
	// Checks to see if the element's reported URI (either from `el_.src`
	// or `el_.currentSrc`) is a blob-uri and, if so, returns the uri that
	// was passed into the source-handler when it was first invoked instead
	// of the blob-uri
	vjs.Html5.prototype.returnOriginalIfBlobURI_ = function (elementURI, originalURI) {
	  var blobURIRegExp = /^blob\:/i;
	
	  // If originalURI is undefined then we are probably in a non-source-handler-enabled
	  // tech that inherits from the Html5 tech so we should just return the elementURI
	  // regardless of it's blobby-ness
	  if (originalURI && elementURI && blobURIRegExp.test(elementURI)) {
	    return originalURI;
	  }
	  return elementURI;
	};
	
	vjs.Html5.prototype.src = function(src) {
	  var elementSrc = this.el_.src;
	
	  if (src === undefined) {
	    return this.returnOriginalIfBlobURI_(elementSrc, this.source_);
	  } else {
	    // Setting src through `src` instead of `setSrc` will be deprecated
	    this.setSrc(src);
	  }
	};
	
	vjs.Html5.prototype.setSrc = function(src) {
	  this.el_.src = src;
	};
	
	vjs.Html5.prototype.load = function(){ this.el_.load(); };
	vjs.Html5.prototype.currentSrc = function(){
	  var elementSrc = this.el_.currentSrc;
	
	  if (!this.currentSource_) {
	    return elementSrc;
	  }
	
	  return this.returnOriginalIfBlobURI_(elementSrc, this.currentSource_.src);
	};
	
	vjs.Html5.prototype.poster = function(){ return this.el_.poster; };
	vjs.Html5.prototype.setPoster = function(val){ this.el_.poster = val; };
	
	vjs.Html5.prototype.preload = function(){ return this.el_.preload; };
	vjs.Html5.prototype.setPreload = function(val){ this.el_.preload = val; };
	
	vjs.Html5.prototype.autoplay = function(){ return this.el_.autoplay; };
	vjs.Html5.prototype.setAutoplay = function(val){ this.el_.autoplay = val; };
	
	vjs.Html5.prototype.controls = function(){ return this.el_.controls; };
	vjs.Html5.prototype.setControls = function(val){ this.el_.controls = !!val; };
	
	vjs.Html5.prototype.loop = function(){ return this.el_.loop; };
	vjs.Html5.prototype.setLoop = function(val){ this.el_.loop = val; };
	
	vjs.Html5.prototype.error = function(){ return this.el_.error; };
	vjs.Html5.prototype.seeking = function(){ return this.el_.seeking; };
	vjs.Html5.prototype.seekable = function(){ return this.el_.seekable; };
	vjs.Html5.prototype.ended = function(){ return this.el_.ended; };
	vjs.Html5.prototype.defaultMuted = function(){ return this.el_.defaultMuted; };
	
	vjs.Html5.prototype.playbackRate = function(){ return this.el_.playbackRate; };
	vjs.Html5.prototype.setPlaybackRate = function(val){ this.el_.playbackRate = val; };
	
	vjs.Html5.prototype.networkState = function(){ return this.el_.networkState; };
	vjs.Html5.prototype.readyState = function(){ return this.el_.readyState; };
	
	vjs.Html5.prototype.textTracks = function() {
	  if (!this['featuresNativeTextTracks']) {
	    return vjs.MediaTechController.prototype.textTracks.call(this);
	  }
	
	  return this.el_.textTracks;
	};
	vjs.Html5.prototype.addTextTrack = function(kind, label, language) {
	  if (!this['featuresNativeTextTracks']) {
	    return vjs.MediaTechController.prototype.addTextTrack.call(this, kind, label, language);
	  }
	
	  return this.el_.addTextTrack(kind, label, language);
	};
	
	vjs.Html5.prototype.addRemoteTextTrack = function(options) {
	  if (!this['featuresNativeTextTracks']) {
	    return vjs.MediaTechController.prototype.addRemoteTextTrack.call(this, options);
	  }
	
	  var track = document.createElement('track');
	  options = options || {};
	
	  if (options['kind']) {
	    track['kind'] = options['kind'];
	  }
	  if (options['label']) {
	    track['label'] = options['label'];
	  }
	  if (options['language'] || options['srclang']) {
	    track['srclang'] = options['language'] || options['srclang'];
	  }
	  if (options['default']) {
	    track['default'] = options['default'];
	  }
	  if (options['id']) {
	    track['id'] = options['id'];
	  }
	  if (options['src']) {
	    track['src'] = options['src'];
	  }
	
	  this.el().appendChild(track);
	  this.remoteTextTracks().addTrack_(track.track);
	
	  return track;
	};
	
	vjs.Html5.prototype.removeRemoteTextTrack = function(track) {
	  if (!this['featuresNativeTextTracks']) {
	    return vjs.MediaTechController.prototype.removeRemoteTextTrack.call(this, track);
	  }
	
	  var tracks, i;
	
	  this.remoteTextTracks().removeTrack_(track);
	
	  tracks = this.el()['querySelectorAll']('track');
	
	  for (i = 0; i < tracks.length; i++) {
	    if (tracks[i] === track || tracks[i]['track'] === track) {
	      tracks[i]['parentNode']['removeChild'](tracks[i]);
	      break;
	    }
	  }
	};
	
	/* HTML5 Support Testing ---------------------------------------------------- */
	
	/**
	 * Check if HTML5 video is supported by this browser/device
	 * @return {Boolean}
	 */
	vjs.Html5.isSupported = function(){
	  // IE9 with no Media Player is a LIAR! (#984)
	  try {
	    vjs.TEST_VID['volume'] = 0.5;
	  } catch (e) {
	    return false;
	  }
	
	  return !!vjs.TEST_VID.canPlayType;
	};
	
	// Add Source Handler pattern functions to this tech
	vjs.MediaTechController.withSourceHandlers(vjs.Html5);
	
	/*
	 * Override the withSourceHandler mixin's methods with our own because
	 * the HTML5 Media Element returns blob urls when utilizing MSE and we
	 * want to still return proper source urls even when in that case
	 */
	(function(){
	  var
	    origSetSource = vjs.Html5.prototype.setSource,
	    origDisposeSourceHandler = vjs.Html5.prototype.disposeSourceHandler;
	
	  vjs.Html5.prototype.setSource = function (source) {
	    var retVal = origSetSource.call(this, source);
	    this.source_ = source.src;
	    return retVal;
	  };
	
	  vjs.Html5.prototype.disposeSourceHandler = function () {
	    this.source_ = undefined;
	    return origDisposeSourceHandler.call(this);
	  };
	})();
	
	/**
	 * The default native source handler.
	 * This simply passes the source to the video element. Nothing fancy.
	 * @param  {Object} source   The source object
	 * @param  {vjs.Html5} tech  The instance of the HTML5 tech
	 */
	vjs.Html5['nativeSourceHandler'] = {};
	
	/**
	 * Check if the video element can handle the source natively
	 * @param  {Object} source  The source object
	 * @return {String}         'probably', 'maybe', or '' (empty string)
	 */
	vjs.Html5['nativeSourceHandler']['canHandleSource'] = function(source){
	  var match, ext;
	
	  function canPlayType(type){
	    // IE9 on Windows 7 without MediaPlayer throws an error here
	    // https://github.com/videojs/video.js/issues/519
	    try {
	      return vjs.TEST_VID.canPlayType(type);
	    } catch(e) {
	      return '';
	    }
	  }
	
	  // If a type was provided we should rely on that
	  if (source.type) {
	    return canPlayType(source.type);
	  } else if (source.src) {
	    // If no type, fall back to checking 'video/[EXTENSION]'
	    match = source.src.match(/\.([^.\/\?]+)(\?[^\/]+)?$/i);
	    ext = match && match[1];
	
	    return canPlayType('video/'+ext);
	  }
	
	  return '';
	};
	
	/**
	 * Pass the source to the video element
	 * Adaptive source handlers will have more complicated workflows before passing
	 * video data to the video element
	 * @param  {Object} source    The source object
	 * @param  {vjs.Html5} tech   The instance of the Html5 tech
	 */
	vjs.Html5['nativeSourceHandler']['handleSource'] = function(source, tech){
	  tech.setSrc(source.src);
	};
	
	/**
	 * Clean up the source handler when disposing the player or switching sources..
	 * (no cleanup is needed when supporting the format natively)
	 */
	vjs.Html5['nativeSourceHandler']['dispose'] = function(){};
	
	// Register the native source handler
	vjs.Html5['registerSourceHandler'](vjs.Html5['nativeSourceHandler']);
	
	/**
	 * Check if the volume can be changed in this browser/device.
	 * Volume cannot be changed in a lot of mobile devices.
	 * Specifically, it can't be changed from 1 on iOS.
	 * @return {Boolean}
	 */
	vjs.Html5.canControlVolume = function(){
	  var volume =  vjs.TEST_VID.volume;
	  vjs.TEST_VID.volume = (volume / 2) + 0.1;
	  return volume !== vjs.TEST_VID.volume;
	};
	
	/**
	 * Check if playbackRate is supported in this browser/device.
	 * @return {[type]} [description]
	 */
	vjs.Html5.canControlPlaybackRate = function(){
	  var playbackRate =  vjs.TEST_VID.playbackRate;
	  vjs.TEST_VID.playbackRate = (playbackRate / 2) + 0.1;
	  return playbackRate !== vjs.TEST_VID.playbackRate;
	};
	
	/**
	 * Check to see if native text tracks are supported by this browser/device
	 * @return {Boolean}
	 */
	vjs.Html5.supportsNativeTextTracks = function() {
	  var supportsTextTracks;
	
	  // Figure out native text track support
	  // If mode is a number, we cannot change it because it'll disappear from view.
	  // Browsers with numeric modes include IE10 and older (<=2013) samsung android models.
	  // Firefox isn't playing nice either with modifying the mode
	  // TODO: Investigate firefox: https://github.com/videojs/video.js/issues/1862
	  supportsTextTracks = !!vjs.TEST_VID.textTracks;
	  if (supportsTextTracks && vjs.TEST_VID.textTracks.length > 0) {
	    supportsTextTracks = typeof vjs.TEST_VID.textTracks[0]['mode'] !== 'number';
	  }
	  if (supportsTextTracks && vjs.IS_FIREFOX) {
	    supportsTextTracks = false;
	  }
	
	  return supportsTextTracks;
	};
	
	/**
	 * Set the tech's volume control support status
	 * @type {Boolean}
	 */
	vjs.Html5.prototype['featuresVolumeControl'] = vjs.Html5.canControlVolume();
	
	/**
	 * Set the tech's playbackRate support status
	 * @type {Boolean}
	 */
	vjs.Html5.prototype['featuresPlaybackRate'] = vjs.Html5.canControlPlaybackRate();
	
	/**
	 * Set the tech's status on moving the video element.
	 * In iOS, if you move a video element in the DOM, it breaks video playback.
	 * @type {Boolean}
	 */
	vjs.Html5.prototype['movingMediaElementInDOM'] = !vjs.IS_IOS;
	
	/**
	 * Set the the tech's fullscreen resize support status.
	 * HTML video is able to automatically resize when going to fullscreen.
	 * (No longer appears to be used. Can probably be removed.)
	 */
	vjs.Html5.prototype['featuresFullscreenResize'] = true;
	
	/**
	 * Set the tech's progress event support status
	 * (this disables the manual progress events of the MediaTechController)
	 */
	vjs.Html5.prototype['featuresProgressEvents'] = true;
	
	/**
	 * Sets the tech's status on native text track support
	 * @type {Boolean}
	 */
	vjs.Html5.prototype['featuresNativeTextTracks'] = vjs.Html5.supportsNativeTextTracks();
	
	// HTML5 Feature detection and Device Fixes --------------------------------- //
	(function() {
	  var canPlayType,
	      mpegurlRE = /^application\/(?:x-|vnd\.apple\.)mpegurl/i,
	      mp4RE = /^video\/mp4/i;
	
	  vjs.Html5.patchCanPlayType = function() {
	    // Android 4.0 and above can play HLS to some extent but it reports being unable to do so
	    if (vjs.ANDROID_VERSION >= 4.0) {
	      if (!canPlayType) {
	        canPlayType = vjs.TEST_VID.constructor.prototype.canPlayType;
	      }
	
	      vjs.TEST_VID.constructor.prototype.canPlayType = function(type) {
	        if (type && mpegurlRE.test(type)) {
	          return 'maybe';
	        }
	        return canPlayType.call(this, type);
	      };
	    }
	
	    // Override Android 2.2 and less canPlayType method which is broken
	    if (vjs.IS_OLD_ANDROID) {
	      if (!canPlayType) {
	        canPlayType = vjs.TEST_VID.constructor.prototype.canPlayType;
	      }
	
	      vjs.TEST_VID.constructor.prototype.canPlayType = function(type){
	        if (type && mp4RE.test(type)) {
	          return 'maybe';
	        }
	        return canPlayType.call(this, type);
	      };
	    }
	  };
	
	  vjs.Html5.unpatchCanPlayType = function() {
	    var r = vjs.TEST_VID.constructor.prototype.canPlayType;
	    vjs.TEST_VID.constructor.prototype.canPlayType = canPlayType;
	    canPlayType = null;
	    return r;
	  };
	
	  // by default, patch the video element
	  vjs.Html5.patchCanPlayType();
	})();
	
	// List of all HTML5 events (various uses).
	vjs.Html5.Events = 'loadstart,suspend,abort,error,emptied,stalled,loadedmetadata,loadeddata,canplay,canplaythrough,playing,waiting,seeking,seeked,ended,durationchange,timeupdate,progress,play,pause,ratechange,volumechange'.split(',');
	
	vjs.Html5.disposeMediaElement = function(el){
	  if (!el) { return; }
	
	  el['player'] = null;
	
	  if (el.parentNode) {
	    el.parentNode.removeChild(el);
	  }
	
	  // remove any child track or source nodes to prevent their loading
	  while(el.hasChildNodes()) {
	    el.removeChild(el.firstChild);
	  }
	
	  // remove any src reference. not setting `src=''` because that causes a warning
	  // in firefox
	  el.removeAttribute('src');
	
	  // force the media element to update its loading state by calling load()
	  // however IE on Windows 7N has a bug that throws an error so need a try/catch (#793)
	  if (typeof el.load === 'function') {
	    // wrapping in an iife so it's not deoptimized (#1060#discussion_r10324473)
	    (function() {
	      try {
	        el.load();
	      } catch (e) {
	        // not supported
	      }
	    })();
	  }
	};
	/**
	 * @fileoverview VideoJS-SWF - Custom Flash Player with HTML5-ish API
	 * https://github.com/zencoder/video-js-swf
	 * Not using setupTriggers. Using global onEvent func to distribute events
	 */
	
	/**
	 * Flash Media Controller - Wrapper for fallback SWF API
	 *
	 * @param {vjs.Player} player
	 * @param {Object=} options
	 * @param {Function=} ready
	 * @constructor
	 */
	vjs.Flash = vjs.MediaTechController.extend({
	  /** @constructor */
	  init: function(player, options, ready){
	    vjs.MediaTechController.call(this, player, options, ready);
	
	    var source = options['source'],
	
	        // Generate ID for swf object
	        objId = player.id()+'_flash_api',
	
	        // Store player options in local var for optimization
	        // TODO: switch to using player methods instead of options
	        // e.g. player.autoplay();
	        playerOptions = player.options_,
	
	        // Merge default flashvars with ones passed in to init
	        flashVars = vjs.obj.merge({
	
	          // SWF Callback Functions
	          'readyFunction': 'videojs.Flash.onReady',
	          'eventProxyFunction': 'videojs.Flash.onEvent',
	          'errorEventProxyFunction': 'videojs.Flash.onError',
	
	          // Player Settings
	          'autoplay': playerOptions.autoplay,
	          'preload': playerOptions.preload,
	          'loop': playerOptions.loop,
	          'muted': playerOptions.muted
	
	        }, options['flashVars']),
	
	        // Merge default parames with ones passed in
	        params = vjs.obj.merge({
	          'wmode': 'opaque', // Opaque is needed to overlay controls, but can affect playback performance
	          'bgcolor': '#000000' // Using bgcolor prevents a white flash when the object is loading
	        }, options['params']),
	
	        // Merge default attributes with ones passed in
	        attributes = vjs.obj.merge({
	          'id': objId,
	          'name': objId, // Both ID and Name needed or swf to identify itself
	          'class': 'vjs-tech'
	        }, options['attributes'])
	    ;
	
	    // If source was supplied pass as a flash var.
	    if (source) {
	      this.ready(function(){
	        this.setSource(source);
	      });
	    }
	
	    // Add placeholder to player div
	    vjs.insertFirst(this.el_, options['parentEl']);
	
	    // Having issues with Flash reloading on certain page actions (hide/resize/fullscreen) in certain browsers
	    // This allows resetting the playhead when we catch the reload
	    if (options['startTime']) {
	      this.ready(function(){
	        this.load();
	        this.play();
	        this['currentTime'](options['startTime']);
	      });
	    }
	
	    // firefox doesn't bubble mousemove events to parent. videojs/video-js-swf#37
	    // bugzilla bug: https://bugzilla.mozilla.org/show_bug.cgi?id=836786
	    if (vjs.IS_FIREFOX) {
	      this.ready(function(){
	        this.on('mousemove', function(){
	          // since it's a custom event, don't bubble higher than the player
	          this.player().trigger({ 'type':'mousemove', 'bubbles': false });
	        });
	      });
	    }
	
	    // native click events on the SWF aren't triggered on IE11, Win8.1RT
	    // use stageclick events triggered from inside the SWF instead
	    player.on('stageclick', player.reportUserActivity);
	
	    this.el_ = vjs.Flash.embed(options['swf'], this.el_, flashVars, params, attributes);
	  }
	});
	
	vjs.Flash.prototype.dispose = function(){
	  vjs.MediaTechController.prototype.dispose.call(this);
	};
	
	vjs.Flash.prototype.play = function(){
	  if (this.ended()) {
	    this['setCurrentTime'](0);
	  }
	
	  this.el_.vjs_play();
	};
	
	vjs.Flash.prototype.pause = function(){
	  this.el_.vjs_pause();
	};
	
	vjs.Flash.prototype.src = function(src){
	  if (src === undefined) {
	    return this['currentSrc']();
	  }
	
	  // Setting src through `src` not `setSrc` will be deprecated
	  return this.setSrc(src);
	};
	
	vjs.Flash.prototype.setSrc = function(src){
	  // Make sure source URL is absolute.
	  src = vjs.getAbsoluteURL(src);
	  this.el_.vjs_src(src);
	
	  // Currently the SWF doesn't autoplay if you load a source later.
	  // e.g. Load player w/ no source, wait 2s, set src.
	  if (this.player_.autoplay()) {
	    var tech = this;
	    this.setTimeout(function(){ tech.play(); }, 0);
	  }
	};
	
	vjs.Flash.prototype['setCurrentTime'] = function(time){
	  this.lastSeekTarget_ = time;
	  this.el_.vjs_setProperty('currentTime', time);
	  vjs.MediaTechController.prototype.setCurrentTime.call(this);
	};
	
	vjs.Flash.prototype['currentTime'] = function(time){
	  // when seeking make the reported time keep up with the requested time
	  // by reading the time we're seeking to
	  if (this.seeking()) {
	    return this.lastSeekTarget_ || 0;
	  }
	  return this.el_.vjs_getProperty('currentTime');
	};
	
	vjs.Flash.prototype['currentSrc'] = function(){
	  if (this.currentSource_) {
	    return this.currentSource_.src;
	  } else {
	    return this.el_.vjs_getProperty('currentSrc');
	  }
	};
	
	vjs.Flash.prototype.load = function(){
	  this.el_.vjs_load();
	};
	
	vjs.Flash.prototype.poster = function(){
	  this.el_.vjs_getProperty('poster');
	};
	vjs.Flash.prototype['setPoster'] = function(){
	  // poster images are not handled by the Flash tech so make this a no-op
	};
	
	vjs.Flash.prototype.seekable = function() {
	  var duration = this.duration();
	  if (duration === 0) {
	    // The SWF reports a duration of zero when the actual duration is unknown
	    return vjs.createTimeRange();
	  }
	  return vjs.createTimeRange(0, this.duration());
	};
	
	vjs.Flash.prototype.buffered = function(){
	  if (!this.el_.vjs_getProperty) {
	    return vjs.createTimeRange();
	  }
	  return vjs.createTimeRange(0, this.el_.vjs_getProperty('buffered'));
	};
	
	vjs.Flash.prototype.duration = function(){
	  if (!this.el_.vjs_getProperty) {
	    return 0;
	  }
	  return this.el_.vjs_getProperty('duration');
	};
	
	vjs.Flash.prototype.supportsFullScreen = function(){
	  return false; // Flash does not allow fullscreen through javascript
	};
	
	vjs.Flash.prototype.enterFullScreen = function(){
	  return false;
	};
	
	(function(){
	  // Create setters and getters for attributes
	  var api = vjs.Flash.prototype,
	    readWrite = 'rtmpConnection,rtmpStream,preload,defaultPlaybackRate,playbackRate,autoplay,loop,mediaGroup,controller,controls,volume,muted,defaultMuted'.split(','),
	    readOnly = 'error,networkState,readyState,seeking,initialTime,startOffsetTime,paused,played,ended,videoTracks,audioTracks,videoWidth,videoHeight'.split(','),
	    // Overridden: buffered, currentTime, currentSrc
	    i;
	
	  function createSetter(attr){
	    var attrUpper = attr.charAt(0).toUpperCase() + attr.slice(1);
	    api['set'+attrUpper] = function(val){ return this.el_.vjs_setProperty(attr, val); };
	  }
	  function createGetter(attr) {
	    api[attr] = function(){ return this.el_.vjs_getProperty(attr); };
	  }
	
	  // Create getter and setters for all read/write attributes
	  for (i = 0; i < readWrite.length; i++) {
	    createGetter(readWrite[i]);
	    createSetter(readWrite[i]);
	  }
	
	  // Create getters for read-only attributes
	  for (i = 0; i < readOnly.length; i++) {
	    createGetter(readOnly[i]);
	  }
	})();
	
	/* Flash Support Testing -------------------------------------------------------- */
	
	vjs.Flash.isSupported = function(){
	  return vjs.Flash.version()[0] >= 10;
	  // return swfobject.hasFlashPlayerVersion('10');
	};
	
	// Add Source Handler pattern functions to this tech
	vjs.MediaTechController.withSourceHandlers(vjs.Flash);
	
	/**
	 * The default native source handler.
	 * This simply passes the source to the video element. Nothing fancy.
	 * @param  {Object} source   The source object
	 * @param  {vjs.Flash} tech  The instance of the Flash tech
	 */
	vjs.Flash['nativeSourceHandler'] = {};
	
	/**
	 * Check Flash can handle the source natively
	 * @param  {Object} source  The source object
	 * @return {String}         'probably', 'maybe', or '' (empty string)
	 */
	vjs.Flash['nativeSourceHandler']['canHandleSource'] = function(source){
	  var type;
	
	  if (!source.type) {
	    return '';
	  }
	
	  // Strip code information from the type because we don't get that specific
	  type = source.type.replace(/;.*/,'').toLowerCase();
	
	  if (type in vjs.Flash.formats) {
	    return 'maybe';
	  }
	
	  return '';
	};
	
	/**
	 * Pass the source to the flash object
	 * Adaptive source handlers will have more complicated workflows before passing
	 * video data to the video element
	 * @param  {Object} source    The source object
	 * @param  {vjs.Flash} tech   The instance of the Flash tech
	 */
	vjs.Flash['nativeSourceHandler']['handleSource'] = function(source, tech){
	  tech.setSrc(source.src);
	};
	
	/**
	 * Clean up the source handler when disposing the player or switching sources..
	 * (no cleanup is needed when supporting the format natively)
	 */
	vjs.Flash['nativeSourceHandler']['dispose'] = function(){};
	
	// Register the native source handler
	vjs.Flash['registerSourceHandler'](vjs.Flash['nativeSourceHandler']);
	
	vjs.Flash.formats = {
	  'video/flv': 'FLV',
	  'video/x-flv': 'FLV',
	  'video/mp4': 'MP4',
	  'video/m4v': 'MP4'
	};
	
	vjs.Flash['onReady'] = function(currSwf){
	  var el, player;
	
	  el = vjs.el(currSwf);
	
	  // get player from the player div property
	  player = el && el.parentNode && el.parentNode['player'];
	
	  // if there is no el or player then the tech has been disposed
	  // and the tech element was removed from the player div
	  if (player) {
	    // reference player on tech element
	    el['player'] = player;
	    // check that the flash object is really ready
	    vjs.Flash['checkReady'](player.tech);
	  }
	};
	
	// The SWF isn't always ready when it says it is. Sometimes the API functions still need to be added to the object.
	// If it's not ready, we set a timeout to check again shortly.
	vjs.Flash['checkReady'] = function(tech){
	  // stop worrying if the tech has been disposed
	  if (!tech.el()) {
	    return;
	  }
	
	  // check if API property exists
	  if (tech.el().vjs_getProperty) {
	    // tell tech it's ready
	    tech.triggerReady();
	  } else {
	    // wait longer
	    this.setTimeout(function(){
	      vjs.Flash['checkReady'](tech);
	    }, 50);
	  }
	};
	
	// Trigger events from the swf on the player
	vjs.Flash['onEvent'] = function(swfID, eventName){
	  var player = vjs.el(swfID)['player'];
	  player.trigger(eventName);
	};
	
	// Log errors from the swf
	vjs.Flash['onError'] = function(swfID, err){
	  var player = vjs.el(swfID)['player'];
	  var msg = 'FLASH: '+err;
	
	  if (err == 'srcnotfound') {
	    player.error({ code: 4, message: msg });
	
	  // errors we haven't categorized into the media errors
	  } else {
	    player.error(msg);
	  }
	};
	
	// Flash Version Check
	vjs.Flash.version = function(){
	  var version = '0,0,0';
	
	  // IE
	  try {
	    version = new window.ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
	
	  // other browsers
	  } catch(e) {
	    try {
	      if (navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin){
	        version = (navigator.plugins['Shockwave Flash 2.0'] || navigator.plugins['Shockwave Flash']).description.replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
	      }
	    } catch(err) {}
	  }
	  return version.split(',');
	};
	
	// Flash embedding method. Only used in non-iframe mode
	vjs.Flash.embed = function(swf, placeHolder, flashVars, params, attributes){
	  var code = vjs.Flash.getEmbedCode(swf, flashVars, params, attributes),
	
	      // Get element by embedding code and retrieving created element
	      obj = vjs.createEl('div', { innerHTML: code }).childNodes[0],
	
	      par = placeHolder.parentNode
	  ;
	
	  placeHolder.parentNode.replaceChild(obj, placeHolder);
	  obj[vjs.expando] = placeHolder[vjs.expando];
	
	  // IE6 seems to have an issue where it won't initialize the swf object after injecting it.
	  // This is a dumb fix
	  var newObj = par.childNodes[0];
	  setTimeout(function(){
	    newObj.style.display = 'block';
	  }, 1000);
	
	  return obj;
	
	};
	
	vjs.Flash.getEmbedCode = function(swf, flashVars, params, attributes){
	
	  var objTag = '<object type="application/x-shockwave-flash" ',
	      flashVarsString = '',
	      paramsString = '',
	      attrsString = '';
	
	  // Convert flash vars to string
	  if (flashVars) {
	    vjs.obj.each(flashVars, function(key, val){
	      flashVarsString += (key + '=' + val + '&amp;');
	    });
	  }
	
	  // Add swf, flashVars, and other default params
	  params = vjs.obj.merge({
	    'movie': swf,
	    'flashvars': flashVarsString,
	    'allowScriptAccess': 'always', // Required to talk to swf
	    'allowNetworking': 'all' // All should be default, but having security issues.
	  }, params);
	
	  // Create param tags string
	  vjs.obj.each(params, function(key, val){
	    paramsString += '<param name="'+key+'" value="'+val+'" />';
	  });
	
	  attributes = vjs.obj.merge({
	    // Add swf to attributes (need both for IE and Others to work)
	    'data': swf,
	
	    // Default to 100% width/height
	    'width': '100%',
	    'height': '100%'
	
	  }, attributes);
	
	  // Create Attributes string
	  vjs.obj.each(attributes, function(key, val){
	    attrsString += (key + '="' + val + '" ');
	  });
	
	  return objTag + attrsString + '>' + paramsString + '</object>';
	};
	vjs.Flash.streamingFormats = {
	  'rtmp/mp4': 'MP4',
	  'rtmp/flv': 'FLV'
	};
	
	vjs.Flash.streamFromParts = function(connection, stream) {
	  return connection + '&' + stream;
	};
	
	vjs.Flash.streamToParts = function(src) {
	  var parts = {
	    connection: '',
	    stream: ''
	  };
	
	  if (! src) {
	    return parts;
	  }
	
	  // Look for the normal URL separator we expect, '&'.
	  // If found, we split the URL into two pieces around the
	  // first '&'.
	  var connEnd = src.indexOf('&');
	  var streamBegin;
	  if (connEnd !== -1) {
	    streamBegin = connEnd + 1;
	  }
	  else {
	    // If there's not a '&', we use the last '/' as the delimiter.
	    connEnd = streamBegin = src.lastIndexOf('/') + 1;
	    if (connEnd === 0) {
	      // really, there's not a '/'?
	      connEnd = streamBegin = src.length;
	    }
	  }
	  parts.connection = src.substring(0, connEnd);
	  parts.stream = src.substring(streamBegin, src.length);
	
	  return parts;
	};
	
	vjs.Flash.isStreamingType = function(srcType) {
	  return srcType in vjs.Flash.streamingFormats;
	};
	
	// RTMP has four variations, any string starting
	// with one of these protocols should be valid
	vjs.Flash.RTMP_RE = /^rtmp[set]?:\/\//i;
	
	vjs.Flash.isStreamingSrc = function(src) {
	  return vjs.Flash.RTMP_RE.test(src);
	};
	
	/**
	 * A source handler for RTMP urls
	 * @type {Object}
	 */
	vjs.Flash.rtmpSourceHandler = {};
	
	/**
	 * Check Flash can handle the source natively
	 * @param  {Object} source  The source object
	 * @return {String}         'probably', 'maybe', or '' (empty string)
	 */
	vjs.Flash.rtmpSourceHandler['canHandleSource'] = function(source){
	  if (vjs.Flash.isStreamingType(source.type) || vjs.Flash.isStreamingSrc(source.src)) {
	    return 'maybe';
	  }
	
	  return '';
	};
	
	/**
	 * Pass the source to the flash object
	 * Adaptive source handlers will have more complicated workflows before passing
	 * video data to the video element
	 * @param  {Object} source    The source object
	 * @param  {vjs.Flash} tech   The instance of the Flash tech
	 */
	vjs.Flash.rtmpSourceHandler['handleSource'] = function(source, tech){
	  var srcParts = vjs.Flash.streamToParts(source.src);
	
	  tech['setRtmpConnection'](srcParts.connection);
	  tech['setRtmpStream'](srcParts.stream);
	};
	
	// Register the native source handler
	vjs.Flash['registerSourceHandler'](vjs.Flash.rtmpSourceHandler);
	/**
	 * The Media Loader is the component that decides which playback technology to load
	 * when the player is initialized.
	 *
	 * @constructor
	 */
	vjs.MediaLoader = vjs.Component.extend({
	  /** @constructor */
	  init: function(player, options, ready){
	    vjs.Component.call(this, player, options, ready);
	
	    // If there are no sources when the player is initialized,
	    // load the first supported playback technology.
	    if (!player.options_['sources'] || player.options_['sources'].length === 0) {
	      for (var i=0,j=player.options_['techOrder']; i<j.length; i++) {
	        var techName = vjs.capitalize(j[i]),
	            tech = window['videojs'][techName];
	
	        // Check if the browser supports this technology
	        if (tech && tech.isSupported()) {
	          player.loadTech(techName);
	          break;
	        }
	      }
	    } else {
	      // // Loop through playback technologies (HTML5, Flash) and check for support.
	      // // Then load the best source.
	      // // A few assumptions here:
	      // //   All playback technologies respect preload false.
	      player.src(player.options_['sources']);
	    }
	  }
	});
	/*
	 * https://html.spec.whatwg.org/multipage/embedded-content.html#texttrackmode
	 *
	 * enum TextTrackMode { "disabled",  "hidden",  "showing" };
	 */
	vjs.TextTrackMode = {
	  'disabled': 'disabled',
	  'hidden': 'hidden',
	  'showing': 'showing'
	};
	
	/*
	 * https://html.spec.whatwg.org/multipage/embedded-content.html#texttrackkind
	 *
	 * enum TextTrackKind { "subtitles",  "captions",  "descriptions",  "chapters",  "metadata" };
	 */
	vjs.TextTrackKind = {
	  'subtitles': 'subtitles',
	  'captions': 'captions',
	  'descriptions': 'descriptions',
	  'chapters': 'chapters',
	  'metadata': 'metadata'
	};
	(function() {
	/*
	 * https://html.spec.whatwg.org/multipage/embedded-content.html#texttrack
	 *
	 * interface TextTrack : EventTarget {
	 *   readonly attribute TextTrackKind kind;
	 *   readonly attribute DOMString label;
	 *   readonly attribute DOMString language;
	 *
	 *   readonly attribute DOMString id;
	 *   readonly attribute DOMString inBandMetadataTrackDispatchType;
	 *
	 *   attribute TextTrackMode mode;
	 *
	 *   readonly attribute TextTrackCueList? cues;
	 *   readonly attribute TextTrackCueList? activeCues;
	 *
	 *   void addCue(TextTrackCue cue);
	 *   void removeCue(TextTrackCue cue);
	 *
	 *   attribute EventHandler oncuechange;
	 * };
	 */
	
	vjs.TextTrack = function(options) {
	  var tt, id, mode, kind, label, language, cues, activeCues, timeupdateHandler, changed, prop;
	
	  options = options || {};
	
	  if (!options['player']) {
	    throw new Error('A player was not provided.');
	  }
	
	  tt = this;
	  if (vjs.IS_IE8) {
	    tt = document.createElement('custom');
	
	    for (prop in vjs.TextTrack.prototype) {
	      tt[prop] = vjs.TextTrack.prototype[prop];
	    }
	  }
	
	  tt.player_ = options['player'];
	
	  mode = vjs.TextTrackMode[options['mode']] || 'disabled';
	  kind = vjs.TextTrackKind[options['kind']] || 'subtitles';
	  label = options['label'] || '';
	  language = options['language'] || options['srclang'] || '';
	  id = options['id'] || 'vjs_text_track_' + vjs.guid++;
	
	  if (kind === 'metadata' || kind === 'chapters') {
	    mode = 'hidden';
	  }
	
	  tt.cues_ = [];
	  tt.activeCues_ = [];
	
	  cues = new vjs.TextTrackCueList(tt.cues_);
	  activeCues = new vjs.TextTrackCueList(tt.activeCues_);
	
	  changed = false;
	  timeupdateHandler = vjs.bind(tt, function() {
	    this['activeCues'];
	    if (changed) {
	      this['trigger']('cuechange');
	      changed = false;
	    }
	  });
	  if (mode !== 'disabled') {
	    tt.player_.on('timeupdate', timeupdateHandler);
	  }
	
	  Object.defineProperty(tt, 'kind', {
	    get: function() {
	      return kind;
	    },
	    set: Function.prototype
	  });
	
	  Object.defineProperty(tt, 'label', {
	    get: function() {
	      return label;
	    },
	    set: Function.prototype
	  });
	
	  Object.defineProperty(tt, 'language', {
	    get: function() {
	      return language;
	    },
	    set: Function.prototype
	  });
	
	  Object.defineProperty(tt, 'id', {
	    get: function() {
	      return id;
	    },
	    set: Function.prototype
	  });
	
	  Object.defineProperty(tt, 'mode', {
	    get: function() {
	      return mode;
	    },
	    set: function(newMode) {
	      if (!vjs.TextTrackMode[newMode]) {
	        return;
	      }
	      mode = newMode;
	      if (mode === 'showing') {
	        this.player_.on('timeupdate', timeupdateHandler);
	      }
	      this.trigger('modechange');
	    }
	  });
	
	  Object.defineProperty(tt, 'cues', {
	    get: function() {
	      if (!this.loaded_) {
	        return null;
	      }
	
	      return cues;
	    },
	    set: Function.prototype
	  });
	
	  Object.defineProperty(tt, 'activeCues', {
	    get: function() {
	      var i, l, active, ct, cue;
	
	      if (!this.loaded_) {
	        return null;
	      }
	
	      if (this['cues'].length === 0) {
	        return activeCues; // nothing to do
	      }
	
	      ct = this.player_.currentTime();
	      i = 0;
	      l = this['cues'].length;
	      active = [];
	
	      for (; i < l; i++) {
	        cue = this['cues'][i];
	        if (cue['startTime'] <= ct && cue['endTime'] >= ct) {
	          active.push(cue);
	        } else if (cue['startTime'] === cue['endTime'] && cue['startTime'] <= ct && cue['startTime'] + 0.5 >= ct) {
	          active.push(cue);
	        }
	      }
	
	      changed = false;
	
	      if (active.length !== this.activeCues_.length) {
	        changed = true;
	      } else {
	        for (i = 0; i < active.length; i++) {
	          if (indexOf.call(this.activeCues_, active[i]) === -1) {
	            changed = true;
	          }
	        }
	      }
	
	      this.activeCues_ = active;
	      activeCues.setCues_(this.activeCues_);
	
	      return activeCues;
	    },
	    set: Function.prototype
	  });
	
	  if (options.src) {
	    loadTrack(options.src, tt);
	  } else {
	    tt.loaded_ = true;
	  }
	
	  if (vjs.IS_IE8) {
	    return tt;
	  }
	};
	
	vjs.TextTrack.prototype = vjs.obj.create(vjs.EventEmitter.prototype);
	vjs.TextTrack.prototype.constructor = vjs.TextTrack;
	
	/*
	 * cuechange - One or more cues in the track have become active or stopped being active.
	 */
	vjs.TextTrack.prototype.allowedEvents_ = {
	  'cuechange': 'cuechange'
	};
	
	vjs.TextTrack.prototype.addCue = function(cue) {
	  var tracks = this.player_.textTracks(),
	      i = 0;
	
	  if (tracks) {
	    for (; i < tracks.length; i++) {
	      if (tracks[i] !== this) {
	        tracks[i].removeCue(cue);
	      }
	    }
	  }
	
	  this.cues_.push(cue);
	  this['cues'].setCues_(this.cues_);
	};
	
	vjs.TextTrack.prototype.removeCue = function(removeCue) {
	  var i = 0,
	      l = this.cues_.length,
	      cue,
	      removed = false;
	
	  for (; i < l; i++) {
	    cue = this.cues_[i];
	    if (cue === removeCue) {
	      this.cues_.splice(i, 1);
	      removed = true;
	    }
	  }
	
	  if (removed) {
	    this.cues.setCues_(this.cues_);
	  }
	};
	
	/*
	 * Downloading stuff happens below this point
	 */
	var loadTrack, parseCues, indexOf;
	
	loadTrack = function(src, track) {
	  vjs.xhr(src, vjs.bind(this, function(err, response, responseBody){
	    if (err) {
	      return vjs.log.error(err);
	    }
	
	
	    track.loaded_ = true;
	    parseCues(responseBody, track);
	  }));
	};
	
	parseCues = function(srcContent, track) {
	  if (typeof window['WebVTT'] !== 'function') {
	    //try again a bit later
	    return window.setTimeout(function() {
	      parseCues(srcContent, track);
	    }, 25);
	  }
	
	  var parser = new window['WebVTT']['Parser'](window, window['vttjs'], window['WebVTT']['StringDecoder']());
	
	  parser['oncue'] = function(cue) {
	    track.addCue(cue);
	  };
	  parser['onparsingerror'] = function(error) {
	    vjs.log.error(error);
	  };
	
	  parser['parse'](srcContent);
	  parser['flush']();
	};
	
	indexOf = function(searchElement, fromIndex) {
	
	  var k;
	
	  if (this == null) {
	    throw new TypeError('"this" is null or not defined');
	  }
	
	  var O = Object(this);
	
	  var len = O.length >>> 0;
	
	  if (len === 0) {
	    return -1;
	  }
	
	  var n = +fromIndex || 0;
	
	  if (Math.abs(n) === Infinity) {
	    n = 0;
	  }
	
	  if (n >= len) {
	    return -1;
	  }
	
	  k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
	
	  while (k < len) {
	    if (k in O && O[k] === searchElement) {
	      return k;
	    }
	    k++;
	  }
	  return -1;
	};
	
	})();
	/*
	 * https://html.spec.whatwg.org/multipage/embedded-content.html#texttracklist
	 *
	 * interface TextTrackList : EventTarget {
	 *   readonly attribute unsigned long length;
	 *   getter TextTrack (unsigned long index);
	 *   TextTrack? getTrackById(DOMString id);
	 * 
	 *   attribute EventHandler onchange;
	 *   attribute EventHandler onaddtrack;
	 *   attribute EventHandler onremovetrack;
	 * };
	 */
	vjs.TextTrackList = function(tracks) {
	  var list = this,
	      prop,
	      i = 0;
	
	  if (vjs.IS_IE8) {
	    list = document.createElement('custom');
	
	    for (prop in vjs.TextTrackList.prototype) {
	      list[prop] = vjs.TextTrackList.prototype[prop];
	    }
	  }
	
	  tracks = tracks || [];
	  list.tracks_ = [];
	
	  Object.defineProperty(list, 'length', {
	    get: function() {
	      return this.tracks_.length;
	    }
	  });
	
	  for (; i < tracks.length; i++) {
	    list.addTrack_(tracks[i]);
	  }
	
	  if (vjs.IS_IE8) {
	    return list;
	  }
	};
	
	vjs.TextTrackList.prototype = vjs.obj.create(vjs.EventEmitter.prototype);
	vjs.TextTrackList.prototype.constructor = vjs.TextTrackList;
	
	/*
	 * change - One or more tracks in the track list have been enabled or disabled.
	 * addtrack - A track has been added to the track list.
	 * removetrack - A track has been removed from the track list.
	*/
	vjs.TextTrackList.prototype.allowedEvents_ = {
	  'change': 'change',
	  'addtrack': 'addtrack',
	  'removetrack': 'removetrack'
	};
	
	// emulate attribute EventHandler support to allow for feature detection
	(function() {
	  var event;
	
	  for (event in vjs.TextTrackList.prototype.allowedEvents_) {
	    vjs.TextTrackList.prototype['on' + event] = null;
	  }
	})();
	
	vjs.TextTrackList.prototype.addTrack_ = function(track) {
	  var index = this.tracks_.length;
	  if (!(''+index in this)) {
	    Object.defineProperty(this, index, {
	      get: function() {
	        return this.tracks_[index];
	      }
	    });
	  }
	
	  track.addEventListener('modechange', vjs.bind(this, function() {
	    this.trigger('change');
	  }));
	  this.tracks_.push(track);
	
	  this.trigger({
	    type: 'addtrack',
	    track: track
	  });
	};
	
	vjs.TextTrackList.prototype.removeTrack_ = function(rtrack) {
	  var i = 0,
	      l = this.length,
	      result = null,
	      track;
	
	  for (; i < l; i++) {
	    track = this[i];
	    if (track === rtrack) {
	      this.tracks_.splice(i, 1);
	      break;
	    }
	  }
	
	  this.trigger({
	    type: 'removetrack',
	    track: rtrack
	  });
	};
	
	vjs.TextTrackList.prototype.getTrackById = function(id) {
	  var i = 0,
	      l = this.length,
	      result = null,
	      track;
	
	  for (; i < l; i++) {
	    track = this[i];
	    if (track.id === id) {
	      result = track;
	      break;
	    }
	  }
	
	  return result;
	};
	/*
	 * https://html.spec.whatwg.org/multipage/embedded-content.html#texttrackcuelist
	 *
	 * interface TextTrackCueList {
	 *   readonly attribute unsigned long length;
	 *   getter TextTrackCue (unsigned long index);
	 *   TextTrackCue? getCueById(DOMString id);
	 * };
	 */
	
	vjs.TextTrackCueList = function(cues) {
	  var list = this,
	      prop;
	
	  if (vjs.IS_IE8) {
	    list = document.createElement('custom');
	
	    for (prop in vjs.TextTrackCueList.prototype) {
	      list[prop] = vjs.TextTrackCueList.prototype[prop];
	    }
	  }
	
	  vjs.TextTrackCueList.prototype.setCues_.call(list, cues);
	
	  Object.defineProperty(list, 'length', {
	    get: function() {
	      return this.length_;
	    }
	  });
	
	  if (vjs.IS_IE8) {
	    return list;
	  }
	};
	
	vjs.TextTrackCueList.prototype.setCues_ = function(cues) {
	  var oldLength = this.length || 0,
	      i = 0,
	      l = cues.length,
	      defineProp;
	
	  this.cues_ = cues;
	  this.length_ = cues.length;
	
	  defineProp = function(i) {
	    if (!(''+i in this)) {
	      Object.defineProperty(this, '' + i, {
	        get: function() {
	          return this.cues_[i];
	        }
	      });
	    }
	  };
	
	  if (oldLength < l) {
	    i = oldLength;
	    for(; i < l; i++) {
	      defineProp.call(this, i);
	    }
	  }
	};
	
	vjs.TextTrackCueList.prototype.getCueById = function(id) {
	  var i = 0,
	      l = this.length,
	      result = null,
	      cue;
	
	  for (; i < l; i++) {
	    cue = this[i];
	    if (cue.id === id) {
	      result = cue;
	      break;
	    }
	  }
	
	  return result;
	};
	(function() {
	'use strict';
	
	/* Text Track Display
	============================================================================= */
	// Global container for both subtitle and captions text. Simple div container.
	
	/**
	 * The component for displaying text track cues
	 *
	 * @constructor
	 */
	vjs.TextTrackDisplay = vjs.Component.extend({
	  /** @constructor */
	  init: function(player, options, ready){
	    vjs.Component.call(this, player, options, ready);
	
	    player.on('loadstart', vjs.bind(this, this.toggleDisplay));
	
	    // This used to be called during player init, but was causing an error
	    // if a track should show by default and the display hadn't loaded yet.
	    // Should probably be moved to an external track loader when we support
	    // tracks that don't need a display.
	    player.ready(vjs.bind(this, function() {
	      if (player.tech && player.tech['featuresNativeTextTracks']) {
	        this.hide();
	        return;
	      }
	
	      var i, tracks, track;
	
	      player.on('fullscreenchange', vjs.bind(this, this.updateDisplay));
	
	      tracks = player.options_['tracks'] || [];
	      for (i = 0; i < tracks.length; i++) {
	        track = tracks[i];
	        this.player_.addRemoteTextTrack(track);
	      }
	    }));
	  }
	});
	
	vjs.TextTrackDisplay.prototype.toggleDisplay = function() {
	  if (this.player_.tech && this.player_.tech['featuresNativeTextTracks']) {
	    this.hide();
	  } else {
	    this.show();
	  }
	};
	
	vjs.TextTrackDisplay.prototype.createEl = function(){
	  return vjs.Component.prototype.createEl.call(this, 'div', {
	    className: 'vjs-text-track-display'
	  });
	};
	
	vjs.TextTrackDisplay.prototype.clearDisplay = function() {
	  if (typeof window['WebVTT'] === 'function') {
	    window['WebVTT']['processCues'](window, [], this.el_);
	  }
	};
	
	// Add cue HTML to display
	var constructColor = function(color, opacity) {
	  return 'rgba(' +
	    // color looks like "#f0e"
	    parseInt(color[1] + color[1], 16) + ',' +
	    parseInt(color[2] + color[2], 16) + ',' +
	    parseInt(color[3] + color[3], 16) + ',' +
	    opacity + ')';
	};
	var darkGray = '#222';
	var lightGray = '#ccc';
	var fontMap = {
	  monospace:             'monospace',
	  sansSerif:             'sans-serif',
	  serif:                 'serif',
	  monospaceSansSerif:    '"Andale Mono", "Lucida Console", monospace',
	  monospaceSerif:        '"Courier New", monospace',
	  proportionalSansSerif: 'sans-serif',
	  proportionalSerif:     'serif',
	  casual:                '"Comic Sans MS", Impact, fantasy',
	  script:                '"Monotype Corsiva", cursive',
	  smallcaps:             '"Andale Mono", "Lucida Console", monospace, sans-serif'
	};
	var tryUpdateStyle = function(el, style, rule) {
	  // some style changes will throw an error, particularly in IE8. Those should be noops.
	  try {
	    el.style[style] = rule;
	  } catch (e) {}
	};
	
	vjs.TextTrackDisplay.prototype.updateDisplay = function() {
	  var tracks = this.player_.textTracks(),
	      i = 0,
	      track;
	
	  this.clearDisplay();
	
	  if (!tracks) {
	    return;
	  }
	
	  for (; i < tracks.length; i++) {
	    track = tracks[i];
	    if (track['mode'] === 'showing') {
	      this.updateForTrack(track);
	    }
	  }
	};
	
	vjs.TextTrackDisplay.prototype.updateForTrack = function(track) {
	  if (typeof window['WebVTT'] !== 'function' || !track['activeCues']) {
	    return;
	  }
	
	  var i = 0,
	      property,
	      cueDiv,
	      overrides = this.player_['textTrackSettings'].getValues(),
	      fontSize,
	      cues = [];
	
	  for (; i < track['activeCues'].length; i++) {
	    cues.push(track['activeCues'][i]);
	  }
	
	  window['WebVTT']['processCues'](window, track['activeCues'], this.el_);
	
	  i = cues.length;
	  while (i--) {
	    cueDiv = cues[i].displayState;
	    if (overrides.color) {
	      cueDiv.firstChild.style.color = overrides.color;
	    }
	    if (overrides.textOpacity) {
	      tryUpdateStyle(cueDiv.firstChild,
	                     'color',
	                     constructColor(overrides.color || '#fff',
	                                    overrides.textOpacity));
	    }
	    if (overrides.backgroundColor) {
	      cueDiv.firstChild.style.backgroundColor = overrides.backgroundColor;
	    }
	    if (overrides.backgroundOpacity) {
	      tryUpdateStyle(cueDiv.firstChild,
	                     'backgroundColor',
	                     constructColor(overrides.backgroundColor || '#000',
	                                    overrides.backgroundOpacity));
	    }
	    if (overrides.windowColor) {
	      if (overrides.windowOpacity) {
	        tryUpdateStyle(cueDiv,
	                       'backgroundColor',
	                       constructColor(overrides.windowColor, overrides.windowOpacity));
	      } else {
	        cueDiv.style.backgroundColor = overrides.windowColor;
	      }
	    }
	    if (overrides.edgeStyle) {
	      if (overrides.edgeStyle === 'dropshadow') {
	        cueDiv.firstChild.style.textShadow = '2px 2px 3px ' + darkGray + ', 2px 2px 4px ' + darkGray + ', 2px 2px 5px ' + darkGray;
	      } else if (overrides.edgeStyle === 'raised') {
	        cueDiv.firstChild.style.textShadow = '1px 1px ' + darkGray + ', 2px 2px ' + darkGray + ', 3px 3px ' + darkGray;
	      } else if (overrides.edgeStyle === 'depressed') {
	        cueDiv.firstChild.style.textShadow = '1px 1px ' + lightGray + ', 0 1px ' + lightGray + ', -1px -1px ' + darkGray + ', 0 -1px ' + darkGray;
	      } else if (overrides.edgeStyle === 'uniform') {
	        cueDiv.firstChild.style.textShadow = '0 0 4px ' + darkGray + ', 0 0 4px ' + darkGray + ', 0 0 4px ' + darkGray + ', 0 0 4px ' + darkGray;
	      }
	    }
	    if (overrides.fontPercent && overrides.fontPercent !== 1) {
	      fontSize = window.parseFloat(cueDiv.style.fontSize);
	      cueDiv.style.fontSize = (fontSize * overrides.fontPercent) + 'px';
	      cueDiv.style.height = 'auto';
	      cueDiv.style.top = 'auto';
	      cueDiv.style.bottom = '2px';
	    }
	    if (overrides.fontFamily && overrides.fontFamily !== 'default') {
	      if (overrides.fontFamily === 'small-caps') {
	        cueDiv.firstChild.style.fontVariant = 'small-caps';
	      } else {
	        cueDiv.firstChild.style.fontFamily = fontMap[overrides.fontFamily];
	      }
	    }
	  }
	};
	
	
	/**
	 * The specific menu item type for selecting a language within a text track kind
	 *
	 * @constructor
	 */
	vjs.TextTrackMenuItem = vjs.MenuItem.extend({
	  /** @constructor */
	  init: function(player, options){
	    var track = this.track = options['track'],
	        tracks = player.textTracks(),
	        changeHandler,
	        event;
	
	    if (tracks) {
	      changeHandler = vjs.bind(this, function() {
	        var selected = this.track['mode'] === 'showing',
	            track,
	            i,
	            l;
	
	        if (this instanceof vjs.OffTextTrackMenuItem) {
	          selected = true;
	
	          i = 0,
	          l = tracks.length;
	
	          for (; i < l; i++) {
	            track = tracks[i];
	            if (track['kind'] === this.track['kind'] && track['mode'] === 'showing') {
	              selected = false;
	              break;
	            }
	          }
	        }
	
	        this.selected(selected);
	      });
	      tracks.addEventListener('change', changeHandler);
	      player.on('dispose', function() {
	        tracks.removeEventListener('change', changeHandler);
	      });
	    }
	
	    // Modify options for parent MenuItem class's init.
	    options['label'] = track['label'] || track['language'] || 'Unknown';
	    options['selected'] = track['default'] || track['mode'] === 'showing';
	    vjs.MenuItem.call(this, player, options);
	
	    // iOS7 doesn't dispatch change events to TextTrackLists when an
	    // associated track's mode changes. Without something like
	    // Object.observe() (also not present on iOS7), it's not
	    // possible to detect changes to the mode attribute and polyfill
	    // the change event. As a poor substitute, we manually dispatch
	    // change events whenever the controls modify the mode.
	    if (tracks && tracks.onchange === undefined) {
	      this.on(['tap', 'click'], function() {
	        if (typeof window.Event !== 'object') {
	          // Android 2.3 throws an Illegal Constructor error for window.Event
	          try {
	            event = new window.Event('change');
	          } catch(err){}
	        }
	
	        if (!event) {
	          event = document.createEvent('Event');
	          event.initEvent('change', true, true);
	        }
	
	        tracks.dispatchEvent(event);
	      });
	    }
	  }
	});
	
	vjs.TextTrackMenuItem.prototype.onClick = function(){
	  var kind = this.track['kind'],
	      tracks = this.player_.textTracks(),
	      mode,
	      track,
	      i = 0;
	
	  vjs.MenuItem.prototype.onClick.call(this);
	
	  if (!tracks) {
	    return;
	  }
	
	  for (; i < tracks.length; i++) {
	    track = tracks[i];
	
	    if (track['kind'] !== kind) {
	      continue;
	    }
	
	    if (track === this.track) {
	      track['mode'] = 'showing';
	    } else {
	      track['mode'] = 'disabled';
	    }
	  }
	};
	
	/**
	 * A special menu item for turning of a specific type of text track
	 *
	 * @constructor
	 */
	vjs.OffTextTrackMenuItem = vjs.TextTrackMenuItem.extend({
	  /** @constructor */
	  init: function(player, options){
	    // Create pseudo track info
	    // Requires options['kind']
	    options['track'] = {
	      'kind': options['kind'],
	      'player': player,
	      'label': options['kind'] + ' off',
	      'default': false,
	      'mode': 'disabled'
	    };
	    vjs.TextTrackMenuItem.call(this, player, options);
	    this.selected(true);
	  }
	});
	
	vjs.CaptionSettingsMenuItem = vjs.TextTrackMenuItem.extend({
	  init: function(player, options) {
	    options['track'] = {
	      'kind': options['kind'],
	      'player': player,
	      'label': options['kind'] + ' settings',
	      'default': false,
	      mode: 'disabled'
	    };
	
	    vjs.TextTrackMenuItem.call(this, player, options);
	    this.addClass('vjs-texttrack-settings');
	  }
	});
	
	vjs.CaptionSettingsMenuItem.prototype.onClick = function() {
	  this.player().getChild('textTrackSettings').show();
	};
	
	/**
	 * The base class for buttons that toggle specific text track types (e.g. subtitles)
	 *
	 * @constructor
	 */
	vjs.TextTrackButton = vjs.MenuButton.extend({
	  /** @constructor */
	  init: function(player, options){
	    var tracks, updateHandler;
	
	    vjs.MenuButton.call(this, player, options);
	
	    tracks = this.player_.textTracks();
	
	    if (this.items.length <= 1) {
	      this.hide();
	    }
	
	    if (!tracks) {
	      return;
	    }
	
	    updateHandler = vjs.bind(this, this.update);
	    tracks.addEventListener('removetrack', updateHandler);
	    tracks.addEventListener('addtrack', updateHandler);
	
	    this.player_.on('dispose', function() {
	      tracks.removeEventListener('removetrack', updateHandler);
	      tracks.removeEventListener('addtrack', updateHandler);
	    });
	  }
	});
	
	// Create a menu item for each text track
	vjs.TextTrackButton.prototype.createItems = function(){
	  var items = [], track, tracks;
	
	  if (this instanceof vjs.CaptionsButton && !(this.player().tech && this.player().tech['featuresNativeTextTracks'])) {
	    items.push(new vjs.CaptionSettingsMenuItem(this.player_, { 'kind': this.kind_ }));
	  }
	
	  // Add an OFF menu item to turn all tracks off
	  items.push(new vjs.OffTextTrackMenuItem(this.player_, { 'kind': this.kind_ }));
	
	  tracks = this.player_.textTracks();
	
	  if (!tracks) {
	    return items;
	  }
	
	  for (var i = 0; i < tracks.length; i++) {
	    track = tracks[i];
	
	    // only add tracks that are of the appropriate kind and have a label
	    if (track['kind'] === this.kind_) {
	      items.push(new vjs.TextTrackMenuItem(this.player_, {
	        'track': track
	      }));
	    }
	  }
	
	  return items;
	};
	
	/**
	 * The button component for toggling and selecting captions
	 *
	 * @constructor
	 */
	vjs.CaptionsButton = vjs.TextTrackButton.extend({
	  /** @constructor */
	  init: function(player, options, ready){
	    vjs.TextTrackButton.call(this, player, options, ready);
	    this.el_.setAttribute('aria-label','Captions Menu');
	  }
	});
	vjs.CaptionsButton.prototype.kind_ = 'captions';
	vjs.CaptionsButton.prototype.buttonText = 'Captions';
	vjs.CaptionsButton.prototype.className = 'vjs-captions-button';
	
	vjs.CaptionsButton.prototype.update = function() {
	  var threshold = 2;
	  vjs.TextTrackButton.prototype.update.call(this);
	
	  // if native, then threshold is 1 because no settings button
	  if (this.player().tech && this.player().tech['featuresNativeTextTracks']) {
	    threshold = 1;
	  }
	
	  if (this.items && this.items.length > threshold) {
	    this.show();
	  } else {
	    this.hide();
	  }
	};
	
	/**
	 * The button component for toggling and selecting subtitles
	 *
	 * @constructor
	 */
	vjs.SubtitlesButton = vjs.TextTrackButton.extend({
	  /** @constructor */
	  init: function(player, options, ready){
	    vjs.TextTrackButton.call(this, player, options, ready);
	    this.el_.setAttribute('aria-label','Subtitles Menu');
	  }
	});
	vjs.SubtitlesButton.prototype.kind_ = 'subtitles';
	vjs.SubtitlesButton.prototype.buttonText = 'Subtitles';
	vjs.SubtitlesButton.prototype.className = 'vjs-subtitles-button';
	
	// Chapters act much differently than other text tracks
	// Cues are navigation vs. other tracks of alternative languages
	/**
	 * The button component for toggling and selecting chapters
	 *
	 * @constructor
	 */
	vjs.ChaptersButton = vjs.TextTrackButton.extend({
	  /** @constructor */
	  init: function(player, options, ready){
	    vjs.TextTrackButton.call(this, player, options, ready);
	    this.el_.setAttribute('aria-label','Chapters Menu');
	  }
	});
	vjs.ChaptersButton.prototype.kind_ = 'chapters';
	vjs.ChaptersButton.prototype.buttonText = 'Chapters';
	vjs.ChaptersButton.prototype.className = 'vjs-chapters-button';
	
	// Create a menu item for each text track
	vjs.ChaptersButton.prototype.createItems = function(){
	  var items = [], track, tracks;
	
	  tracks = this.player_.textTracks();
	
	  if (!tracks) {
	    return items;
	  }
	
	  for (var i = 0; i < tracks.length; i++) {
	    track = tracks[i];
	    if (track['kind'] === this.kind_) {
	      items.push(new vjs.TextTrackMenuItem(this.player_, {
	        'track': track
	      }));
	    }
	  }
	
	  return items;
	};
	
	vjs.ChaptersButton.prototype.createMenu = function(){
	  var tracks = this.player_.textTracks() || [],
	      i = 0,
	      l = tracks.length,
	      track, chaptersTrack,
	      items = this.items = [];
	
	  for (; i < l; i++) {
	    track = tracks[i];
	    if (track['kind'] == this.kind_) {
	      if (!track.cues) {
	        track['mode'] = 'hidden';
	        /* jshint loopfunc:true */
	        // TODO see if we can figure out a better way of doing this https://github.com/videojs/video.js/issues/1864
	        window.setTimeout(vjs.bind(this, function() {
	          this.createMenu();
	        }), 100);
	        /* jshint loopfunc:false */
	      } else {
	        chaptersTrack = track;
	        break;
	      }
	    }
	  }
	
	  var menu = this.menu;
	  if (menu === undefined) {
	    menu = new vjs.Menu(this.player_);
	    menu.contentEl().appendChild(vjs.createEl('li', {
	      className: 'vjs-menu-title',
	      innerHTML: vjs.capitalize(this.kind_),
	      tabindex: -1
	    }));
	  }
	
	  if (chaptersTrack) {
	    var cues = chaptersTrack['cues'], cue, mi;
	    i = 0;
	    l = cues.length;
	
	    for (; i < l; i++) {
	      cue = cues[i];
	
	      mi = new vjs.ChaptersTrackMenuItem(this.player_, {
	        'track': chaptersTrack,
	        'cue': cue
	      });
	
	      items.push(mi);
	
	      menu.addChild(mi);
	    }
	    this.addChild(menu);
	  }
	
	  if (this.items.length > 0) {
	    this.show();
	  }
	
	  return menu;
	};
	
	
	/**
	 * @constructor
	 */
	vjs.ChaptersTrackMenuItem = vjs.MenuItem.extend({
	  /** @constructor */
	  init: function(player, options){
	    var track = this.track = options['track'],
	        cue = this.cue = options['cue'],
	        currentTime = player.currentTime();
	
	    // Modify options for parent MenuItem class's init.
	    options['label'] = cue.text;
	    options['selected'] = (cue['startTime'] <= currentTime && currentTime < cue['endTime']);
	    vjs.MenuItem.call(this, player, options);
	
	    track.addEventListener('cuechange', vjs.bind(this, this.update));
	  }
	});
	
	vjs.ChaptersTrackMenuItem.prototype.onClick = function(){
	  vjs.MenuItem.prototype.onClick.call(this);
	  this.player_.currentTime(this.cue.startTime);
	  this.update(this.cue.startTime);
	};
	
	vjs.ChaptersTrackMenuItem.prototype.update = function(){
	  var cue = this.cue,
	      currentTime = this.player_.currentTime();
	
	  // vjs.log(currentTime, cue.startTime);
	  this.selected(cue['startTime'] <= currentTime && currentTime < cue['endTime']);
	};
	})();
	(function() {
	  'use strict';
	
	  vjs.TextTrackSettings = vjs.Component.extend({
	    init: function(player, options) {
	      vjs.Component.call(this, player, options);
	      this.hide();
	
	      vjs.on(this.el().querySelector('.vjs-done-button'), 'click', vjs.bind(this, function() {
	        this.saveSettings();
	        this.hide();
	      }));
	
	      vjs.on(this.el().querySelector('.vjs-default-button'), 'click', vjs.bind(this, function() {
	        this.el().querySelector('.vjs-fg-color > select').selectedIndex = 0;
	        this.el().querySelector('.vjs-bg-color > select').selectedIndex = 0;
	        this.el().querySelector('.window-color > select').selectedIndex = 0;
	        this.el().querySelector('.vjs-text-opacity > select').selectedIndex = 0;
	        this.el().querySelector('.vjs-bg-opacity > select').selectedIndex = 0;
	        this.el().querySelector('.vjs-window-opacity > select').selectedIndex = 0;
	        this.el().querySelector('.vjs-edge-style select').selectedIndex = 0;
	        this.el().querySelector('.vjs-font-family select').selectedIndex = 0;
	        this.el().querySelector('.vjs-font-percent select').selectedIndex = 2;
	        this.updateDisplay();
	      }));
	
	      vjs.on(this.el().querySelector('.vjs-fg-color > select'), 'change', vjs.bind(this, this.updateDisplay));
	      vjs.on(this.el().querySelector('.vjs-bg-color > select'), 'change', vjs.bind(this, this.updateDisplay));
	      vjs.on(this.el().querySelector('.window-color > select'), 'change', vjs.bind(this, this.updateDisplay));
	      vjs.on(this.el().querySelector('.vjs-text-opacity > select'), 'change', vjs.bind(this, this.updateDisplay));
	      vjs.on(this.el().querySelector('.vjs-bg-opacity > select'), 'change', vjs.bind(this, this.updateDisplay));
	      vjs.on(this.el().querySelector('.vjs-window-opacity > select'), 'change', vjs.bind(this, this.updateDisplay));
	      vjs.on(this.el().querySelector('.vjs-font-percent select'), 'change', vjs.bind(this, this.updateDisplay));
	      vjs.on(this.el().querySelector('.vjs-edge-style select'), 'change', vjs.bind(this, this.updateDisplay));
	      vjs.on(this.el().querySelector('.vjs-font-family select'), 'change', vjs.bind(this, this.updateDisplay));
	
	      if (player.options()['persistTextTrackSettings']) {
	        this.restoreSettings();
	      }
	    }
	  });
	
	  vjs.TextTrackSettings.prototype.createEl = function() {
	    return vjs.Component.prototype.createEl.call(this, 'div', {
	      className: 'vjs-caption-settings vjs-modal-overlay',
	      innerHTML: captionOptionsMenuTemplate()
	    });
	  };
	
	  vjs.TextTrackSettings.prototype.getValues = function() {
	    var el, bgOpacity, textOpacity, windowOpacity, textEdge, fontFamily, fgColor, bgColor, windowColor, result, name, fontPercent;
	
	    el = this.el();
	
	    textEdge = getSelectedOptionValue(el.querySelector('.vjs-edge-style select'));
	    fontFamily = getSelectedOptionValue(el.querySelector('.vjs-font-family select'));
	    fgColor = getSelectedOptionValue(el.querySelector('.vjs-fg-color > select'));
	    textOpacity = getSelectedOptionValue(el.querySelector('.vjs-text-opacity > select'));
	    bgColor = getSelectedOptionValue(el.querySelector('.vjs-bg-color > select'));
	    bgOpacity = getSelectedOptionValue(el.querySelector('.vjs-bg-opacity > select'));
	    windowColor = getSelectedOptionValue(el.querySelector('.window-color > select'));
	    windowOpacity = getSelectedOptionValue(el.querySelector('.vjs-window-opacity > select'));
	    fontPercent = window['parseFloat'](getSelectedOptionValue(el.querySelector('.vjs-font-percent > select')));
	
	    result = {
	      'backgroundOpacity': bgOpacity,
	      'textOpacity': textOpacity,
	      'windowOpacity': windowOpacity,
	      'edgeStyle': textEdge,
	      'fontFamily': fontFamily,
	      'color': fgColor,
	      'backgroundColor': bgColor,
	      'windowColor': windowColor,
	      'fontPercent': fontPercent
	    };
	    for (name in result) {
	      if (result[name] === '' || result[name] === 'none' || (name === 'fontPercent' && result[name] === 1.00)) {
	        delete result[name];
	      }
	    }
	    return result;
	  };
	
	  vjs.TextTrackSettings.prototype.setValues = function(values) {
	    var el = this.el(), fontPercent;
	
	    setSelectedOption(el.querySelector('.vjs-edge-style select'), values.edgeStyle);
	    setSelectedOption(el.querySelector('.vjs-font-family select'), values.fontFamily);
	    setSelectedOption(el.querySelector('.vjs-fg-color > select'), values.color);
	    setSelectedOption(el.querySelector('.vjs-text-opacity > select'), values.textOpacity);
	    setSelectedOption(el.querySelector('.vjs-bg-color > select'), values.backgroundColor);
	    setSelectedOption(el.querySelector('.vjs-bg-opacity > select'), values.backgroundOpacity);
	    setSelectedOption(el.querySelector('.window-color > select'), values.windowColor);
	    setSelectedOption(el.querySelector('.vjs-window-opacity > select'), values.windowOpacity);
	
	    fontPercent = values.fontPercent;
	
	    if (fontPercent) {
	      fontPercent = fontPercent.toFixed(2);
	    }
	
	    setSelectedOption(el.querySelector('.vjs-font-percent > select'), fontPercent);
	  };
	
	  vjs.TextTrackSettings.prototype.restoreSettings = function() {
	    var values;
	    try {
	      values = JSON.parse(window.localStorage.getItem('vjs-text-track-settings'));
	    } catch (e) {}
	
	    if (values) {
	      this.setValues(values);
	    }
	  };
	
	  vjs.TextTrackSettings.prototype.saveSettings = function() {
	    var values;
	
	    if (!this.player_.options()['persistTextTrackSettings']) {
	      return;
	    }
	
	    values = this.getValues();
	    try {
	      if (!vjs.isEmpty(values)) {
	        window.localStorage.setItem('vjs-text-track-settings', JSON.stringify(values));
	      } else {
	        window.localStorage.removeItem('vjs-text-track-settings');
	      }
	    } catch (e) {}
	  };
	
	  vjs.TextTrackSettings.prototype.updateDisplay = function() {
	    var ttDisplay = this.player_.getChild('textTrackDisplay');
	    if (ttDisplay) {
	      ttDisplay.updateDisplay();
	    }
	  };
	
	  function getSelectedOptionValue(target) {
	    var selectedOption;
	    // not all browsers support selectedOptions, so, fallback to options
	    if (target.selectedOptions) {
	      selectedOption = target.selectedOptions[0];
	    } else if (target.options) {
	      selectedOption = target.options[target.options.selectedIndex];
	    }
	
	    return selectedOption.value;
	  }
	
	  function setSelectedOption(target, value) {
	    var i, option;
	
	    if (!value) {
	      return;
	    }
	
	    for (i = 0; i < target.options.length; i++) {
	      option = target.options[i];
	      if (option.value === value) {
	        break;
	      }
	    }
	
	    target.selectedIndex = i;
	  }
	
	  function captionOptionsMenuTemplate() {
	    return '<div class="vjs-tracksettings">' +
	        '<div class="vjs-tracksettings-colors">' +
	          '<div class="vjs-fg-color vjs-tracksetting">' +
	              '<label class="vjs-label">Foreground</label>' +
	              '<select>' +
	                '<option value="">---</option>' +
	                '<option value="#FFF">White</option>' +
	                '<option value="#000">Black</option>' +
	                '<option value="#F00">Red</option>' +
	                '<option value="#0F0">Green</option>' +
	                '<option value="#00F">Blue</option>' +
	                '<option value="#FF0">Yellow</option>' +
	                '<option value="#F0F">Magenta</option>' +
	                '<option value="#0FF">Cyan</option>' +
	              '</select>' +
	              '<span class="vjs-text-opacity vjs-opacity">' +
	                '<select>' +
	                  '<option value="">---</option>' +
	                  '<option value="1">Opaque</option>' +
	                  '<option value="0.5">Semi-Opaque</option>' +
	                '</select>' +
	              '</span>' +
	          '</div>' + // vjs-fg-color
	          '<div class="vjs-bg-color vjs-tracksetting">' +
	              '<label class="vjs-label">Background</label>' +
	              '<select>' +
	                '<option value="">---</option>' +
	                '<option value="#FFF">White</option>' +
	                '<option value="#000">Black</option>' +
	                '<option value="#F00">Red</option>' +
	                '<option value="#0F0">Green</option>' +
	                '<option value="#00F">Blue</option>' +
	                '<option value="#FF0">Yellow</option>' +
	                '<option value="#F0F">Magenta</option>' +
	                '<option value="#0FF">Cyan</option>' +
	              '</select>' +
	              '<span class="vjs-bg-opacity vjs-opacity">' +
	                  '<select>' +
	                    '<option value="">---</option>' +
	                    '<option value="1">Opaque</option>' +
	                    '<option value="0.5">Semi-Transparent</option>' +
	                    '<option value="0">Transparent</option>' +
	                  '</select>' +
	              '</span>' +
	          '</div>' + // vjs-bg-color
	          '<div class="window-color vjs-tracksetting">' +
	              '<label class="vjs-label">Window</label>' +
	              '<select>' +
	                '<option value="">---</option>' +
	                '<option value="#FFF">White</option>' +
	                '<option value="#000">Black</option>' +
	                '<option value="#F00">Red</option>' +
	                '<option value="#0F0">Green</option>' +
	                '<option value="#00F">Blue</option>' +
	                '<option value="#FF0">Yellow</option>' +
	                '<option value="#F0F">Magenta</option>' +
	                '<option value="#0FF">Cyan</option>' +
	              '</select>' +
	              '<span class="vjs-window-opacity vjs-opacity">' +
	                  '<select>' +
	                    '<option value="">---</option>' +
	                    '<option value="1">Opaque</option>' +
	                    '<option value="0.5">Semi-Transparent</option>' +
	                    '<option value="0">Transparent</option>' +
	                  '</select>' +
	              '</span>' +
	          '</div>' + // vjs-window-color
	        '</div>' + // vjs-tracksettings
	        '<div class="vjs-tracksettings-font">' +
	          '<div class="vjs-font-percent vjs-tracksetting">' +
	            '<label class="vjs-label">Font Size</label>' +
	            '<select>' +
	              '<option value="0.50">50%</option>' +
	              '<option value="0.75">75%</option>' +
	              '<option value="1.00" selected>100%</option>' +
	              '<option value="1.25">125%</option>' +
	              '<option value="1.50">150%</option>' +
	              '<option value="1.75">175%</option>' +
	              '<option value="2.00">200%</option>' +
	              '<option value="3.00">300%</option>' +
	              '<option value="4.00">400%</option>' +
	            '</select>' +
	          '</div>' + // vjs-font-percent
	          '<div class="vjs-edge-style vjs-tracksetting">' +
	            '<label class="vjs-label">Text Edge Style</label>' +
	            '<select>' +
	              '<option value="none">None</option>' +
	              '<option value="raised">Raised</option>' +
	              '<option value="depressed">Depressed</option>' +
	              '<option value="uniform">Uniform</option>' +
	              '<option value="dropshadow">Dropshadow</option>' +
	            '</select>' +
	          '</div>' + // vjs-edge-style
	          '<div class="vjs-font-family vjs-tracksetting">' +
	            '<label class="vjs-label">Font Family</label>' +
	            '<select>' +
	              '<option value="">Default</option>' +
	              '<option value="monospaceSerif">Monospace Serif</option>' +
	              '<option value="proportionalSerif">Proportional Serif</option>' +
	              '<option value="monospaceSansSerif">Monospace Sans-Serif</option>' +
	              '<option value="proportionalSansSerif">Proportional Sans-Serif</option>' +
	              '<option value="casual">Casual</option>' +
	              '<option value="script">Script</option>' +
	              '<option value="small-caps">Small Caps</option>' +
	            '</select>' +
	          '</div>' + // vjs-font-family
	        '</div>' +
	      '</div>' +
	      '<div class="vjs-tracksettings-controls">' +
	        '<button class="vjs-default-button">Defaults</button>' +
	        '<button class="vjs-done-button">Done</button>' +
	      '</div>';
	  }
	
	})();
	/**
	 * @fileoverview Add JSON support
	 * @suppress {undefinedVars}
	 * (Compiler doesn't like JSON not being declared)
	 */
	
	/**
	 * Javascript JSON implementation
	 * (Parse Method Only)
	 * https://github.com/douglascrockford/JSON-js/blob/master/json2.js
	 * Only using for parse method when parsing data-setup attribute JSON.
	 * @suppress {undefinedVars}
	 * @namespace
	 * @private
	 */
	vjs.JSON;
	
	if (typeof window.JSON !== 'undefined' && typeof window.JSON.parse === 'function') {
	  vjs.JSON = window.JSON;
	
	} else {
	  vjs.JSON = {};
	
	  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	
	  /**
	   * parse the json
	   *
	   * @memberof vjs.JSON
	   * @param {String} text The JSON string to parse
	   * @param {Function=} [reviver] Optional function that can transform the results
	   * @return {Object|Array} The parsed JSON
	   */
	  vjs.JSON.parse = function (text, reviver) {
	      var j;
	
	      function walk(holder, key) {
	          var k, v, value = holder[key];
	          if (value && typeof value === 'object') {
	              for (k in value) {
	                  if (Object.prototype.hasOwnProperty.call(value, k)) {
	                      v = walk(value, k);
	                      if (v !== undefined) {
	                          value[k] = v;
	                      } else {
	                          delete value[k];
	                      }
	                  }
	              }
	          }
	          return reviver.call(holder, key, value);
	      }
	      text = String(text);
	      cx.lastIndex = 0;
	      if (cx.test(text)) {
	          text = text.replace(cx, function (a) {
	              return '\\u' +
	                  ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	          });
	      }
	
	      if (/^[\],:{}\s]*$/
	              .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
	                  .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
	                  .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
	
	          j = eval('(' + text + ')');
	
	          return typeof reviver === 'function' ?
	              walk({'': j}, '') : j;
	      }
	
	      throw new SyntaxError('JSON.parse(): invalid or malformed JSON data');
	  };
	}
	/**
	 * @fileoverview Functions for automatically setting up a player
	 * based on the data-setup attribute of the video tag
	 */
	
	// Automatically set up any tags that have a data-setup attribute
	vjs.autoSetup = function(){
	  var options, mediaEl, player, i, e;
	
	  // One day, when we stop supporting IE8, go back to this, but in the meantime...*hack hack hack*
	  // var vids = Array.prototype.slice.call(document.getElementsByTagName('video'));
	  // var audios = Array.prototype.slice.call(document.getElementsByTagName('audio'));
	  // var mediaEls = vids.concat(audios);
	
	  // Because IE8 doesn't support calling slice on a node list, we need to loop through each list of elements
	  // to build up a new, combined list of elements.
	  var vids = document.getElementsByTagName('video');
	  var audios = document.getElementsByTagName('audio');
	  var mediaEls = [];
	  if (vids && vids.length > 0) {
	    for(i=0, e=vids.length; i<e; i++) {
	      mediaEls.push(vids[i]);
	    }
	  }
	  if (audios && audios.length > 0) {
	    for(i=0, e=audios.length; i<e; i++) {
	      mediaEls.push(audios[i]);
	    }
	  }
	
	  // Check if any media elements exist
	  if (mediaEls && mediaEls.length > 0) {
	
	    for (i=0,e=mediaEls.length; i<e; i++) {
	      mediaEl = mediaEls[i];
	
	      // Check if element exists, has getAttribute func.
	      // IE seems to consider typeof el.getAttribute == 'object' instead of 'function' like expected, at least when loading the player immediately.
	      if (mediaEl && mediaEl.getAttribute) {
	
	        // Make sure this player hasn't already been set up.
	        if (mediaEl['player'] === undefined) {
	          options = mediaEl.getAttribute('data-setup');
	
	          // Check if data-setup attr exists.
	          // We only auto-setup if they've added the data-setup attr.
	          if (options !== null) {
	            // Create new video.js instance.
	            player = videojs(mediaEl);
	          }
	        }
	
	      // If getAttribute isn't defined, we need to wait for the DOM.
	      } else {
	        vjs.autoSetupTimeout(1);
	        break;
	      }
	    }
	
	  // No videos were found, so keep looping unless page is finished loading.
	  } else if (!vjs.windowLoaded) {
	    vjs.autoSetupTimeout(1);
	  }
	};
	
	// Pause to let the DOM keep processing
	vjs.autoSetupTimeout = function(wait){
	  setTimeout(vjs.autoSetup, wait);
	};
	
	if (document.readyState === 'complete') {
	  vjs.windowLoaded = true;
	} else {
	  vjs.one(window, 'load', function(){
	    vjs.windowLoaded = true;
	  });
	}
	
	// Run Auto-load players
	// You have to wait at least once in case this script is loaded after your video in the DOM (weird behavior only with minified version)
	vjs.autoSetupTimeout(1);
	/**
	 * the method for registering a video.js plugin
	 *
	 * @param  {String} name The name of the plugin
	 * @param  {Function} init The function that is run when the player inits
	 */
	vjs.plugin = function(name, init){
	  vjs.Player.prototype[name] = init;
	};
	
	/* vtt.js - v0.12.1 (https://github.com/mozilla/vtt.js) built on 08-07-2015 */
	
	(function(root) {
	  var vttjs = root.vttjs = {};
	  var cueShim = vttjs.VTTCue;
	  var regionShim = vttjs.VTTRegion;
	  var oldVTTCue = root.VTTCue;
	  var oldVTTRegion = root.VTTRegion;
	
	  vttjs.shim = function() {
	    vttjs.VTTCue = cueShim;
	    vttjs.VTTRegion = regionShim;
	  };
	
	  vttjs.restore = function() {
	    vttjs.VTTCue = oldVTTCue;
	    vttjs.VTTRegion = oldVTTRegion;
	  };
	}(this));
	
	/**
	 * Copyright 2013 vtt.js Contributors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	
	(function(root, vttjs) {
	
	  var autoKeyword = "auto";
	  var directionSetting = {
	    "": true,
	    "lr": true,
	    "rl": true
	  };
	  var alignSetting = {
	    "start": true,
	    "middle": true,
	    "end": true,
	    "left": true,
	    "right": true
	  };
	
	  function findDirectionSetting(value) {
	    if (typeof value !== "string") {
	      return false;
	    }
	    var dir = directionSetting[value.toLowerCase()];
	    return dir ? value.toLowerCase() : false;
	  }
	
	  function findAlignSetting(value) {
	    if (typeof value !== "string") {
	      return false;
	    }
	    var align = alignSetting[value.toLowerCase()];
	    return align ? value.toLowerCase() : false;
	  }
	
	  function extend(obj) {
	    var i = 1;
	    for (; i < arguments.length; i++) {
	      var cobj = arguments[i];
	      for (var p in cobj) {
	        obj[p] = cobj[p];
	      }
	    }
	
	    return obj;
	  }
	
	  function VTTCue(startTime, endTime, text) {
	    var cue = this;
	    var isIE8 = (/MSIE\s8\.0/).test(navigator.userAgent);
	    var baseObj = {};
	
	    if (isIE8) {
	      cue = document.createElement('custom');
	    } else {
	      baseObj.enumerable = true;
	    }
	
	    /**
	     * Shim implementation specific properties. These properties are not in
	     * the spec.
	     */
	
	    // Lets us know when the VTTCue's data has changed in such a way that we need
	    // to recompute its display state. This lets us compute its display state
	    // lazily.
	    cue.hasBeenReset = false;
	
	    /**
	     * VTTCue and TextTrackCue properties
	     * http://dev.w3.org/html5/webvtt/#vttcue-interface
	     */
	
	    var _id = "";
	    var _pauseOnExit = false;
	    var _startTime = startTime;
	    var _endTime = endTime;
	    var _text = text;
	    var _region = null;
	    var _vertical = "";
	    var _snapToLines = true;
	    var _line = "auto";
	    var _lineAlign = "start";
	    var _position = 50;
	    var _positionAlign = "middle";
	    var _size = 50;
	    var _align = "middle";
	
	    Object.defineProperty(cue,
	      "id", extend({}, baseObj, {
	        get: function() {
	          return _id;
	        },
	        set: function(value) {
	          _id = "" + value;
	        }
	      }));
	
	    Object.defineProperty(cue,
	      "pauseOnExit", extend({}, baseObj, {
	        get: function() {
	          return _pauseOnExit;
	        },
	        set: function(value) {
	          _pauseOnExit = !!value;
	        }
	      }));
	
	    Object.defineProperty(cue,
	      "startTime", extend({}, baseObj, {
	        get: function() {
	          return _startTime;
	        },
	        set: function(value) {
	          if (typeof value !== "number") {
	            throw new TypeError("Start time must be set to a number.");
	          }
	          _startTime = value;
	          this.hasBeenReset = true;
	        }
	      }));
	
	    Object.defineProperty(cue,
	      "endTime", extend({}, baseObj, {
	        get: function() {
	          return _endTime;
	        },
	        set: function(value) {
	          if (typeof value !== "number") {
	            throw new TypeError("End time must be set to a number.");
	          }
	          _endTime = value;
	          this.hasBeenReset = true;
	        }
	      }));
	
	    Object.defineProperty(cue,
	      "text", extend({}, baseObj, {
	        get: function() {
	          return _text;
	        },
	        set: function(value) {
	          _text = "" + value;
	          this.hasBeenReset = true;
	        }
	      }));
	
	    Object.defineProperty(cue,
	      "region", extend({}, baseObj, {
	        get: function() {
	          return _region;
	        },
	        set: function(value) {
	          _region = value;
	          this.hasBeenReset = true;
	        }
	      }));
	
	    Object.defineProperty(cue,
	      "vertical", extend({}, baseObj, {
	        get: function() {
	          return _vertical;
	        },
	        set: function(value) {
	          var setting = findDirectionSetting(value);
	          // Have to check for false because the setting an be an empty string.
	          if (setting === false) {
	            throw new SyntaxError("An invalid or illegal string was specified.");
	          }
	          _vertical = setting;
	          this.hasBeenReset = true;
	        }
	      }));
	
	    Object.defineProperty(cue,
	      "snapToLines", extend({}, baseObj, {
	        get: function() {
	          return _snapToLines;
	        },
	        set: function(value) {
	          _snapToLines = !!value;
	          this.hasBeenReset = true;
	        }
	      }));
	
	    Object.defineProperty(cue,
	      "line", extend({}, baseObj, {
	        get: function() {
	          return _line;
	        },
	        set: function(value) {
	          if (typeof value !== "number" && value !== autoKeyword) {
	            throw new SyntaxError("An invalid number or illegal string was specified.");
	          }
	          _line = value;
	          this.hasBeenReset = true;
	        }
	      }));
	
	    Object.defineProperty(cue,
	      "lineAlign", extend({}, baseObj, {
	        get: function() {
	          return _lineAlign;
	        },
	        set: function(value) {
	          var setting = findAlignSetting(value);
	          if (!setting) {
	            throw new SyntaxError("An invalid or illegal string was specified.");
	          }
	          _lineAlign = setting;
	          this.hasBeenReset = true;
	        }
	      }));
	
	    Object.defineProperty(cue,
	      "position", extend({}, baseObj, {
	        get: function() {
	          return _position;
	        },
	        set: function(value) {
	          if (value < 0 || value > 100) {
	            throw new Error("Position must be between 0 and 100.");
	          }
	          _position = value;
	          this.hasBeenReset = true;
	        }
	      }));
	
	    Object.defineProperty(cue,
	      "positionAlign", extend({}, baseObj, {
	        get: function() {
	          return _positionAlign;
	        },
	        set: function(value) {
	          var setting = findAlignSetting(value);
	          if (!setting) {
	            throw new SyntaxError("An invalid or illegal string was specified.");
	          }
	          _positionAlign = setting;
	          this.hasBeenReset = true;
	        }
	      }));
	
	    Object.defineProperty(cue,
	      "size", extend({}, baseObj, {
	        get: function() {
	          return _size;
	        },
	        set: function(value) {
	          if (value < 0 || value > 100) {
	            throw new Error("Size must be between 0 and 100.");
	          }
	          _size = value;
	          this.hasBeenReset = true;
	        }
	      }));
	
	    Object.defineProperty(cue,
	      "align", extend({}, baseObj, {
	        get: function() {
	          return _align;
	        },
	        set: function(value) {
	          var setting = findAlignSetting(value);
	          if (!setting) {
	            throw new SyntaxError("An invalid or illegal string was specified.");
	          }
	          _align = setting;
	          this.hasBeenReset = true;
	        }
	      }));
	
	    /**
	     * Other <track> spec defined properties
	     */
	
	    // http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#text-track-cue-display-state
	    cue.displayState = undefined;
	
	    if (isIE8) {
	      return cue;
	    }
	  }
	
	  /**
	   * VTTCue methods
	   */
	
	  VTTCue.prototype.getCueAsHTML = function() {
	    // Assume WebVTT.convertCueToDOMTree is on the global.
	    return WebVTT.convertCueToDOMTree(window, this.text);
	  };
	
	  root.VTTCue = root.VTTCue || VTTCue;
	  vttjs.VTTCue = VTTCue;
	}(this, (this.vttjs || {})));
	
	/**
	 * Copyright 2013 vtt.js Contributors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	
	(function(root, vttjs) {
	
	  var scrollSetting = {
	    "": true,
	    "up": true
	  };
	
	  function findScrollSetting(value) {
	    if (typeof value !== "string") {
	      return false;
	    }
	    var scroll = scrollSetting[value.toLowerCase()];
	    return scroll ? value.toLowerCase() : false;
	  }
	
	  function isValidPercentValue(value) {
	    return typeof value === "number" && (value >= 0 && value <= 100);
	  }
	
	  // VTTRegion shim http://dev.w3.org/html5/webvtt/#vttregion-interface
	  function VTTRegion() {
	    var _width = 100;
	    var _lines = 3;
	    var _regionAnchorX = 0;
	    var _regionAnchorY = 100;
	    var _viewportAnchorX = 0;
	    var _viewportAnchorY = 100;
	    var _scroll = "";
	
	    Object.defineProperties(this, {
	      "width": {
	        enumerable: true,
	        get: function() {
	          return _width;
	        },
	        set: function(value) {
	          if (!isValidPercentValue(value)) {
	            throw new Error("Width must be between 0 and 100.");
	          }
	          _width = value;
	        }
	      },
	      "lines": {
	        enumerable: true,
	        get: function() {
	          return _lines;
	        },
	        set: function(value) {
	          if (typeof value !== "number") {
	            throw new TypeError("Lines must be set to a number.");
	          }
	          _lines = value;
	        }
	      },
	      "regionAnchorY": {
	        enumerable: true,
	        get: function() {
	          return _regionAnchorY;
	        },
	        set: function(value) {
	          if (!isValidPercentValue(value)) {
	            throw new Error("RegionAnchorX must be between 0 and 100.");
	          }
	          _regionAnchorY = value;
	        }
	      },
	      "regionAnchorX": {
	        enumerable: true,
	        get: function() {
	          return _regionAnchorX;
	        },
	        set: function(value) {
	          if(!isValidPercentValue(value)) {
	            throw new Error("RegionAnchorY must be between 0 and 100.");
	          }
	          _regionAnchorX = value;
	        }
	      },
	      "viewportAnchorY": {
	        enumerable: true,
	        get: function() {
	          return _viewportAnchorY;
	        },
	        set: function(value) {
	          if (!isValidPercentValue(value)) {
	            throw new Error("ViewportAnchorY must be between 0 and 100.");
	          }
	          _viewportAnchorY = value;
	        }
	      },
	      "viewportAnchorX": {
	        enumerable: true,
	        get: function() {
	          return _viewportAnchorX;
	        },
	        set: function(value) {
	          if (!isValidPercentValue(value)) {
	            throw new Error("ViewportAnchorX must be between 0 and 100.");
	          }
	          _viewportAnchorX = value;
	        }
	      },
	      "scroll": {
	        enumerable: true,
	        get: function() {
	          return _scroll;
	        },
	        set: function(value) {
	          var setting = findScrollSetting(value);
	          // Have to check for false as an empty string is a legal value.
	          if (setting === false) {
	            throw new SyntaxError("An invalid or illegal string was specified.");
	          }
	          _scroll = setting;
	        }
	      }
	    });
	  }
	
	  root.VTTRegion = root.VTTRegion || VTTRegion;
	  vttjs.VTTRegion = VTTRegion;
	}(this, (this.vttjs || {})));
	
	/**
	 * Copyright 2013 vtt.js Contributors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	
	/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
	/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
	
	(function(global) {
	
	  var _objCreate = Object.create || (function() {
	    function F() {}
	    return function(o) {
	      if (arguments.length !== 1) {
	        throw new Error('Object.create shim only accepts one parameter.');
	      }
	      F.prototype = o;
	      return new F();
	    };
	  })();
	
	  // Creates a new ParserError object from an errorData object. The errorData
	  // object should have default code and message properties. The default message
	  // property can be overriden by passing in a message parameter.
	  // See ParsingError.Errors below for acceptable errors.
	  function ParsingError(errorData, message) {
	    this.name = "ParsingError";
	    this.code = errorData.code;
	    this.message = message || errorData.message;
	  }
	  ParsingError.prototype = _objCreate(Error.prototype);
	  ParsingError.prototype.constructor = ParsingError;
	
	  // ParsingError metadata for acceptable ParsingErrors.
	  ParsingError.Errors = {
	    BadSignature: {
	      code: 0,
	      message: "Malformed WebVTT signature."
	    },
	    BadTimeStamp: {
	      code: 1,
	      message: "Malformed time stamp."
	    }
	  };
	
	  // Try to parse input as a time stamp.
	  function parseTimeStamp(input) {
	
	    function computeSeconds(h, m, s, f) {
	      return (h | 0) * 3600 + (m | 0) * 60 + (s | 0) + (f | 0) / 1000;
	    }
	
	    var m = input.match(/^(\d+):(\d{2})(:\d{2})?\.(\d{3})/);
	    if (!m) {
	      return null;
	    }
	
	    if (m[3]) {
	      // Timestamp takes the form of [hours]:[minutes]:[seconds].[milliseconds]
	      return computeSeconds(m[1], m[2], m[3].replace(":", ""), m[4]);
	    } else if (m[1] > 59) {
	      // Timestamp takes the form of [hours]:[minutes].[milliseconds]
	      // First position is hours as it's over 59.
	      return computeSeconds(m[1], m[2], 0,  m[4]);
	    } else {
	      // Timestamp takes the form of [minutes]:[seconds].[milliseconds]
	      return computeSeconds(0, m[1], m[2], m[4]);
	    }
	  }
	
	  // A settings object holds key/value pairs and will ignore anything but the first
	  // assignment to a specific key.
	  function Settings() {
	    this.values = _objCreate(null);
	  }
	
	  Settings.prototype = {
	    // Only accept the first assignment to any key.
	    set: function(k, v) {
	      if (!this.get(k) && v !== "") {
	        this.values[k] = v;
	      }
	    },
	    // Return the value for a key, or a default value.
	    // If 'defaultKey' is passed then 'dflt' is assumed to be an object with
	    // a number of possible default values as properties where 'defaultKey' is
	    // the key of the property that will be chosen; otherwise it's assumed to be
	    // a single value.
	    get: function(k, dflt, defaultKey) {
	      if (defaultKey) {
	        return this.has(k) ? this.values[k] : dflt[defaultKey];
	      }
	      return this.has(k) ? this.values[k] : dflt;
	    },
	    // Check whether we have a value for a key.
	    has: function(k) {
	      return k in this.values;
	    },
	    // Accept a setting if its one of the given alternatives.
	    alt: function(k, v, a) {
	      for (var n = 0; n < a.length; ++n) {
	        if (v === a[n]) {
	          this.set(k, v);
	          break;
	        }
	      }
	    },
	    // Accept a setting if its a valid (signed) integer.
	    integer: function(k, v) {
	      if (/^-?\d+$/.test(v)) { // integer
	        this.set(k, parseInt(v, 10));
	      }
	    },
	    // Accept a setting if its a valid percentage.
	    percent: function(k, v) {
	      var m;
	      if ((m = v.match(/^([\d]{1,3})(\.[\d]*)?%$/))) {
	        v = parseFloat(v);
	        if (v >= 0 && v <= 100) {
	          this.set(k, v);
	          return true;
	        }
	      }
	      return false;
	    }
	  };
	
	  // Helper function to parse input into groups separated by 'groupDelim', and
	  // interprete each group as a key/value pair separated by 'keyValueDelim'.
	  function parseOptions(input, callback, keyValueDelim, groupDelim) {
	    var groups = groupDelim ? input.split(groupDelim) : [input];
	    for (var i in groups) {
	      if (typeof groups[i] !== "string") {
	        continue;
	      }
	      var kv = groups[i].split(keyValueDelim);
	      if (kv.length !== 2) {
	        continue;
	      }
	      var k = kv[0];
	      var v = kv[1];
	      callback(k, v);
	    }
	  }
	
	  function parseCue(input, cue, regionList) {
	    // Remember the original input if we need to throw an error.
	    var oInput = input;
	    // 4.1 WebVTT timestamp
	    function consumeTimeStamp() {
	      var ts = parseTimeStamp(input);
	      if (ts === null) {
	        throw new ParsingError(ParsingError.Errors.BadTimeStamp,
	                              "Malformed timestamp: " + oInput);
	      }
	      // Remove time stamp from input.
	      input = input.replace(/^[^\sa-zA-Z-]+/, "");
	      return ts;
	    }
	
	    // 4.4.2 WebVTT cue settings
	    function consumeCueSettings(input, cue) {
	      var settings = new Settings();
	
	      parseOptions(input, function (k, v) {
	        switch (k) {
	        case "region":
	          // Find the last region we parsed with the same region id.
	          for (var i = regionList.length - 1; i >= 0; i--) {
	            if (regionList[i].id === v) {
	              settings.set(k, regionList[i].region);
	              break;
	            }
	          }
	          break;
	        case "vertical":
	          settings.alt(k, v, ["rl", "lr"]);
	          break;
	        case "line":
	          var vals = v.split(","),
	              vals0 = vals[0];
	          settings.integer(k, vals0);
	          settings.percent(k, vals0) ? settings.set("snapToLines", false) : null;
	          settings.alt(k, vals0, ["auto"]);
	          if (vals.length === 2) {
	            settings.alt("lineAlign", vals[1], ["start", "middle", "end"]);
	          }
	          break;
	        case "position":
	          vals = v.split(",");
	          settings.percent(k, vals[0]);
	          if (vals.length === 2) {
	            settings.alt("positionAlign", vals[1], ["start", "middle", "end"]);
	          }
	          break;
	        case "size":
	          settings.percent(k, v);
	          break;
	        case "align":
	          settings.alt(k, v, ["start", "middle", "end", "left", "right"]);
	          break;
	        }
	      }, /:/, /\s/);
	
	      // Apply default values for any missing fields.
	      cue.region = settings.get("region", null);
	      cue.vertical = settings.get("vertical", "");
	      cue.line = settings.get("line", "auto");
	      cue.lineAlign = settings.get("lineAlign", "start");
	      cue.snapToLines = settings.get("snapToLines", true);
	      cue.size = settings.get("size", 100);
	      cue.align = settings.get("align", "middle");
	      cue.position = settings.get("position", {
	        start: 0,
	        left: 0,
	        middle: 50,
	        end: 100,
	        right: 100
	      }, cue.align);
	      cue.positionAlign = settings.get("positionAlign", {
	        start: "start",
	        left: "start",
	        middle: "middle",
	        end: "end",
	        right: "end"
	      }, cue.align);
	    }
	
	    function skipWhitespace() {
	      input = input.replace(/^\s+/, "");
	    }
	
	    // 4.1 WebVTT cue timings.
	    skipWhitespace();
	    cue.startTime = consumeTimeStamp();   // (1) collect cue start time
	    skipWhitespace();
	    if (input.substr(0, 3) !== "-->") {     // (3) next characters must match "-->"
	      throw new ParsingError(ParsingError.Errors.BadTimeStamp,
	                             "Malformed time stamp (time stamps must be separated by '-->'): " +
	                             oInput);
	    }
	    input = input.substr(3);
	    skipWhitespace();
	    cue.endTime = consumeTimeStamp();     // (5) collect cue end time
	
	    // 4.1 WebVTT cue settings list.
	    skipWhitespace();
	    consumeCueSettings(input, cue);
	  }
	
	  var ESCAPE = {
	    "&amp;": "&",
	    "&lt;": "<",
	    "&gt;": ">",
	    "&lrm;": "\u200e",
	    "&rlm;": "\u200f",
	    "&nbsp;": "\u00a0"
	  };
	
	  var TAG_NAME = {
	    c: "span",
	    i: "i",
	    b: "b",
	    u: "u",
	    ruby: "ruby",
	    rt: "rt",
	    v: "span",
	    lang: "span"
	  };
	
	  var TAG_ANNOTATION = {
	    v: "title",
	    lang: "lang"
	  };
	
	  var NEEDS_PARENT = {
	    rt: "ruby"
	  };
	
	  // Parse content into a document fragment.
	  function parseContent(window, input) {
	    function nextToken() {
	      // Check for end-of-string.
	      if (!input) {
	        return null;
	      }
	
	      // Consume 'n' characters from the input.
	      function consume(result) {
	        input = input.substr(result.length);
	        return result;
	      }
	
	      var m = input.match(/^([^<]*)(<[^>]+>?)?/);
	      // If there is some text before the next tag, return it, otherwise return
	      // the tag.
	      return consume(m[1] ? m[1] : m[2]);
	    }
	
	    // Unescape a string 's'.
	    function unescape1(e) {
	      return ESCAPE[e];
	    }
	    function unescape(s) {
	      while ((m = s.match(/&(amp|lt|gt|lrm|rlm|nbsp);/))) {
	        s = s.replace(m[0], unescape1);
	      }
	      return s;
	    }
	
	    function shouldAdd(current, element) {
	      return !NEEDS_PARENT[element.localName] ||
	             NEEDS_PARENT[element.localName] === current.localName;
	    }
	
	    // Create an element for this tag.
	    function createElement(type, annotation) {
	      var tagName = TAG_NAME[type];
	      if (!tagName) {
	        return null;
	      }
	      var element = window.document.createElement(tagName);
	      element.localName = tagName;
	      var name = TAG_ANNOTATION[type];
	      if (name && annotation) {
	        element[name] = annotation.trim();
	      }
	      return element;
	    }
	
	    var rootDiv = window.document.createElement("div"),
	        current = rootDiv,
	        t,
	        tagStack = [];
	
	    while ((t = nextToken()) !== null) {
	      if (t[0] === '<') {
	        if (t[1] === "/") {
	          // If the closing tag matches, move back up to the parent node.
	          if (tagStack.length &&
	              tagStack[tagStack.length - 1] === t.substr(2).replace(">", "")) {
	            tagStack.pop();
	            current = current.parentNode;
	          }
	          // Otherwise just ignore the end tag.
	          continue;
	        }
	        var ts = parseTimeStamp(t.substr(1, t.length - 2));
	        var node;
	        if (ts) {
	          // Timestamps are lead nodes as well.
	          node = window.document.createProcessingInstruction("timestamp", ts);
	          current.appendChild(node);
	          continue;
	        }
	        var m = t.match(/^<([^.\s/0-9>]+)(\.[^\s\\>]+)?([^>\\]+)?(\\?)>?$/);
	        // If we can't parse the tag, skip to the next tag.
	        if (!m) {
	          continue;
	        }
	        // Try to construct an element, and ignore the tag if we couldn't.
	        node = createElement(m[1], m[3]);
	        if (!node) {
	          continue;
	        }
	        // Determine if the tag should be added based on the context of where it
	        // is placed in the cuetext.
	        if (!shouldAdd(current, node)) {
	          continue;
	        }
	        // Set the class list (as a list of classes, separated by space).
	        if (m[2]) {
	          node.className = m[2].substr(1).replace('.', ' ');
	        }
	        // Append the node to the current node, and enter the scope of the new
	        // node.
	        tagStack.push(m[1]);
	        current.appendChild(node);
	        current = node;
	        continue;
	      }
	
	      // Text nodes are leaf nodes.
	      current.appendChild(window.document.createTextNode(unescape(t)));
	    }
	
	    return rootDiv;
	  }
	
	  // This is a list of all the Unicode characters that have a strong
	  // right-to-left category. What this means is that these characters are
	  // written right-to-left for sure. It was generated by pulling all the strong
	  // right-to-left characters out of the Unicode data table. That table can
	  // found at: http://www.unicode.org/Public/UNIDATA/UnicodeData.txt
	  var strongRTLChars = [0x05BE, 0x05C0, 0x05C3, 0x05C6, 0x05D0, 0x05D1,
	      0x05D2, 0x05D3, 0x05D4, 0x05D5, 0x05D6, 0x05D7, 0x05D8, 0x05D9, 0x05DA,
	      0x05DB, 0x05DC, 0x05DD, 0x05DE, 0x05DF, 0x05E0, 0x05E1, 0x05E2, 0x05E3,
	      0x05E4, 0x05E5, 0x05E6, 0x05E7, 0x05E8, 0x05E9, 0x05EA, 0x05F0, 0x05F1,
	      0x05F2, 0x05F3, 0x05F4, 0x0608, 0x060B, 0x060D, 0x061B, 0x061E, 0x061F,
	      0x0620, 0x0621, 0x0622, 0x0623, 0x0624, 0x0625, 0x0626, 0x0627, 0x0628,
	      0x0629, 0x062A, 0x062B, 0x062C, 0x062D, 0x062E, 0x062F, 0x0630, 0x0631,
	      0x0632, 0x0633, 0x0634, 0x0635, 0x0636, 0x0637, 0x0638, 0x0639, 0x063A,
	      0x063B, 0x063C, 0x063D, 0x063E, 0x063F, 0x0640, 0x0641, 0x0642, 0x0643,
	      0x0644, 0x0645, 0x0646, 0x0647, 0x0648, 0x0649, 0x064A, 0x066D, 0x066E,
	      0x066F, 0x0671, 0x0672, 0x0673, 0x0674, 0x0675, 0x0676, 0x0677, 0x0678,
	      0x0679, 0x067A, 0x067B, 0x067C, 0x067D, 0x067E, 0x067F, 0x0680, 0x0681,
	      0x0682, 0x0683, 0x0684, 0x0685, 0x0686, 0x0687, 0x0688, 0x0689, 0x068A,
	      0x068B, 0x068C, 0x068D, 0x068E, 0x068F, 0x0690, 0x0691, 0x0692, 0x0693,
	      0x0694, 0x0695, 0x0696, 0x0697, 0x0698, 0x0699, 0x069A, 0x069B, 0x069C,
	      0x069D, 0x069E, 0x069F, 0x06A0, 0x06A1, 0x06A2, 0x06A3, 0x06A4, 0x06A5,
	      0x06A6, 0x06A7, 0x06A8, 0x06A9, 0x06AA, 0x06AB, 0x06AC, 0x06AD, 0x06AE,
	      0x06AF, 0x06B0, 0x06B1, 0x06B2, 0x06B3, 0x06B4, 0x06B5, 0x06B6, 0x06B7,
	      0x06B8, 0x06B9, 0x06BA, 0x06BB, 0x06BC, 0x06BD, 0x06BE, 0x06BF, 0x06C0,
	      0x06C1, 0x06C2, 0x06C3, 0x06C4, 0x06C5, 0x06C6, 0x06C7, 0x06C8, 0x06C9,
	      0x06CA, 0x06CB, 0x06CC, 0x06CD, 0x06CE, 0x06CF, 0x06D0, 0x06D1, 0x06D2,
	      0x06D3, 0x06D4, 0x06D5, 0x06E5, 0x06E6, 0x06EE, 0x06EF, 0x06FA, 0x06FB,
	      0x06FC, 0x06FD, 0x06FE, 0x06FF, 0x0700, 0x0701, 0x0702, 0x0703, 0x0704,
	      0x0705, 0x0706, 0x0707, 0x0708, 0x0709, 0x070A, 0x070B, 0x070C, 0x070D,
	      0x070F, 0x0710, 0x0712, 0x0713, 0x0714, 0x0715, 0x0716, 0x0717, 0x0718,
	      0x0719, 0x071A, 0x071B, 0x071C, 0x071D, 0x071E, 0x071F, 0x0720, 0x0721,
	      0x0722, 0x0723, 0x0724, 0x0725, 0x0726, 0x0727, 0x0728, 0x0729, 0x072A,
	      0x072B, 0x072C, 0x072D, 0x072E, 0x072F, 0x074D, 0x074E, 0x074F, 0x0750,
	      0x0751, 0x0752, 0x0753, 0x0754, 0x0755, 0x0756, 0x0757, 0x0758, 0x0759,
	      0x075A, 0x075B, 0x075C, 0x075D, 0x075E, 0x075F, 0x0760, 0x0761, 0x0762,
	      0x0763, 0x0764, 0x0765, 0x0766, 0x0767, 0x0768, 0x0769, 0x076A, 0x076B,
	      0x076C, 0x076D, 0x076E, 0x076F, 0x0770, 0x0771, 0x0772, 0x0773, 0x0774,
	      0x0775, 0x0776, 0x0777, 0x0778, 0x0779, 0x077A, 0x077B, 0x077C, 0x077D,
	      0x077E, 0x077F, 0x0780, 0x0781, 0x0782, 0x0783, 0x0784, 0x0785, 0x0786,
	      0x0787, 0x0788, 0x0789, 0x078A, 0x078B, 0x078C, 0x078D, 0x078E, 0x078F,
	      0x0790, 0x0791, 0x0792, 0x0793, 0x0794, 0x0795, 0x0796, 0x0797, 0x0798,
	      0x0799, 0x079A, 0x079B, 0x079C, 0x079D, 0x079E, 0x079F, 0x07A0, 0x07A1,
	      0x07A2, 0x07A3, 0x07A4, 0x07A5, 0x07B1, 0x07C0, 0x07C1, 0x07C2, 0x07C3,
	      0x07C4, 0x07C5, 0x07C6, 0x07C7, 0x07C8, 0x07C9, 0x07CA, 0x07CB, 0x07CC,
	      0x07CD, 0x07CE, 0x07CF, 0x07D0, 0x07D1, 0x07D2, 0x07D3, 0x07D4, 0x07D5,
	      0x07D6, 0x07D7, 0x07D8, 0x07D9, 0x07DA, 0x07DB, 0x07DC, 0x07DD, 0x07DE,
	      0x07DF, 0x07E0, 0x07E1, 0x07E2, 0x07E3, 0x07E4, 0x07E5, 0x07E6, 0x07E7,
	      0x07E8, 0x07E9, 0x07EA, 0x07F4, 0x07F5, 0x07FA, 0x0800, 0x0801, 0x0802,
	      0x0803, 0x0804, 0x0805, 0x0806, 0x0807, 0x0808, 0x0809, 0x080A, 0x080B,
	      0x080C, 0x080D, 0x080E, 0x080F, 0x0810, 0x0811, 0x0812, 0x0813, 0x0814,
	      0x0815, 0x081A, 0x0824, 0x0828, 0x0830, 0x0831, 0x0832, 0x0833, 0x0834,
	      0x0835, 0x0836, 0x0837, 0x0838, 0x0839, 0x083A, 0x083B, 0x083C, 0x083D,
	      0x083E, 0x0840, 0x0841, 0x0842, 0x0843, 0x0844, 0x0845, 0x0846, 0x0847,
	      0x0848, 0x0849, 0x084A, 0x084B, 0x084C, 0x084D, 0x084E, 0x084F, 0x0850,
	      0x0851, 0x0852, 0x0853, 0x0854, 0x0855, 0x0856, 0x0857, 0x0858, 0x085E,
	      0x08A0, 0x08A2, 0x08A3, 0x08A4, 0x08A5, 0x08A6, 0x08A7, 0x08A8, 0x08A9,
	      0x08AA, 0x08AB, 0x08AC, 0x200F, 0xFB1D, 0xFB1F, 0xFB20, 0xFB21, 0xFB22,
	      0xFB23, 0xFB24, 0xFB25, 0xFB26, 0xFB27, 0xFB28, 0xFB2A, 0xFB2B, 0xFB2C,
	      0xFB2D, 0xFB2E, 0xFB2F, 0xFB30, 0xFB31, 0xFB32, 0xFB33, 0xFB34, 0xFB35,
	      0xFB36, 0xFB38, 0xFB39, 0xFB3A, 0xFB3B, 0xFB3C, 0xFB3E, 0xFB40, 0xFB41,
	      0xFB43, 0xFB44, 0xFB46, 0xFB47, 0xFB48, 0xFB49, 0xFB4A, 0xFB4B, 0xFB4C,
	      0xFB4D, 0xFB4E, 0xFB4F, 0xFB50, 0xFB51, 0xFB52, 0xFB53, 0xFB54, 0xFB55,
	      0xFB56, 0xFB57, 0xFB58, 0xFB59, 0xFB5A, 0xFB5B, 0xFB5C, 0xFB5D, 0xFB5E,
	      0xFB5F, 0xFB60, 0xFB61, 0xFB62, 0xFB63, 0xFB64, 0xFB65, 0xFB66, 0xFB67,
	      0xFB68, 0xFB69, 0xFB6A, 0xFB6B, 0xFB6C, 0xFB6D, 0xFB6E, 0xFB6F, 0xFB70,
	      0xFB71, 0xFB72, 0xFB73, 0xFB74, 0xFB75, 0xFB76, 0xFB77, 0xFB78, 0xFB79,
	      0xFB7A, 0xFB7B, 0xFB7C, 0xFB7D, 0xFB7E, 0xFB7F, 0xFB80, 0xFB81, 0xFB82,
	      0xFB83, 0xFB84, 0xFB85, 0xFB86, 0xFB87, 0xFB88, 0xFB89, 0xFB8A, 0xFB8B,
	      0xFB8C, 0xFB8D, 0xFB8E, 0xFB8F, 0xFB90, 0xFB91, 0xFB92, 0xFB93, 0xFB94,
	      0xFB95, 0xFB96, 0xFB97, 0xFB98, 0xFB99, 0xFB9A, 0xFB9B, 0xFB9C, 0xFB9D,
	      0xFB9E, 0xFB9F, 0xFBA0, 0xFBA1, 0xFBA2, 0xFBA3, 0xFBA4, 0xFBA5, 0xFBA6,
	      0xFBA7, 0xFBA8, 0xFBA9, 0xFBAA, 0xFBAB, 0xFBAC, 0xFBAD, 0xFBAE, 0xFBAF,
	      0xFBB0, 0xFBB1, 0xFBB2, 0xFBB3, 0xFBB4, 0xFBB5, 0xFBB6, 0xFBB7, 0xFBB8,
	      0xFBB9, 0xFBBA, 0xFBBB, 0xFBBC, 0xFBBD, 0xFBBE, 0xFBBF, 0xFBC0, 0xFBC1,
	      0xFBD3, 0xFBD4, 0xFBD5, 0xFBD6, 0xFBD7, 0xFBD8, 0xFBD9, 0xFBDA, 0xFBDB,
	      0xFBDC, 0xFBDD, 0xFBDE, 0xFBDF, 0xFBE0, 0xFBE1, 0xFBE2, 0xFBE3, 0xFBE4,
	      0xFBE5, 0xFBE6, 0xFBE7, 0xFBE8, 0xFBE9, 0xFBEA, 0xFBEB, 0xFBEC, 0xFBED,
	      0xFBEE, 0xFBEF, 0xFBF0, 0xFBF1, 0xFBF2, 0xFBF3, 0xFBF4, 0xFBF5, 0xFBF6,
	      0xFBF7, 0xFBF8, 0xFBF9, 0xFBFA, 0xFBFB, 0xFBFC, 0xFBFD, 0xFBFE, 0xFBFF,
	      0xFC00, 0xFC01, 0xFC02, 0xFC03, 0xFC04, 0xFC05, 0xFC06, 0xFC07, 0xFC08,
	      0xFC09, 0xFC0A, 0xFC0B, 0xFC0C, 0xFC0D, 0xFC0E, 0xFC0F, 0xFC10, 0xFC11,
	      0xFC12, 0xFC13, 0xFC14, 0xFC15, 0xFC16, 0xFC17, 0xFC18, 0xFC19, 0xFC1A,
	      0xFC1B, 0xFC1C, 0xFC1D, 0xFC1E, 0xFC1F, 0xFC20, 0xFC21, 0xFC22, 0xFC23,
	      0xFC24, 0xFC25, 0xFC26, 0xFC27, 0xFC28, 0xFC29, 0xFC2A, 0xFC2B, 0xFC2C,
	      0xFC2D, 0xFC2E, 0xFC2F, 0xFC30, 0xFC31, 0xFC32, 0xFC33, 0xFC34, 0xFC35,
	      0xFC36, 0xFC37, 0xFC38, 0xFC39, 0xFC3A, 0xFC3B, 0xFC3C, 0xFC3D, 0xFC3E,
	      0xFC3F, 0xFC40, 0xFC41, 0xFC42, 0xFC43, 0xFC44, 0xFC45, 0xFC46, 0xFC47,
	      0xFC48, 0xFC49, 0xFC4A, 0xFC4B, 0xFC4C, 0xFC4D, 0xFC4E, 0xFC4F, 0xFC50,
	      0xFC51, 0xFC52, 0xFC53, 0xFC54, 0xFC55, 0xFC56, 0xFC57, 0xFC58, 0xFC59,
	      0xFC5A, 0xFC5B, 0xFC5C, 0xFC5D, 0xFC5E, 0xFC5F, 0xFC60, 0xFC61, 0xFC62,
	      0xFC63, 0xFC64, 0xFC65, 0xFC66, 0xFC67, 0xFC68, 0xFC69, 0xFC6A, 0xFC6B,
	      0xFC6C, 0xFC6D, 0xFC6E, 0xFC6F, 0xFC70, 0xFC71, 0xFC72, 0xFC73, 0xFC74,
	      0xFC75, 0xFC76, 0xFC77, 0xFC78, 0xFC79, 0xFC7A, 0xFC7B, 0xFC7C, 0xFC7D,
	      0xFC7E, 0xFC7F, 0xFC80, 0xFC81, 0xFC82, 0xFC83, 0xFC84, 0xFC85, 0xFC86,
	      0xFC87, 0xFC88, 0xFC89, 0xFC8A, 0xFC8B, 0xFC8C, 0xFC8D, 0xFC8E, 0xFC8F,
	      0xFC90, 0xFC91, 0xFC92, 0xFC93, 0xFC94, 0xFC95, 0xFC96, 0xFC97, 0xFC98,
	      0xFC99, 0xFC9A, 0xFC9B, 0xFC9C, 0xFC9D, 0xFC9E, 0xFC9F, 0xFCA0, 0xFCA1,
	      0xFCA2, 0xFCA3, 0xFCA4, 0xFCA5, 0xFCA6, 0xFCA7, 0xFCA8, 0xFCA9, 0xFCAA,
	      0xFCAB, 0xFCAC, 0xFCAD, 0xFCAE, 0xFCAF, 0xFCB0, 0xFCB1, 0xFCB2, 0xFCB3,
	      0xFCB4, 0xFCB5, 0xFCB6, 0xFCB7, 0xFCB8, 0xFCB9, 0xFCBA, 0xFCBB, 0xFCBC,
	      0xFCBD, 0xFCBE, 0xFCBF, 0xFCC0, 0xFCC1, 0xFCC2, 0xFCC3, 0xFCC4, 0xFCC5,
	      0xFCC6, 0xFCC7, 0xFCC8, 0xFCC9, 0xFCCA, 0xFCCB, 0xFCCC, 0xFCCD, 0xFCCE,
	      0xFCCF, 0xFCD0, 0xFCD1, 0xFCD2, 0xFCD3, 0xFCD4, 0xFCD5, 0xFCD6, 0xFCD7,
	      0xFCD8, 0xFCD9, 0xFCDA, 0xFCDB, 0xFCDC, 0xFCDD, 0xFCDE, 0xFCDF, 0xFCE0,
	      0xFCE1, 0xFCE2, 0xFCE3, 0xFCE4, 0xFCE5, 0xFCE6, 0xFCE7, 0xFCE8, 0xFCE9,
	      0xFCEA, 0xFCEB, 0xFCEC, 0xFCED, 0xFCEE, 0xFCEF, 0xFCF0, 0xFCF1, 0xFCF2,
	      0xFCF3, 0xFCF4, 0xFCF5, 0xFCF6, 0xFCF7, 0xFCF8, 0xFCF9, 0xFCFA, 0xFCFB,
	      0xFCFC, 0xFCFD, 0xFCFE, 0xFCFF, 0xFD00, 0xFD01, 0xFD02, 0xFD03, 0xFD04,
	      0xFD05, 0xFD06, 0xFD07, 0xFD08, 0xFD09, 0xFD0A, 0xFD0B, 0xFD0C, 0xFD0D,
	      0xFD0E, 0xFD0F, 0xFD10, 0xFD11, 0xFD12, 0xFD13, 0xFD14, 0xFD15, 0xFD16,
	      0xFD17, 0xFD18, 0xFD19, 0xFD1A, 0xFD1B, 0xFD1C, 0xFD1D, 0xFD1E, 0xFD1F,
	      0xFD20, 0xFD21, 0xFD22, 0xFD23, 0xFD24, 0xFD25, 0xFD26, 0xFD27, 0xFD28,
	      0xFD29, 0xFD2A, 0xFD2B, 0xFD2C, 0xFD2D, 0xFD2E, 0xFD2F, 0xFD30, 0xFD31,
	      0xFD32, 0xFD33, 0xFD34, 0xFD35, 0xFD36, 0xFD37, 0xFD38, 0xFD39, 0xFD3A,
	      0xFD3B, 0xFD3C, 0xFD3D, 0xFD50, 0xFD51, 0xFD52, 0xFD53, 0xFD54, 0xFD55,
	      0xFD56, 0xFD57, 0xFD58, 0xFD59, 0xFD5A, 0xFD5B, 0xFD5C, 0xFD5D, 0xFD5E,
	      0xFD5F, 0xFD60, 0xFD61, 0xFD62, 0xFD63, 0xFD64, 0xFD65, 0xFD66, 0xFD67,
	      0xFD68, 0xFD69, 0xFD6A, 0xFD6B, 0xFD6C, 0xFD6D, 0xFD6E, 0xFD6F, 0xFD70,
	      0xFD71, 0xFD72, 0xFD73, 0xFD74, 0xFD75, 0xFD76, 0xFD77, 0xFD78, 0xFD79,
	      0xFD7A, 0xFD7B, 0xFD7C, 0xFD7D, 0xFD7E, 0xFD7F, 0xFD80, 0xFD81, 0xFD82,
	      0xFD83, 0xFD84, 0xFD85, 0xFD86, 0xFD87, 0xFD88, 0xFD89, 0xFD8A, 0xFD8B,
	      0xFD8C, 0xFD8D, 0xFD8E, 0xFD8F, 0xFD92, 0xFD93, 0xFD94, 0xFD95, 0xFD96,
	      0xFD97, 0xFD98, 0xFD99, 0xFD9A, 0xFD9B, 0xFD9C, 0xFD9D, 0xFD9E, 0xFD9F,
	      0xFDA0, 0xFDA1, 0xFDA2, 0xFDA3, 0xFDA4, 0xFDA5, 0xFDA6, 0xFDA7, 0xFDA8,
	      0xFDA9, 0xFDAA, 0xFDAB, 0xFDAC, 0xFDAD, 0xFDAE, 0xFDAF, 0xFDB0, 0xFDB1,
	      0xFDB2, 0xFDB3, 0xFDB4, 0xFDB5, 0xFDB6, 0xFDB7, 0xFDB8, 0xFDB9, 0xFDBA,
	      0xFDBB, 0xFDBC, 0xFDBD, 0xFDBE, 0xFDBF, 0xFDC0, 0xFDC1, 0xFDC2, 0xFDC3,
	      0xFDC4, 0xFDC5, 0xFDC6, 0xFDC7, 0xFDF0, 0xFDF1, 0xFDF2, 0xFDF3, 0xFDF4,
	      0xFDF5, 0xFDF6, 0xFDF7, 0xFDF8, 0xFDF9, 0xFDFA, 0xFDFB, 0xFDFC, 0xFE70,
	      0xFE71, 0xFE72, 0xFE73, 0xFE74, 0xFE76, 0xFE77, 0xFE78, 0xFE79, 0xFE7A,
	      0xFE7B, 0xFE7C, 0xFE7D, 0xFE7E, 0xFE7F, 0xFE80, 0xFE81, 0xFE82, 0xFE83,
	      0xFE84, 0xFE85, 0xFE86, 0xFE87, 0xFE88, 0xFE89, 0xFE8A, 0xFE8B, 0xFE8C,
	      0xFE8D, 0xFE8E, 0xFE8F, 0xFE90, 0xFE91, 0xFE92, 0xFE93, 0xFE94, 0xFE95,
	      0xFE96, 0xFE97, 0xFE98, 0xFE99, 0xFE9A, 0xFE9B, 0xFE9C, 0xFE9D, 0xFE9E,
	      0xFE9F, 0xFEA0, 0xFEA1, 0xFEA2, 0xFEA3, 0xFEA4, 0xFEA5, 0xFEA6, 0xFEA7,
	      0xFEA8, 0xFEA9, 0xFEAA, 0xFEAB, 0xFEAC, 0xFEAD, 0xFEAE, 0xFEAF, 0xFEB0,
	      0xFEB1, 0xFEB2, 0xFEB3, 0xFEB4, 0xFEB5, 0xFEB6, 0xFEB7, 0xFEB8, 0xFEB9,
	      0xFEBA, 0xFEBB, 0xFEBC, 0xFEBD, 0xFEBE, 0xFEBF, 0xFEC0, 0xFEC1, 0xFEC2,
	      0xFEC3, 0xFEC4, 0xFEC5, 0xFEC6, 0xFEC7, 0xFEC8, 0xFEC9, 0xFECA, 0xFECB,
	      0xFECC, 0xFECD, 0xFECE, 0xFECF, 0xFED0, 0xFED1, 0xFED2, 0xFED3, 0xFED4,
	      0xFED5, 0xFED6, 0xFED7, 0xFED8, 0xFED9, 0xFEDA, 0xFEDB, 0xFEDC, 0xFEDD,
	      0xFEDE, 0xFEDF, 0xFEE0, 0xFEE1, 0xFEE2, 0xFEE3, 0xFEE4, 0xFEE5, 0xFEE6,
	      0xFEE7, 0xFEE8, 0xFEE9, 0xFEEA, 0xFEEB, 0xFEEC, 0xFEED, 0xFEEE, 0xFEEF,
	      0xFEF0, 0xFEF1, 0xFEF2, 0xFEF3, 0xFEF4, 0xFEF5, 0xFEF6, 0xFEF7, 0xFEF8,
	      0xFEF9, 0xFEFA, 0xFEFB, 0xFEFC, 0x10800, 0x10801, 0x10802, 0x10803,
	      0x10804, 0x10805, 0x10808, 0x1080A, 0x1080B, 0x1080C, 0x1080D, 0x1080E,
	      0x1080F, 0x10810, 0x10811, 0x10812, 0x10813, 0x10814, 0x10815, 0x10816,
	      0x10817, 0x10818, 0x10819, 0x1081A, 0x1081B, 0x1081C, 0x1081D, 0x1081E,
	      0x1081F, 0x10820, 0x10821, 0x10822, 0x10823, 0x10824, 0x10825, 0x10826,
	      0x10827, 0x10828, 0x10829, 0x1082A, 0x1082B, 0x1082C, 0x1082D, 0x1082E,
	      0x1082F, 0x10830, 0x10831, 0x10832, 0x10833, 0x10834, 0x10835, 0x10837,
	      0x10838, 0x1083C, 0x1083F, 0x10840, 0x10841, 0x10842, 0x10843, 0x10844,
	      0x10845, 0x10846, 0x10847, 0x10848, 0x10849, 0x1084A, 0x1084B, 0x1084C,
	      0x1084D, 0x1084E, 0x1084F, 0x10850, 0x10851, 0x10852, 0x10853, 0x10854,
	      0x10855, 0x10857, 0x10858, 0x10859, 0x1085A, 0x1085B, 0x1085C, 0x1085D,
	      0x1085E, 0x1085F, 0x10900, 0x10901, 0x10902, 0x10903, 0x10904, 0x10905,
	      0x10906, 0x10907, 0x10908, 0x10909, 0x1090A, 0x1090B, 0x1090C, 0x1090D,
	      0x1090E, 0x1090F, 0x10910, 0x10911, 0x10912, 0x10913, 0x10914, 0x10915,
	      0x10916, 0x10917, 0x10918, 0x10919, 0x1091A, 0x1091B, 0x10920, 0x10921,
	      0x10922, 0x10923, 0x10924, 0x10925, 0x10926, 0x10927, 0x10928, 0x10929,
	      0x1092A, 0x1092B, 0x1092C, 0x1092D, 0x1092E, 0x1092F, 0x10930, 0x10931,
	      0x10932, 0x10933, 0x10934, 0x10935, 0x10936, 0x10937, 0x10938, 0x10939,
	      0x1093F, 0x10980, 0x10981, 0x10982, 0x10983, 0x10984, 0x10985, 0x10986,
	      0x10987, 0x10988, 0x10989, 0x1098A, 0x1098B, 0x1098C, 0x1098D, 0x1098E,
	      0x1098F, 0x10990, 0x10991, 0x10992, 0x10993, 0x10994, 0x10995, 0x10996,
	      0x10997, 0x10998, 0x10999, 0x1099A, 0x1099B, 0x1099C, 0x1099D, 0x1099E,
	      0x1099F, 0x109A0, 0x109A1, 0x109A2, 0x109A3, 0x109A4, 0x109A5, 0x109A6,
	      0x109A7, 0x109A8, 0x109A9, 0x109AA, 0x109AB, 0x109AC, 0x109AD, 0x109AE,
	      0x109AF, 0x109B0, 0x109B1, 0x109B2, 0x109B3, 0x109B4, 0x109B5, 0x109B6,
	      0x109B7, 0x109BE, 0x109BF, 0x10A00, 0x10A10, 0x10A11, 0x10A12, 0x10A13,
	      0x10A15, 0x10A16, 0x10A17, 0x10A19, 0x10A1A, 0x10A1B, 0x10A1C, 0x10A1D,
	      0x10A1E, 0x10A1F, 0x10A20, 0x10A21, 0x10A22, 0x10A23, 0x10A24, 0x10A25,
	      0x10A26, 0x10A27, 0x10A28, 0x10A29, 0x10A2A, 0x10A2B, 0x10A2C, 0x10A2D,
	      0x10A2E, 0x10A2F, 0x10A30, 0x10A31, 0x10A32, 0x10A33, 0x10A40, 0x10A41,
	      0x10A42, 0x10A43, 0x10A44, 0x10A45, 0x10A46, 0x10A47, 0x10A50, 0x10A51,
	      0x10A52, 0x10A53, 0x10A54, 0x10A55, 0x10A56, 0x10A57, 0x10A58, 0x10A60,
	      0x10A61, 0x10A62, 0x10A63, 0x10A64, 0x10A65, 0x10A66, 0x10A67, 0x10A68,
	      0x10A69, 0x10A6A, 0x10A6B, 0x10A6C, 0x10A6D, 0x10A6E, 0x10A6F, 0x10A70,
	      0x10A71, 0x10A72, 0x10A73, 0x10A74, 0x10A75, 0x10A76, 0x10A77, 0x10A78,
	      0x10A79, 0x10A7A, 0x10A7B, 0x10A7C, 0x10A7D, 0x10A7E, 0x10A7F, 0x10B00,
	      0x10B01, 0x10B02, 0x10B03, 0x10B04, 0x10B05, 0x10B06, 0x10B07, 0x10B08,
	      0x10B09, 0x10B0A, 0x10B0B, 0x10B0C, 0x10B0D, 0x10B0E, 0x10B0F, 0x10B10,
	      0x10B11, 0x10B12, 0x10B13, 0x10B14, 0x10B15, 0x10B16, 0x10B17, 0x10B18,
	      0x10B19, 0x10B1A, 0x10B1B, 0x10B1C, 0x10B1D, 0x10B1E, 0x10B1F, 0x10B20,
	      0x10B21, 0x10B22, 0x10B23, 0x10B24, 0x10B25, 0x10B26, 0x10B27, 0x10B28,
	      0x10B29, 0x10B2A, 0x10B2B, 0x10B2C, 0x10B2D, 0x10B2E, 0x10B2F, 0x10B30,
	      0x10B31, 0x10B32, 0x10B33, 0x10B34, 0x10B35, 0x10B40, 0x10B41, 0x10B42,
	      0x10B43, 0x10B44, 0x10B45, 0x10B46, 0x10B47, 0x10B48, 0x10B49, 0x10B4A,
	      0x10B4B, 0x10B4C, 0x10B4D, 0x10B4E, 0x10B4F, 0x10B50, 0x10B51, 0x10B52,
	      0x10B53, 0x10B54, 0x10B55, 0x10B58, 0x10B59, 0x10B5A, 0x10B5B, 0x10B5C,
	      0x10B5D, 0x10B5E, 0x10B5F, 0x10B60, 0x10B61, 0x10B62, 0x10B63, 0x10B64,
	      0x10B65, 0x10B66, 0x10B67, 0x10B68, 0x10B69, 0x10B6A, 0x10B6B, 0x10B6C,
	      0x10B6D, 0x10B6E, 0x10B6F, 0x10B70, 0x10B71, 0x10B72, 0x10B78, 0x10B79,
	      0x10B7A, 0x10B7B, 0x10B7C, 0x10B7D, 0x10B7E, 0x10B7F, 0x10C00, 0x10C01,
	      0x10C02, 0x10C03, 0x10C04, 0x10C05, 0x10C06, 0x10C07, 0x10C08, 0x10C09,
	      0x10C0A, 0x10C0B, 0x10C0C, 0x10C0D, 0x10C0E, 0x10C0F, 0x10C10, 0x10C11,
	      0x10C12, 0x10C13, 0x10C14, 0x10C15, 0x10C16, 0x10C17, 0x10C18, 0x10C19,
	      0x10C1A, 0x10C1B, 0x10C1C, 0x10C1D, 0x10C1E, 0x10C1F, 0x10C20, 0x10C21,
	      0x10C22, 0x10C23, 0x10C24, 0x10C25, 0x10C26, 0x10C27, 0x10C28, 0x10C29,
	      0x10C2A, 0x10C2B, 0x10C2C, 0x10C2D, 0x10C2E, 0x10C2F, 0x10C30, 0x10C31,
	      0x10C32, 0x10C33, 0x10C34, 0x10C35, 0x10C36, 0x10C37, 0x10C38, 0x10C39,
	      0x10C3A, 0x10C3B, 0x10C3C, 0x10C3D, 0x10C3E, 0x10C3F, 0x10C40, 0x10C41,
	      0x10C42, 0x10C43, 0x10C44, 0x10C45, 0x10C46, 0x10C47, 0x10C48, 0x1EE00,
	      0x1EE01, 0x1EE02, 0x1EE03, 0x1EE05, 0x1EE06, 0x1EE07, 0x1EE08, 0x1EE09,
	      0x1EE0A, 0x1EE0B, 0x1EE0C, 0x1EE0D, 0x1EE0E, 0x1EE0F, 0x1EE10, 0x1EE11,
	      0x1EE12, 0x1EE13, 0x1EE14, 0x1EE15, 0x1EE16, 0x1EE17, 0x1EE18, 0x1EE19,
	      0x1EE1A, 0x1EE1B, 0x1EE1C, 0x1EE1D, 0x1EE1E, 0x1EE1F, 0x1EE21, 0x1EE22,
	      0x1EE24, 0x1EE27, 0x1EE29, 0x1EE2A, 0x1EE2B, 0x1EE2C, 0x1EE2D, 0x1EE2E,
	      0x1EE2F, 0x1EE30, 0x1EE31, 0x1EE32, 0x1EE34, 0x1EE35, 0x1EE36, 0x1EE37,
	      0x1EE39, 0x1EE3B, 0x1EE42, 0x1EE47, 0x1EE49, 0x1EE4B, 0x1EE4D, 0x1EE4E,
	      0x1EE4F, 0x1EE51, 0x1EE52, 0x1EE54, 0x1EE57, 0x1EE59, 0x1EE5B, 0x1EE5D,
	      0x1EE5F, 0x1EE61, 0x1EE62, 0x1EE64, 0x1EE67, 0x1EE68, 0x1EE69, 0x1EE6A,
	      0x1EE6C, 0x1EE6D, 0x1EE6E, 0x1EE6F, 0x1EE70, 0x1EE71, 0x1EE72, 0x1EE74,
	      0x1EE75, 0x1EE76, 0x1EE77, 0x1EE79, 0x1EE7A, 0x1EE7B, 0x1EE7C, 0x1EE7E,
	      0x1EE80, 0x1EE81, 0x1EE82, 0x1EE83, 0x1EE84, 0x1EE85, 0x1EE86, 0x1EE87,
	      0x1EE88, 0x1EE89, 0x1EE8B, 0x1EE8C, 0x1EE8D, 0x1EE8E, 0x1EE8F, 0x1EE90,
	      0x1EE91, 0x1EE92, 0x1EE93, 0x1EE94, 0x1EE95, 0x1EE96, 0x1EE97, 0x1EE98,
	      0x1EE99, 0x1EE9A, 0x1EE9B, 0x1EEA1, 0x1EEA2, 0x1EEA3, 0x1EEA5, 0x1EEA6,
	      0x1EEA7, 0x1EEA8, 0x1EEA9, 0x1EEAB, 0x1EEAC, 0x1EEAD, 0x1EEAE, 0x1EEAF,
	      0x1EEB0, 0x1EEB1, 0x1EEB2, 0x1EEB3, 0x1EEB4, 0x1EEB5, 0x1EEB6, 0x1EEB7,
	      0x1EEB8, 0x1EEB9, 0x1EEBA, 0x1EEBB, 0x10FFFD];
	
	  function determineBidi(cueDiv) {
	    var nodeStack = [],
	        text = "",
	        charCode;
	
	    if (!cueDiv || !cueDiv.childNodes) {
	      return "ltr";
	    }
	
	    function pushNodes(nodeStack, node) {
	      for (var i = node.childNodes.length - 1; i >= 0; i--) {
	        nodeStack.push(node.childNodes[i]);
	      }
	    }
	
	    function nextTextNode(nodeStack) {
	      if (!nodeStack || !nodeStack.length) {
	        return null;
	      }
	
	      var node = nodeStack.pop(),
	          text = node.textContent || node.innerText;
	      if (text) {
	        // TODO: This should match all unicode type B characters (paragraph
	        // separator characters). See issue #115.
	        var m = text.match(/^.*(\n|\r)/);
	        if (m) {
	          nodeStack.length = 0;
	          return m[0];
	        }
	        return text;
	      }
	      if (node.tagName === "ruby") {
	        return nextTextNode(nodeStack);
	      }
	      if (node.childNodes) {
	        pushNodes(nodeStack, node);
	        return nextTextNode(nodeStack);
	      }
	    }
	
	    pushNodes(nodeStack, cueDiv);
	    while ((text = nextTextNode(nodeStack))) {
	      for (var i = 0; i < text.length; i++) {
	        charCode = text.charCodeAt(i);
	        for (var j = 0; j < strongRTLChars.length; j++) {
	          if (strongRTLChars[j] === charCode) {
	            return "rtl";
	          }
	        }
	      }
	    }
	    return "ltr";
	  }
	
	  function computeLinePos(cue) {
	    if (typeof cue.line === "number" &&
	        (cue.snapToLines || (cue.line >= 0 && cue.line <= 100))) {
	      return cue.line;
	    }
	    if (!cue.track || !cue.track.textTrackList ||
	        !cue.track.textTrackList.mediaElement) {
	      return -1;
	    }
	    var track = cue.track,
	        trackList = track.textTrackList,
	        count = 0;
	    for (var i = 0; i < trackList.length && trackList[i] !== track; i++) {
	      if (trackList[i].mode === "showing") {
	        count++;
	      }
	    }
	    return ++count * -1;
	  }
	
	  function StyleBox() {
	  }
	
	  // Apply styles to a div. If there is no div passed then it defaults to the
	  // div on 'this'.
	  StyleBox.prototype.applyStyles = function(styles, div) {
	    div = div || this.div;
	    for (var prop in styles) {
	      if (styles.hasOwnProperty(prop)) {
	        div.style[prop] = styles[prop];
	      }
	    }
	  };
	
	  StyleBox.prototype.formatStyle = function(val, unit) {
	    return val === 0 ? 0 : val + unit;
	  };
	
	  // Constructs the computed display state of the cue (a div). Places the div
	  // into the overlay which should be a block level element (usually a div).
	  function CueStyleBox(window, cue, styleOptions) {
	    var isIE8 = (/MSIE\s8\.0/).test(navigator.userAgent);
	    var color = "rgba(255, 255, 255, 1)";
	    var backgroundColor = "rgba(0, 0, 0, 0.8)";
	
	    if (isIE8) {
	      color = "rgb(255, 255, 255)";
	      backgroundColor = "rgb(0, 0, 0)";
	    }
	
	    StyleBox.call(this);
	    this.cue = cue;
	
	    // Parse our cue's text into a DOM tree rooted at 'cueDiv'. This div will
	    // have inline positioning and will function as the cue background box.
	    this.cueDiv = parseContent(window, cue.text);
	    var styles = {
	      color: color,
	      backgroundColor: backgroundColor,
	      position: "relative",
	      left: 0,
	      right: 0,
	      top: 0,
	      bottom: 0,
	      display: "inline"
	    };
	
	    if (!isIE8) {
	      styles.writingMode = cue.vertical === "" ? "horizontal-tb"
	                                               : cue.vertical === "lr" ? "vertical-lr"
	                                                                       : "vertical-rl";
	      styles.unicodeBidi = "plaintext";
	    }
	    this.applyStyles(styles, this.cueDiv);
	
	    // Create an absolutely positioned div that will be used to position the cue
	    // div. Note, all WebVTT cue-setting alignments are equivalent to the CSS
	    // mirrors of them except "middle" which is "center" in CSS.
	    this.div = window.document.createElement("div");
	    styles = {
	      textAlign: cue.align === "middle" ? "center" : cue.align,
	      font: styleOptions.font,
	      whiteSpace: "pre-line",
	      position: "absolute"
	    };
	
	    if (!isIE8) {
	      styles.direction = determineBidi(this.cueDiv);
	      styles.writingMode = cue.vertical === "" ? "horizontal-tb"
	                                               : cue.vertical === "lr" ? "vertical-lr"
	                                                                       : "vertical-rl".
	      stylesunicodeBidi =  "plaintext";
	    }
	
	    this.applyStyles(styles);
	
	    this.div.appendChild(this.cueDiv);
	
	    // Calculate the distance from the reference edge of the viewport to the text
	    // position of the cue box. The reference edge will be resolved later when
	    // the box orientation styles are applied.
	    var textPos = 0;
	    switch (cue.positionAlign) {
	    case "start":
	      textPos = cue.position;
	      break;
	    case "middle":
	      textPos = cue.position - (cue.size / 2);
	      break;
	    case "end":
	      textPos = cue.position - cue.size;
	      break;
	    }
	
	    // Horizontal box orientation; textPos is the distance from the left edge of the
	    // area to the left edge of the box and cue.size is the distance extending to
	    // the right from there.
	    if (cue.vertical === "") {
	      this.applyStyles({
	        left:  this.formatStyle(textPos, "%"),
	        width: this.formatStyle(cue.size, "%")
	      });
	    // Vertical box orientation; textPos is the distance from the top edge of the
	    // area to the top edge of the box and cue.size is the height extending
	    // downwards from there.
	    } else {
	      this.applyStyles({
	        top: this.formatStyle(textPos, "%"),
	        height: this.formatStyle(cue.size, "%")
	      });
	    }
	
	    this.move = function(box) {
	      this.applyStyles({
	        top: this.formatStyle(box.top, "px"),
	        bottom: this.formatStyle(box.bottom, "px"),
	        left: this.formatStyle(box.left, "px"),
	        right: this.formatStyle(box.right, "px"),
	        height: this.formatStyle(box.height, "px"),
	        width: this.formatStyle(box.width, "px")
	      });
	    };
	  }
	  CueStyleBox.prototype = _objCreate(StyleBox.prototype);
	  CueStyleBox.prototype.constructor = CueStyleBox;
	
	  // Represents the co-ordinates of an Element in a way that we can easily
	  // compute things with such as if it overlaps or intersects with another Element.
	  // Can initialize it with either a StyleBox or another BoxPosition.
	  function BoxPosition(obj) {
	    var isIE8 = (/MSIE\s8\.0/).test(navigator.userAgent);
	
	    // Either a BoxPosition was passed in and we need to copy it, or a StyleBox
	    // was passed in and we need to copy the results of 'getBoundingClientRect'
	    // as the object returned is readonly. All co-ordinate values are in reference
	    // to the viewport origin (top left).
	    var lh, height, width, top;
	    if (obj.div) {
	      height = obj.div.offsetHeight;
	      width = obj.div.offsetWidth;
	      top = obj.div.offsetTop;
	
	      var rects = (rects = obj.div.childNodes) && (rects = rects[0]) &&
	                  rects.getClientRects && rects.getClientRects();
	      obj = obj.div.getBoundingClientRect();
	      // In certain cases the outter div will be slightly larger then the sum of
	      // the inner div's lines. This could be due to bold text, etc, on some platforms.
	      // In this case we should get the average line height and use that. This will
	      // result in the desired behaviour.
	      lh = rects ? Math.max((rects[0] && rects[0].height) || 0, obj.height / rects.length)
	                 : 0;
	
	    }
	    this.left = obj.left;
	    this.right = obj.right;
	    this.top = obj.top || top;
	    this.height = obj.height || height;
	    this.bottom = obj.bottom || (top + (obj.height || height));
	    this.width = obj.width || width;
	    this.lineHeight = lh !== undefined ? lh : obj.lineHeight;
	
	    if (isIE8 && !this.lineHeight) {
	      this.lineHeight = 13;
	    }
	  }
	
	  // Move the box along a particular axis. Optionally pass in an amount to move
	  // the box. If no amount is passed then the default is the line height of the
	  // box.
	  BoxPosition.prototype.move = function(axis, toMove) {
	    toMove = toMove !== undefined ? toMove : this.lineHeight;
	    switch (axis) {
	    case "+x":
	      this.left += toMove;
	      this.right += toMove;
	      break;
	    case "-x":
	      this.left -= toMove;
	      this.right -= toMove;
	      break;
	    case "+y":
	      this.top += toMove;
	      this.bottom += toMove;
	      break;
	    case "-y":
	      this.top -= toMove;
	      this.bottom -= toMove;
	      break;
	    }
	  };
	
	  // Check if this box overlaps another box, b2.
	  BoxPosition.prototype.overlaps = function(b2) {
	    return this.left < b2.right &&
	           this.right > b2.left &&
	           this.top < b2.bottom &&
	           this.bottom > b2.top;
	  };
	
	  // Check if this box overlaps any other boxes in boxes.
	  BoxPosition.prototype.overlapsAny = function(boxes) {
	    for (var i = 0; i < boxes.length; i++) {
	      if (this.overlaps(boxes[i])) {
	        return true;
	      }
	    }
	    return false;
	  };
	
	  // Check if this box is within another box.
	  BoxPosition.prototype.within = function(container) {
	    return this.top >= container.top &&
	           this.bottom <= container.bottom &&
	           this.left >= container.left &&
	           this.right <= container.right;
	  };
	
	  // Check if this box is entirely within the container or it is overlapping
	  // on the edge opposite of the axis direction passed. For example, if "+x" is
	  // passed and the box is overlapping on the left edge of the container, then
	  // return true.
	  BoxPosition.prototype.overlapsOppositeAxis = function(container, axis) {
	    switch (axis) {
	    case "+x":
	      return this.left < container.left;
	    case "-x":
	      return this.right > container.right;
	    case "+y":
	      return this.top < container.top;
	    case "-y":
	      return this.bottom > container.bottom;
	    }
	  };
	
	  // Find the percentage of the area that this box is overlapping with another
	  // box.
	  BoxPosition.prototype.intersectPercentage = function(b2) {
	    var x = Math.max(0, Math.min(this.right, b2.right) - Math.max(this.left, b2.left)),
	        y = Math.max(0, Math.min(this.bottom, b2.bottom) - Math.max(this.top, b2.top)),
	        intersectArea = x * y;
	    return intersectArea / (this.height * this.width);
	  };
	
	  // Convert the positions from this box to CSS compatible positions using
	  // the reference container's positions. This has to be done because this
	  // box's positions are in reference to the viewport origin, whereas, CSS
	  // values are in referecne to their respective edges.
	  BoxPosition.prototype.toCSSCompatValues = function(reference) {
	    return {
	      top: this.top - reference.top,
	      bottom: reference.bottom - this.bottom,
	      left: this.left - reference.left,
	      right: reference.right - this.right,
	      height: this.height,
	      width: this.width
	    };
	  };
	
	  // Get an object that represents the box's position without anything extra.
	  // Can pass a StyleBox, HTMLElement, or another BoxPositon.
	  BoxPosition.getSimpleBoxPosition = function(obj) {
	    var height = obj.div ? obj.div.offsetHeight : obj.tagName ? obj.offsetHeight : 0;
	    var width = obj.div ? obj.div.offsetWidth : obj.tagName ? obj.offsetWidth : 0;
	    var top = obj.div ? obj.div.offsetTop : obj.tagName ? obj.offsetTop : 0;
	
	    obj = obj.div ? obj.div.getBoundingClientRect() :
	                  obj.tagName ? obj.getBoundingClientRect() : obj;
	    var ret = {
	      left: obj.left,
	      right: obj.right,
	      top: obj.top || top,
	      height: obj.height || height,
	      bottom: obj.bottom || (top + (obj.height || height)),
	      width: obj.width || width
	    };
	    return ret;
	  };
	
	  // Move a StyleBox to its specified, or next best, position. The containerBox
	  // is the box that contains the StyleBox, such as a div. boxPositions are
	  // a list of other boxes that the styleBox can't overlap with.
	  function moveBoxToLinePosition(window, styleBox, containerBox, boxPositions) {
	
	    // Find the best position for a cue box, b, on the video. The axis parameter
	    // is a list of axis, the order of which, it will move the box along. For example:
	    // Passing ["+x", "-x"] will move the box first along the x axis in the positive
	    // direction. If it doesn't find a good position for it there it will then move
	    // it along the x axis in the negative direction.
	    function findBestPosition(b, axis) {
	      var bestPosition,
	          specifiedPosition = new BoxPosition(b),
	          percentage = 1; // Highest possible so the first thing we get is better.
	
	      for (var i = 0; i < axis.length; i++) {
	        while (b.overlapsOppositeAxis(containerBox, axis[i]) ||
	               (b.within(containerBox) && b.overlapsAny(boxPositions))) {
	          b.move(axis[i]);
	        }
	        // We found a spot where we aren't overlapping anything. This is our
	        // best position.
	        if (b.within(containerBox)) {
	          return b;
	        }
	        var p = b.intersectPercentage(containerBox);
	        // If we're outside the container box less then we were on our last try
	        // then remember this position as the best position.
	        if (percentage > p) {
	          bestPosition = new BoxPosition(b);
	          percentage = p;
	        }
	        // Reset the box position to the specified position.
	        b = new BoxPosition(specifiedPosition);
	      }
	      return bestPosition || specifiedPosition;
	    }
	
	    var boxPosition = new BoxPosition(styleBox),
	        cue = styleBox.cue,
	        linePos = computeLinePos(cue),
	        axis = [];
	
	    // If we have a line number to align the cue to.
	    if (cue.snapToLines) {
	      var size;
	      switch (cue.vertical) {
	      case "":
	        axis = [ "+y", "-y" ];
	        size = "height";
	        break;
	      case "rl":
	        axis = [ "+x", "-x" ];
	        size = "width";
	        break;
	      case "lr":
	        axis = [ "-x", "+x" ];
	        size = "width";
	        break;
	      }
	
	      var step = boxPosition.lineHeight,
	          position = step * Math.round(linePos),
	          maxPosition = containerBox[size] + step,
	          initialAxis = axis[0];
	
	      // If the specified intial position is greater then the max position then
	      // clamp the box to the amount of steps it would take for the box to
	      // reach the max position.
	      if (Math.abs(position) > maxPosition) {
	        position = position < 0 ? -1 : 1;
	        position *= Math.ceil(maxPosition / step) * step;
	      }
	
	      // If computed line position returns negative then line numbers are
	      // relative to the bottom of the video instead of the top. Therefore, we
	      // need to increase our initial position by the length or width of the
	      // video, depending on the writing direction, and reverse our axis directions.
	      if (linePos < 0) {
	        position += cue.vertical === "" ? containerBox.height : containerBox.width;
	        axis = axis.reverse();
	      }
	
	      // Move the box to the specified position. This may not be its best
	      // position.
	      boxPosition.move(initialAxis, position);
	
	    } else {
	      // If we have a percentage line value for the cue.
	      var calculatedPercentage = (boxPosition.lineHeight / containerBox.height) * 100;
	
	      switch (cue.lineAlign) {
	      case "middle":
	        linePos -= (calculatedPercentage / 2);
	        break;
	      case "end":
	        linePos -= calculatedPercentage;
	        break;
	      }
	
	      // Apply initial line position to the cue box.
	      switch (cue.vertical) {
	      case "":
	        styleBox.applyStyles({
	          top: styleBox.formatStyle(linePos, "%")
	        });
	        break;
	      case "rl":
	        styleBox.applyStyles({
	          left: styleBox.formatStyle(linePos, "%")
	        });
	        break;
	      case "lr":
	        styleBox.applyStyles({
	          right: styleBox.formatStyle(linePos, "%")
	        });
	        break;
	      }
	
	      axis = [ "+y", "-x", "+x", "-y" ];
	
	      // Get the box position again after we've applied the specified positioning
	      // to it.
	      boxPosition = new BoxPosition(styleBox);
	    }
	
	    var bestPosition = findBestPosition(boxPosition, axis);
	    styleBox.move(bestPosition.toCSSCompatValues(containerBox));
	  }
	
	  function WebVTT() {
	    // Nothing
	  }
	
	  // Helper to allow strings to be decoded instead of the default binary utf8 data.
	  WebVTT.StringDecoder = function() {
	    return {
	      decode: function(data) {
	        if (!data) {
	          return "";
	        }
	        if (typeof data !== "string") {
	          throw new Error("Error - expected string data.");
	        }
	        return decodeURIComponent(encodeURIComponent(data));
	      }
	    };
	  };
	
	  WebVTT.convertCueToDOMTree = function(window, cuetext) {
	    if (!window || !cuetext) {
	      return null;
	    }
	    return parseContent(window, cuetext);
	  };
	
	  var FONT_SIZE_PERCENT = 0.05;
	  var FONT_STYLE = "sans-serif";
	  var CUE_BACKGROUND_PADDING = "1.5%";
	
	  // Runs the processing model over the cues and regions passed to it.
	  // @param overlay A block level element (usually a div) that the computed cues
	  //                and regions will be placed into.
	  WebVTT.processCues = function(window, cues, overlay) {
	    if (!window || !cues || !overlay) {
	      return null;
	    }
	
	    // Remove all previous children.
	    while (overlay.firstChild) {
	      overlay.removeChild(overlay.firstChild);
	    }
	
	    var paddedOverlay = window.document.createElement("div");
	    paddedOverlay.style.position = "absolute";
	    paddedOverlay.style.left = "0";
	    paddedOverlay.style.right = "0";
	    paddedOverlay.style.top = "0";
	    paddedOverlay.style.bottom = "0";
	    paddedOverlay.style.margin = CUE_BACKGROUND_PADDING;
	    overlay.appendChild(paddedOverlay);
	
	    // Determine if we need to compute the display states of the cues. This could
	    // be the case if a cue's state has been changed since the last computation or
	    // if it has not been computed yet.
	    function shouldCompute(cues) {
	      for (var i = 0; i < cues.length; i++) {
	        if (cues[i].hasBeenReset || !cues[i].displayState) {
	          return true;
	        }
	      }
	      return false;
	    }
	
	    // We don't need to recompute the cues' display states. Just reuse them.
	    if (!shouldCompute(cues)) {
	      for (var i = 0; i < cues.length; i++) {
	        paddedOverlay.appendChild(cues[i].displayState);
	      }
	      return;
	    }
	
	    var boxPositions = [],
	        containerBox = BoxPosition.getSimpleBoxPosition(paddedOverlay),
	        fontSize = Math.round(containerBox.height * FONT_SIZE_PERCENT * 100) / 100;
	    var styleOptions = {
	      font: fontSize + "px " + FONT_STYLE
	    };
	
	    (function() {
	      var styleBox, cue;
	
	      for (var i = 0; i < cues.length; i++) {
	        cue = cues[i];
	
	        // Compute the intial position and styles of the cue div.
	        styleBox = new CueStyleBox(window, cue, styleOptions);
	        paddedOverlay.appendChild(styleBox.div);
	
	        // Move the cue div to it's correct line position.
	        moveBoxToLinePosition(window, styleBox, containerBox, boxPositions);
	
	        // Remember the computed div so that we don't have to recompute it later
	        // if we don't have too.
	        cue.displayState = styleBox.div;
	
	        boxPositions.push(BoxPosition.getSimpleBoxPosition(styleBox));
	      }
	    })();
	  };
	
	  WebVTT.Parser = function(window, vttjs, decoder) {
	    if (!decoder) {
	      decoder = vttjs;
	      vttjs = {};
	    }
	    if (!vttjs) {
	      vttjs = {};
	    }
	
	    this.window = window;
	    this.vttjs = vttjs;
	    this.state = "INITIAL";
	    this.buffer = "";
	    this.decoder = decoder || new TextDecoder("utf8");
	    this.regionList = [];
	  };
	
	  WebVTT.Parser.prototype = {
	    // If the error is a ParsingError then report it to the consumer if
	    // possible. If it's not a ParsingError then throw it like normal.
	    reportOrThrowError: function(e) {
	      if (e instanceof ParsingError) {
	        this.onparsingerror && this.onparsingerror(e);
	      } else {
	        throw e;
	      }
	    },
	    parse: function (data) {
	      var self = this;
	
	      // If there is no data then we won't decode it, but will just try to parse
	      // whatever is in buffer already. This may occur in circumstances, for
	      // example when flush() is called.
	      if (data) {
	        // Try to decode the data that we received.
	        self.buffer += self.decoder.decode(data, {stream: true});
	      }
	
	      function collectNextLine() {
	        var buffer = self.buffer;
	        var pos = 0;
	        while (pos < buffer.length && buffer[pos] !== '\r' && buffer[pos] !== '\n') {
	          ++pos;
	        }
	        var line = buffer.substr(0, pos);
	        // Advance the buffer early in case we fail below.
	        if (buffer[pos] === '\r') {
	          ++pos;
	        }
	        if (buffer[pos] === '\n') {
	          ++pos;
	        }
	        self.buffer = buffer.substr(pos);
	        return line;
	      }
	
	      // 3.4 WebVTT region and WebVTT region settings syntax
	      function parseRegion(input) {
	        var settings = new Settings();
	
	        parseOptions(input, function (k, v) {
	          switch (k) {
	          case "id":
	            settings.set(k, v);
	            break;
	          case "width":
	            settings.percent(k, v);
	            break;
	          case "lines":
	            settings.integer(k, v);
	            break;
	          case "regionanchor":
	          case "viewportanchor":
	            var xy = v.split(',');
	            if (xy.length !== 2) {
	              break;
	            }
	            // We have to make sure both x and y parse, so use a temporary
	            // settings object here.
	            var anchor = new Settings();
	            anchor.percent("x", xy[0]);
	            anchor.percent("y", xy[1]);
	            if (!anchor.has("x") || !anchor.has("y")) {
	              break;
	            }
	            settings.set(k + "X", anchor.get("x"));
	            settings.set(k + "Y", anchor.get("y"));
	            break;
	          case "scroll":
	            settings.alt(k, v, ["up"]);
	            break;
	          }
	        }, /=/, /\s/);
	
	        // Create the region, using default values for any values that were not
	        // specified.
	        if (settings.has("id")) {
	          var region = new (self.vttjs.VTTRegion || self.window.VTTRegion)();
	          region.width = settings.get("width", 100);
	          region.lines = settings.get("lines", 3);
	          region.regionAnchorX = settings.get("regionanchorX", 0);
	          region.regionAnchorY = settings.get("regionanchorY", 100);
	          region.viewportAnchorX = settings.get("viewportanchorX", 0);
	          region.viewportAnchorY = settings.get("viewportanchorY", 100);
	          region.scroll = settings.get("scroll", "");
	          // Register the region.
	          self.onregion && self.onregion(region);
	          // Remember the VTTRegion for later in case we parse any VTTCues that
	          // reference it.
	          self.regionList.push({
	            id: settings.get("id"),
	            region: region
	          });
	        }
	      }
	
	      // 3.2 WebVTT metadata header syntax
	      function parseHeader(input) {
	        parseOptions(input, function (k, v) {
	          switch (k) {
	          case "Region":
	            // 3.3 WebVTT region metadata header syntax
	            parseRegion(v);
	            break;
	          }
	        }, /:/);
	      }
	
	      // 5.1 WebVTT file parsing.
	      try {
	        var line;
	        if (self.state === "INITIAL") {
	          // We can't start parsing until we have the first line.
	          if (!/\r\n|\n/.test(self.buffer)) {
	            return this;
	          }
	
	          line = collectNextLine();
	
	          var m = line.match(/^WEBVTT([ \t].*)?$/);
	          if (!m || !m[0]) {
	            throw new ParsingError(ParsingError.Errors.BadSignature);
	          }
	
	          self.state = "HEADER";
	        }
	
	        var alreadyCollectedLine = false;
	        while (self.buffer) {
	          // We can't parse a line until we have the full line.
	          if (!/\r\n|\n/.test(self.buffer)) {
	            return this;
	          }
	
	          if (!alreadyCollectedLine) {
	            line = collectNextLine();
	          } else {
	            alreadyCollectedLine = false;
	          }
	
	          switch (self.state) {
	          case "HEADER":
	            // 13-18 - Allow a header (metadata) under the WEBVTT line.
	            if (/:/.test(line)) {
	              parseHeader(line);
	            } else if (!line) {
	              // An empty line terminates the header and starts the body (cues).
	              self.state = "ID";
	            }
	            continue;
	          case "NOTE":
	            // Ignore NOTE blocks.
	            if (!line) {
	              self.state = "ID";
	            }
	            continue;
	          case "ID":
	            // Check for the start of NOTE blocks.
	            if (/^NOTE($|[ \t])/.test(line)) {
	              self.state = "NOTE";
	              break;
	            }
	            // 19-29 - Allow any number of line terminators, then initialize new cue values.
	            if (!line) {
	              continue;
	            }
	            self.cue = new (self.vttjs.VTTCue || self.window.VTTCue)(0, 0, "");
	            self.state = "CUE";
	            // 30-39 - Check if self line contains an optional identifier or timing data.
	            if (line.indexOf("-->") === -1) {
	              self.cue.id = line;
	              continue;
	            }
	            // Process line as start of a cue.
	            /*falls through*/
	          case "CUE":
	            // 40 - Collect cue timings and settings.
	            try {
	              parseCue(line, self.cue, self.regionList);
	            } catch (e) {
	              self.reportOrThrowError(e);
	              // In case of an error ignore rest of the cue.
	              self.cue = null;
	              self.state = "BADCUE";
	              continue;
	            }
	            self.state = "CUETEXT";
	            continue;
	          case "CUETEXT":
	            var hasSubstring = line.indexOf("-->") !== -1;
	            // 34 - If we have an empty line then report the cue.
	            // 35 - If we have the special substring '-->' then report the cue,
	            // but do not collect the line as we need to process the current
	            // one as a new cue.
	            if (!line || hasSubstring && (alreadyCollectedLine = true)) {
	              // We are done parsing self cue.
	              self.oncue && self.oncue(self.cue);
	              self.cue = null;
	              self.state = "ID";
	              continue;
	            }
	            if (self.cue.text) {
	              self.cue.text += "\n";
	            }
	            self.cue.text += line;
	            continue;
	          case "BADCUE": // BADCUE
	            // 54-62 - Collect and discard the remaining cue.
	            if (!line) {
	              self.state = "ID";
	            }
	            continue;
	          }
	        }
	      } catch (e) {
	        self.reportOrThrowError(e);
	
	        // If we are currently parsing a cue, report what we have.
	        if (self.state === "CUETEXT" && self.cue && self.oncue) {
	          self.oncue(self.cue);
	        }
	        self.cue = null;
	        // Enter BADWEBVTT state if header was not parsed correctly otherwise
	        // another exception occurred so enter BADCUE state.
	        self.state = self.state === "INITIAL" ? "BADWEBVTT" : "BADCUE";
	      }
	      return this;
	    },
	    flush: function () {
	      var self = this;
	      try {
	        // Finish decoding the stream.
	        self.buffer += self.decoder.decode();
	        // Synthesize the end of the current cue or region.
	        if (self.cue || self.state === "HEADER") {
	          self.buffer += "\n\n";
	          self.parse();
	        }
	        // If we've flushed, parsed, and we're still on the INITIAL state then
	        // that means we don't have enough of the stream to parse the first
	        // line.
	        if (self.state === "INITIAL") {
	          throw new ParsingError(ParsingError.Errors.BadSignature);
	        }
	      } catch(e) {
	        self.reportOrThrowError(e);
	      }
	      self.onflush && self.onflush();
	      return this;
	    }
	  };
	
	  global.WebVTT = WebVTT;
	
	}(this, (this.vttjs || {})));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)(module)))

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var require;var require;/* WEBPACK VAR INJECTION */(function(global) {(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return require(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
	(function (global){
	; var __browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
	/*!    SWFObject v2.3.20130521 <http://github.com/swfobject/swfobject>
	    is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
	*/
	var swfobject=function(){var D="undefined",r="object",T="Shockwave Flash",Z="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",S="SWFObjectExprInst",x="onreadystatechange",Q=window,h=document,t=navigator,V=false,X=[],o=[],P=[],K=[],I,p,E,B,L=false,a=false,m,G,j=true,l=false,O=function(){var ad=typeof h.getElementById!=D&&typeof h.getElementsByTagName!=D&&typeof h.createElement!=D,ak=t.userAgent.toLowerCase(),ab=t.platform.toLowerCase(),ah=ab?/win/.test(ab):/win/.test(ak),af=ab?/mac/.test(ab):/mac/.test(ak),ai=/webkit/.test(ak)?parseFloat(ak.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,aa=t.appName==="Microsoft Internet Explorer",aj=[0,0,0],ae=null;if(typeof t.plugins!=D&&typeof t.plugins[T]==r){ae=t.plugins[T].description;if(ae&&(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&t.mimeTypes[q].enabledPlugin)){V=true;aa=false;ae=ae.replace(/^.*\s+(\S+\s+\S+$)/,"$1");aj[0]=n(ae.replace(/^(.*)\..*$/,"$1"));aj[1]=n(ae.replace(/^.*\.(.*)\s.*$/,"$1"));aj[2]=/[a-zA-Z]/.test(ae)?n(ae.replace(/^.*[a-zA-Z]+(.*)$/,"$1")):0}}else{if(typeof Q.ActiveXObject!=D){try{var ag=new ActiveXObject(Z);if(ag){ae=ag.GetVariable("$version");if(ae){aa=true;ae=ae.split(" ")[1].split(",");aj=[n(ae[0]),n(ae[1]),n(ae[2])]}}}catch(ac){}}}return{w3:ad,pv:aj,wk:ai,ie:aa,win:ah,mac:af}}(),i=function(){if(!O.w3){return}if((typeof h.readyState!=D&&(h.readyState==="complete"||h.readyState==="interactive"))||(typeof h.readyState==D&&(h.getElementsByTagName("body")[0]||h.body))){f()}if(!L){if(typeof h.addEventListener!=D){h.addEventListener("DOMContentLoaded",f,false)}if(O.ie){h.attachEvent(x,function aa(){if(h.readyState=="complete"){h.detachEvent(x,aa);f()}});if(Q==top){(function ac(){if(L){return}try{h.documentElement.doScroll("left")}catch(ad){setTimeout(ac,0);return}f()}())}}if(O.wk){(function ab(){if(L){return}if(!/loaded|complete/.test(h.readyState)){setTimeout(ab,0);return}f()}())}}}();function f(){if(L||!document.getElementsByTagName("body")[0]){return}try{var ac,ad=C("span");ad.style.display="none";ac=h.getElementsByTagName("body")[0].appendChild(ad);ac.parentNode.removeChild(ac);ac=null;ad=null}catch(ae){return}L=true;var aa=X.length;for(var ab=0;ab<aa;ab++){X[ab]()}}function M(aa){if(L){aa()}else{X[X.length]=aa}}function s(ab){if(typeof Q.addEventListener!=D){Q.addEventListener("load",ab,false)}else{if(typeof h.addEventListener!=D){h.addEventListener("load",ab,false)}else{if(typeof Q.attachEvent!=D){g(Q,"onload",ab)}else{if(typeof Q.onload=="function"){var aa=Q.onload;Q.onload=function(){aa();ab()}}else{Q.onload=ab}}}}}function Y(){var aa=h.getElementsByTagName("body")[0];var ae=C(r);ae.setAttribute("style","visibility: hidden;");ae.setAttribute("type",q);var ad=aa.appendChild(ae);if(ad){var ac=0;(function ab(){if(typeof ad.GetVariable!=D){try{var ag=ad.GetVariable("$version");if(ag){ag=ag.split(" ")[1].split(",");O.pv=[n(ag[0]),n(ag[1]),n(ag[2])]}}catch(af){O.pv=[8,0,0]}}else{if(ac<10){ac++;setTimeout(ab,10);return}}aa.removeChild(ae);ad=null;H()}())}else{H()}}function H(){var aj=o.length;if(aj>0){for(var ai=0;ai<aj;ai++){var ab=o[ai].id;var ae=o[ai].callbackFn;var ad={success:false,id:ab};if(O.pv[0]>0){var ah=c(ab);if(ah){if(F(o[ai].swfVersion)&&!(O.wk&&O.wk<312)){w(ab,true);if(ae){ad.success=true;ad.ref=z(ab);ad.id=ab;ae(ad)}}else{if(o[ai].expressInstall&&A()){var al={};al.data=o[ai].expressInstall;al.width=ah.getAttribute("width")||"0";al.height=ah.getAttribute("height")||"0";if(ah.getAttribute("class")){al.styleclass=ah.getAttribute("class")}if(ah.getAttribute("align")){al.align=ah.getAttribute("align")}var ak={};var aa=ah.getElementsByTagName("param");var af=aa.length;for(var ag=0;ag<af;ag++){if(aa[ag].getAttribute("name").toLowerCase()!="movie"){ak[aa[ag].getAttribute("name")]=aa[ag].getAttribute("value")}}R(al,ak,ab,ae)}else{b(ah);if(ae){ae(ad)}}}}}else{w(ab,true);if(ae){var ac=z(ab);if(ac&&typeof ac.SetVariable!=D){ad.success=true;ad.ref=ac;ad.id=ac.id}ae(ad)}}}}}X[0]=function(){if(V){Y()}else{H()}};function z(ac){var aa=null,ab=c(ac);if(ab&&ab.nodeName.toUpperCase()==="OBJECT"){if(typeof ab.SetVariable!==D){aa=ab}else{aa=ab.getElementsByTagName(r)[0]||ab}}return aa}function A(){return !a&&F("6.0.65")&&(O.win||O.mac)&&!(O.wk&&O.wk<312)}function R(ad,ae,aa,ac){var ah=c(aa);aa=W(aa);a=true;E=ac||null;B={success:false,id:aa};if(ah){if(ah.nodeName.toUpperCase()=="OBJECT"){I=J(ah);p=null}else{I=ah;p=aa}ad.id=S;if(typeof ad.width==D||(!/%$/.test(ad.width)&&n(ad.width)<310)){ad.width="310"}if(typeof ad.height==D||(!/%$/.test(ad.height)&&n(ad.height)<137)){ad.height="137"}var ag=O.ie?"ActiveX":"PlugIn",af="MMredirectURL="+encodeURIComponent(Q.location.toString().replace(/&/g,"%26"))+"&MMplayerType="+ag+"&MMdoctitle="+encodeURIComponent(h.title.slice(0,47)+" - Flash Player Installation");if(typeof ae.flashvars!=D){ae.flashvars+="&"+af}else{ae.flashvars=af}if(O.ie&&ah.readyState!=4){var ab=C("div");
	aa+="SWFObjectNew";ab.setAttribute("id",aa);ah.parentNode.insertBefore(ab,ah);ah.style.display="none";y(ah)}u(ad,ae,aa)}}function b(ab){if(O.ie&&ab.readyState!=4){ab.style.display="none";var aa=C("div");ab.parentNode.insertBefore(aa,ab);aa.parentNode.replaceChild(J(ab),aa);y(ab)}else{ab.parentNode.replaceChild(J(ab),ab)}}function J(af){var ae=C("div");if(O.win&&O.ie){ae.innerHTML=af.innerHTML}else{var ab=af.getElementsByTagName(r)[0];if(ab){var ag=ab.childNodes;if(ag){var aa=ag.length;for(var ad=0;ad<aa;ad++){if(!(ag[ad].nodeType==1&&ag[ad].nodeName=="PARAM")&&!(ag[ad].nodeType==8)){ae.appendChild(ag[ad].cloneNode(true))}}}}}return ae}function k(aa,ab){var ac=C("div");ac.innerHTML="<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'><param name='movie' value='"+aa+"'>"+ab+"</object>";return ac.firstChild}function u(ai,ag,ab){var aa,ad=c(ab);ab=W(ab);if(O.wk&&O.wk<312){return aa}if(ad){var ac=(O.ie)?C("div"):C(r),af,ah,ae;if(typeof ai.id==D){ai.id=ab}for(ae in ag){if(ag.hasOwnProperty(ae)&&ae.toLowerCase()!=="movie"){e(ac,ae,ag[ae])}}if(O.ie){ac=k(ai.data,ac.innerHTML)}for(af in ai){if(ai.hasOwnProperty(af)){ah=af.toLowerCase();if(ah==="styleclass"){ac.setAttribute("class",ai[af])}else{if(ah!=="classid"&&ah!=="data"){ac.setAttribute(af,ai[af])}}}}if(O.ie){P[P.length]=ai.id}else{ac.setAttribute("type",q);ac.setAttribute("data",ai.data)}ad.parentNode.replaceChild(ac,ad);aa=ac}return aa}function e(ac,aa,ab){var ad=C("param");ad.setAttribute("name",aa);ad.setAttribute("value",ab);ac.appendChild(ad)}function y(ac){var ab=c(ac);if(ab&&ab.nodeName.toUpperCase()=="OBJECT"){if(O.ie){ab.style.display="none";(function aa(){if(ab.readyState==4){for(var ad in ab){if(typeof ab[ad]=="function"){ab[ad]=null}}ab.parentNode.removeChild(ab)}else{setTimeout(aa,10)}}())}else{ab.parentNode.removeChild(ab)}}}function U(aa){return(aa&&aa.nodeType&&aa.nodeType===1)}function W(aa){return(U(aa))?aa.id:aa}function c(ac){if(U(ac)){return ac}var aa=null;try{aa=h.getElementById(ac)}catch(ab){}return aa}function C(aa){return h.createElement(aa)}function n(aa){return parseInt(aa,10)}function g(ac,aa,ab){ac.attachEvent(aa,ab);K[K.length]=[ac,aa,ab]}function F(ac){ac+="";var ab=O.pv,aa=ac.split(".");aa[0]=n(aa[0]);aa[1]=n(aa[1])||0;aa[2]=n(aa[2])||0;return(ab[0]>aa[0]||(ab[0]==aa[0]&&ab[1]>aa[1])||(ab[0]==aa[0]&&ab[1]==aa[1]&&ab[2]>=aa[2]))?true:false}function v(af,ab,ag,ae){var ad=h.getElementsByTagName("head")[0];if(!ad){return}var aa=(typeof ag=="string")?ag:"screen";if(ae){m=null;G=null}if(!m||G!=aa){var ac=C("style");ac.setAttribute("type","text/css");ac.setAttribute("media",aa);m=ad.appendChild(ac);if(O.ie&&typeof h.styleSheets!=D&&h.styleSheets.length>0){m=h.styleSheets[h.styleSheets.length-1]}G=aa}if(m){if(typeof m.addRule!=D){m.addRule(af,ab)}else{if(typeof h.createTextNode!=D){m.appendChild(h.createTextNode(af+" {"+ab+"}"))}}}}function w(ad,aa){if(!j){return}var ab=aa?"visible":"hidden",ac=c(ad);if(L&&ac){ac.style.visibility=ab}else{if(typeof ad==="string"){v("#"+ad,"visibility:"+ab)}}}function N(ab){var ac=/[\\\"<>\.;]/;var aa=ac.exec(ab)!=null;return aa&&typeof encodeURIComponent!=D?encodeURIComponent(ab):ab}var d=function(){if(O.ie){window.attachEvent("onunload",function(){var af=K.length;for(var ae=0;ae<af;ae++){K[ae][0].detachEvent(K[ae][1],K[ae][2])}var ac=P.length;for(var ad=0;ad<ac;ad++){y(P[ad])}for(var ab in O){O[ab]=null}O=null;for(var aa in swfobject){swfobject[aa]=null}swfobject=null})}}();return{registerObject:function(ae,aa,ad,ac){if(O.w3&&ae&&aa){var ab={};ab.id=ae;ab.swfVersion=aa;ab.expressInstall=ad;ab.callbackFn=ac;o[o.length]=ab;w(ae,false)}else{if(ac){ac({success:false,id:ae})}}},getObjectById:function(aa){if(O.w3){return z(aa)}},embedSWF:function(af,al,ai,ak,ab,ae,ad,ah,aj,ag){var ac=W(al),aa={success:false,id:ac};if(O.w3&&!(O.wk&&O.wk<312)&&af&&al&&ai&&ak&&ab){w(ac,false);M(function(){ai+="";ak+="";var an={};if(aj&&typeof aj===r){for(var aq in aj){an[aq]=aj[aq]}}an.data=af;an.width=ai;an.height=ak;var ar={};if(ah&&typeof ah===r){for(var ao in ah){ar[ao]=ah[ao]}}if(ad&&typeof ad===r){for(var am in ad){if(ad.hasOwnProperty(am)){var ap=(l)?encodeURIComponent(am):am,at=(l)?encodeURIComponent(ad[am]):ad[am];if(typeof ar.flashvars!=D){ar.flashvars+="&"+ap+"="+at}else{ar.flashvars=ap+"="+at}}}}if(F(ab)){var au=u(an,ar,al);if(an.id==ac){w(ac,true)}aa.success=true;aa.ref=au;aa.id=au.id}else{if(ae&&A()){an.data=ae;R(an,ar,al,ag);return}else{w(ac,true)}}if(ag){ag(aa)}})}else{if(ag){ag(aa)}}},switchOffAutoHideShow:function(){j=false},enableUriEncoding:function(aa){l=(typeof aa===D)?true:aa},ua:O,getFlashPlayerVersion:function(){return{major:O.pv[0],minor:O.pv[1],release:O.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(ac,ab,aa){if(O.w3){return u(ac,ab,aa)}else{return undefined}},showExpressInstall:function(ac,ad,aa,ab){if(O.w3&&A()){R(ac,ad,aa,ab)}},removeSWF:function(aa){if(O.w3){y(aa)}},createCSS:function(ad,ac,ab,aa){if(O.w3){v(ad,ac,ab,aa)}},addDomLoadEvent:M,addLoadEvent:s,getQueryParamValue:function(ad){var ac=h.location.search||h.location.hash;
	if(ac){if(/\?/.test(ac)){ac=ac.split("?")[1]}if(ad==null){return N(ac)}var ab=ac.split("&");for(var aa=0;aa<ab.length;aa++){if(ab[aa].substring(0,ab[aa].indexOf("="))==ad){return N(ab[aa].substring((ab[aa].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var aa=c(S);if(aa&&I){aa.parentNode.replaceChild(I,aa);if(p){w(p,true);if(O.ie){I.style.display="block"}}if(E){E(B)}}a=false}},version:"2.3"}}();
	
	; browserify_shim__define__module__export__(typeof swfobject != "undefined" ? swfobject : window.swfobject);
	
	}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });
	
	}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	},{}],2:[function(require,module,exports){
	(function (global){
	; var __browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
	/**
	 * Basic Ad support plugin for video.js.
	 *
	 * Common code to support ad integrations.
	 */
	(function(window, document, vjs, undefined) {
	"use strict";
	
	var
	
	  /**
	   * Copies properties from one or more objects onto an original.
	   */
	  extend = function(obj /*, arg1, arg2, ... */) {
	    var arg, i, k;
	    for (i=1; i<arguments.length; i++) {
	      arg = arguments[i];
	      for (k in arg) {
	        if (arg.hasOwnProperty(k)) {
	          obj[k] = arg[k];
	        }
	      }
	    }
	    return obj;
	  },
	
	  /**
	   * Add a handler for multiple listeners to an object that supports addEventListener() or on().
	   *
	   * @param {object} obj The object to which the handler will be assigned.
	   * @param {mixed} events A string, array of strings, or hash of string/callback pairs.
	   * @param {function} callback Invoked when specified events occur, if events param is not a hash.
	   *
	   * @return {object} obj The object passed in.
	   */
	  on = function(obj, events, handler) {
	
	    var
	
	      type = Object.prototype.toString.call(events),
	
	      register = function(obj, event, handler) {
	        if (obj.addEventListener) {
	          obj.addEventListener(event, handler);
	        } else if (obj.on) {
	          obj.on(event, handler);
	        } else if (obj.attachEvent) {
	          obj.attachEvent('on' + event, handler);
	        } else {
	          throw new Error('object has no mechanism for adding event listeners');
	        }
	      },
	
	      i,
	      ii;
	
	    switch (type) {
	      case '[object String]':
	        register(obj, events, handler);
	        break;
	      case '[object Array]':
	        for (i = 0, ii = events.length; i<ii; i++) {
	          register(obj, events[i], handler);
	        }
	        break;
	      case '[object Object]':
	        for (i in events) {
	          if (events.hasOwnProperty(i)) {
	            register(obj, i, events[i]);
	          }
	        }
	        break;
	      default:
	        throw new Error('Unrecognized events parameter type: ' + type);
	    }
	
	    return obj;
	
	  },
	
	  /**
	   * Runs the callback at the next available opportunity.
	   * @see https://developer.mozilla.org/en-US/docs/Web/API/window.setImmediate
	   */
	  setImmediate = function(callback) {
	    return (
	      window.setImmediate ||
	      window.requestAnimationFrame ||
	      window.mozRequestAnimationFrame ||
	      window.webkitRequestAnimationFrame ||
	      window.setTimeout
	    )(callback, 0);
	  },
	
	  /**
	   * Clears a callback previously registered with `setImmediate`.
	   * @param {id} id The identifier of the callback to abort
	   */
	  clearImmediate = function(id) {
	    return (window.clearImmediate ||
	            window.cancelAnimationFrame ||
	            window.webkitCancelAnimationFrame ||
	            window.mozCancelAnimationFrame ||
	            window.clearTimeout)(id);
	  },
	
	  /**
	   * If ads are not playing, pauses the player at the next available
	   * opportunity. Has no effect if ads have started. This function is necessary
	   * because pausing a video element while processing a `play` event on iOS can
	   * cause the video element to continuously toggle between playing and paused
	   * states.
	   *
	   * @param {object} player The video player
	   */
	  cancelContentPlay = function(player) {
	    if (player.ads.cancelPlayTimeout) {
	      // another cancellation is already in flight, so do nothing
	      return;
	    }
	    player.ads.cancelPlayTimeout = setImmediate(function() {
	      // deregister the cancel timeout so subsequent cancels are scheduled
	      player.ads.cancelPlayTimeout = null;
	
	      // pause playback so ads can be handled.
	      if (!player.paused()) {
	        player.pause();
	      }
	
	      // add a contentplayback handler to resume playback when ads finish.
	      player.one('contentplayback', function() {
	        if (player.paused()) {
	          player.play();
	        }
	      });
	    });
	  },
	
	  /**
	   * Returns an object that captures the portions of player state relevant to
	   * video playback. The result of this function can be passed to
	   * restorePlayerSnapshot with a player to return the player to the state it
	   * was in when this function was invoked.
	   * @param {object} player The videojs player object
	   */
	  getPlayerSnapshot = function(player) {
	    var
	      tech = player.el().querySelector('.vjs-tech'),
	      tracks = player.remoteTextTracks ? player.remoteTextTracks() : [],
	      track,
	      i,
	      suppressedTracks = [],
	      snapshot = {
	        ended: player.ended(),
	        src: player.currentSrc(),
	        currentTime: player.currentTime(),
	        type: player.currentType()
	      };
	
	    if (tech) {
	      snapshot.nativePoster = tech.poster;
	      snapshot.style = tech.getAttribute('style');
	    }
	
	    i = tracks.length;
	    while (i--) {
	      track = tracks[i];
	      suppressedTracks.push({
	        track: track,
	        mode: track.mode
	      });
	      track.mode = 'disabled';
	    }
	    snapshot.suppressedTracks = suppressedTracks;
	
	    return snapshot;
	  },
	
	  removeClass = function(element, className) {
	    var
	      classes = element.className.split(/\s+/),
	      i = classes.length,
	      newClasses = [];
	    while (i--) {
	      if (classes[i] !== className) {
	        newClasses.push(classes[i]);
	      }
	    }
	    element.className = newClasses.join(' ');
	  },
	
	  /**
	   * Attempts to modify the specified player so that its state is equivalent to
	   * the state of the snapshot.
	   * @param {object} snapshot - the player state to apply
	   */
	  restorePlayerSnapshot = function(player, snapshot) {
	    var
	      // the playback tech
	      tech = player.el().querySelector('.vjs-tech'),
	
	      // the number of remaining attempts to restore the snapshot
	      attempts = 20,
	
	      suppressedTracks = snapshot.suppressedTracks,
	      trackSnapshot,
	      restoreTracks =  function() {
	        var i = suppressedTracks.length;
	        while (i--) {
	          trackSnapshot = suppressedTracks[i];
	          trackSnapshot.track.mode = trackSnapshot.mode;
	        }
	      },
	
	      // finish restoring the playback state
	      resume = function() {
	        var
	          ended = false,
	          updateEnded = function() {
	            ended = true;
	          };
	        player.currentTime(snapshot.currentTime);
	
	        // Resume playback if this wasn't a postroll
	        if (!snapshot.ended) {
	          player.play();
	        } else {
	          // On iOS 8.1, the "ended" event will not fire if you seek
	          // directly to the end of a video. To make that behavior
	          // consistent with the standard, fire a synthetic event if
	          // "ended" does not fire within 250ms. Note that the ended
	          // event should occur whether the browser actually has data
	          // available for that position
	          // (https://html.spec.whatwg.org/multipage/embedded-content.html#seeking),
	          // so it should not be necessary to wait for the seek to
	          // indicate completion.
	          window.setTimeout(function() {
	            if (!ended) {
	              player.play();
	            }
	            player.off('ended', updateEnded);
	          }, 250);
	          player.on('ended', updateEnded);
	        }
	      },
	
	      // determine if the video element has loaded enough of the snapshot source
	      // to be ready to apply the rest of the state
	      tryToResume = function() {
	        if (tech.readyState > 1) {
	          // some browsers and media aren't "seekable".
	          // readyState greater than 1 allows for seeking without exceptions
	          return resume();
	        }
	
	        if (tech.seekable === undefined) {
	          // if the tech doesn't expose the seekable time ranges, try to
	          // resume playback immediately
	          return resume();
	        }
	
	        if (tech.seekable.length > 0) {
	          // if some period of the video is seekable, resume playback
	          return resume();
	        }
	
	        // delay a bit and then check again unless we're out of attempts
	        if (attempts--) {
	          setTimeout(tryToResume, 50);
	        } else {
	          (function() {
	            try {
	              resume();
	            } catch(e) {
	              videojs.log.warn('Failed to resume the content after an advertisement', e);
	            }
	          })();
	        }
	      },
	
	      // whether the video element has been modified since the
	      // snapshot was taken
	      srcChanged;
	
	    if (snapshot.nativePoster) {
	      tech.poster = snapshot.nativePoster;
	    }
	
	    if ('style' in snapshot) {
	      // overwrite all css style properties to restore state precisely
	      tech.setAttribute('style', snapshot.style || '');
	    }
	
	    // Determine whether the player needs to be restored to its state
	    // before ad playback began. With a custom ad display or burned-in
	    // ads, the content player state hasn't been modified and so no
	    // restoration is required
	
	    if (player.src()) {
	      // the player was in src attribute mode before the ad and the
	      // src attribute has not been modified, no restoration is required
	      // to resume playback
	      srcChanged = player.src() !== snapshot.src;
	    } else {
	      // the player was configured through source element children
	      // and the currentSrc hasn't changed, no restoration is required
	      // to resume playback
	      srcChanged = player.currentSrc() !== snapshot.src;
	    }
	
	    if (srcChanged) {
	      // on ios7, fiddling with textTracks too early will cause safari to crash
	      player.one('contentloadedmetadata', restoreTracks);
	
	      // if the src changed for ad playback, reset it
	      player.src({ src: snapshot.src, type: snapshot.type });
	      // safari requires a call to `load` to pick up a changed source
	      player.load();
	      // and then resume from the snapshots time once the original src has loaded
	      player.one('contentcanplay', tryToResume);
	    } else if (!player.ended() || !snapshot.ended) {
	      // if we didn't change the src, just restore the tracks
	      restoreTracks();
	      // the src didn't change and this wasn't a postroll
	      // just resume playback at the current time.
	      player.play();
	    }
	  },
	
	  /**
	   * Remove the poster attribute from the video element tech, if present. When
	   * reusing a video element for multiple videos, the poster image will briefly
	   * reappear while the new source loads. Removing the attribute ahead of time
	   * prevents the poster from showing up between videos.
	   * @param {object} player The videojs player object
	   */
	  removeNativePoster = function(player) {
	    var tech = player.el().querySelector('.vjs-tech');
	    if (tech) {
	      tech.removeAttribute('poster');
	    }
	  },
	
	  // ---------------------------------------------------------------------------
	  // Ad Framework
	  // ---------------------------------------------------------------------------
	
	  // default framework settings
	  defaults = {
	    // maximum amount of time in ms to wait to receive `adsready` from the ad
	    // implementation after play has been requested. Ad implementations are
	    // expected to load any dynamic libraries and make any requests to determine
	    // ad policies for a video during this time.
	    timeout: 5000,
	
	    // maximum amount of time in ms to wait for the ad implementation to start
	    // linear ad mode after `readyforpreroll` has fired. This is in addition to
	    // the standard timeout.
	    prerollTimeout: 100,
	
	    // maximum amount of time in ms to wait for the ad implementation to start
	    // linear ad mode after `contentended` has fired.
	    postrollTimeout: 100,
	
	    // when truthy, instructs the plugin to output additional information about
	    // plugin state to the video.js log. On most devices, the video.js log is
	    // the same as the developer console.
	    debug: false
	  },
	
	  adFramework = function(options) {
	    var
	      player = this,
	
	      // merge options and defaults
	      settings = extend({}, defaults, options || {}),
	
	      fsmHandler;
	
	    // prefix all video element events during ad playback
	    // if the video element emits ad-related events directly,
	    // plugins that aren't ad-aware will break. prefixing allows
	    // plugins that wish to handle ad events to do so while
	    // avoiding the complexity for common usage
	    (function() {
	      var
	        videoEvents = videojs.Html5.Events,
	        i,
	        returnTrue = function() { return true; },
	        triggerEvent = function(type, event) {
	          // pretend we called stopImmediatePropagation because we want the native
	          // element events to continue propagating
	          event.isImmediatePropagationStopped = returnTrue;
	          event.cancelBubble = true;
	          event.isPropagationStopped = returnTrue;
	          player.trigger({
	            type: type + event.type,
	            state: player.ads.state,
	            originalEvent: event
	          });
	        },
	        redispatch = function(event) {
	          if (player.ads.state === 'ad-playback') {
	            triggerEvent('ad', event);
	          } else if (player.ads.state === 'content-playback' && event.type === 'ended') {
	            triggerEvent('content', event);
	          } else if (player.ads.state === 'content-resuming') {
	            if (player.ads.snapshot) {
	              // the video element was recycled for ad playback
	              if (player.currentSrc() !== player.ads.snapshot.src) {
	                if (event.type === 'loadstart') {
	                  return;
	                }
	                return triggerEvent('content', event);
	
	              // we ended playing postrolls and the video itself
	              // the content src is back in place
	              } else if (player.ads.snapshot.ended) {
	                if ((event.type === 'pause' ||
	                    event.type === 'ended')) {
	                  // after loading a video, the natural state is to not be started
	                  // in this case, it actually has, so, we do it manually
	                  player.addClass('vjs-has-started');
	                  // let `pause` and `ended` events through, naturally
	                  return;
	                }
	                // prefix all other events in content-resuming with `content`
	                return triggerEvent('content', event);
	              }
	            }
	            if (event.type !== 'playing') {
	              triggerEvent('content', event);
	            }
	          }
	        };
	
	      //Add video.js specific events
	      videoEvents.push('firstplay');
	      videoEvents.push('loadedalldata');
	
	      i = videoEvents.length;
	      while (i--) {
	        player.on(videoEvents[i], redispatch);
	      }
	      return redispatch;
	    })();
	
	    // We now auto-play when an ad gets loaded if we're playing ads in the same video element as the content.
	    // The problem is that in IE11, we cannot play in addurationchange but in iOS8, we cannot play from adcanplay.
	    // This will allow ad-integrations from needing to do this themselves.
	    player.on(['addurationchange', 'adcanplay'], function() {
	      var snapshot = player.ads.snapshot;
	      if (player.currentSrc() === snapshot.src) {
	        return;  // do nothing
	      }
	
	      player.play();
	    });
	
	    // replace the ad initializer with the ad namespace
	    player.ads = {
	      state: 'content-set',
	
	      // Call this when an ad response has been recieved and there are
	      // linear ads ready to be played.
	      startLinearAdMode: function() {
	        if (player.ads.state !== 'ad-playback') {
	          player.trigger('adstart');
	        }
	      },
	
	      // Call this when a linear ad pod has finished playing.
	      endLinearAdMode: function() {
	        if (player.ads.state === 'ad-playback') {
	          player.trigger('adend');
	        }
	      },
	
	      // Call this when an ad response has been recieved but there are no
	      // linear ads to be played (i.e. no ads available, or overlays).
	      // This has no effect if we are already in a linear ad mode.  Always
	      // use endLinearAdMode() to exit from linear ad-playback state.
	      skipLinearAdMode: function() {
	        if (player.ads.state !== 'ad-playback') {
	          player.trigger('adskip');
	        }
	      }
	    };
	
	    fsmHandler = function(event) {
	      // Ad Playback State Machine
	      var
	        fsm = {
	          'content-set': {
	            events: {
	              'adscanceled': function() {
	                this.state = 'content-playback';
	              },
	              'adsready': function() {
	                this.state = 'ads-ready';
	              },
	              'play': function() {
	                this.state = 'ads-ready?';
	                cancelContentPlay(player);
	                // remove the poster so it doesn't flash between videos
	                removeNativePoster(player);
	              },
	              'adserror': function() {
	                this.state = 'content-playback';
	              },
	              'adskip': function() {
	                this.state = 'content-playback';
	              }
	            }
	          },
	          'ads-ready': {
	            events: {
	              'play': function() {
	                this.state = 'preroll?';
	                cancelContentPlay(player);
	              },
	              'adskip': function() {
	                this.state = 'content-playback';
	              },
	              'adserror': function() {
	                this.state = 'content-playback';
	              }
	            }
	          },
	          'preroll?': {
	            enter: function() {
	              // change class to show that we're waiting on ads
	              player.el().className += ' vjs-ad-loading';
	              // schedule an adtimeout event to fire if we waited too long
	              player.ads.timeout = window.setTimeout(function() {
	                player.trigger('adtimeout');
	              }, settings.prerollTimeout);
	              // signal to ad plugin that it's their opportunity to play a preroll
	              player.trigger('readyforpreroll');
	            },
	            leave: function() {
	              window.clearTimeout(player.ads.timeout);
	              removeClass(player.el(), 'vjs-ad-loading');
	            },
	            events: {
	              'play': function() {
	                cancelContentPlay(player);
	              },
	              'adstart': function() {
	                this.state = 'ad-playback';
	              },
	              'adskip': function() {
	                this.state = 'content-playback';
	              },
	              'adtimeout': function() {
	                this.state = 'content-playback';
	              },
	              'adserror': function() {
	                this.state = 'content-playback';
	              }
	            }
	          },
	          'ads-ready?': {
	            enter: function() {
	              player.el().className += ' vjs-ad-loading';
	              player.ads.timeout = window.setTimeout(function() {
	                player.trigger('adtimeout');
	              }, settings.timeout);
	            },
	            leave: function() {
	              window.clearTimeout(player.ads.timeout);
	              removeClass(player.el(), 'vjs-ad-loading');
	            },
	            events: {
	              'play': function() {
	                cancelContentPlay(player);
	              },
	              'adscanceled': function() {
	                this.state = 'content-playback';
	              },
	              'adsready': function() {
	                this.state = 'preroll?';
	              },
	              'adskip': function() {
	                this.state = 'content-playback';
	              },
	              'adtimeout': function() {
	                this.state = 'content-playback';
	              },
	              'adserror': function() {
	                this.state = 'content-playback';
	              }
	            }
	          },
	          'ad-playback': {
	            enter: function() {
	              // capture current player state snapshot (playing, currentTime, src)
	              this.snapshot = getPlayerSnapshot(player);
	
	              // add css to the element to indicate and ad is playing.
	              player.el().className += ' vjs-ad-playing';
	
	              // remove the poster so it doesn't flash between ads
	              removeNativePoster(player);
	
	              // We no longer need to supress play events once an ad is playing.
	              // Clear it if we were.
	              if (player.ads.cancelPlayTimeout) {
	                clearImmediate(player.ads.cancelPlayTimeout);
	                player.ads.cancelPlayTimeout = null;
	              }
	            },
	            leave: function() {
	              removeClass(player.el(), 'vjs-ad-playing');
	              restorePlayerSnapshot(player, this.snapshot);
	              // trigger 'adend' as a consistent notification
	              // event that we're exiting ad-playback.
	              if (player.ads.triggerevent !== 'adend') {
	                player.trigger('adend');
	              }
	            },
	            events: {
	              'adend': function() {
	                this.state = 'content-resuming';
	              },
	              'adserror': function() {
	                this.state = 'content-resuming';
	              }
	            }
	          },
	          'content-resuming': {
	            enter: function() {
	              if (this.snapshot.ended) {
	                window.clearTimeout(player.ads._fireEndedTimeout);
	                // in some cases, ads are played in a swf or another video element
	                // so we do not get an ended event in this state automatically.
	                // If we don't get an ended event we can use, we need to trigger
	                // one ourselves or else we won't actually ever end the current video.
	                player.ads._fireEndedTimeout = window.setTimeout(function() {
	                  player.trigger('ended');
	                }, 1000);
	              }
	            },
	            leave: function() {
	              window.clearTimeout(player.ads._fireEndedTimeout);
	            },
	            events: {
	              'contentupdate': function() {
	                this.state = 'content-set';
	              },
	              'playing': function() {
	                this.state = 'content-playback';
	              },
	              'ended': function() {
	                this.state = 'content-playback';
	              }
	            }
	          },
	          'postroll?': {
	            enter: function() {
	              this.snapshot = getPlayerSnapshot(player);
	
	              player.el().className += ' vjs-ad-loading';
	
	              player.ads.timeout = window.setTimeout(function() {
	                player.trigger('adtimeout');
	              }, settings.postrollTimeout);
	            },
	            leave: function() {
	              window.clearTimeout(player.ads.timeout);
	              removeClass(player.el(), 'vjs-ad-loading');
	            },
	            events: {
	              'adstart': function() {
	                this.state = 'ad-playback';
	              },
	              'adskip': function() {
	                this.state = 'content-resuming';
	                setImmediate(function() {
	                  player.trigger('ended');
	                });
	              },
	              'adtimeout': function() {
	                this.state = 'content-resuming';
	                setImmediate(function() {
	                  player.trigger('ended');
	                });
	              },
	              'adserror': function() {
	                this.state = 'content-resuming';
	                setImmediate(function() {
	                  player.trigger('ended');
	                });
	              }
	            }
	          },
	          'content-playback': {
	            enter: function() {
	              // make sure that any cancelPlayTimeout is cleared
	              if (player.ads.cancelPlayTimeout) {
	                clearImmediate(player.ads.cancelPlayTimeout);
	                player.ads.cancelPlayTimeout = null;
	              }
	              // this will cause content to start if a user initiated
	              // 'play' event was canceled earlier.
	              player.trigger({
	                type: 'contentplayback',
	                triggerevent: player.ads.triggerevent
	              });
	            },
	            events: {
	              // in the case of a timeout, adsready might come in late.
	              'adsready': function() {
	                player.trigger('readyforpreroll');
	              },
	              'adstart': function() {
	                this.state = 'ad-playback';
	              },
	              'contentupdate': function() {
	                if (player.paused()) {
	                  this.state = 'content-set';
	                } else {
	                  this.state = 'ads-ready?';
	                }
	              },
	              'contentended': function() {
	                this.state = 'postroll?';
	              }
	            }
	          }
	        };
	
	      (function(state) {
	        var noop = function() {};
	
	        // process the current event with a noop default handler
	        ((fsm[state].events || {})[event.type] || noop).apply(player.ads);
	
	        // check whether the state has changed
	        if (state !== player.ads.state) {
	
	          // record the event that caused the state transition
	          player.ads.triggerevent = event.type;
	
	          // execute leave/enter callbacks if present
	          (fsm[state].leave || noop).apply(player.ads);
	          (fsm[player.ads.state].enter || noop).apply(player.ads);
	
	          // output debug logging
	          if (settings.debug) {
	            videojs.log('ads', player.ads.triggerevent + ' triggered: ' + state + ' -> ' + player.ads.state);
	          }
	        }
	
	      })(player.ads.state);
	
	    };
	
	    // register for the events we're interested in
	    on(player, vjs.Html5.Events.concat([
	      // events emitted by ad plugin
	      'adtimeout',
	      'contentupdate',
	      'contentplaying',
	      'contentended',
	
	      // events emitted by third party ad implementors
	      'adsready',
	      'adserror',
	      'adscanceled',
	      'adstart',  // startLinearAdMode()
	      'adend',    // endLinearAdMode()
	      'adskip'    // skipLinearAdMode()
	    ]), fsmHandler);
	
	    // keep track of the current content source
	    // if you want to change the src of the video without triggering
	    // the ad workflow to restart, you can update this variable before
	    // modifying the player's source
	    player.ads.contentSrc = player.currentSrc();
	
	    // implement 'contentupdate' event.
	    (function(){
	      var
	        // check if a new src has been set, if so, trigger contentupdate
	        checkSrc = function() {
	          var src;
	          if (player.ads.state !== 'ad-playback') {
	            src = player.currentSrc();
	            if (src !== player.ads.contentSrc) {
	              player.trigger({
	                type: 'contentupdate',
	                oldValue: player.ads.contentSrc,
	                newValue: src
	              });
	              player.ads.contentSrc = src;
	            }
	          }
	        };
	      // loadstart reliably indicates a new src has been set
	      player.on(['loadstart'], checkSrc);
	      // check immediately in case we missed the loadstart
	      setImmediate(checkSrc);
	    })();
	
	    // kick off the fsm
	    if (!player.paused()) {
	      // simulate a play event if we're autoplaying
	      fsmHandler({type:'play'});
	    }
	
	  };
	
	  // register the ad plugin framework
	  vjs.plugin('ads', adFramework);
	
	})(window, document, videojs);
	; browserify_shim__define__module__export__(typeof contribAds != "undefined" ? contribAds : window.contribAds);
	
	}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });
	
	}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	},{}],3:[function(require,module,exports){
	var jsutils = require('jsutils');
	
	function bridge() {
		"use strict";
	    var logger = jsutils.createLogger(false, 'Ads Flash Overlay');
		var player;
		var metadata;
		var swfObject;
		var vpTimeout;
		var vpTimeoutValue = 30000;
		var playDenied = false;
		var vpAvailable = false;
		var loadingError = false;
		var timeoutInitiated = false;
		var loader;
		var state = {
			fullscreen: false,
			mute: false,
			postroll: false,
			adPlaying: false,
			playedAd: false,
			playedPreroll: false,
			volumeChangePending: false
		};
		var elementId;
		var adIsPlaying = false;
	
		function init(playerObj, config, flashElementId) {
			var swfElement;
			player = playerObj;
			metadata = config;
			elementId = flashElementId;
			loader = document.getElementById(elementId).parentNode;
	
			setTimeoutValue(config);
	
			//global object required for js-flash interaction
			window.vpBridge = window.vpBridge || {};
			window.vpBridge[elementId] = flashEventHandler;
	
		}
	
		function getSwfObject() {
			return document.getElementById(elementId);
		}
	
		function setTimeoutValue(config) {
			if (config.optional && config.optional.flashTimeout) {
				vpTimeoutValue = config.optional.flashTimeout * 1000;
			}
		}
	
		function playPreroll() {
			var adSize = getAdPlayerSize();
			state.playedPreroll = true;
			state.postroll = false;
			swfObject.sendToFlash('video-start');
			logger.log('start flash ad', adSize.width, adSize.height);
			swfObject.start(metadata, adSize.width, adSize.height);
			state.adPlaying = true;
			logger.log('BRIDGE playPreroll pause video');
			player.pause();
		}
	
		function isSwfAvailable() {
			if( !swfObject || !swfObject.sendToFlash ) {
				vpAvailable = false;
				return false;
			} else {
				return true;
			}
		}
	
		function hideAdPlayer() {
			loader.className = "";
			player.controlBar.el().style.display = '';
		}
	
		function showAdPlayer() {
			player.pause();
			loader.className = loader.id;
			if( swfObject && swfObject.toggleFullscreen ) {
				swfObject.toggleFullscreen(getAdPlayerSize().width, getAdPlayerSize().height, 'normal');
			}
			player.controlBar.el().style.display = 'none';
		}
	
		function getAdPlayerSize() {
			return {
				width: player.el().offsetWidth,
				height: player.el().offsetHeight
			};
		}
	
		function toggleFullscreen() {
			if (!vpAvailable) return;
			if (!state.adPlaying) return;
	
			if (!state.fullscreen) {
				state.fullscreen = true;
	
				var i1 = setInterval(function(){
					showAdPlayer();
				}, 50);
	
				setTimeout(function(){
					clearInterval(i1);
				}, 510);
			} else {
				var i2 = setInterval(function(){
					showAdPlayer();
				}, 50);
				setTimeout(function(){
					clearInterval(i2);
				}, 510);
	
				state.fullscreen = false;
			}
		}
	
		function playPostroll() {
			if (!vpAvailable || state.postroll) return;
	
			showAdPlayer();
			if( swfObject && swfObject.sendToFlash ) {
				swfObject.sendToFlash('video-ended');
			}
			state.postroll = true;
		}
	
		function playAd() {
			player.pause();
			showAdPlayer();
	
			state.adPlaying = true;
		}
	
		/**
		 * Do necessary validations and then play prerolls if possible
		 * 1. Make sure flash is loaded
		 * @return {[type]} [description]
		 */
		function onPlay() {
			logger.log('onPlay ad state', player.ads.state);
			if (player.ads.state === "ad-playback") {
				player.pause();
			} else {
				if (canPlayPreroll()) {
					playPreroll();
				} else {
					denyPlay();
				}
			}
	
		}
	
		function canPlayPreroll() {
			logger.log('canPlayPreroll', isSwfAvailable(), vpAvailable, !state.playedPreroll);
			if (!isSwfAvailable()) return false;
			if (!vpAvailable) return false;
			if (state.playedPreroll) return false; //not becoming true atm
			if (loadingError) return false;
	
			return true;
		}
	
		/**
		 * As long as the plugin is waiting for AdPlayerReady, pause player every time a play event is received
		 * Reset state of plugin, so the plays received don't count as real plays
		 */
		function denyPlay() {
			logger.log('BRIDGE denyPlay', state.playedAd, loadingError)
			/*if ad has been played already or there was an loading error, do not deny play*/
			if (state.playedAd || loadingError) return;
			playDenied = true;
			player.pause();
			startFlashTimeout();
		}
	
		function startFlashTimeout() {
			logger.log('BRIDGE: Start Flash Timeout');
			if (timeoutInitiated) return;
			vpTimeout = setTimeout(function(){
				logger.log('BRIDGE flash timeout hit');
				playDenied = false;
				loadingError = true;
				state.playedPreroll = true; //in case there was a timeout, avoid the preroll play on a future unrelated play event
	
				if (!adIsPlaying) {
					player.play();
				}
			}, vpTimeoutValue);
			timeoutInitiated = true;
		}
	
		function allowPlay() {
			logger.log('allow play hit but play is not denied');
			if (!playDenied) return;
			logger.log('allow play triggerd');
			clearInterval(vpTimeout);
			playDenied = false;
			player.play();
		}
	
		/**
		 * Order of events:
		 * 1. AdPlayerReady (no need for any interaction for this to be fired by the flash player)
		 * 2. AdPlayerStart
		 */
		function flashEventHandler(eventType) {
			switch (eventType) {
				case 'AdPlayerReady':
					logger.log('BRIDGE: AdPlayerReady');
					adPlayerReady();
					allowPlay();
					if (!loadingError) {
						player.trigger('adsready');
					}
					break;
				case 'AdPlayerStart':
					player.trigger('adsready');
					logger.log('BRIDGE: AdPlayerStart');
					adIsPlaying = true;
					playAd();
					logger.log('AdPlayerStart');
					setTimeout(function(){
						player.ads.startLinearAdMode();
					}, 50);
					break;
				case 'AdPlayerComplete':
					player.ads.endLinearAdMode();
					state.playedAd = true;
					adIsPlaying = false;
					resumePlayback();
					logger.log('BRIDGE: AdPlayerComplete');
					break;
				case 'ad-ended':
					logging(eventType);
					break;
				case 'ad-failed':
					logging(eventType);
					break;
				case 'ad-timeout':
					logging(eventType);
					break;
				case 'AdLoaded':
					logger.log('BRIDGE: AdLoaded');
					// playAd();
					break;
				// default:
			}
		}
	
		function resumePlayback() {
			state.adPlaying = false;
			hideAdPlayer();
			player.play();
			if (state.postroll) player.currentTime(player.duration() - 0.4);
		}
	
		function adPlayerReady() {
			vpAvailable = true;
			swfObject = getSwfObject();
			changeVolume();
			// player.show();
			// hideAdPlayer();
		}
	
		function trackTime(event) {
			if (!vpAvailable) return;
			if( swfObject && player && swfObject.updateTime && player.currentTime ) {
				swfObject.updateTime(player.currentTime());
			}
		}
	
		function logging(eventType) {
			logger.log(eventType)
		}
	
		/**
		 * Checks if current flag exists in the flags array
		 * @param  {[type]}  adType [description]
		 * @return {Boolean}        [description]
		 */
		function hasFlag(flag) {
			if (!metadata.flags) return;
	
			var flags = metadata.flags;
			for (var i=0; i<flags.length; i++) {
				if (flags[i] === flag) {
					return true;
				}
			}
			return false;
		}
	
		function volumeChanged(evt){
			if (!swfObject) return;
			changeVolume();
		}
	
		function changeVolume() {
			if (player.volume() === 0 || player.muted()) {
				swfObject.setVolume(0);
			} else {
				swfObject.setVolume(player.volume());
			}
		}
	
		function reset() {
			state.playedPreroll = false;
			state.adPlaying = false;
			loadingError = false;
			logger.log('reset');
		}
	
		function pauseAd() {
			if (!isSwfAvailable()) return;
			swfObject.sendToFlash('pause-ad');
		}
	
		function resumeAd() {
			if (!isSwfAvailable()) return;
			swfObject.sendToFlash('resume-ad');
		}
	
		return {
			init: init,
			onPlay: onPlay,
			updateTime: trackTime,
			onEnd: playPostroll,
			toggleFullscreen: toggleFullscreen,
			volumeChanged: volumeChanged,
			pauseAd: pauseAd,
			resumeAd: resumeAd,
			reset: reset
		};
	}
	
	module.exports = bridge;
	},{"jsutils":11}],4:[function(require,module,exports){
	"use strict";
	//change this based on the interface you want to use or make it configurable
	var videojsInterface = require('./videojsInterface'); //modularised
	var jsutils = require('jsutils');
	
	function flashBridge() {
	    var pluginInterface = videojsInterface();
	    var logger = jsutils.createLogger(false, 'Ads Flash Overlay');
	
	
	    return {
	        flashComponent: pluginInterface
	    };
	}
	
	module.exports = flashBridge;
	},{"./videojsInterface":5,"jsutils":11}],5:[function(require,module,exports){
	"use strict";
	var bridgeModule = require("./bridge");
	var jsutils = require('jsutils');
	
	function videojsInterface() {
	    var player, metadata, bridge;
	    var logger = jsutils.createLogger(false, 'Ads Flash Overlay');
	
	
	    function init(playerObj, config, flashElementId) {
	        config.contentduration = playerObj.duration();
	        bridge = bridgeModule();
	
	        player = playerObj;
	        metadata = config;
	
	
	        playerEventHandlers();
	        initApi();
	
	        bridge.init(playerObj, config, flashElementId);
	
	    }
	    // Events: JS -> Flash: Video Paused, Video Resumed, Video End
	    function playerEventHandlers() {
	        player.on('play', bridge.onPlay);
	        player.on('timeupdate', function(){
	            bridge.updateTime();
	            checkPostroll();
	        });
	        player.on('ended', function(){
	            bridge.reset();
	        });
	        player.on('fullscreenchange', bridge.toggleFullscreen);
	        player.on('volumechange', bridge.volumeChanged);
	        player.on('adfullscreenchange', bridge.toggleFullscreen);
	        player.on('advolumechange', bridge.volumeChanged);
	        player.on('contentupdate', function(){
	            logger.log('contentupdate flash');
	            bridge.reset();
	            player.pause();
	            player.play();
	        });
	    }
	
	    function initApi() {
	        player.vpApi.pauseAd = function() {
	            if (player.ads.state !== 'ad-playback') return;
	            bridge.pauseAd();
	        };
	        player.vpApi.resumeAd = function() {
	            if (player.ads.state !== 'ad-playback') return;
	            bridge.resumeAd();
	        };
	    }
	
	    function checkPostroll() {
	        if (player.currentTime()*1000 > (player.duration()*1000 - 700)) {
	            bridge.onEnd();
	        }
	    }
	
	    return {
	        init: init
	    };
	}
	
	module.exports = videojsInterface;
	},{"./bridge":3,"jsutils":11}],6:[function(require,module,exports){
	(function (global){
	; var __browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
	/* 
	* !html5-sdk v1.0.14.17.1 | client-side HTML5 SDK 
	* Copyright (c) 2014   by Videoplaza, www.videoplaza.com 
	* email: info@videoplaza.com 
	*/ 
	!function(window,a){"use strict";var error={},model={},parse={},request={},format={},core={error:error,model:model,parse:parse,request:request,format:format};core.debugMessage=function(a){return window.videoplaza.debug&&window.videoplaza.debug[a]?window.videoplaza.debug[a]:a},function(core){core.error.ParseError=function(a){this.message=a,this.name="ParseError"},core.error.ParseError.prototype=new window.Error,core.error.ParseError.prototype.constructor=core.error.ParseError}(core),function(core){core.Tracker=function(){var a,b=function(){a=new core.request.VpTracker},c=function(b,error){return a.reportError(b,error)},d=function(b,c){return a.track(b,c)};return b.prototype={reportError:c,track:d},b}(),core.Tracker.errorEvents={ad:{error:"error"},creative:{invalidCreativeUri:"invalidCreativeUri",invalidCreative:"invalidCreative"}},core.Tracker.trackingEvents={ad:{impression:"0"},creative:{acceptInvitation:"1",clickThrough:"20",close:"7",creativeView:"90",collapse:"2",complete:"18",expand:"31",firstQuartile:"15",fullscreen:"37",midpoint:"16",mute:"32",pause:"34",resume:"36",rewind:"35",start:"14",thirdQuartile:"17",timeSpent:"100",unmute:"33"}}}(core),function(core){core.request.VpXHR=function(){},core.request.VpXHR.httpErrorCodeTranslation={503:"serviceUnavailableCode503",500:"internalServerErrorCode500",404:"requestedResourceNotFoundCode404",400:"badRequestToServerCode400",0:"requestCouldNotBeSentToServerCode0",ieError:"requestFailedError"},core.request.VpXHR.prototype.request=function(a,b,c,d){var e,f,g,h="GET";if(b||(b=2e3),c||(c=function(){}),d||(d=function(){}),window.XMLHttpRequest)if(e=new window.XMLHttpRequest,"withCredentials"in e){try{e.withCredentials=!0}catch(i){}try{e.open(h,a,!0),f=!1}catch(i){return void d(core.request.VpXHR.httpErrorCodeTranslation[0])}e.onreadystatechange=function(){4===e.readyState&&(g&&window.clearTimeout(g),200===e.status?c(e.responseText):f||d(core.request.VpXHR.httpErrorCodeTranslation[e.status]||"unknownError"))},g=window.setTimeout(function(){f=!0,e.abort(),d("requestTimeout")},b),e.send()}else if(window.XDomainRequest){e=new window.XDomainRequest,e.onload=function(){c(e.responseText)},e.onerror=function(){d(core.request.VpXHR.httpErrorCodeTranslation.ieError||"unknownError")},e.onprogress=function(){},e.ontimeout=function(){d("requestTimeout")};try{e.open(h,a),e.timeout=b,e.send()}catch(i){d(core.request.VpXHR.httpErrorCodeTranslation.ieError||"unknownError")}}else d("corsNotSupportedInBrowser")}}(core),function(core){core.request.Bucket=function(){},core.request.Bucket.isBucketEvent=function(){return!1},core.request.Bucket.prototype.add=function(){return!1},core.request.Bucket.prototype.empty=function(){return!1}}(core),function(core){core.request.LocalStorage=function(a){this.pidKey=a},core.request.LocalStorage.prototype.getObjectFromUri=function(a){var b={},c=a.split("?");if(c.length>0){if(b.base=c[0],b.params={},c[1])for(var d=c[1].split("&"),e=0;e<d.length;e++){var f=d[e].split("=");b.params[f[0]]=f[1]?f[1]:null}else b.params=null;return b}return null},core.request.LocalStorage.prototype.supportsLocalStorage=function(){try{return"localStorage"in window&&null!==window.localStorage}catch(a){return!1}},core.request.LocalStorage.prototype.getData=function(a){try{return localStorage.getItem(a)}catch(b){return null}},core.request.LocalStorage.prototype.setData=function(a,b){try{return localStorage.setItem(a,b),!0}catch(c){return!1}},core.request.LocalStorage.prototype.removeData=function(a){try{return localStorage.removeItem(a),!0}catch(b){return!1}},core.request.LocalStorage.prototype.getPersistentIdFromTicket=function(a){var b=null;if(this.supportsLocalStorage()&&a.length>0){var c=this.getObjectFromUri(a[0].trackingUris.impression[0]);if(c&&c.params&&c.params.pid&&(b=c.params.pid,!this.setData(this.pidKey,b)))return null}return b},core.request.LocalStorage.prototype.getPersistentIdFromLocalStorage=function(){return this.supportsLocalStorage()?this.getData(this.pidKey):null}}(core),function(core){function a(b){if(null===b||"object"!=typeof b)return b;var c=new b.constructor;for(var d in b)b.hasOwnProperty(d)&&(c[d]=a(b[d]));return c}function b(a){var b={};for(var c in a)if(a.hasOwnProperty(c)){b[c]={};for(var d in a[c])a[c].hasOwnProperty(d)&&(b[c][a[c][d]]=d)}return b}function c(a){var b,c=/\[CACHEBUSTING\]|%5BCACHEBUSTING%5D/;return c.test(a)&&(b=Math.floor(89999999*Math.random()+1e7),a=a.replace(c,b.toString())),a}core.request.VpTracker=function(){this.vpXHR=new core.request.VpXHR,this.bucket=new core.request.Bucket,this.blocked={}},core.request.VpTracker.errorEvents=a(core.Tracker.errorEvents),core.request.VpTracker.trackingEvents=a(core.Tracker.trackingEvents),core.request.VpTracker.trackingEvents.ad.impression2="3",core.request.VpTracker.trackingEvents.creative.creativeView2="91",core.request.VpTracker.trackingEvents.creative.acceptInvitation2="4",core.request.VpTracker.trackingEvents.creative.interaction="10",core.request.VpTracker.errorEventNames=b(core.request.VpTracker.errorEvents),core.request.VpTracker.trackingEventNames=b(core.request.VpTracker.trackingEvents),core.request.VpTracker.prototype.trackUris=function(a){for(var b="",d=0;d<a.length;d++)b=a[d],core.request.Bucket.isBucketEvent(b)?this.bucket.add(c(a[d])):this.vpXHR.request(c(b),2e3)},core.request.VpTracker.prototype.block=function(a,b){return b||(b=""),a instanceof core.model.Trackable?(this.blocked[a.uniqueId+b]=!0,!0):!1},core.request.VpTracker.prototype.isBlocked=function(a,b){return b||(b=""),a instanceof core.model.Trackable?a.uniqueId+b in this.blocked:!1},core.request.VpTracker.prototype.trackCreativeEvent=function(a,b){var c,d=core.request.VpTracker.trackingEvents.creative,e=[d.clickThrough,d.creativeView,d.creativeView2],f=[d.acceptInvitation,d.clickThrough,d.close,d.collapse,d.expand,d.fullscreen,d.pause,d.resume,d.rewind,d.mute,d.unmute],g=[d.acceptInvitation,d.interaction,d.start,d.firstQuartile,d.midpoint,d.thirdQuartile,d.complete],h=[d.creativeView];return a instanceof core.model.Creative&&core.request.VpTracker.trackingEventNames.creative[b]?a instanceof core.model.Companion&&e.indexOf(b)<0?!1:(c=a.parent,this.isBlocked(c)||this.isBlocked(a)?!1:(f.indexOf(b)>-1&&a.type!==core.model.Creative.creativeTypes.companion&&this.track(a,d.interaction),b===d.complete?this.track(a,d.thirdQuartile):b===d.thirdQuartile?this.track(a,d.midpoint):b===d.midpoint?this.track(a,d.firstQuartile):b===d.firstQuartile&&this.track(a,d.start),b===d.timeSpent?!0:b!==d.clickThrough||a.type!==core.model.Creative.creativeTypes.nonLinear&&a.type!==core.model.Creative.creativeTypes.companion?(this.isBlocked(c,b)||this.isBlocked(a,b)?b===d.acceptInvitation?this.track(a,core.request.VpTracker.trackingEvents.creative.acceptInvitation2):b===d.creativeView&&this.track(a,core.request.VpTracker.trackingEvents.creative.creativeView2):(g.indexOf(b)>-1&&this.block(c,b),h.indexOf(b)>-1&&this.block(a,b),this.trackUris(a.trackingUris[core.request.VpTracker.trackingEventNames.creative[b]])),!0):a.resourceType!==core.model.NonLinearCreative.resourceTypes.staticResource?!1:!0)):!1},core.request.VpTracker.prototype.trackAdEvent=function(a,b){return a.constructor===core.model.Ad&&core.request.VpTracker.trackingEventNames.ad[b]?this.isBlocked(a)?!1:a.type===core.model.Ad.types.inventory&&b===core.request.VpTracker.trackingEvents.ad.impression?(this.block(a),this.trackUris(a.trackingUris[core.request.VpTracker.errorEventNames.ad.error]),!0):(this.isBlocked(a,b)?b===core.request.VpTracker.trackingEvents.ad.impression&&this.track(a,core.request.VpTracker.trackingEvents.ad.impression2):(b===core.request.VpTracker.trackingEvents.ad.impression&&this.block(a,b),this.trackUris(a.trackingUris[core.request.VpTracker.trackingEventNames.ad[b]])),!0):!1},core.request.VpTracker.prototype.track=function(a,b){return a?a.constructor===core.model.Ad?this.trackAdEvent(a,b):a instanceof core.model.Creative?this.trackCreativeEvent(a,b):!1:!1},core.request.VpTracker.prototype.reportError=function(a,b){var c;return a&&a instanceof core.model.Creative&&core.request.VpTracker.errorEventNames.creative[b]?(c=a.parent,this.isBlocked(c)||this.isBlocked(a)?!1:(a.type===core.model.Creative.creativeTypes.companion?this.block(a):(this.isBlocked(c,core.request.VpTracker.trackingEvents.ad.impression)||this.track(c,core.request.VpTracker.errorEventNames.ad.error),this.block(c)),!0)):!1}}(core),function(core){function b(a){return/(^(http|https)\:\/\/)?([a-z0-9\-]+)\.([a-z0-9\-]+)\.[a-z]+/i.test(a)}function c(a){var b;return a&&a.constructor===core.model.Ad?(b=new core.model.Ad,b.type=core.model.Ad.types.inventory,b.trackingUris=a.trackingUris,b):!1}core.request.VpAdCallModule=function(a,c){if(!b(a))throw new Error(core.debugMessage("invalidVpHost"));this.vpHost=a,this.adCallModuleSettings=c,this.videoplazaXHR=new core.request.VpXHR,this.vastParser=new core.parse.VastXmlParser,this.vpLocalStorage=new core.request.LocalStorage("vpPID")},core.request.VpAdCallModule.browser=function(){function a(a){return a in document.documentElement.style}var b=a("MozBoxSizing"),c=Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor")>0,d=!c&&a("WebkitTransform"),e=!1||a("msTransform");return{isSafari:c,isChrome:d,isIE:e,isFirefox:b}}(),core.request.VpAdCallModule.hasData=function(a){return a?a.constructor===Array&&0===a.length?!1:!0:!1},core.request.VpAdCallModule.validateNumber=function(a,b){if(a){if(core.request.VpAdCallModule.isNumber(a)){if(0>a)throw new Error(core.debugMessage(b+"IsLessThanZero"));return!0}throw new Error(core.debugMessage(b+"IsNaN"))}return b+"IsMissing"},core.request.VpAdCallModule.isNumber=function(a){return!isNaN(parseFloat(a))&&isFinite(a)},core.request.VpAdCallModule.prototype.verifyRequestSettings=function(a,b){var c={height:"",width:"",maxBitRate:"",insertionPointType:"",playbackPosition:""},d="";if(!a)throw new Error(core.debugMessage("requestSettingsIsUndefined"));if(c.height=core.request.VpAdCallModule.validateNumber(a.height,"height"),c.width=core.request.VpAdCallModule.validateNumber(a.width,"width"),c.maxBitRate=core.request.VpAdCallModule.validateNumber(a.maxBitRate,"maxBitRate"),!a.insertionPointType)throw new Error(core.debugMessage("undefinedInsertionPointType"));switch(d=a.insertionPointType.toLowerCase()){case"onbeforecontent":case"oncontentend":case"playbacktime":c.insertionPointType="true";break;case"playbackposition":if(c.insertionPointType="true",!a.playbackPosition)throw new Error(core.debugMessage("undefinedPlaybackPosition"));if(c.playbackPosition="true",!core.request.VpAdCallModule.isNumber(a.playbackPosition))throw new Error(core.debugMessage("invalidPlaybackPosition"));if(core.request.VpAdCallModule.hasData(b)&&Number(a.playbackPosition)>Number(b))throw new Error(core.debugMessage("playbackPositionIsGtDuration"));break;default:throw new Error(core.debugMessage("invalidInsertionPointType"))}return c},core.request.VpAdCallModule.prototype.verifyContentMetadata=function(a){var b={contentForm:"",duration:""};if(!a)throw new Error(core.debugMessage("contentMetadataIsUndefined"));if(core.request.VpAdCallModule.hasData(a.contentForm)){var c=a.contentForm.toLowerCase();if(b.contentForm="true","shortform"!==c&&"longform"!==c)throw new Error(core.debugMessage("invalidContentForm"))}else b.contentForm="contentFormIsMissing";return b.duration=core.request.VpAdCallModule.validateNumber(a.duration,"duration"),b},core.request.VpAdCallModule.prototype.translateInsertionPointType=function(a){var b=a.toLowerCase();switch(b){case"onbeforecontent":return"p";case"playbackposition":return"m";case"oncontentend":return"po";case"playbacktime":return"o";default:throw new Error(core.debugMessage("invalidInsertionPointType"))}},core.request.VpAdCallModule.prototype.buildUrl=function(a,b){var c=this.vpHost;if(-1===c.indexOf("http://")&&-1===c.indexOf("https://")&&(c="http://"+c),c.lastIndexOf("/")!==c.length-1&&(c+="/"),c+="proxy/distributor/v2?",c+="rt=vast_2.0",c+="&pf=html5",c+="&cv=h5_"+window.videoplaza.versionNumber,a){core.request.VpAdCallModule.hasData(a.flags)&&(c+="&f="+encodeURIComponent(a.flags.join(","))),core.request.VpAdCallModule.hasData(a.tags)&&(c+="&t="+encodeURIComponent(a.tags.join(",")));var d="";if(core.request.VpAdCallModule.hasData(a.category)&&(d+=a.category),a.contentPartner&&core.request.VpAdCallModule.hasData(a.contentPartner)&&(d=core.request.VpAdCallModule.hasData(d)?d+=","+a.contentPartner:a.contentPartner),core.request.VpAdCallModule.hasData(d)&&(c+="&s="+encodeURIComponent(d)),core.request.VpAdCallModule.hasData(a.contentForm)&&(c+="&cf="+this.translateContentForm(a.contentForm)),core.request.VpAdCallModule.hasData(a.contentId)&&(c+="&ci="+encodeURIComponent(a.contentId)),core.request.VpAdCallModule.hasData(a.duration)&&(c+="&cd="+a.duration),core.request.VpAdCallModule.hasData(a.customParameters)){var e=/[^A-Za-z0-9_~\-.]/;for(var f in a.customParameters)a.customParameters.hasOwnProperty(f)&&!e.test(f)&&(c+="&cp."+f+"="+encodeURIComponent(a.customParameters[f]))}}if(b){if(core.request.VpAdCallModule.hasData(b.width)&&(c+="&vwt="+b.width),core.request.VpAdCallModule.hasData(b.height)&&(c+="&vht="+b.height),core.request.VpAdCallModule.hasData(b.maxBitRate)&&(c+="&vbw="+b.maxBitRate),core.request.VpAdCallModule.hasData(b.insertionPointType)){var g=b.insertionPointType.toLowerCase();c+="&tt="+this.translateInsertionPointType(g),"playbackposition"===g&&core.request.VpAdCallModule.hasData(b.playbackPosition)&&(c+="&bp="+encodeURIComponent(b.playbackPosition))}core.request.VpAdCallModule.hasData(b.referrerUrl)&&(c+="&ru="+encodeURIComponent(b.referrerUrl))}if(this.adCallModuleSettings&&core.request.VpAdCallModule.hasData(this.adCallModuleSettings.deviceContainer)&&(c+="&dcid="+encodeURIComponent(this.adCallModuleSettings.deviceContainer)),this.adCallModuleSettings&&core.request.VpAdCallModule.hasData(this.adCallModuleSettings.persistentId))c+="&pid="+encodeURIComponent(this.adCallModuleSettings.persistentId);else{var h=this.vpLocalStorage.getPersistentIdFromLocalStorage();h&&(c+="&pid="+encodeURIComponent(h))}var i=this.getURLParameter("vppreview");return core.request.VpAdCallModule.hasData(i)&&(c+="&vppreview="+i),c+="&st="+encodeURIComponent("0:0,3,4,10,20:1,91,100"),c+="&rnd="+core.model.Trackable.generateUniqueId()},core.request.VpAdCallModule.prototype.translateContentForm=function(a){var b=a.toLowerCase();return"longform"===b?"long_form":"short_form"},core.request.VpAdCallModule.prototype.getURLParameter=function(a){var b="",c="[\\?&]"+a+"=([^&#]*)",d=new RegExp(c),e=d.exec(window.location.href.toString());return null!==e&&(b=e[1]),b},core.request.VpAdCallModule.prototype.requestAds=function(d,e,f,g){function h(b,d){function e(a,b){for(var c in a)a.hasOwnProperty(c)&&(b[c]=b[c].concat(a[c]));return b}function o(a,b){if(b.trackingUris=e(a.trackingUris,b.trackingUris),a.vastAdTagUri?b.vastAdTagUri=a.vastAdTagUri:delete b.vastAdTagUri,a.creatives)for(var c in a.creatives)!a.creatives.hasOwnProperty(c)||a.creatives[c]instanceof core.model.Companion||(b.creatives[c].duration=a.creatives[c].duration,b.creatives[c].trackingUris=e(a.creatives[c].trackingUris,b.creatives[c].trackingUris),b.creatives[c].mediaFiles=a.creatives[c].mediaFiles,b.creatives[c].clickThroughUri=a.creatives[c].clickThroughUri);return b}function p(a){k-=1,0===k&&f(a)}function q(a,b){var d=b.indexOf(a);b[d]=c(a),p(b)}k+=1,i.videoplazaXHR.request(b,n,function(b){var c,e;try{b=b.replace(/<!--[\s\S]*?-->/g,""),c=i.vastParser.parse(b)}catch(error){return void(d?q(d,j):g(error.message))}if((d===a&&core.request.VpAdCallModule.browser.isSafari||core.request.VpAdCallModule.browser.isIE)&&i.vpLocalStorage.getPersistentIdFromTicket(c),d&&1!=c.length)return void q(d,j);for(var f=0;f<c.length;f++)e=c[f],d?e=o(e,d):j[f]=e,e.vastAdTagUri!==a?(d===a&&(l[e.id]=function(a){return window.setTimeout(function(){m=!0,q(a,j)},n)}(e)),m||h(e.vastAdTagUri,e)):l[e.id]!==a&&window.clearTimeout(l[e.id]);p(j)},function(a){d?q(d,j):g(a)})}var i=this,j=[],k=0,l={},m=!1,n=4e3;if("function"!=typeof f&&"function"!=typeof g)throw new Error(core.debugMessage("adRequestMissingMandatoryCallbacks"));if(!b(this.vpHost))throw new Error(core.debugMessage("invalidVpHost"));try{this.verifyContentMetadata(d),this.verifyRequestSettings(e,d.duration)}catch(error){return void g(error.message)}h(this.buildUrl(d,e))}}(core),function(core){core.model.Trackable=function(){this.trackingUris=null,this.uniqueId=null},core.model.Trackable.generateTrackingUris=function(a,b){var c={};for(var d in a)a.hasOwnProperty(d)&&(c[d]=[]);for(var e in b)b.hasOwnProperty(e)&&(c[e]=[]);return c},core.model.Trackable.generateUniqueId=function(){return Math.floor(1e16*Math.random())}}(core),function(core){core.model.Ad=function(){this.campaignId=null,this.creatives=[],this.customId=null,this.customGoalId=null,this.customCampaignId=null,this.goalId=null,this.id="0",this.labels={},this.type=null,this.variant=null,this.trackingUris=core.model.Trackable.generateTrackingUris(core.request.VpTracker.trackingEvents.ad,core.request.VpTracker.errorEvents.ad),this.uniqueId=core.model.Trackable.generateUniqueId()},core.model.Ad.types={inventory:"inventory",standard:"standard_spot"},core.model.Ad.variants={normal:"normal",sponsor:"sponsor"},core.model.Ad.prototype=new core.model.Trackable,core.model.Ad.prototype.constructor=core.model.Ad}(core),function(core){core.model.Creative=function(){this.clickThroughUri=null,this.duration=null,this.id=null,this.parent=null,this.type=null},core.model.Creative.creativeTypes={linear:"linear",nonLinear:"nonLinear",companion:"companion"},core.model.Creative.prototype=new core.model.Trackable,core.model.Creative.prototype.constructor=core.model.Creative}(core),function(core){core.model.MediaFile=function(){this.bitRate=null,this.deliveryMethod=null,this.height=null,this.id=null,this.mimeType=null,this.uri=null,this.width=null}}(core),function(core){core.model.LinearCreative=function(a){this.mediaFiles=[],this.parent=a||null,this.type=core.model.Creative.creativeTypes.linear,this.uniqueId=core.model.Trackable.generateUniqueId(),this.trackingUris=core.model.Trackable.generateTrackingUris(core.request.VpTracker.trackingEvents.creative)},core.model.LinearCreative.prototype=new core.model.Creative,core.model.LinearCreative.prototype.constructor=core.model.LinearCreative}(core),function(core){core.model.NonLinearCreative=function(a){this.height=null,this.mimeType=null,this.resource=null,this.resourceType=null,this.width=null,this.parent=a||null,this.type=core.model.Creative.creativeTypes.nonLinear,this.uniqueId=core.model.Trackable.generateUniqueId(),this.trackingUris=core.model.Trackable.generateTrackingUris(core.request.VpTracker.trackingEvents.creative)},core.model.NonLinearCreative.resourceTypes={staticResource:"staticResource",iFrame:"iFrame",html:"html"},core.model.NonLinearCreative.prototype=new core.model.Creative,core.model.NonLinearCreative.prototype.constructor=core.model.NonLinearCreative}(core),function(core){core.model.Companion=function(a){this.zoneId=null,this.zoneType=null,this.parent=a||null,this.type=core.model.Creative.creativeTypes.companion,this.uniqueId=core.model.Trackable.generateUniqueId(),this.trackingUris=core.model.Trackable.generateTrackingUris(core.request.VpTracker.trackingEvents.creative)},core.model.Companion.zoneTypes={html:"html"},core.model.Companion.prototype=new core.model.NonLinearCreative,core.model.Companion.prototype.constructor=core.model.Companion}(core),function(core){function a(a){var b=a.split(":"),c=0;if(!(b.length>0&&b.length<=3))return null;for(var d=0;d<b.length;d++)c+=Number(b[b.length-d-1]*(d?Math.pow(60,d):1));return isNaN(c)?null:c}function b(a,b){return"2.0"===b&&-1===a.indexOf("[CACHEBUSTING]")&&-1===a.indexOf("%5BCACHEBUSTING%5D")&&a.length>0&&(a+=a.indexOf("?")>-1?"&rnd=[CACHEBUSTING]":"?rnd=[CACHEBUSTING]"),a}function c(a){return a&&(a=a.toLowerCase(),"bumper"===a||a===core.model.Ad.variants.sponsor)?core.model.Ad.variants.sponsor:core.model.Ad.variants.normal}core.parse.VastXmlParser=function(){this.parser=new window.DOMParser},core.parse.VastXmlParser.prototype.getAttributeValue=function(a,b){var c;return a&&a.attributes&&(c=a.attributes.getNamedItem(b))?c.value:null},core.parse.VastXmlParser.prototype.createTrackingUris=function(a,c,d){var e,f,g,h;e={},f=c.getElementsByTagName("Tracking");for(var i=0;i<f.length;i++)g=f.item(i),h=this.getAttributeValue(g,"event"),(h in core.request.VpTracker.trackingEvents.ad||h in core.request.VpTracker.trackingEvents.creative||h in core.request.VpTracker.trackingEventNames.ad||h in core.request.VpTracker.trackingEventNames.creative)&&(h in core.request.VpTracker.trackingEventNames.ad?h=core.request.VpTracker.trackingEventNames.ad[h]:h in core.request.VpTracker.trackingEventNames.creative&&(h=core.request.VpTracker.trackingEventNames.creative[h]),e[h]||(e[h]=[]),e[h].push(b(this.trim(g.textContent),d)));for(h in e)a[h]&&(a[h]=a[h].concat(e[h]));return a},core.parse.VastXmlParser.prototype.createCreatives=function(c,d,e,f){for(var g,h,i,j,k,l,m,n,o,p,q,r,s,t=[],u={Linear:core.model.Creative.creativeTypes.linear,NonLinearAds:core.model.Creative.creativeTypes.nonLinear,CompanionAds:core.model.Creative.creativeTypes.companion},v={StaticResource:core.model.NonLinearCreative.resourceTypes.staticResource,IFrameResource:core.model.NonLinearCreative.resourceTypes.iFrame,HTMLResource:core.model.NonLinearCreative.resourceTypes.html},w=0;w<c.length;w++)if(g=this.getAttributeValue(c[w],"id"),h=u[c[w].firstChild.nodeName],h===core.model.Creative.creativeTypes.linear){for(i=new core.model.LinearCreative(d),i.id=g,j=c[w].getElementsByTagName("Duration"),j.length>0&&(i.duration=a(j[0].textContent)),k=c[w].getElementsByTagName("TrackingEvents"),k.length>0&&(i.trackingUris=this.createTrackingUris(i.trackingUris,k[0],f)),m=c[w].getElementsByTagName("ClickTracking"),l=0;l<m.length;l++)i.trackingUris.clickThrough.push(b(this.trim(m[l].textContent),f));for(n=c[w].getElementsByTagName("ClickThrough"),n.length>0&&(i.clickThroughUri=this.trim(n[0].textContent)),o=c[w].getElementsByTagName("MediaFile"),l=0;l<o.length;l++)p=new core.model.MediaFile,p.bitRate=this.getAttributeValue(o[l],"bitrate"),p.deliveryMethod=this.getAttributeValue(o[l],"delivery"),p.height=this.getAttributeValue(o[l],"height"),p.id=this.getAttributeValue(o[l],"id"),p.mimeType=this.getAttributeValue(o[l],"type"),p.uri=o[l].textContent,p.width=this.getAttributeValue(o[l],"width"),i.mediaFiles.push(p);t.push(i)}else if(h===core.model.Creative.creativeTypes.nonLinear)r=c[w].getElementsByTagName("NonLinear");else if(h===core.model.Creative.creativeTypes.companion)for(s=c[w].getElementsByTagName("Companion"),l=0;l<s.length;l++)i=new core.model.Companion(d),s[l].getElementsByTagName("TrackingEvents")[0]&&(i.trackingUris=this.createTrackingUris(i.trackingUris,s[l].getElementsByTagName("TrackingEvents")[0])),q=s[l].firstChild,i.resourceType=v[q.nodeName],i.resource=q.textContent,i.height=this.getAttributeValue(s[l],"height"),i.id=this.getAttributeValue(s[l],"id"),i.width=this.getAttributeValue(s[l],"width"),e&&e[i.id]?(i.zoneId=e[i.id].zoneId,i.zoneType=e[i.id].zoneMethod):"undefined"!=typeof console&&console.log("No matching companion in AdInfo."),t.push(i);return t},core.parse.VastXmlParser.prototype.createAds=function(a,d){for(var e,f,g,h,i,j,k,l,m,n=[],o=[],p={COMPANION_BANNER_JAVASCRIPT:core.model.Companion.zoneTypes.html},q=!1,r=0;r<a.length;r++){if(e=new core.model.Ad,a[r].getElementsByTagName("AdSystem").length>0){var s=a[r].getElementsByTagName("AdSystem")[0].textContent;s&&s.toLowerCase().indexOf("videoplaza karbon")>-1&&(q=!0)}for("Wrapper"===a[r].firstChild.nodeName?(f=a[r].getElementsByTagName("VASTAdTagURI"),f.length>0&&(e.vastAdTagUri=f[0].textContent)):f=null,e.id=this.getAttributeValue(a[r],"id"),null===e.id&&(e.id="0",e.type=core.model.Ad.types.inventory),h=a[r].getElementsByTagName("Extension"),g=0;g<h.length;g++)if("AdServer"===this.getAttributeValue(h[g],"type")&&"Videoplaza"===this.getAttributeValue(h[g],"name")){i=h[g].getElementsByTagName("AdInfo")[0],e.campaignId=this.getAttributeValue(i,"cid"),e.customId=this.getAttributeValue(i,"customaid"),e.customGoalId=this.getAttributeValue(i,"customgid"),e.customCampaignId=this.getAttributeValue(i,"customcid"),e.goalId=this.getAttributeValue(i,"gid"),e.type=this.translateIncorrectAdType(this.getAttributeValue(i,"format")),e.variant=c(this.getAttributeValue(i,"variant")),j=i.getElementsByTagName("Companion");for(var t=0;t<j.length;t++)o[this.getAttributeValue(j[t],"id")]={zoneId:this.getAttributeValue(j[t],"zone"),zoneMethod:p[this.getAttributeValue(j[t],"zoneType")]}}for(k=a[r].getElementsByTagName("Impression"),g=0;g<k.length;g++)e.trackingUris.impression.push(b(this.trim(k[g].textContent),d));if(e.trackingUris.impression.length<1)throw new core.error.ParseError(core.debugMessage("noImpressionElement"));for(l=a[r].getElementsByTagName("Error"),null===f&&q&&0===l.length&&e.type===core.model.Ad.types.inventory&&(l=k),g=0;g<l.length;g++)e.trackingUris.error.push(b(this.trim(l[g].textContent),d));if(m=a[r].getElementsByTagName("Creative"),!q&&0===m.length&&null===f)throw new core.error.ParseError(core.debugMessage("noCreativeElement"));e.creatives=this.createCreatives(m,e,o,d),n.push(e)}return n},core.parse.VastXmlParser.prototype.translateIncorrectAdType=function(a){return"spot_standard"===a?"standard_spot":a},core.parse.VastXmlParser.prototype.removeTextNodes=function(a){var b,c,d=/^\s*$/;if(3===a.nodeType)d.test(a.nodeValue)&&a.parentNode.removeChild(a);else if(1===a.nodeType||9===a.nodeType)for(b=a.firstChild;b;)c=b.nextSibling,this.removeTextNodes(b),b=c},core.parse.VastXmlParser.prototype.trim=function(a){return a.replace(/^\s+|\s+$/g,"")},core.parse.VastXmlParser.prototype.parse=function(a){var b,c,d,e,f=[];try{b=this.parser.parseFromString(a,"text/xml")}catch(g){throw"undefined"!=typeof console&&console.log(core.debugMessage("nonValidXML")),new core.error.ParseError("Could not parse VAST. "+g.message)}if(c=b.documentElement,!c)throw new core.error.ParseError("Could not parse VAST. No root element");if(this.removeTextNodes(c),"VAST"!==c.nodeName)throw c.getElementsByTagName("parsererror")&&c.getElementsByTagName("parsererror").length>0&&"undefined"!=typeof console&&console.log(core.debugMessage("nonValidXML")),"undefined"!=typeof console&&console.log(core.debugMessage("nonValidVASTTicket")),new core.error.ParseError('Could not parse VAST. Root element is not "VAST".');return e=this.getAttributeValue(c,"version"),d=c.getElementsByTagName("Ad"),d.length>0&&(f=this.createAds(d,e)),f}}(core),function(core){core.AdCallModule=function(){var a,b=function(b,c){a=new core.request.VpAdCallModule(b,c)};return b.prototype.requestAds=function(b,c,d,e){a.requestAds(b,c,d,e)},b}()}(core),window.videoplaza||(window.videoplaza={}),window.videoplaza.core=core,window.videoplaza.buildDate="20140828",window.videoplaza.versionNumber="1.0.14.17.1"}(window);
	; browserify_shim__define__module__export__(typeof videoplaza != "undefined" ? videoplaza : window.videoplaza);
	
	}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });
	
	}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	},{}],7:[function(require,module,exports){
	function metadataAggregator() {
		"use strict";
		/**
		 * Format of the metadata object that will be sent to the sdk.
		 * The metadata sent from the bridge is compared with the properties of this object (case insesitive) and generated accordingly.
		 * If you are trying to send properties that are not defined below, they will not be accepted
		 * @type {Object}
		 */
		var skdFormattedData = {
			vpHost: '',
			cuepoints: [],
			playerDivId: '',
	
		    category: '',
		    contentForm: '',
		    contentId: '',
		    contentPartner: '',
		    duration: null,
		    flags: [],
		    tags: [],
		    customParameters: {},
	
			height: null,
			maxBitRate: null,
			playbackPosition: null,
			insertionType: '',
			width: null,
			referrerUrl: '',
	
			deviceContainer: '',
			persistentId: '',
	
			optional: {
				playMidrollOnSeek: true
			},
	
		    longFormLimit: null // if this is set and the duration of the video is known, it should ovveride the content form
		};
	
		var isDataAgreggated = false;
		var flashFormatMetadata = {};
	
		/**
		 * Converts object to a transitional (bridge) format. The properties are all lowercase, with no '-', '_' and 'vp' is removed from the start
		 * of the property name
	 	 * @param  {object} metadataObject Metadata object in a loosely format.
		 * @return {object}                Returns the transitional formatted object
		 */
		function _getDataInBridgeFormat(metadataObject) {
			var prop, lprop;
			var bridgeFormattedMetadata = {};
			for (prop in metadataObject) {
				if (metadataObject.hasOwnProperty(prop)) {
					lprop = prop.toLowerCase();
					// lprop = lprop.replace(/[_,-]/g, ''); generating a cuepoint problem, ignore for the moment
					lprop = lprop.replace(/^vp/i, '');
					if (lprop === 'host') lprop = 'vpHost';
					bridgeFormattedMetadata[lprop] = {val: metadataObject[prop], oldName: prop};
				}
			}
	
			return bridgeFormattedMetadata;
		}
		/**
		 * Converts the object passed to the format required by the Videoplaza HTML5 SDK
		 * @param  {object} metadataObject Metadata object with lowercase properties, but with 'linking' to the sdk format
		 * @return {object} Returns object in sdk format.
		 */
		function _getDataInSdkFormat(metadataObject) { // do this once
			var prop;
			var sdkFormattedMetadata = {};
			var sdkBridgeMetadataTranslator = _getDataInBridgeFormat(skdFormattedData);
			//Go through the properties of the metdataObject that will be converted
			for (prop in metadataObject) {
				if (metadataObject.hasOwnProperty(prop)) {
					//On the new object, take the old name of the property that matches the template and assign the value of the property
					if (sdkBridgeMetadataTranslator[prop]) {
						sdkFormattedMetadata[sdkBridgeMetadataTranslator[prop].oldName] = metadataObject[prop].val;
					} else {
						sdkFormattedMetadata[metadataObject[prop].oldName] = metadataObject[prop].val;
					}
				}
			}
			return sdkFormattedMetadata;
		}
	
		/**
		 * Merging objects together, with the last ovveriding the previous if properties have the same name
		 * @param  {array} listOfObjectsToBeAggregated Array of objects to be aggregated. The last object in the list ovewrites the previous
		 * @return {object} Result of the aggregation
		 */
		function _extend(listOfObjectsToBeAggregated) {
			var objects = listOfObjectsToBeAggregated;
		    var extended = {};
		    var prop;
	
		    for (var i = 0; i < objects.length; i++) {
		    	if (objects[i]) {
			    	for (prop in objects[i]) {
				        if (objects[i].hasOwnProperty(prop)) {
				        	if (prop === 'tags' || prop === 'flags') {
				        		if (!extended[prop]) extended[prop] = objects[i][prop];
				        		extended[prop].val = extended[prop].val.concat(objects[i][prop].val);
				        		extended[prop].val = _removeArrayDuplicates(extended[prop].val);
				        	} else {
				        		if (objects[i][prop].val!==undefined && objects[i][prop].val!==null && objects[i][prop].val.toString().length) {
				        			extended[prop] = objects[i][prop];
				        		}
				        	}
				        }
			    	}
		    	}
		    }
		    return extended;
		}
	
		function _removeArrayDuplicates(array) {
			var result = [];
			var different = true;
			for (var i = 0; i< array.length; i++) {
				if (result.length === 0) {
					result.push(array[i]);
				} else {
					for (var j = 0; j< result.length; j++) {
						if (result[j] === array[i]) different = false;
					}
					if (different) {
						result.push(array[i]);
					}
					different = true;
				}
			}
			return result;
		}
		/**
		 * If a longFormLimit is specified, the module modifies the metadata.contentForm and sets shortForm or longForm accordingly
		 * @param {object} metadata Object to be on which the check is made
		 * @return {object} metadata Returns the metadata object
		 */
		function _setContentFormByLongFormLimit(metadata) {
			if (!metadata.duration || !metadata.longFormLimit) return metadata;
			if (metadata.duration >= metadata.longFormLimit) {
				metadata.contentForm = 'longForm';
			} else {
				metadata.contentForm = 'shortForm';
			}
	
			return metadata;
		}
	
		function _changeContentFormFormat(metadata) {
			if (!metadata.contentForm) return;
			if (metadata.contentForm === 'short_form') metadata.contentForm = 'shortForm';
			if (metadata.contentForm === 'long_form') metadata.contentForm = 'longForm';
		}
	
		function _addContentFormToTags(metadata) {
			if (!metadata.contentForm) return;
			if (!metadata.tags) metadata.tags = [];
			if (metadata.contentForm === 'shortForm') metadata.tags.push('short_form');
			if (metadata.contentForm === 'longForm') metadata.tags.push('long_form');
		}
	
		/**
		 * Enable the usage of metadata configuration objects from different sources and aggregate them into one metadata object that can be sent to the SDK
		 * @param  {array} listOfObjectsToBeAggregated List of objects to be agreaggated
		 * @param  {boolean} addExistingMetadata     If true, merge the new metadata objects with the existing one, else, just merge them and return
		 * @return {object}  metadata                  Returns the metadata object in the format expected by the SDK
		 */
		function aggregateData(listOfObjectsToBeAggregated, addExistingMetadata) { //change this into a 'dataAggregator()'
			var metadata = {};
			var objects = listOfObjectsToBeAggregated;
			var mergeExisting = true;
	
			if (addExistingMetadata !== null) mergeExisting = addExistingMetadata;
	
			// Transform objects that will be agregated to the common "bridge format"
			for (var i = 0; i< objects.length; i++) {
				if (objects[i]) {
					objects[i] = _getDataInBridgeFormat(objects[i]);
				}
			}
			// Aggregate objects
			if (mergeExisting) objects = objects.unshift(skdFormattedData);
			metadata = _extend(objects);
			// Transform objects that will be agregated to format required by the sdk
			metadata = _getDataInSdkFormat(metadata);
			// Modify the contentForm if needed
			metadata = _setContentFormByLongFormLimit(metadata);
			// Change contentForm value format
			_changeContentFormFormat(metadata);
			// Add content form to tags
			_addContentFormToTags(metadata);
			//copy metadata to existing one
			_copyObjectProperties(skdFormattedData, metadata);
			isDataAgreggated = true;
			setFlashFormat(metadata);
	
	
	
			return metadata;
		}
	
		/**
		 * Copies the values of the properties of the second object to the first object (only if the property names match)
		 * @param  {object} copyTo   Object to get the values from the copyFrom matching properties
		 * @param  {object} copyFrom Matching properties are copied to copyTo
		 * @return {object}          copyTo object with the values of the copyFrom properties
		 */
		function _copyObjectProperties(copyTo, copyFrom) {
			var prop;
			for (prop in copyTo) {
				if (copyTo.hasOwnProperty(prop) && copyFrom.hasOwnProperty(prop)) {
					copyTo[prop] = copyFrom[prop];
				}
			}
			return copyTo;
		}
	
		// function addData(dataObj) {
		// 	var newData = {};
		// 	currentData = _getDataInBridgeFormat(skdFormattedData);
		// 	newData = _getDataInBridgeFormat(dataObj);
		// 	_extend([currentData, newData]);
		// }
	
		/**
		 * Returns contentMetadata object required by the requestAds method of the SDK. To get a populated object, run aggregateData() first
		 * @return {object} contentMetadata
		 */
		function getContentMetadata() {
			var contentMetadata = {
				    category: '',
				    contentForm: '',
				    contentId: '',
				    contentPartner: '',
				    duration: null,
				    flags: [],
				    tags: [],
				    customParameters: {}
				};
	
			_copyObjectProperties(contentMetadata, skdFormattedData);
			if (!isDataAgreggated) {
				return contentMetadata;
			} else {
				return contentMetadata;
			}
		}
	
		/**
		 * Returns adCallModuleSettings object required by the requestAds method of the SDK. To get a populated object, run aggregateData() first
		 * @return {object} adCallModuleSettings
		 */
		function getAdCallModuleSettings() {
			var adCallModuleSettings = {
				vpHost: '',
				opt: {
					deviceContainer: '',
					persistentId: ''
				}
			};
	
			adCallModuleSettings.vpHost = skdFormattedData.vpHost;
			_copyObjectProperties(adCallModuleSettings.opt, skdFormattedData);
	
			if (!isDataAgreggated) {
				return adCallModuleSettings;
			} else {
				return adCallModuleSettings;
			}
		}
	
		/**
		 * Returns requestSettings  object required by the requestAds method of the SDK. To get a populated object, run aggregateData() first
		 * @return {object} requestSettings
		 */
		function getRequestSettings() {
			var requestSettings = {
					height: null,
					maxBitRate: null,
					playbackPosition: null,
					insertionType: '',
					width: null,
					referrerUrl: ''
				};
			_copyObjectProperties(requestSettings, skdFormattedData);
	
			if (!isDataAgreggated) {
				return requestSettings;
			} else {
				return requestSettings;
			}
		}
	
		function getCuePoints() {
			return skdFormattedData.cuepoints;
		}
	
		function getMetadata() {
			return skdFormattedData;
		}
	
		function setFlashFormat(metaObj) {
			var metadata = metaObj;
			//this should be automatic, adding vp in front of all options passed?
			var flashConverter = {
				flags: 'vpFlags',
				environmenturl: 'vpEnvironmentUrl',
				contentform: 'vpcontentform',
				contentpartner: 'vpContentPartner',
				contentid: 'vpContentId'
			};
			//each metadata[prop] is a object
			for (var prop in metadata) {
				for (var conv in flashConverter) {
					if (prop.toLowerCase() === conv.toLowerCase()) {
						flashFormatMetadata[flashConverter[conv]] = metadata[prop];
					} else {
						flashFormatMetadata[prop] = metadata[prop];
					}
				}
			}
	
	
			return flashFormatMetadata;
	
		}
	
		function getFlashFormat() {
			return flashFormatMetadata;
		}
	
		return {
			aggregateData: aggregateData,
			getAdCallModuleSettings: getAdCallModuleSettings,
			getContentMetadata: getContentMetadata,
			getRequestSettings: getRequestSettings,
			getCuePoints: getCuePoints,
			getMetadata: getMetadata,
			getFlashFormat: getFlashFormat
		};
	}
	
	module.exports = metadataAggregator;
	},{}],8:[function(require,module,exports){
	/**
	 * Creates a wrapper for the native console object.
	 * @param  {[type]} enabled If enabled, messages are displayed to console. If not, supress them
	 * @param  {[type]} name    Name space the logger for easy console filtering
	 * @return {[type]}         Returns the wrapper object
	 */
	function createLogger(enabled, name) {
	  var vplog = {}
	  if (!window.console) return function(){}
	  if (enabled || isLogEnabledByUrl()) {
	    for (var m in console)
	      if (typeof console[m] == 'function')
	        vplog[m] = console[m].bind(window.console, name.toString()+":")
	  }else{
	    for (var m in console)
	      if (typeof console[m] == 'function')
	        vplog[m] = function(){}
	  }
	  return vplog
	}
	
	function isLogEnabledByUrl() {
	    var value = getUrlQueryParameter('vplog');
	    var enabled = false;
	    switch (value) {
	        case 'true':
	        enabled = true;
	        break;
	        case 'false':
	        enabled = false;
	        break;
	        default:
	        enabled = false;
	        break;
	    }
	    return enabled;
	}
	
	function getUrlQueryParameter(name) {
	    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	        results = regex.exec(location.search);
	    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
	
	module.exports = {
	    createLogger: createLogger,
	    getUrlQueryParameter: getUrlQueryParameter
	};
	
	
	},{}],9:[function(require,module,exports){
	var metadataAggregator = require('html-metadata-aggregator'); /*Module*/
	var videoplaza = require('videoplaza'); /*No need to modularise, it is stateless*/
	var eventBusModule = require("./utils/eventBus.js"); /*Module*/
	var jsutils = require('jsutils');
	
	function sdke() {
	    var logger = jsutils.createLogger(false, 'ADS HTML5 SDKE');
		var state = {
			adPlaying: false,
			prerollCalled: false,
			midrollCalled: {
			//first values are cuepoints
				// 10: false,
				// 20: false
			},
			cuepoint: 0,
			postrollCalled: false,
			initCalled: false
		};
		var conf = {};
		var currentAd = {
			tracker: {}
		};
	
		var tracker = {};
		var adCallModule;
	
		var playableAds = [];
		var randomsdke = Math.random();
	
		/*Init dependencies*/
		var vpData = metadataAggregator();
		var eventBus = eventBusModule();
	
		/**
		 * @function init(config)
		 * @description Init videoplaza sdke - pass the needed params
		 * @param {object} config Configuration object
		 * @param {object} config.evtElement DOM element used as event bus - might suffer modifications
		 * @param {object} config.videoPlayer - pass the video player
		 */
		function init(config) {
			if (state.initCalled) return;
			state.initCalled = true;
	
	
			var adCallModuleSettings = vpData.getAdCallModuleSettings();
			logger.log('adCallModuleSettings sdk', adCallModuleSettings, config.metadata.flags);
			conf = config; //you'd probably need to check this first
			conf.cuepoints = vpData.getCuePoints();
	
			if (conf.metadata.tags) {
				conf.metadata.tags.push('html5');
			} else {
				conf.metadata.tags = ['html5'];
			}
	
			//Parse cuepoint list and prepare the midrolls
			_parseCuepoints();
	
			adCallModule = new videoplaza.core.AdCallModule(adCallModuleSettings.vpHost, adCallModuleSettings.opt);
			tracker = new videoplaza.core.Tracker();
		}
	
		/**
		 * @function requestAds(adType, playbackPosition)
		 * @description Expose ad request functionality. It's a wrapper over _makeVideoplazaAdRequest, simply meant to be more 'user-friendly'
		 * @param {string} adType Ad type in layman terms
		 * @param {number} playbackPosition
		 */
		function requestAds(adType, playbackPosition) {
			switch (adType) {
				case 'preroll':
				if (!hasFlag('noprerolls')) {
					_makeVideoplazaAdRequest('onBeforeContent');
				} else {
					eventBus.dispatch('vp:ads-error', currentAd);
				}
				break;
	
				case 'midroll':
				if (!hasFlag('nomidrolls')) {
					_makeVideoplazaAdRequest('playbackPosition', playbackPosition);
				} else {
					eventBus.dispatch('vp:ads-error', currentAd);
				}
				break;
	
				case 'postroll':
				if (!hasFlag('nopostrolls')) {
					_makeVideoplazaAdRequest('onContentEnd');
				} else {
					eventBus.dispatch('vp:ads-error', currentAd);
				}
				break;
	
				default:
				throw 'Unregonised ad type';
			}
			//Saving the type of the ad playing for managing states
			currentAd.adType = adType;
		}
	
		/**
		 * @function _makeVideoplazaAdRequest(tt, playbackPosition)
		 * @description Make an ad request
		 * @param {string} adType Ad type in layman terms
		 * @param {number} playbackPosition
		 */
		function _makeVideoplazaAdRequest(tt, playbackPosition) {
			//Init ad call module
				var contentMetadata = vpData.getContentMetadata();
				requestSettings = vpData.getRequestSettings();
				requestSettings.insertionPointType = tt;
				requestSettings.playbackPosition = playbackPosition || '';
	
				adCallModule.requestAds(contentMetadata, requestSettings, _onGetAdsSuccess, _onGetAdsFail);
		}
	
		/**
		 * @function adStarted()
		 * @description Manage state of the sdk by putting it in adPlaying mode and track impression
		 */
		function adStarted() {
			state.adPlaying = true;
			tracker.track(playableAds[0], videoplaza.core.Tracker.trackingEvents.ad.impression);
		}
	
		/**
		 * @function onClick()
		 * @description If ad is playing, open the target url in a new page, track the click and update state
		 */
		function onClick() {
			var playerAdState = {
				adPlaying: state.adPlaying,
				adClicked: currentAd.tracker.click
			};
	
			if (!state.adPlaying || currentAd.tracker.click) return playerAdState;
			window.open(currentAd.creative.clickThroughUri,'_blank');
			tracker.track(currentAd.creative, videoplaza.core.Tracker.trackingEvents.creative.clickThrough);
			currentAd.tracker.click = true;
	
			return playerAdState;
		}
	
		/**
		 * @function adEnded()
		 * @description Executed when an ad is ended.
		 * If more ads are available in the slot, play the next one.
		 * If not, emit vp:adslot-complete and update the state accordingly
		 */
		function adEnded() {
			if (!state.adPlaying) return;
	
			// Track complete quartile and remove the ad that ended
			playableAds.shift();
	
			// Check if there are more ads available
			if (playableAds.length > 0) {
				_setCurrentAd(playableAds[0]);
				// Send vp:ads-ready event with the ad to be played
				eventBus.dispatch('vp:ads-ready', currentAd);
			} else {
				// Send vp:adslot-complete event and update the state
				state.adPlaying = false;
				_setAdComplete(currentAd.adType);
				eventBus.dispatch('vp:adslot-complete', currentAd);
			}
		}
	
		/**
		 * @function _setAdComplete(newState)
		 * @description Used to update the state object of the sdke. Should be refactored - naming and usage are odd
		 * @param {string} newState state that will be updated
		 */
		function _setAdComplete(newState) {
			switch (newState) {
				case 'adPlaying':
				state.adPlaying = true;
				break;
				case 'preroll':
				state.prerollCalled = true;
				break;
				case 'midroll':
				state.midrollCalled[state.cuepoint] = true;
				//identify which midroll played if you go forward in the timeline and remove that midroll
	
				break;
				case 'postroll':
				state.postrollCalled = true;
				break;
				default:
				throw "The selected plugin state("+ newState +") is not supported";
			}
		}
	
		//NOT USED ANYMORE - REMOVE WHEN WRITING THE UNIT TESTS
		function _startAd() {
			//first check if the creative is fine and the ad can be played.
			//if it is, track impression and ad start
			tracker.track(currentAd.adObject, videoplaza.core.Tracker.trackingEvents.ad.impression);
		}
	
		/**
		 * @function _quartileTracking(time)
		 * @description Compares the current time with the defined quartiles and fires the quartile tracking when needed
		 * @param {number/string} time Can be a number that indicates the time of the ad being played, or can be the string 'complete' indicating the ad finished
		 */
		function _quartileTracking(time) {
			if (time >=0 && !currentAd.tracker.e14) {
				tracker.track(currentAd.creative, videoplaza.core.Tracker.trackingEvents.creative.start);
				currentAd.tracker.e14 = true;
			}
			if (time >= currentAd.duration/4 && !currentAd.tracker.e15) {
				tracker.track(currentAd.creative, videoplaza.core.Tracker.trackingEvents.creative.firstQuartile);
				currentAd.tracker.e15 = true;
			}
			if (time >= currentAd.duration/2 && !currentAd.tracker.e16) {
				tracker.track(currentAd.creative, videoplaza.core.Tracker.trackingEvents.creative.midpoint);
				currentAd.tracker.e16 = true;
			}
			if (time >= (currentAd.duration/2 + currentAd.duration/4) && !currentAd.tracker.e17) {
				tracker.track(currentAd.creative, videoplaza.core.Tracker.trackingEvents.creative.thirdQuartile);
				currentAd.tracker.e17 = true;
			}
			if (time >=  currentAd.duration-0.25 && !currentAd.tracker.e18) {
				tracker.track(currentAd.creative, videoplaza.core.Tracker.trackingEvents.creative.complete);
				currentAd.tracker.e18 = true;
			}
		}
	
		/**
		 * @function update(time)
		 * @description Ran on evety player update ideally. Depending if ad is playing or not, it either fires quartiles or checking if midrolls should be played
		 * @param {number/string} time Can be a number that indicates the time of the ad being played, or can be the string 'complete' indicating the ad finished
		 */
		function update(time) {
			if (state.adPlaying) {
				_quartileTracking(time);
			}
			else {
				_checkForMidroll(time);
			}
		}
	
		/**
		 * @function _checkForMidroll(time)
		 * @description If a cuepoint was reached, make a midroll ad request
		 * @param {number} time Current playing time
		 */
		function _checkForMidroll(time) {
			if (!(conf.cuepoints && conf.cuepoints.length > 0)) return;
	
			var cuepointIndex = _getCupointIndex(time, 0);
	
			if (cuepointIndex !== false) {
				requestAds('midroll', conf.cuepoints[cuepointIndex]);
				state.cuepoint = conf.cuepoints[cuepointIndex];
				state.midrollCalled[state.cuepoint] = true;
			}
	
		}
	
		/**
		 * @function _getCupointIndex(time, cuepointPos)
		 * @description Recursive function checking the midroll that should be played. It handles video skipping scenarios too.
		 *              For example, if you have 3 cuepoints, at 10s, 30s and 50s and the user jumps to 60s in the video,
		 *              the cuepoint that will be triggered is the 50s one, with the 10s and 30s remaining active on the timeline
		 * @param {number} time Current playing time
		 * @param {number} cuepointPos Index in the cuepoints array
		 */
		function _getCupointIndex(time, cuepointPos) {
			// Check if there are cuepoints left
			if (cuepointPos >= conf.cuepoints.length) return false;
	
			// If there is just one cuepoint left, check if it should be triggered
			if (cuepointPos + 1 === conf.cuepoints.length) {
				return _getCuepointHit(time, cuepointPos);
			}
	
			// When there are multiple cuepoints, recursevly check which one can be triggered, starting with the second in the queue,
			// aiming for the furthest on the timeline (for the scenarios when the user skipped through the content)
			if (time >= conf.cuepoints[cuepointPos+1]) {
				return _getCupointIndex(time, cuepointPos+1);
			}
			else {
				//If the recursion indicates the second cuepoint is not ready to be triggered, check against the first one
				return _getCuepointHit(time, cuepointPos);
			}
		}
	
		/**
		 * @function _getCuepointHit(time, cuepointPos)
		 * @description Simply compare the current playing time with a defined cuepoint position and return cuepoint position or falsy
		 * @param {number} time current playing time
		 * @param {number} cuepointPos Index in the cuepoints array
		 * @return {number} Returns the index of the cuepoint that can be triggered
		 * @return {boolean} Returns false if no cuepoint is reached. Meant as a 'falsy' value
		 */
		function _getCuepointHit(time, cuepointPos) {
			if (time >= conf.cuepoints[cuepointPos] && !state.midrollCalled[conf.cuepoints[cuepointPos]]) {
				return _isSeekrollEnabled(time, cuepointPos);
			} else {
				return false;
			}
		}
	
		function _isSeekrollEnabled(time, cuepointPos) {
			if (conf.metadata.optional && !conf.metadata.optional.playMidrollOnSeek) {
				//if Seekroll is disabled, check the time of midroll
				//if time is way greater than mid position, it's a seekroll and should not be returned
				if (time - 0.5 > conf.cuepoints[cuepointPos]) {
					return false;
				}
				else {
					return cuepointPos;
				}
			} else {
				//if Seekroll is enabled (default), return the midroll position
				return cuepointPos;
			}
		}
	
		/**
		 * @function _onGetAdsSuccess(ads)
		 * @description Success callback for HTML5 SDK requestAds method. Get the playable ads, if any emit the vp:ads-ready event
		 * @param {object} ads Contains the ads returned by Karbon
		 */
		function _onGetAdsSuccess(ads){
			var videoAds = [];
			// Get the playable ads
			playableAds = _filterPlayableAds(ads);
	
			if (playableAds.length > 0) {
				_setCurrentAd(playableAds[0]);
				 eventBus.dispatch('vp:ads-ready', currentAd);
			} else {
				eventBus.dispatch('vp:ads-error', currentAd);
			}
	
		}
	
		/**
		 * @function _onGetAdsFail(ads)
		 * @description Fail callback for HTML5 SDK requestAds method.
		 * @param {object} erroMsg How are errors handled
		 */
		function _onGetAdsFail(erroMsg) {
		}
	
		/**
		 * @function _setCurrentAd(ad)
		 * @description Populate the currentAd object with useful information about the ad currently playing
		 * @param {object} ad Current ad object as returned by the server
		 */
		function _setCurrentAd(ad) {
			if (!ad) return;
			currentAd.creative = ad.creatives[0]; //chose the linear
			// currentAd.mediaFile = ad.creatives[0].mediaFiles[0]; //choose first media file
			currentAd.mediaFile = _findMp4(currentAd.creative);
			currentAd.tracker = {
				e14: false,
				e15: false,
				e16: false,
				e17: false,
				e18: false,
				click: false
			};
			currentAd.adObject = ad;
			currentAd.duration = ad.creatives[0].duration;
		}
	
		function _findMp4(creative) {
			mediaFiles = creative.mediaFiles;
			for (var i=0; i<mediaFiles.length; i++){
				if (mediaFiles[i].uri.slice(-3) === 'mp4') {
					return mediaFiles[i];
				}
			}
			return mediaFiles[0];
		}
	
		/**
		 * Checks if current flag exists in the flags array
		 * @param  {[type]}  adType [description]
		 * @return {Boolean}        [description]
		 */
		function hasFlag(flag) {
			if (!conf.metadata.flags) return;
	
			var flags = conf.metadata.flags;
			for (var i=0; i<flags.length; i++) {
				if (flags[i] === flag) {
					return true;
				}
			}
			return false;
		}
	
		/**
		 * @function _filterPlayableAds(ads)
		 * @description Takes the ad response and returns only the playable one filtering out the inventory and the banners
		 * @param {object} ads Raw ad object as returned by the server
		 * @return {array} Arrays of ads that can be played in the current slot
		 */
		function _filterPlayableAds(ads) {
			var playableAds = [];
	
			for (var i = 0; i < ads.length; i++) {
				switch (ads[i].type) {
					case 'standard_spot':
					if (ads[i].creatives[0].type === 'linear') { //can you have companion banners withoud video ad?
						playableAds.push(ads[i]);
					}
					break;
	
					case 'inventory':
					//track inventory
					tracker.track(ads[i], videoplaza.core.Tracker.trackingEvents.ad.impression);
					break;
	
					default:
					//track error;
					break;
				}
			}
			return playableAds;
		}
	
		/**
		 * @function _parseCuepoints()
		 * @description Assign cuepoints to the midroll state to keep track of them properly
		 */
		function _parseCuepoints() {
			for (var i = 0; i < conf.cuepoints.length; i++) {
				state.midrollCalled[conf.cuepoints[i]] = false;
			}
		}
		/**
		 * @function isAdPlaying()
		 * @description Exposed function used to check if an ad is playing or not
		 * @return {boolean} True/False if an ad is currently playing or not
		 */
		function isAdPlaying() {
			return state.adPlaying;
		}
	
		function reset() {
			_parseCuepoints();
		}
	
		return {
			init: init,
			requestAds: requestAds,
			adStarted: adStarted,
			adEnded: adEnded,
			update: update,
			reset: reset,
			onClick: onClick,
			isAdPlaying: isAdPlaying,
			state: state,
			metadataTools: vpData,
			utils: {
				eventBus: eventBus,
				hasFlag: hasFlag
			}
		};
	}
	
	module.exports = sdke;
	
	},{"./utils/eventBus.js":10,"html-metadata-aggregator":7,"jsutils":8,"videoplaza":6}],10:[function(require,module,exports){
	function eventBusModule() {
		"use strict";
	
		var registeredEvents = [];
		var sep = Math.round(Math.random()*1000);
	
		function dispatch(name, details) {
			for (var i = 0; i< registeredEvents.length; i++) {
				if (registeredEvents[i].eventName === name+sep) {
					//if the name match, call the callbacks and attach the details
					for (var j = 0; j < registeredEvents[i].callbacks.length; j++) {
						registeredEvents[i].callbacks[j](details);
					}
				}
			}
		}
	
		function addEventListener(name, callback) {
			var eventObject = {
				eventName : name+sep,
				callbacks: [callback]
			};
			var eventDefined = false;
			var selectedEvent;
	
			if (registeredEvents.length === 0) {
				registeredEvents.push(eventObject);
				return;
			}
			// go through existing events and check if the current one has been registered
			for (var i = 0; i< registeredEvents.length; i++) {
				if (registeredEvents[i].eventName === name+sep) {
					eventDefined = true;
					selectedEvent = registeredEvents[i];
					break;
				}
			}
	
			if (eventDefined) {
				_checkCallback(selectedEvent, callback);
			} else {
				registeredEvents.push(eventObject);
			}
		}
	
		function _checkCallback(selectedEvent, callback) {
			var eventCallbackDefined = false;
			for (var i = 0; i< selectedEvent.callbacks.length; i++) {
				if (selectedEvent.callbacks[i].toString() === callback.toString()) {
					eventCallbackDefined = true;
					break;
				}
			}
			if (!eventCallbackDefined) {
				selectedEvent.callbacks.push(callback);
			}
		}
	
		function _isInList(element, list, objProperty) {
			var isInList = false;
			var i;
			if (objProperty) {
				for (i = 0; i< list.length; i++) {
					if (list[i][objProperty].toString() === element.toString()) {
						isInList = true;
						break;
					}
				}
			} else {
				for (i = 0; i< list.length; i++) {
					if (list[i][objProperty] === element) {
						isInList = true;
						break;
					}
				}
			}
	
			return isInList;
		}
	
		return {
			dispatch: dispatch,
			addEventListener: addEventListener,
			randomTest: sep,
			registeredEvents: registeredEvents
		};
	}
	
	module.exports = eventBusModule;
	},{}],11:[function(require,module,exports){
	arguments[4][8][0].apply(exports,arguments)
	},{"dup":8}],12:[function(require,module,exports){
	var skipButton = require('./skip-button.js');
	var jsutils = require('jsutils');
	
	
	/**
	 * Initializes the core part of the HTML5 plugin and returns an instance.
	 * @param  {[type]} playerObj      The videojs player
	 * @param  {[type]} config         The aggregated config (after metadata from multiple sources has been processed)
	 * @param  {[type]} playlistModule The playlist support module. This should go once the videojs contrib is integrated and can put stuff in ads mode
	 * @return {[type]}                [description]
	 */
	function bridge(sdke) {
	    var logger = jsutils.createLogger(false, 'BC ADS Plugin');
		var player = {};
		var playlist = {};
		var ad;
		var vpConfig = {};
		var metadata = {};
	
		var contentSrc;
		var contentType;
		var canPlayPreroll = true;
		// var contentInitiated = false;
	
		/**
		 * Legacy entry point for the HTML5 part of the plugin, used to be main function between bridge.js got modularised and bridge() is used as initializer
		 * Still, this has to be called for the plugin to actually run
		 * Question: Can this be called multiple times on the same instance, with different config objects?
		 * @param  {[type]} playerObj      The videojs player
		 * @param  {[type]} config         The aggregated config (after metadata from multiple sources has been processed)
		 * @param  {[type]} playlistModule The playlist support module. This should go once the videojs contrib is integrated and can put stuff in ads mode
		 * @return {[type]}                [description]
		 */
		function runPlugin(playerObj, config) {
			vpConfig = config;
			player = playerObj;
	
			// Add event handlers
			_addPlayerEventHandlers();
			_initAdvertisingModule();
			initApi();
	
			optionalFeatures(config);
		}
	
		function optionalFeatures(config) {
			//add skip button
			if (config.optional.skip) skipButton(player, config.optional.skip.timeout, config.optional.skip.text);
		}
	
		/**
		 * @method _addPlayerEventHandlers
		 * @description Adding event handlers
		 */
		function _addPlayerEventHandlers() {
			// Listen once to play event emiited by the player
			player.on('play', requestPrerolls);
	
			// Fired when the timeout setting is reached. The player will resume the content
			player.on('adtimeout', player.play);
	
			// Fired on every time update emmited by the player. Several times per second
			// These should normally be split into contentupdate and adtimeupdate
			player.on('timeupdate', _update);
			player.on('adtimeupdate', _update);
	
			// Fired when the player finished playing an ad
			player.on('adended', adEnded);
			player.on('contentended', _contentEnded);
	
			player.on('contentupdate', _showNewAd);
			player.on('readyforpreroll', function(){
				logger.log('readyforpreroll');
			});
	
			player.on('contentloadedmetadata', function(){logger.log('contentloadedmetadata')});
			player.on('contentloadeddata', function(){logger.log('contentloadeddata')});
	
			// Fired when ads are ready to be played
			player.vpEvent.addEventListener('vp:ads-ready', startAdPlayback);
	
			// Fired when the ad request returns an error
			player.vpEvent.addEventListener('vp:ads-error', handleAdError);
	
			// Fired when all the ads in an adslot are played
			player.vpEvent.addEventListener('vp:adslot-complete', _resumePlayback);
	
			// Wraper for handling click and touch events
			_clickHandling();
		}
	
		/**
		 * Request a preroll ad if prerolls haven't been played for the current video
		 * @return {[type]} [description]
		 */
		function requestPrerolls() {
			logger.log('requestPrerolls - canPlayPreroll', canPlayPreroll);
			if (canPlayPreroll) {
					player.pause();
					sdke.requestAds('preroll');
				canPlayPreroll = false;
			}
		}
	
		/**
		 * Triggered by contentupdate. Happens at start and on new playlist element
		 * Resets the plugin state. Forces a pause/play to trigger the ad
		 * @return {[type]} [description]
		 */
		function _showNewAd() {
			_reset();
			player.pause();
			player.play();
		}
	
		/**
		 * @method _addPlayerEventHandlers
		 * @description By default, vjs does not pause the player on touch, so we have to pause it
		 */
		function _clickHandling() {
			var el = document.getElementById(player.el().id).firstChild;
			el.addEventListener('click', function(){
				sdke.onClick();
			});
			el.addEventListener('touchstart', function(evt) {
				var adState = sdke.onClick();
				if (adState.adPlaying && !adState.adClicked) {
					player.pause();
				}
				if (adState.adPlaying && adState.adClicked) {
					player.play();
				}
			});
		}
	
		/**
		 * @method _initAdvertisingModule
		 * @description Save content info and init sdk
		 */
		function _initAdvertisingModule() {
			// Init the HTML5 sdk wrapper
			sdke.init({
				evtElement: player.el(),
				videoPlayer: player,
				metadata: vpConfig
			});
		}
	
		function initApi() {
			player.vpApi.pauseAd = function() {
				if (player.ads.state !== 'ad-playback') return;
				player.pause();
			};
			player.vpApi.resumeAd = function() {
				if (player.ads.state !== 'ad-playback') return;
				player.play();
			};
			player.vpApi.skipAd = function() {
				if (player.ads.state !== 'ad-playback') return;
				player.vpEvent.dispatch('vp:ad-ended');
				sdke.adEnded();
			};
		}
	
		/**
		 * @function startAdPlayback
		 * @description Run when the sdke emits ads-ready event.
		 * Propagate vp:ad-ready to be used be integrators if needed (this is probably not needed anymore)
		 * Populate the global ad object with the one received from the SDK.
		 */
		function startAdPlayback(adObj) {
			player.vpEvent.dispatch('vp:ad-ready');
			player.trigger('adsready');
			ad = adObj;
			_playAd();
		}
	
		/**
		 * @function handleError
		 * @description Run when the sdke emits ads-ready event.
		 * Propagate vp:ad-error to be used be integrators if needed (this is probably not needed anymore)
		 * If error occured on postrolls, reset plugin state and pause player. Else simply resume content play
		 */
		function handleAdError(adObj) {
			player.vpEvent.dispatch('vp:ad-error');
			player.trigger('adserror');
	
			player.play();
		}
	
		/**
		 * @function _playAd
		 * @description Start ad playing
		 */
		function _playAd() {
			//hide the seek control
			player.controlBar.progressControl.seekBar.hide();
			sdke.adStarted();
	
			// Play your linear ad content
			player.ads.startLinearAdMode();
			player.src({"type": ad.mediaFile.mimeType, "src": ad.mediaFile.uri});
			player.play();
		}
	
		/**
		 * @function adEnded
		 *
		 * @description On video ended check the type of the video ended (content or ad)
		 * When ad, tell sdke the ad has ended
		 * When content, request postroll ads
		 */
		function adEnded() {
			logger.log('ad ended fired');
			if (sdke.isAdPlaying()) {
				sdke.adEnded();
				player.vpEvent.dispatch('vp:ad-ended');
			}
		}
	
		/**
		 * Trigger postroll 100 miliseconds before end
		 * @return {[type]} [description]
		 */
		function _checkForPostroll(time) {
			if (player.ads.state === 'ad-playback' || sdke.state.postrollCalled) return;
			var buffer = 850;
			var mstime = time * 1000;
			var potime = player.duration() * 1000 - buffer;
	
			if (mstime >= potime) {
				_callPostroll();
			}
		}
	
		function _callPostroll() {
			if (!sdke.state.postrollCalled && !sdke.utils.hasFlag('nopostrolls')) {
				sdke.requestAds('postroll');
				sdke.state.postrollCalled = true;
				player.pause();
			}
		}
	
		function _contentEnded() {
			logger.log('Content Ended');
			_reset();
		}
	
		/**
		 * @function _resumePlayback
		 * @description When the ad slot is complete, resume playback
		 * @param {object} evt ad:ended event
		 */
		function _resumePlayback(adObj) {
			logger.log('resume playback', adObj);
			player.controlBar.progressControl.seekBar.show();
			player.ads.endLinearAdMode();
	
			//jump to end if postroll
			if (adObj.adType === "postroll") player.currentTime(player.duration() - 0.4);
		}
	
		/**
		 * @function _update
		 * @description Run it on every plyaer time update. Update sdke internal state on every timeline update
		 *
		 * @param {object} evt Timeupdate event sent by player
		 */
		function _update(evt) {
			var time = player.currentTime();
			_checkForPostroll(time);
			sdke.update(time);
		}
	
		/**
		 * On video end reset plugin state so ads can be called again (by very popular client demand)
		 * todo: should play prerolls too, but it is now broken
		 */
		function _reset() {
			canPlayPreroll = true;
			ad = {};
			sdke.reset();
			sdke.state.postrollCalled = false;
		}
		return {
			runPlugin: runPlugin
		};
	}
	
	module.exports = bridge;
	},{"./skip-button.js":17,"jsutils":11}],13:[function(require,module,exports){
	var swfobject = require('swfobject');
	var muteButton = require('./mute-button');
	var jsutils = require('jsutils');
	
	/*Local*/
	var flashComponentModule = require('../git_modules/js-flashadplayer-bridge/src/main.js'); //modularise
	/*Production*/
	// var flashComponentModule = require('js-flashadplayer-bridge'); //modularise
	
	
	function flashPlayer() {
	    var player, metadata, flashMetadata, flashWrapperElement, fc, flashEl;
	    var logger = jsutils.createLogger(false, 'BC ADS Plugin Flash Bridge');
	
	    function init(p, options) {
	        //create the flash element
	        player = p;
	        metadata = options;
	
	        fc = flashComponentModule();
	
	        addFlashElToPage();
	        optionalFeatures(metadata);
	    }
	
	    function optionalFeatures(config) {
	        if (player.vpApi.getAdMode() === 'html') return;
	        if (config.optional && config.optional.muteButton && config.optional.muteButton.flash) muteButton(player);
	    }
	
	    function addFlashElToPage() {
	        createFlashElement();
	        flashMetadata = flashVars(metadata);
	        var swf = embedFlashElement();
	        styleFlashElement(swf);
	    }
	
	    function createFlashElement() {
	        // Create TWO(!) DIV wrappers, one outer which will stick around and one inner which will be replaced with the SWF object
	        flashEl = document.createElement("div");
	        var randomIndex = Math.floor(Math.random() * (999999 - 100000)) + 100000;
	        flashEl.id = 'vpJSFlashBridge'+ player.id().replace(/-/g, '') + randomIndex;
	
	        flashWrapperElement = document.createElement("div");
	        flashWrapperElement.id = "vpJSFlashBridgeWrapper" + randomIndex;
	        flashWrapperElement.style.position = "absolute";
	        flashWrapperElement.style.margin = "0";
	        flashWrapperElement.style.padding = "0";
	        flashWrapperElement.style.top = "0";
	        flashWrapperElement.style.left = "0";
	        flashWrapperElement.style.width = '1px';
	        flashWrapperElement.style.height = '1px';
	        flashWrapperElement.appendChild(flashEl);
	        player.el().appendChild(flashWrapperElement);
	    }
	
	    function embedFlashElement() {
	        var swfObjectParams = {
	          // url: "../AdPlayer_1.0.7.swf",
	          url: "//cdn.videoplaza.tv/resources/flash/flash-js-bridge/AdPlayer_1.0.7.swf",
	          placeHolderId: flashEl.id,
	          width: "100%",
	          height: "100%",
	          minFlashVersion: "11.0",
	          expressInstallSwfUrl: null,
	          flashVars: flashVars(metadata),
	          parameters: {
	             classid: 'classid'+flashEl.id,
	             id: flashEl.id,
	             name: flashEl.id,
	             allowScriptAccess: 'always',
	             wmode: 'opaque'
	          },
	          attributes: {
	
	          },
	          callbackFn: initFlashAdPlayer
	        };
	        swfobject.embedSWF(
	          swfObjectParams.url,
	          swfObjectParams.placeHolderId,
	          swfObjectParams.width,
	          swfObjectParams.height,
	          swfObjectParams.minFlashVersion,
	          swfObjectParams.expressInstallSwfUrl,
	          swfObjectParams.flashVars,
	          swfObjectParams.parameters,
	          swfObjectParams.attributes,
	          swfObjectParams.callbackFn
	        );
	
	        return swfObjectParams;
	    }
	
	    function styleFlashElement(swfObjectParams) {
	        swfobject.createCSS("#" + swfObjectParams.parameters.id, "position:absolute;top:0;left:0;", "screen", true);
	        swfobject.createCSS("." + flashWrapperElement.id, "height:100%!important;width:100%!important;", "screen", true);
	    }
	
	    function insertAfter(referenceNode, newNode) {
	        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	    }
	
	    function initFlashAdPlayer(info) {
	       // NOTE:
	       // This does NOT mean that the Flash plugin has been loaded successfully. It only means that the SWF Url was resolved and that <object> was created
	       // So, the success tasks should wait until we know that the Flash plugin is ready or when a timeout has been reached.
	
	       if (info.success) {
	          player.vpEvent.dispatch('flashLoaded');
	          fc.flashComponent.init(player, flashMetadata, flashEl.id);
	
	          //if autoplay, start player
	          // if (player.autoplay()) {player.play()};
	       } else {
	          player.vpEvent.dispatch('flashFailed');
	       }
	    }
	
	    function flashVars(playerConf) {
	        var config= {};
	        logger.log('flashPlayer flashVars', playerConf);
	        for (var prop in playerConf) {
	            config[prop] = playerConf[prop];
	        }
	
	
	        config.width= player.width();
	        config.height= player.height();
	        config.vphost= playerConf.vpHost;
	        config.vpcategory= playerConf.category;
	        config.vptags= playerConf.tags;
	        config.vpcustomparameters = playerConf.customParameters;
	
	        // config.vpflags= 'nopostroll';
	        config.divId= flashEl.id;
	
	        if (config.cuepoints){
	            config.cuepoints= playerConf.cuepoints.toString();
	        }
	        // allowScriptAccess= 'always',
	        // config.wmode = 'opaque';
	
	
	        return config;
	
	    }
	
	    return {
	       init: init
	    };
	}
	
	module.exports = flashPlayer;
	},{"../git_modules/js-flashadplayer-bridge/src/main.js":4,"./mute-button":16,"jsutils":11,"swfobject":1}],14:[function(require,module,exports){
	/*Proper fix is to have this toggle in the build process*/
	/*Local*/
	var sdkeModule = require('../git_modules/sdke-html5/src/main.js');
	/*Production*/
	// var sdkeModule = require('sdke-html5');
	
	var contribAds = require('contribAds');
	var bridgeModule = require('./bridge');
	var flashPlayerModule = require('./flashPlayer');
	var metaModuleMain = require('./metadata');
	var jsutils = require('jsutils');
	
	
	
	/** Register the plugin to the player */
	videojs.plugin('vpbc', pluginModule);
	
	/**
	 * Main function of the plugin. To have the plugin working, call this with a configuration object
	 * @param {object} options Configuration Object
	 */
	function pluginModule(options) {
	    var logger = jsutils.createLogger(false, 'BC ADS Plugin');
	    var metadata, player, config, vpPlugin, vpEvent, sdke, metaModule, flashPlayer;
	    var playerInitialized = false;
	    var forcedPause = false;
	    var adMode = null;
	    createConsoleIE9();
	
	    player = this;
	    player.ads();
	    initPlugin(options);
	    /**
	     * Run plugin initialisation methods
	     * @param {object} options Configuration Object
	     */
	    function initPlugin(options) {
	        config = options;
	        initDependencies();
	        eventHandlers();
	    }
	
	    function createConsoleIE9() {
	        if (!window.console) window.console = {};
	        if (!window.console.log) window.console.log = function () {};
	    }
	
	    /**
	     * Instantiate the plugin dependencies
	     */
	    function initDependencies() {
	        sdke = sdkeModule();
	        vpPlugin = bridgeModule(sdke);
	        vpEvent = sdke.utils.eventBus;
	        player.vpEvent = vpEvent;
	        metaModule = metaModuleMain(sdke);
	        flashPlayer = flashPlayerModule();
	        initialiseApi();
	    }
	
	    function initialiseApi() {
	        player.vpApi = {
	            getAdMode: getAdMode,
	            pauseAd: function() {logger.log('not implemented');},
	            resumeAd: function() {logger.log('not implemented');},
	            skipAd: function() {logger.log('not implemented');}
	        };
	    }
	
	    /**
	     * Combining player handlers
	     */
	    function eventHandlers() {
	        player.on('play', checkIfPlayerIsInitialised);
	        player.vpEvent.addEventListener('flashFailed', function(){
	            adMode = 'html';
	            vpPlugin.runPlugin(player, metadata);
	        });
	
	        if (!player.duration()) {
	            player.on('contentupdate', function(){logger.log('content was updated');});
	            player.on('loadedmetadata', onMetadataLoaded);
	        } else {
	            player.on('contentupdate', function(){logger.log('content was updated');});
	            onMetadataLoaded();
	        }
	    }
	
	    /**
	     * If play is triggered and metadata is not ready yet, put the player on pause
	     * @return {[type]} [description]
	     */
	    function checkIfPlayerIsInitialised() {
	        if(!playerInitialized) {
	            // The player is not initialized yet, pause playback immediately and resume when ready
	            player.pause();
	            forcedPause = true;
	        }
	    }
	
	    function getAdMode() {
	        return adMode;
	    }
	
	    /**
	     * First check if player has ben initialised. This ensures it runs only once per player which might be problematic for playlists, as multiple videos,
	     *     with different metadata can be loaded and they'd need their own metadata
	     * Init metadata module.
	     * Based on the config, choose if HTML5 or Flash should run.
	     * If the player was forced to wait (forcedPause) trigger player play
	     * @return {[type]} [description]
	     */
	    function onMetadataLoaded() {
	        // logger.log('Metadata was received, initialisation continues');
	        if (playerInitialized) return;
	        setVideoDuration();
	        playerInitialized = true;
	
	        metadata = metaModule.init(player, config);
	
	
	        if(metadata.optional && metadata.optional.flashEnabled) {
	            adMode = 'flash';
	            // logger.log('flashWorks, adMode flash');
	            flashPlayer.init(player, metaModule.getFlashMetadata());
	        } else {
	            // logger.log('eventHandlers, vpPlugin.runPlugin() called');
	            adMode = 'html';
	            // logger.log('run plugin html metadata', metadata);
	            vpPlugin.runPlugin(player, metadata);
	        }
	
	        if(forcedPause) {
	            // Playback was halted because the player was not yet ready. Reset flag and resume playback
	            forcedPause = false;
	            // logger.log('perform src main.js play');
	            player.play();
	        }
	    }
	
	    function setVideoDuration() {
	        if (!config.duration) {
	            config.duration = player.duration();
	        }
	    }
	}
	},{"../git_modules/sdke-html5/src/main.js":9,"./bridge":12,"./flashPlayer":13,"./metadata":15,"contribAds":2,"jsutils":11}],15:[function(require,module,exports){
	var urlDataModule = require('./url-metadata');
	var jsutils = require('jsutils');
	
	"use strict";
	/**
	 * Module start function
	 * Offers some tools for managing Brightcove specific metadata and passing it in html and flash formats
	 * @return {[type]} [description]
	 */
	function metadataModule(sdkeInstance) {
		var player, metadata, videoCustomFields;
		var sdke = sdkeInstance;
		var vpConfig;
	    var logger = jsutils.createLogger(false, 'BC ADS Plugin');
	
	
		/**
		 * Legacy entry point
		 * Collect metadata from different sources and aggregate it
		 * Check how does this work when changing videos
		 * @return {[type]} [description]
		 */
		function init(p, config) {
			var videoMetadata, mappedMetadata, vocentoMeta, urlData;
			player = p;
			if (player.mediainfo) {
				videoMetadata = player.mediainfo || {};
				videoCustomFields = player.mediainfo.custom_fields || {};
				mappedMetadata = _getMappedMetadata(player.mediainfo);
			}
			var bcCuepoints = _getBcVideoMidrollCuepoints();
			if (config.optional && config.optional.urlMetadata) {
				urlData = urlDataModule.getQueryMetadata();
			}
	
			//Ovewrite cuepoints sent in config if the video has cuepoints defined.
			if (bcCuepoints.length > 0) {
				metadata = sdke.metadataTools.aggregateData([config, clientConfigOverride(), urlData, videoMetadata, videoCustomFields, mappedMetadata, {cuepoints: bcCuepoints}]);
			} else {
				metadata = sdke.metadataTools.aggregateData([config, clientConfigOverride(), urlData, videoMetadata, videoCustomFields, mappedMetadata,vocentoMeta]);
			}
	
			return metadata;
		}
	
		function clientConfigOverride() {
			logger.log('updated version vpconfig');
			var data = {};
			if (player.vpConfig) {
				data = player.vpConfig || {};
			}
			return data;
		}
	
		//SERIOUSLY UNIT TEST THIS, PLEASE
		function _getMappedMetadata(mediainfo) {
			var metadata = {};
			var prop;
			var mappedMetadata = {};
			var mappedParamValues =  {
				tags: 'vpBCMapTags',
				category: 'vpBCMapCategory',
				flags: 'vpBCMapFlags',
				contentPartner: 'vpBCMapContentPartner'
			};
			if (vpConfig) { //do a try catch instead. Also check why stuff is not sent to flash when flash is initialized
				for (prop in mappedParamValues) {
					if (mediainfo.custom_fields !== undefined && mediainfo.custom_fields[vpConfig[mappedParamValues[prop]]] !== undefined) {
						metadata[prop] = mediainfo.custom_fields[vpConfig[mappedParamValues[prop]]];
					}
				}
			} else {
				for (prop in mappedParamValues) {
					if (mediainfo.custom_fields !== undefined && mediainfo.custom_fields[mediainfo[mappedParamValues[prop]]] !== undefined) {
						metadata[prop] = mediainfo.custom_fields[mediainfo[mappedParamValues[prop]]];
					}
				}
			}
	
			return metadata;
		}
	
		function _getBcVideoMidrollCuepoints() {
			var bcCuepoints;
			if (player.mediainfo) {
				bcCuepoints = player.mediainfo.cue_points;
			}
			var cuepoints = [];
			if (bcCuepoints && bcCuepoints.length > 0) {
				for (var i = 0; i < bcCuepoints.length; i++) {
					if (bcCuepoints[i].name === 'vpspot') {
						cuepoints.push(bcCuepoints[i].time);
					}
				}
			}
			return cuepoints;
		}
	
	    function getFlashMetadata() {
	        return sdke.metadataTools.getFlashFormat();
	    }
	
		return {
			init: init,
			getFlashMetadata: getFlashMetadata
		};
	}
	
	module.exports = metadataModule;
	},{"./url-metadata":18,"jsutils":11}],16:[function(require,module,exports){
	function muteButton(player) {
	    var button;
	    var btnBackground = 'url(//cdn.videoplaza.tv/contrib/es-vocento/new-brightcove/resources/volume_sprite.png)'
	    var mutedPosition = '34px 0px';
	    var unmutedPosition = '0px 0px';
	
	    function init() {
	        button = insert();
	        player.on('adstart', show);
	        player.on('adend', hide);
	
	        button.addEventListener("click", muteToggle);
	    }
	
	    function insert() {
	        var button = create(player);
	        player.el().appendChild(button);
	
	        return button;
	    }
	
	    function create() {
	        var button = document.createElement("div");
	        var textDiv = document.createElement('div');
	
	        button.className = 'mute-control'
	
	        button.style['position'] = "absolute";
	        button.style['font-size'] = "14px";
	        button.style['color'] = "white";
	        button.style['bottom'] = "0px";
	        button.style['right'] = "0px";
	        button.style.width = '36px';
	        button.style.height = '30px';
	        button.style.visibility = 'hidden';
	
	        button.style.cursor = 'pointer';
	        button.style['background-image'] = btnBackground;
	        button.style['background-position']= '0px 0px';
	        button.style['border-style'] = 'solid';
	        button.style['border-width'] = '1px';
	        button.style['border-right-width'] = '0px';
	
	        // textDiv.innerHTML = text || 'Skip ad';
	
	        // button.appendChild(textDiv);
	
	        return button;
	    }
	
	    function show() {
	        isMuted();
	        button.style.visibility = 'visible';
	    }
	
	    function hide() {
	        button.style.visibility = 'hidden';
	    }
	
	    function isMuted() {
	        if (player.volume() === 0 || player.muted()) {
	            button.style['background-position']= unmutedPosition;
	            return true;
	        } else {
	            button.style['background-position']= mutedPosition;
	            return false;
	        }
	    }
	
	    function muteToggle() {
	        if (isMuted()) {
	            player.muted(false);
	            button.style['background-position']= mutedPosition;
	        } else {
	            player.muted(true);
	            button.style['background-position']= unmutedPosition;
	        }
	    }
	
	    init();
	}
	
	module.exports = muteButton;
	},{}],17:[function(require,module,exports){
	function skipButton(player, timeout, text) {
	    var button;
	
	    function init() {
	        button = insert();
	        player.on('adtimeupdate', show);
	        player.vpEvent.addEventListener('vp:ad-ended', hide);
	
	        button.addEventListener("click", player.vpApi.skipAd);
	    }
	
	    function insert() {
	        var button = create(player);
	        player.el().appendChild(button);
	
	        return button;
	    }
	
	    function create() {
	        var button = document.createElement("div");
	        var textDiv = document.createElement('div');
	
	        button.className = 'skip-control'
	
	        button.style['position'] = "absolute";
	        button.style['font-size'] = "14px";
	        button.style['color'] = "white";
	        button.style['bottom'] = "30px";
	        button.style['right'] = "0px";
	        button.style['padding'] = "10px 30px 10px 25px";
	        button.style.width = 'auto';
	        button.style.visibility = 'hidden';
	        button.style.cursor = 'pointer';
	        button.style['background-color'] = 'rgba(7,20,30,.7)';
	        button.style['border-style'] = 'solid';
	        button.style['border-width'] = '1px';
	        button.style['border-right-width'] = '0px';
	
	        textDiv.innerHTML = text || 'Skip ad';
	
	        button.appendChild(textDiv);
	
	        return button;
	    }
	
	    function show() {
	        if (player.ads.state !== 'ad-playback') return;
	        var time = timeout || 0;
	
	        if (player.currentTime() > time) {
	            button.style.visibility = 'visible';
	        }
	    }
	
	    function hide() {
	        button.style.visibility = 'hidden';
	    }
	
	    init();
	}
	
	module.exports = skipButton;
	},{}],18:[function(require,module,exports){
	function getQueryMetadata() {
	    var metadata = {
	        vpCategory: getParameterByName('category'),
	        contentPartner: getParameterByName('contentPartner'),
	        tags: getParameterByName('tags').split(','),
	    };
	
	    return metadata;
	}
	function getParameterByName(name) {
	    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	        results = regex.exec(location.search);
	    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
	
	module.exports = {
	    getQueryMetadata: getQueryMetadata
	}
	
	
	},{}]},{},[14]);
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';
	
	(function (window, document, videojs) {
	
	  /**
	   *  Cookie access functions.
	   *  From: https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
	   */
	  var cookies = {
	    getItem: function (sKey) {
	      if (!sKey) { return null; }
	      return decodeURIComponent(
	        document.cookie.replace(
	          new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(
	            /[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")
	        ) || null;
	    },
	    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
	      if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
	      var sExpires = "";
	      if (vEnd) {
	        switch (vEnd.constructor) {
	          case Number:
	            sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
	            break;
	          case String:
	            sExpires = "; expires=" + vEnd;
	            break;
	          case Date:
	            sExpires = "; expires=" + vEnd.toUTCString();
	            break;
	        }
	      }
	      document.cookie =
	        encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue)
	          + sExpires
	          + (sDomain ? "; domain=" + sDomain : "")
	          + (sPath ? "; path=" + sPath : "")
	          + (bSecure ? "; secure" : "");
	      return true;
	    },
	    removeItem: function(sKey, sPath, sDomain) {
	      if (!this.hasItem(sKey)) {
	        return false;
	      }
	      document.cookie = encodeURIComponent(sKey) + "=;" + " expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
	      return true;
	    },
	    hasItem: function (sKey) {
	      if (!sKey) { return false; }
	      return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(
	        /[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	    },
	  },
	
	  /**
	   *  Local storage functionality.
	   */
	  localStorage = {
	    available: function() {
	      try {
	        window.localStorage.setItem('fishingForLocalStorage', 'itsHere');
	        window.localStorage.removeItem('fishingForLocalStorage');
	        return true;
	      } catch(e) {
	        return false;
	      }
	    },
	    getItem: function(key) {
	      return window.localStorage.getItem(key);
	    },
	    setItem: function(key, value) {
	      return window.localStorage.setItem(key, value);
	    },
	    removeItem: function(key) {
	      return window.localStorage.removeItem(key);
	    }
	  },
	
	  /**
	   *  Storage chooser, will use localstorage if available, otherwise use cookies.
	   */
	  storage = {
	    getItem: function (key) {
	      return localStorage.available() ? localStorage.getItem(key) : cookies.getItem(key);
	    },
	    setItem: function (key, value) {
	      localStorage.available() ? localStorage.setItem(key, value) : cookies.setItem(key, value, Infinity, '/');
	      return value;
	    },
	    removeItem: function (key) {
	      localStorage.available() ? localStorage.removeItem(key) : cookies.removeItem(key);
	    }
	  },
	
	  /**
	   *  Object extend function.
	   */
	  extend = function(obj) {
	    var arg, i, k;
	    for (i = 1; i < arguments.length; i++) {
	      arg = arguments[i];
	      for (k in arg) {
	        if (arg.hasOwnProperty(k)) {
	          obj[k] = arg[k];
	        }
	      }
	    }
	    return obj;
	  },
	
	  /**
	   *  Default settings for this plugin.
	   */
	  defaults = {
	    namespace: 'autoplay-toggle',   // namespace for cookie/localstorage
	  },
	
	  /**
	   *  Autoplay toggle plugin setup.
	   */
	  autoplayToggle = function (options) {
	
	    var player = this,
	        settings = extend({}, defaults, options || {}),
	        key = settings.namespace + '-autoplay';
	
	    // add new button to player
	    var autoplayBtn = document.createElement('div');
	    autoplayBtn.className = 'vjs-autoplay-toggle-button vjs-menu-button vjs-control';
	    autoplayBtn.innerHTML =
	      '<div>'
	        + '<span class="vjs-control-text">'
	            + 'Autoplay:<br>'
	            + '<span class="autoplay-toggle autoplay-toggle-active autoplay-on">On</span>'
	            + '&nbsp;/&nbsp;'
	            + '<span class="autoplay-toggle autoplay-off">Off</span>'
	        + '</span>'
	      '</div>';
	    player.controlBar.el().appendChild(autoplayBtn);
	
	    // retrieve autoplay from storage and highlight the correct toggle option in *all* video players
	    var autoplayToggleButton = function (activate) {
	
	      // set cookie once
	      activate ? storage.removeItem(key) : storage.setItem(key, 'no');
	
	      // get all videos and toggle all their autoplays
	      var videos = document.querySelectorAll('.video-js');
	      for (var i = 0; i < videos.length; i++) {
	
	        // check that this video has a toggle button
	        var toggleBtnSelector  = videos[i].querySelectorAll('.vjs-autoplay-toggle-button');
	        if (toggleBtnSelector.length > 0) {
	          var toggleBtn = toggleBtnSelector[0],
	              toggleOn = toggleBtn.querySelectorAll('.autoplay-on')[0],
	              toggleOff = toggleBtn.querySelectorAll('.autoplay-off')[0];
	
	          if (activate) {
	            // toggle this on
	            toggleOn.className = 'autoplay-toggle autoplay-toggle-active autoplay-on';
	            toggleOff.className = 'autoplay-toggle autoplay-off';
	          } else {
	            // toggle this off
	            toggleOn.className = 'autoplay-toggle autoplay-on';
	            toggleOff.className = 'autoplay-toggle autoplay-toggle-active autoplay-off';
	          }
	        }
	      }
	    };
	
	    var turnOn = !storage.getItem(key);
	    // change player behavior based on toggle
	    if (player.autoplay() && !turnOn) {
	      // this could be autoplaying, make sure to stop it and ensure player's autoplay is false
	      player.autoplay(false);
	      player.pause();
	    } else if (player.autoplay() && turnOn) {
	      // we want this to autoplay
	      player.play();
	    }
	
	    // initialize autoplay toggle
	    autoplayToggleButton(turnOn);
	
	    // set up toggle click
	    autoplayBtn.onclick = function () {
	      // check if key in storage and do the opposite of that to toggle
	      var toggle = !!storage.getItem(key);
	      autoplayToggleButton(toggle);
	    };
	
	    // return player to allow this plugin to be chained
	    return player;
	
	  };
	
	  // set this thing up as a vjs plugin
	  videojs.plugin('autoplayToggle', autoplayToggle);
	
	  // alternative function for retrieving autoplay value from storage for situations where other plugins
	  //  are interfering with this plugin
	  videojs.autoplaySettingFromStorage = function (options) {
	    var settings = extend({}, defaults, options || {}),
	        key = settings.namespace + '-autoplay';
	
	    // negate what's in storage since only "don't autoplay" is stored
	    return !storage.getItem(key);
	  };
	
	})(window, document, videojs);


/***/ },
/* 12 */
/***/ function(module, exports) {

	/*
	* videojs-ga - v0.4.2 - 2015-02-06
	* Copyright (c) 2015 Michael Bensoussan
	* Licensed MIT
	*/
	(function() {
	  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
	
	  videojs.plugin('ga', function(options) {
	    var dataSetupOptions, defaultsEventsToTrack, end, error, eventCategory, eventLabel, eventsToTrack, fullscreen, loaded, parsedOptions, pause, percentsAlreadyTracked, percentsPlayedInterval, play, resize, seekEnd, seekStart, seeking, sendbeacon, timeupdate, volumeChange;
	    if (options == null) {
	      options = {};
	    }
	    dataSetupOptions = {};
	    if (this.options()["data-setup"]) {
	      parsedOptions = JSON.parse(this.options()["data-setup"]);
	      if (parsedOptions.ga) {
	        dataSetupOptions = parsedOptions.ga;
	      }
	    }
	    defaultsEventsToTrack = ['loaded', 'percentsPlayed', 'start', 'end', 'seek', 'play', 'pause', 'resize', 'volumeChange', 'error', 'fullscreen'];
	    eventsToTrack = options.eventsToTrack || dataSetupOptions.eventsToTrack || defaultsEventsToTrack;
	    percentsPlayedInterval = options.percentsPlayedInterval || dataSetupOptions.percentsPlayedInterval || 10;
	    eventCategory = options.eventCategory || dataSetupOptions.eventCategory || 'Video';
	    eventLabel = options.eventLabel || dataSetupOptions.eventLabel;
	    options.debug = options.debug || false;
	    percentsAlreadyTracked = [];
	    seekStart = seekEnd = 0;
	    seeking = false;
	    loaded = function() {
	      if (!eventLabel) {
	        eventLabel = this.currentSrc().split("/").slice(-1)[0].replace(/\.(\w{3,4})(\?.*)?$/i, '');
	      }
	      if (__indexOf.call(eventsToTrack, "loadedmetadata") >= 0) {
	        sendbeacon('loadedmetadata', true);
	      }
	    };
	    timeupdate = function() {
	      var currentTime, duration, percent, percentPlayed, _i;
	      currentTime = Math.round(this.currentTime());
	      duration = Math.round(this.duration());
	      percentPlayed = Math.round(currentTime / duration * 100);
	      for (percent = _i = 0; _i <= 99; percent = _i += percentsPlayedInterval) {
	        if (percentPlayed >= percent && __indexOf.call(percentsAlreadyTracked, percent) < 0) {
	          if (__indexOf.call(eventsToTrack, "start") >= 0 && percent === 0 && percentPlayed > 0) {
	            sendbeacon('start', true);
	          } else if (__indexOf.call(eventsToTrack, "percentsPlayed") >= 0 && percentPlayed !== 0) {
	            sendbeacon('percent played', true, percent);
	          }
	          if (percentPlayed > 0) {
	            percentsAlreadyTracked.push(percent);
	          }
	        }
	      }
	      if (__indexOf.call(eventsToTrack, "seek") >= 0) {
	        seekStart = seekEnd;
	        seekEnd = currentTime;
	        if (Math.abs(seekStart - seekEnd) > 1) {
	          seeking = true;
	          sendbeacon('seek start', false, seekStart);
	          sendbeacon('seek end', false, seekEnd);
	        }
	      }
	    };
	    end = function() {
	      sendbeacon('end', true);
	    };
	    play = function() {
	      var currentTime;
	      currentTime = Math.round(this.currentTime());
	      sendbeacon('play', true, currentTime);
	      seeking = false;
	    };
	    pause = function() {
	      var currentTime, duration;
	      currentTime = Math.round(this.currentTime());
	      duration = Math.round(this.duration());
	      if (currentTime !== duration && !seeking) {
	        sendbeacon('pause', false, currentTime);
	      }
	    };
	    volumeChange = function() {
	      var volume;
	      volume = this.muted() === true ? 0 : this.volume();
	      sendbeacon('volume change', false, volume);
	    };
	    resize = function() {
	      sendbeacon('resize - ' + this.width() + "*" + this.height(), true);
	    };
	    error = function() {
	      var currentTime;
	      currentTime = Math.round(this.currentTime());
	      sendbeacon('error', true, currentTime);
	    };
	    fullscreen = function() {
	      var currentTime;
	      currentTime = Math.round(this.currentTime());
	      if ((typeof this.isFullscreen === "function" ? this.isFullscreen() : void 0) || (typeof this.isFullScreen === "function" ? this.isFullScreen() : void 0)) {
	        sendbeacon('enter fullscreen', false, currentTime);
	      } else {
	        sendbeacon('exit fullscreen', false, currentTime);
	      }
	    };
	    sendbeacon = function(action, nonInteraction, value) {
	      if (window.ga) {
	        ga('send', 'event', {
	          'eventCategory': eventCategory,
	          'eventAction': action,
	          'eventLabel': eventLabel,
	          'eventValue': value,
	          'nonInteraction': nonInteraction
	        });
	      } else if (window._gaq) {
	        _gaq.push(['_trackEvent', eventCategory, action, eventLabel, value, nonInteraction]);
	      } else if (options.debug) {
	        console.log("Google Analytics not detected");
	      }
	    };
	    this.ready(function() {
	      this.on("loadedmetadata", loaded);
	      this.on("timeupdate", timeupdate);
	      if (__indexOf.call(eventsToTrack, "end") >= 0) {
	        this.on("ended", end);
	      }
	      if (__indexOf.call(eventsToTrack, "play") >= 0) {
	        this.on("play", play);
	      }
	      if (__indexOf.call(eventsToTrack, "pause") >= 0) {
	        this.on("pause", pause);
	      }
	      if (__indexOf.call(eventsToTrack, "volumeChange") >= 0) {
	        this.on("volumechange", volumeChange);
	      }
	      if (__indexOf.call(eventsToTrack, "resize") >= 0) {
	        this.on("resize", resize);
	      }
	      if (__indexOf.call(eventsToTrack, "error") >= 0) {
	        this.on("error", error);
	      }
	      if (__indexOf.call(eventsToTrack, "fullscreen") >= 0) {
	        return this.on("fullscreenchange", fullscreen);
	      }
	    });
	    return {
	      'sendbeacon': sendbeacon
	    };
	  });
	
	}).call(this);


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {// Copyright (c) 2014 comScore, Inc.
	window.ns_=window.ns_||{};ns_.StreamSense=ns_.StreamSense||function(){function h(t,n){var r=t||"",i="undefined",s=l.comScore||l.sitestat||function(t){var n="comScore=",r=c.cookie,s="",o="indexOf",a="substring",f="length",h=e.browserAcceptsLargeURLs()?g.URL_LENGTH_LIMIT:g.RESTRICTED_URL_LENGTH_LIMIT,p,d="&ns_",v="&",m,y,b,w,E=l.encodeURIComponent||escape;if(r[o](n)+1)for(b=0,y=r.split(";"),w=y[f];b<w;b++)m=y[b][o](n),m+1&&(s=v+unescape(y[b][a](m+n[f])));t+=d+"_t="+ +(new Date)+d+"c="+(c.characterSet||c.defaultCharset||"")+s,t.length>h&&t.indexOf(v)>0&&(p=t.substr(0,h-8).lastIndexOf(v),t=(t.substring(0,p)+d+"cut="+E(t.substring(p+1))).substr(0,h)),u.httpGet(t),typeof ns_p===i&&(ns_p={src:t}),ns_p.lastMeasurement=t};if(typeof n!==i){var o=[],a=l.encodeURIComponent||escape;for(var f in n)n.hasOwnProperty(f)&&o.push(a(f)+"="+a(n[f]));/[\?\&]$/.test(r)||(r+="&"),r+=o.join("&")}return s(r)}function p(t,n){var r,i=l.encodeURIComponent||escape,s=[],o=g.LABELS_ORDER,u=t.split("?"),a=u[0],f=u[1],h=f.split("&");for(var p=0,d=h.length;p<d;p++){var v=h[p].split("="),m=unescape(v[0]),y=unescape(v[1]);m&&(n[m]=y)}var b={};for(var p=0,d=o.length;p<d;p++){var w=o[p];if(n.hasOwnProperty(w)){var E=n[w];typeof E!="undefined"&&E!=null&&(b[w]=!0,s.push(i(w)+"="+i(n[w])))}}for(var w in n){if(b[w])continue;if(n.hasOwnProperty(w)){var E=n[w];typeof E!="undefined"&&E!=null&&s.push(i(w)+"="+i(n[w]))}}r=a+"?"+s.join("&"),r=r+(r.indexOf("&c8=")<0?"&c8="+i(c.title):"")+(r.indexOf("&c7=")<0?"&c7="+i(c.URL):"")+(r.indexOf("&c9=")<0?"&c9="+i(c.referrer):"");var S=e.browserAcceptsLargeURLs()?g.URL_LENGTH_LIMIT:g.RESTRICTED_URL_LENGTH_LIMIT;if(r.length>S&&r.indexOf("&")>0){var x=r.substr(0,S-8).lastIndexOf("&");r=(r.substring(0,x)+"&ns_cut="+i(r.substring(x+1))).substr(0,S)}return r}var e=function(){var e={uid:function(){var e=1;return function(){return+(new Date)+"_"+e++}}(),filter:function(e,t){var n={};for(var r in t)t.hasOwnProperty(r)&&e(t[r])&&(n[r]=t[r]);return n},extend:function(e){var t=arguments.length,n;e=e||{};for(var r=1;r<t;r++){n=arguments[r];if(!n)continue;for(var i in n)n.hasOwnProperty(i)&&(e[i]=n[i])}return e},getString:function(e,t){var n=String(e);return e==null?t||"na":n},getLong:function(e,t){var n=Number(e);return e==null||isNaN(n)?t||0:n},getInteger:function(e,t){var n=Number(e);return e==null||isNaN(n)?t||0:n},getBoolean:function(e,t){var n=String(e).toLowerCase()=="true";return e==null?t||!1:n},isNotEmpty:function(e){return typeof e!="undefined"&&e!=null&&typeof e.length!="undefined"&&e.length>0},indexOf:function(t,n){var r=-1;return e.forEach(n,function(e,n){e==t&&(r=n)}),r},forEach:function(e,t,n){try{if(typeof t=="function"){n=typeof n!="undefined"?n:null;if(typeof e["length"]!="number"||typeof e[0]=="undefined"){var r=typeof e.__proto__!="undefined";for(var i in e)(!r||r&&typeof e.__proto__[i]=="undefined")&&typeof e[i]!="function"&&t.call(n,e[i],i)}else for(var i=0,s=e.length;i<s;i++)t.call(n,e[i],i)}}catch(o){}},regionMatches:function(e,t,n,r,i){if(t<0||r<0||t+i>e.length||r+i>n.length)return!1;while(--i>=0){var s=e.charAt(t++),o=n.charAt(r++);if(s!=o)return!1}return!0},size:function(e){var t=0,n;for(var n in e)e.hasOwnProperty(n)&&t++;return t},log:function(e,t){if(typeof t!="undefined"&&t){var n=new Date,r=n.getHours()+":"+n.getMinutes()+":"+n.getSeconds();console.log(r,e)}},isTrue:function(e){return typeof e=="undefined"?!1:typeof e=="string"?(e=e.toLowerCase(),e==="true"||e==="1"||e==="on"):e?!0:!1},toString:function(t){if(typeof t=="undefined")return"undefined";if(typeof t=="string")return t;if(Object.prototype.toString.call(t)==="[object Array]")return t.join(",");if(e.size(t)>0){var n="";for(var r in t)t.hasOwnProperty(r)&&(n+=r+":"+t[r]+";");return n}return t.toString()},exists:function(e){return typeof e!="undefined"&&e!=null},firstGreaterThan0:function(){for(var e=0,t=arguments.length;e<t;e++){var n=arguments[e];if(n>0)return n}return 0},cloneObject:function(e){if(null==e||"object"!=typeof e)return e;var t=e.constructor();for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);return t},safeGet:function(t,n){return n=e.exists(n)?n:"",e.exists(t)?t:n},getBrowserName:function(){var e=navigator.userAgent,t=navigator.appName,n,r;return(r=e.indexOf("Opera"))!=-1||(r=e.indexOf("OPR/"))!=-1?t="Opera":(r=e.indexOf("Android"))!=-1?t="Android":(r=e.indexOf("Chrome"))!=-1?t="Chrome":(r=e.indexOf("Safari"))!=-1?t="Safari":(r=e.indexOf("Firefox"))!=-1?t="Firefox":(r=e.indexOf("IEMobile"))!=-1?t="Internet Explorer Mobile":t=="Microsoft Internet Explorer"||t=="Netscape"?t="Internet Explorer":(n=e.lastIndexOf(" ")+1)<(r=e.lastIndexOf("/"))&&(t=e.substring(n,r),t.toLowerCase()==t.toUpperCase()&&(t=navigator.appName)),t},getBrowserFullVersion:function(){var e=navigator.userAgent,t=navigator.appName,n=""+parseFloat(navigator.appVersion),r,i,s,o,u;return(s=e.indexOf("Opera"))!=-1?(n=e.substring(s+6),(s=e.indexOf("Version"))!=-1&&(n=e.substring(s+8))):(s=e.indexOf("OPR/"))!=-1?n=e.substring(s+4):(s=e.indexOf("Android"))!=-1?n=e.substring(s+11):(s=e.indexOf("Chrome"))!=-1?n=e.substring(s+7):(s=e.indexOf("Safari"))!=-1?(n=e.substring(s+7),(s=e.indexOf("Version"))!=-1&&(n=e.substring(s+8))):(s=e.indexOf("Firefox"))!=-1?n=e.substring(s+8):t=="Microsoft Internet Explorer"?(u=new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})"),u.exec(e)!=null&&(n=parseFloat(RegExp.$1))):t=="Netscape"?(u=new RegExp("Trident/.*rv:([0-9]{1,}[.0-9]{0,})"),u.exec(e)!=null&&(n=parseFloat(RegExp.$1))):(i=e.lastIndexOf(" ")+1)<(s=e.lastIndexOf("/"))&&(n=e.substring(s+1)),n=n.toString(),(o=n.indexOf(";"))!=-1&&(n=n.substring(0,o)),(o=n.indexOf(" "))!=-1&&(n=n.substring(0,o)),(o=n.indexOf(")"))!=-1&&(n=n.substring(0,o)),r=parseInt(""+n,10),isNaN(r)&&(n=""+parseFloat(navigator.appVersion)),n},browserAcceptsLargeURLs:function(){return window.ActiveXObject===null||!0}};return e}(),t=function(){var t="cs_",n=function(){var n=this,r=typeof localStorage!="undefined"?localStorage:{};e.extend(this,{get:function(e){return r[t+e]},set:function(e,n){r[t+e]=n},has:function(e){return t+e in r},remove:function(e){delete r[t+e]},clear:function(){for(var e in r)r.hasOwnProperty(e)&&delete r[e]}})};return n}(),n=function(e,t){var n=new Image;n.onload=function(){t&&t(200)},n.onerror=function(){t&&t()},n.src=e},r=function(e,t){t&&setTimeout(t,0)},i=function(e,t,n){n&&setTimeout(n,0)},s=function(){return{dir:function(e){return null},append:function(e,t,n){},write:function(e,t,n){},deleteFile:function(e,t){return!1},read:function(e,t){return null}}}(),o=function(e,t){typeof engine!="undefined"&&t&&setTimeout(t,0);var n=engine.createHttpClient(),r=n.createRequest("GET",e,null);r.start(),t&&setTimeout(t,0)},u=function(){var e={PLATFORM:"generic",httpGet:n,httpPost:i,Storage:t,IO:s,getCrossPublisherId:function(){return null},getAppName:function(){return Constants.UNKNOWN_VALUE},getAppVersion:function(e){return Constants.UNKNOWN_VALUE},getVisitorId:function(){return this.getDeviceName()+ +(new Date)+~~(Math.random()*1e3)},getVisitorIdSuffix:function(){return"72"},getDeviceName:function(){return""},getPlatformVersion:function(){return""},getPlatformName:function(){return"js"},getRuntimeName:function(){return""},getRuntimeVersion:function(){return""},getResolution:function(){return""},getLanguage:function(){return""},getPackageName:function(){return""},isConnectionAvailable:function(){return!0},isCompatible:function(){return!0},autoSelect:function(){},isCrossPublisherIdChanged:function(){return!1}};return e}(),a=function(){function f(){return typeof engine!="undefined"&&typeof engine.stats!="undefined"}function l(){return e.isNotEmpty(engine.stats.device.id)?engine.stats.device.id:e.isNotEmpty(engine.stats.network.mac)?engine.stats.network.mac:null}function c(){if(r==null){var e=l();e!=null?(r=e,u="31",a=e):(r=+(new Date)+~~(Math.random()*1e3),u="72",a=null)}}var n=this,r=null,u=null,a=null;return{PLATFORM:"trilithium",httpGet:o,httpPost:i,Storage:t,IO:s,getCrossPublisherId:function(){return c(),a},getAppName:function(){return e.isNotEmpty(engine.stats.application.name)?engine.stats.application.name:Constants.UNKNOWN_VALUE},getAppVersion:function(t){return e.isNotEmpty(engine.stats.application.version)?engine.stats.application.version:Constants.UNKNOWN_VALUE},getVisitorId:function(){return c(),r},getVisitorIdSuffix:function(){return u},getDeviceName:function(){return e.safeGet(engine.stats.device.platform,"")},getPlatformVersion:function(){return e.safeGet(engine.stats.device.version,"")},getPlatformName:function(){return"js"},getRuntimeName:function(){return"trilithium"},getRuntimeVersion:function(){return""},getResolution:function(){return typeof screen!="undefined"&&typeof screen.height!="undefined"&&typeof screen.width!="undefined"?screen.height+"x"+screen.width:""},getLanguage:function(){return""},getPackageName:function(){return""},isConnectionAvailable:function(){return!0},isCompatible:f}}();u.autoSelect=function(){a.isCompatible()&&e.extend(u,a)};var f=typeof window!="undefined"&&typeof document!="undefined",l,c;f?(l=window,c=document):(l={},c={location:{href:""},title:"",URL:"",referrer:"",cookie:""});var e=e||{};e.filterMap=function(t,n){for(var r in t)e.indexOf(r,n)==-1&&delete t[r]},e.getKeys=function(e,t){var n,r=[];for(n in e)(!t||t.test(n))&&e.hasOwnProperty(n)&&(r[r.length]=n);return r};var d=function(){var e=["play","pause","end","buffer","keep-alive","hb","custom","ad_play","ad_pause","ad_end","ad_click"];return{PLAY:0,PAUSE:1,END:2,BUFFER:3,KEEP_ALIVE:4,HEART_BEAT:5,CUSTOM:6,AD_PLAY:7,AD_PAUSE:8,AD_END:9,AD_CLICK:10,toString:function(t){return e[t]}}}(),v=function(){var e=[d.END,d.PLAY,d.PAUSE,d.BUFFER];return{IDLE:0,PLAYING:1,PAUSED:2,BUFFERING:3,toEventType:function(t){return e[t]}}}(),m={ADPLAY:d.AD_PLAY,ADPAUSE:d.AD_PAUSE,ADEND:d.AD_END,ADCLICK:d.AD_CLICK},g={STREAMSENSE_VERSION:"4.1411.18",DEFAULT_PLAYERNAME:"streamsense",DEFAULT_HEARTBEAT_INTERVAL:[{playingtime:6e4,interval:1e4},{playingtime:null,interval:6e4}],DEFAULT_KEEP_ALIVE_INTERVAL:12e5,DEFAULT_PAUSED_ON_BUFFERING_INTERVAL:500,C1_VALUE:"19",C10_VALUE:"js",NS_AP_C12M_VALUE:"1",NS_NC_VALUE:"1",PAGE_NAME_LABEL:"name",RESTRICTED_URL_LENGTH_LIMIT:2048,URL_LENGTH_LIMIT:4096,LABELS_ORDER:["c1","c2","ca2","cb2","cc2","cd2","ns_site","ca_ns_site","cb_ns_site","cc_ns_site","cd_ns_site","ns_vsite","ca_ns_vsite","cb_ns_vsite","cc_ns_vsite","cd_ns_vsite","ns_ap_an","ca_ns_ap_an","cb_ns_ap_an","cc_ns_ap_an","cd_ns_ap_an","ns_ap_pn","ns_ap_pv","c12","ca12","cb12","cc12","cd12","ns_ak","ns_ns_ap_hw","name","ns_ap_ni","ns_ap_ec","ns_ap_ev","ns_ap_device","ns_ap_id","ns_ap_csf","ns_ap_bi","ns_ap_pfm","ns_ap_pfv","ns_ap_ver","ca_ns_ap_ver","cb_ns_ap_ver","cc_ns_ap_ver","cd_ns_ap_ver","ns_ap_sv","ns_ap_cv","ns_type","ca_ns_type","cb_ns_type","cc_ns_type","cd_ns_type","ns_radio","ns_nc","ns_ap_ui","ca_ns_ap_ui","cb_ns_ap_ui","cc_ns_ap_ui","cd_ns_ap_ui","ns_ap_gs","ns_st_sv","ns_st_pv","ns_st_it","ns_st_id","ns_st_ec","ns_st_sp","ns_st_sq","ns_st_cn","ns_st_ev","ns_st_po","ns_st_cl","ns_st_el","ns_st_pb","ns_st_hc","ns_st_mp","ca_ns_st_mp","cb_ns_st_mp","cc_ns_st_mp","cd_ns_st_mp","ns_st_mv","ca_ns_st_mv","cb_ns_st_mv","cc_ns_st_mv","cd_ns_st_mv","ns_st_pn","ns_st_tp","ns_st_pt","ns_st_pa","ns_st_ad","ns_st_li","ns_st_ci","ns_ap_jb","ns_ap_res","ns_ap_c12m","ns_ap_install","ns_ap_updated","ns_ap_lastrun","ns_ap_cs","ns_ap_runs","ns_ap_usage","ns_ap_fg","ns_ap_ft","ns_ap_dft","ns_ap_bt","ns_ap_dbt","ns_ap_dit","ns_ap_as","ns_ap_das","ns_ap_it","ns_ap_uc","ns_ap_aus","ns_ap_daus","ns_ap_us","ns_ap_dus","ns_ap_ut","ns_ap_oc","ns_ap_uxc","ns_ap_uxs","ns_ap_lang","ns_ap_ar","ns_ap_miss","ns_ts","ns_st_ca","ns_st_cp","ns_st_er","ca_ns_st_er","cb_ns_st_er","cc_ns_st_er","cd_ns_st_er","ns_st_pe","ns_st_ui","ca_ns_st_ui","cb_ns_st_ui","cc_ns_st_ui","cd_ns_st_ui","ns_st_bc","ns_st_bt","ns_st_bp","ns_st_pc","ns_st_pp","ns_st_br","ns_st_ub","ns_st_vo","ns_st_ws","ns_st_pl","ns_st_pr","ns_st_ep","ns_st_ty","ns_st_ct","ns_st_cs","ns_st_ge","ns_st_st","ns_st_dt","ns_st_de","ns_st_pu","ns_st_cu","ns_st_fee","ns_ap_i1","ns_ap_i2","ns_ap_i3","ns_ap_i4","ns_ap_i5","ns_ap_i6","c3","ca3","cb3","cc3","cd3","c4","ca4","cb4","cc4","cd4","c5","ca5","cb5","cc5","cd5","c6","ca6","cb6","cc6","cd6","c10","c11","c13","c14","c15","c16","c7","c8","c9"]},y=function(){var t=function(){function l(e,t){var n=t[e];n!=null&&(f[e]=n)}var t=this,n=0,r=0,i=0,s=0,o=0,u=0,a,f;e.extend(this,{reset:function(n){n!=null&&n.length>0?e.filterMap(f,n):f={},f.hasOwnProperty("ns_st_cl")||(f.ns_st_cl="0"),f.hasOwnProperty("ns_st_pn")||(f.ns_st_pn="1"),f.hasOwnProperty("ns_st_tp")||(f.ns_st_tp="1"),t.setPauses(0),t.setStarts(0),t.setBufferingTime(0),t.setBufferingTimestamp(-1),t.setPlaybackTime(0),t.setPlaybackTimestamp(-1)},setLabels:function(n,r){n!=null&&e.extend(f,n),t.setRegisters(f,r)},getLabels:function(){return f},setLabel:function(e,n){var r={};r[e]=n,t.setLabels(r,null)},getLabel:function(e){return f[e]},getClipId:function(){return(typeof a=="undefined"||a==null)&&t.setClipId("1"),a},setClipId:function(e){a=e},setRegisters:function(e,s){var u=e.ns_st_cn;u!=null&&(t.setClipId(u),delete e.ns_st_cn),u=e.ns_st_bt,u!=null&&(i=Number(u),delete e.ns_st_bt),l("ns_st_cl",e),l("ns_st_pn",e),l("ns_st_tp",e),l("ns_st_ub",e),l("ns_st_br",e);if(s==v.PLAYING||s==null)u=e.ns_st_sq,u!=null&&(r=Number(u),delete e.ns_st_sq);s!=v.BUFFERING&&(u=e.ns_st_pt,u!=null&&(o=Number(u),delete e.ns_st_pt));if(s==v.PAUSED||s==v.IDLE||s==null)u=e.ns_st_pc,u!=null&&(n=Number(u),delete e.ns_st_pc)},createLabels:function(i,s){var o=s||{};o.ns_st_cn=t.getClipId(),o.ns_st_bt=String(t.getBufferingTime());if(i==d.PLAY||i==null)o.ns_st_sq=String(r);if(i==d.PAUSE||i==d.END||i==d.KEEP_ALIVE||i==d.HEART_BEAT||i==null)o.ns_st_pt=String(t.getPlaybackTime()),o.ns_st_pc=String(n);return e.extend(o,t.getLabels()),o},incrementPauses:function(){n++},incrementStarts:function(){r++},getBufferingTime:function(){var e=i;return s>=0&&(e+=+(new Date)-s),e},setBufferingTime:function(e){i=e},getPlaybackTime:function(){var e=o;return u>=0&&(e+=+(new Date)-u),e},setPlaybackTime:function(e){o=e},getPlaybackTimestamp:function(){return u},setPlaybackTimestamp:function(e){u=e},getBufferingTimestamp:function(){return s},setBufferingTimestamp:function(e){s=e},getPauses:function(){return n},setPauses:function(e){n=e},getStarts:function(){return r},setStarts:function(e){r=e}}),f={},t.reset()};return t}(),b=function(){var t=function(){var t=this,n=null,r,i=0,s=0,o=0,u=0,a=0,f,l=0,c=!1;e.extend(this,{reset:function(n){n!=null&&n.length>0?e.filterMap(f,n):f={},t.setPlaylistId(+(new Date)+"_"+l),t.setBufferingTime(0),t.setPlaybackTime(0),t.setPauses(0),t.setStarts(0),t.setRebufferCount(0),c=!1},setLabels:function(n,r){n!=null&&e.extend(f,n),t.setRegisters(f,r)},getLabels:function(){return f},setLabel:function(e,n){var r={};r[e]=n,t.setLabels(r,null)},getLabel:function(e){return f[e]},getClip:function(){return n},getPlaylistId:function(){return r},setPlaylistId:function(e){r=e},setRegisters:function(e,t){var n=e.ns_st_sp;n!=null&&(i=Number(n),delete e.ns_st_sp),n=e.ns_st_bc,n!=null&&(o=Number(n),delete e.ns_st_bc),n=e.ns_st_bp,n!=null&&(u=Number(n),delete e.ns_st_bp),n=e.ns_st_id,n!=null&&(r=n,delete e.ns_st_id),t!=v.BUFFERING&&(n=e.ns_st_pa,n!=null&&(a=Number(n),delete e.ns_st_pa));if(t==v.PAUSED||t==v.IDLE||t==null)n=e.ns_st_pp,n!=null&&(s=Number(n),delete e.ns_st_pp)},createLabels:function(n,u){var a=u||{};a.ns_st_bp=String(t.getBufferingTime()),a.ns_st_sp=String(i),a.ns_st_id=String(r),o>0&&(a.ns_st_bc=String(o));if(n==d.PAUSE||n==d.END||n==d.KEEP_ALIVE||n==d.HEART_BEAT||n==null)a.ns_st_pa=String(t.getPlaybackTime()),a.ns_st_pp=String(s);if(n==d.PLAY||n==null)t.didFirstPlayOccurred()||(a.ns_st_pb="1",t.setFirstPlayOccurred(!0));return e.extend(a,t.getLabels()),a},incrementStarts:function(){i++},incrementPauses:function(){s++,n.incrementPauses()},setPlaylistCounter:function(e){l=e},incrementPlaylistCounter:function(){l++},addPlaybackTime:function(e){if(n.getPlaybackTimestamp()>=0){var r=e-n.getPlaybackTimestamp();n.setPlaybackTimestamp(-1),n.setPlaybackTime(n.getPlaybackTime()+r),t.setPlaybackTime(t.getPlaybackTime()+r)}},addBufferingTime:function(e){if(n.getBufferingTimestamp()>=0){var r=e-n.getBufferingTimestamp();n.setBufferingTimestamp(-1),n.setBufferingTime(n.getBufferingTime()+r),t.setBufferingTime(t.getBufferingTime()+r)}},getBufferingTime:function(){var e=u;return n.getBufferingTimestamp()>=0&&(e+=+(new Date)-n.getBufferingTimestamp()),e},setBufferingTime:function(e){u=e},getPlaybackTime:function(){var e=a;return n.getPlaybackTimestamp()>=0&&(e+=+(new Date)-n.getPlaybackTimestamp()),e},setPlaybackTime:function(e){a=e},getStarts:function(){return i},setStarts:function(e){i=e},getPauses:function(){return s},setPauses:function(e){s=e},getRebufferCount:function(){return o},incrementRebufferCount:function(){o++},setRebufferCount:function(e){o=e},didFirstPlayOccurred:function(){return c},setFirstPlayOccurred:function(e){c=e}}),n=new y,f={},t.reset()};return t}(),w=function(){var t=function(t,n){function q(e){var t=0;if(k!=null)for(var n=0;n<k.length;n++){var r=k[n],i=r.playingtime;if(!i||e<i){t=r.interval;break}}return t}function R(){X();var e=q(w.getClip().getPlaybackTime());if(e>0){var t=O>0?O:e;C=setTimeout(W,t)}O=0}function U(){X();var e=q(w.getClip().getPlaybackTime());O=e-w.getClip().getPlaybackTime()%e,C!=null&&X()}function z(){O=0,_=0,M=0}function W(){M++;var e=mt(d.HEART_BEAT,null);rt(e),O=0,R()}function X(){C!=null&&(clearTimeout(C),C=null)}function V(){J(),N=setTimeout($,L)}function $(){var e=mt(d.KEEP_ALIVE,null);rt(e),y++,V()}function J(){N!=null&&(clearTimeout(N),N=null)}function K(){G(),r.isPauseOnBufferingEnabled()&&at(v.PAUSED)&&(x=setTimeout(Q,A))}function Q(){if(P==v.PLAYING){w.incrementRebufferCount(),w.incrementPauses();var e=mt(d.PAUSE,null);rt(e),y++,P=v.PAUSED}}function G(){x!=null&&(clearTimeout(x),x=null)}function Y(e){return e==v.PLAYING||e==v.PAUSED}function Z(){l&&(clearTimeout(l),l=null)}function et(e){return e==d.PLAY?v.PLAYING:e==d.PAUSE?v.PAUSED:e==d.BUFFER?v.BUFFERING:e==d.END?v.IDLE:null}function tt(t,n,r){Z();if(r)l=setTimeout(function(e,t){return function(){tt(e,t)}}(t,n),r);else if(ct(t)){var i=pt(),s=a,o=lt(n),u=s>=0?o-s:0;ot(pt(),n),ut(t,n),dt(pt()),ht(t);for(var f=0,c=F.length;f<c;f++)F[f](i,t,n,u);nt(n),w.setRegisters(n,t),w.getClip().setRegisters(n,t);var h=mt(v.toEventType(t),n);e.extend(h,n),at(m)&&(rt(h),P=m,y++)}}function nt(e){var t=e.ns_st_mp;t!=null&&(H=t,delete e.ns_st_mp),t=e.ns_st_mv,t!=null&&(B=t,delete e.ns_st_mv),t=e.ns_st_ec,t!=null&&(y=Number(t),delete e.ns_st_ec)}function rt(e,t){t===undefined&&(t=!0),t&&st(e);var n=r.getPixelURL();if(E){if(!it()){var i=I.am,s=I.et,o=i.newApplicationMeasurement(E,s.HIDDEN,e,n);E.getQueue().offer(o)}}else n&&u.httpGet(p(n,e))}function it(){var e=E.getAppContext(),t=E.getSalt(),n=E.getPixelURL();return e==null||t==null||t.length==0||n==null||n.length==0}function st(t){j=mt(null),e.extend(j,t)}function ot(t,n){var r=lt(n);if(t==v.PLAYING)w.addPlaybackTime(r),U(),J();else if(t==v.BUFFERING)w.addBufferingTime(r),G();else if(t==v.IDLE){var i=e.getKeys(w.getClip().getLabels());w.getClip().reset(i)}}function ut(e,t){var n=lt(t),r=ft(t);f=r,e==v.PLAYING?(R(),V(),w.getClip().setPlaybackTimestamp(n),at(e)&&(w.getClip().incrementStarts(),w.getStarts()<1&&w.setStarts(1))):e==v.PAUSED?at(e)&&w.incrementPauses():e==v.BUFFERING?(w.getClip().setBufferingTimestamp(n),T&&K()):e==v.IDLE&&z()}function at(e){return e!=v.PAUSED&&e!=v.IDLE||P!=v.IDLE&&P!=null?e!=v.BUFFERING&&P!=e:!1}function ft(t){var n=-1;return t.hasOwnProperty("ns_st_po")&&(n=e.getInteger(t.ns_st_po)),n}function lt(e){var t=-1;return e.hasOwnProperty("ns_ts")&&(t=Number(e.ns_ts)),t}function ct(e){return e!=null&&pt()!=e}function ht(e){m=e,a=+(new Date)}function pt(){return m}function dt(e){c=e}function vt(){return c}function mt(){var t,n;arguments.length==1?(t=v.toEventType(m),n=arguments[0]):(t=arguments[0],n=arguments[1]);var i={};if(typeof document!="undefined"){var s=document;i.c7=s.URL,i.c8=s.title,i.c9=s.referrer}return n!=null&&e.extend(i,n),i.hasOwnProperty("ns_ts")||(i.ns_ts=String(+(new Date))),t!=null&&!i.hasOwnProperty("ns_st_ev")&&(i.ns_st_ev=d.toString(t)),r.isPersistentLabelsShared()&&E&&e.extend(i,E.getLabels()),e.extend(i,r.getLabels()),gt(t,i),w.createLabels(t,i),w.getClip().createLabels(t,i),i.hasOwnProperty("ns_st_mp")||(i.ns_st_mp=H),i.hasOwnProperty("ns_st_mv")||(i.ns_st_mv=B),i.hasOwnProperty("ns_st_ub")||(i.ns_st_ub="0"),i.hasOwnProperty("ns_st_br")||(i.ns_st_br="0"),i.hasOwnProperty("ns_st_pn")||(i.ns_st_pn="1"),i.hasOwnProperty("ns_st_tp")||(i.ns_st_tp="1"),i.hasOwnProperty("ns_st_it")||(i.ns_st_it="c"),i.ns_st_sv=g.STREAMSENSE_VERSION,i.ns_type="hidden",i}function gt(t,n){var r=n||{};r.ns_st_ec=String(y);if(!r.hasOwnProperty("ns_st_po")){var i=f,s=lt(r);if(t==d.PLAY||t==d.KEEP_ALIVE||t==d.HEART_BEAT||t==null&&m==v.PLAYING)i+=s-w.getClip().getPlaybackTimestamp();r.ns_st_po=e.getInteger(i)}return t==d.HEART_BEAT&&(r.ns_st_hc=String(M)),r}function yt(e){var t=lt(e);t<0&&(e.ns_ts=String(+(new Date)))}function bt(e,t,n){t=t||{},t.ns_st_ad=1,e>=d.AD_PLAY&&e<=d.AD_CLICK&&r.notify(e,t,n)}function wt(e,t){r.notify(d.CUSTOM,e,t)}var r=this,i=500,s,o=null,a=0,f=0,l,c,m,y=0,w=null,E,S=!0,x,T=!0,N,C,k=g.DEFAULT_HEARTBEAT_INTERVAL,L=g.DEFAULT_KEEP_ALIVE_INTERVAL,A=g.DEFAULT_PAUSED_ON_BUFFERING_INTERVAL,O=0,M=0,_=0,D=!1,P,H,B,j,F,I={};u.autoSelect(),e.extend(this,{reset:function(t){w.reset(t),w.setPlaylistCounter(0),w.setPlaylistId(+(new Date)+"_1"),w.getClip().reset(t),t!=null&&!t.isEmpty()?e.filterMap(s,t):s={},y=1,M=0,U(),z(),J(),G(),Z(),m=v.IDLE,c=null,a=-1,P=null,H=g.DEFAULT_PLAYERNAME,B=g.STREAMSENSE_VERSION,j=null},setPauseOnBufferingInterval:function(e){A=e},getPauseOnBufferingInterval:function(){return A},setKeepAliveInterval:function(e){L=e},getKeepAliveInterval:function(){return L},setHeartbeatIntervals:function(e){k=e},notify:function(){var t,n,s,o;n=arguments[0],arguments.length==3?(s=arguments[1],o=arguments[2]):(s={},o=arguments[1]),t=et(n);var u=e.extend({},s);yt(u),u.hasOwnProperty("ns_st_po")||(u.ns_st_po=e.getInteger(o).toString());if(n==d.PLAY||n==d.PAUSE||n==d.BUFFER||n==d.END)r.isPausePlaySwitchDelayEnabled()&&Y(m)&&Y(t)&&(m!=v.PLAYING||t!=v.PAUSED||!!l)?tt(t,u,i):tt(t,u);else{var a=mt(n,u);e.extend(a,u),rt(a,!1),y++}},getLabels:function(){return s},getState:function(){return m},setLabels:function(t){t!=null&&(s==null?s=t:e.extend(s,t))},getLabel:function(e){return s[e]},setLabel:function(e,t){t==null?delete s[e]:s[e]=t},setPixelURL:function(e){if(e==null||e.length==0)return null;var t=decodeURIComponent||unescape,n=e.indexOf("?");if(n>=0){if(n<e.length-1){var i=e.substring(n+1).split("&");for(var s=0,u=i.length;s<u;s++){var a=i[s],f=a.split("=");f.length==2?r.setLabel(f[0],t(f[1])):f.length==1&&r.setLabel(g.PAGE_NAME_LABEL,t(f[0]))}e=e.substring(0,n+1)}}else e+="?";return o=e,o},getPixelURL:function(){return o?o:typeof ns_p!="undefined"&&typeof ns_p.src=="string"?o=ns_p.src.replace(/&amp;/,"&").replace(/&ns__t=\d+/,""):typeof ns_pixelUrl=="string"?o=ns_pixelUrl.replace(/&amp;/,"&").replace(/&ns__t=\d+/,""):null},isPersistentLabelsShared:function(){return S},setPersistentLabelsShared:function(e){S=e},isPauseOnBufferingEnabled:function(){return T},setPauseOnBufferingEnabled:function(e){T=e},isPausePlaySwitchDelayEnabled:function(){return D},setPausePlaySwitchDelayEnabled:function(e){D=e},setPausePlaySwitchDelay:function(e){e&&e>0&&(i=e)},getPausePlaySwitchDelay:function(){return i},setClip:function(e,t){var n=!1;return m==v.IDLE&&(w.getClip().reset(),w.getClip().setLabels(e,null),t&&w.incrementStarts(),n=!0),n},setPlaylist:function(e){var t=!1;return m==v.IDLE&&(w.incrementPlaylistCounter(),w.reset(),w.getClip().reset(),w.setLabels(e,null),t=!0),t},importState:function(t){reset();var n=e.extend({},t);w.setRegisters(n,null),w.getClip().setRegisters(n,null),nt(n),y++},exportState:function(){return j},getVersion:function(){return g.STREAMSENSE_VERSION},addListener:function(e){F.push(e)},removeListener:function(t){F.splice(e.indexOf(t,F),1)},getClip:function(){return w.getClip()},getPlaylist:function(){return w}}),e.extend(this,{adNotify:bt,customNotify:wt,viewNotify:function(e,t){e=e||r.getPixelURL(),e&&h(e,t)}}),ns_.comScore&&(I=ns_.comScore.exports,E=I.c()),s={},y=1,m=v.IDLE,w=new b,x=null,T=!0,C=null,M=0,z(),N=null,l=null,D=!1,P=null,f=0,F=[],r.reset(),t&&r.setLabels(t),n&&r.setPixelURL(n)};return function(t){function s(e,t){return n[i]||u(e,t)}function o(){i=-1;for(var e=0;e<=r;e++)if(n.hasOwnProperty(e)){i=e;break}return ns_.StreamSense.activeIndex=i,i}function u(e,t){return e=e||null,t=t||null,e&&typeof e=="object"&&(t=e,e=null),n[++r]=new ns_.StreamSense(t,e),o(),n[r]}function a(){var e=!1,t=i;if(typeof arguments[0]=="number"&&isFinite(arguments[0]))t=arguments[0];else if(arguments[0]instanceof ns_.StreamSense)for(var r in n)if(n[r]===arguments[0]){t=r;break}return n.hasOwnProperty(t)&&(e=n[t],delete n[t],e.reset(),o()),e}function f(e){return e=e||{},s().setPlaylist(e),s().getPlaylist()}function l(e,t,n){return e=e||{},typeof t=="number"&&(e.ns_st_cn=t),s().setClip(e,n),s().getClip()}function c(e,t,n){return typeof e=="undefined"?!1:(n=n||null,t=t||{},s().notify(e,t,n))}function h(e){typeof e!="undefined"&&s().setLabels(e)}function p(){return s().getLabels()}function d(e){typeof e!="undefined"&&s().getPlaylist().setLabels(e)}function v(){return s().getPlaylist().getLabels()}function m(e){typeof e!="undefined"&&s().getClip().setLabels(e)}function g(){return s().getClip().getLabels()}function y(e){return s().reset(e||{})}function b(e){return s().getPlaylist().reset(e||{})}function w(e){return s().getClip().reset(e||{})}function E(e){return e=e||{},s().viewNotify(null,e)}function S(e,t){return arguments.length>2&&(e=arguments[1],t=arguments[2]),e=e||{},typeof t=="number"&&(e.ns_st_po=t),s().customNotify(e,t)}function x(){return s().exportState()}function T(e){s().importState(e)}var n={},r=-1,i=-1;e.extend(t,{activeIndex:i,newInstance:u,"new":u,destroyInstance:a,destroy:a,newPlaylist:f,newClip:l,notify:c,setLabels:h,getLabels:p,setPlaylistLabels:d,getPlaylistLabels:v,setClipLabels:m,getClipLabels:g,resetInstance:y,resetPlaylist:b,resetClip:w,viewEvent:E,customEvent:S,exportState:x,importState:T})}(t),t}();return w.AdEvents=m,w.PlayerEvents=d,ns_.StreamingTag=ns_.StreamingTag||function(){var t=function(){var t=function(t){function l(){if(!ns_.comScore&&e.exists(t)){f=e.isTrue(t.debug);if(e.exists(t.customerC2)){var n=t.secure?"https://sb":"http"+(document.location.href.charAt(4)=="s"?"s://sb":"://b");a.setPixelURL(n+".scorecardresearch.com/p?c1=2"),a.setLabel("c2",t.customerC2)}else a.setPixelURL(""),f&&console.log("Warning: customerC2 is not provided (or incorrect) in the StreamingTag configuration.")}a.setLabel("ns_st_it","r")}function c(t){return e.exists(t)||(t={}),e.exists(t.ns_st_ci)||(t.ns_st_ci="0"),e.exists(t.c3)||(t.c3="*null"),e.exists(t.c4)||(t.c4="*null"),e.exists(t.c6)||(t.c6="*null"),t}function h(e){return i>0&&e>=i?s+=e-i:s=0,s}function p(e){a.getState()!=v.IDLE&&a.getState()!=v.PAUSED?a.notify(d.END,h(e)):a.getState()==v.PAUSED&&a.notify(d.END,s)}function m(e){return g("ns_st_ci",o,e)&&g("c3",o,e)&&g("c4",o,e)&&g("c6",o,e)}function g(t,n,r){if(e.exists(t)&&e.exists(n)&&e.exists(r)){var i=n[t],s=r[t];return e.exists(i)&&e.exists(s)&&i===s}return!1}function y(t,n){p(t),r++;var u={ns_st_cn:r,ns_st_pn:"1",ns_st_tp:"0"};e.extend(u,n),a.setClip(u),o=n,i=t,s=0,a.notify(d.PLAY,s)}function b(t){var n=+(new Date);p(n),r++,t=c(t);var o={ns_st_cn:r,ns_st_pn:"1",ns_st_tp:"1",ns_st_ad:"1"};e.extend(o,t),a.setClip(o),s=0,a.notify(d.PLAY,s),i=n,u=!1}function E(e){var t=+(new Date);e=c(e),u?m(e)?(a.getClip().setLabels(e),a.getState()!=v.PLAYING&&(i=t,a.notify(d.PLAY,s))):y(t,e):y(t,e),u=!0}var n=this,r=0,i=0,s=0,o=null,u=!1,a=new w,f=!1;e.extend(this,{playAdvertisement:function(){f&&console&&console.warn("Calling deprecated function 'playAdvertisement'. Please call 'playVideoAdvertisement' or 'playAudioAdvertisement' functions instead.");var e={ns_st_ct:"va"};b(e)},playVideoAdvertisement:function(t){var n={ns_st_ct:"va"};t&&e.extend(n,t),b(n)},playAudioAdvertisement:function(t){var n={ns_st_ct:"aa"};t&&e.extend(n,t),b(n)},playContentPart:function(t){f&&console&&console.warn("Calling deprecated function 'playContentPart'. Please call 'playVideoContentPart' or 'playAudioContentPart' functions instead.");var n={ns_st_ct:"vc"};t&&e.extend(n,t),E(n)},playVideoContentPart:function(t){var n={ns_st_ct:"vc"};t&&e.extend(n,t),E(n)},playAudioContentPart:function(t){var n={ns_st_ct:"ac"};t&&e.extend(n,t),E(n)},stop:function(){var e=+(new Date);a.notify(d.PAUSE,h(e))}}),l()};return function(e){}(t),t}();return t}(),w}();
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(jQuery, $) {(function (window) {
	
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
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1), __webpack_require__(1)))

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {var EndCard = function(player, options) {
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
	  window.$.get(this.settings.URL, this.endcardFetched.bind(this));
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
	
	EndCard.prototype.endcardFetched = function(endCardMarkup) {
	  if (this.$overlay) {
	    return;
	  }
	
	  if (this.player.posterImage) {
	    this.player.posterImage.show();
	  }
	
	  this.$overlay = $(endCardMarkup);
	
	  this.setupReplay();
	
	  // Don't do countdown if embed or if it is the rail player
	  if (this.isRailPlayer() || this.isEmbedPlayer()) {
	    this.settings.allowCountdown = false;
	  }
	
	  if (this.settings.allowCountdown) {
	    this.setupCountdown();
	  } else {
	    this.$overlay.find('.next-video-container a').attr('target','_blank');
	  }
	
	  this.displayShareTools();
	
	  this.player.el().appendChild(this.$overlay[0]);
	
	  $('.sharetool').appendTo('.ec-social').show();
	
	  this.player.controlBar.hide();
	  window.picturefill(document.querySelectorAll('.endcard [data-type="image"]'));
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
	
	window.videojs.plugin('endcard', initEndCard);
	
	module.exports = EndCard;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 16 */
/***/ function(module, exports) {

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
	
	window.videojs.plugin('videoanalytics', initVideoAnalytics);
	
	module.exports = VideoAnalytics;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {var VideoMetrix = function(player, options) {
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
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {var _sharetools = __webpack_require__(19);
	
	var ShareTools = function(player, options) {
	  this.player = player;
	  var defaults = {};
	  this.settings = $.extend(defaults, options);
	  this.shareTools = new _sharetools();
	};
	
	ShareTools.prototype.prepareOverlay = function() {
	  var $overlay = $('<div>');
	  $overlay.addClass('sharetool share-widget');
	
	  $overlay.attr({
	    'data-share-url': window.shareUrl,
	    'data-share-description': window.share_description,
	    'data-share-title': window.share_title,
	    'data-share-redirect-url': 'http://www.onionstudios.com/fb-close'
	  });
	
	  return $overlay;
	};
	
	ShareTools.prototype.setupTwitter = function($shareToolDiv) {
	  if (!this.settings.twitter) {
	    return;
	  }
	
	  this.shareTools.addNetwork({
	    name: 'twitter',
	    url: function (params, element) {
	      var text = params.title;
	      text = text.substr(0, 139);
	      var queryParams = {
	        text: text,
	        url: params.url,
	        via: window.twitter_handle
	      };
	      var serializedParams = decodeURIComponent($.param(queryParams));
	      return 'https://www.twitter.com/share?' + serializedParams;
	    }
	  });
	
	  var $twitter = $('<a>');
	  $twitter.attr('title', 'Share via Twitter');
	  $twitter.data('trackAction', 'Share');
	  $twitter.data('trackLabel', 'Twitter');
	  $twitter.addClass('share-twitter button twitter');
	  $shareToolDiv.append($twitter);
	};
	
	ShareTools.prototype.setupFacebook = function($shareToolDiv) {
	  if (!this.settings.facebook) {
	    return;
	  }
	
	  this.shareTools.addNetwork({
	    name: 'facebook',
	    url: function (params, element) {
	      var queryParams = {
	        app_id: '632832353489701',
	        display: 'popup',
	        link: params.url,
	        name: params.title,
	        description: params.description,
	        image: params.image,
	        redirect_uri: params.redirectUrl
	      };
	      var serializedParams = decodeURIComponent($.param(queryParams));
	      return 'https://www.facebook.com/dialog/feed?' + serializedParams;
	    }
	  });
	
	  var $facebook = $('<a>');
	  $facebook.attr('title', 'Share via Facebook');
	  $facebook.data('trackAction', 'Share');
	  $facebook.data('trackLabel', 'Facebook');
	  $facebook.addClass('share-facebook button fb');
	  $shareToolDiv.append($facebook);
	};
	
	ShareTools.prototype.setupEmbedCode = function($shareToolDiv) {
	  if (!this.settings.embed) {
	    return;
	  }
	
	  var $embed = $('<a>');
	  $embed.addClass('button embed');
	  $embed.data('trackAction', 'Share');
	  $embed.data('trackLabel', 'Embed');
	  $shareToolDiv.append($embed);
	};
	
	ShareTools.prototype.setup = function() {
	  this.open = true;
	
	  var $overlay = this.prepareOverlay();
	  var $shareToolDiv = $('<div class="share-buttons"></div>');
	
	  this.setupTwitter($shareToolDiv);
	  this.setupFacebook($shareToolDiv);
	  this.setupEmbedCode($shareToolDiv);
	
	  $overlay.append($shareToolDiv);
	  this.shareTools.setupElements($overlay);
	
	  $(this.player.el()).append($overlay);
	
	  $('.embed').on('click', function() {
	    $('.embed-div').toggleClass('embed-active');
	  });
	};
	
	var initShareTools = function(options) {
	  var player = this;
	  player.shareTools = new ShareTools(player, options);
	};
	
	videojs.plugin('sharetools', initShareTools);
	
	module.exports = ShareTools;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(jQuery, $) {// TODO - This needs to be merged with the adjacent sharetools.js...
	var _shareTools = function () {
	  this.networks = {};
	  this.storageKeyPrefix = 'shareTools-';
	};
	
	_shareTools.prototype.addNetwork = function (options) {
	  this.networks[options.name] = options;
	  return this;
	};
	
	_shareTools.prototype.getUrlFor = function (networkName, params) {
	  var network = this.networks[networkName];
	  return network.url(params);
	};
	
	_shareTools.prototype.shouldShowPostShareDialog = function (networkName) {
	  if (localStorage.getItem(this.storageKeyPrefix + 'dont-bother') != null) {
	    return false;
	  }
	  if (isMobile.any) {  // dont do it on small screens
	    return false;
	  }
	  return this.networks[networkName].postShareDialog || false;
	};
	
	_shareTools.prototype.flagDontShowPostShareDialog = function () {
	  localStorage.setItem(this.storageKeyPrefix + 'dont-bother', 'yup');
	};
	
	_shareTools.prototype.setupElements = function (selector) {
	
	  var $shareToolElements = selector instanceof jQuery ? selector : $(selector);
	
	  // where all the dom-related stuff gets wired up
	  var self = this;
	  $shareToolElements.each(function (i, element) {
	    element = $(element);
	    for (var networkName in self.networks) {
	      if (!self.networks.hasOwnProperty(networkName)) {
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
	          var url = self.getUrlFor(name, params);
	          var link = $(this);
	
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
	          event.preventDefault();
	        }
	      }(networkName, element));
	    }
	  });
	};
	
	module.exports = _shareTools;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1), __webpack_require__(1)))

/***/ }
/******/ ]);
//# sourceMappingURL=videohub-player.js.map