import type { NewsArticle } from "./types";
import { news } from "./mock-data";
import { cloneNewsArticle } from "./utils";

export async function getLatestNews({
  limit = 3,
}: {
  limit?: number;
} = {}): Promise<NewsArticle[]> {
  const items = await getNews();
  return items.slice(0, Math.max(limit, 0));
}

export async function getHighlightedNewsArticle(): Promise<
  NewsArticle | undefined
> {
  const highlighted = news
    .filter((article) => article.highlight)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

  const [first] = highlighted;

  if (!first) {
    return undefined;
  }

  return cloneNewsArticle(first);
}

export async function getNews(): Promise<NewsArticle[]> {
  const sorted = [...news].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return sorted.map((article) => cloneNewsArticle(article));
}

export async function getNewsArticle(
  slug: string,
): Promise<NewsArticle | undefined> {
  const article = news.find((entry) => entry.slug === slug);

  if (!article) {
    return undefined;
  }

  return cloneNewsArticle(article);
}
