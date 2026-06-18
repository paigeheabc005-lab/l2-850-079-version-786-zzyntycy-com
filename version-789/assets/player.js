(function () {
  function mount(src) {
    var video = document.getElementById("movie-video");
    var shell = document.querySelector("[data-player]");
    var overlay = document.querySelector(".player-overlay");
    if (!video || !shell || !overlay || !src) {
      return;
    }
    var loaded = false;
    var start = function () {
      if (loaded) {
        video.play().catch(function () {});
        return;
      }
      loaded = true;
      overlay.classList.add("hidden");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", function () {
          video.play().catch(function () {});
        }, { once: true });
        video.load();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ maxBufferLength: 30 });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }
      video.src = src;
      video.play().catch(function () {});
    };
    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!loaded) {
        start();
      }
    });
  }
  window.MoviePlayer = {
    mount: mount
  };
})();
