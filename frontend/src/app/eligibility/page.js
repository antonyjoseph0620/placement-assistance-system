'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function Eligibility() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);

  // Load companies on mount
  useEffect(() => {
    // Check if profile exists
    const profile = localStorage.getItem('studentProfile');
    setHasProfile(!!profile);

    const fetchCompanies = async () => {
      try {
        const response = await apiFetch('/api/companies');
        if (response.ok) {
          const data = await response.json();
          setCompanies(data.companies || []);
        } else {
          // Mock data for demo if backend isn't running
          setCompanies([
            { name: 'Google', role: 'Software Engineer', package_lpa: 25 },
            { name: 'Microsoft', role: 'SDE', package_lpa: 22 },
            { name: 'Amazon', role: 'SDE I', package_lpa: 18 },
            { name: 'TCS', role: 'Systems Engineer', package_lpa: 7 },
            { name: 'Infosys', role: 'Digital Specialist', package_lpa: 6.5 }
          ]);
        }
      } catch (err) {
        console.error(err);
        setCompanies([
          { name: 'Google', role: 'Software Engineer', package_lpa: 25 },
          { name: 'Microsoft', role: 'SDE', package_lpa: 22 },
          { name: 'Amazon', role: 'SDE I', package_lpa: 18 },
          { name: 'TCS', role: 'Systems Engineer', package_lpa: 7 },
          { name: 'Infosys', role: 'Digital Specialist', package_lpa: 6.5 }
        ]);
      }
    };
    fetchCompanies();
  }, []);

  const handleCheck = async () => {
    if (!selectedCompany) return;
    
    const profileStr = localStorage.getItem('studentProfile');
    if (!profileStr) return;
    
    const profile = JSON.parse(profileStr);
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await apiFetch('/api/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: profile,
          company_name: selectedCompany
        })
      });
      
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Failed to check eligibility (${response.status}): ${body}`);
      }
      
      const data = await response.json();
      setResult(data);
      setLoading(false);
    } catch (err) {
      console.error('Eligibility request failed:', err);
      
      // Fallback for demo
      setTimeout(() => {
        setResult({
          company_name: selectedCompany,
          status: profile.cgpa >= 8.0 ? 'Eligible' : (profile.cgpa >= 6.5 ? 'Partially Eligible' : 'Not Eligible'),
          package_lpa: companies.find(c => c.name === selectedCompany)?.package_lpa || 'N/A',
          role: companies.find(c => c.name === selectedCompany)?.role || 'N/A',
          criteria_passed: profile.cgpa >= 8.0 ? 7 : 4,
          total_criteria: 7,
          criteria_met: [
            { criterion: 'CGPA', required: '>= 7.5', student_value: profile.cgpa, met: profile.cgpa >= 7.5 },
            { criterion: 'Backlogs', required: '<= 0', student_value: profile.backlogs, met: profile.backlogs === 0 },
            { criterion: 'Department', required: 'CS, IT', student_value: profile.department, met: ['Computer Science', 'Information Technology'].includes(profile.department) }
          ],
          criteria_not_met: profile.cgpa < 7.5 ? [
             { criterion: 'CGPA', required: '>= 7.5', student_value: profile.cgpa, met: false }
          ] : []
        });
        setLoading(false);
      }, 800);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Eligible') return 'text-[var(--color-success)] bg-[var(--color-success)]/10 border-[var(--color-success)]/30';
    if (status === 'Partially Eligible') return 'text-[var(--color-warning)] bg-[var(--color-warning)]/10 border-[var(--color-warning)]/30';
    return 'text-[var(--color-danger)] bg-[var(--color-danger)]/10 border-[var(--color-danger)]/30';
  };

  return (
    <>
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container max-w-4xl mx-auto">
          <div className="flex flex-col mb-8 text-center">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Company <span className="text-[var(--color-accent-purple)]">Eligibility Checker</span>
            </h1>
            <p className="text-white/60 mt-3 max-w-2xl mx-auto">
              Compare your academic profile against real hiring criteria from top tech companies to see where you stand.
            </p>
          </div>

          {!hasProfile ? (
            <div className="glass-card p-10 text-center animate-in fade-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m19 8 2 2 4-4"/></svg>
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Profile Required</h2>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                You need to set up your student profile in the dashboard before checking company eligibility.
              </p>
              <Link href="/dashboard" className="btn-primary">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Selector */}
              <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-4 border-t-4 border-t-[var(--color-accent-purple)]">
                <div className="flex-grow w-full">
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Select Company to Check</label>
                  <select 
                    value={selectedCompany} 
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="glass-input appearance-none bg-[var(--color-darker)] text-white w-full text-base"
                  >
                    <option value="" disabled className="text-black">-- Select a Company --</option>
                    {companies.map(c => (
                      <option key={c.name} value={c.name} className="text-black">{c.name} ({c.package_lpa} LPA - {c.role})</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={handleCheck}
                  disabled={!selectedCompany || loading}
                  className="w-full sm:w-auto btn-primary mt-6 sm:mt-0 whitespace-nowrap px-8"
                  style={{ background: 'linear-gradient(to right, var(--color-accent-purple), var(--color-accent-violet))' }}
                >
                  {loading ? 'Checking...' : 'Check Eligibility'}
                </button>
              </div>

              {/* Result Area */}
              {result && (
                <div className="glass-card p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-white/10">
                    <div>
                      <h2 className="font-display text-3xl font-bold text-white mb-1">{result.company_name}</h2>
                      <p className="text-white/60 font-mono text-sm">{result.role} • {result.package_lpa} LPA</p>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className={`px-4 py-2 rounded-lg border font-bold text-lg tracking-wide ${getStatusColor(result.status)}`}>
                        {result.status}
                      </div>
                      <p className="text-white/50 text-xs mt-2 font-mono">
                        Passed {result.criteria_passed} of {result.total_criteria} checks
                      </p>
                    </div>
                  </div>

                  <div className="pt-6">
                    <h3 className="font-display font-semibold text-lg mb-4 text-white/80">Detailed Comparison</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/50">
                            <th className="pb-3 pr-4 font-medium">Criterion</th>
                            <th className="pb-3 pr-4 font-medium">Required</th>
                            <th className="pb-3 pr-4 font-medium">Your Profile</th>
                            <th className="pb-3 font-medium text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Met Criteria */}
                          {result.criteria_met.map((item, i) => (
                            <tr key={`met-${i}`} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                              <td className="py-3 pr-4 text-white/80 text-sm font-medium">{item.criterion}</td>
                              <td className="py-3 pr-4 text-white/60 text-sm font-mono">{item.required}</td>
                              <td className="py-3 pr-4 text-white/80 text-sm font-mono">{item.student_value}</td>
                              <td className="py-3 text-center">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                </span>
                              </td>
                            </tr>
                          ))}
                          
                          {/* Unmet Criteria */}
                          {result.criteria_not_met.map((item, i) => (
                            <tr key={`unmet-${i}`} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors bg-red-500/[0.02]">
                              <td className="py-3 pr-4 text-red-200/80 text-sm font-medium">{item.criterion}</td>
                              <td className="py-3 pr-4 text-white/60 text-sm font-mono">{item.required}</td>
                              <td className="py-3 pr-4 text-red-400 text-sm font-mono font-semibold">{item.student_value}</td>
                              <td className="py-3 text-center">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-red-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {result.criteria_not_met.length > 0 && (
                    <div className="mt-8 p-4 rounded-xl border border-[var(--color-accent-blue)]/20 bg-[var(--color-accent-blue)]/5 flex items-start gap-4">
                      <div className="mt-1 text-[var(--color-accent-blue)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">AI Recommendation</h4>
                        <p className="text-sm text-white/70 mb-3">
                          You are currently falling short on {result.criteria_not_met.length} criteria for {result.company_name}. 
                          Would you like specific guidance on how to overcome these gaps?
                        </p>
                        <Link href={`/chat?q=How can I improve my profile for ${result.company_name}?`} className="text-xs font-semibold text-[var(--color-accent-blue)] hover:underline inline-flex items-center gap-1">
                          Ask PlacementGPT <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
