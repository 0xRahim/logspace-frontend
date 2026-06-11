"use client";

import Link from "next/link";
import {
  Search,
  TrendingUp,
  Hash,
  Users,
  Flame,
  UserPlus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const trendingTopics = [
  "Artificial Intelligence",
  "Cybersecurity",
  "Startups",
  "Programming",
  "Remote Work",
];

const communities = [
  { name: "Technology", members: "12.3k" },
  { name: "AI", members: "8.4k" },
  { name: "Bug Bounty", members: "5.9k" },
  { name: "Startups", members: "4.1k" },
];

const suggestedUsers = [
  { name: "Sarah Chen", username: "@sarah" },
  { name: "Alex Morgan", username: "@alex" },
  { name: "Michael Ross", username: "@michael" },
];

export function RightSidebar() {
  return (
    <aside className="sticky top-20 w-full space-y-4">
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search discussions..." className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Community
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xl font-bold">18.2k</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
            <div>
              <p className="text-xl font-bold">438</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame className="h-4 w-4" />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((topic) => (
              <Badge
                key={topic}
                variant="secondary"
                className="cursor-pointer rounded-full px-3 py-1"
              >
                {topic}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Popular Communities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {communities.map((community) => (
              <Link
                key={community.name}
                href={`/c/${community.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted"
              >
                <span className="font-medium">{community.name}</span>
                <span className="text-muted-foreground">
                  {community.members}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-4 w-4" />
            Who to Follow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestedUsers.map((user) => (
              <div
                key={user.username}
                className="flex items-center gap-3"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.username}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}