import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type Role = 'farmer' | 'landowner';
type Step = 'role' | 'info';

const ROLES: { id: Role; label: string; description: string; icon: string }[] = [
  { id: 'farmer', label: 'Farmer', description: "I'm looking for land to farm", icon: '🌾' },
  { id: 'landowner', label: 'Landowner', description: "I have farmland to offer", icon: '🏡' },
];

export function SignUpForm() {
  const [step, setStep] = useState<Step>('role');
  const [selectedRoles, setSelectedRoles] = useState<Set<Role>>(new Set());
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleRole = (role: Role) => {
    setSelectedRoles(prev => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  };

  const handleRoleNext = () => {
    if (selectedRoles.size === 0) {
      setError('Please select at least one role.');
      return;
    }
    setError(null);
    setStep('info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError('You must accept the terms to continue.');
      return;
    }

    setLoading(true);
    setError(null);

    const roles = Array.from(selectedRoles);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          roles,
          first_name: firstName,
          last_name: lastName,
          terms_accepted: true,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // If session is returned, email confirmation is disabled — go straight to app
    if (data.session) {
      window.location.href = '/app';
    } else {
      window.location.href = '/auth/verify';
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 'role' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">How will you use Farmlinker?</h2>
            <p className="text-sm text-muted-foreground">You can select both if you're a farmer with land or a landowner who also farms.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map(({ id, label, description, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleRole(id)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border-2 p-5 text-center transition-colors',
                  selectedRoles.has(id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                )}
              >
                <span className="text-3xl">{icon}</span>
                <span className="font-semibold">{label}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
                <div
                  className={cn(
                    'mt-1 h-4 w-4 rounded-full border-2 transition-colors',
                    selectedRoles.has(id)
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/40'
                  )}
                />
              </button>
            ))}
          </div>
          <Button className="w-full" onClick={handleRoleNext}>
            Continue
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/auth/sign-in" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        </div>
      )}

      {step === 'info' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Create your account</h2>
            <p className="text-sm text-muted-foreground">
              Signing up as{' '}
              <span className="font-medium text-foreground">
                {Array.from(selectedRoles).join(' & ')}
              </span>
              .{' '}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setStep('role')}
              >
                Change
              </button>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                required
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                required
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 accent-primary"
              checked={termsAccepted}
              onChange={e => setTermsAccepted(e.target.checked)}
            />
            <span className="text-muted-foreground">
              I agree to the{' '}
              <a href="/terms" className="text-primary hover:underline">
                terms of service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary hover:underline">
                privacy policy
              </a>
            </span>
          </label>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      )}
    </div>
  );
}
