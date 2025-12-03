"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Sparkles, Zap, TrendingUp, Database } from 'lucide-react';

export default function SearchInterface() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      return;
    }

    setLoading(true);
    
    // Redirect to search results page
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-600 blur-2xl opacity-50 animate-pulse" />
              <h1 className="relative text-5xl sm:text-6xl lg:text-7xl font-black bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                KambojaFind
              </h1>
            </div>
          </div>
          <p className="text-lg sm:text-xl text-blue-200/80 max-w-2xl mx-auto font-light">
            Advanced Information Retrieval System
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
              <Zap className="w-4 h-4 text-purple-400" />
              TF-IDF Vector Space
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              BM25 Probabilistic
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
              <Database className="w-4 h-4 text-blue-400" />
              420+ Documents
            </span>
          </div>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-zinc-400 w-6 h-6 z-10" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for Myanmar, Rohingya, conflicts, humanitarian crisis..."
                  className="w-full pl-16 pr-6 py-5 sm:py-6 text-base sm:text-lg bg-white/95 backdrop-blur-sm border-2 border-white/20 rounded-2xl focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-2xl placeholder:text-zinc-400 transition-all"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Search Now
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-20 text-blue-200/60 text-sm">
          <p>Try searching for topics like: <span className="text-blue-300 font-semibold">Myanmar crisis</span>, <span className="text-blue-300 font-semibold">Rohingya refugees</span>, <span className="text-blue-300 font-semibold">humanitarian aid</span></p>
        </div>
      </div>
    </div>
  );
}
