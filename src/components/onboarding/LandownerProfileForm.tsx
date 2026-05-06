import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MultiCheckbox } from './MultiCheckbox';
import { StepShell } from './StepShell';
import {
  REFERRAL_OPTIONS, GENDER_OPTIONS, AGE_RANGE_OPTIONS,
  VETERAN_OPTIONS, RACE_OPTIONS, ETHNICITY_OPTIONS, DISABILITY_OPTIONS,
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

export function LandownerProfileForm() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Step 1
  const [referralSource, setReferralSource] = useState('');

  // Step 2 — Demographics (optional)
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

    const { error: profileError } = await supabase
      .from('landowner_profiles')
      .upsert({ profile_id: user.id, referral_source: referralSource || null });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (gender || ageRange || veteranStatus || race.length || ethnicity || disabilityStatus) {
      await supabase.from('landowner_demographics').upsert({
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
    setTimeout(() => { window.location.href = '/app/listings/new?onboarding=1'; }, 1500);
  };

  if (done) {
    return (
      <Alert>
        <AlertDescription>
          Profile saved! Now let's add your land listing…
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
          title="Welcome, landowner"
          description="Just one quick question before we set up your land listing."
          onNext={() => setStep(2)}
        >
          <FieldGroup label="How did you hear about Farmlinker?">
            <NativeSelect id="referral" value={referralSource} onChange={setReferralSource}
              options={REFERRAL_OPTIONS} placeholder="Select one…" />
          </FieldGroup>
        </StepShell>
      )}

      {step === 2 && (
        <StepShell
          step={2} totalSteps={TOTAL_STEPS}
          title="About you (optional)"
          description="This information is used for grant reporting and program evaluation only. It is kept confidential and never shown to other users."
          onBack={() => setStep(1)}
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
