"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Zap, TrendingUp, ArrowLeft, Eye } from 'lucide-react';
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
  };
};

type AlgorithmResults = {
  tfidf?: SearchResult[];
  bm25?: SearchResult[];
};

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<AlgorithmResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) {
      router.push('/');
      return;
    }

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
    
    // Extract preview text from cleaned_content
    const previewText = result.document.cleaned_content 
      ? result.document.cleaned_content.substring(0, 150) + '...'
      : result.document.content 
        ? result.document.content.substring(0, 150) + '...'
        : 'No preview available';

    return (
      <Link 
        href={`/article/${result.doc_id}`}
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
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white rounded-xl transition-all border border-white/20 mb-8 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Search</span>
          </Link>

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
    </div>
  );
}
