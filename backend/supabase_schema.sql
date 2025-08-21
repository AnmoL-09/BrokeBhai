-- Minimal tables to support backend loan and notification routes

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  lender_id uuid not null,
  borrower_id uuid not null,
  amount numeric not null,
  due_date timestamp with time zone not null,
  status text not null default 'pending', -- 'pending' | 'repaid' | 'overdue'
  created_at timestamp with time zone not null default now(),
  repaid_at timestamp with time zone
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  loan_id uuid,
  type text not null, -- 'loan_created' | 'loan_overdue' | 'loan_repaid'
  message text not null,
  created_at timestamp with time zone not null default now(),
  read boolean not null default false
);

-- Recommended foreign keys if users table exists as public.users
-- alter table public.loans add constraint loans_lender_fk foreign key (lender_id) references public.users(id) on delete cascade;
-- alter table public.loans add constraint loans_borrower_fk foreign key (borrower_id) references public.users(id) on delete cascade;
-- alter table public.notifications add constraint notifications_user_fk foreign key (user_id) references public.users(id) on delete cascade;
-- alter table public.notifications add constraint notifications_loan_fk foreign key (loan_id) references public.loans(id) on delete cascade;


