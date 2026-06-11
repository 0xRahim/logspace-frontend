"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  X,
  Hash,
  TrendingUp,
  SlidersHorizontal,
  Heart,
  MessageCircle,
  Bookmark,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const categories = [
  { id: "ai", name: "AI", posts: 1200 },
  { id: "tech", name: "Technology", posts: 980 },
  { id: "design", name: "Design", posts: 740 },
  { id: "startup", name: "Startups", posts: 620 },
  { id: "travel", name: "Travel", posts: 410 },
];

const hashtags = [
  { id: "ai", name: "ai", uses: 5400 },
  { id: "startup", name: "startup", uses: 3200 },
  { id: "design", name: "design", uses: 2900 },
  { id: "productivity", name: "productivity", uses: 2100 },
  { id: "saas", name: "saas", uses: 1800 },
];

const posts = [
  {
    id: 1,
    title: "Future of AI agents",
    description: "Multi-agent systems are evolving fast.",
    author: "Sarah Chen",
    username: "@sarah",
    category: "AI",
    hashtags: ["ai", "startup"],
    likes: 240,
    comments: 34,
  },
  {
    id: 2,
    title: "Design simplicity wins",
    description: "Great UX removes friction.",
    author: "Alex Morgan",
    username: "@alex",
    category: "Design",
    hashtags: ["design", "productivity"],
    likes: 180,
    comments: 19,
  },
  {
    id: 3,
    title: "Scaling edge computing",
    description: "Compute closer to users improves latency.",
    author: "Michael Ross",
    username: "@michael",
    category: "Technology",
    hashtags: ["tech"],
    likes: 310,
    comments: 48,
  },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const trendingCategories = [...categories]
    .sort((a, b) => b.posts - a.posts)
    .slice(0, 6);

  const trendingHashtags = [...hashtags]
    .sort((a, b) => b.uses - a.uses)
    .slice(0, 6);

  const suggestions = useMemo(() => {
    if (!query) return [];

    const q = query.toLowerCase();

    const matchedCategories = categories.filter((c) =>
      c.name.toLowerCase().includes(q)
    );

    const matchedTags = hashtags.filter((t) =>
      t.name.toLowerCase().includes(q)
    );

    const matchedPosts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
    );

    return {
      categories: matchedCategories,
      hashtags: matchedTags,
      posts: matchedPosts,
    };
  }, [query]);

  const results = useMemo(() => {
    let filtered = [...posts];

    if (query) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.author.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (selectedCategories.length) {
      filtered = filtered.filter((p) =>
        selectedCategories.includes(p.category)
      );
    }

    if (selectedTags.length) {
      filtered = filtered.filter((p) =>
        selectedTags.every((t) => p.hashtags.includes(t))
      );
    }

    return filtered;
  }, [query, selectedCategories, selectedTags]);

  const toggle = (value: string, list: string[], setList: any) => {
    setList(
      list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value]
    );
  };

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
            className="pl-10"
          />
        </div>

        {/* TRENDING */}
        {!query && (
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending Categories
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {trendingCategories.map((c) => (
                  <Badge
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() =>
                      toggle(c.name, selectedCategories, setSelectedCategories)
                    }
                  >
                    {c.name}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Hash className="h-4 w-4" />
                Trending Hashtags
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {trendingHashtags.map((t) => (
                  <Badge
                    key={t.id}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() =>
                      toggle(t.name, selectedTags, setSelectedTags)
                    }
                  >
                    #{t.name}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ACTIVE FILTERS */}
        {(selectedCategories.length > 0 || selectedTags.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((c) => (
              <Badge key={c} className="gap-1">
                {c}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    toggle(c, selectedCategories, setSelectedCategories)
                  }
                />
              </Badge>
            ))}

            {selectedTags.map((t) => (
              <Badge key={t} variant="outline" className="gap-1">
                #{t}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    toggle(t, selectedTags, setSelectedTags)
                  }
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* RESULTS */}
      <div className="text-sm text-muted-foreground">
        {results.length} results
      </div>

      <div className="space-y-4">
        {results.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${post.id}`} />
                  <AvatarFallback>{post.author[0]}</AvatarFallback>
                </Avatar>

                <div>
                  <div className="font-medium">{post.author}</div>
                  <div className="text-sm text-muted-foreground">
                    {post.username} · {post.category}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <h3 className="font-semibold text-lg">{post.title}</h3>
              <p className="text-muted-foreground">{post.description}</p>

              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((t) => (
                  <Badge key={t} variant="secondary">
                    #{t}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-2 border-t">
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  {post.likes}
                </Button>

                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {post.comments}
                </Button>

                <Button variant="ghost" size="sm" className="ml-auto">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {results.length === 0 && (
          <Card>
            <CardContent className="py-20 text-center">
              <Search className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium">No results found</p>
              <p className="text-sm text-muted-foreground">
                Try different keywords or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}