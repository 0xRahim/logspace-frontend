"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Hash,
  TrendingUp,
  Heart,
  MessageCircle,
  Bookmark,
  Loader2,
  UserRound,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { loadSession } from "@/lib/authService";

// ── API types ─────────────────────────────────────────────────────────────────

interface ApiPost {
  id: string;
  type: string;
  title: string | null;
  content: string | null;
  category: string | null;
  likes_count: number;
  replies_count: number;
  is_liked: boolean;
  is_saved: boolean;
  hashtags: string[];
  author_name: string;
  author_username: string;
  author_avatar: string | null;
  created_at: string;
}

interface ApiUser {
  id: string;
  username: string;
  name: string;
  avatar_url: string | null;
  bio: string;
  karma: number;
  followers_count: number;
}

interface ApiTag {
  name: string;
  uses_count: number;
}

interface SearchResponse {
  posts: ApiPost[];
  users: ApiUser[];
  tags: ApiTag[];
  query: { q: string; categories: string[]; tags: string[] };
}

interface TrendingResponse {
  categories: { name: string; post_count: number }[];
  hashtags: { name: string; uses_count: number }[];
}

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL   = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const PAGE_LIMIT = 20;
const DEBOUNCE   = 350; // ms

// ── API helpers ───────────────────────────────────────────────────────────────

function buildSearchUrl(
  q: string,
  categories: string[],
  tags: string[],
  offset: number
): string {
  const params = new URLSearchParams();
  params.set("q", q);
  params.set("limit", String(PAGE_LIMIT));
  params.set("offset", String(offset));
  categories.forEach((c) => params.append("categories[]", c));
  tags.forEach((t) => params.append("tags[]", t));
  return `${BASE_URL}/api/search?${params.toString()}`;
}

async function fetchSearch(
  q: string,
  categories: string[],
  tags: string[],
  offset: number,
  token?: string
): Promise<SearchResponse> {
  const url = buildSearchUrl(q, categories, tags, offset);
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

async function fetchTrending(token?: string): Promise<TrendingResponse> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api/explore/trending`, { headers });
  if (!res.ok) throw new Error("Failed to load trending");
  return res.json();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PostCard({ post }: { post: ApiPost }) {
  const [liked, setLiked]   = useState(post.is_liked);
  const [saved, setSaved]   = useState(post.is_saved);
  const [likes, setLikes]   = useState(post.likes_count);

  async function toggleLike() {
    const session = loadSession();
    if (!session) return;

    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));

    try {
      await fetch(`${BASE_URL}/api/posts/${post.id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}` },
      });
    } catch {
      // revert on failure
      setLiked(!next);
      setLikes((n) => n + (next ? -1 : 1));
    }
  }

  async function toggleSave() {
    const session = loadSession();
    if (!session) return;

    const next = !saved;
    setSaved(next);

    try {
      await fetch(`${BASE_URL}/api/posts/${post.id}/save`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}` },
      });
    } catch {
      setSaved(!next);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.author_avatar ?? undefined} />
            <AvatarFallback>{post.author_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{post.author_name}</div>
            <div className="text-sm text-muted-foreground">
              @{post.author_username}
              {post.category ? ` · ${post.category}` : ""}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {post.title && (
          <Link href={`/post/${post.id}`} className="block hover:underline">
            <h3 className="font-semibold text-lg">{post.title}</h3>
          </Link>
        )}

        {post.content && (
          <p className="text-muted-foreground line-clamp-2">{post.content}</p>
        )}

        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((t) => (
              <Badge key={t} variant="secondary">#{t}</Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLike}
            className={liked ? "text-rose-500 hover:text-rose-600" : ""}
          >
            <Heart className={`h-4 w-4 mr-2 ${liked ? "fill-current" : ""}`} />
            {likes}
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link href={`/post/${post.id}`}>
              <MessageCircle className="h-4 w-4 mr-2" />
              {post.replies_count}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`ml-auto ${saved ? "text-primary" : ""}`}
            onClick={toggleSave}
          >
            <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function UserCard({ user }: { user: ApiUser }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <Link href={`/user/${user.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Avatar>
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium truncate">{user.name}</div>
            <div className="text-sm text-muted-foreground">@{user.username}</div>
            {user.bio && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{user.bio}</p>
            )}
          </div>
          <div className="ml-auto shrink-0 text-right text-sm text-muted-foreground">
            <div className="font-medium text-foreground">{user.followers_count.toLocaleString()}</div>
            <div>followers</div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [query, setQuery]                         = useState("");
  const [debouncedQuery, setDebouncedQuery]       = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags]           = useState<string[]>([]);

  // Trending (shown when query is empty)
  const [trending, setTrending]           = useState<TrendingResponse | null>(null);
  const [trendingLoading, setTrendingLoading] = useState(true);

  // Search results
  const [posts, setPosts]     = useState<ApiPost[]>([]);
  const [users, setUsers]     = useState<ApiUser[]>([]);
  const [apiTags, setApiTags] = useState<ApiTag[]>([]);
  const [total, setTotal]     = useState(0);
  const [offset, setOffset]   = useState(0);
  const [searching, setSearching]   = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auth token (optional — enriches is_liked / is_saved) ─────────────────
  const token = loadSession()?.token;

  // ── Load trending once on mount ───────────────────────────────────────────
  useEffect(() => {
    setTrendingLoading(true);
    fetchTrending(token)
      .then(setTrending)
      .catch(() => {})
      .finally(() => setTrendingLoading(false));
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Debounce query input ──────────────────────────────────────────────────
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
      setOffset(0);
    }, DEBOUNCE);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [query]);

  // ── Fire search whenever debounced query or filters change ────────────────
  useEffect(() => {
    // Always search (even empty query returns all posts)
    setSearching(true);
    setSearchError(null);

    fetchSearch(debouncedQuery, selectedCategories, selectedTags, 0, token)
      .then((data) => {
        setPosts(data.posts);
        setUsers(data.users);
        setApiTags(data.tags);
        setOffset(0);
      })
      .catch(() => setSearchError("Search failed. Please try again."))
      .finally(() => setSearching(false));
  }, [debouncedQuery, selectedCategories, selectedTags]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load more (pagination) ────────────────────────────────────────────────
  async function loadMore() {
    const nextOffset = offset + PAGE_LIMIT;
    setLoadingMore(true);
    try {
      const data = await fetchSearch(debouncedQuery, selectedCategories, selectedTags, nextOffset, token);
      setPosts((prev) => [...prev, ...data.posts]);
      setOffset(nextOffset);
    } catch {
      // silent — user can retry
    } finally {
      setLoadingMore(false);
    }
  }

  // ── Filter toggles ────────────────────────────────────────────────────────
  function toggleCategory(name: string) {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name]
    );
    setOffset(0);
  }

  function toggleTag(name: string) {
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name]
    );
    setOffset(0);
  }

  const hasFilters    = selectedCategories.length > 0 || selectedTags.length > 0;
  const showTrending  = !query && !hasFilters;
  const hasMore       = posts.length > 0 && posts.length % PAGE_LIMIT === 0;

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      {/* HEADER */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Search</h1>

        {/* SEARCH INPUT */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, categories, hashtags..."
            className="pl-10 pr-10"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setDebouncedQuery(""); }}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* TRENDING — only when idle */}
        {showTrending && !trendingLoading && trending && (
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <TrendingUp className="h-4 w-4" />
                Trending Categories
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {trending.categories.map((c) => (
                  <Badge
                    key={c.name}
                    className="cursor-pointer"
                    onClick={() => toggleCategory(c.name)}
                  >
                    {c.name}
                    <span className="ml-1 opacity-60 text-xs">
                      {c.post_count.toLocaleString()}
                    </span>
                  </Badge>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <Hash className="h-4 w-4" />
                Trending Hashtags
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {trending.hashtags.map((t) => (
                  <Badge
                    key={t.name}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => toggleTag(t.name)}
                  >
                    #{t.name}
                    <span className="ml-1 opacity-60 text-xs">
                      {t.uses_count.toLocaleString()}
                    </span>
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {showTrending && trendingLoading && (
          <div className="grid md:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <Card key={i}>
                <CardContent className="h-24 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ACTIVE FILTERS */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((c) => (
              <Badge key={c} className="gap-1 cursor-pointer" onClick={() => toggleCategory(c)}>
                {c}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            {selectedTags.map((t) => (
              <Badge key={t} variant="outline" className="gap-1 cursor-pointer" onClick={() => toggleTag(t)}>
                #{t}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            <button
              onClick={() => { setSelectedCategories([]); setSelectedTags([]); }}
              className="text-xs text-muted-foreground hover:text-foreground underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* SEARCHING SPINNER */}
      {searching && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* ERROR */}
      {searchError && !searching && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {searchError}
          </CardContent>
        </Card>
      )}

      {/* RESULTS */}
      {!searching && !searchError && (
        <div className="space-y-6">

          {/* Users section — shown when there are user matches */}
          {users.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                <UserRound className="h-3.5 w-3.5" />
                People
              </div>
              <div className="space-y-2">
                {users.map((u) => <UserCard key={u.id} user={u} />)}
              </div>
            </div>
          )}

          {/* Tag matches — shown when searching */}
          {apiTags.length > 0 && query && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                <Hash className="h-3.5 w-3.5" />
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {apiTags.map((t) => (
                  <Badge
                    key={t.name}
                    variant="outline"
                    className="cursor-pointer text-sm px-3 py-1"
                    onClick={() => toggleTag(t.name)}
                  >
                    #{t.name}
                    <span className="ml-2 opacity-60">{t.uses_count.toLocaleString()}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Posts */}
          <div className="space-y-4">
            {(users.length > 0 || apiTags.length > 0) && posts.length > 0 && (
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Search className="h-3.5 w-3.5" />
                Posts · {posts.length}{hasMore ? "+" : ""} result{posts.length !== 1 ? "s" : ""}
              </div>
            )}

            {posts.length === 0 && !users.length && !apiTags.length ? (
              <Card>
                <CardContent className="py-20 text-center">
                  <Search className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <p className="font-medium">No results found</p>
                  <p className="text-sm text-muted-foreground">
                    Try different keywords or filters
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {posts.map((post) => <PostCard key={post.id} post={post} />)}

                {hasMore && (
                  <div className="flex justify-center pt-2">
                    <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                      {loadingMore
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading…</>
                        : "Load more"
                      }
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}