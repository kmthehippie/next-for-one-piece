create table if not exists public.one_piece_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_item_id text,
  previous_item_id text
);

alter table public.one_piece_progress enable row level security;

create policy "own progress read"
on public.one_piece_progress
for select
to authenticated
using (auth.uid() = user_id);

create policy "own progress write"
on public.one_piece_progress
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "own progress update"
on public.one_piece_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
