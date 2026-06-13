"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Link2,
  ImagePlus,
  Play,
  Type,
  Tag,
  X,
  ChevronsUpDown,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { loadSession } from "@/lib/authService";

// ── Types ─────────────────────────────────────────────────────────────────────

type SectionType = "text" | "image" | "video" | "bookmark";

type BaseSection = {
  id: string;
  type: SectionType;
};

type TextSection = BaseSection & {
  type: "text";
  value: string;
};

type ImageSection = BaseSection & {
  type: "image";
  mode: "url" | "upload";
  url: string;
  uploadPreview: string;
  fileName: string;
};

type VideoSection = BaseSection & {
  type: "video";
  url: string;
};

type BookmarkSection = BaseSection & {
  type: "bookmark";
  url: string;
  title: string;
  description: string;
  image: string;
};

type Section = TextSection | ImageSection | VideoSection | BookmarkSection;

// ── API types ─────────────────────────────────────────────────────────────────

type ApiPostType = "text" | "image" | "gallery" | "video" | "preview";

interface CreatePostPayload {
  type: ApiPostType;
  title?: string;
  content?: string;
  media_urls?: string[];
  thumbnail_url?: string;
  category?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const initialCategories = [
  "Technology",
  "AI",
  "Design",
  "Business",
  "Travel",
  "Startups",
  "Security",
  "Open Source",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return crypto.randomUUID();
}

function getHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
  } catch {
    return "";
  }
  return "";
}

function getVimeoEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : "";
    }
  } catch {
    return "";
  }
  return "";
}

function getEmbedUrl(url: string) {
  return getYouTubeEmbedUrl(url) || getVimeoEmbedUrl(url) || url;
}

/**
 * Map the multi-block editor state into a single LogSpace API payload.
 *
 * Rules:
 *  - All text blocks → joined content (double newline between blocks)
 *  - Tags appended to content as "#tag" tokens so the API auto-extracts them
 *  - Image blocks (URL mode only) → media_urls, type = image | gallery
 *  - Video blocks → media_urls, type = video
 *  - Bookmark blocks → URL appended to content, type = preview
 *  - Mixed blocks: priority order gallery > image > video > preview > text
 */
function buildPayload(
  title: string,
  sections: Section[],
  tags: string[],
  category: string
): CreatePostPayload {
  // Collect by block type
  const textParts: string[] = [];
  const imageUrls: string[] = [];
  const videoUrls: string[] = [];
  const bookmarkUrls: string[] = [];

  for (const s of sections) {
    if (s.type === "text" && s.value.trim()) {
      textParts.push(s.value.trim());
    }
    if (s.type === "image" && s.mode === "url" && isValidUrl(s.url)) {
      imageUrls.push(s.url);
    }
    if (s.type === "video" && isValidUrl(s.url)) {
      videoUrls.push(s.url);
    }
    if (s.type === "bookmark" && isValidUrl(s.url)) {
      bookmarkUrls.push(s.url);
    }
  }

  // Append bookmark URLs inline so they appear in the content
  if (bookmarkUrls.length) {
    textParts.push(...bookmarkUrls);
  }

  // Append tags as hashtokens — API extracts #word from content automatically
  const tagTokens = tags.map((t) => `#${t}`).join(" ");
  if (tagTokens) textParts.push(tagTokens);

  const content = textParts.join("\n\n") || undefined;

  // Determine dominant post type (priority: gallery > image > video > preview > text)
  let type: ApiPostType = "text";
  let mediaUrls: string[] | undefined;

  if (imageUrls.length >= 2) {
    type = "gallery";
    mediaUrls = imageUrls;
  } else if (imageUrls.length === 1) {
    type = "image";
    mediaUrls = imageUrls;
  } else if (videoUrls.length) {
    type = "video";
    mediaUrls = videoUrls;
  } else if (bookmarkUrls.length) {
    type = "preview";
  }

  const payload: CreatePostPayload = { type };

  if (title.trim()) payload.title = title.trim();
  if (content) payload.content = content;
  if (mediaUrls?.length) payload.media_urls = mediaUrls;
  if (category.trim()) payload.category = category.trim();

  return payload;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreateThreadPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categoryInput, setCategoryInput] = useState("Technology");
  const [categories, setCategories] = useState(initialCategories);
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [sections, setSections] = useState<Section[]>([
    { id: uid(), type: "text", value: "" },
  ]);

  const filteredCategories = useMemo(() => {
    const q = categoryInput.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((cat) => cat.toLowerCase().includes(q));
  }, [categoryInput, categories]);

  const categoryExists = categories.some(
    (cat) => cat.toLowerCase() === categoryInput.trim().toLowerCase()
  );

  const setSection = (id: string, updater: (section: Section) => Section) => {
    setSections((prev) =>
      prev.map((section) => (section.id === id ? updater(section) : section))
    );
  };

  const addSection = (type: SectionType) => {
    const next: Section =
      type === "text"
        ? { id: uid(), type: "text", value: "" }
        : type === "image"
        ? { id: uid(), type: "image", mode: "url", url: "", uploadPreview: "", fileName: "" }
        : type === "video"
        ? { id: uid(), type: "video", url: "" }
        : { id: uid(), type: "bookmark", url: "", title: "", description: "", image: "" };

    setSections((prev) => [...prev, next]);
  };

  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const addTag = () => {
    const nextTags = tagsInput
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    if (!nextTags.length) return;

    setTags((prev) => Array.from(new Set([...prev, ...nextTags])));
    setTagsInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const onUploadImage = (id: string, file: File | null) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setSection(id, (section) => {
      if (section.type !== "image") return section;
      return { ...section, mode: "upload", uploadPreview: preview, fileName: file.name, url: "" };
    });
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    // Auth check
    const session = loadSession();
    if (!session) {
      router.replace("/auth");
      return;
    }

    const payload = buildPayload(title, sections, tags, categoryInput);

    // Guard: API requires content or media_urls
    if (!payload.content && (!payload.media_urls || payload.media_urls.length === 0)) {
      setSubmitError("Add some content, an image URL, or a video URL before publishing.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${BASE_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to create post");
      }

      // If category was new, add it locally so the dropdown reflects it next visit
      const normalizedCategory = categoryInput.trim();
      if (!categoryExists && normalizedCategory) {
        setCategories((prev) => [...prev, normalizedCategory]);
      }

      // Navigate to the new post
      router.push(`/post/${data.post.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 xl:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="ghost" className="gap-2 pl-0">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Global error banner */}
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl tracking-tight">Create a post</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Write a strong title..."
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="category">Category</Label>
                <div className="relative">
                  <Input
                    id="category"
                    value={categoryInput}
                    onChange={(e) => {
                      setCategoryInput(e.target.value);
                      setDropdownOpen(true);
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    onBlur={() => {
                      setTimeout(() => setDropdownOpen(false), 120);
                    }}
                    placeholder="Type or choose a category"
                    className="pr-10"
                    disabled={submitting}
                  />
                  <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>

                {dropdownOpen && filteredCategories.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border bg-background shadow-lg">
                    {filteredCategories.map((cat) => {
                      const active =
                        cat.toLowerCase() === categoryInput.trim().toLowerCase();
                      return (
                        <button
                          key={cat}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setCategoryInput(cat);
                            setDropdownOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted",
                            active && "bg-muted"
                          )}
                        >
                          <span>{cat}</span>
                          {active ? <Check className="h-4 w-4" /> : null}
                        </button>
                      );
                    })}
                  </div>
                )}

                {!categoryExists && categoryInput.trim() ? (
                  <p className="text-xs text-muted-foreground">
                    New category will be created with this post.
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add tags, comma separated"
                    disabled={submitting}
                  />
                  <Button type="button" variant="secondary" onClick={addTag} disabled={submitting}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-2 rounded-full px-3 py-1">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="rounded-full p-0.5 hover:bg-background/60"
                          disabled={submitting}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Type className="h-4 w-4" />
                Post blocks
              </CardTitle>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => addSection("text")} disabled={submitting}>
                  <Type className="mr-2 h-4 w-4" />
                  Text
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addSection("image")} disabled={submitting}>
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Image
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addSection("video")} disabled={submitting}>
                  <Play className="mr-2 h-4 w-4" />
                  Video
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addSection("bookmark")} disabled={submitting}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Link card
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {sections.map((section, index) => (
                <div key={section.id} className="rounded-2xl border bg-card p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="rounded-full px-3 py-1">
                        {section.type.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Block {index + 1}</span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeSection(section.id)}
                      disabled={sections.length === 1 || submitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {section.type === "text" && (
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Textarea
                        value={section.value}
                        onChange={(e) =>
                          setSection(section.id, (current) =>
                            current.type === "text" ? { ...current, value: e.target.value } : current
                          )
                        }
                        placeholder="Write a text section..."
                        className="min-h-[140px]"
                        disabled={submitting}
                      />
                    </div>
                  )}

                  {section.type === "image" && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={section.mode === "url" ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            setSection(section.id, (current) =>
                              current.type === "image" ? { ...current, mode: "url" } : current
                            )
                          }
                          disabled={submitting}
                        >
                          URL
                        </Button>
                        <Button
                          type="button"
                          variant={section.mode === "upload" ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            setSection(section.id, (current) =>
                              current.type === "image" ? { ...current, mode: "upload" } : current
                            )
                          }
                          disabled={submitting}
                        >
                          Upload
                        </Button>
                      </div>

                      {section.mode === "url" ? (
                        <div className="space-y-2">
                          <Label>Image URL</Label>
                          <Input
                            value={section.url}
                            onChange={(e) =>
                              setSection(section.id, (current) =>
                                current.type === "image" ? { ...current, url: e.target.value } : current
                              )
                            }
                            placeholder="https://..."
                            disabled={submitting}
                          />
                          {isValidUrl(section.url) ? (
                            <div className="overflow-hidden rounded-xl border">
                              <img src={section.url} alt="Preview" className="aspect-video w-full object-cover" />
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>Upload image</Label>
                          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-4 py-8 text-center hover:bg-muted/40">
                            <Upload className="mb-2 h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">Click to upload an image</span>
                            <span className="text-xs text-muted-foreground">PNG, JPG, WebP, GIF</span>
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => onUploadImage(section.id, e.target.files?.[0] ?? null)}
                            />
                          </label>
                          {section.uploadPreview ? (
                            <div className="overflow-hidden rounded-xl border">
                              <img
                                src={section.uploadPreview}
                                alt={section.fileName || "Uploaded image"}
                                className="aspect-video w-full object-cover"
                              />
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )}

                  {section.type === "video" && (
                    <div className="space-y-2">
                      <Label>Video URL</Label>
                      <Input
                        value={section.url}
                        onChange={(e) =>
                          setSection(section.id, (current) =>
                            current.type === "video" ? { ...current, url: e.target.value } : current
                          )
                        }
                        placeholder="https://youtube.com/watch?v=..."
                        disabled={submitting}
                      />
                      {isValidUrl(section.url) ? (
                        <div className="overflow-hidden rounded-xl border">
                          <iframe
                            src={getEmbedUrl(section.url)}
                            title="Video preview"
                            className="aspect-video w-full"
                            allowFullScreen
                          />
                        </div>
                      ) : null}
                    </div>
                  )}

                  {section.type === "bookmark" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                          value={section.url}
                          onChange={(e) =>
                            setSection(section.id, (current) =>
                              current.type === "bookmark" ? { ...current, url: e.target.value } : current
                            )
                          }
                          placeholder="https://example.com/article"
                          disabled={submitting}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={section.title}
                            onChange={(e) =>
                              setSection(section.id, (current) =>
                                current.type === "bookmark" ? { ...current, title: e.target.value } : current
                              )
                            }
                            placeholder="Link title"
                            disabled={submitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Preview image URL</Label>
                          <Input
                            value={section.image}
                            onChange={(e) =>
                              setSection(section.id, (current) =>
                                current.type === "bookmark" ? { ...current, image: e.target.value } : current
                              )
                            }
                            placeholder="https://..."
                            disabled={submitting}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={section.description}
                          onChange={(e) =>
                            setSection(section.id, (current) =>
                              current.type === "bookmark" ? { ...current, description: e.target.value } : current
                            )
                          }
                          placeholder="Meta description"
                          className="min-h-[100px]"
                          disabled={submitting}
                        />
                      </div>

                      {isValidUrl(section.url) ? (
                        <div className="overflow-hidden rounded-2xl border bg-background">
                          <div className="grid gap-3 p-3 md:grid-cols-[1fr_120px]">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Link2 className="h-3.5 w-3.5" />
                                <span>{getHost(section.url)}</span>
                              </div>
                              <p className="text-sm font-medium">{section.title || "Link preview title"}</p>
                              <p className="text-xs leading-relaxed text-muted-foreground">
                                {section.description || "Preview description"}
                              </p>
                            </div>
                            <div className="overflow-hidden rounded-xl border bg-muted">
                              {section.image && isValidUrl(section.image) ? (
                                <img src={section.image} alt="Preview" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-28 items-center justify-center text-xs text-muted-foreground">
                                  Preview image
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pb-2">
            <Button type="button" variant="outline" disabled={submitting}>
              Save draft
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing…</>
              ) : (
                "Publish post"
              )}
            </Button>
          </div>
        </form>

        {/* ── Sidebar preview (unchanged) ──────────────────────────────────── */}
        <aside className="space-y-4 xl:sticky xl:top-24 h-fit">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Live preview</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  {categoryInput || "Category"}
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  {sections.length} blocks
                </Badge>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight">
                  {title || "Your title will appear here"}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {body || "Optional post body or context can go here."}
                </p>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full px-3 py-1">
                      <Tag className="mr-1 h-3 w-3" />
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <Separator />

              <div className="space-y-3">
                {sections.map((section, index) => (
                  <div key={section.id} className="rounded-xl border bg-background p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="secondary" className="rounded-full px-2 py-0 text-xs">
                        {index + 1}. {section.type}
                      </Badge>
                    </div>

                    {section.type === "text" && section.value ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                        {section.value}
                      </p>
                    ) : null}

                    {section.type === "image" ? (
                      section.mode === "url" && isValidUrl(section.url) ? (
                        <img src={section.url} alt="Preview" className="mt-2 aspect-video w-full rounded-lg object-cover" />
                      ) : section.uploadPreview ? (
                        <img src={section.uploadPreview} alt={section.fileName || "Uploaded image"} className="mt-2 aspect-video w-full rounded-lg object-cover" />
                      ) : (
                        <div className="mt-2 flex aspect-video items-center justify-center rounded-lg border bg-muted text-xs text-muted-foreground">
                          Image preview
                        </div>
                      )
                    ) : null}

                    {section.type === "video" ? (
                      isValidUrl(section.url) ? (
                        <iframe src={getEmbedUrl(section.url)} title="Video preview" className="mt-2 aspect-video w-full rounded-lg" allowFullScreen />
                      ) : (
                        <div className="mt-2 flex aspect-video items-center justify-center rounded-lg border bg-muted text-xs text-muted-foreground">
                          Video preview
                        </div>
                      )
                    ) : null}

                    {section.type === "bookmark" ? (
                      <div className="mt-2 overflow-hidden rounded-xl border">
                        <div className="grid gap-2 p-3 md:grid-cols-[1fr_80px]">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">{getHost(section.url) || "link"}</p>
                            <p className="text-sm font-medium">{section.title || "Bookmark title"}</p>
                            <p className="text-xs leading-relaxed text-muted-foreground">{section.description || "Bookmark description"}</p>
                          </div>
                          <div className="overflow-hidden rounded-lg border bg-muted">
                            {section.image && isValidUrl(section.image) ? (
                              <img src={section.image} alt="Bookmark" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-20 items-center justify-center text-[10px] text-muted-foreground">card image</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="space-y-3 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Tips</p>
              <p>Add as many sections as you need. Each section is saved in order.</p>
              <p>Categories are typed manually. Existing categories appear as suggestions.</p>
              <p>New categories will be created with the post if they do not already exist.</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}