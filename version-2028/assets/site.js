(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupNavigation();
    setupSearchForms();
    setupHero();
    setupFilters();
  });

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !mobileNav) {
      return;
    }

    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
      document.body.classList.toggle(
        "nav-open",
        mobileNav.classList.contains("is-open"),
      );
    });
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll("[data-search-form]");

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = "./search.html";

        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }

        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-dot]"),
    );
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function go(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        go(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        go(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        go(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        go(current + 1);
        restart();
      });
    }

    go(0);
    restart();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-filter-grid]");

    if (!panel || !grid) {
      return;
    }

    var cards = Array.prototype.slice.call(
      grid.querySelectorAll("[data-filter-card]"),
    );
    var input = panel.querySelector("[data-filter-input]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var regionSelect = panel.querySelector("[data-filter-region]");
    var categorySelect = panel.querySelector("[data-filter-category]");
    var emptyState = document.querySelector("[data-empty-state]");

    function applyQueryFromUrl() {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (query && input) {
        input.value = query;
      }
    }

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function applyFilters() {
      var query = normalize(input ? input.value.trim() : "");
      var type = normalize(typeSelect ? typeSelect.value : "");
      var region = normalize(regionSelect ? regionSelect.value : "");
      var category = normalize(categorySelect ? categorySelect.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(
          [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags,
          ].join(" "),
        );
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType =
          !type || normalize(card.dataset.type).indexOf(type) !== -1;
        var matchesRegion =
          !region || normalize(card.dataset.region).indexOf(region) !== -1;
        var matchesCategory =
          !category || normalize(card.dataset.category) === category;
        var show =
          matchesQuery && matchesType && matchesRegion && matchesCategory;

        card.style.display = show ? "" : "none";

        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, typeSelect, regionSelect, categorySelect].forEach(
      function (element) {
        if (element) {
          element.addEventListener("input", applyFilters);
          element.addEventListener("change", applyFilters);
        }
      },
    );

    applyQueryFromUrl();
    applyFilters();
  }
})();
