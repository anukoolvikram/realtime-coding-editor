export default function MobileHeader({ roomId, copyRoomId, leaveRoom }) {
  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
          RN
        </div>
        <span className="text-xs font-medium text-slate-300">Room ID: {roomId.slice(0, 8)}…</span>
      </div>
      
      <div className="flex gap-2">
        <button 
          className="p-2 bg-slate-700/50 rounded-lg border border-slate-600 hover:bg-slate-700/70 transition-colors"
          onClick={copyRoomId}
          aria-label="Copy room ID"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button 
          className="p-2 bg-red-500/20 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors"
          onClick={leaveRoom}
          aria-label="Leave room"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  );
}