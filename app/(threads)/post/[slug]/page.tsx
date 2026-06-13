import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Heart, MessageCircle, MoreHorizontal, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// ── API types ─────────────────────────────────────────────────────────────────

interface ApiPost {
  id: string;
  author_id: string;
  parent_id: string | null;
  type: "text" | "image" | "gallery" | "video" | "preview";
  category: string | null;
  title: string | null;
  content: string | null;
  media_urls: string[];
  thumbnail_url: string | null;
  likes_count: number;
  replies_count: number;
  created_at: string;
  author_username: string;
  author_name: string;
  author_avatar: string | null;
  hashtags: string[];
  is_liked: boolean;
  is_saved: boolean;
}

interface ApiPostResponse {
  post: ApiPost;
  replies: ApiPost[];
}

// ── Shape used by the UI (mirrors the old static type) ───────────────────────

type PostType = "text" | "image" | "gallery" | "video" | "preview";

type Post = {
  id: string;
  parentId: string | null;
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/** Fetch a post + its replies from the API. Returns null on 404. */
async function fetchPost(id: string): Promise<ApiPostResponse | null> {
  const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
    // Revalidate every 60 s so fresh likes/replies show up
    next: { revalidate: 60 },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);

  return res.json() as Promise<ApiPostResponse>;
}

/** Convert an ISO / SQLite datetime to a human-friendly relative string. */
function relativeTime(raw: string): string {
  // SQLite stores "YYYY-MM-DD HH:MM:SS" — replace space with T for Date parsing
  const date = new Date(raw.replace(" ", "T") + "Z");
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1)  return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Map an ApiPost → the Post shape the UI components consume. */
function toPost(api: ApiPost): Post {
  // Resolve the media field the existing MediaBlock expects:
  //   image   → single string (first URL)
  //   gallery → string array
  //   video   → thumbnail_url (with play overlay), fallback to first media_url
  //   preview → treat like image if there's a URL
  let media: string | string[] | undefined;

  if (api.type === "gallery") {
    media = api.media_urls.length ? api.media_urls : undefined;
  } else if (api.type === "video") {
    // Show thumbnail with play button; fall back to first media_url if no thumbnail
    const thumb = api.thumbnail_url ?? api.media_urls[0] ?? undefined;
    media = thumb;
  } else if (api.type === "image" || api.type === "preview") {
    media = api.media_urls[0] ?? undefined;
  }

  return {
    id:        api.id,
    parentId:  api.parent_id,
    type:      api.type === "preview" ? "image" : api.type, // render preview as image card
    author:    api.author_name,
    username:  `@${api.author_username}`,
    category:  api.category ?? "General",
    title:     api.title ?? undefined,
    content:   api.content ?? "",
    createdAt: relativeTime(api.created_at),
    likes:     api.likes_count,
    replies:   api.replies_count,
    media,
  };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ── Sub-components (identical to original) ────────────────────────────────────

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
          <div key={index} className="overflow-hidden rounded-xl border">
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

function PostCard({ post, isRoot = false }: { post: Post; isRoot?: boolean }) {
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
                <span className="text-sm text-muted-foreground">{post.username}</span>
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
          <h1 className="text-xl font-semibold tracking-tight">{post.title}</h1>
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const data = await fetchPost(slug);

  if (!data) notFound();

  const rootPost  = toPost(data.post);
  const replies   = data.replies.map(toPost);

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