const express = require('express');
const path = require('path');
const app = express();
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
  next();
});

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// Unknown paths get an honest 404, not the homepage with a 200.
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, () => {
  console.log('The Bear\'s Den is alive on port ' + PORT);
});
