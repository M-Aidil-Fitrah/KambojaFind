"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ExternalLink, Calendar, Tag, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import DarkVeil from '@/app/components/DarkVeil-Background';

type ArticleData = {
  id: number;
  title: string;
  url: string;
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
  };
};

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;
  
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [tfidfRanking, setTfidfRanking] = useState<RankedArticle[]>([]);
  const [bm25Ranking, setBm25Ranking] = useState<RankedArticle[]>([]);
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

        // Fetch rankings based on article title
        if (data.title) {
          const searchResponse = await fetch('/api/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: data.title,
              algorithm: 'both',
              top_k: 6 // Get 6 to show 5 (excluding current article if present)
            }),
          });

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            // Filter out current article and limit to 5
            setTfidfRanking((searchData.results.tfidf || []).filter((r: RankedArticle) => r.doc_id !== docId).slice(0, 5));
            setBm25Ranking((searchData.results.bm25 || []).filter((r: RankedArticle) => r.doc_id !== docId).slice(0, 5));
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
  }, [docId]);

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
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/50 backdrop-blur-md text-white rounded-lg transition-all border border-white/20 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-semibold">Back</span>
            </button>
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
                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-4">
                  {article.title}
                </h1>

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
    </div>
  );
}
