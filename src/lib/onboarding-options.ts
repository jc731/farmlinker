export const ILLINOIS_COUNTIES = [
  'Adams','Alexander','Bond','Boone','Brown','Bureau','Calhoun','Carroll',
  'Cass','Champaign','Christian','Clark','Clay','Clinton','Coles','Cook',
  'Crawford','Cumberland','DeKalb','DeWitt','Douglas','DuPage','Edgar',
  'Edwards','Effingham','Fayette','Ford','Franklin','Fulton','Gallatin',
  'Greene','Grundy','Hamilton','Hancock','Hardin','Henderson','Henry',
  'Iroquois','Jackson','Jasper','Jefferson','Jersey','Jo Daviess','Johnson',
  'Kane','Kankakee','Kendall','Knox','Lake','LaSalle','Lawrence','Lee',
  'Livingston','Logan','Macon','Macoupin','Madison','Marion','Marshall',
  'Mason','Massac','McDonough','McHenry','McLean','Menard','Mercer',
  'Monroe','Montgomery','Morgan','Moultrie','Ogle','Peoria','Perry',
  'Piatt','Pike','Pope','Pulaski','Putnam','Randolph','Richland',
  'Rock Island','Saline','Sangamon','Schuyler','Scott','Shelby','St. Clair',
  'Stark','Stephenson','Tazewell','Union','Vermilion','Wabash','Warren',
  'Washington','Wayne','White','Whiteside','Will','Williamson','Winnebago',
  'Woodford',
] as const;

export const FARMING_STATUS_OPTIONS = [
  'Beginning farmer (< 10 years experience)',
  'Experienced farmer (10+ years)',
  'Part-time / hobby farmer',
  'Transitioning into farming',
  'Currently farming, seeking additional land',
  'Not currently farming',
] as const;

export const ACREAGE_RANGE_OPTIONS = [
  'Under 10 acres',
  '10–50 acres',
  '50–100 acres',
  '100–250 acres',
  '250–500 acres',
  '500+ acres',
] as const;

export const TENURE_OPTIONS = [
  'Cash rent lease',
  'Crop share lease',
  'Custom farming agreement',
  'Long-term lease (5+ years)',
  'Short-term lease (1–3 years)',
  'Purchase option',
  'Flexible / open to discussion',
] as const;

export const CROP_OPTIONS = [
  'Corn',
  'Soybeans',
  'Wheat',
  'Vegetables / Market Garden',
  'Fruit / Orchard',
  'Hay / Forage',
  'Hemp / Specialty Row Crops',
  'Flowers / Cut Flowers',
  'Herbs',
  'Other',
] as const;

export const LIVESTOCK_OPTIONS = [
  'Beef cattle',
  'Dairy cattle',
  'Hogs / Pigs',
  'Sheep',
  'Goats',
  'Poultry (chickens, turkeys, ducks)',
  'Horses',
  'Bees / Apiculture',
  'None',
  'Other',
] as const;

export const FARMING_METHOD_OPTIONS = [
  'Conventional',
  'Certified Organic',
  'Transitioning to Organic',
  'Regenerative',
  'No-till / Conservation till',
  'Integrated Pest Management (IPM)',
  'Permaculture',
  'Biodynamic',
  'Other',
] as const;

export const INFRASTRUCTURE_OPTIONS = [
  'Grain bins / storage',
  'Irrigation system',
  'Barn / livestock housing',
  'Equipment storage / machine shed',
  'Cold storage / cooler',
  'Processing / wash facility',
  'Fencing',
  'Water access (well, pond, irrigation)',
  'Electric hookup',
  'Farmhouse / housing',
  'None required',
] as const;

export const EXPERIENCE_OPTIONS = [
  'Family farming background',
  'Agricultural degree or certificate',
  'Farm internship or apprenticeship',
  'Beginning farmer training program',
  'USDA / Extension program',
  'Business or financial management training',
  'Self-taught',
  'Other',
] as const;

export const BUSINESS_PLAN_OPTIONS = [
  'Not started',
  'In progress',
  'Complete',
  'Seeking assistance',
] as const;

export const REFERRAL_OPTIONS = [
  'Word of mouth / friend or family',
  'Internet search',
  'Social media',
  'Extension office',
  'Farming organization or association',
  'Event or conference',
  'Other',
] as const;

export const GENDER_OPTIONS = ['Man','Woman','Non-binary','Prefer to self-describe','Prefer not to say'] as const;
export const AGE_RANGE_OPTIONS = ['Under 25','25–34','35–44','45–54','55–64','65+','Prefer not to say'] as const;
export const VETERAN_OPTIONS = ['Yes','No','Prefer not to say'] as const;
export const RACE_OPTIONS = [
  'American Indian or Alaska Native',
  'Asian',
  'Black or African American',
  'Native Hawaiian or Other Pacific Islander',
  'White',
  'Other',
  'Prefer not to say',
] as const;
export const ETHNICITY_OPTIONS = ['Hispanic or Latino','Not Hispanic or Latino','Prefer not to say'] as const;
export const DISABILITY_OPTIONS = ['Yes','No','Prefer not to say'] as const;
