"use client";

import React, { useState } from 'react';
import { Search, Loader2, TrendingUp } from 'lucide-react';

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

  const renderResults = (algorithmResults: SearchResult[], algorithmName: string) => {
    if (!algorithmResults || algorithmResults.length === 0) {
      return (
        <div className="text-center py-12 text-zinc-500">
          No results found for this algorithm.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {algorithmResults.map((result, idx) => (
          <div 
            key={`${algorithmName}-${idx}`}
            className="bg-white border rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-zinc-900 flex-1">
                {result.document.title || 'Untitled Document'}
              </h3>
              <div className="ml-4 flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  {result.score.toFixed(4)}
                </span>
              </div>
            </div>
            
            {result.document.cleaned_content && (
              <p className="text-sm text-zinc-600 line-clamp-3 mb-3">
                {result.document.cleaned_content.substring(0, 300)}...
              </p>
            )}
            
            {result.document.url && (
              <a 
                href={result.document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {result.document.url}
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderComparison = () => {
    if (!results) return null;

    return (
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-t-lg">
            <h2 className="text-lg font-semibold">TF-IDF Results</h2>
            <p className="text-sm opacity-90">Vector Space Model</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-b-lg">
            {renderResults(results.tfidf || [], 'tfidf')}
          </div>
        </div>

        <div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-t-lg">
            <h2 className="text-lg font-semibold">BM25 Results</h2>
            <p className="text-sm opacity-90">Okapi BM25 Algorithm</p>
          </div>
          <div className="bg-green-50 p-4 rounded-b-lg">
            {renderResults(results.bm25 || [], 'bm25')}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-zinc-900 mb-3">
            KambojaFind
          </h1>
          <p className="text-xl text-zinc-600">
            Information Retrieval System dengan TF-IDF & BM25
          </p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari artikel tentang Myanmar, Rohingya, konflik..."
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-zinc-200 rounded-xl focus:border-blue-500 focus:outline-none shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </span>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        {results && (
          <div className="mb-6">
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setActiveTab('comparison')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'comparison'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                Comparison View
              </button>
              <button
                onClick={() => setActiveTab('tfidf')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'tfidf'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                TF-IDF Only
              </button>
              <button
                onClick={() => setActiveTab('bm25')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'bm25'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                BM25 Only
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div>
            {activeTab === 'comparison' && renderComparison()}
            {activeTab === 'tfidf' && (
              <div className="max-w-4xl mx-auto">
                {renderResults(results.tfidf || [], 'tfidf')}
              </div>
            )}
            {activeTab === 'bm25' && (
              <div className="max-w-4xl mx-auto">
                {renderResults(results.bm25 || [], 'bm25')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
