import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Data pools ──────────────────────────────────────────────────────────────

const IL_CITIES = [
  { city: 'Normal', county: 'McLean' },
  { city: 'Springfield', county: 'Sangamon' },
  { city: 'Champaign', county: 'Champaign' },
  { city: 'Decatur', county: 'Macon' },
  { city: 'Peoria', county: 'Peoria' },
  { city: 'Galesburg', county: 'Knox' },
  { city: 'Ottawa', county: 'LaSalle' },
  { city: 'Pekin', county: 'Tazewell' },
  { city: 'Kankakee', county: 'Kankakee' },
  { city: 'Danville', county: 'Vermilion' },
  { city: 'Pontiac', county: 'Livingston' },
  { city: 'Lincoln', county: 'Logan' },
  { city: 'Watseka', county: 'Iroquois' },
  { city: 'Paxton', county: 'Ford' },
  { city: 'Paris', county: 'Edgar' },
  { city: 'Charleston', county: 'Coles' },
  { city: 'Tuscola', county: 'Douglas' },
  { city: 'Sullivan', county: 'Moultrie' },
  { city: 'Shelbyville', county: 'Shelby' },
  { city: 'Taylorville', county: 'Christian' },
];

const PROPERTY_NAMES = [
  'Rolling Hills Farm','Sunrise Acres','Prairie View Farm','Clearwater Farmstead',
  'Blackstone Fields','Oak Ridge Farm','Heritage Acres','Millbrook Farm',
  'Creekside Fields','Maple Hollow Farm','Blue Sky Acres','Fox Run Farm',
  'Riverbend Farmstead','Cornerstone Fields','Willowbrook Farm','Cloverdale Acres',
  'Timber Ridge Farm','Stonegate Fields','Meadow Creek Farm','Ironwood Acres',
  'Bluebell Farm','Harvest Moon Fields','Greenleaf Acres','Wheatland Farm',
  'Birchwood Farmstead',
];

const TENURE_OPTIONS = [
  ['Cash rent lease','Long-term lease (5+ years)'],
  ['Crop share lease','Flexible / open to discussion'],
  ['Cash rent lease','Short-term lease (1–3 years)'],
  ['Long-term lease (5+ years)','Flexible / open to discussion'],
  ['Cash rent lease'],
  ['Crop share lease'],
  ['Short-term lease (1–3 years)','Cash rent lease'],
];

const INFRASTRUCTURE_OPTIONS = [
  ['Grain bins / storage','Equipment storage / machine shed','Water access (well, pond, irrigation)'],
  ['Barn / livestock housing','Fencing','Water access (well, pond, irrigation)'],
  ['Grain bins / storage','Irrigation system'],
  ['Equipment storage / machine shed','Water access (well, pond, irrigation)'],
  ['Barn / livestock housing','Fencing'],
  ['Irrigation system','Cold storage / cooler','Water access (well, pond, irrigation)'],
  ['Grain bins / storage'],
  ['Equipment storage / machine shed'],
];

const CROP_OPTIONS = [
  ['Corn','Soybeans'],
  ['Corn','Soybeans','Wheat'],
  ['Vegetables / Market Garden','Herbs'],
  ['Hay / Forage'],
  ['Corn','Soybeans','Hay / Forage'],
  ['Fruit / Orchard','Vegetables / Market Garden'],
  ['Wheat','Corn'],
];

const LIVESTOCK_OPTIONS = [
  ['None'],
  ['Beef cattle'],
  ['Hogs / Pigs'],
  ['Sheep','Goats'],
  ['Poultry (chickens, turkeys, ducks)'],
  ['Beef cattle','Poultry (chickens, turkeys, ducks)'],
];

const METHOD_OPTIONS = [
  ['Conventional'],
  ['No-till / Conservation till','Conventional'],
  ['Certified Organic'],
  ['Regenerative','No-till / Conservation till'],
  ['Transitioning to Organic'],
  ['Integrated Pest Management (IPM)','Conventional'],
];

const AVAILABILITY = [
  'Spring 2026','Fall 2026','Available now','Spring 2027','Flexible',
  'January 2026','March 2026','Available immediately',
];

const STEWARDSHIP_NOTES = [
  'We are looking for a farmer who shares our commitment to long-term land health. Preference for someone who plans to build organic matter and minimize tillage over time.',
  'Our family has farmed this land for three generations. We hope the next steward will continue that tradition and take care of the soil for the next generation.',
  'We value open communication and a collaborative relationship. We want a farmer who keeps us informed about what\'s happening on the land and treats it as their own.',
  'Conservation is important to us. We have a grass waterway and filter strip already established — we ask that these be maintained as part of any agreement.',
  'Looking for a beginning or transitioning farmer who wants to build a long-term operation. We\'re willing to negotiate on terms to support the right fit.',
  null,
  null,
];

const PROPERTY_HISTORY = [
  'This ground has been in continuous corn/soybean production for over 30 years. Tile drainage installed in 2018. Soil tests available upon request.',
  'Mixed row crop and hay ground. The south field was used for cattle grazing until 2020. Fence lines in reasonable condition.',
  'Certified organic since 2019. Transition period complete. NRCS conservation plan on file.',
  'Previously a market garden operation for 8 years. High tunnel frames remain but plastic covering needs replacement.',
  'Row crop ground with productive Muscatine silt loam soils. Yield history available. Equipment path along east fence line.',
  null,
  null,
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[], index: number): T {
  return arr[index % arr.length]!;
}

function makeListingForOwner(uid: string, seed: number) {
  const loc = pick(IL_CITIES, seed);
  const total = 80 + (seed % 17) * 30; // 80..560 in steps of 30
  const farmable = Math.round(total * (0.6 + (seed % 5) * 0.07));

  return {
    owner_profile_id: uid,
    status: 'approved',
    property_name: pick(PROPERTY_NAMES, seed),
    city: loc.city,
    state: 'IL',
    county: loc.county,
    total_acreage: total,
    farmable_acreage: farmable,
    natural_area_acreage: total - farmable > 5 ? total - farmable : null,
    infrastructure_available: pick(INFRASTRUCTURE_OPTIONS, seed),
    crops_permitted: pick(CROP_OPTIONS, seed),
    livestock_permitted: pick(LIVESTOCK_OPTIONS, seed + 2),
    preferred_farming_methods: pick(METHOD_OPTIONS, seed + 1),
    tenure_options_offered: pick(TENURE_OPTIONS, seed),
    tenure_availability_timing: pick(AVAILABILITY, seed),
    zoning_appropriate: true,
    conservation_easement: seed % 7 === 0,
    public_access_allowed: seed % 4 === 0,
    certified_organic_or_eligible: seed % 6 === 0,
    stewardship_values: pick(STEWARDSHIP_NOTES, seed),
    property_history_notes: pick(PROPERTY_HISTORY, seed + 1),
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  // Map email → uid via auth users (profiles don't store email directly)
  const { data: authList } = await admin.auth.admin.listUsers({ perPage: 500 });
  const emailToUid: Record<string, string> = {};
  for (const u of authList?.users ?? []) {
    if (u.email) emailToUid[u.email] = u.id;
  }

  // Fetch existing listings to support idempotency
  const { data: existingListings } = await admin
    .from('listings')
    .select('owner_profile_id, property_name');

  const existingKey = new Set(
    (existingListings ?? []).map(l => `${l.owner_profile_id}:${l.property_name}`)
  );

  let created = 0;
  let skipped = 0;

  // Named landowner — 2 rich listings
  const namedEmail = 'landowner-approved@farmlinker.dev';
  const namedUid = emailToUid[namedEmail];
  if (namedUid) {
    for (let i = 0; i < 2; i++) {
      const listing = makeListingForOwner(namedUid, i);
      const key = `${namedUid}:${listing.property_name}`;
      if (existingKey.has(key)) {
        console.log(`  skip  "${listing.property_name}" (${namedEmail})`);
        skipped++;
        continue;
      }
      const { error } = await admin.from('listings').insert(listing);
      if (error) { console.error(`  ERROR:`, error.message); continue; }
      console.log(`created  "${listing.property_name}" → ${namedEmail}`);
      created++;
    }
  }

  // Bulk landowners (seed-landowner-6 through seed-landowner-25 = approved ones)
  for (let i = 6; i <= 25; i++) {
    const email = `seed-landowner-${i}@farmlinker.dev`;
    const uid = emailToUid[email];
    if (!uid) {
      console.log(`  skip  ${email} (user not found — run seed:bulk first)`);
      continue;
    }

    const seed = i + 3; // offset so names differ from named landowner
    const listing = makeListingForOwner(uid, seed);
    const key = `${uid}:${listing.property_name}`;
    if (existingKey.has(key)) {
      console.log(`  skip  "${listing.property_name}" (${email})`);
      skipped++;
      continue;
    }

    const { error } = await admin.from('listings').insert(listing);
    if (error) { console.error(`  ERROR ${email}:`, error.message); continue; }
    console.log(`created  "${listing.property_name}" → ${email}`);
    created++;
  }

  console.log(`\nListings seed complete: ${created} created, ${skipped} skipped`);
}

run().catch(err => { console.error(err); process.exit(1); });
