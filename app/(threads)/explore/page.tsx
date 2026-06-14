"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  TrendingUp,
  Clock,
  Heart,
  MessageCircle,
  Bookmark,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
}

interface PostsResponse {
  posts: ApiPost[];
  total: number;
}

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL   = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const PAGE_LIMIT = 20;

type Tab = "hot" | "rising" | "latest";

// ── Fetch ─────────────────────────────────────────────────────────────────────

async function fetchPosts(sort: Tab, offset: number, token?: string): Promise<PostsResponse> {
  const params = new URLSearchParams({
    sort,
    limit: String(PAGE_LIMIT),
    offset: String(offset),
  });

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api/posts?${params}`, { headers });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

// ── Post card ─────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: ApiPost }) {
  const [liked,  setLiked]  = useState(post.is_liked);
  const [saved,  setSaved]  = useState(post.is_saved);
  const [likes,  setLikes]  = useState(post.likes_count);
  const [liking, setLiking] = useState(false);
  const [saving, setSaving] = useState(false);

  const session = loadSession();

  async function toggleLike() {
    if (!session || liking) return;
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    setLiking(true);
    try {
      await fetch(`${BASE_URL}/api/posts/${post.id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}` },
      });
    } catch {
      setLiked(!next);
      setLikes((n) => n + (next ? -1 : 1));
    } finally {
      setLiking(false);
    }
  }

  async function toggleSave() {
    if (!session || saving) return;
    const next = !saved;
    setSaved(next);
    setSaving(true);
    try {
      await fetch(`${BASE_URL}/api/posts/${post.id}/save`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}` },
      });
    } catch {
      setSaved(!next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="hover:shadow-md transition">
      <CardHeader className="space-y-2">
        {post.category && (
          <Badge variant="secondary" className="w-fit">{post.category}</Badge>
        )}

        <Link href={`/post/${post.id}`} className="group">
          <h2 className="text-lg font-semibold group-hover:underline">
            {post.title ?? "(untitled)"}
          </h2>
        </Link>

        {post.content && (
          <p className="text-muted-foreground line-clamp-2">{post.content}</p>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4 border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLike}
            disabled={liking || !session}
            className={liked ? "text-red-500" : ""}
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
            disabled={saving || !session}
          >
            {saving
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const [tab, setTab]   = useState<Tab>("hot");
  const [posts, setPosts]   = useState<ApiPost[]>([]);
  const [total, setTotal]   = useState(0);
  const [offset, setOffset] = useState(0);

  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const token = loadSession()?.token;

  // ── Fetch on tab change ──────────────────────────────────────────────────

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPosts([]);
    setOffset(0);

    fetchPosts(tab, 0, token)
      .then((data) => {
        setPosts(data.posts);
        setTotal(data.total);
      })
      .catch(() => setError("Failed to load posts."))
      .finally(() => setLoading(false));
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load more ────────────────────────────────────────────────────────────

  async function loadMore() {
    const nextOffset = offset + PAGE_LIMIT;
    setLoadingMore(true);
    try {
      const data = await fetchPosts(tab, nextOffset, token);
      setPosts((prev) => [...prev, ...data.posts]);
      setOffset(nextOffset);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  }

  const hasMore = posts.length > 0 && posts.length < total;

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="text-muted-foreground">Discover trending content and ideas</p>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        <Button
          variant={tab === "hot" ? "default" : "outline"}
          onClick={() => tab !== "hot" && setTab("hot")}
        >
          <Flame className="h-4 w-4 mr-2" />
          Hot
        </Button>

        <Button
          variant={tab === "rising" ? "default" : "outline"}
          onClick={() => tab !== "rising" && setTab("rising")}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Rising
        </Button>

        <Button
          variant={tab === "latest" ? "default" : "outline"}
          onClick={() => tab !== "latest" && setTab("latest")}
        >
          <Clock className="h-4 w-4 mr-2" />
          Latest
        </Button>

        {!loading && total > 0 && (
          <span className="ml-auto self-center text-sm text-muted-foreground">
            {total} posts
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
          <CardContent className="py-16 text-center space-y-3">
            <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={() => setTab(tab)}>
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* EMPTY */}
      {!loading && !error && posts.length === 0 && (
        <Card>
          <CardContent className="py-20 text-center">
            <p className="font-medium">No posts here yet</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon.</p>
          </CardContent>
        </Card>
      )}

      {/* FEED */}
      {!loading && !error && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => <PostCard key={post.id} post={post} />)}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading…</>
                  : `Load more`
                }
              </Button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}