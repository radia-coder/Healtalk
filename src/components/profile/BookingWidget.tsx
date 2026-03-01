"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CreditCard, Lock } from "lucide-react";

interface BookingWidgetProps {
  price: number;
  psychologistId: string;
  psychologistName: string;
}

export default function BookingWidget({ price, psychologistId, psychologistName }: BookingWidgetProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [sessionDuration, setSessionDuration] = useState("60");
  const [sessionType, setSessionType] = useState("first");
  const [error, setError] = useState<string | null>(null);

  const availableTimes = [
    "10:00 AM - 11:00 AM",
    "2:00 PM - 3:00 PM",
    "4:30 PM - 5:30 PM"
  ];

  const buildDateTime = (dateValue: string, timeValue: string) => {
    const [timePart, meridiem] = timeValue.split(" ");
    const [rawHours, rawMinutes] = timePart.split(":").map(Number);
    let hours = rawHours;
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    const [year, month, day] = dateValue.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(hours, rawMinutes, 0, 0);
    return date;
  };

  return (
    <div className="bg-card border-2 border-primary rounded-2xl p-6 shadow-lg sticky top-24">
      <h3 className="text-2xl font-bold text-foreground mb-6">
        Book a session
      </h3>

      {/* Calendar (Simplified placeholder) */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-foreground mb-2">
          Select Date:
        </label>
        <div className="border border-border rounded-lg p-4 bg-background">
          <div className="flex items-center gap-3 text-text-secondary">
            <Calendar size={18} />
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full bg-transparent outline-none text-sm text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Available Time Slots */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-foreground mb-3">
          Available Time Slots:
        </label>
        <div className="space-y-2">
          {availableTimes.map((time) => (
            <label
              key={time}
              className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <input
                type="radio"
                name="time"
                value={time}
                checked={selectedTime === time}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-4 h-4 text-primary"
              />
              <Clock size={16} className="text-primary" />
              <span className="text-sm">{time}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Session Duration */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-foreground mb-3">
          Session Duration:
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
            <input
              type="radio"
              name="duration"
              value="60"
              checked={sessionDuration === "60"}
              onChange={(e) => setSessionDuration(e.target.value)}
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm">60 minutes (Standard)</span>
          </label>
          <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
            <input
              type="radio"
              name="duration"
              value="90"
              checked={sessionDuration === "90"}
              onChange={(e) => setSessionDuration(e.target.value)}
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm">90 minutes (Extended)</span>
          </label>
        </div>
      </div>

      {/* Session Type */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-foreground mb-3">
          Session Type:
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
            <input
              type="radio"
              name="type"
              value="first"
              checked={sessionType === "first"}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm">First Consultation</span>
          </label>
          <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
            <input
              type="radio"
              name="type"
              value="followup"
              checked={sessionType === "followup"}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm">Follow-up Session</span>
          </label>
        </div>
      </div>

      {/* Price Divider */}
      <div className="py-4 border-t border-b border-border mb-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">Price:</span>
          <span className="text-2xl font-bold text-primary">₺{price}</span>
        </div>
      </div>

      {/* Confirm Button */}
      <Button
        className="w-full bg-primary hover:bg-primary/90 text-black h-12 text-lg mb-4"
        onClick={() => {
          setError(null);
          if (!selectedDate || !selectedTime) {
            setError("Please select a date and time.");
            return;
          }

          const [startLabel, endLabel] = selectedTime.split(" - ");
          const start = buildDateTime(selectedDate, startLabel);
          const end = endLabel
            ? buildDateTime(selectedDate, endLabel)
            : new Date(start.getTime() + Number(sessionDuration) * 60 * 1000);

          if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            setError("Invalid date or time selection.");
            return;
          }

          router.push(
            `/checkout?psychologistId=${encodeURIComponent(
              psychologistId
            )}&doctor=${encodeURIComponent(
              psychologistName
            )}&start=${encodeURIComponent(
              start.toISOString()
            )}&end=${encodeURIComponent(
              end.toISOString()
            )}&time=${encodeURIComponent(selectedTime)}&price=${encodeURIComponent(`₺${price}`)}`
          );
        }}
      >
        Confirm Booking
      </Button>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {/* Security Badges */}
      <div className="space-y-2 text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-success" />
          <span>Secure payment</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-success" />
          <span>Confidential session</span>
        </div>
      </div>
    </div>
  );
}
