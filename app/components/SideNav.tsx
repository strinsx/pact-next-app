"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ChartColumn,
  CircleUser,
  LayoutGrid,
  LogOut,
  Moon,
  Plus,
  ChevronRight,
  Users,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";

const mainNav = [
  { href: "/home", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analysis", label: "Analysis", icon: ChartColumn },
  { href: "/profile", label: "Profile", icon: CircleUser },
];

export default function SideNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, username")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name);
        setUsername(profile.username);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return (
    <aside
      className={`sticky top-0 flex h-screen flex-col overflow-hidden border-r border-border bg-surface transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex-1 overflow-y-auto">
        <div
          className={`flex items-center gap-3 py-8 ${
            collapsed ? "justify-center px-0" : "px-6"
          }`}
        >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
          <LayoutGrid className="h-6 w-6 text-primary" />
        </div>
        {!collapsed && (
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-poppins text-base font-bold text-purple">
              {fullName ?? "Your Pact"}
            </span>
            <span className="truncate font-nunito text-sm text-muted">
              {username ? `@${username}` : ""}
            </span>
          </div>
        )}
      </div>
      <div
        className={`flex flex-col gap-1 pb-4 ${
          collapsed ? "items-center px-0" : "px-6"
        }`}
      >
        <button
          type="button"
          title="Notifications"
          className={`flex items-center gap-3 py-1 font-nunito text-sm font-semibold text-muted transition-colors hover:text-primary ${
            collapsed ? "justify-center px-0" : "px-1"
          }`}
        >
          <Bell className="h-4 w-4 shrink-0" />
          {!collapsed && "Notifications"}
        </button>
        <button
          type="button"
          title="Dark Mode"
          className={`flex items-center gap-3 py-1 font-nunito text-sm font-semibold text-muted transition-colors hover:text-primary ${
            collapsed ? "justify-center px-0" : "px-1"
          }`}
        >
          <Moon className="h-4 w-4 shrink-0" />
          {!collapsed && "Dark Mode"}
        </button>
        <button
          type="button"
          title="Commitment"
          className={`mt-2 flex items-center gap-2 rounded-lg border-1 border-border bg-surface font-nunito text-sm font-bold text-primary transition-colors hover:bg-border/50 ${
            collapsed
              ? "justify-center px-2 py-2.5"
              : "justify-center px-4 py-2.5"
          }`}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && "Commitment"}
        </button>
      </div>
      <nav className="flex flex-col gap-2 px-3">
        {mainNav.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center rounded-xl py-3 font-nunito text-sm font-semibold transition-colors ${
                collapsed ? "justify-center px-0" : "justify-between px-4"
              } ${
                isActive
                  ? "bg-gradient-to-r from-sky-400 to-purple text-white"
                  : "text-muted hover:bg-border/50 hover:text-primary"
              }`}
            >
              <span className={`flex items-center gap-3 ${collapsed ? "px-0" : ""}`}>
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </span>
              {!collapsed && <ChevronRight className="h-4 w-4 shrink-0" />}
            </Link>
          );
        })}
      </nav>
      {!collapsed && (
        <div className="mt-6 px-6">
          <span className="font-nunito text-xs font-bold uppercase tracking-wide text-muted">
            Management
          </span>
        </div>
      )}
      <nav className={`flex flex-col gap-2 ${collapsed ? "mt-4 px-3" : "mt-2 px-3"}`}>
        <Link
          href="/groups"
          title="Groups"
          className={`flex items-center rounded-xl py-3 font-nunito text-sm font-semibold transition-colors ${
            collapsed ? "justify-center px-0" : "justify-between px-4"
          } ${
            pathname.startsWith("/groups")
              ? "bg-gradient-to-r from-sky-400 to-purple text-white"
              : "text-muted hover:bg-border/50 hover:text-primary"
          }`}
        >
          <span className="flex items-center gap-3">
            <Users className="h-4 w-4 shrink-0" />
            {!collapsed && "Groups"}
          </span>
          {!collapsed && <ChevronRight className="h-4 w-4 shrink-0" />}
        </Link>
      </nav>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        title="Logout"
        className={`mt-auto flex items-center gap-3 py-5 font-nunito text-sm font-semibold text-muted transition-colors hover:text-red-500 ${
          collapsed ? "justify-center px-0" : "px-7"
        }`}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!collapsed && "Logout"}
      </button>
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="flex items-center justify-center border-t border-border py-3 font-nunito text-xs font-semibold text-muted transition-colors hover:text-primary"
      >
        {collapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <>
            <PanelLeftClose className="h-4 w-4" />
            <span className="ml-2">Collapse</span>
          </>
        )}
      </button>
    </aside>
  );
}
