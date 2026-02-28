import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, Check, Clock } from 'lucide-react';

interface DateTimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  initialDate?: Date;
}

export const DateTimePicker = ({ isOpen, onClose, onSelect, initialDate }: DateTimePickerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
  const [viewDate, setViewDate] = useState<Date>(initialDate || new Date());
  const [view, setView] = useState<'date' | 'time'>('date');
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      const date = initialDate || new Date();
      setSelectedDate(date);
      setViewDate(date);
      setView('date');
      setShowCloseConfirm(false);
    }
  }, [isOpen, initialDate]);

  const handleCloseRequest = () => {
    // If user hasn't confirmed (which happens via onSelect), show confirmation
    setShowCloseConfirm(true);
  };

  const confirmClose = () => {
    setShowCloseConfirm(false);
    onClose();
  };

  const cancelClose = () => {
    setShowCloseConfirm(false);
  };

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const startDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(viewDate.getFullYear());
    newDate.setMonth(viewDate.getMonth());
    newDate.setDate(day);
    setSelectedDate(newDate);
    setView('time');
  };

  const handleTimeChange = (type: 'hour' | 'minute', value: number) => {
    const newDate = new Date(selectedDate);
    if (type === 'hour') {
      newDate.setHours(value);
    } else {
      newDate.setMinutes(value);
    }
    setSelectedDate(newDate);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(viewDate);
    const startDay = startDayOfMonth(viewDate);
    const days = [];

    // Empty cells for days before start of month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    // Days of month
    for (let i = 1; i <= totalDays; i++) {
      const isSelected = 
        selectedDate.getDate() === i && 
        selectedDate.getMonth() === viewDate.getMonth() && 
        selectedDate.getFullYear() === viewDate.getFullYear();
      
      const isToday = 
        new Date().getDate() === i && 
        new Date().getMonth() === viewDate.getMonth() && 
        new Date().getFullYear() === viewDate.getFullYear();

      days.push(
        <button
          key={i}
          onClick={() => handleDayClick(i)}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition ${
            isSelected 
              ? 'bg-[#FACC15] text-black font-bold' 
              : isToday 
                ? 'bg-white/10 text-white font-semibold' 
                : 'text-gray-300 hover:bg-white/5'
          }`}
        >
          {i}
        </button>
      );
    }

    return days;
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
            onClick={handleCloseRequest}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[20%] md:top-[25%] md:w-[360px] md:mx-auto bg-[#1C1C1E] border border-white/10 rounded-3xl p-6 z-50 shadow-2xl"
          >
            {showCloseConfirm ? (
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold text-white mb-2">No time selected</h3>
                <p className="text-gray-400 text-sm mb-6">You haven't confirmed a time. Do you want to close without saving?</p>
                <div className="flex justify-center gap-3">
                  <button 
                    onClick={cancelClose}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition"
                  >
                    Select Time
                  </button>
                  <button 
                    onClick={confirmClose}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-white">Select Date & Time</h2>
                  <button onClick={handleCloseRequest} className="p-2 rounded-full hover:bg-white/10 transition">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {view === 'date' ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                      <button onClick={handlePrevMonth} className="p-1 hover:bg-white/10 rounded-full transition">
                        <ChevronLeft className="w-5 h-5 text-gray-400" />
                      </button>
                      <span className="font-medium text-white">
                        {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                      <button onClick={handleNextMonth} className="p-1 hover:bg-white/10 rounded-full transition">
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-xs font-medium text-gray-500 w-8 h-8 flex items-center justify-center">
                          {day}
                        </div>
                      ))}
                      {renderCalendar()}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 space-y-6">
                    <div className="text-4xl font-bold text-white flex items-center gap-2">
                      <Clock className="w-8 h-8 text-[#FACC15]" />
                      {formatTime(selectedDate)}
                    </div>
                    
                    <div className="flex gap-4 w-full justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <label className="text-xs text-gray-400 uppercase">Hour</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="23" 
                          value={selectedDate.getHours()} 
                          onChange={(e) => handleTimeChange('hour', parseInt(e.target.value))}
                          className="w-full accent-[#FACC15]"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <label className="text-xs text-gray-400 uppercase">Minute</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="59" 
                          step="5"
                          value={selectedDate.getMinutes()} 
                          onChange={(e) => handleTimeChange('minute', parseInt(e.target.value))}
                          className="w-full accent-[#FACC15]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-white/10 flex justify-end gap-3">
                  <button 
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  {view === 'time' && (
                    <button 
                      onClick={() => {
                        onSelect(selectedDate);
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl text-sm font-bold bg-[#FACC15] text-black hover:bg-yellow-400 transition flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Confirm
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
