import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Lock } from 'lucide-react';

interface AuthPageProps {
  onSuccess: (name: string, role: string, avatar?: string) => void;
}

export const AuthPage = ({ onSuccess }: AuthPageProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const normalizedPin = pin.trim();
    
    if (normalizedPin === '1111') {
      onSuccess('Edgar', 'Dent Repair Expert', 'https://i.pravatar.cc/150?img=11');
    } else if (normalizedPin === '1212') {
      onSuccess('AAA Capital', 'Company Admin');
    } else {
      setError('Invalid PIN');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <div className="h-screen w-full flex justify-center items-center bg-black overflow-hidden font-sans">
      <div className="relative w-full h-full max-w-md bg-[#2C2C2E] sm:rounded-[3rem] sm:h-[90vh] sm:border-[8px] sm:border-[#1c1c1e] shadow-2xl overflow-hidden flex flex-col justify-center px-6">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-yellow-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-[#1C1C1E] border border-white/10 rounded-3xl p-6 shadow-2xl"
        >
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Please enter your PIN to continue</p>
          </div>

          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-500" />
              </div>
              <input 
                type="password" 
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPin(val);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder="PIN" 
                className={`w-full bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-2xl pl-12 pr-4 py-4 text-white text-center text-2xl placeholder:text-gray-600 focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all font-medium tracking-[0.5em]`}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
            )}
          </div>

          <button 
            onClick={handleConfirm}
            disabled={pin.length < 4}
            className="w-full py-4 rounded-xl text-base font-bold bg-[#FACC15] text-black hover:bg-yellow-400 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-5 h-5" />
            Verify PIN
          </button>
        </motion.div>
      </div>
    </div>
  );
};
