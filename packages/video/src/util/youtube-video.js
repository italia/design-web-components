/* eslint-disable class-methods-use-this */
/* eslint-disable prefer-destructuring */
/* eslint-disable dot-notation */
/**
 * --------------------------------------------------------------------------
 * Bootstrap Italia (https://italia.github.io/bootstrap-italia/)
 * Authors: https://github.com/italia/bootstrap-italia/blob/main/AUTHORS
 * Licensed under BSD-3-Clause license (https://github.com/italia/bootstrap-italia/blob/main/LICENSE)
 * This file is a modified version of Benoit Tremblay's VideoJS YouTube plugin
 * Main repository: https://github.com/videojs/videojs-youtube
 * Copyright (c) 2014-2015 Benoit Tremblay <trembl.ben@gmail.com>
 * Licensed under MIT license (https://github.com/videojs/videojs-youtube?tab=readme-ov-file#license)
 * --------------------------------------------------------------------------
 */

/* global YT */
const initYoutubePlugin = (videojs) => {
  const _isOnMobile = videojs.browser.IS_IOS || videojs.browser.IS_NATIVE_ANDROID;
  const Tech = videojs.getTech('Tech');

  class Youtube extends Tech {
    constructor(options, ready) {
      super(options, ready);

      this.setPoster(options.poster);
      this.setSrc(this.options_.source, true);

      // Set the vjs-youtube class to the player
      // Parent is not set yet so we have to wait a tick
      this.setTimeout(() => {
        if (this.el_) {
          this.el_.parentNode.className += ' vjs-youtube';

          if (_isOnMobile) {
            this.el_.parentNode.className += ' vjs-youtube-mobile';
          }

          if (Youtube.isApiReady) {
            this.initYTPlayer();
          } else {
            Youtube.apiReadyQueue.push(this);
          }
        }
      });
    }

    dispose() {
      if (this.ytPlayer) {
        // Dispose of the YouTube Player
        if (this.ytPlayer.stopVideo) {
          this.ytPlayer.stopVideo();
        }
        if (this.ytPlayer.destroy) {
          this.ytPlayer.destroy();
        }
      } else {
        // YouTube API hasn't finished loading or the player is already disposed
        const index = Youtube.apiReadyQueue.indexOf(this);
        if (index !== -1) {
          Youtube.apiReadyQueue.splice(index, 1);
        }
      }
      this.ytPlayer = null;

      this.el_.parentNode.className = this.el_.parentNode.className
        .replace(' vjs-youtube', '')
        .replace(' vjs-youtube-mobile', '');
      this.el_.parentNode.removeChild(this.el_);

      // Needs to be called after the YouTube player is destroyed, otherwise there will be a null reference exception
      Tech.prototype.dispose.call(this);
    }

    createEl() {
      if (typeof document === 'undefined') {
        return;
      }
      const div = document.createElement('div');
      div.setAttribute('id', this.options_.techId);
      div.setAttribute('style', 'width:100%;height:100%;top:0;left:0;position:absolute');
      div.setAttribute('class', 'vjs-tech');
      this.iframewrapper_ = div;

      const divWrapper = document.createElement('div');
      divWrapper.appendChild(div);

      if (!_isOnMobile && !this.options_.ytControls) {
        const divBlocker = document.createElement('div');
        divBlocker.setAttribute('class', 'vjs-iframe-blocker');
        divBlocker.setAttribute('style', 'position:absolute;top:0;left:0;width:100%;height:100%');

        // In case the blocker is still there and we want to pause
        divBlocker.onclick = () => {
          this.pause();
        };

        divWrapper.appendChild(divBlocker);
      }

      // eslint-disable-next-line consistent-return
      return divWrapper;
    }

    initYTPlayer() {
      const playerVars = {
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        loop: this.options_.loop ? 1 : 0,
      };

      // Let the user set any YouTube parameter
      // https://developers.google.com/youtube/player_parameters?playerVersion=HTML5#Parameters
      // To use YouTube controls, you must use ytControls instead
      // To use the loop or autoplay, use the video.js settings

      if (typeof this.options_.autohide !== 'undefined') {
        playerVars.autohide = this.options_.autohide;
      }

      if (typeof this.options_['cc_load_policy'] !== 'undefined') {
        playerVars['cc_load_policy'] = this.options_['cc_load_policy'];
      }

      if (typeof this.options_.ytControls !== 'undefined') {
        playerVars.controls = this.options_.ytControls;
      }

      if (typeof this.options_.disablekb !== 'undefined') {
        playerVars.disablekb = this.options_.disablekb;
      }

      if (typeof this.options_.color !== 'undefined') {
        playerVars.color = this.options_.color;
      }

      if (!playerVars.controls) {
        // Let video.js handle the fullscreen unless it is the YouTube native controls
        playerVars.fs = 0;
      } else if (typeof this.options_.fs !== 'undefined') {
        playerVars.fs = this.options_.fs;
      }

      if (this.options_.source.src.indexOf('end=') !== -1) {
        const srcEndTime = this.options_.source.src.match(/end=([0-9]*)/);
        this.options_.end = parseInt(srcEndTime[1], 10);
      }

      if (typeof this.options_.end !== 'undefined') {
        playerVars.end = this.options_.end;
      }

      if (typeof this.options_.hl !== 'undefined') {
        playerVars.hl = this.options_.hl;
      } else if (typeof this.options_.language !== 'undefined') {
        // Set the YouTube player on the same language than video.js
        playerVars.hl = this.options_.language.substr(0, 2);
      }

      if (typeof this.options_['iv_load_policy'] !== 'undefined') {
        playerVars['iv_load_policy'] = this.options_['iv_load_policy'];
      }

      if (typeof this.options_.list !== 'undefined') {
        playerVars.list = this.options_.list;
      } else if (this.url && typeof this.url.listId !== 'undefined') {
        playerVars.list = this.url.listId;
      }

      if (typeof this.options_.listType !== 'undefined') {
        playerVars.listType = this.options_.listType;
      }

      if (typeof this.options_.modestbranding !== 'undefined') {
        playerVars.modestbranding = this.options_.modestbranding;
      }

      if (typeof this.options_.playlist !== 'undefined') {
        playerVars.playlist = this.options_.playlist;
      }

      if (typeof this.options_.playsinline !== 'undefined') {
        playerVars.playsinline = this.options_.playsinline;
      }

      if (typeof this.options_.rel !== 'undefined') {
        playerVars.rel = this.options_.rel;
      }

      if (typeof this.options_.showinfo !== 'undefined') {
        playerVars.showinfo = this.options_.showinfo;
      }

      if (this.options_.source.src.indexOf('start=') !== -1) {
        const srcStartTime = this.options_.source.src.match(/start=([0-9]*)/);
        this.options_.start = parseInt(srcStartTime[1], 10);
      }

      if (typeof this.options_.start !== 'undefined') {
        playerVars.start = this.options_.start;
      }

      if (typeof this.options_.theme !== 'undefined') {
        playerVars.theme = this.options_.theme;
      }

      // Allow undocumented options to be passed along via customVars
      if (typeof this.options_.customVars !== 'undefined') {
        const customVars = this.options_.customVars;
        Object.keys(customVars).forEach((key) => {
          playerVars[key] = customVars[key];
        });
      }

      this.activeVideoId = this.url ? this.url.videoId : null;
      this.activeList = playerVars.list;

      const playerConfig = {
        videoId: this.activeVideoId,
        playerVars,
        events: {
          onReady: this.onPlayerReady.bind(this),
          onPlaybackQualityChange: this.onPlayerPlaybackQualityChange.bind(this),
          onPlaybackRateChange: this.onPlayerPlaybackRateChange.bind(this),
          onStateChange: this.onPlayerStateChange.bind(this),
          onVolumeChange: this.onPlayerVolumeChange.bind(this),
          onError: this.onPlayerError.bind(this),
        },
      };

      if (typeof this.options_.enablePrivacyEnhancedMode !== 'undefined' && this.options_.enablePrivacyEnhancedMode) {
        playerConfig.host = 'https://www.youtube-nocookie.com';
      }

      this.ytPlayer = new YT.Player(this.iframewrapper_, playerConfig);
    }

    onPlayerReady() {
      if (this.options_.muted) {
        this.ytPlayer.mute();
      }

      const playbackRates = this.ytPlayer.getAvailablePlaybackRates();
      if (playbackRates.length > 1) {
        this.featuresPlaybackRate = true;
      }

      this.playerReady_ = true;
      this.triggerReady();

      if (this.playOnReady) {
        this.play();
      } else if (this.cueOnReady) {
        this.cueVideoById_(this.url.videoId);
        this.activeVideoId = this.url.videoId;
      }
    }

    onPlayerPlaybackQualityChange() {}

    onPlayerPlaybackRateChange() {
      this.trigger('ratechange');
    }

    onPlayerStateChange(e) {
      const state = e.data;

      if (state === this.lastState || this.errorNumber) {
        return;
      }

      this.lastState = state;

      switch (state) {
        case -1:
          this.trigger('loadstart');
          this.trigger('loadedmetadata');
          this.trigger('durationchange');
          this.trigger('ratechange');
          break;

        case YT.PlayerState.ENDED:
          this.trigger('ended');
          break;

        case YT.PlayerState.PLAYING:
          this.trigger('timeupdate');
          this.trigger('durationchange');
          this.trigger('playing');
          this.trigger('play');

          if (this.isSeeking) {
            this.onSeeked();
          }
          break;

        case YT.PlayerState.PAUSED:
          this.trigger('canplay');
          if (this.isSeeking) {
            this.onSeeked();
          } else {
            this.trigger('pause');
          }
          break;

        case YT.PlayerState.BUFFERING:
          this.player_.trigger('timeupdate');
          this.player_.trigger('waiting');
          break;

        default:
          break;
      }
    }

    onPlayerVolumeChange() {
      this.trigger('volumechange');
    }

    onPlayerError(e) {
      console.log('---onPlayerError()---');
      this.errorNumber = e.data;
      this.trigger('pause');
      this.trigger('error');
    }

    error() {
      const code = 1000 + this.errorNumber; // as smaller codes are reserved

      switch (this.errorNumber) {
        case 5:
          return { code, message: 'Error while trying to play the video' };

        case 2:
        case 100:
          return { code, message: 'Unable to find the video' };

        case 101:
        case 150:
          return {
            code,
            message: 'Playback on other Websites has been disabled by the video owner.',
          };
        default:
          break;
      }

      return { code, message: `YouTube unknown error (${this.errorNumber})` };
    }

    loadVideoById_(id) {
      const options = {
        videoId: id,
      };
      if (this.options_.start) {
        options.startSeconds = this.options_.start;
      }
      if (this.options_.end) {
        options.endSeconds = this.options_.end;
      }
      this.ytPlayer.loadVideoById(options);
    }

    cueVideoById_(id) {
      const options = {
        videoId: id,
      };
      if (this.options_.start) {
        options.startSeconds = this.options_.start;
      }
      if (this.options_.end) {
        options.endSeconds = this.options_.end;
      }
      this.ytPlayer.cueVideoById(options);
    }

    src(src) {
      if (src) {
        this.setSrc({ src });
      }

      return this.source;
    }

    poster() {
      // You can't start programmaticlly a video with a mobile
      // through the iframe so we hide the poster and the play button (with CSS)
      if (_isOnMobile) {
        return null;
      }

      return this.poster_;
    }

    setPoster(poster) {
      this.poster_ = poster;
    }

    setSrc(source) {
      if (!source || !source.src) {
        return;
      }

      delete this.errorNumber;
      this.source = source;
      this.url = Youtube.parseUrl(source.src);

      if (!this.options_.poster) {
        if (this.url.videoId) {
          // Set the low resolution first
          this.poster_ = `https://img.youtube.com/vi/${this.url.videoId}/0.jpg`;
          this.trigger('posterchange');

          // Check if their is a high res
          this.checkHighResPoster();
        }
      }

      if (this.options_.autoplay && !_isOnMobile) {
        if (this.isReady_) {
          this.play();
        } else {
          this.playOnReady = true;
        }
      } else if (this.activeVideoId !== this.url.videoId) {
        if (this.isReady_) {
          this.cueVideoById_(this.url.videoId);
          this.activeVideoId = this.url.videoId;
        } else {
          this.cueOnReady = true;
        }
      }
    }

    autoplay() {
      return this.options_.autoplay;
    }

    setAutoplay(val) {
      this.options_.autoplay = val;
    }

    loop() {
      return this.options_.loop;
    }

    setLoop(val) {
      this.options_.loop = val;
    }

    play() {
      if (!this.url || !this.url.videoId) {
        return;
      }

      this.wasPausedBeforeSeek = false;

      if (this.isReady_) {
        if (this.url.listId) {
          if (this.activeList === this.url.listId) {
            this.ytPlayer.playVideo();
          } else {
            this.ytPlayer.loadPlaylist(this.url.listId);
            this.activeList = this.url.listId;
          }
        }

        if (this.activeVideoId === this.url.videoId) {
          this.ytPlayer.playVideo();
        } else {
          this.loadVideoById_(this.url.videoId);
          this.activeVideoId = this.url.videoId;
        }
      } else {
        this.trigger('waiting');
        this.playOnReady = true;
      }
    }

    pause() {
      if (this.ytPlayer) {
        this.ytPlayer.pauseVideo();
      }
    }

    paused() {
      return this.ytPlayer
        ? this.lastState !== YT.PlayerState.PLAYING && this.lastState !== YT.PlayerState.BUFFERING
        : true;
    }

    currentTime() {
      return this.ytPlayer ? this.ytPlayer.getCurrentTime() : 0;
    }

    setCurrentTime(seconds) {
      if (this.lastState === YT.PlayerState.PAUSED) {
        this.timeBeforeSeek = this.currentTime();
      }

      if (!this.isSeeking) {
        this.wasPausedBeforeSeek = this.paused();
      }

      this.ytPlayer.seekTo(seconds, true);
      this.trigger('timeupdate');
      this.trigger('seeking');
      this.isSeeking = true;

      // A seek event during pause does not return an event to trigger a seeked event,
      // so run an interval timer to look for the currentTime to change
      if (this.lastState === YT.PlayerState.PAUSED && this.timeBeforeSeek !== seconds) {
        clearInterval(this.checkSeekedInPauseInterval);
        this.checkSeekedInPauseInterval = setInterval(() => {
          if (this.lastState !== YT.PlayerState.PAUSED || !this.isSeeking) {
            // If something changed while we were waiting for the currentTime to change,
            //  clear the interval timer
            clearInterval(this.checkSeekedInPauseInterval);
          } else if (this.currentTime() !== this.timeBeforeSeek) {
            this.trigger('timeupdate');
            this.onSeeked();
          }
        }, 250);
      }
    }

    seeking() {
      return this.isSeeking;
    }

    seekable() {
      if (!this.ytPlayer) {
        return videojs.createTimeRange();
      }

      return videojs.createTimeRange(0, this.ytPlayer.getDuration());
    }

    onSeeked() {
      clearInterval(this.checkSeekedInPauseInterval);
      this.isSeeking = false;

      if (this.wasPausedBeforeSeek) {
        this.pause();
      }

      this.trigger('seeked');
    }

    playbackRate() {
      return this.ytPlayer ? this.ytPlayer.getPlaybackRate() : 1;
    }

    setPlaybackRate(suggestedRate) {
      if (!this.ytPlayer) {
        return;
      }

      this.ytPlayer.setPlaybackRate(suggestedRate);
    }

    duration() {
      return this.ytPlayer ? this.ytPlayer.getDuration() : 0;
    }

    currentSrc() {
      return this.source && this.source.src;
    }

    ended() {
      return this.ytPlayer ? this.lastState === YT.PlayerState.ENDED : false;
    }

    volume() {
      return this.ytPlayer ? this.ytPlayer.getVolume() / 100.0 : 1;
    }

    setVolume(percentAsDecimal) {
      if (!this.ytPlayer) {
        return;
      }

      this.ytPlayer.setVolume(percentAsDecimal * 100.0);
    }

    muted() {
      return this.ytPlayer ? this.ytPlayer.isMuted() : false;
    }

    setMuted(mute) {
      if (!this.ytPlayer) {
        return;
      }
      this.muted(true);

      if (mute) {
        this.ytPlayer.mute();
      } else {
        this.ytPlayer.unMute();
      }
      this.setTimeout(() => {
        this.trigger('volumechange');
      }, 50);
    }

    buffered() {
      if (!this.ytPlayer || !this.ytPlayer.getVideoLoadedFraction) {
        return videojs.createTimeRange();
      }

      const bufferedEnd = this.ytPlayer.getVideoLoadedFraction() * this.ytPlayer.getDuration();

      return videojs.createTimeRange(0, bufferedEnd);
    }

    // TODO: Can we really do something with this on YouTUbe?
    preload() {}

    load() {}

    reset() {}

    networkState() {
      if (!this.ytPlayer) {
        return 0; // NETWORK_EMPTY
      }
      switch (this.ytPlayer.getPlayerState()) {
        case -1: // unstarted
          return 0; // NETWORK_EMPTY
        case 3: // buffering
          return 2; // NETWORK_LOADING
        default:
          return 1; // NETWORK_IDLE
      }
    }

    readyState() {
      if (!this.ytPlayer) {
        return 0; // HAVE_NOTHING
      }

      switch (this.ytPlayer.getPlayerState()) {
        case -1: // unstarted
          return 0; // HAVE_NOTHING
        case 5: // video cued
          return 1; // HAVE_METADATA
        case 3: // buffering
          return 2; // HAVE_CURRENT_DATA
        default:
          return 4; // HAVE_ENOUGH_DATA
      }
    }

    supportsFullScreen() {
      if (typeof document === 'undefined') {
        return;
      }

      // eslint-disable-next-line consistent-return
      return (
        document.fullscreenEnabled ||
        document.webkitFullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.msFullscreenEnabled
      );
    }

    // Tries to get the highest resolution thumbnail available for the video
    checkHighResPoster() {
      const uri = `https://img.youtube.com/vi/${this.url.videoId}/maxresdefault.jpg`;

      try {
        const image = new Image();
        image.onload = () => {
          // Onload may still be called if YouTube returns the 120x90 error thumbnail
          if ('naturalHeight' in image) {
            if (image.naturalHeight <= 90 || image.naturalWidth <= 120) {
              return;
            }
          } else if (image.height <= 90 || image.width <= 120) {
            return;
          }

          this.poster_ = uri;
          this.trigger('posterchange');
        };
        image.onerror = () => {};
        image.src = uri;
      } catch (e) {
        // error
      }
    }
  }

  Youtube.isSupported = () => true;

  Youtube.canPlaySource = (e) => Youtube.canPlayType(e.type);

  Youtube.canPlayType = (e) => e === 'video/youtube';

  Youtube.parseUrl = (url) => {
    const result = {
      videoId: null,
    };

    // eslint-disable-next-line no-useless-escape
    const regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    let match = url.match(regex);

    if (match && match[2].length === 11) {
      result.videoId = match[2];
    }

    // eslint-disable-next-line no-useless-escape
    const regPlaylist = /[?&]list=([^#\&\?]+)/;
    match = url.match(regPlaylist);

    if (match && match[1]) {
      result.listId = match[1];
    }

    return result;
  };

  function apiLoaded() {
    YT.ready(() => {
      Youtube.isApiReady = true;
      for (let i = 0; i < Youtube.apiReadyQueue.length; i += 1) {
        Youtube.apiReadyQueue[i].initYTPlayer();
      }
    });
  }

  function loadScript(src, callback) {
    if (typeof document === 'undefined') {
      return;
    }
    let loaded = false;
    const tag = document.createElement('script');
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (!firstScriptTag) {
      // when loaded in jest without jsdom setup it doesn't get any element.
      // In jest it doesn't really make sense to do anything, because no one is watching youtube in jest
      return;
    }
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    tag.onload = () => {
      if (!loaded) {
        loaded = true;
        callback();
      }
    };
    tag.onreadystatechange = () => {
      if (!loaded && (this.readyState === 'complete' || this.readyState === 'loaded')) {
        loaded = true;
        callback();
      }
    };
    tag.src = src;
  }

  function injectCss() {
    if (typeof document === 'undefined') {
      return;
    }
    const css = // iframe blocker to catch mouse events
      '.vjs-youtube .vjs-iframe-blocker { display: none; }' +
      '.vjs-youtube.vjs-user-inactive .vjs-iframe-blocker { display: block; }' +
      '.vjs-youtube .vjs-poster { background-size: cover; }';

    const head = document.head || document.getElementsByTagName('head')[0];

    const style = document.createElement('style');
    style.type = 'text/css';

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
  }

  Youtube.apiReadyQueue = [];

  if (typeof document !== 'undefined') {
    loadScript('https://www.youtube.com/iframe_api', apiLoaded);
    injectCss();
  }

  // Older versions of VJS5 doesn't have the registerTech function
  if (typeof videojs.registerTech !== 'undefined') {
    videojs.registerTech('Youtube', Youtube);
  } else {
    videojs.registerComponent('Youtube', Youtube);
  }
};

export { initYoutubePlugin };
