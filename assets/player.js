import { H as Hls } from "./hls.js";

export function setupPlayer(source) {
  const video = document.getElementById("movie-video");
  const overlay = document.getElementById("play-overlay");
  let ready = false;
  let hls = null;

  function load() {
    if (!video || ready) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    ready = true;
  }

  function play() {
    if (!video) {
      return;
    }
    load();
    if (overlay) {
      overlay.classList.add("hidden");
    }
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", play);
  }

  if (video) {
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });
    video.addEventListener("error", function () {
      if (hls) {
        hls.destroy();
        hls = null;
        ready = false;
      }
    });
  }
}
