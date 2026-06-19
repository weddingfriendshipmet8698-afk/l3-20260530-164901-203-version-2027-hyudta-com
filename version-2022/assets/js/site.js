(function () {
  var header = document.querySelector('[data-site-header]');
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  var backTop = document.querySelector('[data-back-top]');

  function onScroll() {
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    }
    if (backTop) {
      backTop.classList.toggle('is-visible', window.scrollY > 420);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function startAutoPlay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startAutoPlay();
      });
    });

    showSlide(0);
    startAutoPlay();
  }

  var filterList = document.querySelector('[data-filter-list]');
  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterCategory = document.querySelector('[data-filter-category]');
  var filterState = document.querySelector('[data-filter-state]');

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function setQueryFromUrl() {
    if (!filterInput) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      filterInput.value = query;
    }
  }

  function applyFilters() {
    if (!filterList) {
      return;
    }
    var query = normalize(filterInput ? filterInput.value : '');
    var year = normalize(filterYear ? filterYear.value : '');
    var category = normalize(filterCategory ? filterCategory.value : '');
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-card]'));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' '));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesYear = !year || cardYear === year;
      var matchesCategory = !category || cardCategory === category;
      var shouldShow = matchesQuery && matchesYear && matchesCategory;
      card.classList.toggle('is-hidden', !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    if (filterState) {
      filterState.textContent = visible > 0 ? '已筛选出相关影片' : '没有找到匹配影片';
    }
  }

  setQueryFromUrl();
  [filterInput, filterYear, filterCategory].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });
  applyFilters();
})();
