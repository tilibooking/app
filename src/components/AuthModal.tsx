import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Lock, Delete } from 'lucide-react';

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

  const handleConfirm = (currentPin: string) => {
    const normalizedPin = currentPin.trim();
    
    if (normalizedPin === '1111') {
      onSuccess('Edgar', 'Dent Repair Expert');
      onClose();
    } else if (normalizedPin === '1212') {
      onSuccess('AAA Capital', 'Company Admin');
      onClose();
    } else {
      setError('Invalid PIN');
      setPin('');
    }
  };

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');
      
      if (newPin.length === 4) {
        // Auto-submit when 4 digits are entered
        setTimeout(() => handleConfirm(newPin), 150);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setError('');
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-0 bottom-0 md:inset-x-auto md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[380px] bg-[#1C1C1E] border-t md:border border-white/10 rounded-t-3xl md:rounded-3xl p-6 z-50 shadow-2xl flex flex-col items-center"
          >
            <div className="w-full flex justify-end mb-2">
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-yellow-400" />
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-2">Enter PIN</h2>
            <p className="text-sm text-gray-400 mb-8 text-center">Please enter your 4-digit PIN to continue</p>

            {/* PIN Display */}
            <div className="flex gap-4 mb-8">
              {[0, 1, 2, 3].map((index) => (
                <div 
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index < pin.length 
                      ? 'bg-yellow-400 scale-110 shadow-[0_0_10px_rgba(250,204,21,0.5)]' 
                      : 'bg-white/10'
                  } ${error ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''}`}
                />
              ))}
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mb-6"
              >
                {error}
              </motion.p>
            )}

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-[280px] mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num.toString())}
                  className="w-full aspect-square rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 flex items-center justify-center text-2xl font-medium text-white transition-colors"
                >
                  {num}
                </button>
              ))}
              <div className="w-full aspect-square"></div>
              <button
                onClick={() => handleNumberClick('0')}
                className="w-full aspect-square rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 flex items-center justify-center text-2xl font-medium text-white transition-colors"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                className="w-full aspect-square rounded-full hover:bg-white/5 active:bg-white/10 flex items-center justify-center text-gray-400 transition-colors"
              >
                <Delete className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
