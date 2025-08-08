import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { Link, Navigate } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand.blue/20 to-brand.purple/20 dark:from-brand.purple/10 dark:to-brand.blue/10">
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <SignedIn>
          <Navigate to="/dashboard" replace />
        </SignedIn>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">MindWell</h1>
        <p className="mt-4 text-lg md:text-xl text-neutral-600 dark:text-neutral-300">
          A compassionate Mental Health Evaluation and Guidance Support System.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="rounded-md bg-primary px-5 py-2.5 text-white shadow hover:opacity-90">Get Started</button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="rounded-md border px-5 py-2.5">Sign In</button>
            </SignInButton>
          </SignedOut>
          <Link className="underline" to="/appointment">Need help now?</Link>
        </div>
      </div>
    </div>
  );
}


