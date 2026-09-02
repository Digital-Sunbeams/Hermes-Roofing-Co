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
    rest = rest.slice(0, 4);

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

  function tryFallback() {
    fetch('/data/reviews-fallback.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || data.approved !== true) return;
        var allVerbatim = (data.reviews || []).every(function (r) { return r.verbatim === true; });
        if (!allVerbatim) return;
        render(data, 'Google review');
      })
      .catch(function () { /* section stays minimal */ });
  }

  fetch('/api/reviews')
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (data && data.ok && render(data, 'Google review')) {
        if (note) note.textContent = '';
        return;
      }
      tryFallback();
    })
    .catch(tryFallback);
})();
