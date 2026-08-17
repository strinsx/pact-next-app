"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  LayoutDashboard,
  ChartColumn,
  CircleUser,
  LayoutGrid,
  LogOut,
  ChevronRight,
  Users,
  UserRoundPlus,
  UserPlus,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "@/app/lib/services/auth";
import CreateGroupModal from "@/app/components/CreateGroupModal";
import JoinGroupModal from "@/app/components/JoinGroupModal";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  scrollToId?: string;
  scrollToTop?: boolean;
}

const mainNav: NavItem[] = [
  {
    href: "/home",
    label: "Dashboard",
    icon: LayoutDashboard,
    scrollToTop: true,
  },
  {
    href: "/analysis",
    label: "Analysis",
    icon: ChartColumn,
    scrollToId: "analytics",
  },
  { href: "/profile", label: "Profile", icon: CircleUser },
];

const groupSections = [
  { id: "overview", label: "Overview" },
  { id: "join-access", label: "Join Access" },
  { id: "members", label: "Members" },
];

let cachedActiveSection = "overview";
const storeListeners = new Set<() => void>();
let rafId: number | null = null;

function emitStoreChange() {
  storeListeners.forEach((listener) => listener());
}

function subscribeToScroll(onStoreChange: () => void) {
  storeListeners.add(onStoreChange);

  const handleScroll = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      emitStoreChange();
    });
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleScroll, { passive: true });
  return () => {
    storeListeners.delete(onStoreChange);
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleScroll);
  };
}

function getActiveSection() {
  if (typeof window === "undefined") return cachedActiveSection;

  let active = "overview";
  for (const section of groupSections) {
    const el = document.getElementById(section.id);
    if (el && el.getBoundingClientRect().top <= 120) active = section.id;
  }
  if (cachedActiveSection !== active) cachedActiveSection = active;
  return cachedActiveSection;
}

const scrollToSection = (id: string) => {
  cachedActiveSection = id;
  emitStoreChange();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

let cachedDashboardActive = false;

function getDashboardActive() {
  if (typeof window === "undefined") return cachedDashboardActive;

  const active = window.scrollY <= 160;
  if (cachedDashboardActive !== active) cachedDashboardActive = active;
  return cachedDashboardActive;
}

let cachedAnalysisActive = false;

function getAnalysisActive() {
  if (typeof window === "undefined") return cachedAnalysisActive;

  const el = document.getElementById("analytics");
  const rect = el?.getBoundingClientRect();
  const active = !!rect && rect.top <= 160 && rect.bottom > 0;
  if (cachedAnalysisActive !== active) cachedAnalysisActive = active;
  return cachedAnalysisActive;
}

const scrollToElement = (id: string) => {
  const scroll = () =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  if (document.getElementById(id)) {
    scroll();
    return;
  }

  let attempts = 0;
  const interval = window.setInterval(() => {
    attempts += 1;
    if (document.getElementById(id)) {
      window.clearInterval(interval);
      scroll();
    } else if (attempts > 20) {
      window.clearInterval(interval);
    }
  }, 100);
};

export default function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [joinGroupOpen, setJoinGroupOpen] = useState(false);
  const activeSection = useSyncExternalStore(
    subscribeToScroll,
    getActiveSection,
    () => cachedActiveSection
  );
  const analysisActive = useSyncExternalStore(
    subscribeToScroll,
    getAnalysisActive,
    () => cachedAnalysisActive
  );
  const dashboardActive = useSyncExternalStore(
    subscribeToScroll,
    getDashboardActive,
    () => cachedDashboardActive
  );

  const handleDashboardClick = () => {
    if (pathname !== "/home") {
      router.push("/home");
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileOpen(false);
  };

  const handleAnalysisClick = () => {
    if (pathname !== "/home") {
      router.push("/home");
    }
    scrollToElement("analytics");
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/auth/login";
  };

  useEffect(() => {
    if (!confirmOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfirmOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [confirmOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mobileOpen]);

  return (
    <>
      {!mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border-1 border-border bg-surface text-primary shadow-md md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 z-40 flex h-screen w-64 flex-col overflow-hidden border-r border-border bg-surface transition-all duration-300 md:sticky md:top-0 md:left-auto md:z-auto md:h-screen ${
          collapsed ? "md:w-20" : "md:w-64"
        } ${mobileOpen ? "left-0" : "-left-64"}`}
      >
      <div className="flex-1 overflow-y-auto">
        <div
          className={`flex items-center gap-3 pt-6 pb-6 ${
            collapsed ? "justify-center px-0" : "px-6"
          }`}
        >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
          <LayoutGrid className="h-6 w-6 text-primary" />
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className={`ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-border/50 hover:text-primary md:hidden ${
            collapsed ? "ml-0" : "ml-auto"
          }`}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex flex-col gap-2 px-3">
        {mainNav.map((item) => {
          const isActive = item.scrollToTop
            ? pathname.startsWith(item.href) && dashboardActive
            : item.scrollToId
              ? analysisActive
              : item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href) && !analysisActive;

          const className = `flex items-center rounded-xl py-3 font-dm-sans text-sm transition-colors ${
            collapsed ? "justify-center px-0" : "justify-between px-4"
          } ${
            isActive
              ? "bg-gradient-to-r from-sky-400 to-purple text-white"
              : "text-muted hover:bg-border/50 hover:text-primary"
          }`;

          const content = (
            <>
              <span className={`flex items-center gap-3 ${collapsed ? "px-0" : ""}`}>
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </span>
              {!collapsed && <ChevronRight className="h-4 w-4 shrink-0" />}
            </>
          );

          return item.scrollToId || item.scrollToTop ? (
            <button
              key={item.href}
              type="button"
              onClick={
                item.scrollToTop ? handleDashboardClick : handleAnalysisClick
              }
              title={item.label}
              className={`cursor-pointer ${className}`}
            >
              {content}
            </button>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={item.label}
              className={className}
            >
              {content}
            </Link>
          );
        })}
      </nav>
      <nav className={`flex flex-col gap-1 ${collapsed ? "mt-4 px-3" : "mt-4 px-3"}`}>
        <button
          type="button"
          onClick={() => setCreateGroupOpen(true)}
          title="Create Group"
          className={`flex items-center gap-3 rounded-xl py-2 font-dm-sans text-sm transition-colors ${
            collapsed ? "justify-center px-0" : "px-4"
          } text-muted hover:bg-border/50 hover:text-primary`}
        >
          <UserRoundPlus className="h-4 w-4 shrink-0" />
          {!collapsed && "Create Group"}
        </button>
        <button
          type="button"
          onClick={() => setJoinGroupOpen(true)}
          title="Join Group"
          className={`flex items-center gap-3 rounded-xl py-2 font-dm-sans text-sm transition-colors ${
            collapsed ? "justify-center px-0" : "px-4"
          } text-muted hover:bg-border/50 hover:text-primary`}
        >
          <UserPlus className="h-4 w-4 shrink-0" />
          {!collapsed && "Join Group"}
        </button>
      </nav>
      {!collapsed && (
        <div className="mt-6 px-6">
          <span className="font-dm-sans text-xs uppercase tracking-wide text-muted">
            Management
          </span>
        </div>
      )}
      <nav className={`flex flex-col gap-2 ${collapsed ? "mt-4 px-3" : "mt-2 px-3"}`}>
        <Link
          href="/groups"
          onClick={() => setMobileOpen(false)}
          title="Groups"
          className={`flex items-center rounded-xl py-3 font-dm-sans text-sm transition-colors ${
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
        {pathname.startsWith("/groups") && !collapsed && (
          <div className="ml-3 flex flex-col gap-1 border-l-2 border-border pl-3">
            {groupSections.map((sub) => {
              const isSubActive = activeSection === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    scrollToSection(sub.id);
                    setMobileOpen(false);
                  }}
                  className={`cursor-pointer rounded-lg py-1.5 pl-2 text-left font-dm-sans text-sm transition-colors ${
                    isSubActive
                      ? "text-secondary"
                      : "text-muted hover:text-primary"
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        )}
      </nav>
      </div>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        title="Logout"
        className={`mt-auto flex items-center gap-3 py-5 font-dm-sans text-sm text-muted transition-colors hover:text-red-500 ${
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
        className="hidden items-center justify-center border-t border-border py-3 font-dm-sans text-xs text-muted transition-colors hover:text-primary md:flex"
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
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-[20px] border-1 border-border bg-surface p-8 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
              <LogOut className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="mt-4 font-manrope text-xl font-bold text-primary">
              Sign out of Pact?
            </h2>
            <p className="mt-1 font-dm-sans text-sm text-muted">
              You will need to sign back in to view your commitments.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 cursor-pointer rounded-lg border-1 border-border bg-surface py-2 font-dm-sans font-bold text-muted transition-colors hover:bg-border/50 hover:text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 cursor-pointer rounded-lg bg-red-500 py-2 font-dm-sans font-bold text-white transition-colors hover:bg-red-600"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
      <CreateGroupModal
        open={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
      />
      <JoinGroupModal
        open={joinGroupOpen}
        onClose={() => setJoinGroupOpen(false)}
      />
      </aside>
    </>
  );
}
