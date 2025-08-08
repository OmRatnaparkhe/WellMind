export default function Appointment() {
  return (
    <div className="max-w-4xl mx-auto animate-fadeInUp">
      <div className="relative mb-8 rounded-2xl p-6 glass-effect shadow-card overflow-hidden">
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tr from-brand-teal/30 to-primary/30 rounded-full blur-2xl opacity-70 animate-pulse" />
        <h2 className="text-2xl font-bold relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-primary to-brand-teal animate-gradient bg-300%">Find Professional Support</h2>
        <p className="text-neutral-600 dark:text-neutral-300 relative z-10 mt-2">
          If you are in crisis or experiencing a mental health emergency, call your local emergency number immediately.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl glass-effect p-6 shadow-card hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1 animate-fadeInLeft">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/20 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Emergency Contacts</h3>
          </div>
          
          <ul className="space-y-4">
            <EmergencyContact 
              label="National Suicide & Crisis Lifeline" 
              contact="988" 
              href="tel:988" 
              region="US" 
            />
            <EmergencyContact 
              label="Emergency Services" 
              contact="112" 
              href="tel:112" 
              region="EU" 
            />
            <EmergencyContact 
              label="Emergency Services" 
              contact="999" 
              href="tel:999" 
              region="UK" 
            />
          </ul>
        </div>
        
        <div className="rounded-xl glass-effect p-6 shadow-card hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1 animate-fadeInRight">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-brand-blue/20 text-brand-blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Find Help</h3>
          </div>
          
          <div className="space-y-4">
            <a 
              href="https://www.psychologytoday.com" 
              target="_blank" 
              rel="noreferrer" 
              className="block p-4 rounded-lg bg-white/50 dark:bg-neutral-800/50 hover:shadow-md transition-all duration-300 transform hover:translate-x-1"
            >
              <div className="font-medium">Psychology Today</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Find therapists, counselors, and treatment centers in your area.</p>
            </a>
            
            <a 
              href="https://www.nami.org" 
              target="_blank" 
              rel="noreferrer" 
              className="block p-4 rounded-lg bg-white/50 dark:bg-neutral-800/50 hover:shadow-md transition-all duration-300 transform hover:translate-x-1"
            >
              <div className="font-medium">National Alliance on Mental Illness</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Resources, support groups, and education for individuals and families.</p>
            </a>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-6 rounded-xl glass-effect shadow-card text-center animate-fadeInUp" style={{ animationDelay: '300ms' }}>
        <p className="text-lg">
          MindWell is a supportive companion, not a replacement for professional care.
        </p>
        <div className="mt-4 h-1 w-32 mx-auto bg-gradient-to-r from-brand-blue to-brand-purple rounded-full animate-shimmer bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,rgba(255,255,255,.6)_50%,rgba(0,0,0,0)_100%)] bg-[length:200%_100%]" />
      </div>
    </div>
  );
}

function EmergencyContact({ label, contact, href, region }: { label: string; contact: string; href: string; region: string }) {
  return (
    <li className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-neutral-800/50 hover:shadow-md transition-all duration-300 transform hover:translate-x-1">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">{region}</div>
      </div>
      <a 
        className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors duration-300 flex items-center gap-2" 
        href={href}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        {contact}
      </a>
    </li>
  );
}


