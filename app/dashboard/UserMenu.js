'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut } from 'lucide-react';

export default function UserMenu({ userEmail }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initial = userEmail ? userEmail.slice(0, 1).toUpperCase() : '?';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Account menu"
        className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-600 to-amber-500 text-white text-sm font-semibold flex items-center justify-center"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-lg py-2 z-20">
          <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
            <p className="text-xs text-gray-400">Signed in as</p>
            <p className="text-sm text-gray-800 truncate">{userEmail}</p>
          </div>

          <form action="/auth/signout" method="post">
            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left">
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
