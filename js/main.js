function toArr(list) { return Array.prototype.slice.call(list); }

/* Hermes Roofing Company — nav + live Google reviews */

(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();

/* ---------- Reviews ----------
   1. Try /api/reviews (live Google Places data — requires env vars, see README).
   2. If unavailable, try /data/reviews-fallback.json, which only renders when
      "approved": true AND every entry has "verbatim": true. This prevents
      placeholder text from ever appearing on the live site.
   3. If neither is available, the section shows the rating badge and the
      "Read all our reviews on Google" button only.
------------------------------------------------ */

(function () {
  var featuredSlot = document.getElementById('review-featured-slot');
  var grid = document.getElementById('review-grid');
  var ratingLine = document.getElementById('rating-line');
  var note = document.getElementById('reviews-note');
  if (!featuredSlot || !grid) return;

  if (typeof fetch === 'undefined') return;

  var CREW = ['Peter', 'Landon', 'Jesse', 'Corey', 'Lindsay'];

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function starRow(n) {
    var out = '';
    for (var i = 0; i < 5; i++) out += i < n ? '\u2605' : '\u2606';
    return out;
  }

  function highlightCrew(text) {
    var safe = esc(text);
    CREW.forEach(function (name) {
      safe = safe.replace(new RegExp('\\b(' + name + ')\\b', 'g'), '<span class="crew-name">$1</span>');
    });
    return safe;
  }

  function mentionsCrew(text) {
    return CREW.some(function (n) { return new RegExp('\\b' + n + '\\b').test(text || ''); });
  }

  function trim(text, max) {
    if (!text) return '';
    if (text.length <= max) return text;
    var cut = text.slice(0, max);
    var lastSpace = cut.lastIndexOf(' ');
    return cut.slice(0, lastSpace > 0 ? lastSpace : max) + '\u2026';
  }

  function render(payload, sourceLabel) {
    var reviews = (payload.reviews || []).filter(function (r) { return r.rating >= 4 && r.text; });
    if (!reviews.length) return false;

    // Featured pick: metal detector story > crew mention > longest review.
    var featured =
      reviews.find(function (r) { return /metal detector/i.test(r.text); }) ||
      reviews.find(function (r) { return mentionsCrew(r.text); }) ||
      reviews.slice().sort(function (a, b) { return (b.text || '').length - (a.text || '').length; })[0];

    var rest = reviews.filter(function (r) { return r !== featured; });
    rest.sort(function (a, b) { return (mentionsCrew(b.text) ? 1 : 0) - (mentionsCrew(a.text) ? 1 : 0); });

    featuredSlot.innerHTML =
      '<figure class="review-featured">' +
      '<span class="tag">Featured review</span> ' +
      '<span class="stars" aria-label="' + featured.rating + ' out of 5 stars">' + starRow(featured.rating) + '</span>' +
      '<blockquote>&ldquo;' + highlightCrew(trim(featured.text, 320)) + '&rdquo;</blockquote>' +
      '<figcaption class="review-meta">' + esc(featured.author) + (featured.when ? ' &middot; ' + esc(featured.when) : '') + ' &middot; ' + sourceLabel + '</figcaption>' +
      '</figure>';

    grid.innerHTML = rest.map(function (r) {
      return '<figure class="review-card">' +
        '<span class="stars" aria-label="' + r.rating + ' out of 5 stars">' + starRow(r.rating) + '</span>' +
        '<p>&ldquo;' + highlightCrew(trim(r.text, 220)) + '&rdquo;</p>' +
        '<figcaption class="review-meta">' + esc(r.author) + (r.when ? ' &middot; ' + esc(r.when) : '') + ' &middot; ' + sourceLabel + '</figcaption>' +
        '</figure>';
    }).join('');

    if (ratingLine && payload.rating) {
      ratingLine.textContent = payload.rating.toFixed(1) + ' on Google' +
        (payload.total ? ' \u00b7 ' + payload.total + ' reviews' : '');
    }
    return true;
  }

  function getJSON(url) {
    return fetch(url)
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  // Live Google reviews (max 5 from the API) merge with owner-approved verbatim
  // reviews from the fallback file, deduplicated, and ALL of them render on the
  // page in a stacked grid. Nothing is hidden behind a carousel.
  getJSON('/api/reviews').then(function (api) {
    getJSON('/data/reviews-fallback.json').then(function (fb) {
      var apiOk = api && api.ok;
      var fbOk = fb && fb.approved === true &&
        (fb.reviews || []).length &&
        (fb.reviews || []).every(function (r) { return r.verbatim === true; });

      var list = [];
      if (apiOk) list = list.concat(api.reviews || []);
      if (fbOk) list = list.concat(fb.reviews || []);

      var seen = {}, merged = [];
      list.forEach(function (r) {
        var key = String(r.text || '').toLowerCase().replace(/\s+/g, ' ').slice(0, 60);
        if (!key || seen[key]) return;
        seen[key] = 1;
        merged.push(r);
      });
      if (!merged.length) return; // section stays minimal until real reviews exist

      render({
        reviews: merged,
        rating: (apiOk && api.rating) || (fbOk && fb.rating) || null,
        total: (apiOk && api.total) || (fbOk && fb.total) || null
      }, 'Google review');
      if (note) note.textContent = '';
    });
  });
})();

/* ---------- Modernization: motion, counters, header, slider, filters ---------- */

(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveals
  var revealEls = toArr(document.querySelectorAll('.reveal'));
  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // Stat counters
  var nums = toArr(document.querySelectorAll('.stat .num[data-count]'));
  function animate(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduced) { el.textContent = target.toFixed(dec) + suffix; return; }
    el.textContent = (0).toFixed(dec) + suffix;
    var start = null, dur = 1100;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(dec) + suffix;
    }
    requestAnimationFrame(tick);
  }
  if (nums.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      nums.forEach(animate);
    } else {
      var nio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { animate(e.target); nio.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      nums.forEach(function (el) { nio.observe(el); });
    }
  }

  // Header shadow on scroll
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Before/after slider: only reveals when both real photos exist
  var section = document.getElementById('before-after');
  var slider = document.getElementById('ba');
  if (section && slider) {
    var imgs = toArr(slider.querySelectorAll('img'));
    var loaded = 0, failed = false;
    imgs.forEach(function (img) {
      var probe = new Image();
      probe.onload = function () { loaded++; if (loaded === imgs.length && !failed) initSlider(); };
      probe.onerror = function () { failed = true; };
      probe.src = img.src;
    });
    function initSlider() {
      section.hidden = false;
      var after = slider.querySelector('.ba-after');
      var handle = slider.querySelector('.ba-handle');
      function setPos(pct) {
        pct = Math.max(4, Math.min(96, pct));
        after.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
        handle.style.left = pct + '%';
      }
      setPos(50);
      var dragging = false;
      function move(clientX) {
        var r = slider.getBoundingClientRect();
        setPos(((clientX - r.left) / r.width) * 100);
      }
      slider.addEventListener('pointerdown', function (e) { dragging = true; move(e.clientX); });
      window.addEventListener('pointermove', function (e) { if (dragging) move(e.clientX); });
      window.addEventListener('pointerup', function () { dragging = false; });
    }
  }

  // Gallery filters
  var grid = document.getElementById('gallery-grid');
  var btns = toArr(document.querySelectorAll('.filter-btn'));
  if (grid && btns.length) {
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        var f = btn.getAttribute('data-filter');
        toArr(grid.querySelectorAll('figure')).forEach(function (fig) {
          var tags = fig.getAttribute('data-tags') || '';
          fig.style.display = (f === 'all' || tags.indexOf(f) !== -1) ? '' : 'none';
        });
      });
    });
  }
})();
