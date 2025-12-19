import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

const validate = ({ username, email, password }) => {
  const next = {};

  if (!username) next.username = 'Name is required.';
  else if (username.length < 2) next.username = 'Name must be at least 2 characters.';

  if (!email) next.email = 'Email is required.';
  else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email.';

  if (!password) next.password = 'Password is required.';
  else if (password.length < 8) next.password = 'Password must be at least 8 characters.';

  return next;
};

export default function Register() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const errors = useMemo(() => validate({ username, email, password }), [username, email, password]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    setTouched({ username: true, email: true, password: true });
    const nextErrors = validate({ username, email, password });
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setIsLoading(true);
      const res = await api.post('/api/auth/register', { username, email, password });
      setUser(res.data?.data?.user ?? null);
      toast.success('Account created.');
      navigate('/');
    } catch (err) {
      const message = err?.message || 'Unable to create account.';
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
              <h1 className="text-2xl font-semibold text-gray-900">Create account</h1>
              <p className="mt-2 text-sm text-gray-600">Start with a clean, consistent learning workspace.</p>
            </div>

            <Card className="p-5">
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700" htmlFor="username">
                    Name
                  </label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Ada Lovelace"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                    invalid={Boolean(touched.username && errors.username)}
                  />
                  {touched.username && errors.username ? (
                    <p className="text-xs text-red-600">{errors.username}</p>
                  ) : null}
                </div>

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
                    invalid={Boolean(touched.email && errors.email)}
                  />
                  {touched.email && errors.email ? (
                    <p className="text-xs text-red-600">{errors.email}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700" htmlFor="password">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    invalid={Boolean(touched.password && errors.password)}
                  />
                  {touched.password && errors.password ? (
                    <p className="text-xs text-red-600">{errors.password}</p>
                  ) : null}
                </div>

                {formError ? (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {formError}
                  </div>
                ) : null}

                <Button className="w-full" type="submit" isLoading={isLoading}>
                  {isLoading ? 'Creating' : 'Create account'}
                </Button>

                <div className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-brand hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 rounded"
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            </Card>
          </div>
        </div>

        <div className="hidden border-l border-gray-200 bg-gray-50 lg:flex">
          <div className="flex w-full items-center justify-center px-10 py-12">
            <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-5">
              <div className="text-xs font-medium text-gray-500">Principles</div>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>Minimal surfaces. Clear states.</li>
                <li>One accent color, used intentionally.</li>
                <li>No visual noise—high signal per pixel.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
