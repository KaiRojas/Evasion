'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks';
import { loginSchema, type LoginInput } from '@/lib/validations';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/home';
  const { login, loginAsGuest } = useAuth();

  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof LoginInput]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError('');

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginInput, string>> = {};
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof LoginInput;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      await login(formData.email, formData.password);
      router.push(redirect);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Title Section */}
      <div className="flex flex-col items-center pt-6 pb-8">
        <h2 className="text-[#F5F5F4] tracking-tight text-[32px] font-bold leading-tight text-center">
          Welcome Back
        </h2>
        <p className="text-gray-400 text-base font-normal leading-normal pt-2 text-center max-w-[280px]">
          Sign in to continue your journey
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-grow">
        {serverError && (
          <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm">
            {serverError}
          </div>
        )}

        {/* Email Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[#F5F5F4] text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-[#F5F5F4] placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
          />
          {errors.email && <span className="text-[#EF4444] text-xs">{errors.email}</span>}
        </div>

        {/* Password Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[#F5F5F4] text-sm font-medium">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full h-12 px-4 pr-12 bg-white/5 border border-white/10 rounded-xl text-[#F5F5F4] placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-xl">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {errors.password && <span className="text-[#EF4444] text-xs">{errors.password}</span>}
        </div>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-600 bg-white/5 text-[#8B5CF6] focus:ring-[#8B5CF6]"
            />
            <span className="text-sm text-gray-400">Remember me</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-sm text-[#8B5CF6] hover:text-purple-400 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 mt-4 bg-[#8B5CF6] text-white rounded-full font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Sign In'
          )}
        </button>

        {/* Sign Up Link */}
        <p className="text-center mt-4 text-gray-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-[#8B5CF6] hover:text-purple-400 font-medium transition-colors"
          >
            Create one
          </Link>
        </p>
      </form>

      {/* Later link */}
      <div className="py-8 flex justify-center mt-auto">
        <button
          onClick={loginAsGuest}
          className="text-gray-500 text-sm font-medium hover:text-[#F5F5F4] transition-colors underline underline-offset-4 decoration-gray-800"
        >
          Continue as guest
        </button>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
