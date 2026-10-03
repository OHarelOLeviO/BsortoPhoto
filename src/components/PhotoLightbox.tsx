import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { FeedPost } from "@/lib/api";
import { likesLabel, timeAgoHe } from "@/lib/hebrew";
import { useLikeMutation } from "@/lib/use-like";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MemberAvatar } from "@/components/MemberAvatar";
import { cn } from "@/lib/utils";

type PhotoLightboxProps = {
  post: FeedPost | null;
  memberId: string;
  imageUrl?: string;
  avatarUrl?: string;
  onClose: () => void;
};

/** Full-size photo viewer with uploader details and like action. */
export function PhotoLightbox({ post, memberId, imageUrl, avatarUrl, onClose }: PhotoLightboxProps) {
  const likeMutation = useLikeMutation(memberId);

  if (!post) return null;
  const liked = post.likes.some((like) => like.user_id === memberId);
  const member = post.member;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden rounded-3xl p-0">
        <DialogTitle className="sr-only">צפייה בתמונה</DialogTitle>

        <div className="bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`תמונה של ${member?.name ?? ""}`}
              className="max-h-[70vh] w-full object-contain"
            />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">טוען תמונה…</div>
          )}
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          {member && (
            <Link
              to="/user/$userId"
              params={{ userId: member.id }}
              onClick={onClose}
              className="flex min-w-0 items-center gap-3"
            >
              <MemberAvatar name={member.name} imageUrl={avatarUrl} className="size-10" />
              <div className="min-w-0">
                <div className="truncate font-semibold leading-tight">{member.name}</div>
                <div className="text-sm text-muted-foreground leading-tight">{member.team?.name}</div>
              </div>
            </Link>
          )}

          <div className="ms-auto flex items-center gap-2">
            <time className="hidden text-xs text-muted-foreground sm:block" dateTime={post.created_at}>
              {timeAgoHe(post.created_at)}
            </time>
            <button
              type="button"
              onClick={() => likeMutation.mutate({ postId: post.id, liked: !liked })}
              aria-label={liked ? "הסרת לייק" : "לייק"}
              aria-pressed={liked}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 transition-transform active:scale-95"
            >
              <Heart className={cn("size-5", liked ? "fill-like text-like" : "text-foreground")} />
              <span className="text-sm font-medium">{likesLabel(post.likes.length)}</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
