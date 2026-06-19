(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  const next = document.querySelector(".hero-next");
  const prev = document.querySelector(".hero-prev");
  let current = 0;
  let timer = null;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, idx) {
      slide.classList.toggle("active", idx === current);
    });
    dots.forEach(function (dot, idx) {
      dot.classList.toggle("active", idx === current);
    });
  }

  function restartTimer() {
    if (timer) {
      window.clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    next && next.addEventListener("click", function () {
      setSlide(current + 1);
      restartTimer();
    });
    prev && prev.addEventListener("click", function () {
      setSlide(current - 1);
      restartTimer();
    });
    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        setSlide(idx);
        restartTimer();
      });
    });
    setSlide(0);
    restartTimer();
  }

  const searchInput = document.getElementById("movie-search");
  const yearFilter = document.getElementById("year-filter");
  const typeFilter = document.getElementById("type-filter");
  const categoryFilter = document.getElementById("category-filter");
  const list = document.querySelector(".searchable-list");

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyQueryFromUrl() {
    if (!searchInput) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const value = params.get("q");
    if (value) {
      searchInput.value = value;
    }
  }

  function filterCards() {
    if (!list) {
      return;
    }
    const cards = Array.from(list.querySelectorAll(".movie-card"));
    const query = normalize(searchInput && searchInput.value);
    const year = normalize(yearFilter && yearFilter.value);
    const type = normalize(typeFilter && typeFilter.value);
    const category = normalize(categoryFilter && categoryFilter.value);
    let shown = 0;

    cards.forEach(function (card) {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.textContent
      ].join(" "));
      const okQuery = !query || haystack.includes(query);
      const okYear = !year || normalize(card.dataset.year) === year;
      const okType = !type || normalize(card.dataset.type) === type;
      const okCategory = !category || normalize(card.dataset.category) === category;
      const visible = okQuery && okYear && okType && okCategory;
      card.style.display = visible ? "" : "none";
      if (visible) {
        shown += 1;
      }
    });

    let notice = list.querySelector(".no-match");
    if (!shown) {
      if (!notice) {
        notice = document.createElement("div");
        notice.className = "no-match";
        notice.textContent = "没有找到匹配内容";
        list.appendChild(notice);
      }
    } else if (notice) {
      notice.remove();
    }
  }

  applyQueryFromUrl();
  [searchInput, yearFilter, typeFilter, categoryFilter].forEach(function (control) {
    if (control) {
      control.addEventListener("input", filterCards);
      control.addEventListener("change", filterCards);
    }
  });
  filterCards();
})();
