const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 3000;
const CSP = [
  "default-src 'self'",
  "script-src 'none'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests"
].join('; ');

app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// /zine and /forge have no index page of their own; send them to their
// homepage sections instead of a 404.
app.get(['/zine', '/zine/'], (req, res) => res.redirect(302, '/#zine'));
app.get(['/forge', '/forge/'], (req, res) => res.redirect(302, '/#forge'));

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// Unknown paths get an honest 404, not the homepage with a 200.
// The page is read once at startup and served from memory, so a flood of
// unknown paths never touches the disk.
const NOT_FOUND_PAGE = fs.readFileSync(path.join(__dirname, 'public', '404.html'));
app.use((req, res) => {
  res.status(404)
    .set('Content-Type', 'text/html; charset=UTF-8')
    .set('Cache-Control', 'public, max-age=0')
    .send(NOT_FOUND_PAGE);
});

app.listen(PORT, () => {
  console.log('The Bear\'s Den is alive on port ' + PORT);
});
