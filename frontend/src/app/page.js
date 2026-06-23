import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';

export default function Home() {
  return (
    <>
      <Navbar />
      <ParticleBackground />
      
      <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-12 relative z-10 min-h-screen">
        <div className="container max-w-5xl mx-auto text-center space-y-8 px-4">
          
          {/* Glowing Pulse Badge */}
          <div className="inline-flex items-center gap-2 mx-auto px-4 py-2 rounded-full glass-panel border border-[var(--color-accent-blue)]/30 bg-[var(--color-accent-blue)]/5 text-[var(--color-accent-blue)] text-xs sm:text-sm font-semibold uppercase tracking-wider animate-pulse-slow shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent-blue)]"></span>
            AI-Powered Career Guidance
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Elevate Your <br className="sm:hidden" />
            <span className="gradient-text">Placement Journey</span>
          </h1>

          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Upload your academic profile, discover your placement readiness, check company eligibility, and get personalized AI guidance to secure your dream job.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/dashboard" className="w-full sm:w-auto btn-primary text-base px-8 py-4">
              Get Started
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
            <Link href="/eligibility" className="w-full sm:w-auto btn-secondary text-base px-8 py-4">
              Check Eligibility
            </Link>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 mt-8 border-t border-white/5">
            <div className="glass-card p-6 text-left hover:scale-[1.02]">
              <div className="w-12 h-12 rounded-xl bg-accentBlue/10 border border-accentBlue/20 flex items-center justify-center text-accentBlue mb-4 text-[var(--color-accent-blue)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-white">Placement Prediction</h3>
              <p className="text-white/60 text-sm leading-relaxed">Advanced ML models evaluate your profile to predict your placement probability.</p>
            </div>

            <div className="glass-card p-6 text-left hover:scale-[1.02]">
              <div className="w-12 h-12 rounded-xl bg-accentPurple/10 border border-accentPurple/20 flex items-center justify-center text-[var(--color-accent-purple)] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-white">Company Matching</h3>
              <p className="text-white/60 text-sm leading-relaxed">Check your eligibility against hiring criteria for top product and service companies.</p>
            </div>

            <div className="glass-card p-6 text-left hover:scale-[1.02]">
              <div className="w-12 h-12 rounded-xl bg-accentViolet/10 border border-accentViolet/20 flex items-center justify-center text-[var(--color-accent-violet)] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-white">AI Career Guidance</h3>
              <p className="text-white/60 text-sm leading-relaxed">Chat with PlacementGPT to get personalized recommendations to improve your profile.</p>
            </div>
          </div>
          
        </div>
      </main>
    </>
  );
}
