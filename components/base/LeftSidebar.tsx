"use client";

import Link from "next/link";
import {
  Home,
  Compass,
  Bookmark,
  Settings,
  PlusSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Explore",
    href: "/explore",
    icon: Compass,
  },
  {
    label: "Saved",
    href: "/saved",
    icon: Bookmark,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function LeftSidebar() {
  return (
    <aside className="sticky top-20 h-fit w-64">
      <div className="rounded-xl border bg-background p-4">
        <Button asChild className="w-full">
          <Link href="/create">
            <PlusSquare className="mr-2 h-4 w-4" />
            Create New Post
          </Link>
        </Button>

        <Separator className="my-4" />

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  "h-11"
                )}
              >
                <Link href={item.href}>
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}