(function () {
  var video = document.getElementById('movie-player');
  var cover = document.getElementById('player-cover');
  var url = window.__MOVIE_VIDEO__;
  var attached = false;

  if (!video || !url) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }

    video.src = url;
  }

  function play() {
    attach();

    if (cover) {
      cover.hidden = true;
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.hidden = true;
    }
  });
})();
