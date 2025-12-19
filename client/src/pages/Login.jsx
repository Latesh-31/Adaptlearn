import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BookOpen, CheckCircle2, Sparkles } from 'lucide-react';

import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

const validate = ({ email, password }) => {
  const next = {};

  if (!email) next.email = 'Email is required.';
  else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email.';

  if (!password) next.password = 'Password is required.';
  else if (password.length < 8) next.password = 'Password must be at least 8 characters.';

  return next;
};

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const errors = useMemo(() => validate({ email, password }), [email, password]);
  const showEmailError = touched.email && errors.email;
  const showPasswordError = touched.password && errors.password;

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const nextTouched = { email: true, password: true };
    setTouched(nextTouched);

    const nextErrors = validate({ email, password });
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setIsLoading(true);
      const res = await api.post('/api/auth/login', { email, password });
      setUser(res.data?.data?.user ?? null);
      toast.success('Welcome back.');
      navigate('/');
    } catch (err) {
      const message = err?.message || 'Unable to sign in.';
      setFormError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="mb-2 text-xs font-medium text-gray-500">AdaptLearn AI</div>
              <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
              <p className="mt-2 text-sm text-gray-600">
                Data-dense learning workflows, built for enterprise velocity.
              </p>
            </div>

            <Card className="p-5">
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700" htmlFor="email">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    invalid={Boolean(showEmailError)}
                  />
                  {showEmailError ? (
                    <p className="text-xs text-red-600">{errors.email}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700" htmlFor="password">
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-xs font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 rounded"
                      onClick={() => toast.message('Password reset coming soon.')}
                    >
                      Forgot?
                    </button>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    invalid={Boolean(showPasswordError)}
                  />
                  {showPasswordError ? (
                    <p className="text-xs text-red-600">{errors.password}</p>
                  ) : null}
                </div>

                {formError ? (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {formError}
                  </div>
                ) : null}

                <Button className="w-full" type="submit" isLoading={isLoading}>
                  {isLoading ? 'Signing in' : 'Sign in'}
                </Button>

                <div className="text-sm text-gray-600">
                  New to AdaptLearn?{' '}
                  <Link
                    to="/register"
                    className="font-medium text-brand hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 rounded"
                  >
                    Create an account
                  </Link>
                </div>
              </form>
            </Card>

            <div className="mt-6 text-xs text-gray-500">
              By signing in, you agree to your organization's policies.
            </div>
          </div>
        </div>

        <div className="hidden border-l border-gray-200 bg-gray-50 lg:flex">
          <div className="flex w-full flex-col justify-between px-10 py-12">
            <div>
              <div className="mb-6 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white">
                  <BookOpen className="h-4 w-4 text-gray-800" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">AdaptLearn AI</div>
                  <div className="text-xs text-gray-600">Learning ops, upgraded.</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 text-brand" strokeWidth={1.5} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">AI-assisted content refinement</div>
                    <div className="text-sm text-gray-600">Turn raw material into structured lessons with fewer loops.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand" strokeWidth={1.5} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Audit-friendly progress</div>
                    <div className="text-sm text-gray-600">Designed for visibility without visual noise.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand" strokeWidth={1.5} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Enterprise-ready workflows</div>
                    <div className="text-sm text-gray-600">Predictable UI, stable states, and consistent feedback.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="text-xs font-medium text-gray-500">From the field</div>
              <div className="mt-2 text-sm text-gray-900">
                “We replaced five scattered docs and two spreadsheets with a single learning pipeline.
                The UI stays out of the way.”
              </div>
              <div className="mt-3 text-xs text-gray-600">— Enablement Lead, Mid-market SaaS</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
