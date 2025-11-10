/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// src/components/OutputPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';

const getExitCodeClass = (code) => {
  if (code === null || code === undefined) return 'text-gray-500';
  return code === 0 ? 'text-green-500' : 'text-red-500';
};

const getExitCodeIcon = (code) => {
  if (code === null || code === undefined) return null;
  return code === 0 
    ? <CheckCircleIcon className="w-4 h-4 inline-block mr-1" />
    : <XCircleIcon className="w-4 h-4 inline-block mr-1" />;
};

export default function OutputPanel({ result }) {
  const [tab, setTab] = useState('output'); // 'output' or 'error'
  const outputRef = useRef(null);
  const errorRef = useRef(null);

  const {
    stdout = '',
    stderr = '',
    exitCode = null,
    time = null,
    memory = null,
    isStreaming = false, // Add this flag to your result object
  } = result || {};

  // Automatically switch to error tab if there's an error
  useEffect(() => {
    if (stderr && !isStreaming) {
      setTab('error');
    } else if (result && !stderr && !isStreaming) {
      setTab('output');
    }
  }, [stderr, result, isStreaming]);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (tab === 'output' && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [stdout, tab]);

  useEffect(() => {
    if (tab === 'error' && errorRef.current) {
      errorRef.current.scrollTop = errorRef.current.scrollHeight;
    }
  }, [stderr, tab]);

  const hasDetails = time !== null || memory !== null;

  return (
    <div className="h-64 bg-gray-800 text-white font-mono text-sm flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <TabButton
          title="Output"
          isActive={tab === 'output'}
          onClick={() => setTab('output')}
          hasError={false}
        />
        <TabButton
          title="Error"
          isActive={tab === 'error'}
          onClick={() => setTab('error')}
          hasError={!!stderr}
        />
      </div>

      {/* Content */}
      <div 
        ref={tab === 'output' ? outputRef : errorRef}
        className="flex-1 p-4 overflow-auto"
      >
        {!result && (
          <span className="text-gray-500">
            Click "Run" to execute your code.
          </span>
        )}

        {result && tab === 'output' && (
          <>
            {isStreaming && (
              <div className="mb-2 text-yellow-400 animate-pulse">
                ⚡ Running...
              </div>
            )}
            <pre className="whitespace-pre-wrap">
              {stdout || (!isStreaming && <span className="text-gray-500">No standard output.</span>)}
            </pre>
          </>
        )}

        {result && tab === 'error' && (
          <pre className="whitespace-pre-wrap text-red-400">
            {stderr || <span className="text-gray-500">No standard error.</span>}
          </pre>
        )}
      </div>

      {/* Footer / Status Bar */}
      {result && !isStreaming && (
        <div className="flex items-center gap-4 p-2 bg-gray-900 
                      text-xs border-t border-gray-700">
          <span
            className={`font-medium ${getExitCodeClass(exitCode)}`}
          >
            {getExitCodeIcon(exitCode)}
            Exit Code: {exitCode ?? 'N/A'}
          </span>
          
          {hasDetails && (
            <>
              <span className="border-l border-gray-600 h-4"></span>
              <span className="text-gray-400 flex items-center gap-1">
                <ClockIcon className="w-4 h-4" /> {time ?? 'N/A'} ms
              </span>
              <span className="text-gray-400 flex items-center gap-1">
                <CpuChipIcon className="w-4 h-4" /> {memory ?? 'N/A'} KB
              </span>
            </>
          )}
        </div>
      )}

      {/* Streaming indicator in footer */}
      {result && isStreaming && (
        <div className="flex items-center gap-2 p-2 bg-gray-900 
                      text-xs border-t border-gray-700">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <span className="text-yellow-400">Executing...</span>
        </div>
      )}
    </div>
  );
}

function TabButton({ title, isActive, onClick, hasError }) {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-4 text-sm font-medium focus:outline-none 
                  ${isActive 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:text-white'
                  }`}
    >
      {title}
      {hasError && <span className="w-2 h-2 bg-red-500 rounded-full 
                                  inline-block ml-2"></span>}
    </button>
  );
}