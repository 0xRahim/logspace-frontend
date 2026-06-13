"use client";

import { useMemo, useState } from "react";
import {
  Flame,
  TrendingUp,
  Clock,
  Heart,
  MessageCircle,
  Bookmark,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const posts = [
  {
    id: 1,
    title: "Future of AI Agents",
    description: "Multi-agent systems are changing everything.",
    category: "AI",
    likes: 420,
    comments: 61,
    createdAt: 5,
  },
  {
    id: 2,
    title: "Design systems that scale",
    description: "Consistency improves product velocity.",
    category: "Design",
    likes: 310,
    comments: 28,
    createdAt: 10,
  },
  {
    id: 3,
    title: "Startups in 2026",
    description: "Distribution > product in early stage.",
    category: "Startups",
    likes: 520,
    comments: 90,
    createdAt: 2,
  },
  {
    id: 4,
    title: "Edge computing explained",
    description: "Compute closer to users reduces latency.",
    category: "Technology",
    likes: 280,
    comments: 44,
    createdAt: 15,
  },
];

type Tab = "hot" | "latest" | "rising";

export default function ExplorePage() {
  const [tab, setTab] = useState<Tab>("hot");

  const sortedPosts = useMemo(() => {
    const data = [...posts];

    switch (tab) {
      case "latest":
        return data.sort((a, b) => a.createdAt - b.createdAt);

      case "rising":
        return data.sort(
          (a, b) =>
            b.comments * 2 + b.likes - (a.comments * 2 + a.likes)
        );

      default:
        return data.sort((a, b) => b.likes - a.likes);
    }
  }, [tab]);

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="text-muted-foreground">
          Discover trending content and ideas
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        <Button
          variant={tab === "hot" ? "default" : "outline"}
          onClick={() => setTab("hot")}
        >
          <Flame className="h-4 w-4 mr-2" />
          Hot
        </Button>

        <Button
          variant={tab === "rising" ? "default" : "outline"}
          onClick={() => setTab("rising")}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Rising
        </Button>

        <Button
          variant={tab === "latest" ? "default" : "outline"}
          onClick={() => setTab("latest")}
        >
          <Clock className="h-4 w-4 mr-2" />
          Latest
        </Button>
      </div>

      {/* FEED */}
      <div className="space-y-4">
        {sortedPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition">
            <CardHeader className="space-y-2">
              <Badge variant="secondary" className="w-fit">
                {post.category}
              </Badge>

              <h2 className="text-lg font-semibold">
                {post.title}
              </h2>

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
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}