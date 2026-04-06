'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Coffee, Eye, EyeOff, Mail, Lock, User, Chrome } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'At least 8 characters required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);

    try {
      await axios.post('/api/auth/register', { name, email, password });
      // Auto sign in after registration
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) throw new Error(result.error);
      toast.success('Welcome to CafeFinder! ☕');
      router.push('/explore');
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Failed to create account'
        : 'Something went wrong';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-background">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-accent">
              <Coffee size={20} className="text-black" />
            </div>
            <span className="font-bold text-xl text-text-primary">
              Cafe<span className="text-accent">Finder</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Create your account</h1>
          <p className="text-text-secondary text-sm">Start discovering amazing cafes today</p>
        </div>

        <div className="bg-surface border border-border rounded-3xl p-8 shadow-glass">
          {/* Google signup */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/explore' })}
            className="w-full flex items-center justify-center gap-3 py-3 border border-border rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated hover:border-border-strong transition-all duration-200 mb-6"
          >
            <Chrome size={16} />
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-text-muted">
              <span className="px-2 bg-surface">or create with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              leftIcon={<User size={16} />}
              autoComplete="name"
            />
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail size={16} />}
              autoComplete="email"
            />
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              hint="Minimum 8 characters"
              leftIcon={<Lock size={16} />}
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <p className="text-xs text-text-muted">
              By signing up, you agree to our{' '}
              <Link href="#" className="text-accent hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="#" className="text-accent hover:underline">Privacy Policy</Link>.
            </p>

            <Button type="submit" variant="primary" fullWidth isLoading={isLoading} size="lg">
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:text-accent-hover transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
