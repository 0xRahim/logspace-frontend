"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, User, AtSign, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

// ── tiny client-side validators ───────────────────────────────────────────────

function validateUsername(v: string): string | null {
  if (!v) return "Username is required";
  if (!/^[a-zA-Z0-9_]+$/.test(v)) return "Letters, numbers and underscores only";
  return null;
}

function validatePassword(v: string): string | null {
  if (!v) return "Password is required";
  if (v.length < 8) return "Must be at least 8 characters";
  return null;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function UserAuthPage() {
  const router = useRouter();
  const { login, register, loading, error, clearError } = useAuth();

  // login form
  const [loginEmail, setLoginEmail]       = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw]     = useState(false);

  // signup form
  const [signupName, setSignupName]           = useState("");
  const [signupUsername, setSignupUsername]   = useState("");
  const [signupEmail, setSignupEmail]         = useState("");
  const [signupPassword, setSignupPassword]   = useState("");
  const [signupConfirm, setSignupConfirm]     = useState("");
  const [showSignupPw, setShowSignupPw]       = useState(false);

  // local field-level errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function clearFieldError(key: string) {
    setFieldErrors((e) => { const n = { ...e }; delete n[key]; return n; });
    clearError();
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const user = await login(loginEmail, loginPassword);
    if (user) router.push("/");          // ← change to your post-login route
  }

  // ── Register ───────────────────────────────────────────────────────────────
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    const errs: Record<string, string> = {};

    const usernameErr = validateUsername(signupUsername);
    if (usernameErr) errs.username = usernameErr;

    const passwordErr = validatePassword(signupPassword);
    if (passwordErr) errs.password = passwordErr;

    if (signupPassword !== signupConfirm) errs.confirm = "Passwords don't match";

    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    const user = await register(signupName, signupUsername, signupEmail, signupPassword);
    if (user) router.push("/");          // ← change to your post-register route
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1400px] lg:grid-cols-2">

        {/* Left Brand Panel */}
        <section className="hidden flex-col justify-between border-r bg-muted/30 p-10 lg:flex">
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-background shadow-sm">
                <span className="text-lg font-bold">L</span>
              </div>
              <span className="text-2xl font-semibold tracking-tight">LogSpace</span>
            </Link>

            <div className="max-w-xl space-y-4 pt-12">
              <h1 className="text-5xl font-semibold tracking-tight">
                Join the forum built for meaningful discussions.
              </h1>
              <p className="max-w-lg text-base leading-7 text-muted-foreground">
                Create an account to post, reply, save discussions, and follow the
                topics that matter to you.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border bg-background p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">
                "LogSpace feels like a modern forum with a clean, focused experience."
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {[["18k+", "Members"], ["120k+", "Posts"], ["24/7", "Activity"]].map(([n, l]) => (
                <div key={l} className="rounded-2xl border bg-background p-4">
                  <p className="text-lg font-semibold">{n}</p>
                  <p className="text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Forms */}
        <section className="flex items-center justify-center p-4 sm:p-6 lg:p-10">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-background shadow-sm">
                <span className="text-base font-bold">L</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">LogSpace</span>
            </div>

            <Card className="border-border/60 shadow-sm">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl tracking-tight">Welcome back</CardTitle>
                <CardDescription>Sign in or create a new account to continue.</CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="login" className="w-full" onValueChange={() => { clearError(); setFieldErrors({}); }}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Create account</TabsTrigger>
                  </TabsList>

                  {/* ── LOGIN TAB ─────────────────────────────────────────── */}
                  <TabsContent value="login" className="mt-6">
                    <form onSubmit={handleLogin} className="space-y-4">

                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-9"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type={showLoginPw ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pl-9 pr-10"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPw((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label={showLoginPw ? "Hide password" : "Show password"}
                          >
                            {showLoginPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 text-muted-foreground">
                          <input type="checkbox" className="rounded border-border" />
                          Remember me
                        </label>
                        <Link href="/forgot-password" className="text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</>
                        ) : "Login"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* ── SIGNUP TAB ────────────────────────────────────────── */}
                  <TabsContent value="signup" className="mt-6">
                    <form onSubmit={handleSignup} className="space-y-4">

                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name">Name</Label>
                          <div className="relative">
                            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="signup-name"
                              type="text"
                              placeholder="Your name"
                              className="pl-9"
                              value={signupName}
                              onChange={(e) => setSignupName(e.target.value)}
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-username">Username</Label>
                          <div className="relative">
                            <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="signup-username"
                              type="text"
                              placeholder="username"
                              className={`pl-9 ${fieldErrors.username ? "border-destructive" : ""}`}
                              value={signupUsername}
                              onChange={(e) => {
                                setSignupUsername(e.target.value);
                                clearFieldError("username");
                              }}
                              required
                              disabled={loading}
                            />
                          </div>
                          {fieldErrors.username && (
                            <p className="text-xs text-destructive">{fieldErrors.username}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-9"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type={showSignupPw ? "text" : "password"}
                            placeholder="Create a strong password"
                            className={`pl-9 pr-10 ${fieldErrors.password ? "border-destructive" : ""}`}
                            value={signupPassword}
                            onChange={(e) => {
                              setSignupPassword(e.target.value);
                              clearFieldError("password");
                            }}
                            required
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignupPw((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label={showSignupPw ? "Hide password" : "Show password"}
                          >
                            {showSignupPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {fieldErrors.password && (
                          <p className="text-xs text-destructive">{fieldErrors.password}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm">Confirm password</Label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="signup-confirm"
                            type="password"
                            placeholder="Repeat your password"
                            className={`pl-9 ${fieldErrors.confirm ? "border-destructive" : ""}`}
                            value={signupConfirm}
                            onChange={(e) => {
                              setSignupConfirm(e.target.value);
                              clearFieldError("confirm");
                            }}
                            required
                            disabled={loading}
                          />
                        </div>
                        {fieldErrors.confirm && (
                          <p className="text-xs text-destructive">{fieldErrors.confirm}</p>
                        )}
                      </div>

                      <div className="space-y-4 pt-2">
                        <label className="flex items-start gap-2 text-sm text-muted-foreground">
                          <input type="checkbox" className="mt-1 rounded border-border" required />
                          <span>
                            I agree to the{" "}
                            <Link href="/terms" className="text-primary hover:underline">Terms</Link>
                            {" "}and{" "}
                            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                          </span>
                        </label>

                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…</>
                          ) : "Create account"}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>

                <Separator className="my-6" />
                <p className="text-center text-sm text-muted-foreground">
                  By continuing, you agree to our community rules and content policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}