(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.addEventListener('error', function (event) {
    var target = event.target;
    if (target && target.tagName === 'IMG') {
      target.classList.add('is-missing');
    }
  }, true);

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  var filterForm = document.querySelector('[data-filter-form]');
  if (filterForm) {
    var searchInput = filterForm.querySelector('[data-search-input]');
    var typeSelect = filterForm.querySelector('[data-filter-type]');
    var regionSelect = filterForm.querySelector('[data-filter-region]');
    var genreSelect = filterForm.querySelector('[data-filter-genre]');
    var resetButton = filterForm.querySelector('[data-clear-filters]');
    var resultCount = document.querySelector('[data-result-count]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.search-item'));

    function readQueryFromUrl() {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query && searchInput) {
        searchInput.value = query;
      }
    }

    function applyFilters() {
      var keyword = normalize(searchInput && searchInput.value);
      var typeValue = normalize(typeSelect && typeSelect.value);
      var regionValue = normalize(regionSelect && regionSelect.value);
      var genreValue = normalize(genreSelect && genreSelect.value);
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        var typeMatched = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
        var regionMatched = !regionValue || normalize(card.dataset.region).indexOf(regionValue) !== -1;
        var genreMatched = !genreValue || normalize(card.dataset.genre).indexOf(genreValue) !== -1;
        var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
        var visible = typeMatched && regionMatched && genreMatched && keywordMatched;
        card.classList.toggle('is-hidden', !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (resultCount) {
        var hasFilter = Boolean(keyword || typeValue || regionValue || genreValue);
        resultCount.textContent = hasFilter ? (shown ? '筛选结果：' + shown + ' 部影片' : '没有匹配的影片') : '';
      }
    }

    readQueryFromUrl();
    ['input', 'change'].forEach(function (eventName) {
      filterForm.addEventListener(eventName, applyFilters);
    });
    if (resetButton) {
      resetButton.addEventListener('click', function () {
        filterForm.reset();
        applyFilters();
      });
    }
    applyFilters();
  }

  function ensureHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var stream = shell.getAttribute('data-stream');
    if (!video || !stream) {
      return;
    }

    shell.classList.add('is-ready');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = stream;
      }
      video.play().catch(function () {});
      return;
    }

    ensureHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        if (!video._hlsInstance) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video._hlsInstance = hls;
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.play().catch(function () {});
        }
      } else {
        if (!video.src) {
          video.src = stream;
        }
        video.play().catch(function () {});
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
    var overlay = shell.querySelector('.player-overlay');
    var video = shell.querySelector('video');

    if (overlay) {
      overlay.addEventListener('click', function () {
        startPlayer(shell);
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
    }
  });
})();
