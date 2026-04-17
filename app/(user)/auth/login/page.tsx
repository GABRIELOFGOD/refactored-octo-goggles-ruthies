'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const searchParam = useSearchParams();

  const previousPage = searchParam.get("from");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // const result = await signIn('credentials', {
      //   email,
      //   password,
      //   redirect: false,
      // });

      // if (result?.error) {
      //   toast.error(result.error || 'Invalid credentials');
      // } else {
      //   toast.success('Login successful!');
        
      //   // Fetch user session to check role
      //   const sessionRes = await fetch('/api/auth/session');
      //   const session = await sessionRes.json();
        
      //   // Redirect based on role
      //   const redirectUrl = session?.user?.role === 'admin' 
      //     ? '/admin'
      //     : (searchParams.get('callbackUrl') || '/');
        
      //   router.push(redirectUrl);
      // }

      const result = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({email, password})
      });

      const response = await result.json();
      if (!result.ok) throw new Error(response.error);
      if (response.data) {
        localStorage.setItem("token", response.data.token);
        toast.success("User logged in successfully");
        router.replace(previousPage  !== "/" && previousPage !== null ? previousPage : "/");
        return;
      }
      
    } catch (error: any) {
      toast.error(error.error || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-4xl font-bold font-playfair text-primary">
            Ruthies Africa
          </h1>
          <p className="mt-2 text-gray-600">We style, you slay</p>
        </div>

        {/* Form */}
        <form className="space-y-6 bg-white p-8 rounded-lg shadow-sm" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-center font-playfair">Login</h2>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          {/* Links */}
          <div className="flex items-center justify-between text-sm">
            <Link href="/auth/forgot-password" className="text-secondary hover:text-accent">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          {/* Register Link */}
          <div className="text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link href="/auth/register" className="text-secondary font-medium hover:text-accent">
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
