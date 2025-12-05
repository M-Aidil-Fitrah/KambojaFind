"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock } from 'lucide-react';
import DarkVeil from './DarkVeil-Background';
import TrueFocus from './TrueFocus-Text';
import DecryptedText from './DecryptedText';
import LogoLoop from './LogoLoop';

// Logo berita dari folder logo_news
const newsLogos = [
  { src: "/images/logo_news/bbc.jpg", alt: "BBC News", href: "https://www.bbc.com" },
  { src: "/images/logo_news/cnn.png", alt: "CNN", href: "https://www.cnn.com" },
  { src: "/images/logo_news/detik.png", alt: "Detik", href: "https://www.detik.com" },
  { src: "/images/logo_news/kompas.png", alt: "Kompas", href: "https://www.kompas.com" },
  { src: "/images/logo_news/liputan6.png", alt: "Liputan 6", href: "https://www.liputan6.com" },
  { src: "/images/logo_news/tempo.webp", alt: "Tempo", href: "https://www.tempo.co" },
  { src: "/images/logo_news/tribun.png", alt: "Tribun News", href: "https://www.tribunnews.com" },
  { src: "/images/logo_news/voa.png", alt: "VOA Indonesia", href: "https://www.voaindonesia.com" },
];

export default function SearchInterface() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const response = await fetch(`/api/suggestions?q=${encodeURIComponent(query.trim())}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(data.suggestions?.length > 0);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchClick = () => {
    setIsSearchActive(true);
  };

  const handleSearch = async (e: React.FormEvent, suggestion?: string) => {
    e.preventDefault();
    
    const searchQuery = suggestion || query.trim();
    if (!searchQuery) {
      return;
    }
    
    // Redirect to search results page
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    // Auto submit when suggestion is clicked
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center">
      {/* Logo with Enhanced Glass Effect - Centered */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 group">
        {/* Outer glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-red-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-60 group-hover:opacity-100"></div>
        
        {/* Glass container */}
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-2xl border-2 border-white/50 shadow-[0_8px_32px_0_rgba(255,255,255,0.4),_0_0_80px_rgba(255,255,255,0.2),inset_0_1px_0_0_rgba(255,255,255,0.8)] hover:shadow-[0_12px_48px_0_rgba(255,255,255,0.5),_0_0_100px_rgba(255,255,255,0.3),inset_0_1px_0_0_rgba(255,255,255,1)] transition-all duration-500 hover:scale-105">
          {/* Inner subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-purple-500/10 rounded-3xl"></div>
          
          <img
            src="/LogoKambojaFind.png"
            alt="KambojaFind Logo"
            className="w-40 h-auto relative z-10 brightness-[1.15] contrast-[1.2] saturate-110 drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] transition-all duration-500 group-hover:brightness-125 group-hover:contrast-125"
          />
        </div>
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
              <div className="relative" ref={suggestionsRef}>
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/50 w-6 h-6 z-10" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Cari berita WNI Kamboja, online scam, deportasi..."
                  autoFocus
                  className="w-full pl-16 pr-6 py-4 text-lg bg-white/5 backdrop-blur-2xl border border-white/30 rounded-full focus:border-white/60 focus:outline-none focus:ring-4 focus:ring-white/10 focus:shadow-[0_8px_32px_0_rgba(255,255,255,0.15)] text-white placeholder:text-white/40 transition-all animate-expand-input shadow-[0_4px_16px_0_rgba(0,0,0,0.3)]"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-96 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-all ${
                          index === selectedIndex
                            ? 'bg-white/20'
                            : 'hover:bg-white/10'
                        } ${index !== suggestions.length - 1 ? 'border-b border-white/10' : ''}`}
                      >
                        <Search className="w-4 h-4 text-white/50 shrink-0" />
                        <span className="text-white text-sm flex-1 truncate">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Logo Loop - News Partners */}
      <div className="fixed bottom-0 left-0 right-0 z-20 h-32 pointer-events-none">
        <LogoLoop
          logos={newsLogos}
          speed={40}
          direction="left"
          logoHeight={60}
          gap={60}
          hoverSpeed={10}
          fadeOut
          fadeOutColor="#000000"
          ariaLabel="News partners and sources"
          className="pointer-events-auto"
          renderItem={(item, key) => {
            const imgItem = item as { src: string; alt?: string; href?: string };
            return (
              <a
                href={imgItem.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block grayscale hover:grayscale-0 transition-all duration-300"
                key={key}
              >
                <img
                  src={imgItem.src}
                  alt={imgItem.alt}
                  className="h-[60px] w-auto block object-contain"
                />
              </a>
            );
          }}
        />
      </div>
    </div>
  );
}
