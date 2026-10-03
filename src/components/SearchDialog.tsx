import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { listMembers, signImagePaths } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MemberAvatar } from "@/components/MemberAvatar";
import { Skeleton } from "@/components/ui/skeleton";

type SearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Member search — filters the roster by name, works with Hebrew text. */
export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");

  const membersQuery = useQuery({ queryKey: ["members"], queryFn: listMembers });
  const members = membersQuery.data ?? [];

  const avatarPaths = useMemo(
    () => members.map((m) => m.profile_image).filter((p): p is string => Boolean(p)),
    [members],
  );
  const avatarsQuery = useQuery({
    queryKey: ["signed", ...avatarPaths.slice().sort()],
    queryFn: () => signImagePaths(avatarPaths),
    enabled: avatarPaths.length > 0,
    staleTime: 50 * 60 * 1000,
  });
  const avatarUrls = avatarsQuery.data ?? {};

  const normalized = query.trim();
  const results = normalized
    ? members.filter((member) => member.name.includes(normalized))
    : members;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>חיפוש חברי פלוגה</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="חיפוש לפי שם…"
            className="h-11 rounded-xl pe-9"
          />
        </div>

        <div className="max-h-80 space-y-1 overflow-y-auto">
          {membersQuery.isLoading &&
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}

          {membersQuery.isError && (
            <p className="py-6 text-center text-sm text-muted-foreground">משהו השתבש. נסה שוב.</p>
          )}

          {!membersQuery.isLoading && !membersQuery.isError && results.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">לא נמצאו חברים בשם הזה.</p>
          )}

          {results.map((member) => (
            <Link
              key={member.id}
              to="/user/$userId"
              params={{ userId: member.id }}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted"
            >
              <MemberAvatar
                name={member.name}
                imageUrl={member.profile_image ? avatarUrls[member.profile_image] : undefined}
                className="size-10"
              />
              <div>
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-muted-foreground">{member.team?.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
