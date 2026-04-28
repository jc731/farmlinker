# Farmlinker — Data Model Reference

All tables live in Supabase Postgres. RLS is enabled on every table.

---

## Enums

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('farmer', 'landowner', 'admin');

-- User/profile approval status
CREATE TYPE profile_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- Listing approval status
CREATE TYPE listing_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'archived');

-- Listing media type
CREATE TYPE media_type AS ENUM ('photo', 'aerial', 'map');

-- Inquiry status
CREATE TYPE inquiry_status AS ENUM ('open', 'closed', 'blocked');
```

---

## profiles

Base user record, created automatically on `auth.users` insert.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK = auth.users.id |
| role | user_role | farmer / landowner / admin |
| status | profile_status | default: pending |
| first_name | text | |
| last_name | text | |
| phone | text | |
| address | text | |
| city | text | |
| state | text | default 'IL' |
| zip | text | |
| terms_accepted | bool | default false |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | updated by trigger |

**RLS policies:**
- User can read/update their own row
- Admin can read/update all rows
- Approved users can read `id`, `first_name`, `last_name` of other approved users (no contact details)
- Pending users cannot read other profiles at all

---

## farmer_profiles

Extended farmer-specific data. One row per farmer.

| Column | Type |
|---|---|
| profile_id | uuid (PK, FK → profiles.id) |
| farming_plans_and_goals | text |
| farming_status | text |
| farming_status_notes | text |
| counties | text[] |
| farmable_acreage_range | text |
| infrastructure_needed | text[] |
| infrastructure_notes | text |
| crops | text[] |
| livestock | text[] |
| crops_livestock_notes | text |
| farming_methods | text[] |
| farming_methods_notes | text |
| business_plan_status | text |
| business_plan_summary | text |
| tenure_options_desired | text[] |
| tenure_notes | text |
| experience_education | text[] |
| experience_notes | text |
| referral_source | text |

**RLS policies:**
- User can read/update their own row
- Admin can read all rows
- Approved landowners can read non-contact fields of approved farmers

---

## farmer_demographics

Admin-only sensitive data. Kept in a separate table with its own RLS to ensure it is never exposed in general queries.

| Column | Type |
|---|---|
| profile_id | uuid (PK, FK → profiles.id) |
| gender | text |
| age_range | text |
| veteran_status | text |
| race | text[] |
| ethnicity | text |
| disability_status | text |

**RLS policies:**
- User can insert/update their own row (write access for self-reporting)
- **No user can read this table** — reads are admin-only
- Admin can read all rows

---

## landowner_profiles

| Column | Type |
|---|---|
| profile_id | uuid (PK, FK → profiles.id) |
| referral_source | text |
| created_at | timestamptz |

**RLS policies:**
- User can read/update their own row
- Admin can read all rows
- Approved farmers can read non-contact fields of approved landowners

---

## landowner_demographics

Same structure and RLS pattern as `farmer_demographics`.

| Column | Type |
|---|---|
| profile_id | uuid (PK, FK → profiles.id) |
| gender | text |
| age_range | text |
| veteran_status | text |
| race | text[] |
| ethnicity | text |
| disability_status | text |

---

## listings

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| owner_profile_id | uuid | FK → profiles.id |
| status | listing_status | default: draft |
| property_name | text | |
| street_address | text | |
| city | text | |
| state | text | |
| zip | text | |
| county | text | |
| total_acreage | numeric | |
| farmable_acreage | numeric | |
| natural_area_acreage | numeric | |
| infrastructure_available | text[] | |
| infrastructure_notes | text | |
| crops_permitted | text[] | |
| livestock_permitted | text[] | |
| crops_livestock_notes | text | |
| property_history_notes | text | |
| preferred_farming_methods | text[] | |
| stewardship_values | text | |
| certified_organic_or_eligible | bool | |
| tenure_options_offered | text[] | |
| tenure_availability_timing | text | |
| tenure_notes | text | |
| zoning_appropriate | bool | |
| conservation_easement | bool | |
| public_access_allowed | bool | |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | updated by trigger |

**RLS policies:**
- Owner can read their own listings (any status)
- Owner can insert/update while status is `draft` or `rejected`
- Approved farmers can read listings with status = `approved`
- Admin can read/update all listings

---

## listing_media

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| listing_id | uuid | FK → listings.id |
| type | media_type | photo / aerial / map |
| storage_path | text | Supabase Storage path |
| sort_order | int | |

**RLS policies:**
- Inherits visibility from parent listing (join check or policy mirror)
- Owner can insert/delete media for their own listings

---

## inquiries

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| listing_id | uuid | FK → listings.id |
| from_profile_id | uuid | FK → profiles.id (farmer) |
| to_profile_id | uuid | FK → profiles.id (landowner) |
| status | inquiry_status | default: open |
| created_at | timestamptz | |

**RLS policies:**
- Participants (from or to) can read their own inquiries
- from_profile (farmer) can insert
- Either participant can update status to closed
- Admin can read all; admin can set status to blocked

---

## inquiry_messages

| Column | Type |
|---|---|
| id | uuid (PK) |
| inquiry_id | uuid (FK → inquiries.id) |
| sender_profile_id | uuid (FK → profiles.id) |
| body | text |
| created_at | timestamptz |

**RLS policies:**
- Only inquiry participants can read messages in their inquiry
- Only inquiry participants can insert messages (sender must be a participant)
- Messages are immutable — no update/delete

---

## Key RLS Invariants

1. Demographic tables (`farmer_demographics`, `landowner_demographics`) are **never readable by non-admins**, regardless of approval status.
2. Listings are only visible to `approved` farmers when the listing status is `approved`.
3. Contact details (phone, address) on `profiles` are only visible to admin and the profile owner — not to other approved users.
4. Inquiry messages are isolated per inquiry — neither party can read other inquiries.
5. All admin access is gated on `profiles.role = 'admin'`, not a separate `is_admin` flag.
