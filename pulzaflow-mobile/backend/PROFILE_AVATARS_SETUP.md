# PULZA FLOW Profile Photo Storage

PULZA FLOW profiles support a profile photo, display name, username and bio.

## Supabase setup before production

Create a Storage bucket named `profile-avatars`.

Use a private bucket so profile images are not exposed through a permanent public URL. The app requests short-lived signed URLs.

Add Storage RLS policies for the bucket:

```sql
create policy "Profile avatars upload own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

create policy "Profile avatars read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'profile-avatars'
);

create policy "Profile avatars update own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
)
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

create policy "Profile avatars delete own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);
```

Do not put a Supabase service-role key in the mobile app.

## Profile behavior

Users can:
- choose a square profile photo from their device;
- crop it to a square;
- change the photo later;
- edit display name;
- edit username;
- add or change a short bio;
- keep their email as the account login.

The existing `profiles.avatar_url` field stores the Storage path, not a permanent public URL.
