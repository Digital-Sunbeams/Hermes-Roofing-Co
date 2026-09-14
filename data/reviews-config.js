// Review curation for the live Google Business Profile feed.
// Edit and push; the site refreshes from Google automatically (6-hour cache).
export default {
  minRating: 5,        // only show reviews with at least this many stars
  maxReviews: 20,      // how many to show on the page (featured + grid)
  hide: [              // review IDs to never show (get IDs from /api/reviews)
  ],
  feature: [           // review IDs to pin at the top, in order
  ],
};
