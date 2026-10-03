import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { setLike, type FeedPost, type ProfilePost } from "@/lib/api";

type LikesArray = { user_id: string }[];

function toggleInLikes(likes: LikesArray, memberId: string, liked: boolean): LikesArray {
  if (liked) {
    if (likes.some((l) => l.user_id === memberId)) return likes;
    return [...likes, { user_id: memberId }];
  }
  return likes.filter((l) => l.user_id !== memberId);
}

/** Optimistically apply/remove the current member's like in every cached feed/profile. */
function applyLikeToCaches(queryClient: ReturnType<typeof useQueryClient>, postId: string, memberId: string, liked: boolean) {
  queryClient.setQueriesData<{ pages: FeedPost[][] }>({ queryKey: ["feed"] }, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) =>
        page.map((post) =>
          post.id === postId ? { ...post, likes: toggleInLikes(post.likes, memberId, liked) } : post,
        ),
      ),
    };
  });

  queryClient.setQueriesData<{ member: unknown; posts: ProfilePost[] }>({ queryKey: ["profile"] }, (old) => {
    if (!old) return old;
    return {
      ...old,
      posts: old.posts.map((post) =>
        post.id === postId ? { ...post, likes: toggleInLikes(post.likes, memberId, liked) } : post,
      ),
    };
  });
}

export function useLikeMutation(memberId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, liked }: { postId: string; liked: boolean }) => setLike(postId, memberId, liked),
    onMutate: async ({ postId, liked }) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["profile"] });
      const feedSnapshots = queryClient.getQueriesData({ queryKey: ["feed"] });
      const profileSnapshots = queryClient.getQueriesData({ queryKey: ["profile"] });
      applyLikeToCaches(queryClient, postId, memberId, liked);
      return { feedSnapshots, profileSnapshots };
    },
    onError: (_error, { postId, liked }, context) => {
      context?.feedSnapshots?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      context?.profileSnapshots?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      // Re-apply nothing: snapshots already restored. Just notify.
      void postId;
      void liked;
      toast.error("משהו השתבש. נסה שוב.");
    },
  });
}
