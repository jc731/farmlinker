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

const NAMED_USERS = [
  {
    email: 'admin@farmlinker.dev',
    firstName: 'Bob', lastName: 'Harris',
    roles: ['admin'] as string[], status: 'approved' as const,
    city: 'Springfield', zip: '62701', phone: '217-555-0100',
  },
  {
    email: 'farmer-pending@farmlinker.dev',
    firstName: 'Emily', lastName: 'Carter',
    roles: ['farmer'] as string[], status: 'pending' as const,
    city: 'Bloomington', zip: '61701', phone: '309-555-0101',
  },
  {
    email: 'farmer-approved@farmlinker.dev',
    firstName: 'Jake', lastName: 'Wilson',
    roles: ['farmer'] as string[], status: 'approved' as const,
    city: 'Peoria', zip: '61602', phone: '309-555-0102',
  },
  {
    email: 'landowner-pending@farmlinker.dev',
    firstName: 'Sarah', lastName: 'Mitchell',
    roles: ['landowner'] as string[], status: 'pending' as const,
    city: 'Champaign', zip: '61820', phone: '217-555-0103',
  },
  {
    email: 'landowner-approved@farmlinker.dev',
    firstName: 'Tom', lastName: 'Sullivan',
    roles: ['landowner'] as string[], status: 'approved' as const,
    city: 'Decatur', zip: '62521', phone: '217-555-0104',
  },
] as const;

const FARMER_PROFILES: Record<string, object> = {
  'farmer-pending@farmlinker.dev': {
    farming_status: 'Beginning farmer (< 10 years experience)',
    farming_plans_and_goals: 'I want to grow vegetables and raise chickens on a small-scale operation in central Illinois. My goal is to build a community-supported agriculture (CSA) program within the next three years.',
    counties: ['McLean', 'Tazewell'],
    farmable_acreage_range: '10–50 acres',
    tenure_options_desired: ['Cash rent lease', 'Short-term lease (1–3 years)'],
    crops: ['Vegetables / Market Garden', 'Herbs'],
    livestock: ['Poultry (chickens, turkeys, ducks)'],
    farming_methods: ['Certified Organic', 'Regenerative'],
    infrastructure_needed: ['Cold storage / cooler', 'Water access (well, pond, irrigation)', 'Fencing'],
    business_plan_status: 'In progress',
    business_plan_summary: 'Draft plan covers startup costs, projected CSA membership revenue, and 3-year path to profitability.',
    experience_education: ['Beginning farmer training program', 'Farm internship or apprenticeship'],
    referral_source: 'Extension office',
  },
  'farmer-approved@farmlinker.dev': {
    farming_status: 'Experienced farmer (10+ years)',
    farming_plans_and_goals: 'Looking to expand corn and soybean acreage and add on-farm grain storage. Have been farming for 15 years and am ready to scale up.',
    counties: ['Peoria', 'Stark', 'Knox'],
    farmable_acreage_range: '250–500 acres',
    tenure_options_desired: ['Cash rent lease', 'Long-term lease (5+ years)'],
    crops: ['Corn', 'Soybeans'],
    livestock: ['None'],
    farming_methods: ['Conventional', 'No-till / Conservation till'],
    infrastructure_needed: ['Grain bins / storage', 'Equipment storage / machine shed'],
    business_plan_status: 'Complete',
    experience_education: ['Family farming background', 'Agricultural degree or certificate'],
    referral_source: 'Word of mouth / friend or family',
  },
};

const FARMER_DEMOGRAPHICS: Record<string, object> = {
  'farmer-pending@farmlinker.dev': {
    gender: 'Woman',
    age_range: '25–34',
    veteran_status: 'No',
    race: ['White'],
    ethnicity: 'Not Hispanic or Latino',
    disability_status: 'No',
  },
  'farmer-approved@farmlinker.dev': {
    gender: 'Man',
    age_range: '45–54',
    veteran_status: 'Yes',
    race: ['White'],
    ethnicity: 'Not Hispanic or Latino',
    disability_status: 'No',
  },
};

const LANDOWNER_DEMOGRAPHICS: Record<string, object> = {
  'landowner-approved@farmlinker.dev': {
    gender: 'Man',
    age_range: '55–64',
    veteran_status: 'No',
    race: ['White'],
    ethnicity: 'Not Hispanic or Latino',
    disability_status: 'Prefer not to say',
  },
};

async function run() {
  // Fetch existing users to support idempotency
  const { data: listData } = await admin.auth.admin.listUsers({ perPage: 200 });
  const existingEmails = new Set((listData?.users ?? []).map(u => u.email));

  for (const u of NAMED_USERS) {
    if (existingEmails.has(u.email)) {
      console.log(`  skip  ${u.email} (already exists)`);
      continue;
    }

    // 1. Create auth user — handle_new_user trigger creates the profile row
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: u.email,
      password: PASS,
      email_confirm: true,
      user_metadata: {
        first_name: u.firstName,
        last_name: u.lastName,
        roles: u.roles,
        terms_accepted: true,
      },
    });

    if (createErr || !created.user) {
      console.error(`  ERROR ${u.email}:`, createErr?.message);
      continue;
    }

    const uid = created.user.id;

    // 2. Fill in profile contact fields and correct status
    await admin.from('profiles').update({
      phone: u.phone,
      city: u.city,
      state: 'IL',
      zip: u.zip,
      status: u.status,
    }).eq('id', uid);

    // 3. Seed role-specific profile extensions
    const isFarmer = u.roles.includes('farmer');
    const isLandowner = u.roles.includes('landowner');

    if (isFarmer && FARMER_PROFILES[u.email]) {
      await admin.from('farmer_profiles').upsert({
        profile_id: uid,
        ...FARMER_PROFILES[u.email],
      });
    }

    if (isLandowner) {
      await admin.from('landowner_profiles').upsert({
        profile_id: uid,
        referral_source: 'Word of mouth / friend or family',
      });
    }

    // 4. Demographics (where defined)
    if (isFarmer && FARMER_DEMOGRAPHICS[u.email]) {
      await admin.from('farmer_demographics').upsert({
        profile_id: uid,
        ...FARMER_DEMOGRAPHICS[u.email],
      });
    }

    if (isLandowner && LANDOWNER_DEMOGRAPHICS[u.email]) {
      await admin.from('landowner_demographics').upsert({
        profile_id: uid,
        ...LANDOWNER_DEMOGRAPHICS[u.email],
      });
    }

    console.log(`created  ${u.email}  [${u.roles.join(',')}] ${u.status}`);
  }

  console.log('\nDone. Named dev accounts:');
  console.log('  Password for all: devpass123');
}

run().catch(err => { console.error(err); process.exit(1); });
