import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { FeedPost } from "@/lib/api";
import { likesLabel, timeAgoHe } from "@/lib/hebrew";
import { useLikeMutation } from "@/lib/use-like";
import { MemberAvatar } from "@/components/MemberAvatar";
import { cn } from "@/lib/utils";

type PostCardProps = {
  post: FeedPost;
  memberId: string;
  imageUrl?: string;
  avatarUrl?: string;
  onOpen: (post: FeedPost) => void;
};

/** One post in the feed: uploader header, photo, like row. */
export function PostCard({ post, memberId, imageUrl, avatarUrl, onOpen }: PostCardProps) {
  const likeMutation = useLikeMutation(memberId);
  const liked = post.likes.some((like) => like.user_id === memberId);
  const member = post.member;

  return (
    <article className="feed-card overflow-hidden">
      <header className="flex items-center gap-3 px-4 py-3">
        {member ? (
          <Link
            to="/user/$userId"
            params={{ userId: member.id }}
            className="flex min-w-0 items-center gap-3"
          >
            <MemberAvatar name={member.name} imageUrl={avatarUrl} className="size-10" />
            <div className="min-w-0">
              <div className="truncate font-semibold leading-tight">{member.name}</div>
              <div className="text-sm text-muted-foreground leading-tight">{member.team?.name}</div>
            </div>
          </Link>
        ) : (
          <div className="text-sm text-muted-foreground">משתמש לא ידוע</div>
        )}
        <time className="ms-auto shrink-0 text-xs text-muted-foreground" dateTime={post.created_at}>
          {timeAgoHe(post.created_at)}
        </time>
      </header>

      <button
        type="button"
        onClick={() => onOpen(post)}
        className="block w-full cursor-zoom-in bg-muted"
        aria-label="פתיחת התמונה בגודל מלא"
      >
        {imageUrl ? (
          <img src={imageUrl} alt={`תמונה של ${member?.name ?? ""}`} loading="lazy" className="w-full" />
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">טוען תמונה…</div>
        )}
      </button>

      <footer className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => likeMutation.mutate({ postId: post.id, liked: !liked })}
          aria-label={liked ? "הסרת לייק" : "לייק"}
          aria-pressed={liked}
          className="group flex items-center justify-center rounded-full p-1 transition-transform active:scale-90"
        >
          <Heart
            className={cn(
              "size-7 transition-colors",
              liked ? "fill-like text-like" : "text-foreground group-hover:text-like",
            )}
          />
        </button>
        <span className={cn("text-sm", post.likes.length > 0 ? "font-medium" : "text-muted-foreground")}>
          {likesLabel(post.likes.length)}
        </span>
      </footer>
    </article>
  );
}
