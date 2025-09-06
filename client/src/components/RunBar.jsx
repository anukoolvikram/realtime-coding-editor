// client/src/components/RunBar.jsx
import { useState } from 'react';

const RUNNABLE = [
  { label: 'JavaScript (Node)', value: 'javascript' },
  { label: 'Python 3', value: 'python' },
  { label: 'C++ (GCC)', value: 'cpp' },
];

export default function RunBar({ running, language, onChangeLanguage, onRun }) {
  const [stdin, setStdin] = useState('');

  const handleRun = () => onRun({ stdin });

  return (
    <div className="border-t border-slate-700 bg-slate-800/60 p-2 flex gap-3 items-center">
      <select
        className="bg-slate-700 text-slate-100 px-3 py-2 text-sm rounded-md"
        value={language}
        onChange={e => onChangeLanguage(e.target.value)}
      >
        {RUNNABLE.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
      </select>

      <input
        className="flex-1 bg-slate-700 text-sm text-slate-100 px-3 py-2 rounded-md"
        placeholder="Input (optional)"
        value={stdin}
        onChange={e => setStdin(e.target.value)}
      />

      <button
        onClick={handleRun}
        disabled={running}
        className="bg-gradient-to-r text-sm from-blue-500 to-purple-600 text-white px-4 py-2 rounded-md disabled:opacity-60"
      >
        {running ? 'Running…' : 'Run'}
      </button>
    </div>
  );
}
