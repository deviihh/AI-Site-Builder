const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// A small set of always-available generic food photos, picked by rough category so that
// even if Unsplash is fully rate-limited, different kinds of dishes don't all show
// the exact same picture.
const CATEGORY_FALLBACKS: { keywords: string[]; url: string }[] = [
  { keywords: ["curry", "gravy", "stew", "molee"], url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80" },
  { keywords: ["rice", "biryani", "pulao", "fried rice"], url: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80" },
  { keywords: ["dosa", "idli", "appam", "puttu", "dosa"], url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80" },
  { keywords: ["prawn", "fish", "seafood", "crab"], url: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80" },
  { keywords: ["chicken", "beef", "meat", "pork"], url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80" },
  { keywords: ["dessert", "pudding", "sweet", "payasam"], url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80" },
  { keywords: ["interior", "restaurant", "furniture", "seating"], url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80" },
  { keywords: ["chef", "cook", "kitchen"], url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80" },
];
const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80";

function pickCategoryFallback(query: string): string {
  const lower = query.toLowerCase();
  for (const category of CATEGORY_FALLBACKS) {
    if (category.keywords.some((k) => lower.includes(k))) {
      return category.url;
    }
  }
  return DEFAULT_FALLBACK;
}

async function searchUnsplash(query: string): Promise<string | null> {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
  });

  if (!res.ok) {
    console.log(`Unsplash search failed (${res.status}) for "${query}"`);
    return null;
  }

  const data = await res.json();
  const photo = data.results?.[0];
  return photo?.urls?.regular || null;
}

function truncateAtWord(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
}

/**
 * Searches Unsplash for a photo matching the given query and returns a direct image URL.
 * Only tries the exact query, then one broader version (never below 3 words, to avoid
 * collapsing into an unrelated proper noun) — kept to 2 attempts total to conserve the
 * free-tier rate limit. Falls back to a category-appropriate generic photo, chosen by
 * keyword, if both attempts fail (including on a 403 rate-limit response).
 */
export async function findImageUrl(query: string): Promise<string> {
  const placeholderFallback = `https://placehold.co/800x600/e2e8f0/64748b?text=${encodeURIComponent(truncateAtWord(query, 24))}`;

  if (!UNSPLASH_ACCESS_KEY) {
    console.log("UNSPLASH_ACCESS_KEY not set, using fallback placeholder");
    return placeholderFallback;
  }

  const FILLER = new Set(["a", "an", "the", "in", "on", "of", "with", "and", "for", "to", "at", "by", "from", "side", "view", "close-up"]);
  const keywords = query.trim().split(/\s+/).filter((w) => !FILLER.has(w.toLowerCase()));
  const attempts = [query];
  if (keywords.length > 2) {
    attempts.push(keywords.slice(0, 3).join(" "));
  }

  try {
    for (const attempt of attempts) {
      const photoUrl = await searchUnsplash(attempt);
      if (photoUrl) {
        if (attempt !== query) {
          console.log(`No exact Unsplash result for "${query}", used broader match "${attempt}"`);
        }
        return photoUrl;
      }
    }
    const categoryUrl = pickCategoryFallback(query);
    console.log(`No usable Unsplash result for "${query}", using category fallback`);
    return categoryUrl;
  } catch (err) {
    console.log(`Unsplash search error for "${query}":`, err);
    return placeholderFallback;
  }
}

export async function resolveImagePlaceholders(html: string): Promise<string> {
  const pattern = /data-img-query="([^"]+)"/g;
  const matches = [...html.matchAll(pattern)];
  if (matches.length === 0) return html;

  const uniqueQueries = [...new Set(matches.map((m) => m[1]))];
  const urlByQuery: Record<string, string> = {};

  await Promise.all(
    uniqueQueries.map(async (query) => {
      urlByQuery[query] = await findImageUrl(query);
    })
  );

  const resolved = html.replace(pattern, (fullMatch, query) => `data-img-query="${query}" src="${urlByQuery[query]}"`);

  // Check each <script> block on its own, and only remove one that itself touches data-img-query.
  const stripped = resolved.replace(
    /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi,
    (whole: string, body: string) => (body.includes("data-img-query") ? "" : whole)
  );

  return stripped;
}