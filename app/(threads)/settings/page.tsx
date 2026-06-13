"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Trash2,
  Download,
  Camera,
  Shield,
  Settings as SettingsIcon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "email", label: "Email", icon: Mail },
  { id: "security", label: "Password", icon: Lock },
  { id: "data", label: "Your Data", icon: Download },
  { id: "danger", label: "Danger Zone", icon: Trash2 },
];

export default function SettingsPage() {
  const [active, setActive] = useState("profile");

  const [profile, setProfile] = useState({
    username: "sarah",
    name: "Sarah Chen",
    bio: "Building AI tools and sharing insights.",
    avatar: "https://i.pravatar.cc/150?img=1",
    email: "sarah@example.com",
  });

  const update = (k: string, v: string) => {
    setProfile((p) => ({ ...p, [k]: v }));
  };

  const downloadData = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { profile, exportedAt: new Date().toISOString() },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-data.json";
    a.click();
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-12 gap-10">

      {/* LEFT SIDEBAR */}
      <aside className="col-span-3 sticky top-20 h-fit space-y-2">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your account
          </p>
        </div>

        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition
                ${active === s.id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60"
                }`}
            >
              <Icon className="h-4 w-4" />
              {s.label}
            </button>
          );
        })}
      </aside>

      {/* RIGHT CONTENT */}
      <section className="col-span-9 space-y-12">

        {active === "profile" && (
          <div className="space-y-8">

            {/* HEADER */}
            <div>
              <h3 className="text-xl font-semibold">Profile</h3>
              <p className="text-sm text-muted-foreground">
                Update your public profile information
              </p>
            </div>

            {/* CENTERED AVATAR */}
            <div className="flex flex-col items-center gap-3">

              <div className="relative group">
                <Avatar className="h-28 w-28 border">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-2xl">
                    {profile.name[0]}
                  </AvatarFallback>
                </Avatar>

                {/* EDIT ICON */}
                <button
                  className="absolute bottom-2 right-2 bg-background border shadow-sm rounded-full p-2
                     opacity-90 hover:opacity-100 transition"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Click icon to change avatar
              </p>
            </div>

            {/* FORM */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">
                  Username
                </label>
                <Input
                  value={profile.username}
                  onChange={(e) =>
                    update("username", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">
                  Display Name
                </label>
                <Input
                  value={profile.name}
                  onChange={(e) =>
                    update("name", e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">
                Bio
              </label>
              <Textarea
                value={profile.bio}
                onChange={(e) => update("bio", e.target.value)}
              />
            </div>

            <Button>Save changes</Button>
          </div>
        )}

        {/* EMAIL */}
        {active === "email" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold">Email</h3>
              <p className="text-sm text-muted-foreground">
                Update your login email
              </p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">
                Email address
              </label>

              <Input
                value={profile.email}
                onChange={(e) =>
                  update("email", e.target.value)
                }
              />
            </div>

            <Badge variant="secondary">
              Verification required after change
            </Badge>

            <Button>Update email</Button>
          </div>
        )}

        {/* PASSWORD */}
        {active === "security" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold">Password</h3>
              <p className="text-sm text-muted-foreground">
                Keep your account secure
              </p>
            </div>

            <Input type="password" placeholder="Current password" />
            <Input type="password" placeholder="New password" />
            <Input type="password" placeholder="Confirm password" />

            <Button>Change password</Button>
          </div>
        )}

        {/* DATA EXPORT */}
        {active === "data" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold">Your data</h3>
              <p className="text-sm text-muted-foreground">
                Download a copy of your account data
              </p>
            </div>

            <Button variant="outline" onClick={downloadData}>
              <Download className="h-4 w-4 mr-2" />
              Export data
            </Button>
          </div>
        )}

        {/* DANGER */}
        {active === "danger" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-red-500">
                Danger zone
              </h3>
              <p className="text-sm text-muted-foreground">
                Irreversible account actions
              </p>
            </div>

            <div className="space-y-3">
              <Button variant="destructive">
                Delete account
              </Button>

              <Button variant="outline">
                Deactivate account
              </Button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}