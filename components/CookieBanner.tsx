'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900 border-t border-gray-700 shadow-lg debug-overlay">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-300 text-center sm:text-left">
          Folosim cookie-uri pentru a îmbunătăți experiența ta pe eVerify. 
          Prin continuarea navigării, ești de acord cu{' '}
          <a href="/privacy" className="text-blue-400 underline hover:text-blue-300">
            Politica de Confidențialitate
          </a>.
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm text-gray-400 border border-gray-600 rounded hover:bg-gray-800 transition"
          >
            Refuz
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-500 transition font-medium"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
