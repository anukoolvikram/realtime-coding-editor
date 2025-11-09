function isNonEmptyString(s) {
  return typeof s === 'string' && s.trim().length > 0;
}

function sanitizeRoomId(id) {
  if (!isNonEmptyString(id)) return null;
  const cleaned = id.trim().slice(0, 100).replace(/[^A-Za-z0-9_\-:]/g, '');
  return cleaned || null;
}

function sanitizeUsername(name) {
  if (!isNonEmptyString(name)) return 'Anonymous';
  return name.trim().slice(0, 32).replace(/[^\w\- ]/g, '');
}

module.exports = { isNonEmptyString, sanitizeRoomId, sanitizeUsername };
