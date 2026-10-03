import { cn } from "@/lib/utils";

type MemberAvatarProps = {
  name: string;
  imageUrl?: string | null | undefined;
  className?: string;
};

/** Round avatar: the member's photo when available, otherwise their first letter. */
export function MemberAvatar({ name, imageUrl, className }: MemberAvatarProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        loading="lazy"
        className={cn("size-10 shrink-0 rounded-full object-cover ring-1 ring-border", className)}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-1 ring-border",
        className,
      )}
    >
      {name.trim().charAt(0)}
    </div>
  );
}
