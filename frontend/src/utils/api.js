const API_BASE =
  import.meta.env.VITE_API_BASE  
  || 'http://localhost:3001';

export async function executeCode({ language, code, stdin = '' }) {
  const res = await fetch(`${API_BASE}/api/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, code, stdin }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Execution failed: ${res.status} ${text}`);
  }
  return res.json();
}
