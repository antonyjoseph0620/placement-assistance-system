'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Eligibility Checker', path: '/eligibility' },
    { name: 'AI Chat', path: '/chat' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 glass-panel border-b border-white/5 transition-all duration-300 ${
        scrolled ? 'py-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-wider gradient-text">
          PLACEMENT<span className="text-white">GPT</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8 font-display text-sm tracking-wide">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.path}
              className={`nav-link transition-colors font-medium relative group py-1 ${
                pathname === link.path ? 'text-[var(--color-accent-blue)]' : 'text-white/70 hover:text-[var(--color-accent-blue)]'
              }`}
            >
              {link.name}
              <span className={`absolute bottom-0 left-0 h-0.5 bg-[var(--color-accent-blue)] transition-all duration-300 ${
                pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white/80 hover:text-white focus:outline-none" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <path d="M4 12h16M4 6h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-white/5 py-4 px-6 flex flex-col gap-4 font-display text-base tracking-wide absolute top-full left-0 w-full shadow-xl">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-2 border-b border-white/5 transition-colors ${
                pathname === link.path ? 'text-[var(--color-accent-blue)]' : 'text-white/80 hover:text-[var(--color-accent-blue)]'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
