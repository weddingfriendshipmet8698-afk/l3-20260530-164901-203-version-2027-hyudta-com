const Hls = window.Hls;
const players = document.querySelectorAll('[data-player]');

players.forEach((player) => {
  const video = player.querySelector('video');
  const overlay = player.querySelector('.player-overlay');
  const playUrl = video ? video.getAttribute('data-play-url') : '';
  let hls = null;
  let ready = false;

  function attach() {
    if (!video || !playUrl || ready) {
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(playUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal || !hls) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playUrl;
    }

    ready = true;
  }

  function play() {
    if (!video) {
      return;
    }
    attach();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    const action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
});
