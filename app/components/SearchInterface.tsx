"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import DarkVeil from './DarkVeil-Background';
import TrueFocus from './TrueFocus-Text';
import DecryptedText from './DecryptedText';

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
      {/* Logo with Glass Effect - Centered */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 p-5 rounded-2xl bg-white/90 backdrop-blur-xl border-2 border-white shadow-[0_8px_32px_0_rgba(255,255,255,0.3),_0_0_60px_rgba(255,255,255,0.2)] hover:bg-white hover:shadow-[0_12px_48px_0_rgba(255,255,255,0.4),_0_0_80px_rgba(255,255,255,0.3)] transition-all duration-300">
        <img
          src="/LogoKambojaFind.png"
          alt="KambojaFind Logo"
          className="w-36 h-auto brightness-110 contrast-125"
        />
      </div>
      
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
        <div className="text-6xl sm:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight">
          <TrueFocus 
            sentence="KambojaFind News"
            separator=" "
            manualMode={false}
            blurAmount={5}
            borderColor="red"
            animationDuration={2}
            pauseBetweenAnimations={1}
          />
        </div>
        
        {/* Description */}
          <div className="text-xl sm:text-2xl text-white/70 mb-12 font-light">
            <DecryptedText
              text="Platform pencarian berita seputar WNI di Kamboja, online scam, deportasi, dan isu-isu terkini secara cepat dan akurat."
              animateOn="view"
              sequential={true}
              revealDirection="start"
              speed={10}
            />
          </div>
        
        {/* Search Form/Button */}
        <form onSubmit={handleSearch}>
          <div className="relative group max-w-md mx-auto">
            {!isSearchActive ? (
              /* Collapsed Button State */
              <button
                type="button"
                onClick={handleSearchClick}
                className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-white/5 hover:bg-white/10 backdrop-blur-2xl border border-white/30 rounded-full text-white text-base font-medium transition-all hover:scale-105 hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] mx-auto shadow-[0_4px_16px_0_rgba(0,0,0,0.3)]"
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
                  className="w-full pl-16 pr-6 py-4 text-lg bg-white/5 backdrop-blur-2xl border border-white/30 rounded-full focus:border-white/60 focus:outline-none focus:ring-4 focus:ring-white/10 focus:shadow-[0_8px_32px_0_rgba(255,255,255,0.15)] text-white placeholder:text-white/40 transition-all animate-expand-input shadow-[0_4px_16px_0_rgba(0,0,0,0.3)]"
                />
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
