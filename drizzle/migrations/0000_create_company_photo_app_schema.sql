-- Internal company photo-sharing app schema
-- No Supabase Auth: members pick their name from a list (internal app, trusted network).
-- RLS is enabled with permissive anon policies; identity is enforced by the app session.

CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.teams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT ALL ON public.teams TO service_role;

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
  profile_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX members_team_id_idx ON public.members(team_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated;
GRANT ALL ON public.members TO service_role;

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view members" ON public.members FOR SELECT TO anon, authenticated USING (true);
-- Internal app: members may update their own profile image. Without Supabase Auth the
-- database cannot distinguish members, so writes are open to the internal network.
CREATE POLICY "Members can update profiles" ON public.members FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Members can be added" ON public.members FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX posts_user_id_idx ON public.posts(user_id);
CREATE INDEX posts_created_at_idx ON public.posts(created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Members can create posts" ON public.posts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Members can delete posts" ON public.posts FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX likes_post_id_idx ON public.likes(post_id);
CREATE INDEX likes_user_id_idx ON public.likes(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.likes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.likes TO authenticated;
GRANT ALL ON public.likes TO service_role;

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.likes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Members can like" ON public.likes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Members can unlike" ON public.likes FOR DELETE TO anon, authenticated USING (true);

-- Seed data: placeholder teams and members (replace with the real company roster)
INSERT INTO public.teams (name) VALUES
  ('צוות 1'),
  ('צוות 2'),
  ('צוות 3'),
  ('צוות 4');

INSERT INTO public.members (name, team_id)
SELECT m.name, t.id
FROM (
  VALUES
    ('ישראל ישראלי', 'צוות 1'),
    ('דני כהן', 'צוות 1'),
    ('נועם שרון', 'צוות 1'),
    ('משה לוי', 'צוות 2'),
    ('אבי אברהם', 'צוות 2'),
    ('תמר גולן', 'צוות 2'),
    ('יוסי מזרחי', 'צוות 3'),
    ('דנה ברק', 'צוות 3'),
    ('עומר נחמias', 'צוות 3'),
    ('רון אלון', 'צוות 4'),
    ('מאיה פרידמן', 'צוות 4'),
    ('איתן כץ', 'צוות 4')
) AS m(name, team_name)
JOIN public.teams t ON t.name = m.team_name;