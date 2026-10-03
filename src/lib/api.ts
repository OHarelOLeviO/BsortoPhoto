import { supabase } from "@/integrations/supabase/client";

/**
 * Data layer for the company photo network.
 *
 * All images live in the private `company-photos` storage bucket; the database
 * stores only the storage path. Because the bucket is private, rendering code
 * exchanges paths for short-lived signed URLs via `signImagePaths`.
 */

export const BUCKET = "company-photos";
const SIGNED_URL_TTL_SECONDS = 60 * 60;
export const FEED_PAGE_SIZE = 12;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export type Team = {
  id: string;
  name: string;
};

export type Member = {
  id: string;
  name: string;
  team_id: string;
  profile_image: string | null;
  created_at: string;
  team: { name: string } | null;
};

export type FeedPost = {
  id: string;
  image_url: string;
  created_at: string;
  user_id: string;
  member: {
    id: string;
    name: string;
    profile_image: string | null;
    team: { name: string } | null;
  } | null;
  likes: { user_id: string }[];
};

export type ProfilePost = {
  id: string;
  image_url: string;
  created_at: string;
  user_id: string;
  likes: { user_id: string }[];
};

const POST_SELECT =
  "id,image_url,created_at,user_id,member:members!inner(id,name,profile_image,team:teams(name)),likes(user_id)";

export async function listTeams(): Promise<Team[]> {
  const { data, error } = await supabase.from("teams").select("id,name").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function listMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from("members")
    .select("id,name,team_id,profile_image,created_at,team:teams(name)")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Member[];
}

export async function fetchFeedPage(page: number, teamId: string | null): Promise<FeedPost[]> {
  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .range(page * FEED_PAGE_SIZE, (page + 1) * FEED_PAGE_SIZE - 1);

  if (teamId) {
    query = query.eq("member.team_id", teamId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as FeedPost[];
}

export async function fetchProfile(userId: string): Promise<{ member: Member; posts: ProfilePost[] }> {
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id,name,team_id,profile_image,created_at,team:teams(name)")
    .eq("id", userId)
    .single();
  if (memberError) throw memberError;

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("id,image_url,created_at,user_id,likes(user_id)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (postsError) throw postsError;

  return { member: member as Member, posts: (posts ?? []) as ProfilePost[] };
}

/** Exchange storage paths for signed URLs the <img> tags can render. */
export async function signImagePaths(
  paths: (string | null | undefined)[],
): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter((p): p is string => Boolean(p)))];
  if (unique.length === 0) return {};

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(unique, SIGNED_URL_TTL_SECONDS);

  if (error) throw error;

  const map: Record<string, string> = {};

  data?.forEach((entry, index) => {
    const path = unique[index];

    if (path && entry.signedUrl) {
      map[path] = entry.signedUrl;
    }
  });

  return map;
}

export async function uploadImage(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (error) throw error;
  return path;
}

export async function createPost(userId: string, imagePath: string): Promise<void> {
  const { error } = await supabase.from("posts").insert({ user_id: userId, image_url: imagePath });
  if (error) throw error;
}

export async function setLike(postId: string, userId: string, liked: boolean): Promise<void> {
  if (liked) {
    const { error } = await supabase.from("likes").insert({ post_id: postId, user_id: userId });
    // 23505 = unique violation: the like already exists, which is the desired end state.
    if (error && error.code !== "23505") throw error;
  } else {
    const { error } = await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId);
    if (error) throw error;
  }
}

export async function updateProfileImage(userId: string, imagePath: string): Promise<void> {
  const { error } = await supabase.from("members").update({ profile_image: imagePath }).eq("id", userId);
  if (error) throw error;
}
