"use client";

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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Saved", href: "/saved", icon: Bookmark },
  { label: "Settings", href: "/settings", icon: Settings },
];

const categories = [
  "Technology",
  "AI",
  "Design",
  "Business",
  "Travel",
  "Startups",
];

export function LeftSidebar() {
  return (
    <aside className="sticky top-20 h-fit w-full">
      <div className="space-y-4">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <Button asChild className="h-11 w-full">
            <Link href="/create">
              <PlusSquare className="mr-2 h-4 w-4" />
              Create Post
            </Link>
          </Button>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate font-medium">John Doe</p>
              <p className="truncate text-sm text-muted-foreground">
                @johndoe
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-base font-semibold">124</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div>
              <p className="text-base font-semibold">2.4k</p>
              <p className="text-xs text-muted-foreground">Karma</p>
            </div>
            <div>
              <p className="text-base font-semibold">892</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
          </div>
        </div>

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
                className="cursor-pointer rounded-full px-3 py-1"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 font-medium">
            <TrendingUp className="h-4 w-4" />
            Quick Access
          </div>

          <div className="space-y-2 text-sm">
            <Link
              href="/trending"
              className="block text-muted-foreground transition-colors hover:text-foreground"
            >
              Trending
            </Link>
            <Link
              href="/communities"
              className="block text-muted-foreground transition-colors hover:text-foreground"
            >
              Communities
            </Link>
            <Link
              href="/discussions"
              className="block text-muted-foreground transition-colors hover:text-foreground"
            >
              Discussions
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}