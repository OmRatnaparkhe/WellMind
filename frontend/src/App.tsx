import { Navigate, Route, Routes } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn, SignUp, UserButton } from '@clerk/clerk-react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Checklist from './pages/Checklist';
import CanvasPage from './pages/CanvasPage';
import Library from './pages/Library';
import Quizz from './pages/Quizz';
import Appointment from './pages/Appointment';
import MyDays from './pages/MyDays';
import MoodCheck from './pages/MoodCheck';
import Journal from './pages/Journal';
import CognitiveExercises from './pages/CognitiveExercises';
import Onboarding from './pages/Onboarding';
import { SidebarLayout } from './components/SidebarLayout';
import { ThemeToggle } from './components/ThemeToggle';
// GlobalAudioPlayer removed per request

function ProtectedRoutes() {
  return (
    <SignedIn>
      <SidebarLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/canvas" element={<CanvasPage />} />
          {/* Music page removed; global player remains available */}
          <Route path="/library" element={<Library />} />
          {/* Videos page removed; videos shown inline in Checklist */}
          <Route path="/quizz" element={<Quizz />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/my-days" element={<MyDays />} />
          <Route path="/mood-check" element={<MoodCheck />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/cognitive" element={<CognitiveExercises />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </SidebarLayout>
    </SignedIn>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-lavender/5 to-brand-blue/10 dark:from-neutral-950 dark:to-neutral-900">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <ThemeToggle />
        <div className="relative overflow-hidden rounded-full shadow-md hover:shadow-glow transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-brand-blue/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: {
                  width: '36px',
                  height: '36px'
                }
              }
            }}
          />
        </div>
      </div>
      <Routes>
        <Route
          path="/sign-in"
          element={
            <SignedOut>
              <div className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-brand-lavender/10 to-brand-blue/10 dark:from-neutral-900 dark:to-neutral-950">
                <div className="glass-effect p-8 rounded-2xl shadow-glow animate-fadeInUp">
                  <SignIn signUpUrl="/sign-up" />
                </div>
              </div>
            </SignedOut>
          }
        />
        <Route
          path="/sign-up"
          element={
            <SignedOut>
              <div className="min-h-screen grid place-items-center p-4">
                <SignUp signInUrl="/sign-in" />
              </div>
            </SignedOut>
          }
        />
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<SignedIn><Onboarding /></SignedIn>} />
        {/* === THE FIX IS HERE === */}
        {/* This tells the router to handle all other paths with the ProtectedRoutes component */}
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </div>
  );
}