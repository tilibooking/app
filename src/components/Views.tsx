import { 
  ChevronLeft, 
  BarChart2, 
  Sliders, 
  Plus, 
  User, 
  DollarSign, 
  Settings, 
  Pen, 
  ChevronDown, 
  ChevronUp,
  Briefcase, 
  CreditCard, 
  ArrowRight, 
  Loader2, 
  Check,
  Clock,
  Search,
  Trash,
  LogOut,
  History,
  Camera,
  Image as ImageIcon,
  Building2
} from 'lucide-react';
import { useState, FC, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Job, Stats, User as UserType } from '../types';
import { DateTimePicker } from './DateTimePicker';
import { TipModal } from './TipModal';

import { DateFilterModal, DateRange } from './DateFilterModal';

export const calculateCommission = (labourCost: number) => {
  if (labourCost < 300) return 100;
  if (labourCost < 700) return 200;
  if (labourCost < 1000) return 300;
  if (labourCost < 2000) return 400;
  return 500;
};

export const calculateTotalPrice = (labourCost: number) => {
  return labourCost + calculateCommission(labourCost);
};

interface ProfileViewProps {
  user: UserType;
  stats: Stats;
  jobs: Job[];
  onUpdateJob: (jobId: string, updates: Partial<Job>) => void;
  onLogout: () => void;
  onAnalyticsClick: () => void;
  onUpdateUser: (updates: Partial<UserType>) => void;
}

export const ProfileView: FC<ProfileViewProps> = ({ user, stats, jobs, onUpdateJob, onLogout, onAnalyticsClick, onUpdateUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [tipInput, setTipInput] = useState('');
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ avatar: reader.result as string });
        setIsPhotoModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay()); // Sunday
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Saturday
    end.setHours(23, 59, 59, 999);
    
    return { start, end, type: 'week' };
  });

  const formatDateRange = (range: DateRange) => {
    if (range.type === 'day') {
      return range.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    }
    if (range.type === 'month') {
      return range.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return `${range.start.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })} - ${range.end.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}`;
  };

  const isJobInDateRange = (job: Job) => {
    let jobDate = new Date();
    if (job.date !== "Just now") {
      // Append current year if missing, assuming format "MMM DD" or similar
      // But job.date format in Views.tsx seems to be "Just now" or potentially others.
      // Let's assume standard date string parsing works or it's "Just now"
      const parsedDate = new Date(job.date);
      if (!isNaN(parsedDate.getTime())) {
        jobDate = parsedDate;
      }
      // If parsing fails, we default to 'now' which might be wrong if we have old data strings.
      // For this demo, "Just now" is the main one.
    }
    return jobDate >= dateRange.start && jobDate <= dateRange.end;
  };

  const jobsInDateRange = jobs.filter(isJobInDateRange);

  // Calculate Revenue: Sum of all completed jobs in range
  const calculatedRevenue = jobsInDateRange
    .filter(job => job.status === 'Completed')
    .reduce((sum, job) => sum + job.amount, 0);

  // Tips: Sum of tips from completed jobs in range
  const tips = jobsInDateRange
    .filter(job => job.status === 'Completed')
    .reduce((sum, job) => sum + (job.tip || 0), 0);

  // 2.9% Fee is 2.9% of (Revenue + Tips)
  const calculatedFee = (calculatedRevenue + tips) * 0.029;

  // Weekly Net Earnings = (Revenue + Tips) - 2.9% Fee
  const netAmount = (calculatedRevenue + tips) - calculatedFee;
  
  const formatCurrency = (val: number) => 
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const formatCurrencyParts = (val: number) => {
    const formatted = val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    // Handle cases where there might not be cents (though currency usually has them)
    if (formatted.includes('.')) {
      const [integer, fraction] = formatted.split('.');
      return { integer, fraction };
    }
    return { integer: formatted, fraction: '00' };
  };

  const netAmountParts = formatCurrencyParts(netAmount);

  const filteredJobs = jobsInDateRange.filter(job => 
    job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6 pb-16"
    >
      {/* User Info - Card styling removed */}
      <div className="flex items-center gap-4 px-2">
        <div className="relative">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-green-500" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-green-500 flex items-center justify-center text-2xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <button 
            onClick={() => setIsPhotoModalOpen(true)}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#2C2C2E] border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition"
          >
            <Pen className="w-3 h-3 text-gray-400" />
          </button>
        </div>
        <div>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-400 text-sm">{user.role}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {user.name === 'AAA Capital' && (
            <button 
              onClick={onAnalyticsClick}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
            >
              <Building2 className="w-6 h-6 text-gray-400" />
            </button>
          )}
          <button 
            onClick={onLogout}
            className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition"
          >
            <LogOut className="w-6 h-6 text-red-500" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search jobs..." 
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-white/20 placeholder:text-gray-500"
        />
      </div>

      {searchQuery ? (
        /* Search Results */
        <div>
          <h3 className="text-lg font-medium mb-4">Search Results</h3>
          <div className="space-y-3">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <div key={job.id} className="glass-card p-4 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-yellow-400 transition">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{job.id}</p>
                      <p className="text-xs text-gray-400">{job.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(calculateTotalPrice(job.amount))}</p>
                    <p className={`text-[10px] ${
                      job.status === 'Completed' ? 'text-green-400' : 
                      job.status === 'Removed' ? 'text-red-400' : 
                      'text-yellow-400'
                    }`}>{job.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 text-sm py-4">No jobs found</p>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Earnings Summary */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Weekly Net Earnings</p>
                <div className="flex items-start">
                  <h1 className="text-4xl font-bold text-white tracking-tight">{netAmountParts.integer}</h1>
                  <span className="text-lg font-bold text-white mt-1 ml-0.5">.{netAmountParts.fraction}</span>
                </div>
              </div>
              <div 
                onClick={() => setIsDateFilterOpen(true)}
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 flex items-center gap-2 cursor-pointer hover:bg-white/10 transition"
              >
                <span>{formatDateRange(dateRange)}</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="glass-card p-3 rounded-2xl text-center border-[#32AE64]/30 bg-[#32AE64]/5">
                <p className="text-xs text-[#32AE64] mb-1">Revenue</p>
                <p className="font-semibold text-lg text-[#32AE64]">{calculatedRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</p>
              </div>
              <div className="glass-card p-3 rounded-2xl text-center border-yellow-500/30 bg-yellow-500/5">
                <p className="text-xs text-yellow-500 mb-1">Tips</p>
                <p className="font-semibold text-lg text-yellow-400">{formatCurrency(tips)}</p>
              </div>
              <div className="glass-card p-3 rounded-2xl text-center border-[#FF6367]/30 bg-[#FF6367]/5">
                <p className="text-xs text-[#FF6367] mb-1">2.9% Fee</p>
                <p className="font-semibold text-lg text-[#FF6367]">{formatCurrency(calculatedFee)}</p>
              </div>
            </div>

            {/* Visual Breakdown Bar */}
            <div className="glass-card p-4 rounded-2xl mb-6">
              <div className="flex justify-between text-[13px] mb-2">
                <span className="text-gray-400">Payment breakdown</span>
              </div>
              {(() => {
                const total = calculatedRevenue + tips + calculatedFee;
                const revenuePercent = total > 0 ? (calculatedRevenue / total) * 100 : 0;
                const tipsPercent = total > 0 ? (tips / total) * 100 : 0;
                const feesPercent = total > 0 ? (calculatedFee / total) * 100 : 0;
                
                return (
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden flex">
                    <div className="h-full bg-[#32AE64]" style={{ width: `${revenuePercent}%` }}></div>
                    <div className="h-full bg-yellow-400" style={{ width: `${tipsPercent}%` }}></div>
                    <div className="h-full bg-[#FF6367]" style={{ width: `${feesPercent}%` }}></div>
                  </div>
                );
              })()}
              <div className="flex justify-between mt-2 text-[11px] text-gray-500">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#32AE64]"></div> Revenue</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Tips</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FF6367]"></div> Fees</span>
              </div>
            </div>
          </div>

          {/* Pending Jobs */}
          <div>
            <h3 className="text-lg font-medium mb-4">Pending Jobs</h3>
            <div className="space-y-3">
              {jobs.filter(job => job.status === 'Scheduled' || job.status === 'Pending Approval').map(job => (
                <div key={job.id} className="glass-card p-4 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-yellow-400 transition">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{job.id}</p>
                      <p className="text-xs text-gray-400">{job.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {job.status !== 'Pending Approval' && (
                      <p className="font-semibold text-sm">{formatCurrency(calculateTotalPrice(job.amount))}</p>
                    )}
                    <p className="text-[10px] text-yellow-400">{job.status}</p>
                  </div>
                </div>
              ))}
              {jobs.filter(job => job.status === 'Scheduled' || job.status === 'Pending Approval').length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">No pending jobs</p>
              )}
            </div>
          </div>

          {/* Job History */}
          <div>
            <h3 className="text-lg font-medium mb-4">Job History</h3>
            <div className="space-y-3">
              {jobsInDateRange.filter(job => job.status === 'Completed').map(job => (
                <div 
                  key={job.id} 
                  onClick={() => {
                    if (expandedJobId === job.id) {
                      setExpandedJobId(null);
                    } else {
                      setExpandedJobId(job.id);
                      setTipInput(job.tip ? job.tip.toString() : '');
                    }
                  }}
                  className={`glass-card rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
                    expandedJobId === job.id ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-yellow-400 transition">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{job.id}</p>
                        <p className="text-xs text-gray-400">{job.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(calculateTotalPrice(job.amount))}</p>
                      <p className={`text-[10px] ${job.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {job.status}
                        {job.tip ? ` + ${formatCurrency(job.tip)} tip` : ''}
                      </p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedJobId === job.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 pt-0 border-t border-white/5"
                      >
                        <div 
                          className="pt-4 flex items-end gap-3" 
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="flex-1">
                            <label className="text-xs text-gray-400 mb-1 block">Add Tip</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                              <input
                                type="number"
                                value={tipInput}
                                onChange={(e) => setTipInput(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-6 pr-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400/50 placeholder:text-gray-600"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const tip = parseFloat(tipInput);
                              if (!isNaN(tip)) {
                                onUpdateJob(job.id, { tip });
                                setExpandedJobId(null);
                              }
                            }}
                            className="bg-[#FACC15] text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-yellow-400 transition h-[38px]"
                          >
                            Save
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <DateFilterModal 
        isOpen={isDateFilterOpen} 
        onClose={() => setIsDateFilterOpen(false)} 
        onSelect={setDateRange}
        initialRange={dateRange}
      />

      {/* Photo Upload Modal */}
      <AnimatePresence>
        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPhotoModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-[#1C1C1E] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border-t border-white/10"
            >
              <div className="p-6 space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Change Profile Photo</h3>
                  <p className="text-sm text-gray-400">Choose a new photo for your profile</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full py-4 bg-white/10 hover:bg-white/15 rounded-2xl text-white font-medium transition flex items-center justify-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <Camera className="w-4 h-4" />
                    </div>
                    Take Selfie
                  </button>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 bg-white/10 hover:bg-white/15 rounded-2xl text-white font-medium transition flex items-center justify-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    Upload from Device
                  </button>
                </div>

                <button
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="w-full py-4 mt-2 bg-transparent hover:bg-white/5 rounded-2xl text-gray-400 font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="user"
        className="hidden"
      />
    </motion.div>
  );
}

interface POSViewProps {
  onProcessPayment: (amount: number, jobId: string) => Promise<void>;
  initialJobId?: string;
}

export const POSView: FC<POSViewProps> = ({ onProcessPayment, initialJobId = '' }) => {
  const [amount, setAmount] = useState('');
  const [customerPrice, setCustomerPrice] = useState('');
  const [jobId, setJobId] = useState(initialJobId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  const handleLabourCostChange = (value: string) => {
    setAmount(value);
    if (!value) {
      setCustomerPrice('');
      return;
    }
    const cost = parseFloat(value);
    if (!isNaN(cost)) {
      const commission = calculateCommission(cost);
      setCustomerPrice((cost + commission).toString());
    }
  };

  const handleCustomerPriceChange = (value: string) => {
    setCustomerPrice(value);
    if (!value) {
      setAmount('');
      return;
    }
    const price = parseFloat(value);
    if (!isNaN(price)) {
      // Reverse calculation logic based on price ranges
      // Price = Cost + Commission
      // Cost = Price - Commission
      // We determine commission based on the resulting Cost falling into the correct bracket
      
      let estimatedCost;
      
      // Check ranges from highest to lowest to find the first valid match
      // Range > 2000 (Commission 500) -> Price > 2500
      if (price >= 2500) {
        estimatedCost = price - 500;
      }
      // Range 1000-1999 (Commission 400) -> Price 1400-2399
      else if (price >= 1400) {
        estimatedCost = price - 400;
      }
      // Range 700-999 (Commission 300) -> Price 1000-1299
      else if (price >= 1000) {
        estimatedCost = price - 300;
      }
      // Range 300-699 (Commission 200) -> Price 500-899
      else if (price >= 500) {
        estimatedCost = price - 200;
      }
      // Range < 300 (Commission 100) -> Price < 400
      else {
        estimatedCost = price - 100;
      }
      
      setAmount(estimatedCost.toString());
    }
  };

  const handleProcess = async () => {
    if (!jobId || jobId.length !== 4) {
      alert("Please enter a valid 4-digit Job ID");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);
    const finalJobId = `JOB ID ${jobId}`;
    
    await onProcessPayment(parseFloat(amount), finalJobId);
    
    setIsProcessing(false);
    setIsSuccess(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col pb-6"
    >
      {/* Input Form */}
      <div className="space-y-4">
        
        {/* Job Details Section */}
        <div className="glass-card p-6 rounded-3xl space-y-6 border border-white/10 overflow-hidden relative">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          {/* Job ID Input */}
          <div className="space-y-2 relative z-10">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Job Reference</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none gap-2">
                <Briefcase className="w-4 h-4 text-white group-focus-within:text-yellow-400 transition-colors" />
                <span className="text-white font-bold pt-0.5">JOB</span>
              </div>
              <input 
                type="text" 
                inputMode="numeric"
                maxLength={4}
                value={jobId}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setJobId(val);
                }}
                placeholder="0000" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-20 pr-4 py-3 text-white placeholder:text-[#99A1AF] focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all font-medium placeholder:font-bold"
              />
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div className="bg-black/20 rounded-2xl p-4 space-y-4 border border-white/5 relative z-10">
            {/* Labour Cost Row */}
            <div className="flex justify-between items-center group">
              <label className="text-sm text-gray-400 font-medium group-focus-within:text-white transition-colors">Labour Cost</label>
              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => handleLabourCostChange(e.target.value)}
                  placeholder="0" 
                  className="w-full bg-transparent border-b border-white/10 py-2 pl-7 pr-2 text-right font-mono text-lg text-white focus:outline-none focus:border-yellow-400 transition-colors placeholder:text-gray-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* Commission Row */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400 font-medium">Commission</label>
                <div className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-gray-500 border border-white/5">Auto</div>
              </div>
              <div className="font-mono text-base text-gray-500 pr-2">
                + ${amount && customerPrice && !isNaN(parseFloat(amount)) && !isNaN(parseFloat(customerPrice)) ? Math.round(parseFloat(customerPrice) - parseFloat(amount)).toString() : '0'}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 my-1"></div>

            {/* Total Row */}
            <div className="flex justify-between items-center pt-2">
              <label className="text-sm font-bold text-[#32AE64] uppercase tracking-wide">Total Price</label>
              <div className="relative w-40">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#32AE64] font-bold">$</span>
                <input 
                  type="number" 
                  value={customerPrice}
                  onChange={(e) => handleCustomerPriceChange(e.target.value)}
                  placeholder="0" 
                  className="w-full bg-[#32AE64]/10 border border-[#32AE64]/20 rounded-xl py-3 pl-7 pr-4 text-right font-mono text-xl font-bold text-[#32AE64] focus:outline-none focus:border-[#32AE64]/50 transition-all placeholder:text-[#32AE64]/30 shadow-[0_0_15px_rgba(50,174,100,0.1)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleProcess}
          disabled={isProcessing || isSuccess}
          className={`w-full font-bold py-4 rounded-2xl shadow-lg transition transform active:scale-95 mt-4 flex items-center justify-center gap-2 ${
            isSuccess 
              ? 'bg-green-500 text-white' 
              : 'bg-[#FACC15] hover:bg-yellow-400 text-black shadow-yellow-400/20'
          } ${isProcessing ? 'opacity-80 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : isSuccess ? (
            <>
              <Check className="w-5 h-5" />
              <span>Success!</span>
            </>
          ) : (
            <>
              <span>Save Quote</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Commission Guide Section */}
        <div className="overflow-hidden rounded-xl border border-white/10">
          <button 
            onClick={() => setIsTableExpanded(!isTableExpanded)}
            className="w-full flex items-center justify-between p-4 bg-white/5 text-gray-400 text-xs uppercase font-medium hover:bg-white/10 transition"
          >
            <span>Commission Fee Guide</span>
            {isTableExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <AnimatePresence>
            {isTableExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <table className="w-full text-sm text-left border-t border-white/5">
                  <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 font-medium">Range</th>
                      <th className="px-4 py-3 font-medium text-right">Commission Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr className="hover:bg-white/5 transition">
                      <td className="px-4 py-3 text-gray-300">Less than $299</td>
                      <td className="px-4 py-3 text-right font-medium text-yellow-400">+$100</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition">
                      <td className="px-4 py-3 text-gray-300">$300 – $699</td>
                      <td className="px-4 py-3 text-right font-medium text-yellow-400">+$200</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition">
                      <td className="px-4 py-3 text-gray-300">$700 – $999</td>
                      <td className="px-4 py-3 text-right font-medium text-yellow-400">+$300</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition">
                      <td className="px-4 py-3 text-gray-300">$1000 – $1999</td>
                      <td className="px-4 py-3 text-right font-medium text-yellow-400">+$400</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition">
                      <td className="px-4 py-3 text-gray-300">More than $2000</td>
                      <td className="px-4 py-3 text-right font-medium text-yellow-400">+$500</td>
                    </tr>
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

interface PendingViewProps {
  jobs: Job[];
  onAddJob: (jobId: string) => void;
  onQuoteClick: (jobId: string) => void;
  onUpdateJob: (jobId: string, updates: Partial<Job>) => void;
}

export const PendingView: FC<PendingViewProps> = ({ jobs, onAddJob, onQuoteClick, onUpdateJob }) => {
  const [activeTab, setActiveTab] = useState<'scheduled' | 'approval'>('scheduled');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [newJobId, setNewJobId] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [jobToComplete, setJobToComplete] = useState<string | null>(null);

  const formatCurrency = (val: number) => 
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const handleAddJob = () => {
    if (newJobId.trim()) {
      onAddJob(newJobId);
      setNewJobId('');
    }
  };

  const handleDateSelect = (date: Date) => {
    if (expandedJobId) {
      const formattedDate = date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
      
      onUpdateJob(expandedJobId, { date: formattedDate });
      setIsDatePickerOpen(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'scheduled') return job.status === 'Scheduled';
    if (activeTab === 'approval') return job.status === 'Pending Approval';
    return false;
  });

  const scheduledCount = jobs.filter(j => j.status === 'Scheduled').length;
  const approvalCount = jobs.filter(j => j.status === 'Pending Approval').length;

  const isToday = (dateString: string) => {
    if (dateString === 'Date still pending') return false;
    const today = new Date();
    // The date format is like "Mon, Mar 1, 12:00 PM"
    // We need to check if it's today. A simple way is to check if it contains today's month and day.
    const month = today.toLocaleString('en-US', { month: 'short' });
    const day = today.getDate();
    return dateString.includes(`${month} ${day},`) || dateString.includes(`${month} ${day} `);
  };

  const todayJobs = filteredJobs.filter(job => isToday(job.date));
  const upcomingJobs = filteredJobs.filter(job => !isToday(job.date));

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      <div className="flex p-1 bg-white/10 rounded-xl mb-6">
        <button
          onClick={() => {
            setActiveTab('scheduled');
            setExpandedJobId(null);
          }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'scheduled' 
              ? 'bg-white text-black shadow-lg' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="relative inline-block">
            Job Scheduled
            {scheduledCount > 0 && (
              <span className="absolute -top-1 -right-4 flex h-3 w-3 items-center justify-center rounded-full bg-[#FACC14] text-[8px] font-bold text-black ring-2 ring-[#FACC14]">
                {scheduledCount}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => {
            setActiveTab('approval');
            setExpandedJobId(null);
          }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'approval' 
              ? 'bg-white text-black shadow-lg' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="relative inline-block">
            Pending Approval
            {approvalCount > 0 && (
              <span className="absolute -top-1 -right-4 flex h-3 w-3 items-center justify-center rounded-full bg-[#FACC14] text-[8px] font-bold text-black ring-2 ring-[#FACC14]">
                {approvalCount}
              </span>
            )}
          </div>
        </button>
      </div>

      {activeTab === 'approval' && (
        <div className="mb-4 flex gap-2">
          <div className="flex-1 glass-input rounded-xl px-3 py-3 flex items-center gap-2">
            <span className="text-sm font-bold text-gray-400 whitespace-nowrap">JOB ID</span>
            <input 
              type="number" 
              value={newJobId}
              onChange={(e) => {
                if (e.target.value.length <= 4) {
                  setNewJobId(e.target.value);
                }
              }}
              placeholder="0000" 
              className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 w-full outline-none placeholder:text-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <button
            onClick={handleAddJob}
            disabled={!newJobId.trim()}
            className="bg-[#FACC15] text-black font-medium rounded-xl px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-400 transition"
          >
            Add
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {filteredJobs.length > 0 ? (
          <div className="space-y-6">
            {activeTab === 'scheduled' ? (
              <>
                {todayJobs.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Today</h3>
                    <div className="space-y-3">
                      {todayJobs.map(job => (
                        <div 
                          key={job.id} 
                          onClick={() => {
                            setExpandedJobId(expandedJobId === job.id ? null : job.id);
                          }}
                          className={`glass-card rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
                            expandedJobId === job.id ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/10'
                          }`}
                        >
                          <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-yellow-400 transition">
                                <Briefcase className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{job.id}</p>
                                <p className="text-xs text-gray-400">{job.date}</p>
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-2">
                              <div className="text-right">
                                <p className="font-semibold text-sm">{formatCurrency(calculateTotalPrice(job.amount))}</p>
                                <p className="text-[10px] text-yellow-400">
                                  {job.date === 'Date still pending' ? 'Quote Accepted' : job.status}
                                </p>
                              </div>
                            </div>
                          </div>

                          <AnimatePresence>
                            {expandedJobId === job.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="px-4 pb-4 pt-0 space-y-2 border-t border-white/5 mt-2"
                              >
                                <div className="pt-4 pb-2 px-2 space-y-2">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Labor Cost</span>
                                    <span className="font-medium text-white">{formatCurrency(job.amount)}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Commission</span>
                                    <span className="font-medium text-yellow-400">{formatCurrency(calculateCommission(job.amount))}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onQuoteClick(job.id);
                                    }}
                                    className="bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-3 rounded-xl transition"
                                  >
                                    Change Quote
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsDatePickerOpen(true);
                                    }}
                                    className="bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-3 rounded-xl transition"
                                  >
                                    Change Date
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const now = new Date();
                                      const formattedDate = now.toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        hour12: true
                                      });
                                      onUpdateJob(job.id, { status: 'Removed', removedAt: formattedDate });
                                    }}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium py-3 rounded-xl transition"
                                  >
                                    Remove Job
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setJobToComplete(job.id);
                                      setIsTipModalOpen(true);
                                    }}
                                    className="bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-medium py-3 rounded-xl transition"
                                  >
                                    Job Completed
                                  </button>
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedJobId(null);
                                  }}
                                  className="w-full text-center text-[10px] text-gray-500 hover:text-gray-300 py-2 transition"
                                >
                                  Close details
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {upcomingJobs.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Upcoming</h3>
                    <div className="space-y-3">
                      {upcomingJobs.map(job => (
                        <div 
                          key={job.id} 
                          onClick={() => {
                            setExpandedJobId(expandedJobId === job.id ? null : job.id);
                          }}
                          className={`glass-card rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
                            expandedJobId === job.id ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/10'
                          }`}
                        >
                          <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-yellow-400 transition">
                                <Briefcase className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{job.id}</p>
                                <p className="text-xs text-gray-400">{job.date}</p>
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-2">
                              <div className="text-right">
                                <p className="font-semibold text-sm">{formatCurrency(calculateTotalPrice(job.amount))}</p>
                                <p className="text-[10px] text-yellow-400">
                                  {job.date === 'Date still pending' ? 'Quote Accepted' : job.status}
                                </p>
                              </div>
                            </div>
                          </div>

                          <AnimatePresence>
                            {expandedJobId === job.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="px-4 pb-4 pt-0 space-y-2 border-t border-white/5 mt-2"
                              >
                                <div className="pt-4 pb-2 px-2 space-y-2">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Labor Cost</span>
                                    <span className="font-medium text-white">{formatCurrency(job.amount)}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Commission</span>
                                    <span className="font-medium text-yellow-400">{formatCurrency(calculateCommission(job.amount))}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onQuoteClick(job.id);
                                    }}
                                    className="bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-3 rounded-xl transition"
                                  >
                                    Change Quote
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsDatePickerOpen(true);
                                    }}
                                    className="bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-3 rounded-xl transition"
                                  >
                                    Change Date
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const now = new Date();
                                      const formattedDate = now.toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        hour12: true
                                      });
                                      onUpdateJob(job.id, { status: 'Removed', removedAt: formattedDate });
                                    }}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium py-3 rounded-xl transition"
                                  >
                                    Remove Job
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setJobToComplete(job.id);
                                      setIsTipModalOpen(true);
                                    }}
                                    className="bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-medium py-3 rounded-xl transition"
                                  >
                                    Job Completed
                                  </button>
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedJobId(null);
                                  }}
                                  className="w-full text-center text-[10px] text-gray-500 hover:text-gray-300 py-2 transition"
                                >
                                  Close details
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map(job => (
                  <div 
                    key={job.id} 
                    className="glass-card rounded-2xl transition-all duration-300 overflow-hidden hover:bg-white/10"
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-yellow-400 transition">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{job.id}</p>
                          <p className="text-xs text-gray-400">{job.date}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuoteClick(job.id);
                          }}
                          className="bg-[#FACC15] text-black text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-yellow-400/20 hover:bg-yellow-400 transition"
                        >
                          Quote
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const now = new Date();
                            const formattedDate = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
                            onUpdateJob(job.id, { status: 'Removed', removedAt: formattedDate });
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{activeTab === 'scheduled' ? 'No scheduled jobs' : 'No pending approvals'}</p>
            </div>
          </div>
        )}
      </div>

      <DateTimePicker 
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelect={handleDateSelect}
      />
      
      <TipModal
        isOpen={isTipModalOpen}
        onClose={() => {
          setIsTipModalOpen(false);
          setJobToComplete(null);
        }}
        onConfirm={(tip) => {
          if (jobToComplete) {
            onUpdateJob(jobToComplete, { status: 'Completed', tip });
            setJobToComplete(null);
          }
        }}
      />
    </motion.div>
  );
}

export const AnalyticsView: FC<{ jobs: Job[]; showHistory: boolean }> = ({ jobs, showHistory }) => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'jobSetup' | 'users'>('analytics');

  // Mock users for analytics (since we don't have multi-user support in DB yet)
  // In a real app, we would group jobs by user_id
  const users = [
    { name: 'Edgar', role: 'Dent Repair Expert', jobs: jobs }, // Assign all current jobs to Edgar
    { name: 'Alejandro', role: 'Mechanic', jobs: [] }, // Dummy user
  ];

  const calculateStats = (userJobs: Job[]) => {
    const revenue = userJobs
      .filter(job => job.status === 'Completed')
      .reduce((sum, job) => sum + job.amount, 0);
      
    const tips = userJobs
      .filter(job => job.status === 'Completed')
      .reduce((sum, job) => sum + (job.tip || 0), 0);
      
    const fees = (revenue + tips) * 0.029;
    const net = (revenue + tips) - fees;
    
    return { revenue, tips, fees, net };
  };

  const formatCurrency = (val: number) => 
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  // Get all completed jobs with user info attached
  const allCompletedJobs = users.flatMap(user => 
    user.jobs
      .filter(job => job.status === 'Completed')
      .map(job => ({ ...job, userName: user.name }))
  );

  const filteredHistory = selectedUser 
    ? allCompletedJobs.filter(job => job.userName === selectedUser)
    : allCompletedJobs;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full space-y-6 pb-24"
    >
      <div className="flex p-1 bg-white/10 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'analytics' 
              ? 'bg-white text-black shadow-lg' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('jobSetup')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'jobSetup' 
              ? 'bg-white text-black shadow-lg' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Job Setup
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'users' 
              ? 'bg-white text-black shadow-lg' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Users
        </button>
      </div>

      {activeTab === 'analytics' && (
        <>
          <div className="flex items-center justify-between px-2 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Team Analytics</h2>
                <p className="text-xs text-gray-400">Performance breakdown by technician</p>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {showHistory ? (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* User Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              <button
                onClick={() => setSelectedUser(null)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition whitespace-nowrap ${
                  selectedUser === null 
                    ? 'bg-white text-black' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                All Users
              </button>
              {users.map(user => (
                <button
                  key={user.name}
                  onClick={() => setSelectedUser(user.name)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition whitespace-nowrap ${
                    selectedUser === user.name 
                      ? 'bg-white text-black' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {user.name}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((job, index) => (
                  <div key={`${job.id}-${index}`} className="glass-card p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-white">{job.id}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-400">{job.date}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300">{job.userName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-white">{formatCurrency(calculateTotalPrice(job.amount))}</p>
                      {job.tip && job.tip > 0 && (
                        <p className="text-[10px] text-yellow-400 flex items-center justify-end gap-1">
                          <span className="w-1 h-1 rounded-full bg-yellow-400"></span>
                          +{formatCurrency(job.tip)} tip
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No completed jobs found</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {users.map((user, index) => {
              const stats = calculateStats(user.jobs);
              
              return (
                <div key={index} className="glass-card p-5 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold text-white border border-white/10">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{user.name}</h3>
                      <p className="text-xs text-gray-400">{user.role}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Net Earnings</p>
                      <p className="text-lg font-bold text-white">{formatCurrency(stats.net)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/5 rounded-2xl p-3 text-center">
                      <p className="text-[10px] text-gray-400 mb-1">Revenue</p>
                      <p className="font-semibold text-sm text-[#32AE64]">{formatCurrency(stats.revenue)}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 text-center">
                      <p className="text-[10px] text-gray-400 mb-1">Tips</p>
                      <p className="font-semibold text-sm text-yellow-400">{formatCurrency(stats.tips)}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 text-center">
                      <p className="text-[10px] text-gray-400 mb-1">Fees</p>
                      <p className="font-semibold text-sm text-red-400">{formatCurrency(stats.fees)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}

      {activeTab === 'jobSetup' && (
        <div className="text-center py-12 text-gray-500">
          <p>Job Setup coming soon</p>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="text-center py-12 text-gray-500">
          <p>Users coming soon</p>
        </div>
      )}
    </motion.div>
  );
};

export const TrashView: FC<{ jobs: Job[] }> = ({ jobs }) => {
  const removedJobs = jobs.filter(job => job.status === 'Removed');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
          <Trash className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-white">Trash Bin</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
        {removedJobs.length > 0 ? (
          removedJobs.map(job => (
            <div key={job.id} className="glass-card rounded-2xl p-4 flex items-center justify-between border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-300 line-through">{job.id}</p>
                  <p className="text-xs text-red-400">Removed: {job.removedAt || 'Unknown date'}</p>
                </div>
              </div>
              <div className="text-right">
                {job.amount === 0 ? (
                  <p className="font-semibold text-sm text-gray-500 line-through">To Be Quoted</p>
                ) : (
                  <p className="font-semibold text-sm text-gray-500 line-through">${calculateTotalPrice(job.amount)}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Trash className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Trash is empty</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
