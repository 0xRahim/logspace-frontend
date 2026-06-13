"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Link as LinkIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const user = {
  name: "Sarah Chen",
  username: "sarah",
  bio: "Building AI tools and sharing product insights.",
  avatar: "https://i.pravatar.cc/150?img=1",
  banner:
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80",
  followers: 12400,
  following: 320,
  posts: 42,
};

const posts = [
  {
    id: 1,
    title: "Future of AI agents",
    description: "Multi-agent systems are reshaping software.",
    likes: 420,
    comments: 61,
    category: "AI",
  },
  {
    id: 2,
    title: "Design systems that scale",
    description: "Consistency improves velocity across teams.",
    likes: 310,
    comments: 28,
    category: "Design",
  },
  {
    id: 3,
    title: "Startups in 2026",
    description: "Distribution is now more important than product.",
    likes: 520,
    comments: 90,
    category: "Startups",
  },
];

type Tab = "posts" | "replies" | "media";

export default function PublicProfilePage() {
  const [tab, setTab] = useState<Tab>("posts");

  return (
    <main className="mx-auto max-w-4xl">

      {/* BANNER */}
      <div className="relative h-40 md:h-52 w-full">
        <Image
          src={user.banner}
          alt="banner"
          fill
          className="object-cover"
        />
      </div>

      {/* PROFILE HEADER */}
      <div className="px-6 pb-4 -mt-10 relative">

        <div className="flex items-end justify-between">
          {/* AVATAR */}
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>

          {/* ACTIONS */}
          <Button variant="outline">
            Follow
          </Button>
        </div>

        {/* USER INFO */}
        <div className="mt-3 space-y-1">
          <h1 className="text-xl font-semibold">
            {user.name}
          </h1>

          <p className="text-muted-foreground">
            @{user.username}
          </p>

          <p className="text-sm text-muted-foreground max-w-xl">
            {user.bio}
          </p>

          {/* META */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
            <span>
              <strong className="text-foreground">
                {user.following}
              </strong>{" "}
              Following
            </span>

            <span>
              <strong className="text-foreground">
                {user.followers}
              </strong>{" "}
              Followers
            </span>

            <span>
              <strong className="text-foreground">
                {user.posts}
              </strong>{" "}
              Posts
            </span>

            <span className="flex items-center gap-1">
              <LinkIcon className="h-3 w-3" />
              sarah.dev
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
              onClick={() => setTab(t)}
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

        {tab === "posts" &&
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="space-y-2">
                <Badge variant="secondary" className="w-fit">
                  {post.category}
                </Badge>

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
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

        {tab === "replies" && (
          <div className="text-sm text-muted-foreground">
            No replies yet.
          </div>
        )}

        {tab === "media" && (
          <div className="grid grid-cols-2 gap-2">
            {posts.map((p) => (
              <div
                key={p.id}
                className="aspect-square bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground"
              >
                Media Placeholder
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}