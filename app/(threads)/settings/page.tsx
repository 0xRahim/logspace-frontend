"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Trash2,
  Download,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loadSession, clearSession, type User as AuthUser } from "@/lib/authService";

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// ── Sections — Email removed (no API support for email update) ────────────────

const sections = [
  { id: "profile",  label: "Profile",     icon: User     },
  { id: "account",  label: "Account",     icon: Mail     },
  { id: "security", label: "Password",    icon: Lock     },
  { id: "data",     label: "Your Data",   icon: Download },
  { id: "danger",   label: "Danger Zone", icon: Trash2   },
];

// ── Feedback component ────────────────────────────────────────────────────────

function Feedback({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <Alert variant={type === "error" ? "destructive" : "default"} className={type === "success" ? "border-green-500/50 text-green-700 dark:text-green-400" : ""}>
      {type === "success"
        ? <CheckCircle2 className="h-4 w-4" />
        : <AlertCircle className="h-4 w-4" />
      }
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router  = useRouter();
  const session = loadSession();

  const [active, setActive] = useState("profile");

  // ── User data ─────────────────────────────────────────────────────────────
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // ── Profile form ──────────────────────────────────────────────────────────
  const [name, setName]           = useState("");
  const [bio,  setBio]            = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [showAvatarInput, setShowAvatarInput] = useState(false);
  const [profileSaving, setProfileSaving]     = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ── Password form ─────────────────────────────────────────────────────────
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw,     setShowNewPw]     = useState(false);
  const [pwSaving,      setPwSaving]      = useState(false);
  const [pwFeedback,    setPwFeedback]    = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ── Export ────────────────────────────────────────────────────────────────
  const [exporting, setExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ── Delete account ────────────────────────────────────────────────────────
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirm,  setDeleteConfirm]  = useState(false);
  const [deleting,       setDeleting]       = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ── Load current user on mount ────────────────────────────────────────────

  useEffect(() => {
    if (!session) { router.replace("/auth"); return; }

    fetch(`${BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const u: AuthUser = data.user;
        setUser(u);
        setName(u.name ?? "");
        setBio(u.bio ?? "");
        setAvatarUrl(u.avatar_url ?? "");
        setBannerUrl(u.banner_url ?? "");
      })
      .catch(() => {})
      .finally(() => setUserLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function saveProfile() {
    if (!session) return;
    setProfileSaving(true);
    setProfileFeedback(null);

    const body: Record<string, string> = {};
    if (name       !== (user?.name ?? ""))       body.name       = name;
    if (bio        !== (user?.bio ?? ""))         body.bio        = bio;
    if (avatarUrl  !== (user?.avatar_url ?? ""))  body.avatar_url = avatarUrl;
    if (bannerUrl  !== (user?.banner_url ?? ""))  body.banner_url = bannerUrl;

    if (!Object.keys(body).length) {
      setProfileFeedback({ type: "error", msg: "No changes to save." });
      setProfileSaving(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setUser(data.user);
      setProfileFeedback({ type: "success", msg: "Profile updated successfully." });
      setShowAvatarInput(false);
    } catch (err) {
      setProfileFeedback({ type: "error", msg: err instanceof Error ? err.message : "Update failed" });
    } finally {
      setProfileSaving(false);
    }
  }

  async function changePassword() {
    if (!session) return;
    setPwFeedback(null);

    if (!currentPw || !newPw || !confirmPw) {
      setPwFeedback({ type: "error", msg: "All password fields are required." });
      return;
    }
    if (newPw.length < 8) {
      setPwFeedback({ type: "error", msg: "New password must be at least 8 characters." });
      return;
    }
    if (newPw !== confirmPw) {
      setPwFeedback({ type: "error", msg: "New passwords don't match." });
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/users/me/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Password change failed");
      setPwFeedback({ type: "success", msg: "Password changed successfully." });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      setPwFeedback({ type: "error", msg: err instanceof Error ? err.message : "Password change failed" });
    } finally {
      setPwSaving(false);
    }
  }

  async function exportData() {
    if (!session) return;
    setExporting(true);
    setExportFeedback(null);
    try {
      const res = await fetch(`${BASE_URL}/api/user/export`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (!res.ok) throw new Error("Export failed");

      // Parse filename from Content-Disposition header if present
      const disposition = res.headers.get("content-disposition") ?? "";
      const match       = disposition.match(/filename="?([^"]+)"?/);
      const filename    = match?.[1] ?? `logspace-export-${user?.username ?? "data"}.json`;

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);

      setExportFeedback({ type: "success", msg: "Export downloaded successfully." });
    } catch {
      setExportFeedback({ type: "error", msg: "Export failed. Please try again." });
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    if (!session || !deletePassword) return;
    setDeleting(true);
    setDeleteFeedback(null);
    try {
      const res = await fetch(`${BASE_URL}/api/users/me`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Deletion failed");
      clearSession();
      router.replace("/auth");
    } catch (err) {
      setDeleteFeedback({ type: "error", msg: err instanceof Error ? err.message : "Deletion failed" });
      setDeleting(false);
    }
  }

  // ── Loading state ─────────────────────────────────────────────────────────

  if (userLoading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-12 gap-10">

      {/* LEFT SIDEBAR */}
      <aside className="col-span-3 sticky top-20 h-fit space-y-2">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="text-sm text-muted-foreground">Manage your account</p>
        </div>

        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => {
                setActive(s.id);
                setProfileFeedback(null);
                setPwFeedback(null);
                setExportFeedback(null);
                setDeleteFeedback(null);
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition
                ${active === s.id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60"
                } ${s.id === "danger" ? "text-red-500 hover:bg-red-500/10" : ""}`}
            >
              <Icon className="h-4 w-4" />
              {s.label}
            </button>
          );
        })}
      </aside>

      {/* RIGHT CONTENT */}
      <section className="col-span-9 space-y-12">

        {/* ── PROFILE ─────────────────────────────────────────────────────── */}
        {active === "profile" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold">Profile</h3>
              <p className="text-sm text-muted-foreground">Update your public profile information</p>
            </div>

            {profileFeedback && <Feedback type={profileFeedback.type} message={profileFeedback.msg} />}

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <Avatar className="h-28 w-28 border">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl">{name?.[0] ?? "?"}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => setShowAvatarInput((v) => !v)}
                  className="absolute bottom-2 right-2 bg-background border shadow-sm rounded-full p-2 opacity-90 hover:opacity-100 transition"
                  title="Change avatar URL"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {showAvatarInput && (
                <div className="w-full max-w-sm space-y-1">
                  <label className="text-xs text-muted-foreground">Avatar image URL</label>
                  <Input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    autoFocus
                  />
                </div>
              )}

              <p className="text-xs text-muted-foreground">Click the camera icon to set an avatar URL</p>
            </div>

            {/* Form */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Display Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              {/* Username is read-only — no API support for updating it */}
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  Username
                  <Badge variant="outline" className="text-xs font-normal">Read-only</Badge>
                </label>
                <Input value={user?.username ?? ""} disabled className="opacity-60" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community about yourself..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Banner image URL</label>
              <Input
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://example.com/banner.jpg"
              />
            </div>

            <Button onClick={saveProfile} disabled={profileSaving}>
              {profileSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Save changes"}
            </Button>
          </div>
        )}

        {/* ── ACCOUNT (email read-only — no API to update it) ──────────────── */}
        {active === "account" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold">Account</h3>
              <p className="text-sm text-muted-foreground">Your account information</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                Email address
                <Badge variant="outline" className="text-xs font-normal">Read-only</Badge>
              </label>
              <Input value={user?.email ?? ""} disabled className="opacity-60" />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                Username
                <Badge variant="outline" className="text-xs font-normal">Read-only</Badge>
              </label>
              <Input value={user?.username ?? ""} disabled className="opacity-60" />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { label: "Posts",     value: user?.posts_count     ?? 0 },
                { label: "Followers", value: user?.followers_count ?? 0 },
                { label: "Karma",     value: user?.karma           ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border p-4 text-center">
                  <p className="text-2xl font-semibold">{value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Email and username changes are not currently supported. Contact support if you need to update these.
            </p>
          </div>
        )}

        {/* ── PASSWORD ─────────────────────────────────────────────────────── */}
        {active === "security" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold">Password</h3>
              <p className="text-sm text-muted-foreground">Keep your account secure</p>
            </div>

            {pwFeedback && <Feedback type={pwFeedback.type} message={pwFeedback.msg} />}

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Current password</label>
              <div className="relative">
                <Input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="Enter current password"
                  className="pr-10"
                  disabled={pwSaving}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">New password</label>
              <div className="relative">
                <Input
                  type={showNewPw ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="At least 8 characters"
                  className="pr-10"
                  disabled={pwSaving}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Confirm new password</label>
              <Input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
                disabled={pwSaving}
              />
            </div>

            <Button onClick={changePassword} disabled={pwSaving}>
              {pwSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating…</> : "Change password"}
            </Button>
          </div>
        )}

        {/* ── DATA EXPORT ──────────────────────────────────────────────────── */}
        {active === "data" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold">Your data</h3>
              <p className="text-sm text-muted-foreground">
                Download a complete copy of your account — posts, likes, saves, followers, and following list.
              </p>
            </div>

            {exportFeedback && <Feedback type={exportFeedback.type} message={exportFeedback.msg} />}

            <Button variant="outline" onClick={exportData} disabled={exporting}>
              {exporting
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Preparing export…</>
                : <><Download className="h-4 w-4 mr-2" />Export data</>
              }
            </Button>
          </div>
        )}

        {/* ── DANGER ZONE ──────────────────────────────────────────────────── */}
        {active === "danger" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-red-500">Danger zone</h3>
              <p className="text-sm text-muted-foreground">Permanent and irreversible account actions.</p>
            </div>

            {deleteFeedback && <Feedback type={deleteFeedback.type} message={deleteFeedback.msg} />}

            <div className="rounded-xl border border-red-500/30 p-5 space-y-4">
              <div>
                <p className="font-medium">Delete account</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently deletes your account, posts, likes, and all associated data. This cannot be undone.
                </p>
              </div>

              {!deleteConfirm ? (
                <Button variant="destructive" onClick={() => setDeleteConfirm(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete my account
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-red-500">
                    Enter your password to confirm deletion:
                  </p>
                  <Input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Your current password"
                    disabled={deleting}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={deleteAccount}
                      disabled={deleting || !deletePassword}
                    >
                      {deleting
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting…</>
                        : "Confirm deletion"
                      }
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setDeleteConfirm(false); setDeletePassword(""); setDeleteFeedback(null); }}
                      disabled={deleting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}