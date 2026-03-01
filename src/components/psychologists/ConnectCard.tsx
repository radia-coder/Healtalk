"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Psychologist } from "@/lib/types";
import { Info, Mail, Phone, Video, Calendar, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import BookingCalendar from "./BookingCalendar";

interface ConnectCardProps {
  therapist: Psychologist;
}

export default function ConnectCard({ therapist }: ConnectCardProps) {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);

  const buildStartTime = (selectedDate: Date, selectedTime: string) => {
    const [timePart, meridiem] = selectedTime.split(" ");
    const [rawHours, rawMinutes] = timePart.split(":").map(Number);
    let hours = rawHours;
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    const start = new Date(selectedDate);
    start.setHours(hours, rawMinutes, 0, 0);
    return start;
  };

  const handleSlotSelect = (d: Date, t: string) => {
      setDate(d);
      setTime(t);
  };

  return (
    <div className="space-y-4 sticky top-24">
        {/* Main Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-5">Let&apos;s Connect</h3>
        
        <div className="space-y-3 mb-6">
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="w-full h-12 text-lg font-semibold bg-[#FC7D45] hover:bg-[#e06935] text-white shadow-md shadow-orange-100 transition-all">
                        <Phone size={20} className="mr-2 fill-current" />
                        Book Appointment
                    </Button>
                </DialogTrigger>
                {/* 900px width as requested, centered by default Dialog component */}
                <DialogContent className="max-w-[900px] h-[477px] p-0 gap-0 overflow-hidden flex flex-col md:flex-row">
                    {/* Left Side: Calendar */}
                    <div className="flex-1 p-6 border-r border-slate-100 bg-white overflow-y-auto">
                        <BookingCalendar 
                            onSelectSlot={handleSlotSelect} 
                            selectedDate={date}
                            selectedTime={time}
                        />
                    </div>

                    {/* Right Side: Summary & Confirm */}
                    <div className="w-full md:w-[300px] bg-slate-50/50 p-6 flex flex-col h-full">
                        <div className="mb-6">
                            <DialogTitle className="text-xl font-bold text-slate-900 mb-1">Book Session</DialogTitle>
                            <DialogDescription className="text-sm text-slate-500">with {therapist.name}</DialogDescription>
                        </div>
                        
                        <div className="space-y-4 mb-auto">
                            <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Date & Time</span>
                                <div className="text-slate-900 font-medium flex items-center gap-2">
                                    <Calendar size={16} className="text-[#FC7D45]" />
                                    {date && time ? (
                                        <span>
                                            {date.toLocaleDateString()} at {time}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 italic">Select a slot...</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm hidden md:block">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Fee</span>
                                <div className="text-slate-900 font-medium">
                                    {therapist.priceRange?.split(' ')[0] || '$50'} / session
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                disabled={!date || !time}
                                onClick={() => {
                                    if (date && time) {
                                        const price = therapist.priceRange?.split(' ')[0] || '$50';
                                        const start = buildStartTime(date, time);
                                        const end = new Date(start.getTime() + 60 * 60 * 1000);
                                        router.push(`/checkout?psychologistId=${encodeURIComponent(therapist.id)}&doctor=${encodeURIComponent(therapist.name || 'Therapist')}&start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}&time=${encodeURIComponent(time)}&price=${encodeURIComponent(price)}`);
                                    }
                                }}
                                className="w-full h-12 text-base font-bold bg-[#FC7D45] hover:bg-[#e06935] text-white shadow-lg shadow-orange-100 rounded-xl disabled:opacity-50 disabled:shadow-none"
                            >
                                Confirm Booking
                            </Button>
                            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-3">
                                <CheckCircle size={12} />
                                <span>Free cancellation 24h before</span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            
            <Button variant="outline" className="w-full h-12 text-base font-medium border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all">
                <Mail size={18} className="mr-2" />
                Send Email
            </Button>
        </div>

        <div className="space-y-3 pt-2 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
                <Video size={16} className="text-[#FC7D45]" />
                <span className="font-medium">Available Online & In-Person</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
                 <span className="text-[#FC7D45] font-bold text-lg w-5 flex justify-center">$</span>
                 <span className="font-bold text-slate-900">{therapist.priceRange?.split(' ')[0] || '$50'}</span>
                 <span className="text-slate-500">per session</span>
            </div>
        </div>
        </div>

        {/* Free Consultation Pill */}
        <div className="bg-slate-100/80 rounded-xl p-4 flex items-center justify-center gap-2 text-slate-700 font-medium text-sm border border-slate-200/50">
            <span>Free 30 minutes Consultation</span>
            <Info size={16} className="text-slate-400" />
        </div>
    </div>
  );
}
