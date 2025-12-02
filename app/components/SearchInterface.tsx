"use client";

import React, { useState } from 'react';
import { Search, Loader2, Sparkles, Zap, BarChart3, ExternalLink, TrendingUp, Database, BookOpen } from 'lucide-react';

type SearchResult = {
  doc_id: string;
  score: number;
  document: {
    title?: string;
    url?: string;
    content?: string;
    cleaned_content?: string;
  };
};

type AlgorithmResults = {
  tfidf?: SearchResult[];
  bm25?: SearchResult[];
};

export default function SearchInterface() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AlgorithmResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'tfidf' | 'bm25' | 'comparison'>('comparison');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          algorithm: 'both',
          top_k: 10
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError('Failed to fetch search results. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'from-emerald-500 to-green-500';
    if (percentage >= 60) return 'from-blue-500 to-cyan-500';
    if (percentage >= 40) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-pink-500';
  };

  const getImagePath = (docId: string) => {
    // Extract numeric ID from doc_id (e.g., "0" from "0")
    const numericId = docId.replace(/\D/g, '');
    return `/images/article_${numericId}.jpeg`;
  };

  const renderResults = (algorithmResults: SearchResult[], algorithmName: string) => {
    if (!algorithmResults || algorithmResults.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-full mb-4">
            <BookOpen className="w-10 h-10 text-zinc-400" />
          </div>
          <p className="text-zinc-500 text-lg">No results found for this algorithm.</p>
        </div>
      );
    }

    const maxScore = Math.max(...algorithmResults.map(r => r.score));

    return (
      <div className="grid grid-cols-1 gap-6">
        {algorithmResults.map((result, idx) => {
          const scorePercentage = (result.score / maxScore) * 100;
          const imagePath = getImagePath(result.doc_id);
          
          return (
            <div 
              key={`${algorithmName}-${idx}`}
              className="group relative bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-xl border border-white/40 rounded-3xl overflow-hidden hover:shadow-[0_20px_60px_rgba(59,130,246,0.3)] hover:scale-[1.02] transition-all duration-500"
            >
              {/* Rank Badge with Glow */}
              <div className="absolute -left-4 top-6 z-20">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 blur-xl opacity-60 animate-pulse" />
                  <div className="relative w-14 h-14 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-2xl border-4 border-white">
                    {idx + 1}
                  </div>
                </div>
              </div>

              {/* Score Bar with Animated Gradient */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getScoreColor(result.score, maxScore)} animate-gradient-x shadow-lg`}
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8 mt-2">
                {/* Image Section with Parallax Effect */}
                <div className="md:w-80 flex-shrink-0">
                  <div className="relative aspect-video md:aspect-square rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-blue-500/50 transition-shadow duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-10 group-hover:opacity-0 transition-opacity duration-500" />
                    <img 
                      src={imagePath}
                      alt={result.document.title || 'Article image'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/default.jpg';
                      }}
                    />
                    {/* Floating Score Badge on Image */}
                    <div className="absolute bottom-3 right-3 z-20">
                      <div className={`px-4 py-2 bg-gradient-to-r ${getScoreColor(result.score, maxScore)} rounded-xl shadow-2xl backdrop-blur-sm border-2 border-white/50`}>
                        <div className="flex items-center gap-2 text-white">
                          <Sparkles className="w-5 h-5 animate-pulse" />
                          <span className="font-black text-base">
                            {result.score.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Match Percentage Badge */}
                    <div className="absolute top-3 left-3 z-20 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/20">
                      <div className="flex items-center gap-2 text-white text-xs font-bold">
                        <BarChart3 className="w-4 h-4" />
                        <span>{scorePercentage.toFixed(0)}% Match</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col justify-between min-h-[200px]">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 leading-tight group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 transition-all duration-500">
                        {result.document.title || 'Untitled Document'}
                      </h3>
                    </div>
                    
                    {result.document.cleaned_content && (
                      <p className="text-base text-slate-700 leading-relaxed mb-6 line-clamp-4 group-hover:text-slate-900 transition-colors">
                        {result.document.cleaned_content.substring(0, 350)}...
                      </p>
                    )}
                  </div>

                  {/* Footer Section */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/50">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-100 to-blue-50 rounded-lg border border-slate-200/50">
                        <Database className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-slate-700">ID: {result.doc_id}</span>
                      </div>
                    </div>
                    
                    {result.document.url && (
                      <a 
                        href={result.document.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                      >
                        <span>Read Full Article</span>
                        <ExternalLink className="w-5 h-5 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderComparison = () => {
    if (!results) return null;

    return (
      <div className="space-y-12">
        {/* TF-IDF Section */}
        <div className="space-y-6">
          <div className="relative group/header">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 rounded-3xl blur-2xl opacity-30 group-hover/header:opacity-50 transition-opacity" />
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-500 to-fuchsia-600 text-white px-8 py-8 rounded-3xl shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 blur-3xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-xl">
                    <Zap className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black mb-2">TF-IDF Algorithm</h2>
                    <p className="text-lg text-purple-100 font-medium">Vector Space Model • Cosine Similarity</p>
                  </div>
                </div>
                <div className="text-center bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border-2 border-white/30 shadow-xl">
                  <div className="text-5xl font-black">{results.tfidf?.length || 0}</div>
                  <div className="text-sm font-semibold mt-1 text-purple-100">Results</div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50/40 to-fuchsia-50/40 p-8 rounded-3xl backdrop-blur-xl border-2 border-purple-200/30 shadow-xl">
            {renderResults(results.tfidf || [], 'tfidf')}
          </div>
        </div>

        {/* BM25 Section */}
        <div className="space-y-6">
          <div className="relative group/header">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 rounded-3xl blur-2xl opacity-30 group-hover/header:opacity-50 transition-opacity" />
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-500 to-teal-600 text-white px-8 py-8 rounded-3xl shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 blur-3xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-xl">
                    <TrendingUp className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black mb-2">BM25 Algorithm</h2>
                    <p className="text-lg text-emerald-100 font-medium">Okapi BM25 • Probabilistic Ranking</p>
                  </div>
                </div>
                <div className="text-center bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border-2 border-white/30 shadow-xl">
                  <div className="text-5xl font-black">{results.bm25?.length || 0}</div>
                  <div className="text-sm font-semibold mt-1 text-emerald-100">Results</div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50/40 to-teal-50/40 p-8 rounded-3xl backdrop-blur-xl border-2 border-emerald-200/30 shadow-xl">
            {renderResults(results.bm25 || [], 'bm25')}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
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
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-2xl opacity-50 animate-pulse" />
              <h1 className="relative text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
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
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
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
                className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
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
              {results && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setResults(null);
                    setError('');
                  }}
                  className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all backdrop-blur-sm border border-white/20"
                >
                  Clear Results
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8 bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-300 px-6 py-4 rounded-2xl">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Tabs */}
        {results && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setActiveTab('comparison')}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'comparison'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20'
                }`}
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Comparison
                </span>
              </button>
              <button
                onClick={() => setActiveTab('tfidf')}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'tfidf'
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  TF-IDF
                </span>
              </button>
              <button
                onClick={() => setActiveTab('bm25')}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'bm25'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/50 scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20'
                }`}
              >
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  BM25
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'comparison' && renderComparison()}
            {activeTab === 'tfidf' && (
              <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-br from-purple-50/20 to-fuchsia-50/20 p-8 rounded-3xl backdrop-blur-xl border-2 border-purple-500/20 shadow-2xl">
                  {renderResults(results.tfidf || [], 'tfidf')}
                </div>
              </div>
            )}
            {activeTab === 'bm25' && (
              <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-br from-emerald-50/20 to-teal-50/20 p-8 rounded-3xl backdrop-blur-xl border-2 border-emerald-500/20 shadow-2xl">
                  {renderResults(results.bm25 || [], 'bm25')}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!results && !loading && (
          <div className="text-center mt-20 text-blue-200/60 text-sm">
            <p>Try searching for topics like: <span className="text-blue-300 font-semibold">Myanmar crisis</span>, <span className="text-blue-300 font-semibold">Rohingya refugees</span>, <span className="text-blue-300 font-semibold">humanitarian aid</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
