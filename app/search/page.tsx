"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Zap, TrendingUp, BarChart3, Eye, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

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

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'from-emerald-500 to-green-500';
    if (percentage >= 60) return 'from-blue-500 to-cyan-500';
    if (percentage >= 40) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-pink-500';
  };

  const getImagePath = (docId: string | number) => {
    const numericId = String(docId).replace(/\D/g, '');
    return `/images/article_${numericId}.jpeg`;
  };

  const renderComparisonCard = (tfidfResult: SearchResult | null, bm25Result: SearchResult | null, index: number) => {
    const tfidfScore = tfidfResult?.score || 0;
    const bm25Score = bm25Result?.score || 0;
    
    // Use the result with higher score for display
    const mainResult = tfidfScore >= bm25Score ? tfidfResult : bm25Result;
    if (!mainResult) return null;

    const imagePath = getImagePath(mainResult.doc_id);
    const maxScore = Math.max(tfidfScore, bm25Score);

    return (
      <div 
        key={`comparison-${index}`}
        className="group relative bg-white/90 backdrop-blur-xl border border-white/40 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500"
      >
        {/* Rank Badge */}
        <div className="absolute -left-4 top-6 z-20">
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-purple-500 blur-xl opacity-60 animate-pulse" />
            <div className="relative w-14 h-14 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-2xl border-4 border-white">
              {index + 1}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8 mt-2">
          {/* Image */}
          <div className="md:w-80 shrink-0">
            <div className="relative aspect-video md:aspect-square rounded-2xl overflow-hidden shadow-xl">
              <img 
                src={imagePath}
                alt={mainResult.document.title || 'Article image'}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/default.jpg';
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-slate-900 via-blue-900 to-purple-900 leading-tight mb-4">
                {mainResult.document.title || 'Untitled Document'}
              </h3>
              
              {mainResult.document.cleaned_content && (
                <p className="text-base text-slate-700 leading-relaxed mb-6 line-clamp-3">
                  {mainResult.document.cleaned_content.substring(0, 250)}...
                </p>
              )}
            </div>

            {/* Algorithm Scores */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* TF-IDF Score */}
                <div className="bg-linear-to-br from-purple-50 to-fuchsia-50 p-4 rounded-2xl border-2 border-purple-200/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-purple-900">TF-IDF</span>
                  </div>
                  {tfidfResult ? (
                    <>
                      <div className="text-3xl font-black text-purple-600 mb-1">
                        {tfidfResult.score.toFixed(3)}
                      </div>
                      <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-linear-to-r from-purple-500 to-fuchsia-500"
                          style={{ width: `${(tfidfResult.score / maxScore) * 100}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-purple-400">Not ranked</div>
                  )}
                </div>

                {/* BM25 Score */}
                <div className="bg-linear-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border-2 border-emerald-200/50">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-emerald-900">BM25</span>
                  </div>
                  {bm25Result ? (
                    <>
                      <div className="text-3xl font-black text-emerald-600 mb-1">
                        {bm25Result.score.toFixed(3)}
                      </div>
                      <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-linear-to-r from-emerald-500 to-teal-500"
                          style={{ width: `${(bm25Result.score / maxScore) * 100}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-emerald-400">Not ranked</div>
                  )}
                </div>
              </div>

              {/* View Detail Button */}
              <Link 
                href={`/article/${mainResult.doc_id}`}
                className="group/link w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                <Eye className="w-5 h-5" />
                <span>View Detail</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-blue-200">Searching for "{query}"...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border-2 border-red-500/20 text-red-300 px-8 py-6 rounded-2xl max-w-lg">
          <p className="text-xl font-semibold mb-4">{error}</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  // Combine results for comparison
  const maxResults = Math.max(results?.tfidf?.length || 0, results?.bm25?.length || 0);
  const combinedResults = Array.from({ length: maxResults }, (_, i) => ({
    tfidf: results?.tfidf?.[i] || null,
    bm25: results?.bm25?.[i] || null,
  }));

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all backdrop-blur-sm border border-white/20 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Search</span>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-black bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Search Results
            </h1>
            <p className="text-xl text-blue-200/80">
              Query: <span className="font-bold text-white">"{query}"</span>
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="px-4 py-2 bg-purple-500/20 backdrop-blur-sm rounded-full border border-purple-400/30">
                <span className="text-purple-200 font-semibold">{results?.tfidf?.length || 0} TF-IDF Results</span>
              </div>
              <div className="px-4 py-2 bg-emerald-500/20 backdrop-blur-sm rounded-full border border-emerald-400/30">
                <span className="text-emerald-200 font-semibold">{results?.bm25?.length || 0} BM25 Results</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {combinedResults.map((item, index) => 
            renderComparisonCard(item.tfidf, item.bm25, index)
          )}
        </div>

        {combinedResults.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-4">
              <BarChart3 className="w-10 h-10 text-white/50" />
            </div>
            <p className="text-xl text-white/60">No results found for your query</p>
          </div>
        )}
      </div>
    </div>
  );
}
