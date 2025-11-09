const TEN_MIN = 10 * 60 * 1000;

const cfg = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  PISTON_URL: process.env.PISTON_URL || 'https://emkc.org/api/v2/piston',
  RUNTIMES_TTL_MS: parseInt(process.env.RUNTIMES_TTL_MS || TEN_MIN, 10),
  MAX_CODE_CHARS: parseInt(process.env.MAX_CODE_CHARS || '10000', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
  CORS_ORIGINS: (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

module.exports = cfg;
