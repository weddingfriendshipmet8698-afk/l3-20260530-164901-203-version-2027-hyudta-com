import { H as Hls } from "./hls-dru42stk.js";

function setMessage(element, message) {
  if (element) {
    element.textContent = message;
  }
}

function initPlayer() {
  const shell = document.querySelector("[data-player]");
  if (!shell) {
    return;
  }

  const video = shell.querySelector("video");
  const playButton = shell.querySelector("[data-play-button]");
  const message = shell.querySelector("[data-player-message]");
  const source = shell.getAttribute("data-source");
  let initialized = false;
  let hls = null;

  async function startPlayback() {
    if (!video || !source) {
      setMessage(message, "播放源不可用。");
      return;
    }

    if (!initialized) {
      initialized = true;
      setMessage(message, "正在载入播放源...");

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          setMessage(message, "播放源已载入。");
          video.play().catch(function () {
            setMessage(message, "请再次点击播放器开始播放。");
          });
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setMessage(message, "网络错误，正在尝试恢复。");
            hls.startLoad();
            return;
          }
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            setMessage(message, "媒体错误，正在尝试恢复。");
            hls.recoverMediaError();
            return;
          }
          setMessage(message, "播放初始化失败，请刷新页面重试。");
          hls.destroy();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          setMessage(message, "播放源已载入。");
        }, { once: true });
      } else {
        setMessage(message, "当前浏览器不支持 HLS 播放。");
        return;
      }
    }

    if (playButton) {
      playButton.classList.add("is-hidden");
    }

    try {
      await video.play();
      setMessage(message, "正在播放。");
    } catch (error) {
      setMessage(message, "请再次点击播放器开始播放。");
    }
  }

  if (playButton) {
    playButton.addEventListener("click", startPlayback);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (!initialized) {
        startPlayback();
      }
    });
  }

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}

initPlayer();
