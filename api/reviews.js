// /api/reviews
// Source 1 (preferred): Google Business Profile API using the owner's account.
//   Returns ALL reviews, curated by data/reviews-config.js. Needs:
//   GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN
//   (plus Google's approval of Business Profile API access for the project).
// Source 2 (fallback): Places API, max 5 reviews. Needs:
//   GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID
// Cached at the edge for 6 hours.

import config from '../data/reviews-config.js';

const CREW = ['Peter', 'Landon', 'Jesse', 'Corey', 'Lindsay'];
const STARS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

function monthYear(iso) {
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

async function fromBusinessProfile() {
  const { GOOGLE_OAUTH_CLIENT_ID: id, GOOGLE_OAUTH_CLIENT_SECRET: secret, GOOGLE_OAUTH_REFRESH_TOKEN: refresh } = process.env;
  if (!id || !secret || !refresh) return { ok: false, reason: 'gbp_not_configured' };

  const tok = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: id, client_secret: secret, refresh_token: refresh, grant_type: 'refresh_token' }),
  }).then((r) => r.json());
  if (!tok.access_token) return { ok: false, reason: 'gbp_token_failed: ' + (tok.error_description || tok.error || '') };
  const h = { Authorization: 'Bearer ' + tok.access_token };

  const acc = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', { headers: h }).then((r) => r.json());
  const account = acc.accounts && acc.accounts[0];
  if (!account) return { ok: false, reason: 'gbp_no_account: ' + (acc.error ? acc.error.message : '') };

  const loc = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title`, { headers: h }).then((r) => r.json());
  const locations = loc.locations || [];
  const wanted = process.env.GBP_LOCATION_NAME;
  const location = wanted ? locations.find((l) => l.name.endsWith(wanted)) : locations[0];
  if (!location) return { ok: false, reason: 'gbp_no_location: ' + (loc.error ? loc.error.message : '') };
  const locId = location.name.split('/')[1];

  let all = [], pageToken, total = 0, avg = 0;
  do {
    const u = new URL(`https://mybusiness.googleapis.com/v4/${account.name}/locations/${locId}/reviews`);
    u.searchParams.set('pageSize', '50');
    if (pageToken) u.searchParams.set('pageToken', pageToken);
    const rv = await fetch(u, { headers: h }).then((r) => r.json());
    if (rv.error) return { ok: false, reason: 'gbp_reviews: ' + rv.error.message };
    all = all.concat(rv.reviews || []);
    total = rv.totalReviewCount || total;
    avg = rv.averageRating || avg;
    pageToken = rv.nextPageToken;
  } while (pageToken && all.length < 300);

  const hide = new Set(config.hide || []);
  const featureOrder = config.feature || [];
  let reviews = all
    .map((r) => ({
      id: r.reviewId,
      author: r.reviewer ? r.reviewer.displayName : 'Google user',
      rating: STARS[r.starRating] || 0,
      text: r.comment || '',
      when: monthYear(r.createTime),
      created: r.createTime,
      featured: featureOrder.includes(r.reviewId),
    }))
    .filter((r) => r.text && r.rating >= (config.minRating || 1) && !hide.has(r.id));

  const crew = (t) => CREW.some((n) => new RegExp('\\b' + n + '\\b').test(t));
  reviews.sort((a, b) => {
    const fa = featureOrder.indexOf(a.id), fb = featureOrder.indexOf(b.id);
    if (fa !== -1 || fb !== -1) return (fa === -1 ? 999 : fa) - (fb === -1 ? 999 : fb);
    const ca = crew(a.text) ? 1 : 0, cb = crew(b.text) ? 1 : 0;
    if (ca !== cb) return cb - ca;
    return new Date(b.created) - new Date(a.created);
  });
  reviews = reviews.slice(0, config.maxReviews || 20).map(({ created, ...r }) => r);

  return { ok: true, source: 'gbp', rating: avg || null, total: total || all.length, reviews };
}

async function fromPlaces() {
  const key = process.env.GOOGLE_PLACES_API_KEY, placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) return { ok: false, reason: 'places_not_configured' };
  const params = new URLSearchParams({ place_id: placeId, fields: 'rating,user_ratings_total,reviews', reviews_sort: 'newest', key });
  const data = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`).then((r) => r.json());
  if (data.status !== 'OK' || !data.result) return { ok: false, reason: 'places_' + (data.status || 'error') };
  const { rating, user_ratings_total: total, reviews = [] } = data.result;
  return { ok: true, source: 'places', rating, total, reviews: reviews.map((v) => ({ author: v.author_name, rating: v.rating, text: v.text, when: v.relative_time_description })) };
}

export default async function handler(req, res) {
  try {
    const gbp = await fromBusinessProfile();
    if (gbp.ok) {
      res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
      return res.status(200).json(gbp);
    }
    const places = await fromPlaces();
    if (places.ok) {
      res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
      return res.status(200).json({ ...places, note: gbp.reason });
    }
    return res.status(200).json({ ok: false, reason: gbp.reason + ' | ' + places.reason });
  } catch (err) {
    return res.status(200).json({ ok: false, reason: 'fetch_error' });
  }
}
