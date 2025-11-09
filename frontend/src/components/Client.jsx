import React from 'react';
import Avatar from 'react-avatar';

export default function Client({ username }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-800/30 border border-slate-700/50 p-3 transition-all hover:bg-slate-700/40">
      <Avatar name={username} size="32" round="8px" textSizeRatio={2} />
      <span className="text-sm font-medium text-slate-200 truncate">{username}</span>
    </div>
  );
}