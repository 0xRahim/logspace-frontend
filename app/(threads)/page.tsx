"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Play,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { loadSession } from "@/lib/authService";

// ── API types ─────────────────────────────────────────────────────────────────

interface ApiPost {
  id: string;
  type: "text" | "image" | "gallery" | "video" | "preview";
  title: string | null;
  content: string | null;
  category: string | null;
  media_urls: string[];
  thumbnail_url: string | null;
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

interface PostsResponse {
  posts: ApiPost[];
  total: number;
}

interface ApiCategory {
  id: string;
  name: string;
  post_count: number;
}

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL   = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const PAGE_LIMIT = 20;

// "For You" uses hot sort; all other tabs filter by category name
const FOR_YOU = "For You";

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function fetchPosts(
  category: string,
  offset: number,
  token?: string
): Promise<PostsResponse> {
  const params = new URLSearchParams();
  params.set("limit", String(PAGE_LIMIT));
  params.set("offset", String(offset));

  if (category === FOR_YOU) {
    params.set("sort", "hot");
  } else {
    params.set("sort", "latest");
    params.set("category", category);
  }

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api/posts?${params}`, { headers });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

async function fetchCategories(): Promise<ApiCategory[]> {
  const res = await fetch(`${BASE_URL}/api/categories`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.categories ?? [];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(raw: string): string {
  const date    = new Date(raw.replace(" ", "T") + "Z");
  const diffMs  = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1)  return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr  < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

// ── Post content renderer (mirrors original, data-driven) ─────────────────────

function PostContent({ post }: { post: ApiPost }) {
  const title       = post.title ?? null;
  const description = post.content ?? null;

  switch (post.type) {
    case "text":
      return (
        <div>
          {title && <h3 className="text-lg font-semibold tracking-tight">{title}</h3>}
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      );

    case "preview": {
      const previewImage = post.media_urls[0] ?? null;
      return (
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col">
            {title && <h3 className="text-lg font-semibold tracking-tight">{title}</h3>}
            {description && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-4">
                {description}
              </p>
            )}
          </div>
          {previewImage && (
            <div className="h-24 w-36 shrink-0 overflow-hidden rounded-lg border">
              <img src={previewImage} alt={title ?? "Preview"} className="h-full w-full object-cover" />
            </div>
          )}
        </div>
      );
    }

    case "image": {
      const image = post.media_urls[0] ?? null;
      return (
        <div>
          {title && <h3 className="text-lg font-semibold tracking-tight">{title}</h3>}
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
          {image && (
            <div className="mt-4 overflow-hidden rounded-xl border">
              <img src={image} alt={title ?? "Image"} className="aspect-video w-full object-cover" />
            </div>
          )}
        </div>
      );
    }

    case "gallery": {
      const images = post.media_urls;
      return (
        <div>
          {title && <h3 className="text-lg font-semibold tracking-tight">{title}</h3>}
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {images.map((img, i) => (
                <div key={i} className="overflow-hidden rounded-lg border">
                  <img
                    src={img}
                    alt={`Gallery ${i + 1}`}
                    className="aspect-square w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    case "video": {
      const thumbnail = post.thumbnail_url ?? post.media_urls[0] ?? null;
      return (
        <div>
          {title && <h3 className="text-lg font-semibold tracking-tight">{title}</h3>}
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
          {thumbnail && (
            <div className="group relative mt-4 overflow-hidden rounded-xl border cursor-pointer">
              <img src={thumbnail} alt={title ?? "Video"} className="aspect-video w-full object-cover" />
              <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/90 shadow-lg backdrop-blur">
                  <Play className="ml-1 h-6 w-6 fill-current" />
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}

// ── Post card — owns its own like/save state ──────────────────────────────────

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
      // revert
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
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.author_avatar ?? undefined} />
              <AvatarFallback>{post.author_name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div>
              <div className="font-medium">{post.author_name}</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  @{post.author_username}
                </span>
                {post.category && (
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {relativeTime(post.created_at)}
                </span>
              </div>
            </div>
          </div>

          <Button size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <PostContent post={post} />

        {/* Hashtags */}
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.hashtags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 border-t pt-3">
          {/* Like */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLike}
            disabled={liking || !session}
            className={liked ? "text-red-500" : ""}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            <span className="ml-2">{likes}</span>
          </Button>

          {/* Replies — links to post page */}
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/post/${post.id}`}>
              <MessageCircle className="h-4 w-4" />
              <span className="ml-2">{post.replies_count}</span>
            </Link>
          </Button>

          {/* Save */}
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

export default function HomePage() {
  const [categories, setCategories]           = useState<string[]>([FOR_YOU]);
  const [activeCategory, setActiveCategory]   = useState(FOR_YOU);

  const [posts, setPosts]     = useState<ApiPost[]>([]);
  const [total, setTotal]     = useState(0);
  const [offset, setOffset]   = useState(0);

  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const token = loadSession()?.token;

  // ── Fetch categories once ────────────────────────────────────────────────
  useEffect(() => {
    fetchCategories().then((cats) => {
      if (cats.length) {
        setCategories([FOR_YOU, ...cats.map((c) => c.name)]);
      }
    });
  }, []);

  // ── Fetch posts when category changes ────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);
    setPosts([]);
    setOffset(0);

    fetchPosts(activeCategory, 0, token)
      .then((data) => {
        setPosts(data.posts);
        setTotal(data.total);
      })
      .catch(() => setError("Failed to load posts. Pull down to refresh."))
      .finally(() => setLoading(false));
  }, [activeCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load more ────────────────────────────────────────────────────────────
  async function loadMore() {
    const nextOffset = offset + PAGE_LIMIT;
    setLoadingMore(true);
    try {
      const data = await fetchPosts(activeCategory, nextOffset, token);
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
    <main className="flex h-full flex-col">
      {/* ── Category tabs ─────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur">
        <div className="flex gap-8 overflow-x-auto px-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                if (category !== activeCategory) setActiveCategory(category);
              }}
              className={`relative py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {category}
              {activeCategory === category && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Feed ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto w-full space-y-4 p-6">

        {/* Loading skeleton */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <Card>
            <CardContent className="py-16 text-center space-y-3">
              <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveCategory(activeCategory)}
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!loading && !error && posts.length === 0 && (
          <Card>
            <CardContent className="py-20 text-center">
              <p className="font-medium">No posts yet in {activeCategory}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to post here.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/create">Create a post</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Posts */}
        {!loading && posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {/* Load more */}
        {hasMore && !loading && (
          <div className="flex justify-center pt-2 pb-4">
            <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
              {loadingMore
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading…</>
                : `Load more posts`
              }
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}