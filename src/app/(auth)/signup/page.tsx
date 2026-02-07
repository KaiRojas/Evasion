'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { signupSchema, type SignupInput } from '@/lib/validations';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [formData, setFormData] = useState<SignupInput>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    displayName: '',
    dateOfBirth: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignupInput, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof SignupInput]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError('');

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignupInput, string>> = {};
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof SignupInput;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      await signup(formData.email, formData.password, {
        username: formData.username,
        displayName: formData.displayName,
        dateOfBirth: formData.dateOfBirth,
      });
      setSuccess(true);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8">
        <div className="w-16 h-16 rounded-full bg-[#22C55E]/20 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[#22C55E] text-3xl">check</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Check your email</h2>
        <p className="text-[#A8A8A8] text-center text-sm mb-6">
          We&apos;ve sent a verification link to <strong className="text-white">{formData.email}</strong>
        </p>
        <Link
          href="/login"
          className="w-full max-w-[280px] flex items-center justify-center rounded-full h-[44px] text-[12px] font-bold tracking-[0.1em] uppercase transition-all active:scale-[0.98] border border-white/20 bg-white/5 text-white hover:bg-white/10"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Title */}
      <div className="flex flex-col items-center pb-6">
        <h2 className="text-[#F5F5F4] text-2xl font-bold text-center">Create your account</h2>
        <p className="text-gray-400 text-sm text-center mt-1">Join the automotive community</p>
      </div>

      {/* Age Warning */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 mb-6">
        <span className="material-symbols-outlined text-[#8B5CF6] text-lg">warning</span>
        <p className="text-sm text-purple-200">
          You must be <strong>16 years or older</strong> to create an Evasion account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-grow">
        {serverError && (
          <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm">
            {serverError}
          </div>
        )}

        {/* Username & Display Name */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-[#F5F5F4] text-sm font-medium">Username</label>
            <input
              type="text"
              name="username"
              placeholder="gearhead42"
              value={formData.username}
              onChange={handleChange}
              className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-[#F5F5F4] placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all text-sm"
            />
            {errors.username && <span className="text-[#EF4444] text-xs">{errors.username}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#F5F5F4] text-sm font-medium">Display Name</label>
            <input
              type="text"
              name="displayName"
              placeholder="John Doe"
              value={formData.displayName}
              onChange={handleChange}
              className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-[#F5F5F4] placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all text-sm"
            />
            {errors.displayName && <span className="text-[#EF4444] text-xs">{errors.displayName}</span>}
          </div>
        </div>

        {/* Email */}
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

        {/* Date of Birth */}
        <div className="flex flex-col gap-2">
          <label className="text-[#F5F5F4] text-sm font-medium">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
            className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-[#F5F5F4] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all [color-scheme:dark]"
          />
          {errors.dateOfBirth && <span className="text-[#EF4444] text-xs">{errors.dateOfBirth}</span>}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label className="text-[#F5F5F4] text-sm font-medium">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Min. 8 characters"
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

        {/* Confirm Password */}
        <div className="flex flex-col gap-2">
          <label className="text-[#F5F5F4] text-sm font-medium">Confirm Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-[#F5F5F4] placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
          />
          {errors.confirmPassword && <span className="text-[#EF4444] text-xs">{errors.confirmPassword}</span>}
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer mt-2">
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-white/5 text-[#8B5CF6] focus:ring-[#8B5CF6]"
          />
          <span className="text-sm text-gray-400">
            I agree to the{' '}
            <Link href="/terms" className="text-[#8B5CF6] hover:text-purple-400">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[#8B5CF6] hover:text-purple-400">Privacy Policy</Link>
          </span>
        </label>
        {errors.agreeToTerms && (
          <p className="text-sm text-[#EF4444] -mt-2">{errors.agreeToTerms}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 mt-4 bg-[#8B5CF6] text-white rounded-full font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Login link */}
      <p className="text-center mt-6 text-gray-400 pb-8">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-[#8B5CF6] hover:text-purple-400 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
