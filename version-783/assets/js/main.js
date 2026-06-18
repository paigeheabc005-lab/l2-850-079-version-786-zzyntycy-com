(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
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
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupGrids() {
    selectAll('[data-card-grid]').forEach(function (grid) {
      var cards = selectAll('[data-movie-card]', grid);
      var pageSize = Number(grid.getAttribute('data-page-size')) || cards.length;
      var visibleCount = Math.min(pageSize, cards.length);
      var wrapper = grid.parentElement;
      var button = wrapper ? wrapper.querySelector('[data-load-more]') : null;
      var noResults = wrapper ? wrapper.querySelector('[data-no-results]') : null;
      var searchBox = wrapper ? wrapper.querySelector('[data-inline-search] input') : null;
      var searchButton = wrapper ? wrapper.querySelector('[data-inline-search] button') : null;
      var query = '';

      function matched(card) {
        if (!query) {
          return true;
        }

        return normalize(card.getAttribute('data-search')).indexOf(query) !== -1;
      }

      function update() {
        var shown = 0;
        var matchedCount = 0;

        cards.forEach(function (card) {
          var isMatch = matched(card);
          matchedCount += isMatch ? 1 : 0;
          shown += isMatch && shown < visibleCount ? 1 : 0;
          card.classList.toggle('is-hidden', !isMatch || shown > visibleCount);
        });

        if (button) {
          button.style.display = matchedCount > visibleCount ? 'inline-flex' : 'none';
        }

        if (noResults) {
          noResults.classList.toggle('is-visible', matchedCount === 0);
        }
      }

      function runSearch(value) {
        query = normalize(value);
        visibleCount = query ? cards.length : Math.min(pageSize, cards.length);
        update();
      }

      if (button) {
        button.addEventListener('click', function () {
          visibleCount = Math.min(visibleCount + pageSize, cards.length);
          update();
        });
      }

      if (searchButton && searchBox) {
        searchButton.addEventListener('click', function () {
          runSearch(searchBox.value);
        });

        searchBox.addEventListener('keydown', function (event) {
          if (event.key === 'Enter') {
            event.preventDefault();
            runSearch(searchBox.value);
          }
        });
      }

      update();
    });
  }

  function setupSearchQuery() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (!query) {
      return;
    }

    var library = document.querySelector('#library');
    var input = library ? library.querySelector('[data-inline-search] input') : null;
    var button = library ? library.querySelector('[data-inline-search] button') : null;

    if (input && button) {
      input.value = query;
      window.setTimeout(function () {
        button.click();
        library.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupGrids();
    setupSearchQuery();
  });
})();
