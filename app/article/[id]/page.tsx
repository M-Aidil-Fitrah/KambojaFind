"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ExternalLink, Calendar, Tag, Sparkles, Share2 } from 'lucide-react';
import Link from 'next/link';

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
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-blue-200">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border-2 border-red-500/20 text-red-300 px-8 py-6 rounded-2xl max-w-lg text-center">
          <p className="text-xl font-semibold mb-4">{error || 'Article not found'}</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Header Navigation */}
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold">Back</span>
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/20"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-semibold">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Featured Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 group">
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent z-10" />
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
              <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg">
                <span className="font-bold text-slate-900 uppercase text-sm">{article.source}</span>
              </div>
            </div>
          </div>

          {/* Article Header */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-slate-900 via-blue-900 to-purple-900 leading-tight mb-6">
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
                  className="inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                >
                  <ExternalLink className="w-6 h-6" />
                  <span>Read Full Article on {article.source}</span>
                </a>
              </div>
            )}
          </div>

          {/* Related Actions */}
          <div className="bg-linear-to-br from-blue-50/10 to-purple-50/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/20 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-black text-white">Want to search for similar articles?</h2>
            </div>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-all border-2 border-white/30"
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
