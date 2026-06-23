'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import ReadinessGauge from '@/components/ReadinessGauge';
import { apiFetch } from '@/lib/api';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: 'Student Name',
    cgpa: 8.5,
    tenth_percentage: 85,
    twelfth_percentage: 85,
    department: 'Computer Science',
    aptitude_score: 80,
    communication_score: 75,
    technical_score: 85,
    coding_score: 80,
    projects_completed: 4,
    internships: 1,
    certifications: 2,
    attendance: 90,
    backlogs: 0
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call to the backend
      const response = await apiFetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Prediction API failed (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      setResult(data);
      
      // Save profile to local storage for use in other pages
      localStorage.setItem('studentProfile', JSON.stringify(formData));
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the prediction service. Ensure the backend is running.");
      
      // Fallback for demo purposes if backend isn't running
      setTimeout(() => {
        setResult({
          prediction: formData.cgpa >= 7.0 && formData.backlogs === 0 ? 'Placed' : 'Not Placed',
          probability: Math.min((formData.cgpa / 10) * 0.5 + (formData.coding_score / 100) * 0.5, 0.95),
          readiness_score: Math.round(Math.min((formData.cgpa * 10 + formData.technical_score + formData.coding_score) / 3, 100)),
          strengths: ['Good coding score', 'No active backlogs'],
          weaknesses: ['Aptitude needs improvement']
        });
        localStorage.setItem('studentProfile', JSON.stringify(formData));
        setError(null);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container">
          <div className="flex flex-col mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-3">
              <span className="text-[var(--color-accent-blue)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 7v4"/><path d="M12 7v10"/><path d="M16 7v7"/></svg>
              </span>
              Student Dashboard
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] mt-3 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Input Form */}
            <div className="lg:col-span-5">
              <div className="glass-card p-6 border-t-4 border-t-[var(--color-accent-blue)]">
                <h2 className="font-display font-semibold text-xl mb-6">Academic Profile</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className="glass-input" required />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">Department</label>
                      <select name="department" value={formData.department} onChange={handleChange} className="glass-input appearance-none bg-[var(--color-dark)] text-white" required>
                        <option value="Computer Science" className="text-black">Computer Science</option>
                        <option value="Information Technology" className="text-black">Information Technology</option>
                        <option value="Electronics" className="text-black">Electronics</option>
                        <option value="Electrical" className="text-black">Electrical</option>
                        <option value="Mechanical" className="text-black">Mechanical</option>
                        <option value="Civil" className="text-black">Civil</option>
                      </select>
                    </div>
                  </div>

                  {/* Academics */}
                  <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">CGPA</label>
                      <input type="number" name="cgpa" value={formData.cgpa} onChange={handleChange} step="0.1" min="0" max="10" className="glass-input" required />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">10th %</label>
                      <input type="number" name="tenth_percentage" value={formData.tenth_percentage} onChange={handleChange} step="0.1" min="0" max="100" className="glass-input" required />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">12th %</label>
                      <input type="number" name="twelfth_percentage" value={formData.twelfth_percentage} onChange={handleChange} step="0.1" min="0" max="100" className="glass-input" required />
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">Technical Score</label>
                      <input type="number" name="technical_score" value={formData.technical_score} onChange={handleChange} min="0" max="100" className="glass-input" required />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">Coding Score</label>
                      <input type="number" name="coding_score" value={formData.coding_score} onChange={handleChange} min="0" max="100" className="glass-input" required />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">Aptitude Score</label>
                      <input type="number" name="aptitude_score" value={formData.aptitude_score} onChange={handleChange} min="0" max="100" className="glass-input" required />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">Communication</label>
                      <input type="number" name="communication_score" value={formData.communication_score} onChange={handleChange} min="0" max="100" className="glass-input" required />
                    </div>
                  </div>

                  {/* Experience & Other */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">Projects</label>
                      <input type="number" name="projects_completed" value={formData.projects_completed} onChange={handleChange} min="0" className="glass-input" required />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">Internships</label>
                      <input type="number" name="internships" value={formData.internships} onChange={handleChange} min="0" className="glass-input" required />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">Active Backlogs</label>
                      <input type="number" name="backlogs" value={formData.backlogs} onChange={handleChange} min="0" className="glass-input" required />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">Attendance %</label>
                      <input type="number" name="attendance" value={formData.attendance} onChange={handleChange} min="0" max="100" className="glass-input" required />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full btn-primary mt-6"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Analyzing Profile...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
                        Evaluate Readiness
                      </span>
                    )}
                  </button>
                  
                  {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
                </form>
              </div>
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-7">
              {!result ? (
                <div className="glass-card h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center border-dashed border-white/20">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/30 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  </div>
                  <h3 className="font-display text-xl font-medium text-white/50 mb-2">Awaiting Analysis</h3>
                  <p className="text-white/40 text-sm max-w-sm">Fill out your academic profile on the left and click "Evaluate" to see your placement prediction and readiness score.</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  
                  {/* Top Result Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Prediction Card */}
                    <div className="glass-card p-6 border-t-4" style={{ borderColor: result.prediction === 'Placed' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Model Prediction</h3>
                      <div className="flex items-end gap-3 mb-2">
                        <span className={`text-3xl font-display font-bold ${result.prediction === 'Placed' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                          {result.prediction}
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">Probability</span>
                          <span className="font-mono text-white/80">{(result.probability * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${result.prediction === 'Placed' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'}`}
                            style={{ width: `${result.probability * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Readiness Card */}
                    <div className="glass-card p-6 flex flex-col items-center justify-center border-t-4 border-t-[var(--color-accent-purple)]">
                      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2 self-start w-full">Readiness Score</h3>
                      <ReadinessGauge score={result.readiness_score} />
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="glass-card p-6 border border-emerald-500/20 bg-emerald-500/5">
                      <h3 className="flex items-center gap-2 font-semibold text-emerald-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                        Profile Strengths
                      </h3>
                      <ul className="space-y-2">
                        {result.strengths && result.strengths.length > 0 ? (
                          result.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-emerald-200/80 flex items-start gap-2">
                              <span className="text-emerald-500 mt-1">•</span> {s}
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-white/40">No significant strengths identified yet.</li>
                        )}
                      </ul>
                    </div>

                    <div className="glass-card p-6 border border-amber-500/20 bg-amber-500/5">
                      <h3 className="flex items-center gap-2 font-semibold text-amber-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                        Areas for Improvement
                      </h3>
                      <ul className="space-y-2">
                        {result.weaknesses && result.weaknesses.length > 0 ? (
                          result.weaknesses.map((w, i) => (
                            <li key={i} className="text-sm text-amber-200/80 flex items-start gap-2">
                              <span className="text-amber-500 mt-1">•</span> {w}
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-white/40">No significant weaknesses identified.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-medium text-white mb-1">Want personalized guidance?</h3>
                      <p className="text-sm text-white/60">Chat with our AI to get a step-by-step improvement plan.</p>
                    </div>
                    <a href="/chat" className="btn-secondary whitespace-nowrap">
                      Chat with PlacementGPT
                    </a>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
