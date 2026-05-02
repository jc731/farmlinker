import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MultiCheckbox } from '@/components/onboarding/MultiCheckbox';
import { StepShell } from '@/components/onboarding/StepShell';
import {
  ILLINOIS_COUNTIES, INFRASTRUCTURE_OPTIONS, CROP_OPTIONS, LIVESTOCK_OPTIONS,
  FARMING_METHOD_OPTIONS, TENURE_OPTIONS,
} from '@/lib/onboarding-options';

const TOTAL_STEPS = 3;

type ListingRow = {
  id?: string;
  property_name?: string | null;
  county?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  street_address?: string | null;
  total_acreage?: number | null;
  farmable_acreage?: number | null;
  natural_area_acreage?: number | null;
  infrastructure_available?: string[];
  infrastructure_notes?: string | null;
  crops_permitted?: string[];
  livestock_permitted?: string[];
  crops_livestock_notes?: string | null;
  preferred_farming_methods?: string[];
  certified_organic_or_eligible?: boolean | null;
  tenure_options_offered?: string[];
  tenure_availability_timing?: string | null;
  tenure_notes?: string | null;
  stewardship_values?: string | null;
  property_history_notes?: string | null;
  zoning_appropriate?: boolean | null;
  conservation_easement?: boolean | null;
  public_access_allowed?: boolean | null;
};

function Input({ id, value, onChange, type = 'text', placeholder, required }: {
  id: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <input
      id={id} type={type} value={value} required={required} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
    />
  );
}

function NativeSelect({ id, value, onChange, options, placeholder }: {
  id: string; value: string; onChange: (v: string) => void;
  options: readonly string[] | string[]; placeholder?: string;
}) {
  return (
    <select
      id={id} value={value} onChange={e => onChange(e.target.value)}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Textarea({ id, value, onChange, placeholder, rows = 3 }: {
  id: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      id={id} value={value} rows={rows} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
    />
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

function TriSelect({ id, value, onChange, label }: {
  id: string; value: boolean | null; onChange: (v: boolean | null) => void; label: string;
}) {
  const strVal = value === true ? 'yes' : value === false ? 'no' : '';
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id} value={strVal}
        onChange={e => onChange(e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">Unknown / not sure</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    </div>
  );
}

export function ListingForm({ listing }: { listing?: ListingRow }) {
  const isEdit = !!listing?.id;
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1 — Property details
  const [propertyName, setPropertyName]           = useState(listing?.property_name ?? '');
  const [county, setCounty]                       = useState(listing?.county ?? '');
  const [city, setCity]                           = useState(listing?.city ?? '');
  const [stateField, setStateField]               = useState(listing?.state ?? 'IL');
  const [zip, setZip]                             = useState(listing?.zip ?? '');
  const [streetAddress, setStreetAddress]         = useState(listing?.street_address ?? '');
  const [totalAcreage, setTotalAcreage]           = useState(listing?.total_acreage?.toString() ?? '');
  const [farmableAcreage, setFarmableAcreage]     = useState(listing?.farmable_acreage?.toString() ?? '');
  const [naturalAreaAcreage, setNaturalAreaAcreage] = useState(listing?.natural_area_acreage?.toString() ?? '');

  // Step 2 — Land use
  const [infrastructure, setInfrastructure]       = useState<string[]>(listing?.infrastructure_available ?? []);
  const [infraNotes, setInfraNotes]               = useState(listing?.infrastructure_notes ?? '');
  const [crops, setCrops]                         = useState<string[]>(listing?.crops_permitted ?? []);
  const [livestock, setLivestock]                 = useState<string[]>(listing?.livestock_permitted ?? []);
  const [cropsNotes, setCropsNotes]               = useState(listing?.crops_livestock_notes ?? '');
  const [methods, setMethods]                     = useState<string[]>(listing?.preferred_farming_methods ?? []);
  const [organic, setOrganic]                     = useState(listing?.certified_organic_or_eligible ?? false);

  // Step 3 — Lease terms & values
  const [tenure, setTenure]                       = useState<string[]>(listing?.tenure_options_offered ?? []);
  const [tenureTiming, setTenureTiming]           = useState(listing?.tenure_availability_timing ?? '');
  const [tenureNotes, setTenureNotes]             = useState(listing?.tenure_notes ?? '');
  const [stewardship, setStewardship]             = useState(listing?.stewardship_values ?? '');
  const [historyNotes, setHistoryNotes]           = useState(listing?.property_history_notes ?? '');
  const [zoning, setZoning]                       = useState<boolean | null>(listing?.zoning_appropriate ?? null);
  const [easement, setEasement]                   = useState<boolean | null>(listing?.conservation_easement ?? null);
  const [publicAccess, setPublicAccess]           = useState<boolean | null>(listing?.public_access_allowed ?? null);

  const buildPayload = () => ({
    property_name:                propertyName || null,
    county:                       county || null,
    city:                         city || null,
    state:                        stateField || 'IL',
    zip:                          zip || null,
    street_address:               streetAddress || null,
    total_acreage:                totalAcreage ? parseFloat(totalAcreage) : null,
    farmable_acreage:             farmableAcreage ? parseFloat(farmableAcreage) : null,
    natural_area_acreage:         naturalAreaAcreage ? parseFloat(naturalAreaAcreage) : null,
    infrastructure_available:     infrastructure,
    infrastructure_notes:         infraNotes || null,
    crops_permitted:              crops,
    livestock_permitted:          livestock,
    crops_livestock_notes:        cropsNotes || null,
    preferred_farming_methods:    methods,
    certified_organic_or_eligible: organic,
    tenure_options_offered:       tenure,
    tenure_availability_timing:   tenureTiming || null,
    tenure_notes:                 tenureNotes || null,
    stewardship_values:           stewardship || null,
    property_history_notes:       historyNotes || null,
    zoning_appropriate:           zoning,
    conservation_easement:        easement,
    public_access_allowed:        publicAccess,
  });

  const handleSubmit = async () => {
    if (tenure.length === 0) {
      setError('Please select at least one tenure option.');
      return;
    }
    setLoading(true);
    setError(null);

    const payload = buildPayload();
    const url     = isEdit ? `/api/listings/${listing!.id}` : '/api/listings';
    const method  = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (!res.ok || json.error) {
      setError(json.error ?? 'Something went wrong.');
      setLoading(false);
      return;
    }

    const id = isEdit ? listing!.id : json.id;
    window.location.href = `/app/listings/${id}`;
  };

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
          title="Property details"
          description="Basic information about the land you're offering."
          onNext={() => setStep(2)}
        >
          <FieldGroup label="Property name" hint="A short name or identifier for this listing">
            <Input id="propertyName" value={propertyName} onChange={setPropertyName}
              placeholder="e.g. Maple Creek Farm — North Fields" />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="County">
              <NativeSelect id="county" value={county} onChange={setCounty}
                options={ILLINOIS_COUNTIES} placeholder="Select county…" />
            </FieldGroup>
            <FieldGroup label="City">
              <Input id="city" value={city} onChange={setCity} placeholder="City" />
            </FieldGroup>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FieldGroup label="State">
              <Input id="state" value={stateField} onChange={setStateField} placeholder="IL" />
            </FieldGroup>
            <FieldGroup label="Zip">
              <Input id="zip" value={zip} onChange={setZip} placeholder="62701" />
            </FieldGroup>
          </div>
          <FieldGroup label="Street address" hint="Optional — not shown publicly until inquiry is made">
            <Input id="address" value={streetAddress} onChange={setStreetAddress}
              placeholder="123 Farm Road" />
          </FieldGroup>
          <div className="grid grid-cols-3 gap-4">
            <FieldGroup label="Total acreage">
              <Input id="totalAcreage" type="number" value={totalAcreage} onChange={setTotalAcreage}
                placeholder="0" />
            </FieldGroup>
            <FieldGroup label="Farmable acreage">
              <Input id="farmableAcreage" type="number" value={farmableAcreage} onChange={setFarmableAcreage}
                placeholder="0" />
            </FieldGroup>
            <FieldGroup label="Natural area" hint="Woodland, wetland, etc.">
              <Input id="naturalAcreage" type="number" value={naturalAreaAcreage} onChange={setNaturalAreaAcreage}
                placeholder="0" />
            </FieldGroup>
          </div>
        </StepShell>
      )}

      {step === 2 && (
        <StepShell
          step={2} totalSteps={TOTAL_STEPS}
          title="Land use"
          description="What's available and what you'll allow on the property."
          onBack={() => setStep(1)} onNext={() => setStep(3)}
        >
          <FieldGroup label="Infrastructure available" hint="Check all that apply">
            <MultiCheckbox options={INFRASTRUCTURE_OPTIONS} value={infrastructure}
              onChange={setInfrastructure} columns={2} />
          </FieldGroup>
          <FieldGroup label="Infrastructure notes" hint="Optional">
            <Textarea id="infraNotes" value={infraNotes} onChange={setInfraNotes}
              placeholder="Condition, age, capacity details…" />
          </FieldGroup>
          <FieldGroup label="Crops permitted" hint="Check all you'd allow">
            <MultiCheckbox options={CROP_OPTIONS} value={crops} onChange={setCrops} />
          </FieldGroup>
          <FieldGroup label="Livestock permitted" hint="Check all you'd allow">
            <MultiCheckbox options={LIVESTOCK_OPTIONS} value={livestock} onChange={setLivestock} />
          </FieldGroup>
          <FieldGroup label="Crops / livestock notes" hint="Optional">
            <Textarea id="cropsNotes" value={cropsNotes} onChange={setCropsNotes}
              placeholder="Restrictions, conditions, preferences…" />
          </FieldGroup>
          <FieldGroup label="Preferred farming methods" hint="Check all you'd welcome">
            <MultiCheckbox options={FARMING_METHOD_OPTIONS} value={methods} onChange={setMethods} />
          </FieldGroup>
          <div className="flex items-center gap-3">
            <input
              type="checkbox" id="organic" checked={organic}
              onChange={e => setOrganic(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <label htmlFor="organic" className="text-sm">
              Property is certified organic or eligible for certification
            </label>
          </div>
        </StepShell>
      )}

      {step === 3 && (
        <StepShell
          step={3} totalSteps={TOTAL_STEPS}
          title="Lease terms & values"
          description="What you're looking for in a tenant and how you'd like to work together."
          onBack={() => setStep(2)}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Save changes' : 'Save listing'}
          loading={loading}
        >
          <FieldGroup label="Tenure arrangements offered" hint="Check all you'd consider — required">
            <MultiCheckbox options={TENURE_OPTIONS} value={tenure} onChange={setTenure} columns={1} />
          </FieldGroup>
          <FieldGroup label="Availability timing" hint="When is the land available?">
            <Input id="timing" value={tenureTiming} onChange={setTenureTiming}
              placeholder="e.g. Available immediately, Spring 2027…" />
          </FieldGroup>
          <FieldGroup label="Lease notes" hint="Optional">
            <Textarea id="tenureNotes" value={tenureNotes} onChange={setTenureNotes}
              placeholder="Preferred lease length, flexibility, any conditions…" />
          </FieldGroup>
          <FieldGroup label="Stewardship values" hint="What matters most to you in a tenant?">
            <Textarea id="stewardship" value={stewardship} onChange={setStewardship}
              placeholder="Land care philosophy, conservation priorities, relationship expectations…"
              rows={4} />
          </FieldGroup>
          <FieldGroup label="Property history" hint="Optional — helps farmers understand the land">
            <Textarea id="history" value={historyNotes} onChange={setHistoryNotes}
              placeholder="Previous crops, soil work, drainage, any known issues…" rows={3} />
          </FieldGroup>
          <div className="grid gap-4 sm:grid-cols-3">
            <TriSelect id="zoning" value={zoning} onChange={setZoning}
              label="Zoning appropriate for farming?" />
            <TriSelect id="easement" value={easement} onChange={setEasement}
              label="Conservation easement in place?" />
            <TriSelect id="publicAccess" value={publicAccess} onChange={setPublicAccess}
              label="Public access allowed?" />
          </div>
        </StepShell>
      )}
    </div>
  );
}
