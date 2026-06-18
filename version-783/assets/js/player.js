(function () {
  function setupPlayer() {
    var video = document.querySelector('[data-player]');
    var cover = document.querySelector('[data-player-cover]');
    var playButton = document.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var mounted = false;
    var hlsInstance = null;

    function mount() {
      if (mounted || !stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        mounted = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        mounted = true;
        return;
      }

      video.src = stream;
      mounted = true;
    }

    function start() {
      mount();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      video.controls = true;
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.stopPropagation();
        start();
      });
    }

    video.addEventListener('play', mount);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', setupPlayer);
})();
