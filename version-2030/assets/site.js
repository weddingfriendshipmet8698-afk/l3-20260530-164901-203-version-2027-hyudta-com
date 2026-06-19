(function () {
  var currentScript = document.currentScript;
  var assetBase = currentScript ? new URL('.', currentScript.src).href : './assets/';

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupHeader() {
    var header = document.querySelector('[data-header]');
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');

    function syncHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle('is-scrolled', window.scrollY > 18);
    }

    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });

    if (button && panel) {
      button.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    play();
  }

  function cardText(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-region') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function setupFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (panel) {
      var section = panel.parentElement || document;
      var list = section.querySelector('[data-card-list]');
      var empty = section.querySelector('[data-empty-state]');
      var keyword = panel.querySelector('[data-filter-keyword]');
      var year = panel.querySelector('[data-filter-year]');
      var type = panel.querySelector('[data-filter-type]');
      var sort = panel.querySelector('[data-sort-mode]');

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

      function apply() {
        var q = keyword ? keyword.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : '';
        var selectedType = type ? type.value : '';
        var visibleCount = 0;

        cards.forEach(function (card) {
          var matchKeyword = !q || cardText(card).indexOf(q) !== -1;
          var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
          var matchType = !selectedType || card.getAttribute('data-type') === selectedType;
          var visible = matchKeyword && matchYear && matchType;
          card.style.display = visible ? '' : 'none';
          if (visible) {
            visibleCount += 1;
          }
        });

        if (sort) {
          var mode = sort.value;
          cards.sort(function (a, b) {
            if (mode === 'year-asc') {
              return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
            }
            if (mode === 'score-desc') {
              return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
            }
            if (mode === 'title-asc') {
              return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
            }
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          });
          cards.forEach(function (card) {
            list.appendChild(card);
          });
        }

        if (empty) {
          empty.classList.toggle('is-visible', visibleCount === 0);
        }
      }

      [keyword, year, type, sort].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function loadNative(video, src) {
    video.src = src;
    video.load();
    return Promise.resolve();
  }

  function loadHlsConstructor() {
    if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
      return Promise.resolve(window.Hls);
    }

    return import(assetBase + 'hls-module.js').then(function (module) {
      return module.H;
    });
  }

  function attachStream(video, src) {
    if (video.dataset.ready === '1') {
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.dataset.ready = '1';
      return loadNative(video, src);
    }

    return loadHlsConstructor().then(function (HlsConstructor) {
      if (!HlsConstructor || !HlsConstructor.isSupported()) {
        video.dataset.ready = '1';
        return loadNative(video, src);
      }

      var hls = new HlsConstructor({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      video.dataset.ready = '1';
    }).catch(function () {
      video.dataset.ready = '1';
      return loadNative(video, src);
    });
  }

  function setupPlayers() {
    document.querySelectorAll('[data-video-player]').forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('[data-play-button]');

      if (!video) {
        return;
      }

      var src = video.getAttribute('data-play');

      function start() {
        if (!src) {
          return;
        }

        attachStream(video, src).then(function () {
          if (button) {
            button.classList.add('is-hidden');
          }
          video.play().catch(function () {});
        });
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          start();
        });
      }

      video.addEventListener('click', function () {
        if (!video.dataset.ready) {
          start();
        }
      });
    });
  }

  ready(function () {
    setupHeader();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
