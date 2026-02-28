
-- Create users table if it doesn't exist
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  role text not null,
  avatar_url text,
  pin text not null
);

-- Insert default users with PINs
insert into users (name, role, avatar_url, pin)
values 
  ('Edgar', 'Dent Repair Expert', 'https://i.pravatar.cc/150?img=11', '1111'),
  ('AAA Capital', 'Company Admin', null, '1212')
on conflict (name) do update set 
  pin = excluded.pin,
  role = excluded.role,
  avatar_url = excluded.avatar_url;
