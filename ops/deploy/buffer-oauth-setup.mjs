#!/usr/bin/env node
import http from 'http';
import url from 'url';

const CLIENT_ID = 'smIO-dIMcoL6KXpFNiCXrP7l3lSHAIWuDcISGF-mRxv';
const CLIENT_SECRET = 'Ph_Szb614E7KaLBK6jclGFoIwjseOgrqamBUqXFqCTod6jAzNXIPF_VCsUOnUl7f6d7yTshqWmF3PTEkN8-eFg';
const REDIRECT_URI = 'http://localhost:3000/callback';

console.log(`Visit: https://buffer.com/developers/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`);

const server = http.createServer(async (req, res) => {
  const queryUrl = url.parse(req.url, true);
  const code = queryUrl.query.code;

  if (!code) {
    res.writeHead(400);
    res.end('No code');
    return;
  }

  try {
    const tokenRes = await fetch('https://api.bufferapp.com/oauth2/token.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      }).toString(),
    });

    const data = await tokenRes.json();
    res.end(`Token: ${data.refresh_token}`);
    console.log(data.refresh_token);
    process.exit(0);
  } catch (e) {
    res.end(e.message);
    process.exit(1);
  }
});

server.listen(3000);
