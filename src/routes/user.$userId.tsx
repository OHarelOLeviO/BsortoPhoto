import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  fetchProfile,
  listMembers,
  MAX_IMAGE_BYTES,
  signImagePaths,
  updateProfileImage,
  uploadImage,
  type FeedPost,
} from "@/lib/api";
import { useMemberId } from "@/lib/session";
import { photosLabel } from "@/lib/hebrew";
import { AppShell } from "@/components/AppShell";
import { NamePicker } from "@/components/NamePicker";
import { MemberAvatar } from "@/components/MemberAvatar";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/user/$userId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "פרופיל — הפלוגה" },
      { name: "description", content: "הפרופיל האישי של חבר הפלוגה — כל התמונות שהעלה." },
      { property: "og:title", content: "פרופיל — הפלוגה" },
      { property: "og:description", content: "הפרופיל האישי של חבר הפלוגה — כל התמונות שהעלה." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { userId } = Route.useParams();
  const memberId = useMemberId();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [changingAvatar, setChangingAvatar] = useState(false);
  const [openPost, setOpenPost] = useState<FeedPost | null>(null);

  const membersQuery = useQuery({
    queryKey: ["members"],
    queryFn: listMembers,
    enabled: Boolean(memberId),
  });
  const currentMember = membersQuery.data?.find((m) => m.id === memberId);

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId),
    enabled: Boolean(memberId),
  });

  const profile = profileQuery.data;

  const imagePaths = useMemo(() => {
    if (!profile) return [];
    return [profile.member.profile_image, ...profile.posts.map((p) => p.image_url)].filter(
      (p): p is string => Boolean(p),
    );
  }, [profile]);

  const signedQuery = useQuery({
    queryKey: ["signed", ...imagePaths.slice().sort()],
    queryFn: () => signImagePaths(imagePaths),
    enabled: imagePaths.length > 0,
    staleTime: 50 * 60 * 1000,
  });
  const signedUrls = signedQuery.data ?? {};

  if (!memberId) return <NamePicker />;
  if (membersQuery.isSuccess && !currentMember) return <NamePicker />;
  if (!currentMember) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const isOwnProfile = currentMember.id === userId;

  async function handleAvatarChosen(file: File | undefined) {
    if (!file || !isOwnProfile || changingAvatar) return;
    if (!file.type.startsWith("image/")) {
      toast.error("הקובץ שנבחר אינו תמונה.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("התמונה גדולה מדי. הגודל המרבי הוא 10MB.");
      return;
    }
    setChangingAvatar(true);
    try {
      const path = await uploadImage(currentMember!.id, file);
      await updateProfileImage(currentMember!.id, path);
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success("תמונת הפרופיל עודכנה");
    } catch {
      toast.error("ההעלאה נכשלה. נסה שוב.");
    } finally {
      setChangingAvatar(false);
    }
  }

  return (
    <AppShell
      member={currentMember}
      memberAvatarUrl={currentMember.profile_image ? signedUrls[currentMember.profile_image] : undefined}
    >
      {profileQuery.isLoading && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {profileQuery.isError && (
        <div className="feed-card flex flex-col items-center gap-3 px-4 py-12 text-center">
          <p className="text-muted-foreground">משהו השתבש. נסה שוב.</p>
          <Button variant="outline" onClick={() => profileQuery.refetch()}>
            נסה שוב
          </Button>
        </div>
      )}

      {profile && (
        <>
          {/* Profile header */}
          <div className="mb-6 flex items-center gap-4 px-1">
            <div className="relative">
              <MemberAvatar
                name={profile.member.name}
                imageUrl={profile.member.profile_image ? signedUrls[profile.member.profile_image] : undefined}
                className="size-20 text-2xl"
              />
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={changingAvatar}
                  aria-label="החלפת תמונת פרופיל"
                  className="absolute -bottom-1 -start-1 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  {changingAvatar ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
                </button>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">{profile.member.name}</h1>
              <p className="text-muted-foreground">{profile.member.team?.name}</p>
              <p className="mt-1 text-sm font-medium text-primary">{photosLabel(profile.posts.length)}</p>
            </div>
          </div>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleAvatarChosen(event.target.files?.[0])}
          />

          {/* Photo grid */}
          {profile.posts.length === 0 ? (
            <div className="feed-card flex flex-col items-center gap-3 px-4 py-16 text-center">
              <Camera className="size-10 text-muted-foreground" />
              <p className="text-lg font-medium">
                {isOwnProfile ? "עדיין לא העלית תמונות." : "עדיין לא הועלו תמונות."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {profile.posts.map((post) => {
                const asFeedPost: FeedPost = {
                  ...post,
                  member: {
                    id: profile.member.id,
                    name: profile.member.name,
                    profile_image: profile.member.profile_image,
                    team: profile.member.team,
                  },
                };
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setOpenPost(asFeedPost)}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-muted"
                    aria-label={`פתיחת תמונה של ${profile.member.name}`}
                  >
                    {signedUrls[post.image_url] ? (
                      <img
                        src={signedUrls[post.image_url]}
                        alt={`תמונה של ${profile.member.name}`}
                        loading="lazy"
                        className="size-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                        טוען…
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <PhotoLightbox
            post={openPost}
            memberId={currentMember.id}
            imageUrl={openPost ? signedUrls[openPost.image_url] : undefined}
            avatarUrl={profile.member.profile_image ? signedUrls[profile.member.profile_image] : undefined}
            onClose={() => setOpenPost(null)}
          />
        </>
      )}
    </AppShell>
  );
}
