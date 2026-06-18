document.addEventListener('DOMContentLoaded', function () {
  var navToggle = document.querySelector('.nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    window.setInterval(function () {
      showSlide((current + 1) % slides.length);
    }, 5600);
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var keywordInput = filterRoot.querySelector('[data-filter-keyword]');
    var regionInput = filterRoot.querySelector('[data-filter-region]');
    var typeInput = filterRoot.querySelector('[data-filter-type]');
    var yearInput = filterRoot.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-filter-card]'));
    var countNode = filterRoot.querySelector('[data-filter-count]');
    var emptyNode = filterRoot.querySelector('[data-filter-empty]');
    var applyFilter = function () {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var region = regionInput ? regionInput.value : '';
      var type = typeInput ? typeInput.value : '';
      var year = yearInput ? yearInput.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var search = card.getAttribute('data-search') || '';
        var ok = true;
        if (keyword && search.indexOf(keyword) === -1) {
          ok = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          ok = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          ok = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (countNode) {
        countNode.textContent = '当前显示 ' + visible + ' 部内容';
      }
      if (emptyNode) {
        emptyNode.style.display = visible === 0 ? 'block' : 'none';
      }
    };
    [keywordInput, regionInput, typeInput, yearInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', applyFilter);
        input.addEventListener('change', applyFilter);
      }
    });
    applyFilter();
  }

  var player = document.querySelector('[data-player]');
  if (player) {
    var video = player.querySelector('video');
    var startButton = player.querySelector('.player-start');
    var stream = player.getAttribute('data-stream');
    var hlsInstance = null;
    var ready = false;

    var bindSource = function () {
      if (ready || !video || !stream) {
        return;
      }
      ready = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else {
        video.src = stream;
      }
    };

    var startPlayback = function () {
      bindSource();
      player.classList.add('is-ready');
      video.controls = true;
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    };

    if (startButton) {
      startButton.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready) {
          startPlayback();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
});
