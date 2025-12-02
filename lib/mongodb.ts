import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;

type CachedClient = {
  client: MongoClient | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __mongo: CachedClient | undefined;
}

const cached: CachedClient = global.__mongo || { client: null };

export async function getClient(): Promise<MongoClient> {
  if (cached.client) return cached.client;
  const client = new MongoClient(uri);
  await client.connect();
  cached.client = client;
  global.__mongo = cached;
  return client;
}

export async function getArticles(limit = 20) {
  const client = await getClient();
  const db = client.db();
  const col = db.collection("articles");
  const docs = await col
    .find({})
    .sort({ publishedAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map((x: any) => ({
    id: x._id?.toString?.() ?? String(Math.random()),
    title: x.title ?? "Untitled",
    excerpt: x.excerpt ?? x.summary ?? "",
    image: x.image ?? null,
    publishedAt: x.publishedAt ?? x.createdAt ?? null,
    url: x.url ?? null,
    content: x.content ?? "",
  }));
}
