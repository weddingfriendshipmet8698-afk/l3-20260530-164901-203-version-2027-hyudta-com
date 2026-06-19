(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(activeIndex - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(activeIndex + 1);
      });
    }

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5000);
    }

    var filterInput = document.querySelector(".filter-search");
    var filterItems = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
    var emptyState = document.querySelector(".empty-state");

    if (filterInput && filterItems.length) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (query) {
        filterInput.value = query;
      }

      function filterCards() {
        var value = filterInput.value.trim().toLowerCase();
        var visibleCount = 0;

        filterItems.forEach(function (item) {
          var text = [
            item.getAttribute("data-title"),
            item.getAttribute("data-region"),
            item.getAttribute("data-genre"),
            item.getAttribute("data-year"),
            item.getAttribute("data-category")
          ].join(" ").toLowerCase();
          var matched = !value || text.indexOf(value) !== -1;
          item.classList.toggle("is-hidden", !matched);
          if (matched) {
            visibleCount += 1;
          }
        });

        if (emptyState) {
          emptyState.style.display = visibleCount ? "none" : "block";
        }
      }

      filterInput.addEventListener("input", filterCards);
      filterCards();
    }
  });
})();

function initMoviePlayer(videoId, buttonId, source) {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  ready(function () {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var prepared = false;

    if (!video || !button || !source) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      prepare();
      button.style.display = "none";
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          button.style.display = "flex";
        });
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!prepared) {
        start();
      }
    });
  });
}
