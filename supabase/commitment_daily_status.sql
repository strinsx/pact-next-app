create table public.commitment_daily_status (
  id uuid not null default gen_random_uuid (),
  commitment_id uuid not null,
  profile_id uuid not null,
  commitment_date date not null,
  status text not null default 'pending'::text,
  completed_at timestamp with time zone null,
  evaluated_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  constraint commitment_daily_status_pkey primary key (id),
  constraint commitment_daily_status_unique unique (commitment_id, commitment_date),
  constraint commitment_daily_status_commitment_id_fkey foreign KEY (commitment_id) references commitments (id) on delete CASCADE,
  constraint commitment_daily_status_profile_id_fkey foreign KEY (profile_id) references profiles (id) on delete CASCADE,
  constraint commitment_daily_status_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'completed'::text,
          'missed'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists commitment_daily_status_profile_date_idx on public.commitment_daily_status using btree (profile_id, commitment_date) TABLESPACE pg_default;

create index IF not exists commitment_daily_status_commitment_date_idx on public.commitment_daily_status using btree (commitment_id, commitment_date) TABLESPACE pg_default;

alter table public.commitment_daily_status enable row level security;

create policy "commitment_daily_status_owner_select"
on public.commitment_daily_status for select
using (
  auth.uid() = (select p.user_id from public.profiles p where p.id = commitment_daily_status.profile_id)
);

create policy "commitment_daily_status_owner_insert"
on public.commitment_daily_status for insert
with check (
  auth.uid() = (select p.user_id from public.profiles p where p.id = commitment_daily_status.profile_id)
);

create policy "commitment_daily_status_owner_update"
on public.commitment_daily_status for update
using (
  auth.uid() = (select p.user_id from public.profiles p where p.id = commitment_daily_status.profile_id)
)
with check (
  auth.uid() = (select p.user_id from public.profiles p where p.id = commitment_daily_status.profile_id)
);

create policy "commitment_daily_status_owner_delete"
on public.commitment_daily_status for delete
using (
  auth.uid() = (select p.user_id from public.profiles p where p.id = commitment_daily_status.profile_id)
);