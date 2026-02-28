import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, DollarSign } from 'lucide-react';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tip: number) => void;
}

export const TipModal = ({ isOpen, onClose, onConfirm }: TipModalProps) => {
  const [tip, setTip] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTip('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const tipAmount = parseFloat(tip);
    onConfirm(isNaN(tipAmount) ? 0 : tipAmount);
    onClose();
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
              <h2 className="text-lg font-semibold text-white">Add Tip?</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-6">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">Tip Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                </div>
                <input 
                  type="number" 
                  value={tip}
                  onChange={(e) => setTip(e.target.value)}
                  placeholder="0.00" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-xl placeholder:text-gray-600 focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  onConfirm(0);
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition border border-white/5"
              >
                No Tip
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-[#FACC15] text-black hover:bg-yellow-400 transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirm
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
