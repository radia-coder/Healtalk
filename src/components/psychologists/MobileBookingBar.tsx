"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Psychologist } from "@/lib/types";
import ConnectCard from "./ConnectCard";
import { Phone } from "lucide-react";

interface MobileBookingBarProps {
  therapist: Psychologist;
}

export default function MobileBookingBar({ therapist }: MobileBookingBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 lg:hidden z-50 safe-area-bottom">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="w-full h-14 text-lg font-bold bg-[#FC7D45] hover:bg-[#e06935] text-white shadow-lg shadow-orange-100 rounded-xl transition-all">
            <Phone size={20} className="mr-2 fill-current" />
            Book Appointment
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-[2rem] p-0 border-t-0 max-h-[90vh] overflow-y-auto">
            <div className="sr-only">
                <SheetTitle>Book Appointment</SheetTitle>
                <SheetDescription>Connect with {therapist.name}</SheetDescription>
            </div>
          <div className="p-6 pt-8 pb-10 bg-slate-50 min-h-[50vh]">
             {/* We can reuse the ConnectCard here. 
                The ConnectCard has a sticky header which we might want to disable or ignore.
                Since we are in a sheet, sticky might not matter or might settle at the top.
             */}
             <div className="[&>div]:static [&>div]:p-0 [&>div]:shadow-none [&>div]:bg-transparent [&>div]:border-none">
                <ConnectCard therapist={therapist} />
             </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
