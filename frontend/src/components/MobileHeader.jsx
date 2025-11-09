// src/components/MobileHeader.jsx
import React from 'react';
import {
  LinkIcon,
  ArrowLeftOnRectangleIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

export default function MobileHeader({ clients, copyRoomId, leaveRoom }) {
  return (
    <div className="md:hidden flex items-center justify-between h-16 
                    bg-white border-b border-gray-200 px-4">
      
      {/* Logo & Client Count */}
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center 
                        justify-center text-white text-lg font-bold shadow-md">
          C<span className="text-blue-300">{`{`}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <UsersIcon className="w-5 h-5" />
          <span className="font-medium">{clients.length}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={copyRoomId}
          className="p-2 text-gray-600 hover:text-blue-600 
                     hover:bg-gray-100 rounded-md"
        >
          <LinkIcon className="w-6 h-6" />
        </button>
        <button
          onClick={leaveRoom}
          className="p-2 text-gray-600 hover:text-red-600 
                     hover:bg-gray-100 rounded-md"
        >
          <ArrowLeftOnRectangleIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}