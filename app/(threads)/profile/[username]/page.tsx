"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadSession } from "@/lib/authService";

// ── API types ─────────────────────────────────────────────────────────────────

interface ApiUser {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatar_url: string | null;
  banner_url: string | null;
  karma: number;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at: string;
  is_following?: boolean;
}

interface ApiPost {
  id: string;
  type: string;
  title: string | null;
  content: string | null;
  category: string | null;
  media_urls: string[];
  thumbnail_url: string | null;
  likes_count: number;
  replies_count: number;
  is_liked: boolean;
  is_saved: boolean;
}

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const PAGE_LIMIT = 20;

type Tab = "posts" | "replies" | "media";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fetchUser(username: string, token?: string): Promise<ApiUser> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api/users/${encodeURIComponent(username)}`, {
    headers,
  });

  if (!res.ok) throw new Error("User not found");

  const data = await res.json();
  return data.user;
}

async function fetchUserPosts(
  authorId: string,
  tab: Tab,
  offset: number,
  token?: string
): Promise<{ posts: ApiPost[]; total: number }> {
  const params = new URLSearchParams({
    author_id: authorId,
    tab,
    limit: String(PAGE_LIMIT),
    offset: String(offset),
  });

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api/posts?${params}`, { headers });
  if (!res.ok) throw new Error("Failed to load posts");
  return res.json();
}

// ── Post card ─────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: ApiPost }) {
  const [liked, setLiked] = useState(post.is_liked);
  const [saved, setSaved] = useState(post.is_saved);
  const [likes, setLikes] = useState(post.likes_count);
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
    <Card>
      <CardHeader className="space-y-2">
        {post.category && (
          <Badge variant="secondary" className="w-fit">
            {post.category}
          </Badge>
        )}

        <Link href={`/post/${post.id}`} className="group">
          <h3 className="text-lg font-semibold group-hover:underline">
            {post.title ?? "(untitled)"}
          </h3>
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
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Media grid item ───────────────────────────────────────────────────────────

function MediaItem({ post }: { post: ApiPost }) {
  const src = post.thumbnail_url ?? post.media_urls[0] ?? null;

  return (
    <Link href={`/post/${post.id}`}>
      <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
        {src ? (
          <img
            src={src}
            alt={post.title ?? "media"}
            className="h-full w-full object-cover hover:scale-105 transition-transform"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
            {post.type}
          </div>
        )}
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PublicProfilePage() {
  const params = useParams<{ username?: string | string[] }>();
  const rawUsername = params?.username;
  const username = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername;

  const session = loadSession();
  const token = session?.token;
  const myUsername = session?.user?.username ?? null;

  // ── User state ───────────────────────────────────────────────────────────
  const [user, setUser] = useState<ApiUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  // ── Follow state ─────────────────────────────────────────────────────────
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  // ── Posts state ──────────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [postsLoading, setPostsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // ── Fetch user ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!username) {
      setUserLoading(false);
      setUserError("User not found.");
      return;
    }

    setUserLoading(true);
    setUserError(null);

    fetchUser(username, token)
      .then((u) => {
        setUser(u);
        setFollowing(u.is_following ?? false);
      })
      .catch(() => setUserError("User not found."))
      .finally(() => setUserLoading(false));
  }, [username, token]);

  // ── Fetch posts when user or tab changes ─────────────────────────────────
  useEffect(() => {
    if (!user) return;

    setPostsLoading(true);
    setPosts([]);
    setOffset(0);

    fetchUserPosts(user.id, tab, 0, token)
      .then((data) => {
        setPosts(data.posts);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setPostsLoading(false));
  }, [user?.id, tab, token]);

  // ── Load more ────────────────────────────────────────────────────────────
  async function loadMore() {
    if (!user) return;

    const nextOffset = offset + PAGE_LIMIT;
    setLoadingMore(true);

    try {
      const data = await fetchUserPosts(user.id, tab, nextOffset, token);
      setPosts((prev) => [...prev, ...data.posts]);
      setOffset(nextOffset);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  }

  // ── Follow toggle ────────────────────────────────────────────────────────
  async function toggleFollow() {
    if (!session || !user || followBusy) return;

    const next = !following;
    setFollowing(next);
    setUser((u) =>
      u
        ? {
            ...u,
            followers_count: u.followers_count + (next ? 1 : -1),
          }
        : u
    );
    setFollowBusy(true);

    try {
      await fetch(`${BASE_URL}/api/users/${user.id}/follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}` },
      });
    } catch {
      setFollowing(!next);
      setUser((u) =>
        u
          ? {
              ...u,
              followers_count: u.followers_count + (next ? -1 : 1),
            }
          : u
      );
    } finally {
      setFollowBusy(false);
    }
  }

  const hasMore = posts.length < total && posts.length > 0;
  const isOwnProfile = myUsername && user && myUsername === user.username;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (userLoading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (userError || !user) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {userError ?? "User not found."}
        </p>
      </main>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-4xl">
      {/* BANNER */}
      <div className="relative h-40 md:h-52 w-full bg-muted">
        {user.banner_url && (
          <img
            src={user.banner_url}
            alt="banner"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* PROFILE HEADER */}
      <div className="px-6 pb-4 -mt-10 relative">
        <div className="flex items-end justify-between">
          {/* AVATAR */}
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>

          {/* ACTIONS */}
          {!isOwnProfile && session && (
            <Button
              variant={following ? "default" : "outline"}
              onClick={toggleFollow}
              disabled={followBusy}
            >
              {followBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : following ? (
                "Following"
              ) : (
                "Follow"
              )}
            </Button>
          )}

          {isOwnProfile && (
            <Button variant="outline" asChild>
              <a href="/settings">Edit profile</a>
            </Button>
          )}
        </div>

        {/* USER INFO */}
        <div className="mt-3 space-y-1">
          <h1 className="text-xl font-semibold">{user.name}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
          {user.bio && (
            <p className="text-sm text-muted-foreground max-w-xl">{user.bio}</p>
          )}

          {/* META */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
            <span>
              <strong className="text-foreground">
                {user.following_count.toLocaleString()}
              </strong>{" "}
              Following
            </span>
            <span>
              <strong className="text-foreground">
                {user.followers_count.toLocaleString()}
              </strong>{" "}
              Followers
            </span>
            <span>
              <strong className="text-foreground">
                {user.posts_count.toLocaleString()}
              </strong>{" "}
              Posts
            </span>
            <span>
              <strong className="text-foreground">
                {user.karma.toLocaleString()}
              </strong>{" "}
              Karma
            </span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="border-b px-6">
        <div className="flex gap-6 text-sm">
          {(["posts", "replies", "media"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => tab !== t && setTab(t)}
              className={`py-3 capitalize border-b-2 transition
                ${
                  tab === t
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground"
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 space-y-4">
        {/* Loading */}
        {postsLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty */}
        {!postsLoading && posts.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">
            {tab === "posts" && "No posts yet."}
            {tab === "replies" && "No replies yet."}
            {tab === "media" && "No media posts yet."}
          </p>
        )}

        {/* Posts tab */}
        {!postsLoading &&
          tab !== "media" &&
          posts.map((post) => <PostCard key={post.id} post={post} />)}

        {/* Media tab */}
        {!postsLoading && tab === "media" && posts.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {posts.map((post) => (
              <MediaItem key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && !postsLoading && (
          <div className="flex justify-center pt-2">
            <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading…
                </>
              ) : (
                "Load more"
              )}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}