import React from "react";

type Article = {
  id: string;
  title: string;
  excerpt?: string;
  image?: string | null;
  publishedAt?: string | Date | null;
  url?: string | null;
};

export default function ArticleCard({ article }: { article: Article }) {
  const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "";
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow duration-150">
      {article.image ? (
        <div className="h-40 w-full overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center bg-zinc-100 text-zinc-500">No image</div>
      )}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>{date}</span>
        </div>
        <h3 className="text-lg font-semibold text-zinc-900">{article.title}</h3>
        <p className="text-sm text-zinc-600 line-clamp-3">{article.excerpt}</p>
        <div className="mt-2">
          <a
            className="inline-block rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            href={article.url ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
          >
            Baca Selengkapnya
          </a>
        </div>
      </div>
    </article>
  );
}
