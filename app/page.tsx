"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Play,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

const categories = [
  "For You",
  "Technology",
  "Design",
  "Business",
  "AI",
  "Travel",
  "Startups",
];

const posts = [
  {
    id: 1,
    type: "text",
    author: "Sarah Chen",
    username: "@sarah",
    avatar: "https://i.pravatar.cc/150?img=1",
    category: "AI",
    title: "The future of AI agents is closer than we think",
    description:
      "Multi-agent workflows are becoming increasingly capable. The next wave of applications will focus on collaboration, memory, and autonomous task execution.",
    likes: 248,
    comments: 34,
  },

  {
    id: 2,
    type: "preview",
    author: "Alex Morgan",
    username: "@alex",
    avatar: "https://i.pravatar.cc/150?img=2",
    category: "Design",
    title: "Why simplicity wins in product design",
    description:
      "The most successful products remove friction instead of adding features. Great UX feels invisible.",
    previewImage:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80",
    likes: 173,
    comments: 19,
  },

  {
    id: 3,
    type: "image",
    author: "Michael Ross",
    username: "@michael",
    avatar: "https://i.pravatar.cc/150?img=3",
    category: "Technology",
    title: "Inside the next generation of edge computing",
    description:
      "Processing data closer to users dramatically improves responsiveness and scalability.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80",
    likes: 352,
    comments: 48,
  },

  {
    id: 4,
    type: "gallery",
    author: "Emma Watson",
    username: "@emma",
    avatar: "https://i.pravatar.cc/150?img=4",
    category: "Travel",
    title: "A weekend exploring Iceland",
    description:
      "Some highlights from an unforgettable road trip through waterfalls, glaciers, and volcanic landscapes.",
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80",
    ],
    likes: 524,
    comments: 62,
  },

  {
    id: 5,
    type: "video",
    author: "David Kim",
    username: "@david",
    avatar: "https://i.pravatar.cc/150?img=5",
    category: "Startups",
    title: "Building an MVP in 48 hours",
    description:
      "A quick walkthrough of how I validated a SaaS idea and shipped the first version over a weekend.",
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&q=80",
    likes: 741,
    comments: 103,
  },
];

function PostContent({ post }: { post: any }) {
  switch (post.type) {
    case "text":
      return (
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            {post.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {post.description}
          </p>
        </div>
      );

    case "preview":
      return (
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col">
            <h3 className="text-lg font-semibold tracking-tight">
              {post.title}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-4">
              {post.description}
            </p>
          </div>

          <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-lg border">
            <Image
              src={post.previewImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        </div>
      );

    case "image":
      return (
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            {post.title}
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {post.description}
          </p>

          <div className="relative mt-4 aspect-video overflow-hidden rounded-xl border">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        </div>
      );

    case "gallery":
      return (
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            {post.title}
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {post.description}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {post.images.map((image: string, index: number) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-lg border"
              >
                <Image
                  src={image}
                  alt={`Gallery ${index}`}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      );

    case "video":
      return (
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            {post.title}
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {post.description}
          </p>

          <div className="group relative mt-4 aspect-video overflow-hidden rounded-xl border cursor-pointer">
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              className="object-cover"
            />

            <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/90 shadow-lg backdrop-blur">
                <Play className="ml-1 h-6 w-6 fill-current" />
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("For You");

  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [savedPosts, setSavedPosts] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    setLikedPosts((prev) =>
      prev.includes(id)
        ? prev.filter((postId) => postId !== id)
        : [...prev, id]
    );
  };

  const toggleSave = (id: number) => {
    setSavedPosts((prev) =>
      prev.includes(id)
        ? prev.filter((postId) => postId !== id)
        : [...prev, id]
    );
  };

  return (
    <main className="flex h-full flex-col">
      {/* Categories Header */}
      <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="flex gap-8 overflow-x-auto px-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`relative py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {category}

              {activeCategory === category && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="mx-auto w-full max-w-3xl space-y-4 p-6">
        {posts.map((post) => {
          const liked = likedPosts.includes(post.id);
          const saved = savedPosts.includes(post.id);

          return (
            <Card
              key={post.id}
              className="transition-all hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback>
                        {post.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="font-medium">
                        {post.author}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {post.username}
                        </span>

                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <PostContent post={post} />

                <div className="flex items-center gap-1 border-t pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(post.id)}
                    className={liked ? "text-red-500" : ""}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        liked ? "fill-current" : ""
                      }`}
                    />
                    <span className="ml-2">
                      {post.likes + (liked ? 1 : 0)}
                    </span>
                  </Button>

                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                  >
                    <Link href={`/posts/${post.id}`}>
                      <MessageCircle className="h-4 w-4" />
                      <span className="ml-2">
                        {post.comments}
                      </span>
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => toggleSave(post.id)}
                  >
                    <Bookmark
                      className={`h-4 w-4 ${
                        saved ? "fill-current" : ""
                      }`}
                    />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}