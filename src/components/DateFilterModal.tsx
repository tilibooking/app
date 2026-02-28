import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, Check, Calendar } from 'lucide-react';

export type DateRange = {
  start: Date;
  end: Date;
  type: 'day' | 'week' | 'month';
};

interface DateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (range: DateRange) => void;
  initialRange?: DateRange;
}

export const DateFilterModal = ({ isOpen, onClose, onSelect, initialRange }: DateFilterModalProps) => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      if (initialRange) {
        setView(initialRange.type);
        setSelectedDate(initialRange.start);
        setViewDate(initialRange.start);
      } else {
        setView('week');
        setSelectedDate(now);
        setViewDate(now);
      }
    }
  }, [isOpen, initialRange]);

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

  const getWeekRange = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // Sunday
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Saturday
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  };

  const isDateInSelectedRange = (date: Date) => {
    if (view === 'day') {
      return date.getDate() === selectedDate.getDate() &&
             date.getMonth() === selectedDate.getMonth() &&
             date.getFullYear() === selectedDate.getFullYear();
    }
    
    if (view === 'week') {
      const { start, end } = getWeekRange(selectedDate);
      return date >= start && date <= end;
    }
    
    // Month view logic is handled differently (selecting month directly)
    return false;
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(viewDate);
    newDate.setDate(day);
    setSelectedDate(newDate);
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(monthIndex);
    setSelectedDate(newDate);
  };

  const handleConfirm = () => {
    let range: DateRange;
    
    if (view === 'day') {
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
      range = { start, end, type: 'day' };
    } else if (view === 'week') {
      const { start, end } = getWeekRange(selectedDate);
      range = { start, end, type: 'week' };
    } else {
      const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      range = { start, end, type: 'month' };
    }
    
    onSelect(range);
    onClose();
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(viewDate);
    const startDay = startDayOfMonth(viewDate);
    const days = [];

    // Empty cells
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    // Days
    for (let i = 1; i <= totalDays; i++) {
      const currentDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), i);
      const isSelected = isDateInSelectedRange(currentDate);
      const isToday = 
        new Date().getDate() === i && 
        new Date().getMonth() === viewDate.getMonth() && 
        new Date().getFullYear() === viewDate.getFullYear();

      days.push(
        <button
          key={i}
          onClick={() => handleDayClick(i)}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition relative ${
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

  const renderMonthPicker = () => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    return (
      <div className="grid grid-cols-3 gap-3">
        {months.map((month, index) => (
          <button
            key={month}
            onClick={() => handleMonthSelect(index)}
            className={`py-3 rounded-xl text-sm font-medium transition ${
              selectedDate.getMonth() === index && selectedDate.getFullYear() === viewDate.getFullYear()
                ? 'bg-[#FACC15] text-black'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            {month}
          </button>
        ))}
      </div>
    );
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
            className="fixed inset-x-4 top-[calc(20%_-_40px)] md:top-[calc(25%_-_40px)] md:w-[360px] md:mx-auto bg-[#1C1C1E] border border-white/10 rounded-3xl p-6 z-50 shadow-2xl"
          >
            {/* View Tabs */}
            <div className="flex bg-white/5 p-1 rounded-xl mb-6">
              {(['day', 'week', 'month'] as const).map((v) => (
                <button 
                  key={v}
                  onClick={() => setView(v)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition ${
                    view === v ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {view === 'month' ? (
              <div className="space-y-4">
                 <div className="flex justify-between items-center px-2 mb-4">
                  <button onClick={() => setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1))} className="p-1 hover:bg-white/10 rounded-full transition">
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                  </button>
                  <span className="font-medium text-white">
                    {viewDate.getFullYear()}
                  </span>
                  <button onClick={() => setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1))} className="p-1 hover:bg-white/10 rounded-full transition">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                {renderMonthPicker()}
              </div>
            ) : (
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
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-[#FACC15] text-black hover:bg-yellow-400 transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Apply Filter
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
