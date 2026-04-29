import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MultiCheckbox } from './MultiCheckbox';
import { StepShell } from './StepShell';
import {
  ILLINOIS_COUNTIES, FARMING_STATUS_OPTIONS, ACREAGE_RANGE_OPTIONS,
  TENURE_OPTIONS, CROP_OPTIONS, LIVESTOCK_OPTIONS, FARMING_METHOD_OPTIONS,
  INFRASTRUCTURE_OPTIONS, EXPERIENCE_OPTIONS, BUSINESS_PLAN_OPTIONS,
  REFERRAL_OPTIONS, GENDER_OPTIONS, AGE_RANGE_OPTIONS, VETERAN_OPTIONS,
  RACE_OPTIONS, ETHNICITY_OPTIONS, DISABILITY_OPTIONS,
} from '@/lib/onboarding-options';

const TOTAL_STEPS = 5;

function NativeSelect({ id, value, onChange, options, placeholder }: {
  id: string; value: string; onChange: (v: string) => void;
  options: readonly string[]; placeholder?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

export function FarmerProfileForm() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Step 1 — Farming background
  const [farmingStatus, setFarmingStatus] = useState('');
  const [farmingStatusNotes, setFarmingStatusNotes] = useState('');
  const [farmingPlansAndGoals, setFarmingPlansAndGoals] = useState('');
  const [experienceEducation, setExperienceEducation] = useState<string[]>([]);
  const [experienceNotes, setExperienceNotes] = useState('');

  // Step 2 — Location & land
  const [counties, setCounties] = useState<string[]>([]);
  const [farmableAcreageRange, setFarmableAcreageRange] = useState('');
  const [tenureOptionsDesired, setTenureOptionsDesired] = useState<string[]>([]);
  const [tenureNotes, setTenureNotes] = useState('');

  // Step 3 — What you'll grow
  const [crops, setCrops] = useState<string[]>([]);
  const [livestock, setLivestock] = useState<string[]>([]);
  const [cropsLivestockNotes, setCropsLivestockNotes] = useState('');
  const [farmingMethods, setFarmingMethods] = useState<string[]>([]);
  const [farmingMethodsNotes, setFarmingMethodsNotes] = useState('');
  const [infrastructureNeeded, setInfrastructureNeeded] = useState<string[]>([]);
  const [infrastructureNotes, setInfrastructureNotes] = useState('');

  // Step 4 — Business
  const [businessPlanStatus, setBusinessPlanStatus] = useState('');
  const [businessPlanSummary, setBusinessPlanSummary] = useState('');
  const [referralSource, setReferralSource] = useState('');

  // Step 5 — Demographics (optional)
  const [gender, setGender] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [veteranStatus, setVeteranStatus] = useState('');
  const [race, setRace] = useState<string[]>([]);
  const [ethnicity, setEthnicity] = useState('');
  const [disabilityStatus, setDisabilityStatus] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be signed in to save your profile.');
      setLoading(false);
      return;
    }

    const profilePayload = {
      profile_id: user.id,
      farming_status: farmingStatus,
      farming_status_notes: farmingStatusNotes || null,
      farming_plans_and_goals: farmingPlansAndGoals || null,
      experience_education: experienceEducation,
      experience_notes: experienceNotes || null,
      counties,
      farmable_acreage_range: farmableAcreageRange || null,
      tenure_options_desired: tenureOptionsDesired,
      tenure_notes: tenureNotes || null,
      crops,
      livestock,
      crops_livestock_notes: cropsLivestockNotes || null,
      farming_methods: farmingMethods,
      farming_methods_notes: farmingMethodsNotes || null,
      infrastructure_needed: infrastructureNeeded,
      infrastructure_notes: infrastructureNotes || null,
      business_plan_status: businessPlanStatus || null,
      business_plan_summary: businessPlanSummary || null,
      referral_source: referralSource || null,
    };

    const { error: profileError } = await supabase
      .from('farmer_profiles')
      .upsert(profilePayload);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    // Save demographics separately (write-only, non-blocking)
    if (gender || ageRange || veteranStatus || race.length || ethnicity || disabilityStatus) {
      await supabase.from('farmer_demographics').upsert({
        profile_id: user.id,
        gender: gender || null,
        age_range: ageRange || null,
        veteran_status: veteranStatus || null,
        race,
        ethnicity: ethnicity || null,
        disability_status: disabilityStatus || null,
      });
    }

    setLoading(false);
    setDone(true);
    setTimeout(() => { window.location.href = '/app'; }, 1500);
  };

  if (done) {
    return (
      <Alert>
        <AlertDescription>
          Profile saved! You'll be notified once it's reviewed. Redirecting to dashboard…
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 1 && (
        <StepShell
          step={1} totalSteps={TOTAL_STEPS}
          title="Your farming background"
          description="Tell us about where you are in your farming journey."
          onNext={() => setStep(2)}
        >
          <FieldGroup label="Farming status">
            <NativeSelect id="farmingStatus" value={farmingStatus} onChange={setFarmingStatus}
              options={FARMING_STATUS_OPTIONS} placeholder="Select one…" />
          </FieldGroup>
          <FieldGroup label="Anything to add about your status?" hint="Optional">
            <Textarea value={farmingStatusNotes} onChange={e => setFarmingStatusNotes(e.target.value)}
              placeholder="E.g. I've been farming part-time for 3 years and want to go full-time…" rows={3} />
          </FieldGroup>
          <FieldGroup label="Farming plans and goals"
            hint="What do you hope to accomplish? What kind of operation do you envision?">
            <Textarea value={farmingPlansAndGoals} onChange={e => setFarmingPlansAndGoals(e.target.value)}
              placeholder="Describe your vision…" rows={4} />
          </FieldGroup>
          <FieldGroup label="Experience and education" hint="Check all that apply">
            <MultiCheckbox options={EXPERIENCE_OPTIONS} value={experienceEducation}
              onChange={setExperienceEducation} />
          </FieldGroup>
          <FieldGroup label="Additional experience notes" hint="Optional">
            <Textarea value={experienceNotes} onChange={e => setExperienceNotes(e.target.value)}
              placeholder="Certifications, relevant history…" rows={2} />
          </FieldGroup>
        </StepShell>
      )}

      {step === 2 && (
        <StepShell
          step={2} totalSteps={TOTAL_STEPS}
          title="Location and land needs"
          description="Where are you looking to farm, and how much land do you need?"
          onBack={() => setStep(1)} onNext={() => setStep(3)}
        >
          <FieldGroup label="Counties of interest"
            hint="Select all Illinois counties you'd consider. You can search.">
            <MultiCheckbox options={ILLINOIS_COUNTIES} value={counties}
              onChange={setCounties} searchable columns={3} />
          </FieldGroup>
          <FieldGroup label="Farmable acreage needed">
            <NativeSelect id="acreage" value={farmableAcreageRange} onChange={setFarmableAcreageRange}
              options={ACREAGE_RANGE_OPTIONS} placeholder="Select a range…" />
          </FieldGroup>
          <FieldGroup label="Tenure arrangements you'd consider" hint="Check all that apply">
            <MultiCheckbox options={TENURE_OPTIONS} value={tenureOptionsDesired}
              onChange={setTenureOptionsDesired} columns={1} />
          </FieldGroup>
          <FieldGroup label="Tenure notes" hint="Optional">
            <Textarea value={tenureNotes} onChange={e => setTenureNotes(e.target.value)}
              placeholder="Lease length preferences, flexibility, etc." rows={2} />
          </FieldGroup>
        </StepShell>
      )}

      {step === 3 && (
        <StepShell
          step={3} totalSteps={TOTAL_STEPS}
          title="What you'll grow"
          description="Help landowners understand your operation."
          onBack={() => setStep(2)} onNext={() => setStep(4)}
        >
          <FieldGroup label="Crops" hint="Check all you plan to grow">
            <MultiCheckbox options={CROP_OPTIONS} value={crops} onChange={setCrops} />
          </FieldGroup>
          <FieldGroup label="Livestock" hint="Check all that apply">
            <MultiCheckbox options={LIVESTOCK_OPTIONS} value={livestock} onChange={setLivestock} />
          </FieldGroup>
          <FieldGroup label="Crops / livestock notes" hint="Optional">
            <Textarea value={cropsLivestockNotes} onChange={e => setCropsLivestockNotes(e.target.value)}
              placeholder="Varieties, volume, any specifics…" rows={2} />
          </FieldGroup>
          <FieldGroup label="Farming methods" hint="Check all that apply">
            <MultiCheckbox options={FARMING_METHOD_OPTIONS} value={farmingMethods}
              onChange={setFarmingMethods} />
          </FieldGroup>
          <FieldGroup label="Farming methods notes" hint="Optional">
            <Textarea value={farmingMethodsNotes} onChange={e => setFarmingMethodsNotes(e.target.value)}
              placeholder="Certifications in progress, practices you follow…" rows={2} />
          </FieldGroup>
          <FieldGroup label="Infrastructure needed" hint="Check all that apply">
            <MultiCheckbox options={INFRASTRUCTURE_OPTIONS} value={infrastructureNeeded}
              onChange={setInfrastructureNeeded} />
          </FieldGroup>
          <FieldGroup label="Infrastructure notes" hint="Optional">
            <Textarea value={infrastructureNotes} onChange={e => setInfrastructureNotes(e.target.value)}
              placeholder="Specifics about what you need or can bring yourself…" rows={2} />
          </FieldGroup>
        </StepShell>
      )}

      {step === 4 && (
        <StepShell
          step={4} totalSteps={TOTAL_STEPS}
          title="Business planning"
          description="Where are you with your farm business plan?"
          onBack={() => setStep(3)} onNext={() => setStep(5)}
        >
          <FieldGroup label="Business plan status">
            <NativeSelect id="businessPlan" value={businessPlanStatus}
              onChange={setBusinessPlanStatus}
              options={BUSINESS_PLAN_OPTIONS} placeholder="Select one…" />
          </FieldGroup>
          <FieldGroup label="Business plan summary" hint="Optional — share as much or as little as you like">
            <Textarea value={businessPlanSummary} onChange={e => setBusinessPlanSummary(e.target.value)}
              placeholder="Brief overview of your business model, markets, financial goals…" rows={4} />
          </FieldGroup>
          <FieldGroup label="How did you hear about Farmlinker?">
            <NativeSelect id="referral" value={referralSource} onChange={setReferralSource}
              options={REFERRAL_OPTIONS} placeholder="Select one…" />
          </FieldGroup>
        </StepShell>
      )}

      {step === 5 && (
        <StepShell
          step={5} totalSteps={TOTAL_STEPS}
          title="About you (optional)"
          description="This information is used for grant reporting and program evaluation only. It is kept confidential and never shown to other users."
          onBack={() => setStep(4)}
          onSubmit={handleSubmit}
          loading={loading}
        >
          <FieldGroup label="Gender">
            <NativeSelect id="gender" value={gender} onChange={setGender}
              options={GENDER_OPTIONS} placeholder="Prefer not to say" />
          </FieldGroup>
          <FieldGroup label="Age range">
            <NativeSelect id="ageRange" value={ageRange} onChange={setAgeRange}
              options={AGE_RANGE_OPTIONS} placeholder="Prefer not to say" />
          </FieldGroup>
          <FieldGroup label="Veteran status">
            <NativeSelect id="veteran" value={veteranStatus} onChange={setVeteranStatus}
              options={VETERAN_OPTIONS} placeholder="Prefer not to say" />
          </FieldGroup>
          <FieldGroup label="Race" hint="Check all that apply">
            <MultiCheckbox options={RACE_OPTIONS} value={race} onChange={setRace} columns={1} />
          </FieldGroup>
          <FieldGroup label="Ethnicity">
            <NativeSelect id="ethnicity" value={ethnicity} onChange={setEthnicity}
              options={ETHNICITY_OPTIONS} placeholder="Prefer not to say" />
          </FieldGroup>
          <FieldGroup label="Disability status">
            <NativeSelect id="disability" value={disabilityStatus} onChange={setDisabilityStatus}
              options={DISABILITY_OPTIONS} placeholder="Prefer not to say" />
          </FieldGroup>
        </StepShell>
      )}
    </div>
  );
}
