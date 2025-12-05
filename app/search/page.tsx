"use client";

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Zap, TrendingUp, ArrowLeft, Eye, Search, BarChart3, X } from 'lucide-react';
import Link from 'next/link';
import DarkVeil from '@/app/components/DarkVeil-Background';

type SearchResult = {
  doc_id: string;
  score: number;
  document: {
    title?: string;
    url?: string;
    content?: string;
    cleaned_content?: string;
    original_content?: string;
  };
};

type AlgorithmResults = {
  tfidf?: SearchResult[];
  bm25?: SearchResult[];
};

type EvaluationMetrics = {
  precision: number;
  recall: number;
  f1Score: number;
  map?: number;
  averagePrecision?: number;
  matchedGroundTruth?: string;
  similarity?: number;
  relevantRetrieved?: number[];
  retrievedDocs?: number[];
  relevantDocs?: number[];
};

type EvaluationData = {
  tfidf: EvaluationMetrics;
  bm25: EvaluationMetrics;
  timestamp: string;
  totalQueries?: number;
  isDynamic?: boolean; // Flag untuk membedakan evaluasi dinamis vs static
};

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<AlgorithmResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(query);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions when searchQuery changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const response = await fetch(`/api/suggestions?q=${encodeURIComponent(searchQuery.trim())}`);
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
  }, [searchQuery]);

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

  useEffect(() => {
    if (!query) {
      router.push('/');
      return;
    }

    // Reset evaluation data ketika query berubah
    setEvaluationData(null);
    setShowEvaluation(false);

    const fetchResults = async () => {
      setLoading(true);
      setError('');

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

    fetchResults();
  }, [query, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
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

  const handleEvaluationClick = async () => {
    setShowEvaluation(true);
    
    // Selalu fetch data baru, jangan gunakan cache
    setEvaluationLoading(true);
    
    try {
      // Gunakan API evaluate-query untuk evaluasi dinamis terhadap query saat ini
      const response = await fetch('/api/evaluate-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          topK: 50
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch evaluation data');
      }
      
      const result = await response.json();
      
      console.log('Evaluation API Response:', result);
      
      if (result.tfidf && result.bm25) {
        setEvaluationData({
          tfidf: {
            precision: result.tfidf.precision,
            recall: result.tfidf.recall,
            f1Score: result.tfidf.f1Score,
            averagePrecision: result.tfidf.averagePrecision,
            matchedGroundTruth: result.tfidf.matchedGroundTruth,
            similarity: result.tfidf.similarity,
            relevantRetrieved: result.tfidf.relevantRetrieved,
            retrievedDocs: result.tfidf.retrievedDocs,
            relevantDocs: result.tfidf.relevantDocs
          },
          bm25: {
            precision: result.bm25.precision,
            recall: result.bm25.recall,
            f1Score: result.bm25.f1Score,
            averagePrecision: result.bm25.averagePrecision,
            matchedGroundTruth: result.bm25.matchedGroundTruth,
            similarity: result.bm25.similarity,
            relevantRetrieved: result.bm25.relevantRetrieved,
            retrievedDocs: result.bm25.retrievedDocs,
            relevantDocs: result.bm25.relevantDocs
          },
          timestamp: result.timestamp,
          isDynamic: true
        });
      }
    } catch (err) {
      console.error('Failed to fetch evaluation:', err);
      alert('Failed to load evaluation data. Please try again.');
      setShowEvaluation(false);
    } finally {
      setEvaluationLoading(false);
    }
  };

  const getImagePath = (docId: string | number) => {
    const numericId = String(docId).replace(/\D/g, '');
    // Try multiple formats
    const formats = ['jpeg', 'jpg', 'png', 'webp'];
    // Default to first format, actual error handling will be done in img onError
    return `/images/article_${numericId}.jpeg`;
  };

  const renderResultCard = (result: SearchResult, rank: number, algorithm: 'tfidf' | 'bm25') => {
    if (!result) return null;

    const imagePath = getImagePath(result.doc_id);
    const maxScore = algorithm === 'tfidf' ? 1 : 30; // Approximate max scores
    
    // Extract preview text from original_content first, then fallback to cleaned_content
    const previewText = result.document.original_content 
      ? result.document.original_content.substring(0, 150) + '...'
      : result.document.cleaned_content 
        ? result.document.cleaned_content.substring(0, 150) + '...'
        : result.document.content 
          ? result.document.content.substring(0, 150) + '...'
          : 'No preview available';

    return (
      <Link 
        href={`/article/${result.doc_id}?q=${encodeURIComponent(query)}`}
        key={`${algorithm}-${result.doc_id}`}
        className="group block bg-white/95 backdrop-blur-xl border border-white/30 rounded-2xl overflow-hidden hover:shadow-xl hover:border-white/50 transition-all duration-300 h-full flex flex-col"
      >
        {/* Image - Fixed aspect ratio */}
        <div className="relative aspect-video overflow-hidden bg-slate-200 flex-shrink-0">
          <img 
            src={imagePath}
            alt={result.document.title || 'Article image'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const numericId = String(result.doc_id).replace(/\D/g, '');
              const currentSrc = target.src;
              
              // Try different formats
              if (currentSrc.includes('.jpeg')) {
                target.src = `/images/article_${numericId}.jpg`;
              } else if (currentSrc.includes('.jpg')) {
                target.src = `/images/article_${numericId}.png`;
              } else if (currentSrc.includes('.png')) {
                target.src = `/images/article_${numericId}.webp`;
              } else {
                target.src = '/images/default.jpg';
              }
            }}
          />
          {/* Rank Badge */}
          <div className="absolute top-3 left-3 w-10 h-10 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
            <span className="text-white font-black text-sm">#{rank}</span>
          </div>
        </div>

        {/* Content - Flexible but limited */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Title - Fixed 2 lines */}
          <h3 className="text-lg font-bold text-slate-900 leading-tight mb-3 line-clamp-2 min-h-[3.5rem] group-hover:text-slate-700 transition-colors">
            {result.document.title || 'Untitled Document'}
          </h3>
          
          {/* Preview - Fixed 2 lines */}
          <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2 min-h-[2.5rem] flex-grow">
            {previewText}
          </p>

          {/* Score - Fixed at bottom */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-auto">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Score
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-slate-900">
                {result.score.toFixed(4)}
              </span>
              <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-900 rounded-full transition-all"
                  style={{ width: `${Math.min((result.score / maxScore) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
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
        
        <div className="relative z-10 text-center">
          <div className="relative mb-8">
            {/* Animated rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 border-4 border-white/20 rounded-full animate-ping"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-4 border-white/30 rounded-full animate-pulse"></div>
            </div>
            <Loader2 className="w-16 h-16 text-white animate-spin relative z-10 mx-auto" />
          </div>
          <p className="text-2xl font-bold text-white mb-2">Searching...</p>
          <p className="text-white/60">Finding best matches for "{query}"</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center p-4">
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
        
        <div className="relative z-10 bg-red-500/10 backdrop-blur-xl border-2 border-red-500/30 text-red-300 px-8 py-6 rounded-3xl max-w-lg text-center">
          <p className="text-xl font-semibold mb-4">{error}</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/30 text-white font-bold rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white rounded-xl transition-all border border-white/20 hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Search</span>
            </Link>

            {/* Evaluation Metrics Button */}
            <button
              onClick={handleEvaluationClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white rounded-xl transition-all border border-white/20 hover:scale-105"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-semibold">View Evaluation Metrics</span>
            </button>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative" ref={suggestionsRef}>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5 z-10" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Cari berita lainnya..."
                  className="w-full pl-12 pr-4 py-2.5 text-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 text-white placeholder:text-white/40 transition-all"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-2xl z-50">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-all ${
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
            </form>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8">
            <h1 className="text-3xl font-black text-white mb-2">
              Search Results
            </h1>
            <p className="text-white/70 text-lg mb-4">
              Query: <span className="text-white font-semibold">"{query}"</span>
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white"></div>
                <span className="text-white/80 text-sm font-medium">{results?.tfidf?.length || 0} TF-IDF</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white"></div>
                <span className="text-white/80 text-sm font-medium">{results?.bm25?.length || 0} BM25</span>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Comparison Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* TF-IDF Column */}
          <div>
            <div className="sticky top-4 mb-6">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-white" />
                  <div>
                    <h2 className="text-xl font-black text-white">TF-IDF Algorithm</h2>
                    <p className="text-white/60 text-sm">Term Frequency-Inverse Document Frequency</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {results?.tfidf && results.tfidf.length > 0 ? (
                results.tfidf.map((result, index) => renderResultCard(result, index + 1, 'tfidf'))
              ) : (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                  <p className="text-white/50">No TF-IDF results found</p>
                </div>
              )}
            </div>
          </div>

          {/* BM25 Column */}
          <div>
            <div className="sticky top-4 mb-6">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                  <div>
                    <h2 className="text-xl font-black text-white">BM25 Algorithm</h2>
                    <p className="text-white/60 text-sm">Best Matching 25</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {results?.bm25 && results.bm25.length > 0 ? (
                results.bm25.map((result, index) => renderResultCard(result, index + 1, 'bm25'))
              ) : (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                  <p className="text-white/50">No BM25 results found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* No Results */}
        {(!results?.tfidf || results.tfidf.length === 0) && (!results?.bm25 || results.bm25.length === 0) && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full mb-4 border border-white/20">
              <Eye className="w-10 h-10 text-white/50" />
            </div>
            <p className="text-xl text-white/60">No results found for your query</p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white font-semibold rounded-xl transition-all hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              Try Another Search
            </Link>
          </div>
        )}
      </div>

      {/* Evaluation Metrics Modal */}
      {showEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-black/95 backdrop-blur-xl border-2 border-white/30 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-white" />
                <h2 className="text-3xl font-black text-white">Evaluation Metrics</h2>
              </div>
              <button
                onClick={() => setShowEvaluation(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {evaluationLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
                <p className="text-white/70">Loading evaluation data...</p>
              </div>
            ) : evaluationData ? (
              <div>
                {/* Info */}
                <div className="mb-8 pb-6 border-b border-white/20">
                  {evaluationData.isDynamic ? (
                    <>
                      <p className="text-white/70 text-sm mb-2">
                        Query: <span className="text-white font-bold">&quot;{query}&quot;</span>
                      </p>
                      <p className="text-white/70 text-sm">
                        Evaluated at: <span className="text-white font-bold">{new Date(evaluationData.timestamp).toLocaleString()}</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-white/70 text-sm mb-2">
                        Total Queries Evaluated: <span className="text-white font-bold">{evaluationData.totalQueries}</span>
                      </p>
                      <p className="text-white/70 text-sm">
                        Last Updated: <span className="text-white font-bold">{new Date(evaluationData.timestamp).toLocaleString()}</span>
                      </p>
                    </>
                  )}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* TF-IDF Performance */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Zap className="w-6 h-6 text-white" />
                      <h3 className="text-2xl font-black text-white">TF-IDF Performance</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Precision */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/70 font-medium">Precision</span>
                          <span className="text-white font-black text-xl">
                            {evaluationData.tfidf.precision.toFixed(4)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white rounded-full transition-all"
                            style={{ width: `${evaluationData.tfidf.precision * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Recall */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/70 font-medium">Recall</span>
                          <span className="text-white font-black text-xl">
                            {evaluationData.tfidf.recall.toFixed(4)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white rounded-full transition-all"
                            style={{ width: `${evaluationData.tfidf.recall * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* F1 Score */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/70 font-medium">F1 Score</span>
                          <span className="text-white font-black text-xl">
                            {evaluationData.tfidf.f1Score.toFixed(4)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white rounded-full transition-all"
                            style={{ width: `${evaluationData.tfidf.f1Score * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* MAP / Average Precision */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/70 font-medium">
                            {evaluationData.isDynamic ? 'Avg Precision' : 'MAP'}
                          </span>
                          <span className="text-white font-black text-xl">
                            {(evaluationData.tfidf.averagePrecision || evaluationData.tfidf.map || 0).toFixed(4)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white rounded-full transition-all"
                            style={{ width: `${(evaluationData.tfidf.averagePrecision || evaluationData.tfidf.map || 0) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BM25 Performance */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <TrendingUp className="w-6 h-6 text-white" />
                      <h3 className="text-2xl font-black text-white">BM25 Performance</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Precision */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/70 font-medium">Precision</span>
                          <span className="text-white font-black text-xl">
                            {evaluationData.bm25.precision.toFixed(4)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white rounded-full transition-all"
                            style={{ width: `${evaluationData.bm25.precision * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Recall */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/70 font-medium">Recall</span>
                          <span className="text-white font-black text-xl">
                            {evaluationData.bm25.recall.toFixed(4)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white rounded-full transition-all"
                            style={{ width: `${evaluationData.bm25.recall * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* F1 Score */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/70 font-medium">F1 Score</span>
                          <span className="text-white font-black text-xl">
                            {evaluationData.bm25.f1Score.toFixed(4)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white rounded-full transition-all"
                            style={{ width: `${evaluationData.bm25.f1Score * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* MAP / Average Precision */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/70 font-medium">
                            {evaluationData.isDynamic ? 'Avg Precision' : 'MAP'}
                          </span>
                          <span className="text-white font-black text-xl">
                            {(evaluationData.bm25.averagePrecision || evaluationData.bm25.map || 0).toFixed(4)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white rounded-full transition-all"
                            style={{ width: `${(evaluationData.bm25.averagePrecision || evaluationData.bm25.map || 0) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparison Summary */}
                <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-black text-white mb-4">Performance Comparison</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-white/70 text-sm mb-1">Precision Winner</p>
                      <p className="text-white font-black text-lg">
                        {evaluationData.bm25.precision > evaluationData.tfidf.precision ? 'BM25' : 'TF-IDF'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/70 text-sm mb-1">Recall Winner</p>
                      <p className="text-white font-black text-lg">
                        {evaluationData.bm25.recall > evaluationData.tfidf.recall ? 'BM25' : 'TF-IDF'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/70 text-sm mb-1">F1 Score Winner</p>
                      <p className="text-white font-black text-lg">
                        {evaluationData.bm25.f1Score > evaluationData.tfidf.f1Score ? 'BM25' : 'TF-IDF'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/70 text-sm mb-1">
                        {evaluationData.isDynamic ? 'Avg Precision Winner' : 'MAP Winner'}
                      </p>
                      <p className="text-white font-black text-lg">
                        {(evaluationData.bm25.averagePrecision || evaluationData.bm25.map || 0) > (evaluationData.tfidf.averagePrecision || evaluationData.tfidf.map || 0) ? 'BM25' : 'TF-IDF'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-white/70">No evaluation data available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center">
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
        <div className="relative z-10 text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-xl font-bold text-white">Loading...</p>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
