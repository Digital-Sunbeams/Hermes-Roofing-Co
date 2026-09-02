// Vercel serverless function: /api/reviews
// Fetches live reviews from the Google Places API (Place Details).
//
// Required environment variables (set in Vercel > Project > Settings > Environment Variables):
//   GOOGLE_PLACES_API_KEY  - a Google Cloud API key with "Places API" enabled
//   GOOGLE_PLACE_ID        - the business's Place ID (see README for how to find it)
//
// Notes:
// - The Places API returns a maximum of 5 reviews per request. That is enough
//   for the homepage (1 featured + up to 4 cards).
// - Responses are cached at the edge for 6 hours to keep API costs near zero.

export default async function handler(req, res) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!key || !placeId) {
    return res.status(200).json({ ok: false, reason: 'not_configured' });
  }

  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'name,rating,user_ratings_total,reviews',
    reviews_sort: 'newest',
    key,
  });

  try {
    const r = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
    const data = await r.json();

    if (data.status !== 'OK' || !data.result) {
      return res.status(200).json({ ok: false, reason: data.status || 'no_result' });
    }

    const { rating, user_ratings_total: total, reviews = [] } = data.result;

    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json({
      ok: true,
      rating,
      total,
      reviews: reviews.map((v) => ({
        author: v.author_name,
        rating: v.rating,
        text: v.text,
        when: v.relative_time_description,
      })),
    });
  } catch (err) {
    return res.status(200).json({ ok: false, reason: 'fetch_error' });
  }
}
