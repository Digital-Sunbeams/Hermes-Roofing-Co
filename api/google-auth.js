// One-time OAuth helper: visit /api/google-auth, sign in with the Google account that
// owns the Business Profile, approve, and copy the refresh token it shows into Vercel
// as GOOGLE_OAUTH_REFRESH_TOKEN. Requires GOOGLE_OAUTH_CLIENT_ID and
// GOOGLE_OAUTH_CLIENT_SECRET to be set first (see README).

export default async function handler(req, res) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(200).send('Add GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in Vercel, redeploy, then reload this page.');
  }
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const redirectUri = `https://${host}/api/google-auth`;
  const code = req.query && req.query.code;

  if (!code) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/business.manage',
      access_type: 'offline',
      prompt: 'consent',
    });
    res.writeHead(302, { Location: 'https://accounts.google.com/o/oauth2/v2/auth?' + params });
    return res.end();
  }

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
  });
  const data = await r.json();
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (!data.refresh_token) {
    return res.status(200).send(`<p style="font-family:sans-serif">No refresh token was returned (${data.error || 'unknown'}). Remove this app at myaccount.google.com/permissions, then visit /api/google-auth again.</p>`);
  }
  return res.status(200).send(`<div style="font-family:sans-serif;max-width:720px;margin:40px auto">
    <h2>Success. Copy this into Vercel as <code>GOOGLE_OAUTH_REFRESH_TOKEN</code>, then redeploy.</h2>
    <textarea style="width:100%;height:90px;font-size:14px">${data.refresh_token}</textarea>
    <p>This page will not show the token again. If you lose it, repeat the sign-in.</p></div>`);
}
