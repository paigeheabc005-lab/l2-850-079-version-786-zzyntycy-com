(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var primaryNav = document.querySelector('[data-primary-nav]');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      primaryNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    if (slides.length > 1) {
      startHero();
    }
  }

  var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));

  inputs.forEach(function (input) {
    var panel = input.closest('.content-section') || document;
    var scope = panel.querySelector('[data-search-scope]') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .category-tile'));
    var clearButton = panel.querySelector('[data-clear-search]');

    function filterCards() {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-title') || card.textContent || '').toLowerCase();
        card.classList.toggle('is-hidden', keyword !== '' && haystack.indexOf(keyword) === -1);
      });
    }

    input.addEventListener('input', filterCards);

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        input.value = '';
        filterCards();
        input.focus();
      });
    }
  });

  function attachStream(video, shell) {
    var stream = video.getAttribute('data-stream');

    if (!stream || video.getAttribute('data-ready') === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.setAttribute('data-ready', 'true');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      video.setAttribute('data-ready', 'true');
      return;
    }

    video.src = stream;
    video.setAttribute('data-ready', 'true');
  }

  function playVideo(video, shell) {
    attachStream(video, shell);
    shell.classList.add('is-playing');
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        shell.classList.remove('is-playing');
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-start');

    if (!video || !button) {
      return;
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      playVideo(video, shell);
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo(video, shell);
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        shell.classList.remove('is-playing');
      }
    });

    video.addEventListener('ended', function () {
      shell.classList.remove('is-playing');
    });
  });
})();
