"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { conditionsList, languagesList } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FilterSectionProps {
  title: string;
  items: string[];
}

function FilterSection({ title, items }: FilterSectionProps) {
  return (
    <AccordionItem value={title.toLowerCase()} className="border-b border-border">
      <AccordionTrigger className="hover:no-underline py-4 text-base font-medium text-slate-800">
        {title}
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3 pb-4">
          {items.slice(0, 5).map((item) => (
            <div key={item} className="flex items-center space-x-3">
              <Checkbox id={`${title}-${item}`} className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              <Label htmlFor={`${title}-${item}`} className="text-sm font-normal text-slate-600 leading-none cursor-pointer">
                {item}
              </Label>
            </div>
          ))}
          {items.length > 5 && (
            <button className="text-sm text-primary hover:underline font-medium pt-2">
              More {title}
            </button>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function FiltersDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-9 px-3 rounded-md border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm flex items-center gap-2">
           Filters
           <SlidersHorizontal size={14} />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[440px] overflow-y-auto p-0 gap-0">
        <SheetHeader className="px-6 py-5 border-b border-border flex flex-row items-center justify-between sticky top-0 bg-background z-10">
          <SheetTitle className="text-xl font-bold text-slate-900">Filters</SheetTitle>
           {/* Close button is automatically added by SheetContent but we can customize or rely on default X */}
        </SheetHeader>

        <div className="px-6 py-2 pb-24">
          <Accordion type="multiple" defaultValue={["conditions", "price range", "insurance", "language", "ethnicity"]} className="w-full">
            
            {/* Insurance - Custom content for example */}
            <AccordionItem value="insurance" className="border-b border-border">
                 <AccordionTrigger className="hover:no-underline py-4 text-base font-semibold text-slate-900">
                    Insurance
                 </AccordionTrigger>
                 <AccordionContent>
                    <div className="space-y-3 pb-4">
                        {["Aetna", "Blue Cross", "Cigna", "UnitedHealthcare", "Medicare"].map((ins) => (
                             <div key={ins} className="flex items-center space-x-3">
                                <Checkbox id={`insurance-${ins}`} className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                <Label htmlFor={`insurance-${ins}`} className="text-sm font-normal text-slate-600 leading-none cursor-pointer">{ins}</Label>
                            </div>
                        ))}
                    </div>
                 </AccordionContent>
            </AccordionItem>

            {/* Language */}
            <FilterSection title="Language" items={languagesList} />

            {/* Conditions */}
            <FilterSection title="Conditions" items={conditionsList} />

            {/* Price Range */}
             <AccordionItem value="price range" className="border-b border-border">
                 <AccordionTrigger className="hover:no-underline py-4 text-base font-semibold text-slate-900">
                    Price Range
                 </AccordionTrigger>
                 <AccordionContent>
                    <div className="space-y-3 pb-4">
                        {["$ (Less than $50)", "$$ ($50-$60)", "$$$ (More than $60)"].map((price) => (
                             <div key={price} className="flex items-center space-x-3">
                                <Checkbox id={`price-${price}`} className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                <Label htmlFor={`price-${price}`} className="text-sm font-normal text-slate-600 leading-none cursor-pointer">{price}</Label>
                            </div>
                        ))}
                    </div>
                 </AccordionContent>
            </AccordionItem>

            {/* Ethnicity */}
             <AccordionItem value="ethnicity" className="border-b border-border">
                 <AccordionTrigger className="hover:no-underline py-4 text-base font-semibold text-slate-900">
                    Ethnicity
                 </AccordionTrigger>
                 <AccordionContent>
                    <div className="space-y-3 pb-4">
                        {["White", "Black/African American", "Hispanic", "Asian", "Native American"].map((eth) => (
                             <div key={eth} className="flex items-center space-x-3">
                                <Checkbox id={`ethnicity-${eth}`} className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                <Label htmlFor={`ethnicity-${eth}`} className="text-sm font-normal text-slate-600 leading-none cursor-pointer">{eth}</Label>
                            </div>
                        ))}
                         <button className="text-sm text-primary hover:underline font-medium pt-2">
                            More Ethnicities
                        </button>
                    </div>
                 </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>
        
        <SheetFooter className="absolute bottom-0 left-0 right-0 bg-white p-6 border-t border-border flex flex-row gap-4 justify-between items-center z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.1)]">
             <Button variant="default" className="flex-1 bg-slate-800 hover:bg-slate-900 text-white h-11 rounded-lg">
                Filter
             </Button>
             <SheetClose asChild>
                <Button variant="outline" className="flex-1 border-slate-300 text-slate-700 h-11 rounded-lg hover:bg-slate-50">
                    Cancel
                </Button>
            </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
