(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.getElementById("moviePlayer");
    var overlay = document.querySelector("[data-player-overlay]");
    var playButton = document.getElementById("playButton");

    if (!video) {
      return;
    }

    var source = video.getAttribute("data-src");
    var hls = null;

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function showOverlay() {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    }

    function attachSource() {
      if (!source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      attachSource();
      var result = video.play();

      if (result && typeof result.then === "function") {
        result.then(hideOverlay).catch(showOverlay);
      } else {
        hideOverlay();
      }
    }

    if (playButton) {
      playButton.addEventListener("click", startPlayback);
    }

    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        showOverlay();
      }
    });

    attachSource();

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
