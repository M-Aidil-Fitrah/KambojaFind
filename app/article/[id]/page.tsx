"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowLeft, ExternalLink, Calendar, Tag, TrendingUp, Zap, BarChart3, X } from 'lucide-react';
import Link from 'next/link';
import DarkVeil from '@/app/components/DarkVeil-Background';

type ArticleData = {
  id: number;
  title: string;
  url?: string;
  source: string;
  original_content: string;
  content: string;
  cleaned_content: string;
  image: string;
  published_date?: string;
  tfidf_score?: number;
  bm25_score?: number;
  rank?: number;
  algorithm?: 'tfidf' | 'bm25';
};

type RankedArticle = {
  doc_id: string;
  score: number;
  document: {
    title?: string;
    image?: string;
    original_content?: string;
    cleaned_content?: string;
    url?: string;
  };
};

export default function ArticleDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    }>
      <ArticleDetailContent />
    </Suspense>
  );
}

function ArticleDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = params.id as string;
  
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [tfidfRanking, setTfidfRanking] = useState<RankedArticle[]>([]);
  const [bm25Ranking, setBm25Ranking] = useState<RankedArticle[]>([]);
  const [currentTfidfScore, setCurrentTfidfScore] = useState<number>(0);
  const [currentBm25Score, setCurrentBm25Score] = useState<number>(0);
  const [currentTfidfRank, setCurrentTfidfRank] = useState<number>(0);
  const [currentBm25Rank, setCurrentBm25Rank] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/article/${docId}`);
        
        if (!response.ok) {
          throw new Error('Article not found');
        }

        const data = await response.json();
        setArticle(data);

        // Get query from URL params or use article title as fallback
        const queryFromParams = searchParams.get('q') || data.title;
        
        // Fetch rankings based on query
        if (queryFromParams) {
          setSearchQuery(queryFromParams); // Save the query
          const searchResponse = await fetch('/api/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: queryFromParams,
              algorithm: 'both',
              top_k: 20 // Get more results to ensure we find current article
            }),
          });

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            // Filter out current article and limit to 5
            const tfidfResults = searchData.results.tfidf || [];
            const bm25Results = searchData.results.bm25 || [];
            
            console.log('Current docId:', docId);
            console.log('TF-IDF results:', tfidfResults.map((r: RankedArticle) => ({ doc_id: r.doc_id, score: r.score })));
            console.log('BM25 results:', bm25Results.map((r: RankedArticle) => ({ doc_id: r.doc_id, score: r.score })));
            
            // Find current article's score and rank
            // Try both exact match and URL match
            const tfidfCurrentIndex = tfidfResults.findIndex((r: RankedArticle) => {
              const rDocId = String(r.doc_id);
              const currentDocId = String(docId);
              return rDocId === currentDocId || 
                     r.document?.url === currentDocId || 
                     rDocId.includes(currentDocId) || 
                     currentDocId.includes(rDocId);
            });
            const bm25CurrentIndex = bm25Results.findIndex((r: RankedArticle) => {
              const rDocId = String(r.doc_id);
              const currentDocId = String(docId);
              return rDocId === currentDocId || 
                     r.document?.url === currentDocId || 
                     rDocId.includes(currentDocId) || 
                     currentDocId.includes(rDocId);
            });
            
            console.log('TF-IDF index:', tfidfCurrentIndex);
            console.log('BM25 index:', bm25CurrentIndex);
            
            if (tfidfCurrentIndex !== -1) {
              setCurrentTfidfScore(tfidfResults[tfidfCurrentIndex].score);
              setCurrentTfidfRank(tfidfCurrentIndex + 1);
              console.log('Set TF-IDF score:', tfidfResults[tfidfCurrentIndex].score, 'rank:', tfidfCurrentIndex + 1);
            }
            
            if (bm25CurrentIndex !== -1) {
              setCurrentBm25Score(bm25Results[bm25CurrentIndex].score);
              setCurrentBm25Rank(bm25CurrentIndex + 1);
              console.log('Set BM25 score:', bm25Results[bm25CurrentIndex].score, 'rank:', bm25CurrentIndex + 1);
            }
            
            setTfidfRanking(tfidfResults.filter((r: RankedArticle) => {
              const rDocId = String(r.doc_id);
              const currentDocId = String(docId);
              return rDocId !== currentDocId && r.document?.url !== currentDocId;
            }).slice(0, 5));
            setBm25Ranking(bm25Results.filter((r: RankedArticle) => {
              const rDocId = String(r.doc_id);
              const currentDocId = String(docId);
              return rDocId !== currentDocId && r.document?.url !== currentDocId;
            }).slice(0, 5));
          }
        }
      } catch (err) {
        setError('Failed to load article. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (docId) {
      fetchArticle();
    }
  }, [docId, searchParams]);

  const getImagePath = (image: string | number) => {
    const imageStr = String(image);
    if (imageStr.startsWith('article_')) {
      return `/images/${imageStr}`;
    }
    return `/images/article_${imageStr}.jpeg`;
  };

  const renderRankingCard = (result: RankedArticle, index: number, algorithm: 'tfidf' | 'bm25') => {
    const imagePath = result.document.image 
      ? getImagePath(result.document.image)
      : getImagePath(result.doc_id);
    
    // Prioritize original_content for preview, fallback to cleaned_content
    const contentSource = result.document.original_content || result.document.cleaned_content || '';
    const previewText = contentSource 
      ? contentSource.substring(0, 50) + '...'
      : 'No preview available';

    return (
      <Link 
        key={result.doc_id}
        href={`/article/${result.doc_id}`}
        className="group block bg-black/30 hover:bg-black/40 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden transition-all hover:border-white/30"
      >
        <div className="flex gap-3 p-3">
          {/* Image */}
          <div className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden bg-black/20">
            <img 
              src={imagePath}
              alt={result.document.title || 'Article'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/default.jpg';
              }}
            />
            {/* Glass overlay on image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-bold text-white line-clamp-2 group-hover:text-blue-300 transition-colors">
                {result.document.title || 'Untitled'}
              </h4>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                algorithm === 'tfidf' 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}>
                #{index + 1}
              </span>
            </div>
            <p className="text-xs text-white/60 line-clamp-2 mb-1">{previewText}</p>
            <p className={`text-xs font-semibold ${
              algorithm === 'tfidf' ? 'text-blue-400' : 'text-purple-400'
            }`}>
              Score: {result.score.toFixed(4)}
            </p>
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
              <div className="w-32 h-32 border-4 border-purple-500/30 rounded-full animate-ping"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-4 border-blue-500/30 rounded-full animate-pulse"></div>
            </div>
            <Loader2 className="w-16 h-16 text-white animate-spin relative z-10 mx-auto" />
          </div>
          <p className="text-2xl font-bold text-white mb-2">Loading Article...</p>
          <p className="text-white/60">Fetching content from database</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
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
        
        <div className="relative z-10 bg-red-500/10 backdrop-blur-xl border-2 border-red-500/30 text-red-300 px-8 py-6 rounded-3xl max-w-lg text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <p className="text-2xl font-bold mb-4">{error || 'Article not found'}</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/30 text-white font-bold rounded-xl transition-all hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
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

      <div className="relative z-10">
        {/* Header Navigation */}
        <div className="bg-black/30 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/50 backdrop-blur-md text-white rounded-lg transition-all border border-white/20 hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-semibold">Back</span>
              </button>
              
              {searchQuery && (
                <div className="flex-1 max-w-2xl">
                  <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2">
                    <p className="text-xs text-white/60 mb-1">Search Query:</p>
                    <p className="text-sm text-white font-semibold truncate">{searchQuery}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Article Content (2/3 width) */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Featured Image */}
              <div className="relative rounded-xl overflow-hidden border border-white/10">
                <img 
                  src={getImagePath(article.image)}
                  alt={article.title}
                  className="w-full aspect-video object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/default.jpg';
                  }}
                />
                {/* Source Badge */}
                <div className="absolute top-4 left-4">
                  <div className="px-4 py-2 bg-white/95 backdrop-blur-xl rounded-lg border border-white/50">
                    <span className="font-bold text-slate-900 uppercase text-xs tracking-wide">{article.source}</span>
                  </div>
                </div>
              </div>

              {/* Article Header & Content */}
              <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-2xl md:text-3xl font-black text-white leading-tight flex-1">
                    {article.title}
                  </h1>
                  <button
                    onClick={() => setShowScoreModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold rounded-lg transition-all hover:scale-105 border border-white/30 shrink-0"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Score</span>
                  </button>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 pb-4 mb-4 border-b border-white/20">
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Tag className="w-4 h-4" />
                    <span className="font-semibold">ID: {article.id}</span>
                  </div>
                  {article.published_date && (
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold">{new Date(article.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  )}
                </div>

                {/* Article Content */}
                <div className="prose prose-sm max-w-none">
                  <div className="text-base text-white/90 leading-relaxed whitespace-pre-line">
                    {article.original_content || article.content || article.cleaned_content}
                  </div>
                </div>

                {/* Source Link */}
                {article.url && (
                  <div className="mt-6 pt-4 border-t border-white/20">
                    <a 
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold rounded-lg transition-all hover:scale-105 border border-white/30"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>Baca Selengkapnya di {article.source}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Rankings (1/3 width) */}
            <div className="lg:col-span-1 space-y-4">
              
              {/* TF-IDF Ranking */}
              <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">TF-IDF Top 5</h3>
                </div>
                <div className="space-y-2">
                  {tfidfRanking.length > 0 ? (
                    tfidfRanking.map((result, index) => renderRankingCard(result, index, 'tfidf'))
                  ) : (
                    <p className="text-white/50 text-sm text-center py-4">No similar articles</p>
                  )}
                </div>
              </div>

              {/* BM25 Ranking */}
              <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">BM25 Top 5</h3>
                </div>
                <div className="space-y-2">
                  {bm25Ranking.length > 0 ? (
                    bm25Ranking.map((result, index) => renderRankingCard(result, index, 'bm25'))
                  ) : (
                    <p className="text-white/50 text-sm text-center py-4">No similar articles</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Score Comparison Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-black/90 backdrop-blur-xl border-2 border-white/30 rounded-2xl shadow-2xl flex flex-col">
            {/* Modal Header - Sticky */}
            <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-xl border-b border-white/20 p-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">Score Comparison & Evaluation</h2>
                <p className="text-sm text-white/60">Algorithm Performance Metrics</p>
              </div>
              <button
                onClick={() => setShowScoreModal(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              
              {/* Search Query Info */}
              <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4">
                <p className="text-xs text-blue-300 font-semibold mb-1">Current Search Query:</p>
                <p className="text-sm text-white font-bold">{searchQuery}</p>
              </div>

              {/* Score Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* TF-IDF Score */}
                <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-bold text-white">TF-IDF Algorithm</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-blue-300 mb-1">Relevance Score</p>
                      <p className="text-3xl font-black text-blue-400">
                        {currentTfidfScore !== null && currentTfidfScore !== undefined ? currentTfidfScore.toFixed(4) : 'N/A'}
                      </p>
                    </div>
                    
                    <div className="pt-3 border-t border-blue-500/30">
                      <p className="text-sm text-blue-300 mb-1">Rank Position</p>
                      <p className="text-2xl font-bold text-white">
                        #{currentTfidfRank !== null && currentTfidfRank !== undefined && currentTfidfRank > 0 ? currentTfidfRank : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* BM25 Score */}
                <div className="bg-purple-500/10 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-bold text-white">BM25 Algorithm</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-purple-300 mb-1">Relevance Score</p>
                      <p className="text-3xl font-black text-purple-400">
                        {currentBm25Score !== null && currentBm25Score !== undefined ? currentBm25Score.toFixed(4) : 'N/A'}
                      </p>
                    </div>
                    
                    <div className="pt-3 border-t border-purple-500/30">
                      <p className="text-sm text-purple-300 mb-1">Rank Position</p>
                      <p className="text-2xl font-bold text-white">
                        #{currentBm25Rank !== null && currentBm25Rank !== undefined && currentBm25Rank > 0 ? currentBm25Rank : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evaluation Metrics */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-white" />
                  Evaluation Metrics
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* TF-IDF Metrics */}
                  <div>
                    <h4 className="text-sm font-bold text-blue-400 mb-3">TF-IDF Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/10">
                        <span className="text-sm text-white/70">Precision</span>
                        <span className="text-sm font-bold text-white">0.0000</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/10">
                        <span className="text-sm text-white/70">Recall</span>
                        <span className="text-sm font-bold text-white">0.0000</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/10">
                        <span className="text-sm text-white/70">F1 Score</span>
                        <span className="text-sm font-bold text-white">0.0000</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/10">
                        <span className="text-sm text-white/70">MAP</span>
                        <span className="text-sm font-bold text-white">0.0000</span>
                      </div>
                    </div>
                  </div>

                  {/* BM25 Metrics */}
                  <div>
                    <h4 className="text-sm font-bold text-purple-400 mb-3">BM25 Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/10">
                        <span className="text-sm text-white/70">Precision</span>
                        <span className="text-sm font-bold text-white">0.0000</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/10">
                        <span className="text-sm text-white/70">Recall</span>
                        <span className="text-sm font-bold text-white">0.0000</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/10">
                        <span className="text-sm text-white/70">F1 Score</span>
                        <span className="text-sm font-bold text-white">0.0000</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/10">
                        <span className="text-sm text-white/70">MAP</span>
                        <span className="text-sm font-bold text-white">0.0000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowScoreModal(false)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-lg transition-all border border-white/20"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
