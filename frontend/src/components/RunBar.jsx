// src/components/RunBar.jsx
import React, { useState } from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';
import { CommandLineIcon } from '@heroicons/react/24/outline';

export default function RunBar({ running, onRun, language, onLanguageChange }) {
  const [stdin, setStdin] = useState('');

  const handleRunClick = () => {
    onRun(stdin);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-50">
      
      {/* Run Button */}
      <button
        onClick={handleRunClick}
        disabled={running}
        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-md 
                    font-medium text-white shadow-sm transition
                    ${running 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                    }`}
      >
        <PlayIcon className="w-5 h-5" />
        {running ? 'Running...' : 'Run'}
      </button>

      {/* Language Selector */}
      <div>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="p-2.5 text-sm border border-gray-300 rounded-md 
                     bg-white focus:outline-none focus:ring-2 
                     focus:ring-blue-500"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
      </div>
      
      {/* STDIN Input */}
      <div className="flex-1 min-w-[200px] relative">
        <CommandLineIcon className="w-5 h-5 text-gray-400 absolute 
                                    left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          placeholder="Enter STDIN (optional)"
          className="w-full p-2.5 pl-10 text-sm border border-gray-300 
                     rounded-md bg-white placeholder-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}