import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name: string, role: string) => void;
}

export const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const normalizedPin = pin.trim();
    
    if (normalizedPin === '1111') {
      onSuccess('Edgar', 'Dent Repair Expert');
      onClose();
    } else if (normalizedPin === '1212') {
      onSuccess('AAA Capital', 'Company Admin');
      onClose();
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
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[30%] md:w-[360px] md:mx-auto bg-[#1C1C1E] border border-white/10 rounded-3xl p-6 z-50 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Authentication Required</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-6">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">Enter PIN</label>
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
                    // Only allow numbers
                    const val = e.target.value.replace(/\D/g, '');
                    setPin(val);
                    setError('');
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="PIN" 
                  className={`w-full bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-2xl pl-12 pr-4 py-4 text-white text-lg placeholder:text-gray-600 focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all font-medium tracking-widest`}
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-red-400 text-xs mt-2 ml-1">{error}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition border border-white/5"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm}
                disabled={pin.length < 4}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-[#FACC15] text-black hover:bg-yellow-400 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Verify
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
