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

const PASS = 'devpass123';

// ── Data pools ──────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Alice','Beth','Carlos','Diana','Evan','Fiona','Greg','Helen',
  'Ivan','Julia','Kevin','Laura','Marcus','Nina','Oscar','Paula',
  'Quinn','Rachel','Sam','Tina','Ulric','Vera','Wade','Yvonne',
  'Zachary','Amber','Brandon','Chloe','Derek','Elena',
];

const LAST_NAMES = [
  'Anderson','Brown','Clark','Davis','Evans','Foster','Green',
  'Harris','Irving','Jones','King','Lewis','Moore','Nelson','Owen',
  'Parker','Reed','Scott','Taylor','Underwood','Vance','Walker',
  'Young','Zimmerman','Burke','Crawford','Fletcher','Hammond','Ingram','Jensen',
];

const IL_CITIES = [
  { city: 'Springfield',  zip: '62701' },
  { city: 'Bloomington',  zip: '61701' },
  { city: 'Peoria',       zip: '61602' },
  { city: 'Champaign',    zip: '61820' },
  { city: 'Decatur',      zip: '62521' },
  { city: 'Rockford',     zip: '61101' },
  { city: 'Galesburg',    zip: '61401' },
  { city: 'Macomb',       zip: '61455' },
  { city: 'Jacksonville', zip: '62650' },
  { city: 'Quincy',       zip: '62301' },
  { city: 'Mt. Vernon',   zip: '62864' },
  { city: 'Centralia',    zip: '62801' },
  { city: 'Carbondale',   zip: '62901' },
  { city: 'Alton',        zip: '62002' },
  { city: 'Effingham',    zip: '62401' },
  { city: 'Pontiac',      zip: '61764' },
  { city: 'Kankakee',     zip: '60901' },
  { city: 'Olney',        zip: '62450' },
  { city: 'Paris',        zip: '61944' },
  { city: 'Monmouth',     zip: '61462' },
];

const COUNTIES = [
  'Adams','Bond','Bureau','Calhoun','Carroll','Champaign','Christian',
  'Clark','Clinton','Coles','Crawford','DeKalb','Douglas','Edgar',
  'Effingham','Ford','Franklin','Fulton','Grundy','Hamilton','Hancock',
  'Henderson','Henry','Iroquois','Jackson','Jasper','Jefferson','Jo Daviess',
  'Kane','Kankakee','Knox','LaSalle','Lawrence','Lee','Livingston',
  'Logan','Macon','Macoupin','Madison','Marion','Mason','McDonough',
  'McLean','Menard','Mercer','Monroe','Montgomery','Morgan','Moultrie',
  'Ogle','Peoria','Perry','Piatt','Pike','Randolph','Richland',
  'Rock Island','Saline','Sangamon','Schuyler','Scott','Shelby','St. Clair',
  'Stark','Stephenson','Tazewell','Union','Vermilion','Wabash','Warren',
  'Wayne','White','Will','Williamson','Winnebago','Woodford',
];

const FARMING_STATUSES = [
  'Beginning farmer (< 10 years experience)',
  'Experienced farmer (10+ years)',
  'Part-time / hobby farmer',
  'Transitioning into farming',
  'Currently farming, seeking additional land',
];

const ACREAGE_RANGES = [
  'Under 10 acres','10–50 acres','50–100 acres',
  '100–250 acres','250–500 acres','500+ acres',
];

const TENURE_OPTIONS = [
  'Cash rent lease','Crop share lease','Long-term lease (5+ years)',
  'Short-term lease (1–3 years)','Flexible / open to discussion',
];

const CROP_OPTIONS = [
  'Corn','Soybeans','Wheat','Vegetables / Market Garden',
  'Fruit / Orchard','Hay / Forage','Flowers / Cut Flowers','Herbs',
];

const LIVESTOCK_OPTIONS = [
  'Beef cattle','Hogs / Pigs','Sheep','Goats',
  'Poultry (chickens, turkeys, ducks)','Bees / Apiculture','None',
];

const METHOD_OPTIONS = [
  'Conventional','Certified Organic','Transitioning to Organic',
  'Regenerative','No-till / Conservation till',
  'Integrated Pest Management (IPM)',
];

const INFRA_OPTIONS = [
  'Grain bins / storage','Irrigation system','Barn / livestock housing',
  'Equipment storage / machine shed','Cold storage / cooler',
  'Fencing','Water access (well, pond, irrigation)','None required',
];

const EXPERIENCE_OPTIONS = [
  'Family farming background','Agricultural degree or certificate',
  'Farm internship or apprenticeship','Beginning farmer training program',
  'USDA / Extension program','Self-taught',
];

const BUSINESS_PLAN_OPTIONS = ['Not started','In progress','Complete','Seeking assistance'];
const REFERRAL_OPTIONS = [
  'Word of mouth / friend or family','Internet search','Social media',
  'Extension office','Farming organization or association','Event or conference',
];

const GENDER_OPTIONS = ['Man','Woman','Non-binary','Prefer not to say'];
const AGE_RANGE_OPTIONS = ['Under 25','25–34','35–44','45–54','55–64','65+','Prefer not to say'];
const VETERAN_OPTIONS = ['Yes','No','Prefer not to say'];
const RACE_OPTIONS = ['White','Black or African American','Asian','American Indian or Alaska Native','Other','Prefer not to say'];
const ETHNICITY_OPTIONS = ['Hispanic or Latino','Not Hispanic or Latino','Prefer not to say'];
const DISABILITY_OPTIONS = ['Yes','No','Prefer not to say'];

const FARMER_GOALS = [
  'Looking to establish a sustainable vegetable operation serving local markets and restaurants.',
  'Want to expand grain acreage and add on-farm storage to reduce elevator dependence.',
  'Transitioning existing conventional operation to certified organic over the next three years.',
  'Building a diversified livestock and row crop operation with direct-to-consumer sales.',
  'Seeking land to start a small family farm growing specialty crops and raising heritage chickens.',
  'Plan to grow hay and pasture for a beef cattle herd, starting with 20–30 head.',
  'Want to establish a community-supported agriculture program serving 100+ households.',
  'Growing specialty herbs and cut flowers for farmers markets and florists across central IL.',
  'Looking for additional acreage to expand existing corn/soybean operation.',
  'New beginning farmer seeking farmland to start a market garden with season extension.',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function pickN<T>(arr: readonly T[] | T[], min: number, max: number): T[] {
  const count = min + Math.floor(Math.random() * (max - min + 1));
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
}

function nameFor(n: number, pool: string[]): string {
  return pool[n % pool.length]!;
}

function makeFarmerProfile(uid: string) {
  return {
    profile_id: uid,
    farming_status: pick(FARMING_STATUSES),
    farming_plans_and_goals: pick(FARMER_GOALS),
    counties: pickN(COUNTIES, 1, 3),
    farmable_acreage_range: pick(ACREAGE_RANGES),
    tenure_options_desired: pickN(TENURE_OPTIONS, 1, 2),
    crops: pickN(CROP_OPTIONS, 1, 3),
    livestock: pickN(LIVESTOCK_OPTIONS, 1, 2),
    farming_methods: pickN(METHOD_OPTIONS, 1, 2),
    infrastructure_needed: pickN(INFRA_OPTIONS, 1, 3),
    business_plan_status: pick(BUSINESS_PLAN_OPTIONS),
    experience_education: pickN(EXPERIENCE_OPTIONS, 1, 2),
    referral_source: pick(REFERRAL_OPTIONS),
  };
}

function makeDemographics(uid: string) {
  return {
    profile_id: uid,
    gender: pick(GENDER_OPTIONS),
    age_range: pick(AGE_RANGE_OPTIONS),
    veteran_status: pick(VETERAN_OPTIONS),
    race: [pick(RACE_OPTIONS)],
    ethnicity: pick(ETHNICITY_OPTIONS),
    disability_status: pick(DISABILITY_OPTIONS),
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  // Fetch existing users for idempotency check
  const { data: listData } = await admin.auth.admin.listUsers({ perPage: 500 });
  const existingEmails = new Set((listData?.users ?? []).map(u => u.email));

  let created = 0;
  let skipped = 0;

  // 25 farmers: indices 1–5 pending, 6–25 approved
  for (let i = 1; i <= 25; i++) {
    const email = `seed-farmer-${i}@farmlinker.dev`;
    const status = i <= 5 ? 'pending' : 'approved';
    const firstName = nameFor(i - 1, FIRST_NAMES);
    const lastName = nameFor((i - 1) * 3, LAST_NAMES);
    const loc = IL_CITIES[(i - 1) % IL_CITIES.length]!;

    if (existingEmails.has(email)) {
      console.log(`  skip  ${email}`);
      skipped++;
      continue;
    }

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: PASS,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        roles: ['farmer'],
        terms_accepted: true,
      },
    });

    if (error || !data.user) {
      console.error(`  ERROR ${email}:`, error?.message);
      continue;
    }

    const uid = data.user.id;

    await admin.from('profiles').update({
      city: loc.city, state: 'IL', zip: loc.zip, status,
    }).eq('id', uid);

    await admin.from('farmer_profiles').upsert(makeFarmerProfile(uid));

    if (Math.random() < 0.6) {
      await admin.from('farmer_demographics').upsert(makeDemographics(uid));
    }

    console.log(`created  ${email}  [farmer] ${status}`);
    created++;
  }

  // 25 landowners: indices 1–5 pending, 6–25 approved
  for (let i = 1; i <= 25; i++) {
    const email = `seed-landowner-${i}@farmlinker.dev`;
    const status = i <= 5 ? 'pending' : 'approved';
    const firstName = nameFor(i + 10, FIRST_NAMES);
    const lastName = nameFor((i + 5) * 2, LAST_NAMES);
    const loc = IL_CITIES[(i + 9) % IL_CITIES.length]!;

    if (existingEmails.has(email)) {
      console.log(`  skip  ${email}`);
      skipped++;
      continue;
    }

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: PASS,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        roles: ['landowner'],
        terms_accepted: true,
      },
    });

    if (error || !data.user) {
      console.error(`  ERROR ${email}:`, error?.message);
      continue;
    }

    const uid = data.user.id;

    await admin.from('profiles').update({
      city: loc.city, state: 'IL', zip: loc.zip, status,
    }).eq('id', uid);

    await admin.from('landowner_profiles').upsert({
      profile_id: uid,
      referral_source: pick(REFERRAL_OPTIONS),
    });

    if (Math.random() < 0.6) {
      await admin.from('landowner_demographics').upsert(makeDemographics(uid));
    }

    console.log(`created  ${email}  [landowner] ${status}`);
    created++;
  }

  console.log(`\nBulk seed complete: ${created} created, ${skipped} skipped`);
  console.log('  Distribution: 25 farmers (5 pending, 20 approved) + 25 landowners (5 pending, 20 approved)');
  console.log('  Password for all: devpass123');
}

run().catch(err => { console.error(err); process.exit(1); });
