'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleIcon, Loader2 } from 'lucide-react';
import { signIn, signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';
import { Suspense } from 'react';

// Create a separate client component that uses useSearchParams
function LoginForm({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  console.log('Rendering LoginForm with mode:', mode); // Debug log
  
  const searchParams = useSearchParams();
  console.log('SearchParams object available:', !!searchParams); // Debug log
  
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  
  console.log('Parsed params:', { redirect, priceId, inviteId }); // Debug log
  
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' },
  );

  return (
    <form className="space-y-6" action={formAction}>
      <input type="hidden" name="redirect" value={redirect || ''} />
      <input type="hidden" name="priceId" value={priceId || ''} />
      <input type="hidden" name="inviteId" value={inviteId || ''} />
      <div>
        <Label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </Label>
        <div className="mt-1">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.email}
            required
            maxLength={50}
            className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </Label>
        <div className="mt-1">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={
              mode === 'signin' ? 'current-password' : 'new-password'
            }
            defaultValue={state.password}
            required
            minLength={8}
            maxLength={100}
            className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
            placeholder="Enter your password"
          />
        </div>
      </div>

      {state?.error && (
        <div className="text-red-500 text-sm">{state.error}</div>
      )}

      <div>
        <Button
          type="submit"
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          disabled={pending}
        >
          {pending ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Loading...
            </>
          ) : mode === 'signin' ? (
            'Sign in'
          ) : (
            'Sign up'
          )}
        </Button>
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">
            {mode === 'signin'
              ? 'New to our platform?'
              : 'Already have an account?'}
          </span>
        </div>
      </div>

      <div>
        <Link
          href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${
            redirect ? `?redirect=${redirect}` : ''
          }${priceId ? `&priceId=${priceId}` : ''}`}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          {mode === 'signin'
            ? 'Create an account'
            : 'Sign in to existing account'}
        </Link>
      </div>
    </form>
  );
}

// Fallback component to show while suspense is resolving
function LoginFormFallback() {
  console.log('Rendering fallback component'); // Debug log
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-gray-200 rounded-full"></div>
      <div className="h-10 bg-gray-200 rounded-full"></div>
      <div className="h-10 bg-gray-200 rounded-full"></div>
      <div className="h-10 bg-gray-200 rounded-full mt-6"></div>
    </div>
  );
}

// Main Login component that wraps the form in Suspense
export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  console.log('Rendering Login container with mode:', mode); // Debug log
  
  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CircleIcon className="h-12 w-12 text-orange-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {mode === 'signin'
            ? 'Sign in to your account'
            : 'Create your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm mode={mode} />
        </Suspense>
      </div>
    </div>
  );
}
