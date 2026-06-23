'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');
  
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Hi there! I am PlacementGPT, your AI career guidance assistant. How can I help you with your placement preparation today?' }
  ]);
  const [input, setInput] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load profile
  useEffect(() => {
    const savedProfile = localStorage.getItem('studentProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    
    // Auto-submit if query param is present
    if (initialQuery) {
      handleSend(initialQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async (textToSubmit = input) => {
    if (!textToSubmit.trim() || loading) return;

    const userMessage = textToSubmit;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          student_profile: profile,
          // Extract company name if user is asking about one
          company_name: extractCompanyName(userMessage)
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: data.response,
        sources: data.sources_used
      }]);
      setLoading(false);
    } catch (err) {
      console.error(err);
      
      // Fallback for demo
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'system', 
          content: `**Mock Response (Backend Unreachable)**\n\nI understand you're asking: "${userMessage}".\n\nBased on your profile, I recommend focusing on improving your technical skills and maintaining your CGPA. Your coding score of ${profile?.coding_score || 'N/A'} is a good start, but continuous practice on LeetCode will help significantly.\n\n*Make sure the FastAPI backend is running on port 8000 for full AI capabilities.*`
        }]);
        setLoading(false);
      }, 1500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to guess company from query for the demo
  const extractCompanyName = (text) => {
    const companies = ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'Deloitte', 'Goldman Sachs', 'JP Morgan', 'Adobe', 'Flipkart'];
    const lowerText = text.toLowerCase();
    return companies.find(c => lowerText.includes(c.toLowerCase()));
  };

  // Format message with basic markdown
  const formatMessage = (content) => {
    return content.split('\n').map((line, i) => {
      // Simple bold replacement
      const parts = line.split(/(\*\*.*?\*\*)/g);
      
      return (
        <p key={i} className="mb-2 last:mb-0 min-h-[1em]">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="text-[var(--color-accent-blue)]">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={j} className="text-white/80">{part.slice(1, -1)}</em>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="flex-grow flex h-full max-w-7xl mx-auto w-full relative overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col h-full relative z-10 px-4 md:px-6 pb-6 pt-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <span className="text-[var(--color-accent-violet)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </span>
            PlacementGPT
          </h1>
          
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden glass-panel p-2 rounded-md text-white/70 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto pr-2 pb-4 space-y-6 scroll-smooth custom-scrollbar">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[75%] p-4 ${msg.role === 'user' ? 'chat-bubble-user text-white' : 'chat-bubble-ai text-white/90'}`}>
                <div className="flex items-center gap-2 mb-2 opacity-60">
                  {msg.role === 'user' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  )}
                  <span className="text-xs font-mono uppercase tracking-wider">{msg.role === 'user' ? 'You' : 'PlacementGPT'}</span>
                </div>
                <div className="text-sm leading-relaxed text-left">
                  {formatMessage(msg.content)}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="chat-bubble-ai p-4 max-w-[85%] flex gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent-violet)] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent-purple)] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent-blue)] animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="mt-4 pt-4 border-t border-white/10 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about placement preparation, resume tips, or company eligibility..."
            className="w-full glass-input resize-none pr-12 pb-2 h-[60px] max-h-[150px]"
            rows={1}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="absolute right-3 top-[50%] translate-y-[2px] w-8 h-8 rounded-full bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setInput("What are my strengths based on my profile?")} className="whitespace-nowrap px-3 py-1.5 rounded-full glass-panel text-xs text-white/70 hover:text-[var(--color-accent-blue)] hover:border-[var(--color-accent-blue)]/30 transition-colors">
            Identify Strengths
          </button>
          <button onClick={() => setInput("How can I improve my placement chances?")} className="whitespace-nowrap px-3 py-1.5 rounded-full glass-panel text-xs text-white/70 hover:text-[var(--color-accent-blue)] hover:border-[var(--color-accent-blue)]/30 transition-colors">
            Improvement Tips
          </button>
          <button onClick={() => setInput("What is the hiring process for Amazon?")} className="whitespace-nowrap px-3 py-1.5 rounded-full glass-panel text-xs text-white/70 hover:text-[var(--color-accent-blue)] hover:border-[var(--color-accent-blue)]/30 transition-colors">
            Amazon Hiring Process
          </button>
        </div>
      </div>

      {/* Context Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-80 border-l border-white/5 bg-[var(--color-darker)]/80 backdrop-blur-xl p-6 overflow-y-auto z-20 absolute md:relative right-0 h-full transition-all duration-300 flex-shrink-0`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-semibold text-white/80">Active Context</h2>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/50 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {profile ? (
          <div className="space-y-4 animate-in fade-in">
            <div className="glass-card p-4 border border-[var(--color-accent-blue)]/20">
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent-blue)]/10 flex items-center justify-center text-[var(--color-accent-blue)] font-display font-bold text-lg">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{profile.name}</h3>
                  <p className="text-xs text-white/50">{profile.department}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                <div>
                  <span className="block text-[10px] text-white/40 uppercase">CGPA</span>
                  <span className="text-sm font-mono text-white/90">{profile.cgpa}/10</span>
                </div>
                <div>
                  <span className="block text-[10px] text-white/40 uppercase">Tech Score</span>
                  <span className="text-sm font-mono text-white/90">{profile.technical_score}/100</span>
                </div>
                <div>
                  <span className="block text-[10px] text-white/40 uppercase">Projects</span>
                  <span className="text-sm font-mono text-white/90">{profile.projects_completed}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-white/40 uppercase">Backlogs</span>
                  <span className="text-sm font-mono text-white/90">{profile.backlogs}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-white/5 flex justify-center">
                <span className="text-[10px] text-[var(--color-accent-blue)] uppercase tracking-wider font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-blue)] animate-pulse"></span>
                  Injected in AI context
                </span>
              </div>
            </div>
            
            <Link href="/dashboard" className="block text-center text-xs text-white/50 hover:text-white transition-colors">
              Edit Profile
            </Link>
          </div>
        ) : (
          <div className="glass-card p-6 text-center border border-amber-500/20 bg-amber-500/5">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 mx-auto mb-2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            <h3 className="text-sm font-semibold text-amber-200 mb-2">No Profile Found</h3>
            <p className="text-xs text-amber-200/60 mb-4">Set up your profile to get personalized AI guidance based on your academic records.</p>
            <Link href="/dashboard" className="btn-primary text-xs px-4 py-2 w-full">
              Create Profile
            </Link>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">RAG Knowledge Base</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-xs text-white/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-accent-purple)] shrink-0 mt-0.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              <span>Company Hiring Criteria</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-white/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-accent-purple)] shrink-0 mt-0.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              <span>Placement Preparation</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-white/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-accent-purple)] shrink-0 mt-0.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              <span>Career Guidance Tips</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  return (
    <>
      <Navbar />
      <main className="flex-grow mt-20 h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
        <Suspense fallback={<div className="flex-grow flex items-center justify-center text-white/50">Loading chat...</div>}>
          <ChatContent />
        </Suspense>
      </main>
    </>
  );
}
