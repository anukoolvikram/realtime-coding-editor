// backend/src/services/piston.js
const PISTON_URL = process.env.PISTON_URL || 'https://emkc.org/api/v2/piston';

let runtimesCache = { at: 0, data: [] };
const TEN_MIN = 10 * 60 * 1000;

const aliases = {
  js: 'javascript',
  node: 'javascript',
  py: 'python',
  cplusplus: 'cpp',
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
  if (!force && now - runtimesCache.at < TEN_MIN && runtimesCache.data.length) {
    return runtimesCache.data;
  }
  const data = await fetchJSON(`${PISTON_URL}/runtimes`);
  runtimesCache = { at: now, data };
  return data;
}

/** Pick the latest version available for a language */
async function pickVersion(language) {
  const lang = normalizeLanguage(language);
  const runtimes = await getRuntimes();
  const list = runtimes.filter(r => r.language === lang);
  if (!list.length) {
    throw new Error(`Unsupported language: ${lang}`);
  }
  // versions are strings; take last since Piston returns latest last (usually)
  const latest = list[list.length - 1];
  return { language: lang, version: latest.version };
}

/** Execute code via Piston */
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

  // Normalize the shape a bit
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
