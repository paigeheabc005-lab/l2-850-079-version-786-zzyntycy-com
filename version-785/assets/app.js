(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.menu-toggle');
    if (toggle && header) {
        toggle.addEventListener('click', function () {
            header.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    var activeIndex = 0;
    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
            slide.classList.toggle('is-active', itemIndex === activeIndex);
        });
        dots.forEach(function (dot, itemIndex) {
            dot.classList.toggle('is-active', itemIndex === activeIndex);
        });
    }
    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });
    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
        var input = filterPanel.querySelector('[data-search-input]');
        var region = filterPanel.querySelector('[data-region-filter]');
        var type = filterPanel.querySelector('[data-type-filter]');
        var year = filterPanel.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var empty = document.querySelector('[data-filter-empty]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (query && input) {
            input.value = query;
        }
        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }
        function applyFilter() {
            var term = normalize(input && input.value);
            var regionValue = normalize(region && region.value);
            var typeValue = normalize(type && type.value);
            var yearValue = normalize(year && year.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-tags'));
                var passTerm = !term || haystack.indexOf(term) !== -1;
                var passRegion = !regionValue || normalize(card.getAttribute('data-region')) === regionValue;
                var passType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
                var passYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
                var pass = passTerm && passRegion && passType && passYear;
                card.style.display = pass ? '' : 'none';
                if (pass) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }
        [input, region, type, year].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilter);
                element.addEventListener('change', applyFilter);
            }
        });
        applyFilter();
    }
}());
