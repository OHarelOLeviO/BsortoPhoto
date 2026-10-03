import { useState, type ReactNode } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Camera, Home, LogOut, Plus, Search, User } from "lucide-react";
import type { Member } from "@/lib/api";
import { signOut } from "@/lib/session";
import { MemberAvatar } from "@/components/MemberAvatar";
import { UploadDialog } from "@/components/UploadDialog";
import { SearchDialog } from "@/components/SearchDialog";
import { cn } from "@/lib/utils";

type AppShellProps = {
  member: Member;
  memberAvatarUrl?: string | null;
  children: ReactNode;
};

/**
 * App chrome: top bar on desktop, bottom tab bar on mobile.
 * Hosts the upload and search dialogs so they're reachable from anywhere.
 */
export function AppShell({ member, memberAvatarUrl, children }: AppShellProps) {
  const router = useRouter();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const pathname = router.state.location.pathname;
  const isHome = pathname === "/";
  const isOwnProfile = pathname === `/user/${member.id}`;

  function handleSignOut() {
    signOut();
    router.navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border nav-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-2 px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Camera className="size-4" />
            </span>
            הפלוגה
          </Link>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="חיפוש"
              className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <Search className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              aria-label="העלאת תמונה"
              className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="size-5" />
            </button>
            <Link
              to="/user/$userId"
              params={{ userId: member.id }}
              aria-label="הפרופיל שלי"
              className="ms-1"
            >
              <MemberAvatar name={member.name} imageUrl={memberAvatarUrl} className="size-9" />
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="החלפת משתמש"
              title="החלפת משתמש"
              className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-3 pb-24 pt-4 sm:px-4 md:pb-10">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border nav-blur md:hidden">
        <div className="mx-auto grid h-16 max-w-2xl grid-cols-4">
          <NavItem
            active={isHome}
            label="בית"
            icon={<Home className="size-6" />}
            onClick={() => router.navigate({ to: "/" })}
          />
          <NavItem
            label="העלאה"
            icon={<Plus className="size-6" />}
            onClick={() => setUploadOpen(true)}
          />
          <NavItem
            label="חיפוש"
            icon={<Search className="size-6" />}
            onClick={() => setSearchOpen(true)}
          />
          <NavItem
            active={isOwnProfile}
            label="פרופיל"
            icon={<User className="size-6" />}
            onClick={() => router.navigate({ to: "/user/$userId", params: { userId: member.id } })}
          />
        </div>
      </nav>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} memberId={member.id} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

function NavItem({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 text-xs transition-colors",
        active ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
