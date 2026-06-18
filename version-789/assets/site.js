(function () {
  var root = document.documentElement.getAttribute("data-root") || "./";
  function esc(value) {
    return String(value || "").replace(/[&<>"']/g, function (ch) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[ch];
    });
  }
  function linkTo(path) {
    return root + String(path || "").replace(/^\/+/, "");
  }
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("active");
    });
  }
  var searchBox = document.querySelector("[data-search-box]");
  var searchResults = document.querySelector("[data-search-results]");
  if (searchBox && searchResults) {
    searchBox.addEventListener("input", function () {
      var value = searchBox.value.trim().toLowerCase();
      if (!value) {
        searchResults.classList.remove("active");
        searchResults.innerHTML = "";
        return;
      }
      var list = (window.__MOVIE_INDEX__ || []).filter(function (item) {
        return (item.t + " " + item.c + " " + item.y + " " + item.g).toLowerCase().indexOf(value) !== -1;
      }).slice(0, 12);
      if (!list.length) {
        searchResults.innerHTML = '<div class="search-empty">未找到匹配内容</div>';
        searchResults.classList.add("active");
        return;
      }
      searchResults.innerHTML = list.map(function (item) {
        return '<a href="' + linkTo(item.u) + '"><strong>' + esc(item.t) + '</strong><span>' + esc(item.c) + ' · ' + esc(item.y) + ' · ' + esc(item.g) + '</span></a>';
      }).join("");
      searchResults.classList.add("active");
    });
    document.addEventListener("click", function (event) {
      if (!searchResults.contains(event.target) && event.target !== searchBox) {
        searchResults.classList.remove("active");
      }
    });
  }
  var filterInput = document.querySelector("[data-filter-input]");
  var filterCount = document.querySelector("[data-filter-count]");
  var emptyBox = document.querySelector("[data-empty]");
  if (filterInput) {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var update = function () {
      var query = filterInput.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search-text") || "").toLowerCase();
        var ok = !query || text.indexOf(query) !== -1;
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (filterCount) {
        filterCount.textContent = visible ? "已显示 " + visible + " 部" : "暂无匹配";
      }
      if (emptyBox) {
        emptyBox.classList.toggle("active", visible === 0);
      }
    };
    filterInput.addEventListener("input", update);
    update();
  }
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  if (slides.length > 1) {
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    setInterval(function () {
      show(current + 1);
    }, 5200);
    show(0);
  }
})();
