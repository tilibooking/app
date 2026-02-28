-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Jobs Table
create table public.jobs (
  id text primary key, -- "JOB 8821"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date text not null, -- "Today, 10:23 AM", "Date still pending"
  amount decimal(10, 2) not null default 0.00,
  status text not null check (status in ('Completed', 'Pending', 'Scheduled', 'Pending Approval', 'Removed')),
  tip decimal(10, 2) default 0.00,
  removed_at text -- Storing as text to match frontend format
);

-- Enable Row Level Security (RLS)
alter table public.jobs enable row level security;

-- Create a policy that allows all operations for now
create policy "Allow public access to jobs"
  on public.jobs
  for all
  using (true)
  with check (true);
