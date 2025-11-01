const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static folders
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(__dirname)); // fallback

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.get('/shades', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'shades.html'));
});

app.get('/gradient', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'gradient.html'));
});

app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'terms.html'));
});

app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'privacy.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
