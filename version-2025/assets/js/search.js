(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var data = window.__MOVIE_SEARCH__ || [];

  if (!form || !input || !results || !status) {
    return;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function render(items, query) {
    results.innerHTML = items.map(function (movie) {
      return [
        '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
        '  <span class="card-poster">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-shade"></span>',
        '    <span class="poster-play" aria-hidden="true">▶</span>',
        '    <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
        '  </span>',
        '  <span class="card-body">',
        '    <strong>' + escapeHtml(movie.title) + '</strong>',
        '    <em>' + escapeHtml(movie.oneLine) + '</em>',
        '    <span class="card-meta">',
        '      <span>' + escapeHtml(movie.genre) + '</span>',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '    </span>',
        '  </span>',
        '</a>'
      ].join('');
    }).join('');

    if (query) {
      status.textContent = '搜索结果：' + items.length + ' 部相关影片';
    } else {
      status.textContent = '热门内容推荐';
    }
  }

  function search() {
    var query = input.value.trim().toLowerCase();

    if (!query) {
      render(data.slice(0, 18), '');
      return;
    }

    var matched = data.filter(function (movie) {
      return movie.searchText.indexOf(query) !== -1;
    }).slice(0, 80);

    render(matched, query);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    search();
  });

  input.addEventListener('input', search);
  render(data.slice(0, 18), '');
})();
