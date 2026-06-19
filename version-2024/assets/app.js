(function () {
  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function setMenuState(open) {
    document.body.classList.toggle("menu-open", open);
    const btn = qs("[data-menu-toggle]");
    if (btn) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
  }

  function initMobileMenu() {
    const btn = qs("[data-menu-toggle]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      setMenuState(!document.body.classList.contains("menu-open"));
    });

    qsa(".nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuState(false);
      });
    });

    document.addEventListener("click", function (event) {
      if (!document.body.classList.contains("menu-open")) return;
      const nav = qs(".nav");
      const target = event.target;
      if (nav && !nav.contains(target) && target !== btn && !btn.contains(target)) {
        setMenuState(false);
      }
    });
  }

  function initHeroCarousel() {
    const root = qs("[data-hero-carousel]");
    if (!root) return;

    const slides = qsa("[data-hero-slide]", root);
    const mainImage = qs("[data-hero-main-image]", root);
    const titleEls = qsa("[data-hero-title]", root);
    const textEls = qsa("[data-hero-text]", root);
    const ctaEls = qsa("[data-hero-cta]", root);
    const labelEls = qsa("[data-hero-label]", root);
    const dots = qsa("[data-hero-dot]", root);

    if (!slides.length) return;

    let index = 0;
    let timer = null;

    function sync(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
      const slide = slides[index];
      if (mainImage) mainImage.src = slide.dataset.image || mainImage.src;
      titleEls.forEach(function (el) { el.textContent = slide.dataset.title || ""; });
      textEls.forEach(function (el) { el.textContent = slide.dataset.text || ""; });
      ctaEls.forEach(function (el) { if (slide.dataset.href) el.setAttribute("href", slide.dataset.href); });
      labelEls.forEach(function (el) { el.textContent = slide.dataset.label || ""; });
    }

    function next() {
      sync(index + 1);
    }

    function start() {
      stop();
      timer = window.setInterval(next, 4500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    slides.forEach(function (slide, i) {
      slide.addEventListener("mouseenter", function () {
        sync(i);
        stop();
      });
      slide.addEventListener("mouseleave", start);
    });

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        sync(i);
        start();
      });
    });

    sync(0);
    start();
  }

  function initVideoPlayers() {
    const players = qsa("[data-video-player]");
    if (!players.length) return;

    players.forEach(function (root) {
      const video = qs("video", root);
      const sources = (() => {
        try {
          return JSON.parse(root.dataset.sources || "[]");
        } catch (error) {
          return [];
        }
      })();

      const buttons = qsa("[data-source-btn]", root);
      const playBtn = qs("[data-play-btn]", root);
      const poster = root.dataset.poster || "";
      const title = root.dataset.title || "影片";

      let hls = null;
      let currentIndex = 0;

      function destroyHls() {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
        hls = null;
      }

      function attachSource(url) {
        if (!video || !url) return;
        destroyHls();
        video.pause();
        video.removeAttribute("src");
        video.load();

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (playBtn) playBtn.textContent = "继续播放";
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                destroyHls();
              }
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else {
          video.src = url;
        }

        buttons.forEach(function (btn, i) {
          btn.classList.toggle("is-active", i === currentIndex);
        });

        root.dataset.activeSrc = url;
      }

      function selectSource(index) {
        currentIndex = index % sources.length;
        attachSource(sources[currentIndex]);
      }

      buttons.forEach(function (btn, i) {
        btn.addEventListener("click", function () {
          selectSource(i);
          if (video) {
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
              playPromise.catch(function () {});
            }
          }
        });
      });

      if (playBtn) {
        playBtn.addEventListener("click", function () {
          if (video) {
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
              playPromise.catch(function () {});
            }
          }
        });
      }

      if (video && poster) {
        video.setAttribute("poster", poster);
      }

      if (sources.length) {
        selectSource(0);
      }

      if (video) {
        video.addEventListener("click", function () {
          const playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
          }
        });
      }

      root.addEventListener("mouseenter", function () {
        root.dataset.hover = "1";
      });

      root.addEventListener("mouseleave", function () {
        root.dataset.hover = "0";
      });
    });
  }

  function renderMovieCards(target, movies, options) {
    if (!target) return;
    const limit = options && options.limit ? options.limit : movies.length;
    const openInNew = options && options.newTab;
    target.innerHTML = movies.slice(0, limit).map(function (movie) {
      const tags = (movie.tags || []).slice(0, 4).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join("");
      const href = escapeAttr(movie.href || "#");
      const rel = openInNew ? ' target="_blank" rel="noopener"' : "";
      return '' +
        '<article class="movie-card">' +
        '  <a href="' + href + '"' + rel + '>' +
        '    <div class="movie-poster">' +
        '      <img src="' + escapeAttr(movie.image || "") + '" alt="' + escapeAttr(movie.title || "") + '" loading="lazy">' +
        '      <div class="movie-badge">' + escapeHtml(movie.year ? String(movie.year) : "影片") + '</div>' +
        '    </div>' +
        '    <div class="movie-body">' +
        '      <h3 class="movie-title">' + escapeHtml(movie.title || "") + '</h3>' +
        '      <div class="movie-meta">' +
        '        <span>' + escapeHtml(movie.region || "") + '</span>' +
        '        <span>·</span>' +
        '        <span>' + escapeHtml(movie.genre || "") + '</span>' +
        '      </div>' +
        '      <div class="movie-tags">' + tags + '</div>' +
        '      <p class="movie-summary">' + escapeHtml(movie.one_line || movie.summary || "") + '</p>' +
        '      <div class="card-actions">' +
        '        <span class="btn btn-secondary">查看详情</span>' +
        '        <span class="btn btn-primary">立即播放</span>' +
        '      </div>' +
        '    </div>' +
        '  </a>' +
        '</article>';
    }).join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function initSearchPage() {
    const root = qs("[data-search-results]");
    if (!root || !window.SITE_MOVIES) return;

    const input = qs("[data-search-input]");
    const info = qs("[data-search-info]");
    const form = qs("[data-search-form]");
    const sortSelect = qs("[data-search-sort]");
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    if (input) {
      input.value = initialQuery;
    }

    function getFiltered() {
      const q = (input ? input.value : initialQuery).trim().toLowerCase();
      const sortMode = sortSelect ? sortSelect.value : "score";
      let list = window.SITE_MOVIES.filter(function (movie) {
        if (!q) return true;
        const hay = [
          movie.title,
          movie.region,
          movie.type,
          movie.genre,
          movie.tags,
          movie.one_line
        ].join(" ").toLowerCase();
        return hay.indexOf(q) !== -1;
      });

      if (sortMode === "year") {
        list = list.slice().sort(function (a, b) {
          return (b.year || 0) - (a.year || 0) || (b.score || 0) - (a.score || 0);
        });
      } else {
        list = list.slice().sort(function (a, b) {
          return (b.score || 0) - (a.score || 0) || (b.year || 0) - (a.year || 0);
        });
      }

      const cap = q ? 400 : 240;
      return list.slice(0, cap);
    }

    function update() {
      const list = getFiltered();
      if (info) {
        const q = (input ? input.value : initialQuery).trim();
        info.textContent = q
          ? ('“' + q + '” 的搜索结果，当前显示 ' + list.length + ' 条')
          : ('当前展示热度靠前的 240 条影片，继续输入关键词可精确检索');
      }

      if (!list.length) {
        root.innerHTML = '<div class="empty-state">没有找到匹配内容，试试换一个关键词。</div>';
        return;
      }

      renderMovieCards(root, list, { limit: list.length });
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const q = input ? input.value.trim() : "";
        const url = new URL(window.location.href);
        if (q) {
          url.searchParams.set("q", q);
        } else {
          url.searchParams.delete("q");
        }
        window.history.replaceState({}, "", url);
        update();
      });
    }

    if (input) {
      input.addEventListener("input", function () {
        update();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", update);
    }

    update();
  }

  function initCurrentYear() {
    qsa("[data-current-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHeroCarousel();
    initVideoPlayers();
    initSearchPage();
    initCurrentYear();
  });

  window.renderMovieCards = renderMovieCards;
})();
