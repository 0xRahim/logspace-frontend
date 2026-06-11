import Link from "next/link";
import { Search, TrendingUp, Hash } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const hashtags = [
  "nextjs",
  "react",
  "typescript",
  "tailwind",
  "shadcn",
  "opensource",
];

const topPosts = [
  {
    title: "Best practices for App Router in 2025",
    href: "/posts/1",
  },
  {
    title: "Building a Reddit clone with Next.js",
    href: "/posts/2",
  },
  {
    title: "Server Actions vs API Routes",
    href: "/posts/3",
  },
];

export function RightSidebar() {
  return (
    <aside className="sticky top-20 w-80 shrink-0 space-y-4">
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search discussions..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Trending Hashtags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Hash className="h-4 w-4" />
            Trending Hashtags
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Top Posts
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {topPosts.map((post, index) => (
              <Link
                key={post.href}
                href={post.href}
                className="group block"
              >
                <div className="flex gap-3">
                  <span className="text-muted-foreground text-sm font-medium">
                    {index + 1}
                  </span>

                  <p className="group-hover:text-primary text-sm leading-relaxed transition-colors">
                    {post.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}