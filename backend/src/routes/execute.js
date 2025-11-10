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

// Regular execution endpoint
router.post('/execute', async (req, res) => {
  try {
    const { language, code, stdin, timeoutMs } = req.body || {};
    if (!isNonEmptyString(language)) return res.status(400).json({ error: 'language required' });
    if (!isNonEmptyString(code)) return res.status(400).json({ error: 'code required' });
    if (code.length > MAX_CODE_CHARS) return res.status(413).json({ error: 'code too large' });

    const result = await runCode({ 
      language, 
      code, 
      stdin: typeof stdin === 'string' ? stdin : '', 
      timeoutMs: Number(timeoutMs) || 5000 
    });

    res.json(result);
  } catch (e) {
    res.status(502).json({ error: e.message || 'execution failed' });
  }
});

// Streaming execution endpoint (SSE)
router.post('/execute-stream', async (req, res) => {
  try {
    const { language, code, stdin, timeoutMs } = req.body || {};
    
    if (!isNonEmptyString(language)) {
      return res.status(400).json({ error: 'language required' });
    }
    if (!isNonEmptyString(code)) {
      return res.status(400).json({ error: 'code required' });
    }
    if (code.length > MAX_CODE_CHARS) {
      return res.status(413).json({ error: 'code too large' });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Helper to send SSE events
    const sendEvent = (type, data) => {
      res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
    };

    try {
      // Execute the code
      const result = await runCode({ 
        language, 
        code, 
        stdin: typeof stdin === 'string' ? stdin : '', 
        timeoutMs: Number(timeoutMs) || 5000 
      });

      // Stream stdout if present
      if (result.stdout) {
        sendEvent('stdout', { content: result.stdout });
      }

      // Stream stderr if present
      if (result.stderr) {
        sendEvent('stderr', { content: result.stderr });
      }

      // Send completion event
      sendEvent('complete', { 
        exitCode: result.exitCode,
        time: result.time,
        memory: result.memory
      });

    } catch (execError) {
      sendEvent('error', { content: execError.message });
    }

    res.end();

  } catch (e) {
    // If headers not sent yet, send JSON error
    if (!res.headersSent) {
      res.status(502).json({ error: e.message || 'execution failed' });
    } else {
      // Send error event if streaming already started
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        content: e.message || 'execution failed' 
      })}\n\n`);
      res.end();
    }
  }
});

module.exports = router;