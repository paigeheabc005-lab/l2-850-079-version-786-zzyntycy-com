function ready(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

ready(function () {
  initNavigation();
  initFeatureCarousels();
  initRails();
  initFilters();
});

function initNavigation() {
  var toggle = document.querySelector("[data-nav-toggle]");
  var menu = document.querySelector("[data-mobile-nav]");
  if (!toggle || !menu) {
    return;
  }
  toggle.addEventListener("click", function () {
    menu.classList.toggle("is-open");
  });
}

function initFeatureCarousels() {
  document.querySelectorAll("[data-feature-carousel]").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-feature-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-feature-dot]"));
    var prev = carousel.querySelector("[data-feature-prev]");
    var next = carousel.querySelector("[data-feature-next]");
    var index = 0;
    var timer = null;
    if (!slides.length) {
      return;
    }
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  });
}

function initRails() {
  document.querySelectorAll("[data-scroll-rail]").forEach(function (rail) {
    var section = rail.closest("section");
    if (!section) {
      return;
    }
    var left = section.querySelector("[data-scroll-left]");
    var right = section.querySelector("[data-scroll-right]");
    if (left) {
      left.addEventListener("click", function () {
        rail.scrollBy({ left: -420, behavior: "smooth" });
      });
    }
    if (right) {
      right.addEventListener("click", function () {
        rail.scrollBy({ left: 420, behavior: "smooth" });
      });
    }
  });
}

function initFilters() {
  document.querySelectorAll(".filter-panel").forEach(function (panel) {
    var target = panel.getAttribute("data-filter-target");
    var grid = target ? document.querySelector(target) : null;
    if (!grid) {
      return;
    }
    var input = panel.querySelector("[data-filter-input]");
    var genre = panel.querySelector("[data-filter-genre]");
    var year = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var genreValue = genre ? genre.value.trim() : "";
      var yearValue = year ? year.value.trim() : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-filter") || "").toLowerCase();
        var cardGenre = card.getAttribute("data-genre") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var hitKeyword = !keyword || text.indexOf(keyword) !== -1;
        var hitGenre = !genreValue || cardGenre.indexOf(genreValue) !== -1;
        var hitYear = !yearValue || cardYear.indexOf(yearValue) !== -1;
        card.classList.toggle("is-filter-hidden", !(hitKeyword && hitGenre && hitYear));
      });
    }
    [input, genre, year].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
  });
}

function initVideoPlayer(videoId, buttonId, streamUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var hls = null;
  var loaded = false;
  if (!video || !button || !streamUrl) {
    return;
  }
  function load() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }
  function play() {
    load();
    button.classList.add("is-hidden");
    var attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }
  button.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });
  video.addEventListener("pause", function () {
    if (!video.ended) {
      button.classList.remove("is-hidden");
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
