import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { authService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cls } from '../utils/helpers';

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/my-reports';

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!isLogin && form.name.trim().length < 2) next.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.(edu|ac\.in|in|com)$/.test(form.email) && !/^[^\s@]+@[^\s@]+$/.test(form.email))
      next.email = 'Please enter a valid email address.';
    if (form.password.length < 6) next.password = 'Password must be at least 6 characters.';
    if (!isLogin && form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isLogin) {
        const { user } = await authService.login(form);
        login(user);
        toast('Welcome back to FINDIT!', 'success');
        navigate(from, { replace: true });
      } else {
        const { user } = await authService.register(form);
        login(user);
        toast('Your FINDIT account is ready!', 'success');
        navigate('/my-reports', { replace: true });
      }
    } catch (err) {
      toast(err.message || 'Something went wrong. Please try again.', 'error', 'Unable to continue');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (err) => cls('input !py-3 pl-11 pr-11', err && 'input-error');

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-lavender-50 px-4 py-14">
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-96 w-96 rounded-full bg-primary-soft/70 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 left-[-10%] h-96 w-96 rounded-full bg-lavender-100 blur-3xl" aria-hidden="true" />

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="lg" />
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {isLogin
              ? 'Log in to manage your reports and claims.'
              : 'Join FINDIT and never lose sight of your belongings.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="card space-y-4 p-6 sm:p-8">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="input-label">Full name</label>
              <div className="relative">
                <User size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
                <input
                  id="name"
                  className={inputCls(errors.name)}
                  placeholder="e.g. Aarav Mehta"
                  value={form.name}
                  onChange={set('name')}
                  autoComplete="name"
                />
              </div>
              {errors.name && <p className="mt-1.5 text-xs font-medium text-error">{errors.name}</p>}
            </div>
          )}

          <div>
            <label htmlFor="email" className="input-label">
              {isLogin ? 'Email' : 'College email'}
            </label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
              <input
                id="email"
                type="email"
                className={inputCls(errors.email)}
                placeholder="you@college.edu"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="mt-1.5 text-xs font-medium text-error">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="input-label">Password</label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={inputCls(errors.password)}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-ink-soft transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs font-medium text-error">{errors.password}</p>}
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirm" className="input-label">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
                <input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className={inputCls(errors.confirmPassword)}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-ink-soft transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs font-medium text-error">{errors.confirmPassword}</p>}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {isLogin ? 'Login' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary-dark hover:underline">
                Create one
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-dark hover:underline">
                Login
              </Link>
            </>
          )}
        </p>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-ink-soft">
          <ShieldCheck size={13} className="text-primary" aria-hidden="true" />
          Your account is securely stored in FINDIT's database.
        </p>
      </div>
    </div>
  );
}
