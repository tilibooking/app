/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  BarChart2, 
  Sliders, 
  User, 
  DollarSign, 
  Clock,
  Trash,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProfileView, POSView, PendingView, TrashView, AnalyticsView } from './components/Views';
import { AuthModal } from './components/AuthModal';
import { Job, Stats, User as UserType, ViewState } from './types';
import { supabase } from './lib/supabase';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('pos'); // Default to POS (public)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingView, setPendingView] = useState<ViewState | null>(null);
  
  // Data Store
  const [user, setUser] = useState<UserType>({
    name: "Guest",
    role: "Viewer",
    avatar: "https://i.pravatar.cc/150?img=11"
  });

  useEffect(() => {
    const storedAuth = localStorage.getItem('auth_session');
    if (storedAuth) {
      try {
        const { name, role, timestamp } = JSON.parse(storedAuth);
        const now = new Date().getTime();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        
        if (now - timestamp < thirtyDays) {
          setIsAuthenticated(true);
          setIsAuthModalOpen(false);
          setUser(prev => ({ ...prev, name, role, avatar: '' }));
        } else {
          localStorage.removeItem('auth_session');
        }
      } catch (e) {
        localStorage.removeItem('auth_session');
      }
    }
  }, []);

  const handleViewChange = (view: ViewState) => {
    if (view === 'profile' || view === 'pending' || view === 'trash') {
      if (!isAuthenticated) {
        setPendingView(view);
        setIsAuthModalOpen(true);
        return;
      }
    }
    setCurrentView(view);
  };

  const handleAuthSuccess = (name: string, role: string, avatar?: string) => {
    setIsAuthenticated(true);
    setUser(prev => ({ ...prev, name, role, avatar: avatar || '' }));
    
    const session = {
      name,
      role,
      avatar,
      timestamp: new Date().getTime()
    };
    localStorage.setItem('auth_session', JSON.stringify(session));
    
    if (pendingView) {
      setCurrentView(pendingView);
      setPendingView(null);
    }
  };

  const handleUpdateUser = async (updates: Partial<UserType>) => {
    // Update local state
    setUser(prev => ({ ...prev, ...updates }));
    
    // Update session storage
    const storedAuth = localStorage.getItem('auth_session');
    if (storedAuth) {
      const session = JSON.parse(storedAuth);
      const newSession = { ...session, ...updates };
      localStorage.setItem('auth_session', JSON.stringify(newSession));
    }

    // Update Supabase if authenticated
    if (isAuthenticated && user.name !== 'Guest') {
      try {
        const { error } = await supabase
          .from('users')
          .update({ 
            avatar_url: updates.avatar 
          })
          .eq('name', user.name);
          
        if (error) {
          console.error('Error updating user in Supabase:', error);
        }
      } catch (err) {
        console.error('Error updating user:', err);
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser({
      name: "Guest",
      role: "Viewer",
      avatar: "https://i.pravatar.cc/150?img=11"
    });
    localStorage.removeItem('auth_session');
    setCurrentView('pos');
  };

  const [stats, setStats] = useState<Stats>({
    weeklyHours: "174.28 hrs",
    grossRevenue: 10485.00,
    processingFees: 314.55, // 3%
    tips: 450.00,
  });

  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const checkTables = async () => {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error) console.log('Profiles table check:', error.message);
      else console.log('Profiles table exists');
    };
    checkTables();
    fetchJobs();
    
    // Subscribe to realtime changes
    const subscription = supabase
      .channel('jobs_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, (payload) => {
        fetchJobs();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching jobs:', error);
        return;
      }

      if (data) {
        const formattedJobs: Job[] = data.map(job => ({
          id: job.id,
          date: job.date,
          amount: Number(job.amount),
          status: job.status as any,
          tip: job.tip ? Number(job.tip) : undefined,
          removedAt: job.removed_at || undefined
        }));
        setJobs(formattedJobs);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleProcessPayment = async (amount: number, jobId: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Normalize Job ID
    // Ensure format is "JOB <number>"
    const numericPart = jobId.replace(/\D/g, '');
    const normalizedId = `JOB ${numericPart}`;

    try {
      // Check if job exists
      const { data: existingJob } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', normalizedId)
        .single();

      if (existingJob) {
        // Update existing job
        await supabase
          .from('jobs')
          .update({
            amount: amount,
            status: "Scheduled",
            date: "Date still pending"
          })
          .eq('id', normalizedId);
      } else {
        // Add new job
        await supabase
          .from('jobs')
          .insert([{
            id: normalizedId,
            date: "Date still pending",
            amount: amount,
            status: "Scheduled"
          }]);
      }
      
      // Refresh jobs list
      fetchJobs();
      
      // Navigate back to pending view after a short delay
      setTimeout(() => {
        handleViewChange('pending');
      }, 1000);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const handleAddJob = async (jobId: string) => {
    const numericPart = jobId.replace(/\D/g, '');
    const newJobId = `JOB ${numericPart}`;
    
    try {
      await supabase
        .from('jobs')
        .insert([{
          id: newJobId,
          date: "Date still pending",
          amount: 0,
          status: "Pending Approval"
        }]);
      
      fetchJobs();
    } catch (error) {
      console.error('Error adding job:', error);
    }
  };

  const handleUpdateJob = async (jobId: string, updates: Partial<Job>) => {
    try {
      const dbUpdates: any = { ...updates };
      
      // Map frontend fields to DB fields if necessary
      if (updates.removedAt !== undefined) {
        dbUpdates.removed_at = updates.removedAt;
        delete dbUpdates.removedAt;
      }
      
      await supabase
        .from('jobs')
        .update(dbUpdates)
        .eq('id', jobId);
      
      fetchJobs();
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  const handleQuoteClick = (jobId: string) => {
    // Extract numeric part of Job ID
    const numericId = jobId.replace(/\D/g, '');
    handleViewChange('pos');
    // We need to pass this ID to the POS view
    // Using a simple way via state or prop would be best
    // For now, let's update the POSView component to accept an initialJobId
    setInitialJobId(numericId);
  };

  const [initialJobId, setInitialJobId] = useState('');
  const [showAnalyticsHistory, setShowAnalyticsHistory] = useState(false);

  return (
    <div className="h-screen w-full flex justify-center items-center bg-black overflow-hidden font-sans">
      {/* Mobile Container */}
      <div className="relative w-full h-full max-w-md bg-[#2C2C2E] sm:rounded-[3rem] sm:h-[90vh] sm:border-[8px] sm:border-[#1c1c1e] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Background Gradients (Decorative) */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-yellow-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Header */}
        <header className="flex justify-between items-center p-6 z-10">
          <div>
            {(currentView === 'trash' || currentView === 'pending' || currentView === 'analytics') && (
              <button 
                onClick={() => {
                  if (currentView === 'analytics' && showAnalyticsHistory) {
                    setShowAnalyticsHistory(false);
                  } else {
                    handleViewChange(currentView === 'analytics' ? 'profile' : currentView === 'trash' ? 'pending' : 'profile');
                    if (currentView === 'analytics') setShowAnalyticsHistory(false);
                  }
                }}
                className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 transition text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div>
            {currentView === 'pending' && (
              <button 
                onClick={() => handleViewChange('trash')}
                className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 transition text-white"
              >
                <Trash className="w-4 h-4" />
              </button>
            )}
            {currentView === 'analytics' && (
              <button 
                onClick={() => setShowAnalyticsHistory(!showAnalyticsHistory)}
                className={`w-10 h-10 rounded-full glass-panel flex items-center justify-center transition ${showAnalyticsHistory ? 'bg-white text-black' : 'hover:bg-white/10 text-white'}`}
              >
                <History className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24 relative z-0">
          <AnimatePresence mode="wait">
            {currentView === 'profile' && (
              <ProfileView 
                key="profile" 
                user={user} 
                stats={stats} 
                jobs={jobs} 
                onUpdateJob={handleUpdateJob} 
                onLogout={handleLogout}
                onAnalyticsClick={() => handleViewChange('analytics')}
                onUpdateUser={handleUpdateUser}
              />
            )}
            {currentView === 'analytics' && (
              <AnalyticsView key="analytics" jobs={jobs} showHistory={showAnalyticsHistory} />
            )}
            {currentView === 'pos' && (
              <POSView key="pos" onProcessPayment={handleProcessPayment} initialJobId={initialJobId} />
            )}
            {currentView === 'pending' && (
              <PendingView 
                key="pending" 
                jobs={jobs} 
                onAddJob={handleAddJob} 
                onQuoteClick={handleQuoteClick}
                onUpdateJob={handleUpdateJob}
              />
            )}
            {currentView === 'trash' && (
              <TrashView key="trash" jobs={jobs} />
            )}
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-6 left-6 right-6 h-20 glass-panel rounded-3xl flex justify-around items-center px-2 z-20">
          <button 
            onClick={() => handleViewChange('profile')} 
            className={`relative flex flex-col items-center justify-center w-16 h-16 transition ${currentView === 'profile' ? 'text-[#FACC15]' : 'text-gray-400 hover:text-white'}`}
          >
            <User className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Profile</span>
            {currentView === 'profile' && (
              <motion.div layoutId="nav-indicator" className="absolute bottom-2 w-1 h-1 bg-[#FACC15] rounded-full" />
            )}
          </button>
          
          {/* Floating POS Button */}
          <div className="relative -top-8">
            <button 
              onClick={() => handleViewChange('pos')} 
              className="w-16 h-16 rounded-2xl bg-[#FACC15] text-black flex items-center justify-center shadow-lg shadow-yellow-400/20 transform transition hover:scale-105 active:scale-95"
            >
              <DollarSign className="w-6 h-6 font-bold" />
            </button>
            <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] font-medium text-gray-400">Quote</span>
          </div>

          <button 
            onClick={() => handleViewChange('pending')} 
            className={`relative flex flex-col items-center justify-center w-16 h-16 transition ${currentView === 'pending' ? 'text-[#FACC15]' : 'text-gray-400 hover:text-white'}`}
          >
            <div className="relative">
              <Clock className="w-5 h-5 mb-1" />
              {jobs.filter(j => j.status === 'Scheduled' || j.status === 'Pending Approval').length > 0 && (
                <span className="absolute -top-1 -right-2 flex h-3 w-3 items-center justify-center rounded-full bg-[#FACC14] text-[8px] font-bold text-black ring-2 ring-[#FACC14]">
                  {jobs.filter(j => j.status === 'Scheduled' || j.status === 'Pending Approval').length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Pending</span>
            {currentView === 'pending' && (
              <motion.div layoutId="nav-indicator" className="absolute bottom-2 w-1 h-1 bg-[#FACC15] rounded-full" />
            )}
          </button>
        </nav>
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingView(null);
        }}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
