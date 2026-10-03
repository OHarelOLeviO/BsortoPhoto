import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Camera, Loader2 } from "lucide-react";
import {
  FEED_PAGE_SIZE,
  fetchFeedPage,
  listMembers,
  listTeams,
  signImagePaths,
  type FeedPost,
  type Member,
} from "@/lib/api";
import { useMemberId } from "@/lib/session";
import { AppShell } from "@/components/AppShell";
import { NamePicker } from "@/components/NamePicker";
import { PostCard } from "@/components/PostCard";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "הפיד — הפלוגה" },
      { name: "description", content: "הפיד המרכזי של הפלוגה — כל התמונות שחברי הפלוגה מעלים, עם סינון לפי צוות." },
      { property: "og:title", content: "הפיד — הפלוגה" },
      { property: "og:description", content: "הפיד המרכזי של הפלוגה — כל התמונות שחברי הפלוגה מעלים, עם סינון לפי צוות." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FeedPage,
});

function FeedPage() {
  const memberId = useMemberId();
  const membersQuery = useQuery({
    queryKey: ["members"],
    queryFn: listMembers,
    enabled: Boolean(memberId),
  });

  if (!memberId) return <NamePicker />;

  const member = membersQuery.data?.find((m) => m.id === memberId);

  if (membersQuery.isLoading || !membersQuery.data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  // The stored member no longer exists (roster changed) — pick a name again.
  if (!member) return <NamePicker />;

  return <FeedView member={member} />;
}

function FeedView({ member }: { member: Member }) {
  const [teamId, setTeamId] = useState<string | null>(null);
  const [openPost, setOpenPost] = useState<FeedPost | null>(null);

  const teamsQuery = useQuery({ queryKey: ["teams"], queryFn: listTeams });
  const teams = teamsQuery.data ?? [];

  const feedQuery = useInfiniteQuery({
    queryKey: ["feed", teamId ?? "all"],
    queryFn: ({ pageParam }) => fetchFeedPage(pageParam, teamId),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length === FEED_PAGE_SIZE ? lastPageParam + 1 : undefined,
  });

  const posts = useMemo(() => feedQuery.data?.pages.flat() ?? [], [feedQuery.data]);

  // Sign every image path referenced by the loaded pages (posts + avatars).
  const imagePaths = useMemo(
    () =>
      posts
        .flatMap((post) => [post.image_url, post.member?.profile_image])
        .filter((p): p is string => Boolean(p)),
    [posts],
  );
  const signedQuery = useQuery({
    queryKey: ["signed", ...imagePaths.slice().sort()],
    queryFn: () => signImagePaths(imagePaths),
    enabled: imagePaths.length > 0,
    staleTime: 50 * 60 * 1000,
  });
  const signedUrls = signedQuery.data ?? {};

  const memberAvatarUrl = member.profile_image ? signedUrls[member.profile_image] : undefined;

  return (
    <AppShell member={member} memberAvatarUrl={memberAvatarUrl}>
      {/* Team filter */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <FilterChip active={teamId === null} onClick={() => setTeamId(null)}>
          הכל
        </FilterChip>
        {teams.map((team) => (
          <FilterChip key={team.id} active={teamId === team.id} onClick={() => setTeamId(team.id)}>
            {team.name}
          </FilterChip>
        ))}
      </div>

      {/* Feed states */}
      {feedQuery.isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="feed-card overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-72 w-full rounded-none" />
            </div>
          ))}
        </div>
      )}

      {feedQuery.isError && (
        <div className="feed-card flex flex-col items-center gap-3 px-4 py-12 text-center">
          <p className="text-muted-foreground">משהו השתבש. נסה שוב.</p>
          <Button variant="outline" onClick={() => feedQuery.refetch()}>
            נסה שוב
          </Button>
        </div>
      )}

      {feedQuery.isSuccess && posts.length === 0 && (
        <div className="feed-card flex flex-col items-center gap-3 px-4 py-16 text-center">
          <Camera className="size-10 text-muted-foreground" />
          <p className="text-lg font-medium">
            {teamId ? "עדיין לא הועלו תמונות מהצוות הזה." : "עדיין אין כאן תמונות 📷"}
          </p>
          <p className="text-sm text-muted-foreground">היו הראשונים להעלות תמונה לפיד!</p>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            memberId={member.id}
            imageUrl={signedUrls[post.image_url]}
            avatarUrl={post.member?.profile_image ? signedUrls[post.member.profile_image] : undefined}
            onOpen={setOpenPost}
          />
        ))}
      </div>

      {feedQuery.hasNextPage && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={feedQuery.isFetchingNextPage}
            onClick={() => feedQuery.fetchNextPage()}
          >
            {feedQuery.isFetchingNextPage ? (
              <>
                <Loader2 className="size-4 animate-spin" /> טוען…
              </>
            ) : (
              "טענו עוד תמונות"
            )}
          </Button>
        </div>
      )}

      <PhotoLightbox
        post={openPost}
        memberId={member.id}
        imageUrl={openPost ? signedUrls[openPost.image_url] : undefined}
        avatarUrl={openPost?.member?.profile_image ? signedUrls[openPost.member.profile_image] : undefined}
        onClose={() => setOpenPost(null)}
      />
    </AppShell>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
