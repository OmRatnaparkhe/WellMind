import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { Link, Navigate } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-brand-lavender/20 via-white to-brand-blue/20 dark:from-primary/10 dark:via-neutral-900 dark:to-brand-blue/10">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEyNCw1OCwyMzcsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')] opacity-30 dark:opacity-10"></div>
      
      <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-32 text-center">
        <SignedIn>
          <Navigate to="/dashboard" replace />
        </SignedIn>
        
        <div className="space-y-6 animate-fadeInUp">
          <div className="inline-block">
            <div className="relative w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-primary to-brand-blue shadow-glow-lg flex items-center justify-center text-white text-3xl font-bold animate-pulse">
              M
              <div className="absolute -inset-3 bg-primary/20 rounded-full blur-xl animate-pulse opacity-70"></div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-brand-indigo to-brand-blue animate-gradient bg-300%">
            MindWell
          </h1>
          
          <p className="mt-6 text-xl md:text-2xl text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            A compassionate Mental Health Evaluation and Guidance Support System.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="btn-primary w-full sm:w-auto px-8 py-3 text-lg rounded-xl shadow-glow transform transition-transform duration-300 hover:scale-105">
                  Get Started
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="btn-secondary w-full sm:w-auto px-8 py-3 text-lg rounded-xl transform transition-transform duration-300 hover:scale-105">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <Link className="mt-4 sm:mt-0 text-primary dark:text-primary-light hover:underline transition-all duration-300" to="/appointment">
              Need help now?
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce opacity-70">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}


