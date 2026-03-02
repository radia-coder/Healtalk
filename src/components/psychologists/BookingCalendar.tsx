"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingCalendarProps {
  onSelectSlot: (date: Date, time: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
  availability?: string[]; // e.g. ["10:00", "11:00"]
}

export default function BookingCalendar({ 
    onSelectSlot, 
    selectedDate: propDate, 
    selectedTime: propTime 
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(propDate);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(propTime);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const buildSlotDateTime = (date: Date, label: string) => {
    const [timePart, meridiem] = label.split(" ");
    const [rawHours, rawMinutes] = timePart.split(":").map(Number);
    let hours = rawHours;
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      rawMinutes,
      0,
      0
    );
  };

  const isPastDay = (date: Date) => date.getTime() < today.getTime();

  // Mock generator for slots based on date
  const getSlotsForDate = (date: Date) => {
    // Randomized mock logic for demo
    const day = date.getDay();
    const baseSlots =
      day === 0 || day === 6
        ? ["10:00 AM", "11:00 AM"] // Weekends fewer slots
        : ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "04:45 PM"];

    if (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    ) {
      return baseSlots.filter((slot) => buildSlotDateTime(date, slot) > now);
    }

    return baseSlots;
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (isPastDay(newDate)) return;
    setSelectedDate(newDate);
    setSelectedTime(undefined); // Reset time when date changes
    // Notify parent if needed, but usually we wait for time select
  };

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
        onSelectSlot(selectedDate, time);
    }
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    if (currentMonthStart <= thisMonthStart) return;
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const canGoPrevMonth = currentMonthStart > thisMonthStart;

  return (
    <div className="flex flex-col md:flex-row h-full gap-6">
       {/* Left: Calendar Grid */}
       <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-lg">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <div className="flex gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevMonth}
                    className="h-8 w-8 rounded-full hover:bg-slate-100"
                    disabled={!canGoPrevMonth}
                >
                    <ChevronLeft size={18} />
                </Button>
                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-full hover:bg-slate-100">
                    <ChevronRight size={18} />
                </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-400 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const isToday = now.toDateString() === date.toDateString();
                const isDisabled = isPastDay(date);

                return (
                    <button
                        key={day}
                        onClick={() => handleDateClick(day)}
                        disabled={isDisabled}
                        className={`
                            h-9 w-9 rounded-full flex items-center justify-center text-sm transition-all
                            ${isSelected ? "bg-[#FC7D45] text-white font-bold shadow-md shadow-orange-100" : "hover:bg-slate-50 text-slate-700"}
                            ${isToday && !isSelected ? "border border-[#FC7D45] text-[#FC7D45] font-semibold" : ""}
                            ${isDisabled ? "opacity-35 cursor-not-allowed hover:bg-transparent" : ""}
                        `}
                    >
                        {day}
                    </button>
                );
            })}
          </div>
       </div>

       {/* Divider */}
       <div className="hidden md:block w-px bg-slate-100" />

       {/* Right: Time Slots */}
       <div className="w-full md:w-64 flex flex-col">
            <h3 className="font-bold text-slate-900 text-lg mb-4">
                {selectedDate ? selectedDate.toLocaleDateString('en-US', {weekday: 'long', month: 'short', day: 'numeric'}) : "Select a Date"}
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[300px] scrollbar-thin scrollbar-thumb-slate-200">
                {selectedDate ? (
                    getSlotsForDate(selectedDate).length > 0 ? getSlotsForDate(selectedDate).map((time) => {
                        const isSelected = selectedTime === time;
                        return (
                            <button
                                key={time}
                                onClick={() => handleTimeClick(time)}
                                className={`
                                    w-full py-3 px-4 rounded-xl border flex items-center justify-between text-sm transition-all
                                    ${isSelected 
                                        ? "border-[#FC7D45] bg-orange-50 text-[#FC7D45] font-bold shadow-sm" 
                                        : "border-slate-100 bg-white text-slate-600 hover:border-[#FC7D45]/30 hover:bg-orange-50/30"
                                    }
                                `}
                            >
                                <span className="flex items-center gap-2">
                                    <Clock size={16} className={isSelected ? "text-[#FC7D45]" : "text-slate-300"} />
                                    {time}
                                </span>
                                {isSelected && <Check size={16} />}
                            </button>
                        )
                    }) : (
                      <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm text-center">
                        No available time slots for this day.
                      </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm text-center">
                        <CalendarIcon size={32} className="mb-2 opacity-20" />
                        Please select a date to see available time slots
                    </div>
                )}
            </div>
       </div>
    </div>
  );
}

function CalendarIcon({ size, className }: { size?: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}
