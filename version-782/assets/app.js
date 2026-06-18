(function () {
  function findAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('.mobile-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = findAll('.hero-slide', hero);
    var dots = findAll('.hero-dots button', hero);
    var prev = hero.querySelector('.hero-control.prev');
    var next = hero.querySelector('.hero-control.next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
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

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function showPlayerMessage(box, text) {
    var message = box.querySelector('.player-message');
    if (message) {
      message.textContent = text;
      message.classList.add('show');
    }
  }

  function initPlayers() {
    findAll('.video-box').forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('.play-layer');
      var stream = box.getAttribute('data-stream');
      if (!video || !button || !stream) {
        return;
      }

      function attach() {
        if (video.getAttribute('data-ready') === '1') {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              showPlayerMessage(box, '视频暂时无法载入，请稍后重试。');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else {
          showPlayerMessage(box, '视频暂时无法载入，请稍后重试。');
        }
        video.setAttribute('data-ready', '1');
      }

      function play() {
        attach();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            showPlayerMessage(box, '点击播放器即可继续播放。');
          });
        }
      }

      button.addEventListener('click', play);
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        box.classList.remove('is-playing');
      });
    });
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim().toLowerCase();
    var input = document.querySelector('.page-search input[name="q"]');
    if (input) {
      input.value = params.get('q') || '';
    }
    var pool = window.SEARCH_DATA;
    var matches = query ? pool.filter(function (item) {
      return item.text.toLowerCase().indexOf(query) !== -1;
    }).slice(0, 120) : pool.slice(0, 60);
    var note = document.querySelector('.search-result-note');
    if (note) {
      note.textContent = query ? '搜索结果：' + (params.get('q') || '') : '近期精选影片';
    }
    results.innerHTML = matches.map(function (item) {
      return [
        '<article class="movie-card">',
        '  <a href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">',
        '    <div class="poster-frame">',
        '      <span class="poster-text">' + escapeHtml(item.title) + '</span>',
        '      <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.remove();">',
        '      <span class="type-badge">' + escapeHtml(item.type) + '</span>',
        '    </div>',
        '    <div class="movie-card-body">',
        '      <h3>' + escapeHtml(item.title) + '</h3>',
        '      <div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
        '      <p>' + escapeHtml(item.oneLine) + '</p>',
        '      <div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initPlayers();
    initSearchPage();
  });
}());
