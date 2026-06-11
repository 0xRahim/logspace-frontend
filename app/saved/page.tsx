"use client";

import { useMemo, useState } from "react";
import {
  BookmarkX,
  Heart,
  MessageCircle,
  Trash2,
  Clock,
  ArrowDownUp,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const initialSavedPosts = [
  {
    id: 1,
    title: "Future of AI Agents",
    description: "Multi-agent systems are changing how software works.",
    category: "AI",
    likes: 420,
    comments: 61,
    savedAt: 2, // days ago
  },
  {
    id: 2,
    title: "Design systems that scale",
    description: "Consistency improves product velocity across teams.",
    category: "Design",
    likes: 310,
    comments: 28,
    savedAt: 8,
  },
  {
    id: 3,
    title: "Startups in 2026",
    description: "Distribution is becoming more important than product.",
    category: "Startups",
    likes: 520,
    comments: 90,
    savedAt: 1,
  },
  {
    id: 4,
    title: "Edge computing explained",
    description: "Processing closer to users reduces latency significantly.",
    category: "Technology",
    likes: 280,
    comments: 44,
    savedAt: 12,
  },
];

type SortMode = "newest" | "oldest" | "popular";

export default function SavedPage() {
  const [savedPosts, setSavedPosts] = useState(initialSavedPosts);
  const [sort, setSort] = useState<SortMode>("newest");

  const removeSaved = (id: number) => {
    setSavedPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const sortedPosts = useMemo(() => {
    const data = [...savedPosts];

    switch (sort) {
      case "oldest":
        return data.sort((a, b) => a.savedAt - b.savedAt);

      case "popular":
        return data.sort((a, b) => b.likes - a.likes);

      default:
        return data.sort((a, b) => b.savedAt - a.savedAt);
    }
  }, [savedPosts, sort]);

  const grouped = useMemo(() => {
    return sortedPosts.reduce((acc: Record<string, any[]>, post) => {
      if (!acc[post.category]) acc[post.category] = [];
      acc[post.category].push(post);
      return acc;
    }, {});
  }, [sortedPosts]);

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

        <Button
          variant={sort === "newest" ? "default" : "outline"}
          size="sm"
          onClick={() => setSort("newest")}
        >
          Newest
        </Button>

        <Button
          variant={sort === "oldest" ? "default" : "outline"}
          size="sm"
          onClick={() => setSort("oldest")}
        >
          Oldest
        </Button>

        <Button
          variant={sort === "popular" ? "default" : "outline"}
          size="sm"
          onClick={() => setSort("popular")}
        >
          Most Liked
        </Button>
      </div>

      {/* EMPTY STATE */}
      {savedPosts.length === 0 && (
        <Card>
          <CardContent className="py-20 text-center">
            <BookmarkX className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h2 className="font-semibold text-lg">No saved posts</h2>
            <p className="text-muted-foreground">
              Save posts to read them later.
            </p>
          </CardContent>
        </Card>
      )}

      {/* GROUPED POSTS */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([category, posts]) => (
          <div key={category} className="space-y-3">

            {/* CATEGORY HEADER */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{category}</Badge>
              <span className="text-sm text-muted-foreground">
                {posts.length} saved
              </span>
            </div>

            {/* POSTS */}
            <div className="space-y-3">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="hover:shadow-md transition"
                >
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {post.savedAt}d ago
                      </Badge>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSaved(post.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                      </Button>
                    </div>

                    <h3 className="text-lg font-semibold">
                      {post.title}
                    </h3>

                    <p className="text-muted-foreground">
                      {post.description}
                    </p>
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

                      <Button variant="ghost" size="sm" className="ml-auto">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}