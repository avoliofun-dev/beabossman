-- =====================================================================
-- Kantor Virtual Tycoon · Skema Supabase (MVP)
-- Cara pakai: Supabase Dashboard > SQL Editor > tempel seluruh file > Run.
-- Aman dijalankan ulang untuk tabel baru; untuk reset total, drop tabelnya dulu.
--
-- Prinsip: klien TIDAK boleh menulis langsung ke tabel. Semua perubahan
-- (kas, energi, hasil kontrak) lewat fungsi RPC di bawah, dihitung di server.
-- =====================================================================

-- ---------- TABEL ----------
create table if not exists public.companies (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null unique references auth.users(id) on delete cascade,
  name        text not null default 'Studio Baru',
  theme       text not null default 'agensi',
  cash        bigint not null default 300000,
  rep         int not null default 0,
  done        int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.employees (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  is_founder  boolean not null default false,
  xp          jsonb not null default '{"Konten":0,"Desain":0,"Video":0}',
  energy      int not null default 100 check (energy between 0 and 100),
  rest_from   int,
  rest_start  timestamptz,
  rest_end    timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists public.contracts (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  field       text not null check (field in ('Konten','Desain','Video')),
  title       text not null,
  difficulty  int not null check (difficulty between 1 and 5),
  duration_s  int not null,
  pay         int not null,
  energy_cost int not null,
  status      text not null default 'offered' check (status in ('offered','active','done')),
  employee_id uuid references public.employees(id) on delete set null,
  started_at  timestamptz,
  finish_at   timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists public.activity_log (
  id          bigserial primary key,
  company_id  uuid not null references public.companies(id) on delete cascade,
  message     text not null,
  created_at  timestamptz not null default now()
);

-- Paket tema: judul kontrak per tema (tambah baris baru = tema baru)
create table if not exists public.contract_templates (
  id     serial primary key,
  theme  text not null,
  field  text not null check (field in ('Konten','Desain','Video')),
  title  text not null
);

create index if not exists contracts_company_status_idx on public.contracts(company_id, status);
create index if not exists activity_company_idx on public.activity_log(company_id, id desc);

insert into public.contract_templates(theme, field, title)
select * from (values
  ('agensi','Konten','Caption produk baru'),('agensi','Konten','Artikel blog tips'),
  ('agensi','Konten','Naskah video 30 detik'),('agensi','Konten','Newsletter mingguan'),
  ('agensi','Desain','Banner promo'),('agensi','Desain','Poster diskon'),
  ('agensi','Desain','Feed Instagram'),('agensi','Desain','Logo kecil'),
  ('agensi','Video','Edit video unboxing'),('agensi','Video','Subtitle webinar'),
  ('agensi','Video','Reels 9:16'),('agensi','Video','Highlight podcast')
) as t(theme, field, title)
where not exists (select 1 from public.contract_templates);

-- ---------- RLS: pemain hanya bisa MEMBACA data miliknya ----------
alter table public.companies          enable row level security;
alter table public.employees          enable row level security;
alter table public.contracts          enable row level security;
alter table public.activity_log       enable row level security;
alter table public.contract_templates enable row level security;

drop policy if exists own_company   on public.companies;
drop policy if exists own_employees on public.employees;
drop policy if exists own_contracts on public.contracts;
drop policy if exists own_log       on public.activity_log;
drop policy if exists read_templates on public.contract_templates;

create policy own_company on public.companies for select to authenticated
  using (owner = auth.uid());
create policy own_employees on public.employees for select to authenticated
  using (company_id in (select id from public.companies where owner = auth.uid()));
create policy own_contracts on public.contracts for select to authenticated
  using (company_id in (select id from public.companies where owner = auth.uid()));
create policy own_log on public.activity_log for select to authenticated
  using (company_id in (select id from public.companies where owner = auth.uid()));
create policy read_templates on public.contract_templates for select to authenticated
  using (true);

-- Tidak ada policy insert/update/delete + cabut hak tulis: klien tidak bisa curang.
revoke insert, update, delete, truncate on
  public.companies, public.employees, public.contracts,
  public.activity_log, public.contract_templates from anon, authenticated;

-- ---------- FUNGSI INTERNAL (tidak bisa dipanggil klien) ----------
create or replace function public._lv(p_xp jsonb, p_field text)
returns int language sql immutable as $$
  select 1 + floor(coalesce((p_xp->>p_field)::int, 0) / 3.0)::int
$$;

create or replace function public._log(p_company uuid, p_msg text)
returns void language sql as $$
  insert into public.activity_log(company_id, message) values (p_company, p_msg);
$$;

create or replace function public._gen_contract(p_company uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_rep int; v_theme text; v_field text; v_title text; d int;
begin
  select rep, theme into v_rep, v_theme from companies where id = p_company;
  select field, title into v_field, v_title
    from contract_templates where theme = v_theme order by random() limit 1;
  if v_field is null then v_field := 'Konten'; v_title := 'Tugas umum'; end if;

  d := 1 + floor(random() * least(5, 1 + v_rep / 15))::int;
  insert into contracts(company_id, field, title, difficulty, duration_s, pay, energy_cost)
  values (
    p_company, v_field, v_title, d,
    15 + d * 8 + floor(random() * 10)::int,
    (round((50000 + d * 25000) * (0.85 + random() * 0.3) / 5000) * 5000)::int,
    8 + d * 4
  );
end $$;

-- Menyelesaikan semua kontrak yang waktunya lewat + memulihkan energi.
-- Dipanggil otomatis oleh get_state / take_contract / start_rest.
create or replace function public._settle(p_company uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  c record; e record; q numeric; v_pay int;
begin
  for c in
    select * from contracts
    where company_id = p_company and status = 'active' and finish_at <= now()
    order by finish_at for update
  loop
    select * into e from employees where id = c.employee_id;
    q := least(1.3, greatest(0.5,
           0.75 + (_lv(e.xp, c.field) - c.difficulty) * 0.12 + random() * 0.25));
    v_pay := (round(c.pay * q / 1000) * 1000)::int;

    update contracts set status = 'done' where id = c.id;
    update companies
       set cash = cash + v_pay,
           done = done + 1,
           rep  = rep + case when q >= 0.8 then c.difficulty else 0 end,
           updated_at = now()
     where id = p_company;
    update employees
       set xp = jsonb_set(xp, array[c.field],
                  to_jsonb(coalesce((xp->>c.field)::int, 0) + 1))
     where id = c.employee_id;

    perform _log(p_company, format(
      '“%s” selesai, kualitas %s%% (%s), +Rp %s dari dasar Rp %s',
      c.title, round(q * 100),
      case when q >= 1.05 then 'memuaskan' when q >= 0.8 then 'baik' else 'kurang' end,
      replace(to_char(v_pay, 'FM999,999,999'), ',', '.'),
      replace(to_char(c.pay, 'FM999,999,999'), ',', '.')));
  end loop;

  update employees
     set energy = 100, rest_from = null, rest_start = null, rest_end = null
   where company_id = p_company and rest_end is not null and rest_end <= now();

  delete from contracts
   where company_id = p_company and status = 'done'
     and finish_at < now() - interval '1 day';
end $$;

-- ---------- FUNGSI RPC (dipanggil klien) ----------
create or replace function public.start_game(p_name text default 'Studio Baru', p_theme text default 'agensi')
returns uuid language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_cid uuid; v_theme text;
begin
  if v_uid is null then raise exception 'Belum login'; end if;
  select id into v_cid from companies where owner = v_uid;
  if v_cid is not null then return v_cid; end if;

  v_theme := case when exists (select 1 from contract_templates where theme = p_theme)
                  then p_theme else 'agensi' end;
  insert into companies(owner, name, theme)
  values (v_uid, left(coalesce(nullif(trim(p_name), ''), 'Studio Baru'), 24), v_theme)
  returning id into v_cid;

  insert into employees(company_id, name, is_founder) values (v_cid, 'Kamu', true);
  for i in 1..3 loop perform _gen_contract(v_cid); end loop;
  perform _log(v_cid, 'Studio dibuka. Selamat bekerja!');
  return v_cid;
end $$;

create or replace function public.get_state()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_cid uuid;
begin
  if v_uid is null then raise exception 'Belum login'; end if;
  select id into v_cid from companies where owner = v_uid for update;
  if v_cid is null then return null; end if;
  perform _settle(v_cid);
  return jsonb_build_object(
    'now', now(),   -- waktu server, untuk menyelaraskan timer di klien
    'company',   (select to_jsonb(c) - 'owner' from companies c where c.id = v_cid),
    'employees', (select coalesce(jsonb_agg(to_jsonb(e) order by e.created_at), '[]'::jsonb)
                    from employees e where e.company_id = v_cid),
    'contracts', (select coalesce(jsonb_agg(to_jsonb(k) order by k.created_at), '[]'::jsonb)
                    from contracts k where k.company_id = v_cid and k.status <> 'done'),
    'log',       (select coalesce(jsonb_agg(l.message order by l.id desc), '[]'::jsonb)
                    from (select id, message from activity_log
                           where company_id = v_cid order by id desc limit 12) l)
  );
end $$;

create or replace function public.take_contract(p_contract uuid, p_employee uuid default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid(); v_cid uuid; e employees%rowtype; c contracts%rowtype;
begin
  if v_uid is null then raise exception 'Belum login'; end if;
  select id into v_cid from companies where owner = v_uid for update;
  if v_cid is null then raise exception 'Studio belum dibuat'; end if;
  perform _settle(v_cid);

  select * into c from contracts
   where id = p_contract and company_id = v_cid and status = 'offered' for update;
  if not found then raise exception 'Kontrak tidak tersedia'; end if;

  select * into e from employees
   where company_id = v_cid and (id = p_employee or (p_employee is null and is_founder))
   limit 1;
  if not found then raise exception 'Pekerja tidak ditemukan'; end if;

  if exists (select 1 from contracts where employee_id = e.id and status = 'active') then
    raise exception 'Pekerja sedang bekerja';
  end if;
  if e.rest_end is not null and e.rest_end > now() then
    raise exception 'Pekerja sedang istirahat';
  end if;
  if e.energy < c.energy_cost then raise exception 'Energi tidak cukup'; end if;

  update employees set energy = energy - c.energy_cost where id = e.id;
  update contracts
     set status = 'active', employee_id = e.id, started_at = now(),
         finish_at = now() + make_interval(secs => c.duration_s)
   where id = c.id;
  perform _gen_contract(v_cid);   -- jaga agar slot papan tetap 3
  return get_state();
end $$;

create or replace function public.start_rest(p_employee uuid default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_cid uuid; e employees%rowtype;
begin
  if v_uid is null then raise exception 'Belum login'; end if;
  select id into v_cid from companies where owner = v_uid for update;
  if v_cid is null then raise exception 'Studio belum dibuat'; end if;
  perform _settle(v_cid);

  select * into e from employees
   where company_id = v_cid and (id = p_employee or (p_employee is null and is_founder))
   limit 1;
  if not found then raise exception 'Pekerja tidak ditemukan'; end if;
  if exists (select 1 from contracts where employee_id = e.id and status = 'active') then
    raise exception 'Pekerja sedang bekerja';
  end if;
  if e.rest_end is not null and e.rest_end > now() then
    raise exception 'Sudah istirahat';
  end if;
  if e.energy >= 100 then raise exception 'Energi sudah penuh'; end if;

  update employees
     set rest_from = e.energy, rest_start = now(),
         rest_end = now() + make_interval(secs => (100 - e.energy) * 0.4)
   where id = e.id;
  return get_state();
end $$;

create or replace function public.reset_game()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Belum login'; end if;
  delete from companies where owner = auth.uid();   -- data anak ikut terhapus
end $$;

-- ---------- HAK AKSES FUNGSI ----------
revoke all on function public._lv(jsonb, text), public._log(uuid, text),
  public._gen_contract(uuid), public._settle(uuid) from public, anon, authenticated;

revoke all on function public.start_game(text, text), public.get_state(),
  public.take_contract(uuid, uuid), public.start_rest(uuid), public.reset_game()
  from public, anon;
grant execute on function public.start_game(text, text), public.get_state(),
  public.take_contract(uuid, uuid), public.start_rest(uuid), public.reset_game()
  to authenticated;

-- ---------- CONTOH PEMAKAIAN DI KLIEN (supabase-js) ----------
-- await supabase.rpc('start_game', { p_name: 'Studio Laras', p_theme: 'agensi' })
-- const { data } = await supabase.rpc('get_state')          // sekaligus menyelesaikan kontrak yang lewat waktu
-- await supabase.rpc('take_contract', { p_contract: id })   // mengembalikan state terbaru
-- await supabase.rpc('start_rest')
-- await supabase.rpc('reset_game')
