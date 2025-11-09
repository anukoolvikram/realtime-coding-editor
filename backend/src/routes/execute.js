const express = require('express');
const router = express.Router();
const { runCode, getRuntimes } = require('../services/piston');
const { isNonEmptyString } = require('../utils/validators');
const { MAX_CODE_CHARS } = require('../config');

router.get('/runtimes', async (req, res) => {
  try {
    const force = req.query.force === '1' || req.query.force === 'true';
    const data = await getRuntimes(force);
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

router.post('/execute', async (req, res) => {
  try {
    const { language, code, stdin, timeoutMs } = req.body || {};
    if (!isNonEmptyString(language)) return res.status(400).json({ error: 'language required' });
    if (!isNonEmptyString(code)) return res.status(400).json({ error: 'code required' });
    if (code.length > MAX_CODE_CHARS) return res.status(413).json({ error: 'code too large' });

    const result = await runCode({ language, code, stdin: typeof stdin === 'string' ? stdin : '', timeoutMs: Number(timeoutMs) || 5000 });

    res.json(result);
  } catch (e) {
    res.status(502).json({ error: e.message || 'execution failed' });
  }
});

module.exports = router;
