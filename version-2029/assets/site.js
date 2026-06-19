(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = panel.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", isOpen);
      toggle.textContent = isOpen ? "×" : "☰";
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initLocalFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    inputs.forEach(function (input) {
      var scope = document.querySelector("[data-filter-scope]");
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      input.addEventListener("input", function () {
        var keyword = normalize(input.value);
        cards.forEach(function (card) {
          var target = normalize(card.getAttribute("data-search"));
          var matched = !keyword || target.indexOf(keyword) !== -1;
          card.classList.toggle("hidden-by-filter", !matched);
        });
      });
    });
  }

  function movieCard(movie) {
    return [
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '">',
      '  <a class="card-poster" href="' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="card-year">' + escapeHtml(movie.year) + '</span>',
      '    <span class="card-play" aria-hidden="true">▶</span>',
      '  </a>',
      '  <div class="card-content">',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="card-line">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '    <a class="card-category" href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    var input = document.querySelector("[data-search-page-input]");
    if (!results || !summary || !window.MOVIE_INDEX) {
      return;
    }

    var initialQuery = getQueryParam("q");
    if (input) {
      input.value = initialQuery;
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
    render(initialQuery);

    function render(query) {
      var keyword = normalize(query);
      if (!keyword) {
        summary.textContent = "请输入关键词开始搜索。";
        results.innerHTML = "";
        return;
      }

      var matched = window.MOVIE_INDEX.filter(function (movie) {
        return normalize(movie.searchText).indexOf(keyword) !== -1;
      }).slice(0, 120);

      summary.textContent = "关键词“" + query + "”找到 " + matched.length + " 条结果，最多显示前 120 条。";
      results.innerHTML = matched.map(movieCard).join("");
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initLocalFilters();
    initSearchPage();
  });
}());
