(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-site-nav]');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const value = input ? input.value.trim() : '';
      const target = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
      window.location.href = target;
    });
  });

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-carousel-dot]'));
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-carousel-dot')) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const section = scope.parentElement || document;
    const cards = Array.from(section.querySelectorAll('[data-card]'));
    const keywordInput = scope.querySelector('.js-filter-input');
    const yearSelect = scope.querySelector('.js-year-filter');
    const regionSelect = scope.querySelector('.js-region-filter');
    const categorySelect = scope.querySelector('.js-category-filter');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (keywordInput && initialQuery) {
      keywordInput.value = initialQuery;
    }

    function matches(card, keyword, year, region, category) {
      const haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' ').toLowerCase();
      const okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      const okYear = !year || card.getAttribute('data-year') === year;
      const okRegion = !region || (card.getAttribute('data-region') || '').indexOf(region) !== -1;
      const okCategory = !category || card.getAttribute('data-category') === category;
      return okKeyword && okYear && okRegion && okCategory;
    }

    function apply() {
      const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      const year = yearSelect ? yearSelect.value : '';
      const region = regionSelect ? regionSelect.value : '';
      const category = categorySelect ? categorySelect.value : '';
      cards.forEach(function (card) {
        card.style.display = matches(card, keyword, year, region, category) ? '' : 'none';
      });
    }

    [keywordInput, yearSelect, regionSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });
})();
