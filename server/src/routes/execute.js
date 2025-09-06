// backend/src/routes/execute.js
const express = require('express');
const router = express.Router();
const { runCode, getRuntimes } = require('../services/piston');

// List available runtimes (optional, handy for a dropdown)
router.get('/runtimes', async (_req, res) => {
  try {
    const data = await getRuntimes();
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// Execute code
router.post('/execute', async (req, res) => {
  try {
    const { language, code, stdin } = req.body || {};
    if (!language || typeof language !== 'string') {
      return res.status(400).json({ error: 'language required' });
    }
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'code required' });
    }
    const result = await runCode({ language, code, stdin });
    res.json(result);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

module.exports = router;
