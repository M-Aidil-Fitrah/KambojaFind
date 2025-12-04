"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import DarkVeil from './DarkVeil';

export default function SearchInterface() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSearchClick = () => {
    setIsSearchActive(true);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      return;
    }
    
    // Redirect to search results page
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center">
      {/* DarkVeil Background */}
      <div className="fixed inset-0 w-full h-full">
        <DarkVeil 
          hueShift={0}
          noiseIntensity={0.05}
          scanlineIntensity={0.1}
          speed={0.6}
          scanlineFrequency={1.5}
          warpAmount={0.6}
          resolutionScale={1}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Title */}
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight">
          KambojaFind
        </h1>
        
        {/* Description */}
        <p className="text-xl sm:text-2xl text-white/70 mb-12 font-light">
          Advanced Information Retrieval System
        </p>
        
        {/* Search Form/Button */}
        <form onSubmit={handleSearch}>
          <div className="relative group max-w-md mx-auto">
            {!isSearchActive ? (
              /* Collapsed Button State */
              <button
                type="button"
                onClick={handleSearchClick}
                className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-white text-base font-medium transition-all hover:scale-105 mx-auto"
                style={{ width: '180px' }}
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            ) : (
              /* Expanded Input State */
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/50 w-6 h-6 z-10" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari berita WNI Kamboja, online scam, deportasi..."
                  autoFocus
                  className="w-full pl-16 pr-6 py-4 text-lg bg-white/10 backdrop-blur-xl border border-white/30 rounded-full focus:border-white/50 focus:outline-none focus:ring-4 focus:ring-white/20 text-white placeholder:text-white/40 transition-all animate-expand-input"
                />
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
