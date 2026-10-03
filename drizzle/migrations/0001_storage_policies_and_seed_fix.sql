-- Storage access for the internal company-photos bucket (private bucket, signed URLs).
CREATE POLICY "Members can view company photos" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'company-photos');

CREATE POLICY "Members can upload company photos" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'company-photos');

CREATE POLICY "Members can delete company photos" ON storage.objects
  FOR DELETE TO anon, authenticated USING (bucket_id = 'company-photos');

CREATE POLICY "Members can update company photos" ON storage.objects
  FOR UPDATE TO anon, authenticated USING (bucket_id = 'company-photos') WITH CHECK (bucket_id = 'company-photos');

-- Fix a typo in a seeded placeholder name
UPDATE public.members SET name = 'עומר נחמיאס' WHERE name = 'עומר נחמias';