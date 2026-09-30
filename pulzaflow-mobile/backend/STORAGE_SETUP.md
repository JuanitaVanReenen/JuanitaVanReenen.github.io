# PULZA FLOW Storage Setup

Supabase Storage keeps the actual image/video files outside Postgres. PULZA FLOW stores media metadata in `public.pulza_media`.

## 1. Create the bucket

In the Supabase Dashboard:

1. Open Storage.
2. Create a bucket named `pulza-media`.
3. Configure the bucket according to the final launch policy and file-size limits.
4. Do not edit the `storage` schema tables directly.

## 2. Storage security

The upload service uses paths like:

`<authenticated-user-id>/<unique-file-name>`

Storage RLS should restrict authenticated uploads to objects whose first folder is the current user's ID.

Example upload policy:

```sql
create policy "PULZA FLOW users upload own media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'pulza-media'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);
```

If the bucket is public for public social media, retrieval is public but upload/delete operations remain protected by policies. If the bucket is private, the app must use authenticated downloads or signed URLs.

The final choice should be made before launch because it affects how feed media URLs are generated.

## 3. Application metadata

After a successful upload, create a `pulza_media` row containing:

- `pulza_id`
- `owner_id`
- `storage_path`
- `media_type`
- `mime_type`

## 4. Security rule

Never place a Supabase service-role key inside the mobile app. The mobile app uses the publishable key and authenticated user session; privileged moderation/payment operations belong on trusted server-side infrastructure.

## Recommended Storage RLS for PULZA FLOW

Use a **private** `pulza-media` bucket initially. The app can use signed URLs for media delivery.

For uploads, restrict authenticated users to a first-level folder matching their auth user ID. Also add a matching SELECT policy because Supabase Storage may perform a RETURNING operation after upload.

Example policies:

```sql
create policy "Pulza media authenticated upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'pulza-media'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

create policy "Pulza media owner read metadata"
on storage.objects for select
to authenticated
using (
  bucket_id = 'pulza-media'
  and owner_id = (select auth.uid()::text)
);

create policy "Pulza media owner delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'pulza-media'
  and owner_id = (select auth.uid()::text)
);
```

Do not modify Supabase's `storage` schema tables directly; use the Storage API and RLS policies.
