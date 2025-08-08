import { Navigate, Route, Routes } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn, SignUp, UserButton } from '@clerk/clerk-react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Checklist from './pages/Checklist';
import CanvasPage from './pages/CanvasPage';
import Music from './pages/Music';
import Library from './pages/Library';
import Videos from './pages/Videos';
import Quizz from './pages/Quizz';
import Appointment from './pages/Appointment';
import { SidebarLayout } from './components/SidebarLayout';
import { ThemeToggle } from './components/ThemeToggle';

function ProtectedRoutes() {
  return (
    <SignedIn>
      <SidebarLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/canvas" element={<CanvasPage />} />
          <Route path="/music" element={<Music />} />
          <Route path="/library" element={<Library />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/quizz" element={<Quizz />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </SidebarLayout>
    </SignedIn>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
        <ThemeToggle />
        <UserButton afterSignOutUrl="/" />
      </div>
      <Routes>
        <Route
          path="/sign-in"
          element={
            <SignedOut>
              <div className="min-h-screen grid place-items-center p-4">
                <SignIn signUpUrl="/sign-up" />
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
      </Routes>
      <ProtectedRoutes />
    </div>
  );
}


