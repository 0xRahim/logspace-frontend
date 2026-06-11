import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Heart, MessageCircle, MoreHorizontal, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type PostType = "text" | "image" | "gallery" | "video";

type Post = {
  id: number;
  parentId: number | null;
  type: PostType;
  author: string;
  username: string;
  category: string;
  title?: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: number;
  media?: string | string[];
};

const posts: Post[] = [
  {
    id: 1,
    parentId: null,
    type: "text",
    author: "Sarah Chen",
    username: "@sarah",
    category: "AI",
    title: "The future of AI agents is closer than we think",
    content:
      "Multi-agent workflows are becoming increasingly capable. The next wave of applications will focus on collaboration, memory, and autonomous task execution.",
    createdAt: "2h ago",
    likes: 248,
    replies: 4,
  },
  {
    id: 2,
    parentId: 1,
    type: "image",
    author: "Alex Morgan",
    username: "@alex",
    category: "AI",
    content: "This chart explains the shift really well.",
    createdAt: "1h ago",
    likes: 41,
    replies: 0,
    media: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
  },
  {
    id: 3,
    parentId: 1,
    type: "gallery",
    author: "Emma Watson",
    username: "@emma",
    category: "AI",
    content: "A few screenshots from a prototype I tested this week.",
    createdAt: "58m ago",
    likes: 29,
    replies: 0,
    media: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
      "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=1200&q=80",
    ],
  },
  {
    id: 4,
    parentId: 1,
    type: "video",
    author: "Nina Patel",
    username: "@nina",
    category: "AI",
    content: "Quick demo of the workflow in action.",
    createdAt: "35m ago",
    likes: 35,
    replies: 0,
    media: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&q=80",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MediaBlock({ post }: { post: Post }) {
  if (!post.media) return null;

  if (post.type === "image" && typeof post.media === "string") {
    return (
      <div className="mt-4 overflow-hidden rounded-xl border">
        <img
          src={post.media}
          alt={post.title ?? post.content}
          className="h-auto w-full object-cover"
        />
      </div>
    );
  }

  if (post.type === "gallery" && Array.isArray(post.media)) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2">
        {post.media.map((src, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border"
          >
            <img
              src={src}
              alt={`${post.author} gallery ${index + 1}`}
              className="aspect-square w-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  }

  if (post.type === "video" && typeof post.media === "string") {
    return (
      <div className="group relative mt-4 overflow-hidden rounded-xl border">
        <img
          src={post.media}
          alt={post.title ?? post.content}
          className="aspect-video w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/90 shadow-lg backdrop-blur">
            <Play className="ml-1 h-6 w-6 fill-current" />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function PostCard({
  post,
  isRoot = false,
}: {
  post: Post;
  isRoot?: boolean;
}) {
  return (
    <Card className={isRoot ? "border-border/80" : "border-border/60"}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-muted text-sm font-semibold">
              {getInitials(post.author)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{post.author}</p>
                <span className="text-sm text-muted-foreground">
                  {post.username}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {post.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{post.createdAt}</p>
            </div>
          </div>

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {post.title ? (
          <h1 className="text-xl font-semibold tracking-tight">
            {post.title}
          </h1>
        ) : null}

        <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
          {post.content}
        </p>

        <MediaBlock post={post} />

        <div className="flex items-center gap-2 border-t pt-3">
          <Button variant="ghost" size="sm">
            <Heart className="h-4 w-4" />
            <span className="ml-2">{post.likes}</span>
          </Button>

          <Button variant="ghost" size="sm">
            <MessageCircle className="h-4 w-4" />
            <span className="ml-2">{post.replies}</span>
          </Button>

          <Button variant="ghost" size="sm" className="ml-auto">
            Reply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const rootPost = posts.find(
    (post) => post.parentId === null && String(post.id) === slug
  );

  if (!rootPost) {
    notFound();
  }

  const replies = posts.filter((post) => post.parentId === rootPost.id);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="ghost" className="gap-2 pl-0">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <PostCard post={rootPost} isRoot />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            Replies {replies.length > 0 ? `(${replies.length})` : ""}
          </h2>

          <div className="space-y-4">
            {replies.map((reply) => (
              <PostCard key={reply.id} post={reply} />
            ))}
          </div>
        </section>

        <div className="rounded-2xl border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold">Write a reply</h2>
          <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
            Reply box goes here.
          </div>
        </div>
      </div>
    </main>
  );
}