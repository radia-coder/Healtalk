"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { useState, Suspense } from "react";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const psychologistId = searchParams?.get("psychologistId") || "";
  const doctorName = searchParams?.get('doctor') || 'Dr. Sarah Thompson';
  const startParam = searchParams?.get("start");
  const endParam = searchParams?.get("end");
  const timeParam = searchParams?.get("time") || "10:00 AM";
  const price = searchParams?.get('price') || '$150';
  const start = startParam ? new Date(startParam) : null;
  const end = endParam ? new Date(endParam) : null;
  const hasValidDates = Boolean(start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()));
  const durationMinutes = hasValidDates ? Math.max(1, Math.round((end!.getTime() - start!.getTime()) / 60000)) : 60;
  const dateLabel = hasValidDates
    ? start!.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Today";
  const timeLabel = hasValidDates
    ? `${start!.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} - ${end!.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
    : timeParam;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!psychologistId || !hasValidDates) {
      setError("Missing booking details. Please go back and select a time.");
      setIsLoading(false);
      return;
    }

    try {
      const csrfRes = await fetch("/api/security/csrf", { credentials: "include" });
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData?.csrfToken as string | undefined;

      if (!csrfToken) {
        setError("Unable to initialize booking. Please refresh and try again.");
        setIsLoading(false);
        return;
      }

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          psychologistId,
          date: start!.toISOString(),
          startTime: start!.toISOString(),
          endTime: end!.toISOString(),
          duration: durationMinutes,
          type: "VIDEO",
        }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Failed to create appointment.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setSuccessMessage(
        `You booked appointment on ${dateLabel} at ${timeLabel}. Redirecting...`
      );
      setIsLoading(false);
      const redirectParams = new URLSearchParams({
        booked: "1",
        bookedDate: dateLabel,
        bookedTime: timeLabel,
      });
      setTimeout(() => {
        router.push(`/find-psychologists?${redirectParams.toString()}`);
      }, 1800);
    } catch {
      setError("Payment failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-8 font-heading">Secure Checkout</h1>
            
            <div className="grid lg:grid-cols-12 gap-12">
                {/* Left Column: Payment Form */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Payment Method */}
                    <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <CreditCard className="text-[#FC7D45]" />
                            Payment Details
                        </h2>
                        
                        <form onSubmit={handlePayment} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="cardName">Name on Card</Label>
                                <Input id="cardName" placeholder="e.g. John Doe" required className="h-12 bg-slate-50 border-slate-200" />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="cardNumber">Card Number</Label>
                                <div className="relative">
                                    <Input id="cardNumber" placeholder="0000 0000 0000 0000" required className="h-12 bg-slate-50 border-slate-200 pl-12" />
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="expiry">Expiry Date</Label>
                                    <Input id="expiry" placeholder="MM/YY" required className="h-12 bg-slate-50 border-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cvc">CVC</Label>
                                    <div className="relative">
                                        <Input id="cvc" placeholder="123" required className="h-12 bg-slate-50 border-slate-200" />
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    </div>
                                </div>
                            </div>
                            
                            <Button disabled={isLoading} type="submit" className="w-full h-14 text-lg font-bold bg-[#FC7D45] hover:bg-[#e06935] text-white shadow-lg shadow-orange-100 rounded-xl mt-4">
                                {isLoading ? "Processing..." : `Pay ${price}`}
                            </Button>

                            {error && (
                              <p className="text-sm text-red-500 mt-3">{error}</p>
                            )}
                            {success && !error && successMessage && (
                              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                                <p className="text-sm text-emerald-700">{successMessage}</p>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mt-4">
                                <ShieldCheck size={16} className="text-teal-600" />
                                <span className="font-medium">Payments are secure and encrypted</span>
                            </div>
                        </form>
                    </section>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-5">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-24">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
                        
                        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-100">
                             <div className="w-16 h-16 rounded-xl bg-slate-100 relative overflow-hidden flex-shrink-0">
                                {/* Placeholder for doctor image if not passed, or use generic */}
                                <div className="absolute inset-0 bg-slate-200 animate-pulse" /> 
                             </div>
                             <div>
                                 <h3 className="font-bold text-slate-900 text-lg">{doctorName}</h3>
                                 <p className="text-slate-500 text-sm">Psychology Consultation</p>
                             </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-slate-600">
                                <span>Date</span>
                                <span className="font-medium text-slate-900">{dateLabel}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Time</span>
                                <span className="font-medium text-slate-900">{timeLabel}</span>
                            </div>
                             <div className="flex justify-between text-slate-600">
                                <span>Duration</span>
                                <span className="font-medium text-slate-900">{durationMinutes} mins</span>
                            </div>
                        </div>

                        <Separator className="mb-4" />

                        <div className="flex justify-between items-center mb-8">
                            <span className="text-lg font-bold text-slate-900">Total</span>
                            <span className="text-2xl font-bold text-[#FC7D45]">{price}</span>
                        </div>
                        
                        <div className="bg-teal-50 p-4 rounded-xl text-teal-800 text-sm flex gap-3">
                            <CheckCircle size={20} className="flex-shrink-0" />
                            <p>Free cancellation up to 24 hours before the appointment time.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
