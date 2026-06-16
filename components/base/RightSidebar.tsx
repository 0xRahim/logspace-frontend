"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  TrendingUp,
  Flame,
  UserPlus,
  LayoutGrid,
  Loader2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { loadSession } from "@/lib/authService";

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// ── API types ─────────────────────────────────────────────────────────────────

interface ApiCategory {
  id: string;
  name: string;
  post_count: number;
}

interface SuggestedUser {
  id: string;
  username: string;
  name: string;
  avatar_url: string | null;
  bio: string;
  followers_count: number;
}

interface TrendingData {
  categories: { name: string; post_count: number }[];
  hashtags:   { name: string; uses_count: number }[];
  suggested_users: SuggestedUser[];
}

// ── Helper ────────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

// ── Suggested user row ────────────────────────────────────────────────────────

function SuggestedUserRow({ user }: { user: SuggestedUser }) {
  const [following,  setFollowing]  = useState(false);
  const [busy,       setBusy]       = useState(false);
  const session = loadSession();

  async function toggleFollow() {
    if (!session || busy) return;
    const next = !following;
    setFollowing(next);
    setBusy(true);
    try {
      await fetch(`${BASE_URL}/api/users/${user.id}/follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}` },
      });
    } catch {
      setFollowing(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Link href={`/profile/${user.username}`} className="shrink-0">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/profile/${user.username}`} className="hover:underline">
          <p className="truncate text-sm font-medium">{user.name}</p>
        </Link>
        <p className="truncate text-xs text-muted-foreground">
          @{user.username} · {fmt(user.followers_count)} followers
        </p>
      </div>

      {session && (
        <Button
          size="sm"
          variant={following ? "default" : "outline"}
          className="h-7 shrink-0 px-3 text-xs"
          onClick={toggleFollow}
          disabled={busy}
        >
          {busy
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : following ? "Following" : "Follow"
          }
        </Button>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RightSidebar() {
  const router     = useRouter();
  const searchRef  = useRef<HTMLInputElement>(null);

  const [trending,    setTrending]    = useState<TrendingData | null>(null);
  const [categories,  setCategories]  = useState<ApiCategory[]>([]);
  const [totalPosts,  setTotalPosts]  = useState(0);

  const session = loadSession();

  useEffect(() => {
    const token = session?.token;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // Trending (hashtags + suggested users)
    fetch(`${BASE_URL}/api/explore/trending`, { headers })
      .then((r) => r.json())
      .then((data: TrendingData) => setTrending(data))
      .catch(() => {});

    // Categories (for Popular Categories section + platform totals)
    fetch(`${BASE_URL}/api/categories`)
      .then((r) => r.json())
      .then((data) => {
        const cats: ApiCategory[] = data.categories ?? [];
        setCategories(cats.slice(0, 5));
        setTotalPosts(cats.reduce((sum, c) => sum + c.post_count, 0));
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const q = searchRef.current?.value.trim() ?? "";
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <aside className="sticky top-20 w-full space-y-4">

      {/* Search */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Search discussions..."
              className="pl-9"
              onKeyDown={handleSearch}
            />
          </div>
        </CardContent>
      </Card>

      {/* Platform stats — derived from categories data */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <LayoutGrid className="h-4 w-4" />
            Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xl font-bold">{fmt(totalPosts)}</p>
              <p className="text-xs text-muted-foreground">Total posts</p>
            </div>
            <div>
              <p className="text-xl font-bold">{categories.length > 0 ? fmt(categories.length + (trending?.categories.length ?? 0)) : "—"}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trending hashtags */}
      {(trending?.hashtags ?? []).length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-4 w-4" />
              Trending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(trending?.hashtags ?? []).slice(0, 8).map((tag) => (
                <Badge
                  key={tag.name}
                  variant="secondary"
                  className="cursor-pointer rounded-full px-3 py-1 hover:bg-secondary/80 transition-colors"
                  asChild
                >
                  <Link href={`/search?tags[]=${encodeURIComponent(tag.name)}`}>
                    #{tag.name}
                  </Link>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular categories */}
      {categories.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Popular Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/search?categories[]=${encodeURIComponent(cat.name)}`}
                  className="flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {fmt(cat.post_count)} posts
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Who to follow */}
      {(trending?.suggested_users ?? []).length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4" />
              Who to Follow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(trending?.suggested_users ?? []).map((user) => (
                <SuggestedUserRow key={user.id} user={user} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </aside>
  );
}