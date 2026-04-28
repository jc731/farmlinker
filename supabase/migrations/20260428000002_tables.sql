-- Base user record, created automatically on auth.users insert via trigger
create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  role              public.user_role     not null,
  status            public.profile_status not null default 'pending',
  first_name        text                 not null default '',
  last_name         text                 not null default '',
  phone             text,
  address           text,
  city              text,
  state             text                 not null default 'IL',
  zip               text,
  terms_accepted    boolean              not null default false,
  created_at        timestamptz          not null default now(),
  updated_at        timestamptz          not null default now()
);

-- Extended farmer data — filled during onboarding
create table public.farmer_profiles (
  profile_id                  uuid primary key references public.profiles (id) on delete cascade,
  farming_plans_and_goals     text,
  farming_status              text,
  farming_status_notes        text,
  counties                    text[]    not null default '{}',
  farmable_acreage_range      text,
  infrastructure_needed       text[]    not null default '{}',
  infrastructure_notes        text,
  crops                       text[]    not null default '{}',
  livestock                   text[]    not null default '{}',
  crops_livestock_notes       text,
  farming_methods             text[]    not null default '{}',
  farming_methods_notes       text,
  business_plan_status        text,
  business_plan_summary       text,
  tenure_options_desired      text[]    not null default '{}',
  tenure_notes                text,
  experience_education        text[]    not null default '{}',
  experience_notes            text,
  referral_source             text
);

-- Farmer demographics — admin-only reads, separate table for strict RLS isolation
create table public.farmer_demographics (
  profile_id        uuid primary key references public.profiles (id) on delete cascade,
  gender            text,
  age_range         text,
  veteran_status    text,
  race              text[]    not null default '{}',
  ethnicity         text,
  disability_status text
);

-- Extended landowner data — filled during onboarding
create table public.landowner_profiles (
  profile_id        uuid primary key references public.profiles (id) on delete cascade,
  referral_source   text,
  created_at        timestamptz not null default now()
);

-- Landowner demographics — same isolation pattern as farmer_demographics
create table public.landowner_demographics (
  profile_id        uuid primary key references public.profiles (id) on delete cascade,
  gender            text,
  age_range         text,
  veteran_status    text,
  race              text[]    not null default '{}',
  ethnicity         text,
  disability_status text
);

-- Farmland listings created by landowners
create table public.listings (
  id                            uuid primary key default gen_random_uuid(),
  owner_profile_id              uuid          not null references public.profiles (id) on delete cascade,
  status                        public.listing_status not null default 'draft',
  property_name                 text,
  street_address                text,
  city                          text,
  state                         text,
  zip                           text,
  county                        text,
  total_acreage                 numeric,
  farmable_acreage              numeric,
  natural_area_acreage          numeric,
  infrastructure_available      text[]        not null default '{}',
  infrastructure_notes          text,
  crops_permitted               text[]        not null default '{}',
  livestock_permitted           text[]        not null default '{}',
  crops_livestock_notes         text,
  property_history_notes        text,
  preferred_farming_methods     text[]        not null default '{}',
  stewardship_values            text,
  certified_organic_or_eligible boolean,
  tenure_options_offered        text[]        not null default '{}',
  tenure_availability_timing    text,
  tenure_notes                  text,
  zoning_appropriate            boolean,
  conservation_easement         boolean,
  public_access_allowed         boolean,
  created_at                    timestamptz   not null default now(),
  updated_at                    timestamptz   not null default now()
);

-- Photos, aerial imagery, and maps attached to listings
create table public.listing_media (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid               not null references public.listings (id) on delete cascade,
  type          public.media_type  not null,
  storage_path  text               not null,
  sort_order    integer            not null default 0
);

-- Farmer → landowner connection requests
create table public.inquiries (
  id               uuid primary key default gen_random_uuid(),
  listing_id       uuid                  not null references public.listings (id) on delete cascade,
  from_profile_id  uuid                  not null references public.profiles (id) on delete cascade,
  to_profile_id    uuid                  not null references public.profiles (id) on delete cascade,
  status           public.inquiry_status not null default 'open',
  created_at       timestamptz           not null default now(),
  -- one inquiry per farmer per listing
  unique (listing_id, from_profile_id)
);

-- Messages within an inquiry thread
create table public.inquiry_messages (
  id                uuid primary key default gen_random_uuid(),
  inquiry_id        uuid        not null references public.inquiries (id) on delete cascade,
  sender_profile_id uuid        not null references public.profiles (id) on delete cascade,
  body              text        not null,
  created_at        timestamptz not null default now()
);
