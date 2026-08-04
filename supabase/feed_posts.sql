create table public.feed_posts (
  id uuid not null default gen_random_uuid (),
  group_id uuid not null,
  profile_id uuid not null,
  commitment_id uuid null,
  type text not null default 'created'::text,
  content text not null,
  created_at timestamp with time zone not null default now(),
  constraint feed_posts_pkey primary key (id),
  constraint feed_posts_group_id_fkey foreign KEY (group_id) references public.groups (id) on delete CASCADE,
  constraint feed_posts_profile_id_fkey foreign KEY (profile_id) references public.profiles (id) on delete CASCADE,
  constraint feed_posts_commitment_id_fkey foreign KEY (commitment_id) references public.commitments (id) on delete SET NULL,
  constraint feed_posts_type_check check ((type = any (array['created'::text, 'submitted'::text, 'missed'::text])))
) TABLESPACE pg_default;

-- Migration for existing databases (table already created with the old
-- created/submitted-only constraint): run this in the Supabase SQL editor.
--
-- alter table public.feed_posts drop constraint feed_posts_type_check;
-- alter table public.feed_posts add constraint feed_posts_type_check check ((type = any (array['created'::text, 'submitted'::text, 'missed'::text])));

alter table public.feed_posts enable row level security;

create policy "feed_posts_member_select"
on public.feed_posts for select
using (
  exists (
    select 1
    from public.group_members gm
    where gm.group_id = feed_posts.group_id
      and gm.status = 'approved'
      and gm.profile_id = (select p.id from public.profiles p where p.user_id = auth.uid())
  )
  or exists (
    select 1 from public.groups g
    where g.id = feed_posts.group_id
      and g.owner_id = (select p.id from public.profiles p where p.user_id = auth.uid())
  )
);

create policy "feed_posts_member_insert"
on public.feed_posts for insert
with check (
  auth.uid() = (select p.user_id from public.profiles p where p.id = feed_posts.profile_id)
  and (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = feed_posts.group_id
        and gm.status = 'approved'
        and gm.profile_id = feed_posts.profile_id
    )
    or exists (
      select 1 from public.groups g
      where g.id = feed_posts.group_id
        and g.owner_id = feed_posts.profile_id
    )
  )
);

create policy "feed_posts_author_delete"
on public.feed_posts for delete
using (
  auth.uid() = (select p.user_id from public.profiles p where p.id = feed_posts.profile_id)
);
