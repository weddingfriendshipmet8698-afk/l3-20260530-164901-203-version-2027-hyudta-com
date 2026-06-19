(function () {
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = $('[data-menu-button]');
    var nav = $('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      button.classList.toggle('is-open');
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initFilters() {
    var form = $('[data-filter-form]');
    var list = $('.filter-list');
    if (!form || !list) {
      return;
    }
    var queryInput = $('[data-filter-query]', form);
    var yearSelect = $('[data-filter-year]', form);
    var regionSelect = $('[data-filter-region]', form);
    var typeSelect = $('[data-filter-type]', form);
    var categorySelect = $('[data-filter-category]', form);
    var items = $all('[data-search]', list);
    var emptyState = $('[data-empty-state]');

    function apply() {
      var query = normalize(queryInput && queryInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var category = normalize(categorySelect && categorySelect.value);
      var visible = 0;

      items.forEach(function (item) {
        var search = normalize(item.getAttribute('data-search'));
        var itemYear = normalize(item.getAttribute('data-year'));
        var itemRegion = normalize(item.getAttribute('data-region'));
        var itemType = normalize(item.getAttribute('data-type'));
        var itemCategory = normalize(item.getAttribute('data-category'));
        var matched = true;

        if (query && search.indexOf(query) === -1) {
          matched = false;
        }
        if (year && itemYear !== year) {
          matched = false;
        }
        if (region && itemRegion !== region) {
          matched = false;
        }
        if (type && itemType !== type) {
          matched = false;
        }
        if (category && itemCategory !== category) {
          matched = false;
        }

        item.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });
    apply();
  }

  function initPlayers() {
    $all('[data-player]').forEach(function (player) {
      var video = $('.player-video', player);
      var overlay = $('.player-overlay', player);
      var message = $('[data-player-message]', player);
      if (!video || !overlay) {
        return;
      }
      var hls = null;
      var loaded = false;

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.classList.add('is-visible');
      }

      function attach() {
        if (loaded) {
          return true;
        }
        var src = video.getAttribute('data-hls');
        if (!src) {
          showMessage('视频暂时无法播放，请稍后再试。');
          return false;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          loaded = true;
          return true;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage('视频暂时无法播放，请稍后再试。');
            }
          });
          loaded = true;
          return true;
        }
        showMessage('视频暂时无法播放，请稍后再试。');
        return false;
      }

      function start() {
        if (!attach()) {
          return;
        }
        player.classList.add('is-loaded');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            player.classList.remove('is-loaded');
          });
        }
      }

      overlay.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (!loaded) {
          start();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-loaded');
      });
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
