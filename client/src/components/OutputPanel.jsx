// client/src/components/OutputPanel.jsx
export default function OutputPanel({ result }) {
  const { stdout = '', stderr = '', exitCode = null, time = null, memory = null } = result || {};

  return (
    <div className="bg-slate-900 border-t border-slate-700 p-3 text-slate-200 text-sm">
      <div className="flex gap-6 text-slate-400 text-xs mb-2">
        {exitCode !== null && <span>exit: {exitCode}</span>}
        {time !== null && <span>time: {time}s</span>}
        {memory !== null && <span>mem: {memory}KB</span>}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="flex flex-col">
          <div className="text-slate-400 text-xs mb-1">Output</div>
          <pre className="bg-slate-800 rounded p-3 overflow-y-auto max-h-48 whitespace-pre-wrap break-words">
            {stdout || '—'}
          </pre>
        </div>
        <div className="flex flex-col">
          <div className="text-slate-400 text-xs mb-1">Error</div>
          <pre className="bg-slate-800 rounded p-3 overflow-y-auto max-h-48 whitespace-pre-wrap break-words text-red-300">
            {stderr || '—'}
          </pre>
        </div>
      </div>
    </div>
  );
}