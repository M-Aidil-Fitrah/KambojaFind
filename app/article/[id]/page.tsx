"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ExternalLink, Calendar, Tag, Share2, TrendingUp, Zap, Award, BarChart3 } from 'lucide-react';
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

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;
  
  const [article, setArticle] = useState<ArticleData | null>(null);
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

  const getImagePath = (image: string) => {
    if (image.startsWith('article_')) {
      return `/images/${image}`;
    }
    return `/images/article_${image}`;
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.cleaned_content.substring(0, 200) + '...',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
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
        <div className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/20 backdrop-blur-xl hover:scale-105 shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold">Back</span>
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/20 backdrop-blur-xl hover:scale-105 shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-semibold">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Ranking & Algorithm Comparison Card */}
          {(article.rank || article.tfidf_score || article.bm25_score) && (
            <div className="mb-8 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Search Ranking & Algorithm Scores</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Rank */}
                {article.rank && (
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 hover:scale-105 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-6 h-6 text-yellow-400" />
                      <span className="text-white/70 font-semibold">Search Rank</span>
                    </div>
                    <p className="text-4xl font-black text-white">#{article.rank}</p>
                  </div>
                )}

                {/* TF-IDF Score */}
                {article.tfidf_score !== undefined && (
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 hover:scale-105 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-6 h-6 text-blue-400" />
                      <span className="text-white/70 font-semibold">TF-IDF Score</span>
                    </div>
                    <p className="text-4xl font-black text-blue-400">{article.tfidf_score.toFixed(4)}</p>
                    <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((article.tfidf_score / 1) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* BM25 Score */}
                {article.bm25_score !== undefined && (
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 hover:scale-105 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                      <span className="text-white/70 font-semibold">BM25 Score</span>
                    </div>
                    <p className="text-4xl font-black text-purple-400">{article.bm25_score.toFixed(4)}</p>
                    <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((article.bm25_score / 30) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Algorithm Used Badge */}
              {article.algorithm && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-white/60 text-sm font-semibold">Best Match Algorithm:</span>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                    article.algorithm === 'bm25' 
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {article.algorithm.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Featured Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 group border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <img 
              src={getImagePath(article.image)}
              alt={article.title}
              className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/default.jpg';
              }}
            />
            {/* Source Badge */}
            <div className="absolute top-6 left-6 z-20">
              <div className="px-5 py-2.5 bg-white/95 backdrop-blur-xl rounded-xl border border-white/50 shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
                <span className="font-black text-slate-900 uppercase text-sm tracking-wide">{article.source}</span>
              </div>
            </div>
          </div>

          {/* Article Header */}
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-8 md:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/30 mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 leading-tight mb-6">
              {article.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-600">
                <Tag className="w-5 h-5" />
                <span className="font-semibold">Article ID: {article.id}</span>
              </div>
              {article.published_date && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">{new Date(article.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
            </div>

            {/* Article Content */}
            <div className="mt-8 prose prose-lg max-w-none">
              <div className="text-lg text-slate-700 leading-relaxed whitespace-pre-line">
                {article.original_content || article.content || article.cleaned_content}
              </div>
            </div>

            {/* Source Link */}
            {article.url && (
              <div className="mt-10 pt-6 border-t border-slate-200">
                <a 
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                >
                  <ExternalLink className="w-6 h-6" />
                  <span>Read Full Article on {article.source}</span>
                </a>
              </div>
            )}
          </div>

          {/* Related Actions */}
          <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-black text-white">Want to search for similar articles?</h2>
            </div>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white font-bold rounded-xl transition-all border-2 border-white/30 hover:scale-105 shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Search</span>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
