-- Scheduled cleanup: deletes feed posts older than 24 hours.
-- Run once in the Supabase SQL editor to install. Requires the pg_cron extension.

create extension if not exists pg_cron;

select cron.schedule(
  'feed-posts-expiry-cleanup',
  '0 * * * *',
  $$
  delete from public.feed_posts
  where created_at < now() - interval '24 hours';
  $$
);

-- To stop the job later, run:
-- select cron.unschedule('feed-posts-expiry-cleanup');
