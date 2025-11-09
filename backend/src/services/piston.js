// src/services/piston.js
const fetch = require('node-fetch'); // Import node-fetch for pre-v18 Node.js

const PISTON_URL = process.env.PISTON_URL || 'https://emkc.org/api/v2/piston';
const TEN_MIN = 10 * 60 * 1000;

let runtimesCache = {
  at: 0,
  data: [],
  promise: null,
};

// This is the corrected map
const aliases = {
  js: 'javascript',
  node: 'javascript',
  py: 'python',
  cpp: 'c++', 
};

function normalizeLanguage(lang = '') {
  const key = lang.trim().toLowerCase();
  return aliases[key] || key;
}

async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
}

async function getRuntimes(force = false) {
  const now = Date.now();
  if (!force && runtimesCache.promise) {
    return runtimesCache.promise;
  }

  if (!force && now - runtimesCache.at < TEN_MIN && runtimesCache.data.length) {
    return runtimesCache.data;
  }

  try {
    runtimesCache.promise = fetchJSON(`${PISTON_URL}/runtimes`);
    const data = await runtimesCache.promise;
    runtimesCache = { at: now, data, promise: null };
    return data;
  } catch (error) {
    console.error('Piston API fetch failed:', error.message);
    runtimesCache.promise = null;
    if (runtimesCache.data.length) return runtimesCache.data;
    throw error;
  }
}

async function pickVersion(language) {
  const lang = normalizeLanguage(language);
  console.log(`[DEBUG] Language normalized: '${language}' -> '${lang}'`);
  const runtimes = await getRuntimes();
  const list = runtimes.filter(r => r.language === lang);
  
  if (!list.length) {
    throw new Error(`Unsupported language: ${lang}`);
  }
  const latest = list[list.length - 1];
  return { language: lang, version: latest.version };
}

async function runCode({ language, code, stdin = '' }) {
  const { language: lang, version } = await pickVersion(language);
  const payload = {
    language: lang,
    version,
    files: [{ name: 'main', content: code }],
    stdin,
  };

  const body = JSON.stringify(payload);
  const result = await fetchJSON(`${PISTON_URL}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  const run = result.run || {};
  return {
    language: lang,
    version,
    stdout: run.stdout || '',
    stderr: run.stderr || '',
    output: run.output || '',
    exitCode: run.code ?? null,
    signal: run.signal || null,
    time: run.time ?? run.cpu_time ?? null,
    memory: run.memory ?? null,
  };
}

module.exports = { runCode, getRuntimes, normalizeLanguage };