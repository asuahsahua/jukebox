(function() {
  var Event, PAUSED, PLAYING, PlayerState, Quality, STOPPED, exports;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  exports = window || module.exports;

  PLAYING = 'Playing';

  PAUSED = 'Paused';

  STOPPED = 'Stopped';

  Quality = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    HD720: 'hd720',
    HD1080: 'hd1080',
    HIGHRES: 'highres'
  };

  PlayerState = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    VIDEOCUED: 5
  };

  Event = (function() {

    Event.prototype.handlers = null;

    function Event() {
      this.fire = __bind(this.fire, this);      this.handlers = [];
    }

    Event.prototype.addHandler = function(handler) {
      return this.handlers.push(handler);
    };

    Event.prototype.fire = function() {
      var handler, _i, _len, _ref, _results;
      _ref = this.handlers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        handler = _ref[_i];
        _results.push(handler.apply(this, arguments));
      }
      return _results;
    };

    return Event;

  })();

  exports.Jukebox = (function() {

    Jukebox.onYoutubePlayerStateChange = new Event();

    Jukebox.prototype.currentVideoIndex = -1;

    Jukebox.prototype.playlist = {};

    Jukebox.prototype.player = null;

    Jukebox.prototype.channelType = null;

    Jukebox.prototype.channelFriendlyName = null;

    Jukebox.prototype.stateChangeCallback = null;

    Jukebox.prototype.quality = Quality.HIGHRES;

    Jukebox.prototype.shuffle = false;

    Jukebox.prototype.loop = false;

    Jukebox.prototype.playState = PAUSED;

    Jukebox.prototype.currentJSONRequestId = 0;

    Jukebox.prototype.requestUpdateCallback = null;

    Jukebox.prototype.onPlaylistChanged = new Event();

    Jukebox.prototype.onPlayStatusChanged = new Event();

    Jukebox.prototype.onSongEnded = new Event();

    Jukebox.prototype.onPlayerStateChanged = new Event();

    function Jukebox(playerId) {
      var _this = this;
      this.playerId = playerId;
      this.getChannelAsync = __bind(this.getChannelAsync, this);
      this.setPlaylistAs = __bind(this.setPlaylistAs, this);
      this.player = document.getElementById(this.playerId);
      this.onPlayerStateChanged.addHandler(function(state) {
        console.log("Player state changed to " + state);
        if (state === PlayerState.ENDED) return _this.playNext();
      });
      exports.Jukebox.onYoutubePlayerStateChange.addHandler(this.onPlayerStateChanged.fire);
    }

    Jukebox.prototype.changeChannel = function(user) {
      if (user != null) return this.getChannelAsync(user, this.setPlaylistAs);
    };

    Jukebox.prototype.getCurrentVideo = function() {
      return this.playlist[this.currentVideoIndex];
    };

    Jukebox.prototype.toggleShuffle = function() {
      return this.setShuffle(!this.shuffle);
    };

    Jukebox.prototype.setShuffle = function(shuffle) {
      this.shuffle = shuffle;
    };

    Jukebox.prototype.toggleLoop = function() {
      return this.setLoop(!this.loop);
    };

    Jukebox.prototype.setLoop = function(loop) {
      this.loop = loop;
    };

    Jukebox.prototype.nowPlayingInfo = function() {
      var current;
      current = this.getCurrentVideo();
      return "Now playing: " + current.title + " (Published " + current.published + ")";
    };

    Jukebox.prototype.togglePlayPause = function() {
      if (this.playState === PLAYING) return this.pause();
      return this.play();
    };

    Jukebox.prototype.play = function() {
      var _ref;
      this.playState = PLAYING;
      if ((_ref = this.player) != null) _ref.playVideo();
      return console.log(this.nowPlayingInfo());
    };

    Jukebox.prototype.pause = function() {
      var _ref;
      this.playState = PAUSED;
      return (_ref = this.player) != null ? _ref.pauseVideo() : void 0;
    };

    Jukebox.prototype.stop = function() {
      var _ref;
      this.playState = STOPPED;
      return (_ref = this.player) != null ? _ref.stopVideo() : void 0;
    };

    Jukebox.prototype.setPlaylistAs = function(results) {
      if (results.success) {
        this.currentVideoIndex = -1;
        this.channel = results.identifier;
        this.channelType = results.type;
        this.channelFriendlyName = results.friendlyName;
        this.playlist = results.videos;
      } else {
        this.channel = null;
        this.playlist = null;
        this.stop();
      }
      if (results.success != null) return this.playNext();
    };

    Jukebox.prototype.setQuality = function(quality) {
      var _ref;
      this.quality = quality;
      return (_ref = this.player) != null ? _ref.setPlaybackQuality(this.quality) : void 0;
    };

    Jukebox.prototype.playVideo = function(playlistIndex) {
      var oldVideoIndex, video;
      if (!(this.player && this.playlist[playlistIndex])) return;
      video = this.playlist[playlistIndex];
      oldVideoIndex = this.currentVideoIndex;
      this.player.loadVideoById(video.id, 0, this.quality);
      this.currentVideoIndex = playlistIndex;
      return this.play();
    };

    Jukebox.prototype.playNext = function() {
      var nextVideo;
      if (this.shuffle && this.playlist.length > 1) {
        nextVideo = Math.floor(Math.random() * (this.playlist.length - 1));
        if (nextVideo >= this.currentVideoIndex) nextVideo++;
      } else if (this.loop) {
        nextVideo = (this.currentVideoIndex + 1) % this.playlist.length;
      } else {
        nextVideo = this.currentVideoIndex + 1;
      }
      return this.playVideo(nextVideo);
    };

    Jukebox.prototype.playPrev = function() {
      var nextVideo, prevVideo;
      if (this.shuffle && this.playlist.length > 1) {
        prevVideo = Math.floor(Math.random() * (this.playlist.length(-1)));
        if (prevVideo >= this.currentVideoIndex) prevVideo++;
      } else if (this.loop) {
        prevVideo = (this.currentVideoIndex - 1 + this.playlist.length) % this.playlist.length;
      } else {
        nextVideo = this.currentVideoIndex - 1;
      }
      return this.playVideo(prevVideo);
    };

    Jukebox.prototype.setRequestUpdateCallback = function(requestUpdateCallback) {
      this.requestUpdateCallback = requestUpdateCallback;
    };

    Jukebox.prototype.getChannelAsync = function(user, callback, results) {
      var feed;
      var _this = this;
      if (results == null) results = null;
      if (results === null) {
        results = {
          type: 'channel',
          identifier: user,
          friendlyName: user,
          seriesId: ++this.currentJSONRequestId,
          success: true,
          videos: []
        };
      }
      if (results.seriesId !== this.currentJSONRequestId) {
        return console.error("Killing request, request ID does not match");
      }
      feed = "http://gdata.youtube.com/feeds/api/videos?" + ("alt=json&max-results=50&orderby=published&format=5&author=" + user + "&start-index=" + (results.videos.length + 1));
      return $.getJSON(feed, {}, function(data, textStatus, jqXHR) {
        var totalResults;
        data = data.feed;
        totalResults = data.openSearch$totalResults.$t;
        if (!data.entry && !(results.videos.length != null)) {
          results.success = false;
          callback(results);
          return;
        }
        $.each(data.entry, function(i, entry) {
          console.log(entry);
          return results.videos.push({
            title: entry.title.$t,
            url: entry.link[0].href,
            id: entry.id.$t.substring(entry.id.$t.lastIndexOf('/') + 1),
            published: (new Date(entry.published.$t)).toDateString()
          });
        });
        if (results.videos.length < totalResults) {
          if (typeof _this.requestUpdateCallback === "function") {
            _this.requestUpdateCallback({
              channelType: results.type,
              identifier: user,
              friendlyIdentifier: user,
              current: results.videos.length,
              total: totalResults
            });
          }
          return _this.getChannelAsync(user, callback, results);
        } else {
          return callback(results);
        }
      });
    };

    return Jukebox;

  })();

}).call(this);