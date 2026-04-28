-- User roles
create type public.user_role as enum ('farmer', 'landowner', 'admin');

-- User approval status
create type public.profile_status as enum ('pending', 'approved', 'rejected', 'suspended');

-- Listing lifecycle status
create type public.listing_status as enum ('draft', 'pending', 'approved', 'rejected', 'archived');

-- Listing media type
create type public.media_type as enum ('photo', 'aerial', 'map');

-- Inquiry status
create type public.inquiry_status as enum ('open', 'closed', 'blocked');
