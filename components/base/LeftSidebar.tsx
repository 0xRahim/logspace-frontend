"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Compass,
  Bookmark,
  Settings,
  PlusSquare,
  Hash,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadSession, type User } from "@/lib/authService";

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const menuItems = [
  { label: "Home",    href: "/",        icon: Home     },
  { label: "Explore", href: "/explore", icon: Compass  },
  { label: "Saved",   href: "/saved",   icon: Bookmark },
  { label: "Settings",href: "/settings",icon: Settings },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LeftSidebar() {
  const [user,       setUser]       = useState<User | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [hashtags,   setHashtags]   = useState<{ name: string; uses_count: number }[]>([]);

  useEffect(() => {
    const session = loadSession();

    // ── User stats ──────────────────────────────────────────────────────────
    if (session) {
      // Show cached user immediately
      setUser(session.user);

      // Fetch fresh stats (posts_count, karma, followers may have changed)
      fetch(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${session.token}` },
      })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => { if (data?.user) setUser(data.user); })
        .catch(() => {});
    }

    // ── Categories ──────────────────────────────────────────────────────────
    fetch(`${BASE_URL}/api/categories`)
      .then((r) => r.json())
      .then((data) => {
        const names = (data.categories ?? [])
          .slice(0, 8)
          .map((c: { name: string }) => c.name);
        setCategories(names);
      })
      .catch(() => {});

    // ── Trending hashtags ───────────────────────────────────────────────────
    fetch(`${BASE_URL}/api/explore/trending`)
      .then((r) => r.json())
      .then((data) => { setHashtags((data.hashtags ?? []).slice(0, 6)); })
      .catch(() => {});
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <aside className="sticky top-20 h-fit w-full">
      <div className="space-y-4">

        {/* Create post CTA */}
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <Button asChild className="h-11 w-full">
            <Link href="/create">
              <PlusSquare className="mr-2 h-4 w-4" />
              Create Post
            </Link>
          </Button>
        </div>

        {/* User card */}
        {user && (
          <Link
            href={`/profile/${user.username}`}
            className="block rounded-2xl border bg-card p-4 shadow-sm hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-base font-semibold">{fmt(user.posts_count)}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div>
                <p className="text-base font-semibold">{fmt(user.karma)}</p>
                <p className="text-xs text-muted-foreground">Karma</p>
              </div>
              <div>
                <p className="text-base font-semibold">{fmt(user.followers_count)}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
            </div>
          </Link>
        )}

        {/* Nav */}
        <div className="rounded-2xl border bg-card p-3 shadow-sm">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  className={cn("h-11 w-full justify-start")}
                >
                  <Link href={item.href}>
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Categories — from API */}
        {categories.length > 0 && (
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-medium">
              <Hash className="h-4 w-4" />
              Categories
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="cursor-pointer rounded-full px-3 py-1 hover:bg-secondary/80 transition-colors"
                  asChild
                >
                  <Link href={`/search?categories[]=${encodeURIComponent(category)}`}>
                    {category}
                  </Link>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Trending hashtags — replaces Quick Access */}
        {hashtags.length > 0 && (
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-medium">
              <TrendingUp className="h-4 w-4" />
              Trending
            </div>

            <div className="space-y-2">
              {hashtags.map((tag) => (
                <Link
                  key={tag.name}
                  href={`/search?tags[]=${encodeURIComponent(tag.name)}`}
                  className="flex items-center justify-between text-sm hover:text-foreground text-muted-foreground transition-colors group"
                >
                  <span className="group-hover:underline">#{tag.name}</span>
                  <span className="text-xs tabular-nums">{fmt(tag.uses_count)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
}