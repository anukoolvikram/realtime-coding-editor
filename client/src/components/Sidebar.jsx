import Client from '../components/Client';

export default function Sidebar({ roomId, clients, copyRoomId, leaveRoom }) {
  return (
    <aside className="w-full md:w-72 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
            RN
          </div>
          <span className="text-sm font-semibold text-slate-200">Room</span>
        </div>
        <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-md border border-blue-500/30">
          {roomId.slice(0, 10)}…
        </span>
      </div>

      {/* Connected users */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Connected Users</h3>
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-3 h-64 overflow-y-auto">
          {clients.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No users connected yet…</p>
          ) : (
            <div className="space-y-2">
              {clients.map(client => (
                <Client key={client.socketId} username={client.username} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto space-y-3">
        <button 
          className="w-full bg-slate-700/50 text-slate-200 py-2 px-4 rounded-lg font-medium border border-slate-600
                    hover:bg-slate-700/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:ring-opacity-50 flex items-center justify-center gap-2"
          onClick={copyRoomId}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Room ID
        </button>
        <button 
          className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white py-2 px-4 rounded-lg font-medium
                    hover:from-red-600 hover:to-orange-700 transition-all duration-200 transform hover:-translate-y-0.5
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 shadow-md flex items-center justify-center gap-2"
          onClick={leaveRoom}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Leave Room
        </button>
      </div>
    </aside>
  );
}
