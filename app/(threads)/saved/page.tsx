"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookmarkX,
  Heart,
  MessageCircle,
  Trash2,
  Clock,
  ArrowDownUp,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { loadSession } from "@/lib/authService";

// ── API types ─────────────────────────────────────────────────────────────────

interface ApiPost {
  id: string;
  title: string | null;
  content: string | null;
  category: string | null;
  likes_count: number;
  replies_count: number;
  is_liked: boolean;
  is_saved: boolean;
  created_at: string;
  author_name: string;
  author_username: string;
  author_avatar: string | null;
  hashtags: string[];
}

interface SavedResponse {
  posts: ApiPost[];
  total: number;
  limit: number;
  offset: number;
}

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL   = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const PAGE_LIMIT = 20;

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(raw: string): string {
  const date    = new Date(raw.replace(" ", "T") + "Z");
  const diffMs  = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1)   return "just now";
  if (diffMin < 60)  return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr  < 24)  return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30)  return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

async function fetchSaved(token: string, offset: number): Promise<SavedResponse> {
  const res = await fetch(
    `${BASE_URL}/api/saved?limit=${PAGE_LIMIT}&offset=${offset}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("Failed to fetch saved posts");
  return res.json();
}

async function apiToggleSave(postId: string, token: string): Promise<{ saved: boolean }> {
  const res = await fetch(`${BASE_URL}/api/posts/${postId}/save`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to update save");
  return res.json();
}

// ── Internal post shape ───────────────────────────────────────────────────────

interface SavedPost {
  id: string;
  title: string;
  description: string;
  category: string;
  likes: number;
  comments: number;
  // epoch ms of created_at — used for client-side oldest/newest sort
  createdAtMs: number;
  createdAtLabel: string;
}

function toSavedPost(api: ApiPost): SavedPost {
  return {
    id:             api.id,
    title:          api.title ?? "(untitled)",
    description:    api.content ?? "",
    category:       api.category ?? "General",
    likes:          api.likes_count,
    comments:       api.replies_count,
    createdAtMs:    new Date(api.created_at.replace(" ", "T") + "Z").getTime(),
    createdAtLabel: relativeTime(api.created_at),
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

type SortMode = "newest" | "oldest" | "popular";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SavedPage() {
  const [posts, setPosts]         = useState<SavedPost[]>([]);
  const [total, setTotal]         = useState(0);
  const [offset, setOffset]       = useState(0);

  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // Track which post IDs are mid-unsave request so we can show per-card spinner
  const [unsaving, setUnsaving]   = useState<Set<string>>(new Set());

  const [sort, setSort]           = useState<SortMode>("newest");

  const session = loadSession();

  // ── Initial fetch ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!session) return;

    setLoading(true);
    setError(null);

    fetchSaved(session.token, 0)
      .then((data) => {
        setPosts(data.posts.map(toSavedPost));
        setTotal(data.total);
        setOffset(0);
      })
      .catch(() => setError("Failed to load saved posts. Please refresh."))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load more ─────────────────────────────────────────────────────────────

  async function loadMore() {
    if (!session) return;
    const nextOffset = offset + PAGE_LIMIT;
    setLoadingMore(true);
    try {
      const data = await fetchSaved(session.token, nextOffset);
      setPosts((prev) => [...prev, ...data.posts.map(toSavedPost)]);
      setOffset(nextOffset);
    } catch {
      // silent — user can retry
    } finally {
      setLoadingMore(false);
    }
  }

  // ── Unsave ────────────────────────────────────────────────────────────────

  async function handleUnsave(id: string) {
    if (!session) return;

    // Optimistically remove from list
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setTotal((n) => n - 1);
    setUnsaving((prev) => new Set(prev).add(id));

    try {
      await apiToggleSave(id, session.token);
    } catch {
      // Revert: we'd need to re-fetch to restore the exact position.
      // Simpler UX: just re-fetch page 1 on failure.
      try {
        const data = await fetchSaved(session.token, 0);
        setPosts(data.posts.map(toSavedPost));
        setTotal(data.total);
        setOffset(0);
      } catch {
        setError("Something went wrong. Please refresh.");
      }
    } finally {
      setUnsaving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  // ── Sort ──────────────────────────────────────────────────────────────────
  // API returns newest-saved first. We have created_at on each post.
  // For "newest" / "oldest" we sort by createdAtMs as a proxy.
  // For "popular" we sort by likes.

  const sortedPosts = useMemo(() => {
    const data = [...posts];
    switch (sort) {
      case "oldest":  return data.sort((a, b) => a.createdAtMs - b.createdAtMs);
      case "popular": return data.sort((a, b) => b.likes - a.likes);
      default:        return data.sort((a, b) => b.createdAtMs - a.createdAtMs);
    }
  }, [posts, sort]);

  // ── Group by category ─────────────────────────────────────────────────────

  const grouped = useMemo(() => {
    return sortedPosts.reduce<Record<string, SavedPost[]>>((acc, post) => {
      if (!acc[post.category]) acc[post.category] = [];
      acc[post.category].push(post);
      return acc;
    }, {});
  }, [sortedPosts]);

  const hasMore = posts.length < total;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Saved</h1>
        <p className="text-muted-foreground">
          Your bookmarked posts for later reading
        </p>
      </div>

      {/* SORT CONTROLS */}
      <div className="flex gap-2 items-center">
        <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
        <Button variant={sort === "newest"  ? "default" : "outline"} size="sm" onClick={() => setSort("newest")}>
          Newest
        </Button>
        <Button variant={sort === "oldest"  ? "default" : "outline"} size="sm" onClick={() => setSort("oldest")}>
          Oldest
        </Button>
        <Button variant={sort === "popular" ? "default" : "outline"} size="sm" onClick={() => setSort("popular")}>
          Most Liked
        </Button>

        {!loading && total > 0 && (
          <span className="ml-auto text-sm text-muted-foreground">
            {total} saved
          </span>
        )}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <Card>
          <CardContent className="py-12 text-center space-y-2">
            <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && posts.length === 0 && (
        <Card>
          <CardContent className="py-20 text-center">
            <BookmarkX className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h2 className="font-semibold text-lg">No saved posts</h2>
            <p className="text-muted-foreground">Save posts to read them later.</p>
          </CardContent>
        </Card>
      )}

      {/* GROUPED POSTS */}
      {!loading && !error && posts.length > 0 && (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, categoryPosts]) => (
            <div key={category} className="space-y-3">

              {/* CATEGORY HEADER */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{category}</Badge>
                <span className="text-sm text-muted-foreground">
                  {categoryPosts.length} saved
                </span>
              </div>

              {/* POSTS */}
              <div className="space-y-3">
                {categoryPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition">
                    <CardHeader className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {post.createdAtLabel}
                        </Badge>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUnsave(post.id)}
                          disabled={unsaving.has(post.id)}
                          title="Remove from saved"
                        >
                          {unsaving.has(post.id)
                            ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            : <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                          }
                        </Button>
                      </div>

                      <h3 className="text-lg font-semibold">{post.title}</h3>
                      <p className="text-muted-foreground line-clamp-2">{post.description}</p>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center gap-4 border-t pt-3">
                        <Button variant="ghost" size="sm">
                          <Heart className="h-4 w-4 mr-2" />
                          {post.likes}
                        </Button>

                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {post.comments}
                        </Button>

                        <Button variant="ghost" size="sm" className="ml-auto" asChild>
                          <Link href={`/post/${post.id}`}>View</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {/* LOAD MORE */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading…</>
                  : `Load more (${total - posts.length} remaining)`
                }
              </Button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}